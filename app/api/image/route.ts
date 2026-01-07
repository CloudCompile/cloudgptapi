import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { extractApiKey, validateApiKey, trackUsage, checkRateLimit, getRateLimitInfo, ApiKey } from '@/lib/api-keys';
import { IMAGE_MODELS, PROVIDER_URLS, ImageModel, PREMIUM_MODELS } from '@/lib/providers';
import { getPollinationsApiKey } from '@/lib/utils';
import { supabaseAdmin } from '@/lib/supabase';

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

// Generate image using Stable Horde API
async function generateStableHordeImage(
  body: any, 
  model: ImageModel, 
  userId: string | null | undefined,
  effectiveKey: string,
  apiKeyInfo: ApiKey | null
) {
  // '0000000000' is Stable Horde's official anonymous API key for rate-limited access
  const hordeApiKey = process.env.STABLE_HORDE_API_KEY || '0000000000';
  if (!process.env.STABLE_HORDE_API_KEY) {
    console.warn('STABLE_HORDE_API_KEY not set, using anonymous access with reduced rate limits');
  }
  const hordeUrl = PROVIDER_URLS.stablehorde;
  
  const modelName = getStableHordeModelName(model.id);
  
  // Prepare generation request
  const generateRequest = {
    prompt: body.prompt,
    params: {
      sampler_name: body.sampler || 'k_euler',
      cfg_scale: body.cfg_scale || 7,
      height: body.height || 512,
      width: body.width || 512,
      steps: body.steps || 30,
      n: 1,
    },
    nsfw: false,
    censor_nsfw: true,
    models: [modelName],
    r2: true,
    shared: false,
  };

  try {
    // Submit generation request
    const generateResponse = await fetch(`${hordeUrl}/generate/async`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': hordeApiKey,
        'Client-Agent': 'CloudGPT:1.0:cloudgptapi@github.com',
      },
      body: JSON.stringify(generateRequest),
    });

    if (!generateResponse.ok) {
      const errorText = await generateResponse.text();
      return NextResponse.json(
        { error: 'Stable Horde API error', details: errorText, status: generateResponse.status },
        { status: generateResponse.status }
      );
    }

    const generateData = await generateResponse.json();
    const requestId = generateData.id;

    if (!requestId) {
      return NextResponse.json(
        { error: 'Failed to get generation ID from Stable Horde' },
        { status: 500 }
      );
    }

    // Poll for completion (max 5 minutes)
    const maxWaitTime = 300000; // 5 minutes
    const pollInterval = 3000; // 3 seconds
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWaitTime) {
      const checkResponse = await fetch(`${hordeUrl}/generate/check/${requestId}`, {
        headers: {
          'Client-Agent': 'CloudGPT:1.0:cloudgptapi@github.com',
        },
      });
      
      if (!checkResponse.ok) {
        await new Promise(resolve => setTimeout(resolve, pollInterval));
        continue;
      }
      
      const checkData = await checkResponse.json();
      
      if (checkData.done) {
        // Get the result
        const statusResponse = await fetch(`${hordeUrl}/generate/status/${requestId}`, {
          headers: {
            'Client-Agent': 'CloudGPT:1.0:cloudgptapi@github.com',
          },
        });
        
        if (!statusResponse.ok) {
          return NextResponse.json(
            { error: 'Failed to get generation status from Stable Horde' },
            { status: 500 }
          );
        }
        
        const statusData = await statusResponse.json();
        
        if (statusData.generations && statusData.generations.length > 0) {
          const imageUrl = statusData.generations[0].img;
          
          // Track usage
          if (apiKeyInfo) {
            await trackUsage(apiKeyInfo.id, apiKeyInfo.userId, model.id, 'image');
          }
          
          // Fetch the actual image and return it
          const imageResponse = await fetch(imageUrl);
          if (!imageResponse.ok) {
            return NextResponse.json(
              { error: 'Failed to fetch generated image' },
              { status: 500 }
            );
          }
          
          const rateLimitInfo = getRateLimitInfo(effectiveKey);
          
          return new NextResponse(imageResponse.body, {
            headers: {
              'Content-Type': imageResponse.headers.get('content-type') || 'image/webp',
              'Cache-Control': 'public, max-age=31536000, immutable',
              'X-RateLimit-Remaining': String(rateLimitInfo.remaining),
              'X-RateLimit-Reset': String(rateLimitInfo.resetAt),
            },
          });
        }
        
        return NextResponse.json(
          { error: 'No images generated' },
          { status: 500 }
        );
      }
      
      if (checkData.faulted) {
        return NextResponse.json(
          { error: 'Generation failed on Stable Horde' },
          { status: 500 }
        );
      }
      
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }
    
    return NextResponse.json(
      { error: 'Generation timed out' },
      { status: 504 }
    );
    
  } catch (error) {
    console.error('Stable Horde fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to connect to Stable Horde API' },
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
        .select('plan')
        .eq('id', sessionUserId)
        .single();
      
      if (profile?.plan) {
        userPlan = profile.plan;
      }
    }

    const limit = apiKeyInfo ? apiKeyInfo.rateLimit : 5;
    
    if (!checkRateLimit(effectiveKey, limit, 'image')) {
      const rateLimitInfo = getRateLimitInfo(effectiveKey, limit, 'image');
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

    // Check if model is premium and if user has access
    const isPremium = PREMIUM_MODELS.has(modelId);
    // Pro access if they have a pro/enterprise plan OR if their rate limit is high (fallback)
    const hasProAccess = userPlan === 'pro' || userPlan === 'enterprise' || (apiKeyInfo?.rateLimit && apiKeyInfo.rateLimit >= 50);

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

    // Handle AppyPie models
    if (model.provider === 'appypie') {
      const response = await generateAppyPieImage(body, model, apiKeyInfo?.userId || sessionUserId);
      if (apiKeyInfo) {
        await trackUsage(apiKeyInfo.id, apiKeyInfo.userId, modelId, 'image');
      }
      return response;
    }

    // Handle Stable Horde models
    if (model.provider === 'stablehorde') {
      const response = await generateStableHordeImage(body, model, apiKeyInfo?.userId || sessionUserId, effectiveKey, apiKeyInfo);
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
