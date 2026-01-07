import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { extractApiKey, validateApiKey, trackUsage, checkRateLimit, getRateLimitInfo, ApiKey } from '@/lib/api-keys';
import { IMAGE_MODELS, PROVIDER_URLS, ImageModel } from '@/lib/providers';

export const runtime = 'edge';

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, { status: 200 });
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
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                     request.headers.get('x-real-ip') || 
                     'anonymous';
    const effectiveKey = rawApiKey || clientIp;
    
    let apiKeyInfo: ApiKey | null = null;
    if (rawApiKey) {
      apiKeyInfo = await validateApiKey(rawApiKey);
    }

    const limit = apiKeyInfo ? apiKeyInfo.rateLimit : 5;
    
    if (!checkRateLimit(effectiveKey, limit)) {
      const rateLimitInfo = getRateLimitInfo(effectiveKey);
      return NextResponse.json(
        { error: 'Rate limit exceeded', resetAt: rateLimitInfo.resetAt },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(rateLimitInfo.resetAt),
          },
        }
      );
    }

    const body = await request.json();
    
    if (!body.prompt) {
      return NextResponse.json(
        { error: 'prompt is required' },
        { status: 400 }
      );
    }

    const modelId = body.model || 'flux';
    const model = IMAGE_MODELS.find(m => m.id === modelId);
    
    if (!model) {
      return NextResponse.json(
        { error: `Unknown model: ${modelId}. Available models: ${IMAGE_MODELS.map(m => m.id).join(', ')}` },
        { status: 400 }
      );
    }

    const userId = request.headers.get('x-user-id') || apiKeyInfo?.userId || sessionUserId || `anonymous-${clientIp}`;
    let imageUrl = '';

    if (model.provider === 'appypie') {
      const apiKey = process.env.APPYPIE_API_KEY;
      if (!apiKey) {
        return NextResponse.json({ error: 'APPYPIE_API_KEY not configured' }, { status: 500 });
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
        return NextResponse.json({ error: 'AppyPie API error', details: errorText }, { status: response.status });
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
        });
      }
      
      return NextResponse.json({
        created: Math.floor(Date.now() / 1000),
        data: [{ url: `data:${mimeType};base64,${base64}` }]
      });

    } else if (model.provider === 'stablehorde') {
      const hordeApiKey = process.env.STABLE_HORDE_API_KEY || '0000000000';
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
        return NextResponse.json({ error: 'Stable Horde API error' }, { status: generateResponse.status });
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
        return NextResponse.json({ error: 'Generation timed out' }, { status: 504 });
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
      
      imageUrl = `${PROVIDER_URLS.pollinations}/image/${encodeURIComponent(body.prompt)}?${params.toString()}`;
    }

    if (apiKeyInfo) {
      await trackUsage(apiKeyInfo.id, apiKeyInfo.userId, modelId, 'image');
    }

    return NextResponse.json({
      created: Math.floor(Date.now() / 1000),
      data: [{ url: imageUrl }]
    });

  } catch (error) {
    console.error('Images API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
