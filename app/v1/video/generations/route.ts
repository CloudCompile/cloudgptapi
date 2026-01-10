import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { extractApiKey, validateApiKey, trackUsage, checkRateLimit, getRateLimitInfo, checkDailyLimit, getDailyLimitInfo, ApiKey, applyPlanOverride, applyPeakHoursLimit } from '@/lib/api-keys';
import { VIDEO_MODELS, PROVIDER_URLS, PREMIUM_MODELS } from '@/lib/providers';
import { getCorsHeaders } from '@/lib/utils';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes max for video generation

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, { 
    status: 204, 
    headers: getCorsHeaders() 
  });
}

export async function GET() {
  return NextResponse.json({
    message: 'Video generation endpoint is active. Use POST to generate videos.',
    example: {
      model: 'veo',
      prompt: 'A cat playing with a ball'
    }
  }, {
    headers: getCorsHeaders()
  });
}

export async function POST(request: NextRequest) {
  try {
    // Get user from session
    const { userId: sessionUserId } = await auth();

    // Extract and validate API key
    const rawApiKey = extractApiKey(request.headers);
    
    // Check rate limit (video generation is expensive)
    const clientIp = (request as any).ip || 
                     request.headers.get('x-forwarded-for')?.split(',')[0] || 
                     request.headers.get('x-real-ip') || 
                     'anonymous';
    const effectiveKey = rawApiKey || clientIp;
    
    let apiKeyInfo: ApiKey | null = null;
    let userPlan = 'free';

    if (rawApiKey) {
      apiKeyInfo = await validateApiKey(rawApiKey);
      if (apiKeyInfo?.plan) {
        userPlan = apiKeyInfo.plan;
      }
    } else if (sessionUserId) {
      // Fetch plan for session users if no API key is provided
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('plan, email')
        .eq('id', sessionUserId)
        .maybeSingle();
      
      if (profile) {
        userPlan = profile.plan || 'free';
        // Manual override for specific users requested by admin
        userPlan = await applyPlanOverride(profile.email, userPlan, sessionUserId, 'id');
      }
    }

    // Ensure plan is lowercase for consistency
    userPlan = userPlan?.toLowerCase() || 'free';

    // Determine limit based on plan
    let limit = 2; // Default anonymous/free limit (2 RPM for video)
    let dailyLimit = 1000; // Default 1000 RPD
    
    if (userPlan === 'admin' || userPlan === 'enterprise') {
      limit = 20;
      dailyLimit = 100000;
    } else if (userPlan === 'pro' || userPlan === 'video_pro') {
      limit = 2; // 2 RPM for video as requested
      dailyLimit = 2000; // 2000 RPD for pro/video_pro
    } else if (userPlan === 'developer') {
      limit = 5;
      dailyLimit = 5000;
    } else if (userPlan === 'free') {
      limit = 2; // 2 RPM for video
      dailyLimit = 1000; // 1000 RPD for free
    }

    // Apply peak hours reduction (5 PM - 5 AM UTC): 50% reduction for all users
    limit = applyPeakHoursLimit(limit);
    dailyLimit = applyPeakHoursLimit(dailyLimit);

    // Check daily limit first
    if (!await checkDailyLimit(effectiveKey, dailyLimit, apiKeyInfo?.id)) {
      const dailyInfo = await getDailyLimitInfo(effectiveKey, dailyLimit, apiKeyInfo?.id);
      return NextResponse.json(
        { 
          error: {
            message: `Daily request limit of ${dailyLimit} exceeded. Reset at ${new Date(dailyInfo.resetAt).toUTCString()}`,
            type: 'requests',
            param: null,
            code: 'daily_limit_exceeded'
          }
        },
        { 
          status: 429,
          headers: {
            ...getCorsHeaders(),
            'X-DailyLimit-Remaining': '0',
            'X-DailyLimit-Reset': String(dailyInfo.resetAt),
          },
        }
      );
    }
    
    if (!await checkRateLimit(effectiveKey, limit, 'video')) {
      const rateLimitInfo = await getRateLimitInfo(effectiveKey, limit, 'video');
      return NextResponse.json(
        { 
          error: {
            message: 'Rate limit exceeded',
            type: 'requests',
            param: null,
            code: 'rate_limit_exceeded'
          }
        },
        { 
          status: 429,
          headers: {
            ...getCorsHeaders(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(rateLimitInfo.resetAt),
          },
        }
      );
    }

    const body = await request.json();
    
    // Validate required fields
    if (!body.prompt) {
      return NextResponse.json(
        { 
          error: {
            message: 'prompt is required',
            type: 'invalid_request_error',
            param: 'prompt',
            code: null
          }
        },
        { 
          status: 400,
          headers: getCorsHeaders()
        }
      );
    }

    // Get model or use default
    const modelId = body.model || 'veo';
    const model = VIDEO_MODELS.find(m => m.id === modelId);
    
    if (!model) {
      const popularModels = VIDEO_MODELS.slice(0, 10).map(m => m.id).join(', ');
      return NextResponse.json(
        { 
          error: {
            message: `Unknown model: ${modelId}. Popular models: ${popularModels}. Use /v1/models to see all ${VIDEO_MODELS.length} models.`,
            type: 'invalid_request_error',
            param: 'model',
            code: 'model_not_found'
          }
        },
        { 
          status: 400,
          headers: getCorsHeaders()
        }
      );
    }

    // Check if model is premium and if user has access
    const isPremium = PREMIUM_MODELS.has(modelId);
    // Pro access if they have a pro/enterprise/developer/admin plan
    const hasProAccess = ['pro', 'enterprise', 'developer', 'admin'].includes(userPlan);

    // Specific video access for Video Pro, Enterprise, or Admin plans
    const hasVideoAccess = ['video_pro', 'enterprise', 'admin'].includes(userPlan);

    if (!hasVideoAccess) {
      return NextResponse.json(
        { 
          error: {
            message: 'Video generation requires a Video Pro plan. Please upgrade at /pricing to access video models.',
            type: 'access_denied',
            param: 'plan',
            code: 'video_plan_required'
          }
        },
        { 
          status: 403,
          headers: getCorsHeaders()
        }
      );
    }

    if (isPremium && !hasProAccess && userPlan !== 'video_pro') {
      return NextResponse.json(
        {
          error: {
            message: `The model '${modelId}' is only available on Pro and Enterprise plans. Please upgrade at ${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
            type: 'access_denied',
            param: 'model',
            code: 'premium_model_required'
          }
        },
        {
          status: 403,
          headers: getCorsHeaders()
        }
      );
    }

    // Build Pollinations URL
    // Build params for our internal proxy or direct link
    const params = new URLSearchParams();
    params.set('model', modelId);
    if (body.duration) params.set('duration', String(body.duration));
    if (body.aspectRatio) params.set('aspectRatio', body.aspectRatio);
    if (body.seed) params.set('seed', String(body.seed));
    params.set('prompt', body.prompt);
    
    let videoUrl = '';

    if (model.provider === 'github') {
      const providerApiKey = process.env.GITHUB_TOKEN;
      
      if (!providerApiKey) {
        return NextResponse.json(
          {
            error: {
              message: 'GitHub Models token is not configured. Please add GITHUB_TOKEN to your .env.local file.',
              type: 'config_error',
              param: null,
              code: 'missing_api_key'
            }
          },
          { status: 500, headers: getCorsHeaders() }
        );
      }

      try {
        // GitHub Models doesn't have a standard video generation endpoint yet,
        // but we'll follow the OpenAI-compatible pattern for future-proofing.
        const response = await fetch(`${PROVIDER_URLS.github}/video/generations`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${providerApiKey}`,
          },
          body: JSON.stringify({
            model: model.id,
            prompt: body.prompt,
            duration: body.duration || 5,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          return NextResponse.json(
            { 
              error: { 
                message: errorData.error?.message || `GitHub Models API error: ${response.status}`, 
                type: 'api_error' 
              } 
            },
            { status: response.status, headers: getCorsHeaders() }
          );
        }

        const data = await response.json();
        videoUrl = data.data?.[0]?.url;
      } catch (e) {
        return NextResponse.json(
          { error: { message: 'Failed to connect to GitHub Models API', type: 'api_error' } },
          { status: 500, headers: getCorsHeaders() }
        );
      }
    } else {
      // Default to our internal proxy which handles Pollinations
      videoUrl = `${process.env.NEXT_PUBLIC_APP_URL || ''}/api/video?${params.toString()}`;
    }
    
    if (!videoUrl) {
      return NextResponse.json(
        { error: { message: 'Failed to generate video URL', type: 'api_error' } },
        { status: 500, headers: getCorsHeaders() }
      );
    }
    
    // Track usage
    if (apiKeyInfo) {
      const usageWeight = model.usageWeight || 50;
      await trackUsage(apiKeyInfo.id, apiKeyInfo.userId, modelId, 'video', undefined, usageWeight);
    }

    // Final response
    const rateLimitInfo = await getRateLimitInfo(effectiveKey, limit, 'video');
    const dailyLimitInfo = await getDailyLimitInfo(effectiveKey, dailyLimit, apiKeyInfo?.id);
    
    return NextResponse.json({
      created: Math.floor(Date.now() / 1000),
      data: [{ url: videoUrl }]
    }, {
      headers: {
        ...getCorsHeaders(),
        'X-RateLimit-Remaining': String(rateLimitInfo.remaining),
        'X-RateLimit-Reset': String(rateLimitInfo.resetAt),
        'X-DailyLimit-Remaining': String(dailyLimitInfo.remaining),
        'X-DailyLimit-Reset': String(dailyLimitInfo.resetAt),
      }
    });
    
  } catch (error) {
    console.error('Video API error:', error);
    return NextResponse.json(
      { 
        error: {
          message: 'Internal server error',
          type: 'server_error',
          param: null,
          code: 'internal_error'
        }
      },
      { 
        status: 500,
        headers: getCorsHeaders()
      }
    );
  }
}
