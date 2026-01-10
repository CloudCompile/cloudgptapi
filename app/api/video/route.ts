import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { extractApiKey, validateApiKey, trackUsage, checkRateLimit, getRateLimitInfo, checkDailyLimit, getDailyLimitInfo, ApiKey, applyPlanOverride, applyPeakHoursLimit } from '@/lib/api-keys';
import { VIDEO_MODELS, PROVIDER_URLS, VideoModel, PREMIUM_MODELS } from '@/lib/providers';
import { getPollinationsApiKey, safeResponseJson } from '@/lib/utils';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes max for video generation

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, { status: 200 });
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const prompt = searchParams.get('prompt');
  
  if (!prompt) {
    return NextResponse.json({
      status: 'active',
      message: 'Video generation API is running. Use POST or GET with ?prompt= to generate videos.',
      endpoints: {
        post: '/api/video',
        description: 'Generate videos using various AI models'
      }
    });
  }

  // Convert GET params to body format for the handler
  const body = {
    prompt,
    model: searchParams.get('model') || 'veo',
    duration: searchParams.get('duration') ? Number(searchParams.get('duration')) : undefined,
    aspectRatio: searchParams.get('aspectRatio') || undefined,
    seed: searchParams.get('seed') ? Number(searchParams.get('seed')) : undefined,
  };

  return handleVideoGeneration(request, body);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    return handleVideoGeneration(request, body);
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Invalid request body', message: error.message },
      { status: 400 }
    );
  }
}

async function handleVideoGeneration(request: NextRequest, body: any) {
  try {
    // Get user from session
    const { userId: sessionUserId } = await auth();
    
    // Extract and validate API key
    const rawApiKey = extractApiKey(request.headers);
    
    // Check rate limit (video generation is expensive, stricter limits)
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

    // If API key has a specific custom limit that's higher, use that
    if (apiKeyInfo && apiKeyInfo.rateLimit > limit) {
      limit = apiKeyInfo.rateLimit;
    }
    
    // Apply peak hours reduction (5 PM - 5 AM UTC): 50% reduction for all users
    limit = applyPeakHoursLimit(limit);
    dailyLimit = applyPeakHoursLimit(dailyLimit);
    
    // Check Daily Limit First
    if (!await checkDailyLimit(effectiveKey, dailyLimit, apiKeyInfo?.id)) {
      const dailyInfo = await getDailyLimitInfo(effectiveKey, dailyLimit, apiKeyInfo?.id);
      return NextResponse.json(
        { 
          error: {
            message: `Daily request limit exceeded (${dailyLimit} RPD). Your limit resets at ${new Date(dailyInfo.resetAt).toUTCString()}. Upgrade for higher limits.`,
            type: 'requests',
            param: null,
            code: 'daily_limit_exceeded'
          }
        },
        { 
          status: 429,
          headers: {
            'X-DailyLimit-Remaining': String(dailyInfo.remaining),
            'X-DailyLimit-Reset': String(dailyInfo.resetAt),
          },
        }
      );
    }
    
    if (!await checkRateLimit(effectiveKey, limit, 'video')) {
      const rateLimitInfo = await getRateLimitInfo(effectiveKey, limit, 'video');
      const dailyLimitInfo = await getDailyLimitInfo(effectiveKey, dailyLimit, apiKeyInfo?.id);
      
      return NextResponse.json(
        { error: 'Rate limit exceeded', resetAt: rateLimitInfo.resetAt },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(rateLimitInfo.resetAt),
            'X-DailyLimit-Remaining': String(dailyLimitInfo.remaining),
            'X-DailyLimit-Reset': String(dailyLimitInfo.resetAt),
          },
        }
      );
    }

    // Lock all video models behind video_pro, enterprise, or admin plans
    const hasVideoAccess = ['video_pro', 'enterprise', 'admin'].includes(userPlan) || (apiKeyInfo?.rateLimit && apiKeyInfo.rateLimit >= 50);

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
        { status: 403 }
      );
    }

    // Validate required fields
    if (!body.prompt) {
      return NextResponse.json(
        { error: 'prompt is required' },
        { status: 400 }
      );
    }

    // Get model or use default
    const modelId = body.model || 'veo';
    const model = VIDEO_MODELS.find(m => m.id === modelId);
    
    if (!model) {
      const popularModels = VIDEO_MODELS.slice(0, 10).map(m => m.id).join(', ');
      return NextResponse.json(
        { error: `Unknown model: ${modelId}. Popular models: ${popularModels}. Use /v1/models to see all ${VIDEO_MODELS.length} models.` },
        { status: 400 }
      );
    }

    // Check if model is premium and if user has access
    const isPremium = PREMIUM_MODELS.has(modelId);
    // Pro access if they have a pro/enterprise/developer/admin plan
    const hasProAccess = ['pro', 'enterprise', 'developer', 'admin'].includes(userPlan);

    if (isPremium && !hasProAccess) {
      return NextResponse.json(
        {
          error: {
            message: `The model '${modelId}' is only available on Pro and Enterprise plans. Please upgrade at ${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
            type: 'access_denied',
            param: 'model',
            code: 'premium_model_required'
          }
        },
        { status: 403 }
      );
    }

    // Validate duration
    const duration = body.duration || 4;
    if (model.maxDuration && duration > model.maxDuration) {
      return NextResponse.json(
        { error: `Duration exceeds maximum of ${model.maxDuration} seconds for ${modelId}` },
        { status: 400 }
      );
    }

    // Build Pollinations URL with query params
    const params = new URLSearchParams();
    params.set('model', modelId);
    // duration is supported by some video models
    if (body.duration) params.set('duration', String(body.duration));
    if (body.aspectRatio) params.set('aspectRatio', body.aspectRatio);
    if (body.seed) params.set('seed', String(body.seed));
    
    const encodedPrompt = encodeURIComponent(body.prompt);
    // Use the /image/ endpoint for video models as recommended
    const pollinationsUrl = `${PROVIDER_URLS.pollinations}/image/${encodedPrompt}?${params.toString()}`;
    
    const userId = request.headers.get('x-user-id') || apiKeyInfo?.userId || sessionUserId || `anonymous-${clientIp}`;
    const headers: Record<string, string> = {
      'X-App-Source': apiKeyInfo ? 'CloudGPT-API' : 'CloudGPT-Website',
      'x-user-id': userId,
    };
    const pollinationsApiKey = getPollinationsApiKey();
    if (pollinationsApiKey) {
      headers['Authorization'] = `Bearer ${pollinationsApiKey}`;
    }
    
    const pollinationsResponse = await fetch(pollinationsUrl, { headers });

    if (!pollinationsResponse.ok) {
      const errorText = await pollinationsResponse.text();
      return NextResponse.json(
        { error: 'Upstream API error', details: errorText },
        { status: pollinationsResponse.status }
      );
    }

    // Track usage in background if authenticated
    if (apiKeyInfo) {
      await trackUsage(apiKeyInfo.id, apiKeyInfo.userId, modelId, 'video', body.prompt);
    }

    // Check if response is JSON (error) or binary (video)
    const contentType = pollinationsResponse.headers.get('content-type');
    const rateLimitInfo = await getRateLimitInfo(effectiveKey, limit, 'video');
    const dailyLimitInfo = await getDailyLimitInfo(effectiveKey, dailyLimit, apiKeyInfo?.id);
    
    if (contentType?.includes('application/json')) {
      const data = await safeResponseJson(pollinationsResponse, null);
      
      if (!data) {
        return NextResponse.json(
          { error: 'Empty or malformed JSON from upstream API' },
          { status: 502 }
        );
      }
      
      return NextResponse.json(data, {
        headers: {
          'X-RateLimit-Remaining': String(rateLimitInfo.remaining),
          'X-RateLimit-Reset': String(rateLimitInfo.resetAt),
          'X-DailyLimit-Remaining': String(dailyLimitInfo.remaining),
          'X-DailyLimit-Reset': String(dailyLimitInfo.resetAt),
        },
      });
    }

    // Forward the binary response (video)
    return new NextResponse(pollinationsResponse.body, {
      headers: {
        'Content-Type': contentType || 'video/mp4',
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-RateLimit-Remaining': String(rateLimitInfo.remaining),
        'X-RateLimit-Reset': String(rateLimitInfo.resetAt),
        'X-DailyLimit-Remaining': String(dailyLimitInfo.remaining),
        'X-DailyLimit-Reset': String(dailyLimitInfo.resetAt),
      },
    });
    
  } catch (error: any) {
    console.error('Video API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
