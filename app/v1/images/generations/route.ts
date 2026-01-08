import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { extractApiKey, validateApiKey, trackUsage, checkRateLimit, getRateLimitInfo, ApiKey } from '@/lib/api-keys';
import { IMAGE_MODELS, PROVIDER_URLS, ImageModel, PREMIUM_MODELS } from '@/lib/providers';
import { getCorsHeaders } from '@/lib/utils';

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes max for long image generation

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(),
  });
}

export async function GET() {
  return NextResponse.json({
    message: 'Images generation endpoint is active. Use POST to generate images.',
    example: {
      model: 'flux',
      prompt: 'A beautiful landscape'
    }
  }, {
    headers: getCorsHeaders()
  });
}

// Map Stable Horde model IDs to actual model names
function getStableHordeModelName(modelId: string): string {
  const modelMap: Record<string, string> = {
    'stable-horde-flux-schnell': 'Flux.1-Schnell fp8 (Compact)',
    'stable-horde-sdxl': 'SDXL 1.0',
    'stable-horde-deliberate': 'Deliberate',
    'stable-horde-dreamshaper': 'Dreamshaper',
    'stable-horde-realistic-vision': 'Realistic Vision',
    'stable-horde-absolute-reality': 'AbsoluteReality',
    'stable-horde-juggernaut-xl': 'Juggernaut XL',
    'stable-horde-pony-diffusion': 'Pony Diffusion XL',
    'stable-horde-stable-diffusion': 'stable_diffusion',
    'stable-horde-anything-v5': 'Anything v5',
  };
  return modelMap[modelId] || 'stable_diffusion';
}

export async function POST(request: NextRequest) {
  try {
    const { userId: sessionUserId } = await auth();
    const rawApiKey = extractApiKey(request.headers);
    const clientIp = (request as any).ip || 
                     request.headers.get('x-forwarded-for')?.split(',')[0] || 
                     request.headers.get('x-real-ip') || 
                     'anonymous';
    const effectiveKey = rawApiKey || clientIp;
    
    let apiKeyInfo: ApiKey | null = null;
    if (rawApiKey) {
      apiKeyInfo = await validateApiKey(rawApiKey);
    }

    const limit = apiKeyInfo ? apiKeyInfo.rateLimit : 5;
    
    if (!checkRateLimit(effectiveKey, limit, 'image')) {
      const rateLimitInfo = getRateLimitInfo(effectiveKey, limit, 'image');
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
    const modelId = body.model || 'flux';
    const model = IMAGE_MODELS.find(m => m.id === modelId);
    
    if (!model) {
      return NextResponse.json(
        { 
          error: {
            message: `Unknown model: ${modelId}. Available models: ${IMAGE_MODELS.map(m => m.id).join(', ')}`,
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
    const hasProAccess = apiKeyInfo?.rateLimit && apiKeyInfo.rateLimit >= 50; // Pro keys have 50+ RPM

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
        {
          status: 403,
          headers: getCorsHeaders()
        }
      );
    }

    const userId = request.headers.get('x-user-id') || apiKeyInfo?.userId || sessionUserId || `anonymous-${clientIp}`;
    let imageUrl = '';

    if (model.provider === 'appypie') {
      const apiKey = process.env.APPYPIE_API_KEY;
      if (!apiKey) {
        return NextResponse.json(
          { 
            error: {
              message: 'APPYPIE_API_KEY not configured',
              type: 'server_error',
              param: null,
              code: 'configuration_error'
            }
          },
          { status: 500, headers: getCorsHeaders() }
        );
      }

      let url: string;
      let appyPieBody: any;

      if (model.id === 'appypie-sdxl') {
        url = PROVIDER_URLS.appypie.sdxl;
        appyPieBody = {
          prompt: body.prompt,
          negative_prompt: body.negative_prompt || 'Low-quality, blurry image',
          height: body.size?.split('x')[1] || body.height || 1024,
          width: body.size?.split('x')[0] || body.width || 1024,
        };
      } else if (model.id === 'appypie-sd-inpainting') {
        url = PROVIDER_URLS.appypie.inpainting;
        appyPieBody = {
          prompt: body.prompt,
          imageUrl: body.image_url,
          maskUrl: body.mask_url,
        };
      } else {
        url = PROVIDER_URLS.appypie.fluxSchnell;
        appyPieBody = {
          prompt: body.prompt,
          height: body.size?.split('x')[1] || body.height || 512,
          width: body.size?.split('x')[0] || body.width || 512,
        };
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Ocp-Apim-Subscription-Key': apiKey,
          'x-user-id': userId,
        },
        body: JSON.stringify(appyPieBody),
      });

      if (!response.ok) {
          const errorText = await response.text();
          return NextResponse.json(
            { 
              error: {
                message: 'AppyPie API error',
                type: 'api_error',
                param: null,
                code: 'upstream_error',
                details: errorText
              }
            },
            { status: response.status, headers: getCorsHeaders() }
          );
        }

      // AppyPie returns the image directly, we need to host it or return base64
      // For simplicity in this endpoint, we'll return a proxy URL or base64
      const blob = await response.blob();
      const buffer = Buffer.from(await blob.arrayBuffer());
      const base64 = buffer.toString('base64');
      const mimeType = response.headers.get('content-type') || 'image/png';
      
      if (body.response_format === 'b64_json') {
        return NextResponse.json({
          created: Math.floor(Date.now() / 1000),
          data: [{ b64_json: base64 }]
        }, { headers: getCorsHeaders() });
      }
      
      return NextResponse.json({
        created: Math.floor(Date.now() / 1000),
        data: [{ url: `data:${mimeType};base64,${base64}` }]
      }, { headers: getCorsHeaders() });

    } else if (model.provider === 'stablehorde') {
      const hordeApiKey = process.env.STABLE_HORDE_API_KEY || process.env.STABLEHORDE_API_KEY || '0000000000';
      const hordeUrl = PROVIDER_URLS.stablehorde;
      const modelName = getStableHordeModelName(model.id);
      
      const generateResponse = await fetch(`${hordeUrl}/generate/async`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': hordeApiKey,
          'Client-Agent': 'CloudGPT:1.0:cloudgptapi@github.com',
        },
        body: JSON.stringify({
          prompt: body.prompt,
          params: {
            height: body.size?.split('x')[1] || body.height || 512,
            width: body.size?.split('x')[0] || body.width || 512,
            steps: 30,
            n: 1,
          },
          models: [modelName],
          r2: true,
        }),
      });

      if (!generateResponse.ok) {
        return NextResponse.json(
          { 
            error: {
              message: 'Stable Horde API error',
              type: 'api_error',
              param: null,
              code: 'upstream_error'
            }
          },
          { status: generateResponse.status, headers: getCorsHeaders() }
        );
      }

      const { id: requestId } = await generateResponse.json();
      
      // Poll for completion (simplified for this endpoint)
      let attempts = 0;
      while (attempts < 60) {
        await new Promise(r => setTimeout(r, 2000));
        const check = await fetch(`${hordeUrl}/generate/check/${requestId}`);
        const checkData = await check.json();
        if (checkData.done) {
          const status = await fetch(`${hordeUrl}/generate/status/${requestId}`);
          const statusData = await status.json();
          if (statusData.generations?.[0]?.img) {
            imageUrl = statusData.generations[0].img;
            break;
          }
        }
        attempts++;
      }

      if (!imageUrl) {
        return NextResponse.json(
          { 
            error: {
              message: 'Generation timed out after 2 minutes. Stable Horde is currently busy or has a long queue. Try a different model or provider like Flux or AppyPie for faster results.',
              type: 'server_error',
              param: null,
              code: 'timeout'
            }
          },
          { status: 504, headers: getCorsHeaders() }
        );
      }

    } else {
      // Pollinations
      const params = new URLSearchParams();
      params.set('model', modelId);
      if (body.size) {
        const [width, height] = body.size.split('x');
        params.set('width', width);
        params.set('height', height);
      }
      if (body.seed) params.set('seed', String(body.seed));
      params.set('nologo', 'true');
      
      const pollinationsUrl = `https://gen.pollinations.ai/image/${encodeURIComponent(body.prompt)}?${params.toString()}`;
      
      // We should verify the image exists or just return the URL
      // To avoid 504/405 issues with proxying, we'll return the direct URL 
      // but we could also fetch it to ensure it's valid.
      imageUrl = pollinationsUrl;
    }

    if (apiKeyInfo) {
      await trackUsage(apiKeyInfo.id, apiKeyInfo.userId, modelId, 'image');
    }

    const rateLimitInfo = getRateLimitInfo(effectiveKey, limit, 'image');
    return NextResponse.json({
      created: Math.floor(Date.now() / 1000),
      data: [{ url: imageUrl }]
    }, { 
      headers: {
        ...getCorsHeaders(),
        'X-RateLimit-Remaining': String(rateLimitInfo.remaining),
        'X-RateLimit-Reset': String(rateLimitInfo.resetAt),
        'X-RateLimit-Limit': String(rateLimitInfo.limit),
      }
    });

  } catch (error) {
      console.error('Images API error:', error);
      return NextResponse.json(
        { 
          error: {
            message: 'Internal server error',
            type: 'server_error',
            param: null,
            code: 'internal_error'
          }
        },
        { status: 500, headers: getCorsHeaders() }
      );
    }
  }
