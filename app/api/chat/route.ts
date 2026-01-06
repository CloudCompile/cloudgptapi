import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { extractApiKey, validateApiKey, trackUsage, checkRateLimit, getRateLimitInfo, ApiKey } from '@/lib/api-keys';
import { CHAT_MODELS, PROVIDER_URLS } from '@/lib/providers';

export const runtime = 'edge';

// Map Stable Horde model IDs to actual model names
function getStableHordeTextModelName(modelId: string): string {
  const modelMap: Record<string, string> = {
    'stable-horde-nemotron-nano-9b': 'Nemotron Nano 9B v2',
    'stable-horde-llama-3.2-3b': 'Llama 3.2 3B Instruct',
    'stable-horde-mistral-7b': 'Mistral 7B Instruct',
    'stable-horde-qwen3-4b': 'Qwen3 4B',
    'stable-horde-neonmaid-12b': 'NeonMaid-12B-v2',
  };
  return modelMap[modelId] || 'Mistral 7B Instruct';
}

// Handle Stable Horde text generation
async function handleStableHordeChat(
  body: any,
  modelId: string,
  apiKeyInfo: ApiKey | null,
  userId: string,
  effectiveKey: string
): Promise<NextResponse> {
  const hordeApiKey = process.env.STABLE_HORDE_API_KEY || '0000000000';
  const hordeUrl = PROVIDER_URLS.stablehorde;
  const modelName = getStableHordeTextModelName(modelId);
  
  // Convert messages to a single prompt
  const prompt = body.messages
    .map((msg: any) => `${msg.role}: ${msg.content}`)
    .join('\n') + '\nassistant:';
  
  const generateRequest = {
    prompt,
    params: {
      max_length: body.max_tokens || 512,
      temperature: body.temperature || 0.7,
      top_p: body.top_p || 0.9,
      n: 1,
    },
    models: [modelName],
    workers: [],
    slow_workers: true,
  };

  try {
    // Submit generation request
    const generateResponse = await fetch(`${hordeUrl}/generate/text/async`, {
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
        { error: 'Stable Horde API error', details: errorText },
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

    // Poll for completion (max 2 minutes for text)
    const maxWaitTime = 120000;
    const pollInterval = 2000;
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWaitTime) {
      const checkResponse = await fetch(`${hordeUrl}/generate/text/status/${requestId}`, {
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
        if (checkData.generations && checkData.generations.length > 0) {
          const generatedText = checkData.generations[0].text || '';
          
          // Track usage
          if (apiKeyInfo) {
            await trackUsage(apiKeyInfo.id, apiKeyInfo.userId, modelId, 'chat');
          }
          
          // Return OpenAI-compatible format
          const rateLimitInfo = getRateLimitInfo(effectiveKey);
          return NextResponse.json({
            id: 'horde-' + requestId,
            object: 'chat.completion',
            created: Math.floor(Date.now() / 1000),
            model: modelId,
            choices: [
              {
                index: 0,
                message: {
                  role: 'assistant',
                  content: generatedText.trim(),
                },
                finish_reason: 'stop',
              },
            ],
            usage: {
              prompt_tokens: 0,
              completion_tokens: 0,
              total_tokens: 0,
            },
          }, {
            headers: {
              'X-RateLimit-Remaining': String(rateLimitInfo.remaining),
              'X-RateLimit-Reset': String(rateLimitInfo.resetAt),
            },
          });
        }
        
        return NextResponse.json(
          { error: 'No text generated' },
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
    console.error('Stable Horde text error:', error);
    return NextResponse.json(
      { error: 'Failed to connect to Stable Horde API' },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, { status: 200 });
}

export async function POST(request: NextRequest) {
  try {
    // Get user from session (for website users)
    const { userId: sessionUserId } = await auth();

    // Extract and validate API key (for API users)
    const rawApiKey = extractApiKey(request.headers);
    
    // Check rate limit (allow anonymous with lower limits)
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                     request.headers.get('x-real-ip') || 
                     'anonymous';
    const effectiveKey = rawApiKey || clientIp;
    
    let apiKeyInfo = null;
    if (rawApiKey) {
      apiKeyInfo = await validateApiKey(rawApiKey);
    }

    const limit = apiKeyInfo ? apiKeyInfo.rateLimit : 10;
    
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
    if (!body.messages || !Array.isArray(body.messages)) {
      return NextResponse.json(
        { error: 'messages array is required' },
        { status: 400 }
      );
    }

    // Get model or use default
    const modelId = body.model || 'openai';
    const model = CHAT_MODELS.find(m => m.id === modelId);
    
    if (!model) {
      return NextResponse.json(
        { error: `Unknown model: ${modelId}. Available models: ${CHAT_MODELS.map(m => m.id).join(', ')}` },
        { status: 400 }
      );
    }

    // Determine provider URL and API key based on model provider
    let providerUrl: string;
    let providerApiKey: string | undefined;
    
    if (model.provider === 'openrouter') {
      providerUrl = `${PROVIDER_URLS.openrouter}/api/v1/chat/completions`;
      providerApiKey = process.env.OPENROUTER_API_KEY;
    } else if (model.provider === 'liz') {
      providerUrl = `${PROVIDER_URLS.liz}/v1/chat/completions`;
      providerApiKey = process.env.LIZ_API_KEY || 'sk-946715b46e8fcd676f8cc5d4e9c80a51';
    } else if (model.provider === 'meridian') {
      providerUrl = `${PROVIDER_URLS.meridian}/chat`;
      // Use the hardcoded key from the prompt for meridian if not in env
      providerApiKey = process.env.MERIDIAN_API_KEY || 'ps_6od22i7ddomt18c1jyk9hm';
    } else if (model.provider === 'stablehorde') {
      // Handle Stable Horde text generation
      return await handleStableHordeChat(body, modelId, apiKeyInfo, request.headers.get('x-user-id') || apiKeyInfo?.userId || sessionUserId || `anonymous-${clientIp}`, effectiveKey);
    } else {
      providerUrl = `${PROVIDER_URLS.pollinations}/v1/chat/completions`;
      providerApiKey = process.env.POLLINATIONS_API_KEY;
    }

    // Build headers based on provider
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-App-Source': apiKeyInfo ? 'CloudGPT-API' : 'CloudGPT-Website',
      ...(providerApiKey && {
        'Authorization': `Bearer ${providerApiKey}`,
      }),
    };

    // Pass the extracted user ID to ALL providers (PolliStack router needs this)
    // Priority: 1. Header x-user-id (from API client) 2. API Key owner 3. Session User 4. IP-based
    const userId = request.headers.get('x-user-id') || apiKeyInfo?.userId || sessionUserId || `anonymous-${clientIp}`;
    headers['x-user-id'] = userId;

    // Meridian requires x-api-key header instead of Authorization
    if (model.provider === 'meridian') {
      delete headers['Authorization'];
      if (providerApiKey) {
        headers['x-api-key'] = providerApiKey;
      }
    }

    // OpenRouter requires additional headers
    if (model.provider === 'openrouter') {
      headers['HTTP-Referer'] = process.env.NEXT_PUBLIC_SITE_URL || 'https://cloudgptapi.vercel.app';
      headers['X-Title'] = 'CloudGPT API';
    }

    // Forward to provider API
    let requestBody: any;
    
    if (model.provider === 'meridian') {
      // Meridian expects a simple "prompt" field, not "messages"
      // Convert messages array to a single prompt string
      const prompt = body.messages
        .map((msg: any) => `${msg.role}: ${msg.content}`)
        .join('\n');
      requestBody = { prompt };
    } else {
      requestBody = {
        model: modelId,
        messages: body.messages,
        temperature: body.temperature,
        max_tokens: body.max_tokens,
        stream: body.stream || false,
        top_p: body.top_p,
        frequency_penalty: body.frequency_penalty,
        presence_penalty: body.presence_penalty,
      };
    }

    const providerResponse = await fetch(providerUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    });

    if (!providerResponse.ok) {
      const errorText = await providerResponse.text();
      return NextResponse.json(
        { error: 'Upstream API error', details: errorText },
        { status: providerResponse.status }
      );
    }

    // Track usage in background if authenticated
    if (apiKeyInfo) {
      await trackUsage(apiKeyInfo.id, apiKeyInfo.userId, modelId, 'chat');
    }

    // Handle streaming response
    if (body.stream) {
      return new NextResponse(providerResponse.body, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    // Return JSON response
    const data = await providerResponse.json();
    
    // Transform Meridian response to match OpenAI format
    let responseData = data;
    if (model.provider === 'meridian') {
      // Meridian returns { response: "..." }
      // Transform to OpenAI-compatible format
      responseData = {
        id: 'meridian-' + Date.now(),
        object: 'chat.completion',
        created: Math.floor(Date.now() / 1000),
        model: modelId,
        choices: [
          {
            index: 0,
            message: {
              role: 'assistant',
              content: data.response || '',
            },
            finish_reason: 'stop',
          },
        ],
        usage: {
          prompt_tokens: 0,
          completion_tokens: 0,
          total_tokens: 0,
        },
      };
    }
    
    const rateLimitInfo = getRateLimitInfo(effectiveKey);
    return NextResponse.json(responseData, {
      headers: {
        'X-RateLimit-Remaining': String(rateLimitInfo.remaining),
        'X-RateLimit-Reset': String(rateLimitInfo.resetAt),
      },
    });
    
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
