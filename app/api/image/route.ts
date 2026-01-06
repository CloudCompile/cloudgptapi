import { NextRequest, NextResponse } from 'next/server';
import { extractApiKey, checkRateLimit, getRateLimitInfo } from '@/lib/api-keys';
import { IMAGE_MODELS, PROVIDER_URLS, ImageModel } from '@/lib/providers';

export const runtime = 'edge';

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, { status: 200 });
}

// Generate image using AppyPie API
async function generateAppyPieImage(body: any, model: ImageModel) {
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

    // Check content type
    const contentType = response.headers.get('content-type');
    
    // If it's JSON, return the JSON response (which should contain image URL or data)
    if (contentType?.includes('application/json')) {
      const data = await response.json();
      return NextResponse.json(data);
    }

    // If it's an image, return the image buffer
    const imageBuffer = await response.arrayBuffer();
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType || 'image/png',
      },
    });
  } catch (error) {
    console.error('AppyPie API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate image with AppyPie', details: String(error) },
      { status: 500 }
    );
  }
}


// Generate image using Stable Horde API
async function generateStableHordeImage(body: any, model: ImageModel) {
  const apiKey = process.env.STABLEHORDE_API_KEY;
  
  if (!apiKey) {
    return NextResponse.json(
      { error: 'STABLEHORDE_API_KEY environment variable is not configured' },
      { status: 500 }
    );
  }
  
  // Map our model IDs to Stable Horde model names
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
  
  const stableHordeModel = modelMap[model.id] || 'stable_diffusion';
  
  // Step 1: Submit async generation request
  const submitUrl = `${PROVIDER_URLS.stablehorde}/generate/async`;
  const submitBody = {
    prompt: body.prompt,
    params: {
      width: body.width || 512,
      height: body.height || 512,
      steps: body.steps || 30,
      cfg_scale: body.cfg_scale || 7.5,
      seed: body.seed ? String(body.seed) : undefined,
      sampler_name: body.sampler_name || 'k_euler_a',
      karras: body.karras !== undefined ? body.karras : true,
      n: 1,
    },
    nsfw: body.nsfw || false,
    trusted_workers: body.trusted_workers !== undefined ? body.trusted_workers : false,
    models: [stableHordeModel],
  };

  try {
    const submitResponse = await fetch(submitUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': apiKey,
        'Client-Agent': 'CloudGPTAPI:1.0.0:https://github.com/CloudCompile/cloudgptapi',
      },
      body: JSON.stringify(submitBody),
    });

    if (!submitResponse.ok) {
      const errorText = await submitResponse.text();
      return NextResponse.json(
        { error: 'Stable Horde API error', details: errorText, status: submitResponse.status },
        { status: submitResponse.status }
      );
    }

    const submitData = await submitResponse.json();
    const requestId = submitData.id;

    if (!requestId) {
      return NextResponse.json(
        { error: 'No request ID returned from Stable Horde' },
        { status: 500 }
      );
    }

    // Step 2: Poll for completion (with timeout)
    const startTime = Date.now();
    const maxTimeout = 120000; // 2 minutes in milliseconds
    const pollInterval = 2000; // 2 seconds
    
    while (Date.now() - startTime < maxTimeout) {
      await new Promise(resolve => setTimeout(resolve, pollInterval));
      
      const statusUrl = `${PROVIDER_URLS.stablehorde}/generate/check/${requestId}`;
      const statusResponse = await fetch(statusUrl, {
        headers: {
          'Client-Agent': 'CloudGPTAPI:1.0.0:https://github.com/CloudCompile/cloudgptapi',
        },
      });

      if (!statusResponse.ok) {
        console.warn(`Stable Horde status check failed for ${requestId}: ${statusResponse.status}`);
        continue; // Keep trying
      }

      const statusData = await statusResponse.json();
      
      if (statusData.done) {
        // Step 3: Get the final result
        const resultUrl = `${PROVIDER_URLS.stablehorde}/generate/status/${requestId}`;
        const resultResponse = await fetch(resultUrl, {
          headers: {
            'Client-Agent': 'CloudGPTAPI:1.0.0:https://github.com/CloudCompile/cloudgptapi',
          },
        });

        if (!resultResponse.ok) {
          const errorText = await resultResponse.text();
          return NextResponse.json(
            { error: 'Failed to get Stable Horde result', details: errorText },
            { status: resultResponse.status }
          );
        }

        const resultData = await resultResponse.json();
        
        if (resultData.generations && resultData.generations.length > 0) {
          const imageUrl = resultData.generations[0].img;
          
          // Fetch the actual image
          const imageResponse = await fetch(imageUrl);
          if (!imageResponse.ok) {
            return NextResponse.json(
              { error: 'Failed to fetch generated image' },
              { status: 500 }
            );
          }

          const imageBuffer = await imageResponse.arrayBuffer();
          const contentType = imageResponse.headers.get('content-type') || 'image/webp';
          
          return new NextResponse(imageBuffer, {
            headers: {
              'Content-Type': contentType,
            },
          });
        } else {
          return NextResponse.json(
            { error: 'No images generated' },
            { status: 500 }
          );
        }
      }
      
      // Check if request is possible
      if (statusData.is_possible === false) {
        return NextResponse.json(
          { error: 'Request cannot be fulfilled by any worker', details: statusData },
          { status: 400 }
        );
      }
    }

    // Timeout
    return NextResponse.json(
      { error: 'Image generation timed out', requestId },
      { status: 408 }
    );
  } catch (error) {
    console.error('Stable Horde API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate image with Stable Horde', details: String(error) },
      { status: 500 }
    );
  }
}


// Shared image generation logic
async function generateImage(body: {
  prompt: string;
  model?: string;
  width?: number;
  height?: number;
  seed?: number;
  enhance?: boolean;
  negative_prompt?: string;
  quality?: string;
  nologo?: boolean;
  // AppyPie specific parameters
  imageUrl?: string;
  maskUrl?: string;
  num_steps?: number;
  guidance_scale?: number;
  guidance?: number;
  // Stable Horde specific parameters
  steps?: number;
  cfg_scale?: number;
  sampler_name?: string;
  karras?: boolean;
  nsfw?: boolean;
  trusted_workers?: boolean;
}, headers: Headers) {
  // Extract and validate API key
  const apiKey = extractApiKey(headers);
  
  // Check rate limit
  const clientIp = headers.get('x-forwarded-for')?.split(',')[0] || 
                   headers.get('x-real-ip') || 
                   'anonymous';
  const effectiveKey = apiKey || clientIp;
  const limit = apiKey ? 30 : 5; // Image generation has lower limits
  
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
    return await generateAppyPieImage(body, model);
  }

  // Handle Stable Horde models
  if (model.provider === 'stablehorde') {
    return await generateStableHordeImage(body, model);
  }

  // Build Pollinations URL with query params
  const params = new URLSearchParams();
  if (body.model) params.set('model', body.model);
  if (body.width) params.set('width', String(body.width));
  if (body.height) params.set('height', String(body.height));
  if (body.seed) params.set('seed', String(body.seed));
  if (body.enhance) params.set('enhance', 'true');
  if (body.negative_prompt) params.set('negative_prompt', body.negative_prompt);
  if (body.quality) params.set('quality', body.quality);
  if (body.nologo) params.set('nologo', 'true');
  
  const encodedPrompt = encodeURIComponent(body.prompt);
  const pollinationsUrl = `${PROVIDER_URLS.pollinations}/image/${encodedPrompt}?${params.toString()}`;
  
  const requestHeaders: Record<string, string> = {};
  if (process.env.POLLINATIONS_API_KEY) {
    requestHeaders['Authorization'] = `Bearer ${process.env.POLLINATIONS_API_KEY}`;
  }
  
  const pollinationsResponse = await fetch(pollinationsUrl, { headers: requestHeaders });

  if (!pollinationsResponse.ok) {
    const errorText = await pollinationsResponse.text();
    return NextResponse.json(
      { error: 'Upstream API error', details: errorText },
      { status: pollinationsResponse.status }
    );
  }

  // Check if response is JSON (error) or binary (image)
  const contentType = pollinationsResponse.headers.get('content-type');
  
  if (contentType?.includes('application/json')) {
    const data = await pollinationsResponse.json();
    return NextResponse.json(data);
  }

  // Return the image
  const imageBuffer = await pollinationsResponse.arrayBuffer();
  
  const rateLimitInfo = getRateLimitInfo(effectiveKey);
  return new NextResponse(imageBuffer, {
    headers: {
      'Content-Type': contentType || 'image/png',
      'X-RateLimit-Remaining': String(rateLimitInfo.remaining),
      'X-RateLimit-Reset': String(rateLimitInfo.resetAt),
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.prompt) {
      return NextResponse.json(
        { error: 'prompt is required' },
        { status: 400 }
      );
    }

    return generateImage(body, request.headers);
    
  } catch (error) {
    console.error('Image API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Also support GET requests with query params
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const prompt = searchParams.get('prompt');
    
    if (!prompt) {
      return NextResponse.json(
        { error: 'prompt query parameter is required' },
        { status: 400 }
      );
    }

    const body = {
      prompt,
      model: searchParams.get('model') || 'flux',
      width: searchParams.get('width') ? parseInt(searchParams.get('width')!) : undefined,
      height: searchParams.get('height') ? parseInt(searchParams.get('height')!) : undefined,
      seed: searchParams.get('seed') ? parseInt(searchParams.get('seed')!) : undefined,
      enhance: searchParams.get('enhance') === 'true',
      negative_prompt: searchParams.get('negative_prompt') || undefined,
      quality: searchParams.get('quality') || undefined,
      nologo: searchParams.get('nologo') === 'true',
    };

    return generateImage(body, request.headers);
    
  } catch (error) {
    console.error('Image API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
