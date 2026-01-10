import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { extractApiKey, validateApiKey, trackUsage, checkRateLimit, getRateLimitInfo, checkDailyLimit, getDailyLimitInfo, ApiKey, applyPlanOverride, applyPeakHoursLimit } from '@/lib/api-keys';
import { IMAGE_MODELS, PROVIDER_URLS, ImageModel, PREMIUM_MODELS } from '@/lib/providers';
import { getPollinationsApiKey, safeResponseJson, safeJsonParse } from '@/lib/utils';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes max for long image generation

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

    // Check if the response is JSON (often AppyPie returns JSON with an image URL)
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      let imageUrl = data.image_url || data.url || (data.data && data.data[0] && data.data[0].url);
      
      if (imageUrl) {
        const imageResponse = await fetch(imageUrl);
        if (imageResponse.ok) {
          return new NextResponse(imageResponse.body, {
            headers: {
              'Content-Type': imageResponse.headers.get('content-type') || 'image/png',
              'Cache-Control': 'public, max-age=31536000, immutable',
            },
          });
        }
      }
      
      // If we couldn't find or fetch an image URL, return the JSON as is (though client might fail)
      return NextResponse.json(data);
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
    'stable-horde-flux-schnell': 'FLUX.1 [schnell]',
    'stable-horde-sdxl': 'SDXL 1.0',
    'stable-horde-deliberate': 'Deliberate',
    'stable-horde-dreamshaper': 'Dreamshaper',
    'stable-horde-realistic-vision': 'Realistic Vision',
    'stable-horde-absolute-reality': 'AbsoluteReality',
    'stable-horde-juggernaut-xl': 'Juggernaut XL',
    'stable-horde-pony-diffusion': 'Pony Diffusion XL',
    'stable-horde-stable-diffusion': 'stable_diffusion',
    'stable-horde-anything-v5': 'Anything v5',
    'stable-horde-flux-dev': 'FLUX.1 [dev]',
    'stable-horde-icbinp': "I Can't Believe It's Not Photo",
    'stable-horde-dreamlike-photoreal': 'Dreamlike Photoreal',
  };
  return modelMap[modelId] || 'stable_diffusion';
}

// Generate image using Stable Horde API
async function generateStableHordeImage(
  body: any, 
  model: ImageModel, 
  userId: string | null | undefined,
  effectiveKey: string,
  apiKeyInfo: ApiKey | null,
  limit: number,
  dailyLimit: number
) {
  // '0000000000' is Stable Horde's official anonymous API key for rate-limited access
  const hordeApiKey = process.env.STABLEHORDE_API_KEY || process.env.STABLE_HORDE_API_KEY || '0000000000';
  if (!process.env.STABLEHORDE_API_KEY && !process.env.STABLE_HORDE_API_KEY) {
    console.warn('STABLEHORDE_API_KEY not set, using anonymous access with reduced rate limits');
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

    const generateData = await safeResponseJson(generateResponse, null as any);
    const requestId = generateData?.id;

    if (!requestId) {
      return NextResponse.json(
        { error: 'Failed to get generation ID from Stable Horde', details: generateData },
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
      
      const checkData = await safeResponseJson(checkResponse, { done: false, faulted: false });
      
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
        
        const statusData = await safeResponseJson(statusResponse, null as any);
        
        if (statusData?.generations && statusData.generations.length > 0) {
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
          
          const rateLimitInfo = await getRateLimitInfo(effectiveKey, limit, 'image');
          const dailyLimitInfo = await getDailyLimitInfo(effectiveKey, dailyLimit, apiKeyInfo?.id);
          
          return new NextResponse(imageResponse.body, {
            headers: {
              'Content-Type': imageResponse.headers.get('content-type') || 'image/webp',
              'Cache-Control': 'public, max-age=31536000, immutable',
              'X-RateLimit-Remaining': String(rateLimitInfo.remaining),
              'X-RateLimit-Reset': String(rateLimitInfo.resetAt),
              'X-DailyLimit-Remaining': String(dailyLimitInfo.remaining),
              'X-DailyLimit-Reset': String(dailyLimitInfo.resetAt),
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
          { error: 'Generation failed on Stable Horde. The request might have been rejected or the worker failed.' },
          { status: 500 }
        );
      }
      
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }
    
    return NextResponse.json(
      { 
        error: 'Generation timed out after 5 minutes. Stable Horde is currently busy or has a long queue. Try a different model or provider like Flux or AppyPie for faster results.',
        code: 'horde_timeout'
      },
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
    let limit = 5; // Default anonymous/free limit (5 RPM for images)
    let dailyLimit = 1000; // Default 1000 RPD
    
    if (userPlan === 'admin' || userPlan === 'enterprise') {
      limit = 100;
      dailyLimit = 100000;
    } else if (userPlan === 'pro') {
      limit = 5; // 5 RPM for images as requested
      dailyLimit = 2000; // 2000 RPD for pro
    } else if (userPlan === 'developer') {
      limit = 20;
      dailyLimit = 5000;
    } else if (userPlan === 'free') {
      limit = 5; // 5 RPM for images
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
    
    if (!await checkRateLimit(effectiveKey, limit, 'image')) {
      const rateLimitInfo = await getRateLimitInfo(effectiveKey, limit, 'image');
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
      const popularModels = IMAGE_MODELS.slice(0, 10).map(m => m.id).join(', ');
      return NextResponse.json(
        { error: `Unknown model: ${modelId}. Popular models: ${popularModels}, and more. Use /v1/models to see all ${IMAGE_MODELS.length} models.` },
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
      const response = await generateStableHordeImage(
        body, 
        model, 
        apiKeyInfo?.userId || sessionUserId, 
        effectiveKey, 
        apiKeyInfo,
        limit,
        dailyLimit
      );
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
    const pollinationsUrl = `https://gen.pollinations.ai/image/${encodedPrompt}?${params.toString()}`;
    
    const userId = request.headers.get('x-user-id') || apiKeyInfo?.userId || sessionUserId || `anonymous-${clientIp}`;
    const headers: Record<string, string> = {
      'X-App-Source': apiKeyInfo ? 'CloudGPT-API' : 'CloudGPT-Website',
      'x-user-id': userId,
    };
    const pollinationsApiKey = getPollinationsApiKey();
    if (pollinationsApiKey) {
      headers['Authorization'] = `Bearer ${pollinationsApiKey}`;
    }
    
    // Log the request (masking the API key if present)
    const maskedKey = pollinationsApiKey ? `${pollinationsApiKey.substring(0, 4)}...${pollinationsApiKey.substring(pollinationsApiKey.length - 4)}` : 'none';
    console.log(`[ImageAPI] Fetching from Pollinations: ${pollinationsUrl} with key ${maskedKey}`);
    
    // Retry mechanism for Pollinations (max 2 retries)
    let pollinationsResponse;
    let retryCount = 0;
    const maxRetries = 2;

    while (retryCount <= maxRetries) {
      try {
        pollinationsResponse = await fetch(pollinationsUrl, { headers });
        if (pollinationsResponse.ok) break;
        
        // If it's a 500 or 504, wait a bit and retry
        if (pollinationsResponse.status === 500 || pollinationsResponse.status === 504) {
          console.warn(`[ImageAPI] Pollinations returned ${pollinationsResponse.status}, retrying (${retryCount + 1}/${maxRetries})...`);
          retryCount++;
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
          continue;
        }
        
        // For other errors, don't retry
        break;
      } catch (error) {
        console.error(`[ImageAPI] Fetch error from Pollinations, retrying...`, error);
        retryCount++;
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
      }
    }

    if (!pollinationsResponse || !pollinationsResponse.ok) {
      const resp = pollinationsResponse; // Local alias for type safety
      const errorText = resp ? await resp.text() : 'Failed to connect';
      console.error(`[ImageAPI] Upstream error (${resp?.status || 'unknown'}):`, errorText.substring(0, 1000));
      
      // Handle XML AccessDenied errors or any XML error response from Upstream (S3/CloudFront/Pollinations)
      if (errorText.includes('<?xml') || (errorText.includes('<Error>') && errorText.includes('</Error>'))) {
        console.warn(`[ImageAPI] Detected XML error response from provider:`, errorText.substring(0, 500));
        return NextResponse.json(
          { 
            error: {
              message: 'The upstream provider (Pollinations/S3) returned an XML error. This usually indicates an invalid API key, restricted access, or an expired session.',
              type: 'provider_error',
              code: errorText.includes('AccessDenied') ? 'provider_access_denied' : 'provider_xml_error',
              status: resp?.status === 200 ? 403 : (resp?.status || 500),
              details: errorText.substring(0, 500)
            }
          },
          { status: resp?.status === 200 ? 403 : (resp?.status || 500) }
        );
      }

      // Handle 401 Unauthorized specifically
      if (resp?.status === 401) {
        return NextResponse.json(
          { 
            error: {
              message: 'Pollinations API key is invalid or expired.',
              type: 'authentication_error',
              code: 'invalid_api_key',
              status: 401
            }
          },
          { status: 401 }
        );
      }

      return NextResponse.json(
        { error: 'Upstream API error', details: errorText.substring(0, 500) },
        { status: resp?.status || 500 }
      );
    }

    // Track usage in background if authenticated
    if (apiKeyInfo) {
      await trackUsage(apiKeyInfo.id, apiKeyInfo.userId, modelId, 'image', body.prompt);
    }

    // Forward the binary response (image)
    const contentType = pollinationsResponse.headers.get('content-type');
    const rateLimitInfo = await getRateLimitInfo(effectiveKey);
    const dailyLimitInfo = await getDailyLimitInfo(effectiveKey, dailyLimit, apiKeyInfo?.id);
    
    return new NextResponse(pollinationsResponse.body, {
      headers: {
        'Content-Type': contentType || 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-RateLimit-Remaining': String(rateLimitInfo.remaining),
        'X-RateLimit-Reset': String(rateLimitInfo.resetAt),
        'X-DailyLimit-Remaining': String(dailyLimitInfo.remaining),
        'X-DailyLimit-Reset': String(dailyLimitInfo.resetAt),
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
