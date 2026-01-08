import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { extractApiKey, validateApiKey, trackUsage, checkRateLimit, getRateLimitInfo, checkDailyLimit, getDailyLimitInfo, ApiKey, applyPlanOverride } from '@/lib/api-keys';
import { CHAT_MODELS, PREMIUM_MODELS } from '@/lib/providers';
import { getCorsHeaders, getPollinationsApiKey, getPollinationsApiKeys, getOpenRouterApiKey, getOpenRouterApiKeys } from '@/lib/utils';
import { retrieveMemory, rememberInteraction } from '@/lib/memory';
import { supabaseAdmin } from '@/lib/supabase';
import {
  validateMessages,
  generateRequestId,
  PROVIDER_URLS,
  resolveModelId,
  createChatTransformStream,
  PROVIDER_TIMEOUT_MS,
  sanitizeErrorText
} from '@/lib/chat-utils';

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes max for long reasoning or slow providers

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
  effectiveKey: string,
  requestId: string,
  limit: number,
  dailyLimit: number
): Promise<NextResponse> {
  // '0000000000' is Stable Horde's official anonymous API key for rate-limited access
  const hordeApiKey = process.env.STABLE_HORDE_API_KEY || process.env.STABLEHORDE_API_KEY || '0000000000';
  if (!process.env.STABLE_HORDE_API_KEY && !process.env.STABLEHORDE_API_KEY) {
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
      max_length: body.max_tokens ? Math.min(body.max_tokens, 1024) : 512,
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
        { status: generateResponse.status, headers: getCorsHeaders() }
      );
    }

    const generateData = await generateResponse.json();
    const requestId = generateData.id;

    if (!requestId) {
      return NextResponse.json(
        { error: 'Failed to get generation ID from Stable Horde' },
        { status: 500, headers: getCorsHeaders() }
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
          const rateLimitInfo = await getRateLimitInfo(effectiveKey, limit, 'chat');
          const dailyLimitInfo = await getDailyLimitInfo(effectiveKey, dailyLimit, apiKeyInfo?.id);

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
              ...getCorsHeaders(),
              'X-RateLimit-Remaining': String(rateLimitInfo.remaining),
              'X-RateLimit-Reset': String(rateLimitInfo.resetAt),
              'X-RateLimit-Limit': String(rateLimitInfo.limit),
              'X-DailyLimit-Remaining': String(dailyLimitInfo.remaining),
              'X-DailyLimit-Reset': String(dailyLimitInfo.resetAt),
              'X-DailyLimit-Limit': String(dailyLimitInfo.limit),
            },
          });
        }
        
        return NextResponse.json(
          { error: 'No text generated' },
          { status: 500, headers: getCorsHeaders() }
        );
      }
      
      if (checkData.faulted) {
        return NextResponse.json(
          { error: 'Generation failed on Stable Horde' },
          { status: 500, headers: getCorsHeaders() }
        );
      }
      
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }
    
    return NextResponse.json(
      { error: 'Generation timed out' },
      { status: 504, headers: getCorsHeaders() }
    );
    
  } catch (error) {
    console.error('Stable Horde text error:', error);
    return NextResponse.json(
      { error: 'Failed to connect to Stable Horde API' },
      { status: 500, headers: getCorsHeaders() }
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

export async function GET(request: NextRequest) {
  // Check if the URL path is malformed (e.g., duplicated path segments)
  const url = new URL(request.url);
  const expectedPath = '/v1/chat/completions';
  
  if (url.pathname !== expectedPath) {
    return NextResponse.json({
      error: {
        message: `Invalid endpoint path. Expected ${expectedPath}, got ${url.pathname}. Please check your base URL configuration.`,
        type: 'invalid_request_error',
        param: null,
        code: 'invalid_endpoint'
      }
    }, {
      status: 400,
      headers: getCorsHeaders()
    });
  }
  
  return NextResponse.json({
    message: 'Chat completions endpoint is active. Use POST to send messages.',
    endpoint: '/v1/chat/completions',
    example: {
      model: 'openai',
      messages: [{ role: 'user', content: 'Hello!' }]
    }
  }, {
    headers: getCorsHeaders()
  });
}

export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  
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
        .single();
      
      if (profile) {
        userPlan = profile.plan || 'free';
        
        // Manual override for specific users requested by admin
        userPlan = await applyPlanOverride(profile.email, userPlan, sessionUserId, 'id');
      }
    }

    // Determine limit based on plan if not explicitly set high on the key
    let limit = 100; // Default baseline limit (100 RPM)
    let dailyLimit = 1000; // Default 1000 RPD
    
    if (userPlan === 'admin' || userPlan === 'enterprise') {
      limit = 10000; 
      dailyLimit = 100000;
    } else if (userPlan === 'pro') {
      limit = 200; // Higher RPM for Pro
      dailyLimit = 2000; // 2000 RPD for pro
    } else if (userPlan === 'developer') {
      limit = 1000;
      dailyLimit = 5000;
    } else if (userPlan === 'free') {
      limit = 100; // 100 RPM for free
      dailyLimit = 1000; // 1000 RPD for free
    }

    // If API key has a specific custom limit that's higher, use that
    if (apiKeyInfo && apiKeyInfo.rateLimit > limit) {
      limit = apiKeyInfo.rateLimit;
    }
    
    // Check Daily Limit First
    if (!await checkDailyLimit(effectiveKey, dailyLimit, apiKeyInfo?.id)) {
      const dailyInfo = await getDailyLimitInfo(effectiveKey, dailyLimit, apiKeyInfo?.id);
      console.warn(`[${requestId}] Daily limit exceeded for key: ${effectiveKey.substring(0, 10)}...`);
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
            ...getCorsHeaders(),
            'X-DailyLimit-Remaining': String(dailyInfo.remaining),
            'X-DailyLimit-Reset': String(dailyInfo.resetAt),
          },
        }
      );
    }

    if (!await checkRateLimit(effectiveKey, limit, 'chat')) {
      const rateLimitInfo = await getRateLimitInfo(effectiveKey, limit, 'chat');
      const dailyLimitInfo = await getDailyLimitInfo(effectiveKey, dailyLimit, apiKeyInfo?.id);
      
      console.warn(`[${requestId}] Rate limit exceeded for key: ${effectiveKey.substring(0, 10)}...`);
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
            'X-DailyLimit-Remaining': String(dailyLimitInfo.remaining),
            'X-DailyLimit-Reset': String(dailyLimitInfo.resetAt),
          },
        }
      );
    }

    const body = await request.json();
    
    // Log request details for debugging (especially token issues)
    console.log(`[${requestId}] Request model: ${body.model}, max_tokens: ${body.max_tokens}, messages: ${body.messages?.length}`);

    // Validate required fields
    if (!body.messages || !Array.isArray(body.messages)) {
      console.warn(`[${requestId}] Invalid request: messages array missing`);
      return NextResponse.json(
        {
          error: {
            message: 'messages array is required',
            type: 'invalid_request_error',
            param: 'messages',
            code: null,
            request_id: requestId
          }
        },
        {
          status: 400,
          headers: getCorsHeaders()
        }
      );
    }
    
    // Validate message structure and content
    const validation = validateMessages(body.messages);
    if (!validation.valid) {
      console.warn(`[${requestId}] Invalid messages: ${validation.error}`);
      return NextResponse.json(
        {
          error: {
            message: validation.error,
            type: 'invalid_request_error',
            param: 'messages',
            code: 'invalid_messages',
            request_id: requestId
          }
        },
        {
          status: 400,
          headers: getCorsHeaders()
        }
      );
    }

    // Get model or use default, resolved through aliases via resolveModelId
    const modelId = resolveModelId(body.model || 'openai');

    // Check if model is premium and if user has access
    const isPremium = PREMIUM_MODELS.has(modelId);
    // Pro access if they have a pro/enterprise/developer/admin plan
    const hasProAccess = ['pro', 'enterprise', 'developer', 'admin'].includes(userPlan);

    // Diagnostic logging for access issues
    if (isPremium || userPlan !== 'free') {
      console.log(`[${requestId}] Access Check: model=${modelId}, plan=${userPlan}, isPremium=${isPremium}, hasProAccess=${hasProAccess}`);
    }

    if (isPremium && !hasProAccess) {
      console.warn(`[${requestId}] Premium model access denied: ${modelId} for key: ${effectiveKey.substring(0, 10)}...`);
      return NextResponse.json(
        {
          error: {
            message: `The model '${modelId}' is only available on Pro and Enterprise plans. Please upgrade at ${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
            type: 'access_denied',
            param: 'model',
            code: 'premium_model_required',
            request_id: requestId
          }
        },
        {
          status: 403,
          headers: getCorsHeaders()
        }
      );
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
      const popularModels = CHAT_MODELS.slice(0, 10).map(m => m.id).join(', ');
      console.warn(`[${requestId}] Unknown model: ${modelId}`);
      return NextResponse.json(
        { 
          error: {
            message: `Unknown model: ${modelId}. Popular models: ${popularModels}, and more. Use /v1/models to see the full list of ${CHAT_MODELS.length} models.`,
            type: 'invalid_request_error',
            param: 'model',
            code: 'model_not_found',
            request_id: requestId
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
      providerApiKey = getOpenRouterApiKey();
    } else if (model.provider === 'liz') {
      providerUrl = `${PROVIDER_URLS.liz}/v1/chat/completions`;
      providerApiKey = process.env.LIZ_API_KEY || 'sk-d38705df52b386e905f257a4019f8f2a';
    } else if (model.provider === 'meridian') {
      providerUrl = `${PROVIDER_URLS.meridian}/chat`;
      providerApiKey = process.env.MERIDIAN_API_KEY;
    } else if (model.provider === 'stablehorde') {
      // Handle Stable Horde text generation
      return await handleStableHordeChat(body, modelId, apiKeyInfo, request.headers.get('x-user-id') || apiKeyInfo?.userId || sessionUserId || `anonymous-${clientIp}`, effectiveKey, requestId, limit, dailyLimit);
    } else {
      providerUrl = `${PROVIDER_URLS.pollinations}/v1/chat/completions`;
      providerApiKey = getPollinationsApiKey();
      
      if (!providerApiKey) {
            console.warn(`[${requestId}] Missing Pollinations API key for model: ${modelId}`);
            return NextResponse.json(
              {
                error: {
                  message: 'Pollinations API key is not configured. Please add POLLINATIONS_API_KEY to your .env.local file.',
                  type: 'config_error',
                  param: null,
                  code: 'missing_api_key',
                  request_id: requestId
                }
              },
              { status: 500, headers: getCorsHeaders() }
            );
          }
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

    // Optimization: Define a list of "High-Speed" models that can be raced across providers
    // Currently Pollinations is much faster (400-500ms) than Liz (1500ms+)
    const isHighSpeedModel = [
       'openai', 
       'openai-fast', 
       'gemini-fast', 
       'gemini', 
       'deepseek',
       'google/gemini-2.0-flash-exp:free',
       'google/gemini-2.0-flash-exp',
       'deepseek/deepseek-chat',
       'deepseek/deepseek-v3'
     ].includes(modelId);

    // Forward to provider API
    let requestBody: any;
    
    // Safety cap for max_tokens to prevent "request exceeds max tokens" errors
    // Many providers have limits around 4k-8k for free tiers
    const maxTokensSafetyCap = 4096;
    const effectiveMaxTokens = body.max_tokens ? Math.min(body.max_tokens, maxTokensSafetyCap) : undefined;

    // Prepare standard request body
    const standardBody = {
      model: modelId,
      messages: body.messages,
      temperature: body.temperature ?? 0.7,
      max_tokens: effectiveMaxTokens,
      stream: body.stream ?? false,
      top_p: body.top_p ?? 1,
      frequency_penalty: body.frequency_penalty ?? 0,
      presence_penalty: body.presence_penalty ?? 0,
      // Reasoning parameters for models like o1 or deepseek-r1
      // Force reasoning_effort: "medium" for Pollinations models
      reasoning_effort: model.provider === 'pollinations' ? 'medium' : body.reasoning_effort,
      include_reasoning: body.include_reasoning,
      reasoning: body.reasoning,
    };

    // --- OPTIMIZED PROXY LOGIC ---
    if (isHighSpeedModel && !body.stream) {
      console.log(`[${requestId}] Racing fast model: ${modelId}`);
      
      // Attempt racing across Pollinations and a backup if possible
      // For now, we'll implement a prioritized sequential fetch with a shorter timeout
      // to ensure we get the fastest response without wasting too many resources.
      
      const fastFetch = async (url: string, auth: string) => {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout for "fast" models
        
        try {
          const res = await fetch(url, {
            method: 'POST',
            headers: {
              ...headers,
              'Authorization': `Bearer ${auth}`
            },
            body: JSON.stringify(standardBody),
            signal: controller.signal
          });
          clearTimeout(timeout);
          return res;
        } catch (e) {
          clearTimeout(timeout);
          throw e;
        }
      };

      try {
        // Try Pollinations first (it's the fastest)
        const pollKey = getPollinationsApiKey();
        const startTime = Date.now();
        const response = await fastFetch(`${PROVIDER_URLS.pollinations}/v1/chat/completions`, pollKey || '');
        
        if (response.ok) {
          console.log(`[${requestId}] Fast-path success: ${Date.now() - startTime}ms via Pollinations`);
          const data = await response.json();
          const rateLimitInfo = await getRateLimitInfo(effectiveKey, limit, 'chat');
          const dailyLimitInfo = await getDailyLimitInfo(effectiveKey, dailyLimit, apiKeyInfo?.id);
          
          return NextResponse.json(data, {
            headers: {
              ...getCorsHeaders(),
              'X-RateLimit-Remaining': String(rateLimitInfo.remaining),
              'X-RateLimit-Reset': String(rateLimitInfo.resetAt),
              'X-RateLimit-Limit': String(rateLimitInfo.limit),
              'X-DailyLimit-Remaining': String(dailyLimitInfo.remaining),
              'X-DailyLimit-Reset': String(dailyLimitInfo.resetAt),
              'X-DailyLimit-Limit': String(dailyLimitInfo.limit),
              'X-Proxy-Provider': 'pollinations-fast',
              'X-Proxy-Latency': `${Date.now() - startTime}ms`
            }
          });
        }
        console.warn(`[${requestId}] Fast-path failed for Pollinations, falling back...`);
      } catch (e) {
        console.warn(`[${requestId}] Fast-path error for Pollinations:`, e);
      }
    }

    // --- STANDARD PROXY LOGIC (FALLBACK) ---
    
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
    // requestBody, maxTokensSafetyCap, and effectiveMaxTokens are already declared above
    
    // Log the provider request (masking the API key)
    const maskedProviderKey = providerApiKey ? `${providerApiKey.substring(0, 4)}...${providerApiKey.substring(providerApiKey.length - 4)}` : 'none';
    console.log(`[${requestId}] Forwarding to ${model.provider} (${providerUrl}) with key ${maskedProviderKey}`);

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
        max_tokens: body.max_tokens ? Math.min(body.max_tokens, 4096) : 2048,
        stream: body.stream || false,
        top_p: body.top_p ?? 1,
        frequency_penalty: body.frequency_penalty ?? 0,
        presence_penalty: body.presence_penalty ?? 0,
        reasoning_effort: body.reasoning_effort,
        include_reasoning: body.include_reasoning,
      };
    } else {
      requestBody = {
        model: modelId,
        messages: body.messages,
        temperature: body.temperature,
        max_tokens: effectiveMaxTokens,
        stream: body.stream || false,
        top_p: body.top_p,
        frequency_penalty: body.frequency_penalty,
        presence_penalty: body.presence_penalty,
        // Force reasoning_effort: "medium" for Pollinations models
        reasoning_effort: model.provider === 'pollinations' ? 'medium' : body.reasoning_effort,
        include_reasoning: body.include_reasoning,
        reasoning: body.reasoning,
      };
    }

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), PROVIDER_TIMEOUT_MS);
    
    let providerResponse: Response;
    try {
      providerResponse = await fetch(providerUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });
      
      // Fallback for OpenRouter rate limits (429) if we have multiple keys
      if (model.provider === 'openrouter' && providerResponse.status === 429) {
        const availableKeys = getOpenRouterApiKeys();
        if (availableKeys.length > 1) {
          console.warn(`[${requestId}] OpenRouter rate limited (429) with primary key. Attempting fallback...`);
          
          // Try all other available keys
          for (const fallbackKey of availableKeys) {
            if (fallbackKey === providerApiKey) continue;
            
            console.log(`[${requestId}] Trying OpenRouter fallback key: ${fallbackKey.substring(0, 4)}...`);
            const fallbackHeaders = { ...headers, 'Authorization': `Bearer ${fallbackKey}` };
            
            try {
              const fallbackResponse = await fetch(providerUrl, {
                method: 'POST',
                headers: fallbackHeaders,
                body: JSON.stringify(requestBody),
                signal: controller.signal,
              });
              
              if (fallbackResponse.ok) {
                console.log(`[${requestId}] OpenRouter fallback successful!`);
                providerResponse = fallbackResponse;
                break;
              } else if (fallbackResponse.status === 429) {
                console.warn(`[${requestId}] OpenRouter fallback key also rate limited.`);
                continue;
              } else {
                providerResponse = fallbackResponse;
                break;
              }
            } catch (err) {
              console.error(`[${requestId}] OpenRouter fallback failed:`, err);
            }
          }
        }
      }

      // Fallback for Pollinations rate limits (429) if we have multiple keys
      if (model.provider === 'pollinations' && providerResponse.status === 429) {
        const availableKeys = getPollinationsApiKeys();
        if (availableKeys.length > 1) {
          console.warn(`[${requestId}] Pollinations rate limited (429). Attempting fallback...`);
          
          for (const fallbackKey of availableKeys) {
            if (fallbackKey === providerApiKey) continue;
            
            console.log(`[${requestId}] Trying Pollinations fallback key: ${fallbackKey.substring(0, 4)}...`);
            try {
              const fallbackResponse = await fetch(providerUrl, {
                method: 'POST',
                headers: { ...headers, 'Authorization': `Bearer ${fallbackKey}` },
                body: JSON.stringify(requestBody),
                signal: controller.signal,
              });
              
              if (fallbackResponse.ok) {
                console.log(`[${requestId}] Pollinations fallback successful!`);
                providerResponse = fallbackResponse;
                break;
              } else if (fallbackResponse.status === 429) {
                continue;
              } else {
                providerResponse = fallbackResponse;
                break;
              }
            } catch (err) {
              console.error(`[${requestId}] Pollinations fallback failed:`, err);
            }
          }
        }
      }

      // --- CROSS-PROVIDER FALLBACK ---
      // If we still have a 429 from Pollinations after trying all keys, try Liz as a backup
      if (model.provider === 'pollinations' && providerResponse.status === 429) {
        console.warn(`[${requestId}] Pollinations rate limited after all keys. Trying Liz fallback...`);
        try {
          const lizUrl = `${PROVIDER_URLS.liz}/v1/chat/completions`;
          const lizApiKey = process.env.LIZ_API_KEY || 'sk-d38705df52b386e905f257a4019f8f2a';
          
          const lizResponse = await fetch(lizUrl, {
            method: 'POST',
            headers: { ...headers, 'Authorization': `Bearer ${lizApiKey}` },
            body: JSON.stringify(requestBody),
            signal: controller.signal,
          });
          
          if (lizResponse.ok) {
            console.log(`[${requestId}] Cross-provider fallback to Liz successful!`);
            providerResponse = lizResponse;
          }
        } catch (err) {
          console.error(`[${requestId}] Liz fallback from Pollinations failed:`, err);
        }
      }
      
      // If we still have a 429 from OpenRouter after trying all keys, try another provider
      if (model.provider === 'openrouter' && providerResponse.status === 429) {
        // Fallback for Gemini models to Pollinations
        if (modelId.includes('gemini')) {
          console.warn(`[${requestId}] OpenRouter Gemini rate limited. Trying Pollinations fallback...`);
          try {
            const pollKey = getPollinationsApiKey();
            const pollModelId = modelId.includes('large') || modelId.includes('pro') ? 'gemini-large' : (modelId.includes('lite') ? 'gemini-fast' : 'gemini');
            
            const pollResponse = await fetch(`${PROVIDER_URLS.pollinations}/v1/chat/completions`, {
              method: 'POST',
              headers: { ...headers, 'Authorization': `Bearer ${pollKey}` },
              body: JSON.stringify({ ...requestBody, model: pollModelId }),
              signal: controller.signal,
            });
            
            if (pollResponse.ok) {
              console.log(`[${requestId}] Cross-provider fallback to Pollinations successful!`);
              providerResponse = pollResponse;
            }
          } catch (err) {
            console.error(`[${requestId}] Pollinations fallback failed:`, err);
          }
        }
        
        // Fallback for DeepSeek models to Pollinations
        if (modelId.includes('deepseek') && !providerResponse.ok) {
          console.warn(`[${requestId}] OpenRouter DeepSeek rate limited. Trying Pollinations fallback...`);
          try {
            const pollKey = getPollinationsApiKey();
            const pollResponse = await fetch(`${PROVIDER_URLS.pollinations}/v1/chat/completions`, {
              method: 'POST',
              headers: { ...headers, 'Authorization': `Bearer ${pollKey}` },
              body: JSON.stringify({ ...requestBody, model: 'deepseek' }),
              signal: controller.signal,
            });
            
            if (pollResponse.ok) {
              console.log(`[${requestId}] Cross-provider fallback to Pollinations successful!`);
              providerResponse = pollResponse;
            }
          } catch (err) {
            console.error(`[${requestId}] Pollinations fallback failed:`, err);
          }
        }
      }
      
      if (!providerResponse.ok) {
        const errorText = await providerResponse.text();
        console.error(`[${requestId}] Provider ${model.provider} error (${providerResponse.status}):`, errorText.substring(0, 1000));
        
        // Return the error text if it's JSON, otherwise wrap it
        try {
          const errorJson = JSON.parse(errorText);
          return NextResponse.json(
            { error: `Provider ${model.provider} Error`, details: errorJson, status: providerResponse.status },
            { status: providerResponse.status, headers: getCorsHeaders() }
          );
        } catch (e) {
          return NextResponse.json(
            { error: `Provider ${model.provider} Error`, details: errorText, status: providerResponse.status },
            { status: providerResponse.status, headers: getCorsHeaders() }
          );
        }
      }
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        console.error(`[${requestId}] Provider request timed out after ${PROVIDER_TIMEOUT_MS}ms`);
        return NextResponse.json(
          {
            error: {
              message: 'Request timed out',
              type: 'timeout_error',
              param: null,
              code: 'request_timeout',
              request_id: requestId
            }
          },
          {
            status: 504,
            headers: getCorsHeaders()
          }
        );
      }
      throw fetchError;
    } finally {
      clearTimeout(timeoutId);
    }

    if (!providerResponse.ok) {
      const errorText = await providerResponse.text();
      console.error(`[${requestId}] Provider error from ${model.provider} (${providerResponse.status}):`, errorText.substring(0, 500));
      
      const sanitizedMessage = sanitizeErrorText(errorText);

      // Map unusual status codes to standard ones
      let mappedStatus = providerResponse.status;
      let errorMessage = sanitizedMessage;
      
      if (providerResponse.status === 418) {
        mappedStatus = 503;
        errorMessage = 'The upstream provider is temporarily unavailable. Please try again or use a different model.';
      } else if (providerResponse.status >= 500) {
        errorMessage = sanitizedMessage || 'The upstream provider encountered an error. Please try again later.';
      } else if (providerResponse.status === 401 || providerResponse.status === 403) {
        errorMessage = sanitizedMessage || 'Authentication error with upstream provider.';
      }

      try {
        const errorJson = JSON.parse(errorText);
        return NextResponse.json(errorJson, { 
          status: mappedStatus, 
          headers: getCorsHeaders() 
        });
      } catch (e) {
        return NextResponse.json(
          { 
            error: {
              message: errorMessage,
              type: 'api_error',
              param: null,
              code: 'upstream_error',
              details: sanitizedMessage,
              request_id: requestId,
              original_status: providerResponse.status
            }
          },
          { status: mappedStatus, headers: getCorsHeaders() }
        );
      }
    }

    // Track usage in background if authenticated
    if (apiKeyInfo) {
      // Pass messages for token estimation
      await trackUsage(apiKeyInfo.id, apiKeyInfo.userId, modelId, 'chat', body.messages);
    }

    // Handle streaming response
    if (body.stream) {
      const transformStream = createChatTransformStream(lastMessage, userId, rememberInteraction);

      // Null-safety check for streaming body
      if (!providerResponse.body) {
        console.error(`[${requestId}] Provider returned null body for streaming request`);
        return NextResponse.json(
          {
            error: {
              message: 'Provider returned empty response',
              type: 'api_error',
              param: null,
              code: 'empty_response',
              request_id: requestId
            }
          },
          {
            status: 502,
            headers: getCorsHeaders()
          }
        );
      }
      
      return new NextResponse(providerResponse.body.pipeThrough(transformStream), {
        headers: {
          ...getCorsHeaders(),
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'X-Request-Id': requestId,
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

    const rateLimitInfo = await getRateLimitInfo(effectiveKey, limit, 'chat');
    const dailyLimitInfo = await getDailyLimitInfo(effectiveKey, dailyLimit, apiKeyInfo?.id);
    
    return NextResponse.json(responseData, {
      headers: {
        ...getCorsHeaders(),
        'X-RateLimit-Remaining': String(rateLimitInfo.remaining),
        'X-RateLimit-Reset': String(rateLimitInfo.resetAt),
        'X-RateLimit-Limit': String(rateLimitInfo.limit),
        'X-DailyLimit-Remaining': String(dailyLimitInfo.remaining),
        'X-DailyLimit-Reset': String(dailyLimitInfo.resetAt),
        'X-DailyLimit-Limit': String(dailyLimitInfo.limit),
        'X-Request-Id': requestId,
      },
    });
    
  } catch (error: any) {
    console.error(`[${requestId}] Chat API error:`, error?.message || error);
    return NextResponse.json(
      {
        error: {
          message: 'Internal server error',
          type: 'server_error',
          param: null,
          code: 'internal_error',
          request_id: requestId
        }
      },
      {
        status: 500,
        headers: {
          ...getCorsHeaders(),
          'X-Request-Id': requestId,
        }
      }
    );
  }
}
