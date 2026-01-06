import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { extractApiKey, validateApiKey, trackUsage, checkRateLimit, getRateLimitInfo, ApiKey } from '@/lib/api-keys';
import { IMAGE_MODELS, PROVIDER_URLS, ImageModel } from '@/lib/providers';

export const runtime = 'edge';

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, { status: 200 });
}

// Generate image using AppyPie API
async function generateAppyPieImage(body: any, model: ImageModel, userId?: string | null) {
  const apiKey = process.env.APPYPIE_API_KEY;
  
  if (!apiKey) {
    return NextResponse.json(
      { error: 'APPYPIE_API_KEY environment variable is not configured' },
      { status: 500 }
    );
  }
  
  let url: string;
  let requestBody: any;
  
  // Determine which AppyPie endpoint to use
  if (model.id === 'appypie-sdxl') {
    url = PROVIDER_URLS.appypie.sdxl;
    requestBody = {
      prompt: body.prompt,
      negative_prompt: body.negative_prompt || 'Low-quality, blurry image',
      height: body.height || 1024,
      width: body.width || 1024,
      num_steps: body.num_steps || 20,
      guidance_scale: body.guidance_scale || 5,
      seed: body.seed || 40,
    };
  } else if (model.id === 'appypie-sd-inpainting') {
    url = PROVIDER_URLS.appypie.inpainting;
    
    // For inpainting, imageUrl and maskUrl are required
    if (!body.imageUrl || !body.maskUrl) {
      return NextResponse.json(
        { error: 'imageUrl and maskUrl are required for inpainting model' },
        { status: 400 }
      );
    }
    
    requestBody = {
      prompt: body.prompt,
      imageUrl: body.imageUrl,
      maskUrl: body.maskUrl,
      negative_prompt: body.negative_prompt || 'watermark',
      height: body.height || 1024,
      width: body.width || 1024,
      num_steps: body.num_steps || 20,
      guidance: body.guidance || 5,
      seed: body.seed || 42,
    };
  } else if (model.id === 'appypie-flux-schnell') {
    url = PROVIDER_URLS.appypie.fluxSchnell;
    requestBody = {
      prompt: body.prompt,
      num_steps: body.num_steps || 4,
      seed: body.seed || 15,
      height: body.height || 512,
      width: body.width || 512,
    };
  } else {
    return NextResponse.json(
      { error: 'Unknown AppyPie model' },
      { status: 400 }
    );
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
    'Ocp-Apim-Subscription-Key': apiKey,
    'X-App-Source': userId?.startsWith('user_') ? 'CloudGPT-Website' : 'CloudGPT-API',
    'x-user-id': userId || 'anonymous',
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: 'AppyPie API error', details: errorText, status: response.status },
        { status: response.status }
      );
    }

    return response;
  } catch (error) {
    console.error('AppyPie fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to connect to AppyPie API' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get user from session
    const { userId: sessionUserId } = await auth();

    // Extract and validate API key
    const rawApiKey = extractApiKey(request.headers);
    
    // Check rate limit (allow anonymous with lower limits)
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
    
    // Validate required fields
    if (!body.prompt) {
      return NextResponse.json(
        { error: 'prompt is required' },
        { status: 400 }
      );
    }

    // Get model or use default
    const modelId = body.model || 'flux';
    const model = IMAGE_MODELS.find(m => m.id === modelId);
    
    if (!model) {
      return NextResponse.json(
        { error: `Unknown model: ${modelId}. Available models: ${IMAGE_MODELS.map(m => m.id).join(', ')}` },
        { status: 400 }
      );
    }

    // Handle AppyPie models
    if (model.provider === 'appypie') {
      const response = await generateAppyPieImage(body, model, apiKeyInfo?.userId || sessionUserId);
      if (apiKeyInfo) {
        await trackUsage(apiKeyInfo.id, apiKeyInfo.userId, modelId, 'image');
      }
      return response;
    }

    // Handle Pollinations models
    const params = new URLSearchParams();
    params.set('model', modelId);
    if (body.width) params.set('width', String(body.width));
    if (body.height) params.set('height', String(body.height));
    if (body.seed) params.set('seed', String(body.seed));
    if (body.nologo) params.set('nologo', 'true');
    if (body.enhance) params.set('enhance', 'true');
    
    const encodedPrompt = encodeURIComponent(body.prompt);
    const pollinationsUrl = `${PROVIDER_URLS.pollinations}/prompt/${encodedPrompt}?${params.toString()}`;
    
    const userId = request.headers.get('x-user-id') || apiKeyInfo?.userId || sessionUserId || `anonymous-${clientIp}`;
    const headers: Record<string, string> = {
      'X-App-Source': apiKeyInfo ? 'CloudGPT-API' : 'CloudGPT-Website',
      'x-user-id': userId,
    };
    if (process.env.POLLINATIONS_API_KEY) {
      headers['Authorization'] = `Bearer ${process.env.POLLINATIONS_API_KEY}`;
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
      await trackUsage(apiKeyInfo.id, apiKeyInfo.userId, modelId, 'image');
    }

    // Forward the binary response (image)
    const contentType = pollinationsResponse.headers.get('content-type');
    const rateLimitInfo = getRateLimitInfo(effectiveKey);
    
    return new NextResponse(pollinationsResponse.body, {
      headers: {
        'Content-Type': contentType || 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-RateLimit-Remaining': String(rateLimitInfo.remaining),
        'X-RateLimit-Reset': String(rateLimitInfo.resetAt),
      },
    });
    
  } catch (error) {
    console.error('Image API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
