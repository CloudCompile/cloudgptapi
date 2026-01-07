import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { extractApiKey, validateApiKey, trackUsage, checkRateLimit, getRateLimitInfo, ApiKey } from '@/lib/api-keys';
import { VIDEO_MODELS, PROVIDER_URLS } from '@/lib/providers';
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

    const limit = apiKeyInfo ? apiKeyInfo.rateLimit : 2;
    
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
