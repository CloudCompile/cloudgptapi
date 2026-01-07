import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { extractApiKey, validateApiKey, trackUsage, checkRateLimit, getRateLimitInfo, ApiKey } from '@/lib/api-keys';
import { CHAT_MODELS, PROVIDER_URLS } from '@/lib/providers';
import { getCorsHeaders } from '@/lib/utils';
import { retrieveMemory, rememberInteraction } from '@/lib/memory';

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
  // '0000000000' is Stable Horde's official anonymous API key for rate-limited access
  const hordeApiKey = process.env.STABLE_HORDE_API_KEY || '0000000000';
  if (!process.env.STABLE_HORDE_API_KEY) {
    console.warn('STABLE_HORDE_API_KEY not set, using anonymous access with reduced rate limits');
  }
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
          
          // Remember interaction
          const lastUserMessage = body.messages[body.messages.length - 1]?.content || '';
          if (userId && lastUserMessage) {
            rememberInteraction(lastUserMessage, generatedText.trim(), userId).catch(err =>
              console.error('Failed to remember Stable Horde interaction:', err)
            );
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
  return new NextResponse(null, { 
    status: 204, 
    headers: getCorsHeaders() 
  });
}

export async function GET() {
  return NextResponse.json({
    message: 'Chat completions endpoint is active. Use POST to send messages.',
    example: {
      model: 'openai',
      messages: [{ role: 'user', content: 'Hello!' }]
    }
  }, {
    headers: getCorsHeaders()
  });
}

export async function POST(request: NextRequest) {
  try {
    // Get user from session (for website users)
    const { userId: sessionUserId } = await auth();

    // Extract and validate API key (for API users)
    const rawApiKey = extractApiKey(request.headers);
    
    // Check rate limit (allow anonymous with lower limits)
    const clientIp = (request as any).ip || 
                     request.headers.get('x-forwarded-for')?.split(',')[0] || 
                     request.headers.get('x-real-ip') || 
                     'anonymous';
    const effectiveKey = rawApiKey || clientIp;
    
    let apiKeyInfo = null;
    if (rawApiKey) {
      apiKeyInfo = await validateApiKey(rawApiKey);
    }

    const limit = apiKeyInfo ? apiKeyInfo.rateLimit : 10;
    
    if (!checkRateLimit(effectiveKey, limit, 'chat')) {
      const rateLimitInfo = getRateLimitInfo(effectiveKey, limit, 'chat');
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
    if (!body.messages || !Array.isArray(body.messages)) {
      return NextResponse.json(
        { 
          error: {
            message: 'messages array is required',
            type: 'invalid_request_error',
            param: 'messages',
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
    let modelId = body.model || 'openai';
    
    // Model Aliases for compatibility with OpenAI-oriented apps
    const modelAliases: Record<string, string> = {
      'gpt-4o': 'openai',
      'gpt-4o-mini': 'openai-fast',
      'gpt-4.5': 'openai-large',
      'gpt-4': 'openai',
      'gpt-3.5-turbo': 'openai-fast',
      'claude-3-5-sonnet': 'claude',
      'claude-3-haiku': 'claude-fast',
      'deepseek-chat': 'deepseek',
      'deepseek-coder': 'qwen-coder',
    };

    if (modelAliases[modelId]) {
      modelId = modelAliases[modelId];
    }

    // Pass the extracted user ID to ALL providers (PolliStack router needs this)
    // Priority: 1. Header x-user-id (from API client) 2. API Key owner 3. Session User 4. IP-based
    const userId = request.headers.get('x-user-id') || apiKeyInfo?.userId || sessionUserId || `anonymous-${clientIp}`;
    
    // Integrate PolliStack Memory
    const lastMessage = body.messages[body.messages.length - 1]?.content || '';
    let memoryContext = '';
    
    try {
      memoryContext = await retrieveMemory(lastMessage, userId);
      if (memoryContext && memoryContext !== 'No prior context found.') {
        // Inject context into messages
        const systemMessageIndex = body.messages.findIndex((m: any) => m.role === 'system');
        const contextPrompt = `\n\n[Long-term Memory Context]:\n${memoryContext}`;
        
        if (systemMessageIndex !== -1) {
          body.messages[systemMessageIndex].content += contextPrompt;
        } else {
          body.messages.unshift({
            role: 'system',
            content: `You are a helpful assistant with long-term memory. Use the following context to personalize your response if relevant.${contextPrompt}`
          });
        }
      }
    } catch (memError) {
      console.error('Memory retrieval failed:', memError);
    }

    const model = CHAT_MODELS.find(m => m.id === modelId);
    
    if (!model) {
      return NextResponse.json(
        { 
          error: {
            message: `Unknown model: ${modelId}. Available models: ${CHAT_MODELS.map(m => m.id).join(', ')}`,
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
    } else if (model.provider === 'liz') {
      // Liz Proxy models (OpenAI compatible)
      requestBody = {
        model: modelId,
        messages: body.messages,
        temperature: body.temperature ?? 0.7,
        max_tokens: body.max_tokens ?? 2048,
        stream: body.stream || false,
        top_p: body.top_p ?? 1,
        frequency_penalty: body.frequency_penalty ?? 0,
        presence_penalty: body.presence_penalty ?? 0,
      };
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
        { 
          error: {
            message: 'Upstream API error',
            type: 'api_error',
            param: null,
            code: 'upstream_error',
            details: errorText
          }
        },
        { 
          status: providerResponse.status,
          headers: getCorsHeaders()
        }
      );
    }

    // Track usage in background if authenticated
    if (apiKeyInfo) {
      await trackUsage(apiKeyInfo.id, apiKeyInfo.userId, modelId, 'chat');
    }

    // Handle streaming response
    if (body.stream) {
      const decoder = new TextDecoder();
      let fullContent = '';

      const transformStream = new TransformStream({
        transform(chunk, controller) {
          const text = decoder.decode(chunk, { stream: true });
          const lines = text.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6).trim();
              if (data === '[DONE]') continue;
              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content || '';
                fullContent += content;
              } catch (e) {}
            }
          }
          controller.enqueue(chunk);
        },
        async flush() {
           if (fullContent && userId && lastMessage) {
             try {
               await rememberInteraction(lastMessage, fullContent, userId);
             } catch (err) {
               console.error('Failed to remember streaming interaction:', err);
             }
           }
         }
      });

      return new NextResponse(providerResponse.body?.pipeThrough(transformStream), {
        headers: {
          ...getCorsHeaders(),
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    // Return JSON response
    const data = await providerResponse.json();
    
    // Transform provider responses to match OpenAI format
    let responseData = data;
    
    if (model.provider === 'meridian') {
      // Meridian returns { response: "..." }
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
    } else if (model.provider === 'pollinations') {
      // Pollinations might return different formats, ensure it matches OpenAI
      if (!data.choices && data.content) {
        responseData = {
          id: 'pollinations-' + Date.now(),
          object: 'chat.completion',
          created: Math.floor(Date.now() / 1000),
          model: modelId,
          choices: [
            {
              index: 0,
              message: {
                role: 'assistant',
                content: data.content,
              },
              finish_reason: 'stop',
            },
          ],
          usage: data.usage || {
            prompt_tokens: 0,
            completion_tokens: 0,
            total_tokens: 0,
          },
        };
      }
    }
    
    // Ensure the response has the correct model ID and object type
    if (responseData && typeof responseData === 'object') {
      responseData.model = modelId;
      responseData.object = responseData.object || 'chat.completion';
    }
    
    // Remember interaction in background
     if (userId && lastMessage) {
       const assistantMessage = responseData.choices?.[0]?.message?.content || '';
       if (assistantMessage) {
         rememberInteraction(lastMessage, assistantMessage, userId).catch(err => 
           console.error('Failed to remember interaction:', err)
         );
       }
     }

    const rateLimitInfo = getRateLimitInfo(effectiveKey);
    return NextResponse.json(responseData, {
      headers: {
        ...getCorsHeaders(),
        'X-RateLimit-Remaining': String(rateLimitInfo.remaining),
        'X-RateLimit-Reset': String(rateLimitInfo.resetAt),
      },
    });
    
  } catch (error) {
    console.error('Chat API error:', error);
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
