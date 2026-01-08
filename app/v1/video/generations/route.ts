import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { extractApiKey, validateApiKey, trackUsage, checkRateLimit, getRateLimitInfo, ApiKey } from '@/lib/api-keys';
import { VIDEO_MODELS, PROVIDER_URLS, PREMIUM_MODELS } from '@/lib/providers';
import { getCorsHeaders } from '@/lib/utils';

export const runtime = 'edge';

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
    if (rawApiKey) {
      apiKeyInfo = await validateApiKey(rawApiKey);
    }

    // Determine plan and limits
    const userPlan = apiKeyInfo?.plan || 'free';
    
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

    // Check daily limit first
    const { checkDailyLimit, getDailyLimitInfo } = await import('@/lib/api-keys');
    if (rawApiKey && !checkDailyLimit(rawApiKey, dailyLimit)) {
      const dailyInfo = getDailyLimitInfo(rawApiKey, dailyLimit);
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
    
    if (!checkRateLimit(effectiveKey, limit, 'video')) {
      const rateLimitInfo = getRateLimitInfo(effectiveKey, limit, 'video');
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
      return NextResponse.json(
        { 
          error: {
            message: `Unknown model: ${modelId}. Available models: ${VIDEO_MODELS.map(m => m.id).join(', ')}`,
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
    // Pro access if they have a pro/enterprise/developer/admin plan OR if their rate limit is high (fallback)
    const hasProAccess = ['pro', 'enterprise', 'developer', 'admin'].includes(userPlan) || (apiKeyInfo?.rateLimit && apiKeyInfo.rateLimit >= 50);

    // Specific video access for Video Pro, Enterprise, or Admin plans
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
    const params = new URLSearchParams();
    params.set('model', modelId);
    if (body.duration) params.set('duration', String(body.duration));
    if (body.aspectRatio) params.set('aspectRatio', body.aspectRatio);
    if (body.image) params.set('image', body.image);
    if (body.audio) params.set('audio', 'true');
    
    const encodedPrompt = encodeURIComponent(body.prompt);
    const videoUrl = `${PROVIDER_URLS.pollinations}/image/${encodedPrompt}?${params.toString()}`;
    
    // Track usage
    if (apiKeyInfo) {
      await trackUsage(apiKeyInfo.id, apiKeyInfo.userId, modelId, 'video');
    }

    const rateLimitInfo = getRateLimitInfo(effectiveKey, limit, 'video');

    return NextResponse.json({
      created: Math.floor(Date.now() / 1000),
      data: [
        {
          url: videoUrl
        }
      ]
    }, {
      headers: {
        ...getCorsHeaders(),
        'X-RateLimit-Remaining': String(rateLimitInfo.remaining),
        'X-RateLimit-Reset': String(rateLimitInfo.resetAt),
        'X-RateLimit-Limit': String(rateLimitInfo.limit),
      },
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
