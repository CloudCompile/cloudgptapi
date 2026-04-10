import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserId } from '@/lib/kinde-auth';
import { extractApiKey, validateApiKey, trackUsage, checkRateLimit, getRateLimitInfo, checkDailyLimit, getDailyLimitInfo, ApiKey, applyPlanOverride, applyPeakHoursLimit, getDailyLimitForPlan } from '@/lib/api-keys';
import { VIDEO_MODELS, PROVIDER_URLS, PREMIUM_MODELS } from '@/lib/providers';
import { waitUntil } from '@vercel/functions';
import { getCorsHeaders, hasProAccess, hasVideoAccess } from '@/lib/utils';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = 'edge';
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
    let sessionUserId = null;
    try {
      const userId = await getCurrentUserId();
      if (userId) {
        sessionUserId = userId;
      }
    } catch (authError) {
      // Ignore auth error for API keys
    }

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
    let dailyLimit = getDailyLimitForPlan(userPlan);
    
    if (userPlan === 'admin' || userPlan === 'enterprise') {
      limit = 20;
    } else if (userPlan === 'ultra') {
      limit = 2;
    } else if (userPlan === 'developer') {
      limit = 5;
    } else if (userPlan === 'free') {
      limit = 2;
    }

    limit = applyPeakHoursLimit(limit);
    
    // VPS Bypass: Don't count requests from our own VPS against RPD
    const isSystemRequest = clientIp === '157.151.169.121';

    // Check daily limit first
    if (!isSystemRequest && !await checkDailyLimit(effectiveKey, dailyLimit, apiKeyInfo?.id)) {
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
    
    if (!isSystemRequest && !await checkRateLimit(effectiveKey, limit, 'video')) {
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
    const hasPro = hasProAccess(userPlan);

    // Specific video access for Video Pro, Enterprise, or Admin plans
    const canAccessVideo = hasVideoAccess(userPlan);

    if (!canAccessVideo) {
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

    if (isPremium && !hasPro) {
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
      const appUrl = process.env.NEXT_PUBLIC_APP_URL;
      if (!appUrl) {
        return NextResponse.json(
          { error: { message: 'NEXT_PUBLIC_APP_URL is not configured', type: 'config_error', code: 'missing_config' } },
          { status: 500, headers: getCorsHeaders() }
        );
      }
      videoUrl = `${appUrl}/api/video?${params.toString()}`;
    }
    
    if (!videoUrl) {
      return NextResponse.json(
        { error: { message: 'Failed to generate video URL', type: 'api_error' } },
        { status: 500, headers: getCorsHeaders() }
      );
    }
    
    // Track usage in background if authenticated
    if (apiKeyInfo && !isSystemRequest) {
      const usageWeight = model.usageWeight || 1;
      waitUntil(trackUsage(apiKeyInfo.id, apiKeyInfo.userId, modelId, 'video', undefined, usageWeight));
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
