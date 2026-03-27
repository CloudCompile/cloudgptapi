import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { extractApiKey, validateApiKey, trackUsage, checkRateLimit, getRateLimitInfo, checkDailyLimit, getDailyLimitInfo, ApiKey, applyPlanOverride, applyPeakHoursLimit } from '@/lib/api-keys';
import { runFandomPlugin } from '@/lib/plugins';
import { CHAT_MODELS, PREMIUM_MODELS } from '@/lib/providers';
import { getCorsHeaders, getPollinationsApiKey, getPollinationsApiKeys, getClaudeApiKey, getClaudeApiKeys, getOpenRouterApiKey, getOpenRouterApiKeys, getPoeApiKey, getPoeApiKeys, getLizApiKey, getLizApiKeys, getOpenAIApiKey, getOpenAIApiKeys, safeResponseJson, hasProAccess } from '@/lib/utils';
import { retrieveMemory, rememberInteraction } from '@/lib/memory';
import { supabaseAdmin } from '@/lib/supabase';
import {
  validateMessages,
  generateRequestId,
  PROVIDER_URLS,
  resolveModelId,
  PROVIDER_MODEL_MAPPING,
  createChatTransformStream,
  PROVIDER_TIMEOUT_MS,
  sanitizeErrorText,
  extractCharacterMetadata,
  generateCharacterId,
  extractUserId,
  estimateTokens
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
  dailyLimit: number,
  isSystemRequest: boolean,
  characterId?: string
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
        'Client-Agent': 'Vetra:1.0:cloudgptapi@github.com',
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
          'Client-Agent': 'Vetra:1.0:cloudgptapi@github.com',
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
          if (apiKeyInfo && !isSystemRequest) {
            const model = CHAT_MODELS.find(m => m.id === modelId);
            const usageWeight = model?.usageWeight || 1;
            await trackUsage(apiKeyInfo.id, apiKeyInfo.userId, modelId, 'chat', body.messages, usageWeight);
          }
          
          // Remember interaction
          const lastUserMessage = body.messages[body.messages.length - 1]?.content || '';
          const shouldRemember = body.use_memory || apiKeyInfo?.fandomPluginEnabled;
          
          if (userId && lastUserMessage && shouldRemember) {
            rememberInteraction(lastUserMessage, generatedText.trim(), userId, characterId).catch(err =>
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
  console.log(`[${requestId}] POST /v1/chat/completions started`);
  
  try {
    // Get user from session (for website users)
    let sessionUserId = null;
    try {
      const { userId } = await auth();
      if (userId) {
        sessionUserId = userId;
        console.log(`[${requestId}] Session User ID: ${sessionUserId}`);
      }
    } catch (authError) {
      console.log(`[${requestId}] Auth context skipped or failed (expected for API keys)`);
    }

    // Extract and validate API key (for API users)
    const rawApiKey = extractApiKey(request.headers);
    console.log(`[${requestId}] Raw API Key: ${rawApiKey ? rawApiKey.substring(0, 10) + '...' : 'none'}`);
    
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
        .maybeSingle();
      
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
    
    // Apply peak hours reduction (5 PM - 5 AM UTC): 50% reduction for RPM only
    // We don't reduce daily limit to avoid locking out users who already used their quota
    limit = applyPeakHoursLimit(limit);
    // dailyLimit remains unchanged during peak hours
    
    // VPS Bypass: Don't count requests from our own VPS against RPD
    const isSystemRequest = clientIp === '157.151.169.121';
    
    // Check Daily Limit First (Skip for internal system requests)
    if (!isSystemRequest && !await checkDailyLimit(effectiveKey, dailyLimit, apiKeyInfo?.id)) {
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

    if (!isSystemRequest && !await checkRateLimit(effectiveKey, limit, 'chat')) {
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
    const hasPro = hasProAccess(userPlan);

    // Diagnostic logging for access issues
    if (isPremium || userPlan !== 'free') {
      console.log(`[${requestId}] Access Check: model=${modelId}, plan=${userPlan}, isPremium=${isPremium}, hasProAccess=${hasPro}`);
    }

    if (isPremium && !hasPro) {
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
    // Priority: 1. Header x-user-id (from API client) 2. Body user/user_id 3. API Key owner 4. Session User 5. IP-based
    const rawUserIdFallback = apiKeyInfo?.userId || sessionUserId || `anonymous-${clientIp}`;
    const userId = extractUserId(request.headers, body, rawUserIdFallback);
    
    // Extract character ID if provided, or automatically generate one from metadata
    // This ensures seamless character switching for frontends like SillyTavern and Chub JAI
    let characterId = request.headers.get('x-character-id') || body.character_id;
    
    if (!characterId) {
      const charMetadata = extractCharacterMetadata(body);
      if (charMetadata) {
        characterId = generateCharacterId(charMetadata);
        console.log(`[${requestId}] Auto-generated characterId: ${characterId} for ${charMetadata.name || 'unknown'}`);
      }
    }

    // Integrate PolliStack Memory
    const lastMessage = body.messages[body.messages.length - 1]?.content || '';
    let memoryContext = '';
    
    try {
      // Only use memory for supported models, if explicitly requested, or if Fandom (Lore Library) plugin is enabled
      const isGeminiLarge = modelId === 'gemini-large';
      const isClaude = modelId.startsWith('claude');
      const isFandomEnabled = apiKeyInfo?.fandomPluginEnabled || false;
      
      if (isGeminiLarge || isClaude || body.use_memory || isFandomEnabled) {
        memoryContext = await retrieveMemory(lastMessage, userId, characterId);
        
        // Build the optimization prompt (concise mode + memory)
        let optimizationPrompt = '';
        if (isGeminiLarge || isClaude) {
          optimizationPrompt += '\n[System Instruction]: Keep responses concise and focused. Limit output to 3-5 paragraphs maximum. Avoid long monologues.';
        }
        
        if (isClaude) {
          optimizationPrompt += ' Do not repeat the user\'s input or previous messages. Start your response directly.';
        }
        
        if (memoryContext && memoryContext !== 'No prior context found.') {
          // Double check memory length one last time before injection
          const safeMemory = memoryContext.length > 2000 ? memoryContext.substring(0, 2000) + '... [Truncated]' : memoryContext;
          optimizationPrompt += `\n\n[Character Memory Context]:\n${safeMemory}`;
        }

        if (optimizationPrompt) {
          // Inject context into messages
          const isGemini = modelId.includes('gemini');
          
          if (isGemini) {
            console.log(`[${requestId}] ADAPTIVE: Injecting memory/optimization as user context for Gemini.`);
            // For Gemini, we find the first user message and prepend the context there,
            // or add it as a separate user message if no user message exists yet.
            const firstUserIndex = body.messages.findIndex((m: any) => m.role === 'user');
            if (firstUserIndex !== -1) {
              body.messages[firstUserIndex].content = `[Context]: ${optimizationPrompt}\n\n${body.messages[firstUserIndex].content}`;
            } else {
              body.messages.push({
                role: 'user',
                content: `[Context]: ${optimizationPrompt}`
              });
            }
          } else {
            const systemMessageIndex = body.messages.findIndex((m: any) => m.role === 'system');
            
            if (systemMessageIndex !== -1) {
              // Cap existing system message if it's too long to prevent model freeze
              const existingContent = body.messages[systemMessageIndex].content;
              if (existingContent.length > 5000) {
                body.messages[systemMessageIndex].content = existingContent.substring(0, 5000) + '... [Original system prompt truncated for performance]';
              }
              body.messages[systemMessageIndex].content += optimizationPrompt;
            } else {
              body.messages.unshift({
                role: 'system',
                content: `You are a helpful assistant with per-character persistent memory.${optimizationPrompt}`
              });
            }
          }
        }
      }

      // --- Remote Fandom Knowledge Plugin ---
      // The VPS service now handles the check for whether the plugin is enabled
      // and performs real scraping of fandom/wiki data.
      console.log(`[${requestId}] Running Remote Fandom Plugin for key: ${apiKeyInfo?.id || 'unknown'}`);
      const originalMessages = [...body.messages];
      
      body.messages = await runFandomPlugin(body.messages, apiKeyInfo?.fandomSettings as any, apiKeyInfo?.id, modelId);
      
      // Model-Adaptive Plugin Injection Logic:
      // If lore was injected, we may need to adjust the message roles for specific models
      if (body.messages.length > originalMessages.length) {
        console.log(`[${requestId}] Fandom Knowledge Plugin injected lore from remote VPS.`);
        
        const isGemini = modelId.includes('gemini');
        if (isGemini) {
          // Gemini is sensitive to multiple system messages or system messages in the middle.
          // We convert newly added system messages to user-visible context notes.
          body.messages = body.messages.map((msg: any, idx: number) => {
            // If this message was NOT in the original array and is a system message
            const isNew = !originalMessages.some(orig => orig.role === msg.role && orig.content === msg.content);
            if (isNew && msg.role === 'system') {
              console.log(`[${requestId}] ADAPTIVE: Converting injected system message to user context for Gemini.`);
              
              // Lore Compression: Gemini models perform better with shorter context notes.
              // We use a token-aware approach to ensure the prompt stays within stable limits.
              let content = msg.content;
              const loreTokens = estimateTokens(content);
              const maxLoreTokens = 800; // ~3200 chars, but safer to use token estimation
              
              if (loreTokens > maxLoreTokens) {
                console.log(`[${requestId}] ADAPTIVE: Compressing long lore snippet (${loreTokens} tokens) for Gemini stability.`);
                // Keep only the first ~800 tokens worth of content
                const targetCharCount = maxLoreTokens * 4;
                content = content.substring(0, targetCharCount) + '... [Lore truncated for stability]';
              }

              return {
                role: 'user',
                content: `[Knowledge Context]: ${content}\n\nPlease use the above information to inform your response.`
              };
            }
            return msg;
          });
        }
      }
      // ------------------------------------------

    } catch (memError) {
      console.error('Memory retrieval failed:', memError);
    }

    // DEBUG: Log the final processed messages for troubleshooting silent failures
    if (modelId === 'gemini-large') {
      console.log(`[${requestId}] FINAL PROCESSED MESSAGES (Count: ${body.messages.length}):`);
      // Log a snippet of each message to avoid huge logs but see the structure
      body.messages.forEach((m: any, i: number) => {
        const snippet = typeof m.content === 'string' ? m.content.substring(0, 200) : '[Non-string content]';
        console.log(`  [${i}] ${m.role}: ${snippet}${m.content?.length > 200 ? '...' : ''}`);
      });
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

    // Maintenance Check
    if (model.downtimeUntil && new Date(model.downtimeUntil).getTime() > Date.now()) {
      const remainingTime = Math.ceil((new Date(model.downtimeUntil).getTime() - Date.now()) / (1000 * 60));
      return NextResponse.json(
        {
          error: {
            message: `Model ${modelId} is currently undergoing maintenance. Expected back in ${remainingTime} minutes.`,
            type: 'maintenance_error',
            param: 'model',
            code: 'model_maintenance',
            request_id: requestId
          }
        },
        { 
          status: 503, 
          headers: {
            ...getCorsHeaders(),
            'Retry-After': String(remainingTime * 60)
          } 
        }
      );
    }

    // Determine provider URL and API key based on model provider
    let providerUrl: string;
    let providerApiKey: string | undefined;
    
    if (model.provider === 'openrouter') {
      providerUrl = `${PROVIDER_URLS.openrouter}/api/v1/chat/completions`;
      providerApiKey = getOpenRouterApiKey();
    } else if (model.provider === 'gemini') {
      providerUrl = `${PROVIDER_URLS.pollinations}/v1/chat/completions`;
      providerApiKey = getPollinationsApiKey();
    } else if (model.provider === 'claude') {
      providerUrl = `${PROVIDER_URLS.pollinations}/v1/chat/completions`;
      providerApiKey = getClaudeApiKey();
    } else if (model.provider === 'meridian') {
      providerUrl = `${PROVIDER_URLS.meridian}/chat`;
      providerApiKey = process.env.MERIDIAN_API_KEY;
    } else if (model.provider === 'github') {
      providerUrl = `${PROVIDER_URLS.github}/chat/completions`;
      providerApiKey = process.env.GITHUB_TOKEN;
      
      if (!providerApiKey) {
        console.warn(`[${requestId}] Missing GitHub token for model: ${modelId}`);
        return NextResponse.json(
          {
            error: {
              message: 'GitHub Models token is not configured. Please add GITHUB_TOKEN to your .env.local file.',
              type: 'config_error',
              param: null,
              code: 'missing_api_key',
              request_id: requestId
            }
          },
          { status: 500, headers: getCorsHeaders() }
        );
      }
    } else if (model.provider === 'poe') {
      providerUrl = `${PROVIDER_URLS.poe}/chat/completions`;
      providerApiKey = getPoeApiKey();
      
      if (!providerApiKey) {
        console.warn(`[${requestId}] Missing Poe API key for model: ${modelId}`);
        return NextResponse.json(
          {
            error: {
              message: 'Poe API key is not configured. Please add POE_API_KEY to your .env.local file.',
              type: 'config_error',
              param: null,
              code: 'missing_api_key',
              request_id: requestId
            }
          },
          { status: 500, headers: getCorsHeaders() }
        );
      }
    } else if (model.provider === 'liz') {
      providerUrl = `${PROVIDER_URLS.liz}/v1/chat/completions`;
      providerApiKey = getLizApiKey();
      
      if (!providerApiKey) {
        console.warn(`[${requestId}] Missing Liz API key for model: ${modelId}`);
        return NextResponse.json(
          {
            error: {
              message: 'Liz API key is not configured. Please add LIZ_API_KEY to your .env.local file.',
              type: 'config_error',
              param: null,
              code: 'missing_api_key',
              request_id: requestId
            }
          },
          { status: 500, headers: getCorsHeaders() }
        );
      }
    } else if (model.provider === 'openai') {
      providerUrl = `${PROVIDER_URLS.openai}/chat/completions`;
      providerApiKey = getOpenAIApiKey();
      
      if (!providerApiKey) {
        console.warn(`[${requestId}] Missing OpenAI API key for model: ${modelId}`);
        return NextResponse.json(
          {
            error: {
              message: 'OpenAI API key is not configured. Please add OPENAI_API_KEY to your .env.local file or use the provided key.',
              type: 'config_error',
              param: null,
              code: 'missing_api_key',
              request_id: requestId
            }
          },
          { status: 500, headers: getCorsHeaders() }
        );
      }
    } else if (model.provider === 'stablehorde') {
      // Handle Stable Horde text generation
      return await handleStableHordeChat(body, modelId, apiKeyInfo, userId, effectiveKey, requestId, limit, dailyLimit, isSystemRequest, characterId);
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
      'X-App-Source': apiKeyInfo ? 'Vetra-API' : 'Vetra-Website',
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

    // Safety cap for max_tokens to prevent "request exceeds max tokens" errors
    // Many providers have limits around 4k-8k for free tiers
    // Gemini models often perform better or require a set max_tokens
    const maxTokensSafetyCap = 4096;
    let defaultMaxTokens = 2048; // Set a sensible default if not provided
    
    // For Gemini Large and Claude Large, we use a more conservative default to prevent truncation in frontends
    if (modelId === 'gemini-large' || modelId === 'claude-large') {
      defaultMaxTokens = body.stream ? 512 : 1024;
      // Force a slightly higher timeout for these models as they can be slow to start
      console.log(`[${requestId}] Setting max_tokens=${defaultMaxTokens} for ${modelId}`);
    }
    
    const effectiveMaxTokens = body.max_tokens ? Math.min(body.max_tokens, maxTokensSafetyCap) : defaultMaxTokens;

    // Fix message sequence for strict providers (like Gemini/Vertex AI)
    let processedMessages = [...body.messages]; // Clone to avoid modifying the original body.messages prematurely
    
    if (Array.isArray(processedMessages) && processedMessages.length > 0) {
      const isGeminiModel = modelId.includes('gemini');
      
      // Strict Sanitization for Gemini Models:
      // Gemini will return a "silent empty stream" or error
      // if the last message is an assistant message.
      if (isGeminiModel) {
        let poppedCount = 0;
        let lastPoppedContent = '';
        
        while (processedMessages.length > 0 && processedMessages[processedMessages.length - 1].role === 'assistant') {
          const lastMsg = processedMessages[processedMessages.length - 1];
          const content = typeof lastMsg.content === 'string' ? lastMsg.content : '';
          
          if (content.trim()) {
            lastPoppedContent = content + (lastPoppedContent ? '\n' + lastPoppedContent : '');
          }
          
          console.log(`[${requestId}] SANITIZER: Popping trailing assistant message to prevent Gemini failure (Model: ${modelId}, Content length: ${content.length})`);
          processedMessages.pop();
          poppedCount++;
        }
        
        if (poppedCount > 0) {
          if (processedMessages.length > 0 && processedMessages[processedMessages.length - 1].role === 'user') {
            // If we have content that was popped, append it to the last user message as context
            if (lastPoppedContent) {
              const lastUserMsg = processedMessages[processedMessages.length - 1];
              console.log(`[${requestId}] SANITIZER: Moving popped assistant content (${lastPoppedContent.length} chars) to last user message for continuity.`);
              lastUserMsg.content = `${lastUserMsg.content}\n\n[Assistant Continuation Context]:\n${lastPoppedContent}`;
            }
          } else {
            console.log(`[${requestId}] SANITIZER: After popping, last message is not 'user'. Adding placeholder to ensure generation.`);
            let content = 'Continue the conversation.';
            if (lastPoppedContent) {
              content = `Continue from this context:\n${lastPoppedContent}`;
            }
            processedMessages.push({ role: 'user', content });
          }
        }
      } else {
        // Standard handling for other models
        const lastMsg = processedMessages[processedMessages.length - 1];
        if (lastMsg.role === 'assistant') {
          if (!lastMsg.content || (typeof lastMsg.content === 'string' && lastMsg.content.trim() === '')) {
            console.log(`[${requestId}] Removing trailing empty assistant message for provider compatibility`);
            processedMessages = processedMessages.slice(0, -1);
          } else {
            console.warn(`[${requestId}] Trailing non-empty assistant message detected for ${modelId}. This may cause provider errors.`);
          }
        }
      }
    }

    // Prepare standard request body with the SANITIZED messages
    const standardBody: any = {
      model: modelId,
      messages: processedMessages,
      temperature: body.temperature ?? 0.7,
      max_tokens: effectiveMaxTokens,
      stream: body.stream ?? false,
      top_p: body.top_p ?? 1,
    };

    // Only add seed if explicitly provided or for specific providers that we know support it well
    if (body.seed !== undefined) {
      standardBody.seed = body.seed;
    } else if (model.provider === 'pollinations' && !modelId.includes('gemini') && !modelId.includes('claude')) {
      // Pollinations supports seed for most models, but Vertex AI (Gemini/Claude) proxies often ignore it or fail
      standardBody.seed = Math.floor(Math.random() * 1000000);
    }

    // Only add these if they are non-zero or explicitly provided, as some Gemini/Claude proxies fail on them
    if (body.frequency_penalty !== undefined && body.frequency_penalty !== 0) {
      standardBody.frequency_penalty = body.frequency_penalty;
    }
    if (body.presence_penalty !== undefined && body.presence_penalty !== 0) {
      standardBody.presence_penalty = body.presence_penalty;
    }

    // Reasoning parameters for models like o1 or deepseek-r1
    if (body.reasoning_effort) standardBody.reasoning_effort = body.reasoning_effort;
    if (body.include_reasoning) standardBody.include_reasoning = body.include_reasoning;
    if (body.reasoning) standardBody.reasoning = body.reasoning;

    // --- OPTIMIZED PROXY LOGIC ---
    if (isHighSpeedModel && !body.stream) {
      console.log(`[${requestId}] Racing fast model: ${modelId}`);
      
      // Prepare body for fast-path (handling Vertex AI restrictions)
      const fastPathBody = { ...standardBody };
      if (modelId.includes('gemini') || modelId.includes('claude')) {
        if (body.top_p !== undefined) {
          delete fastPathBody.temperature;
        } else {
          delete fastPathBody.top_p;
        }
      }

      // Attempt racing across Pollinations and a backup if possible
      // For now, we'll implement a prioritized sequential fetch with a shorter timeout
      // to ensure we get the fastest response without wasting too many resources.
      
      const fastFetch = async (url: string, auth: string) => {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 30000); // 30s timeout for "fast" models
        
        try {
          const res = await fetch(url, {
            method: 'POST',
            headers: {
              ...headers,
              'Authorization': `Bearer ${auth}`
            },
            body: JSON.stringify(fastPathBody),
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
          const data = await safeResponseJson(response, null as any);
          
          // Track usage for fast-path success
          if (apiKeyInfo && !isSystemRequest) {
            const usageWeight = model.usageWeight || 1;
            await trackUsage(apiKeyInfo.id, apiKeyInfo.userId, modelId, 'chat', body.messages, usageWeight);
          }

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
      } catch (e: any) {
        if (e.name === 'AbortError') {
          console.warn(`[${requestId}] Fast-path timeout (30s) for Pollinations, falling back...`);
        } else {
          console.warn(`[${requestId}] Fast-path error for Pollinations:`, e);
        }
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
      headers['HTTP-Referer'] = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      headers['X-Title'] = 'Vetra API';
    }

    // Prepare request body based on provider
    let requestBody = { ...standardBody };
    
    // Apply provider-specific model mapping (e.g., liz-claude-3-opus -> claude-3-opus)
    if (PROVIDER_MODEL_MAPPING[modelId]) {
      console.log(`[${requestId}] Mapping model ID for provider: ${modelId} -> ${PROVIDER_MODEL_MAPPING[modelId]}`);
      requestBody.model = PROVIDER_MODEL_MAPPING[modelId];
    }
    
    if (model.provider === 'meridian') {
      // Meridian expects a simple "prompt" field, not "messages"
      const prompt = body.messages
        .map((msg: any) => `${msg.role}: ${msg.content}`)
        .join('\n');
      requestBody = { prompt };
    } else {
      // Models that don't support temperature/top_p on GitHub
      const isGitHubReasoningModel = model.provider === 'github' && [
        'o1', 'o1-preview', 'o1-mini', 
        'o3', 'o3-mini', 'o4-mini',
        'Phi-4-reasoning', 'Phi-4-mini-reasoning',
        'MAI-DS-R1'
      ].includes(modelId);

      // Vertex AI based models (Gemini/Claude) on Pollinations don't allow both temperature and top_p
      const isVertexModel = 
        (model.provider === 'gemini' || 
        model.provider === 'claude' || 
        modelId.includes('gemini') || 
        modelId.includes('claude')) && 
        model.provider !== 'liz' && 
        model.provider !== 'openrouter';

      if (isGitHubReasoningModel) {
        delete requestBody.temperature;
        delete requestBody.top_p;
        delete requestBody.frequency_penalty;
        delete requestBody.presence_penalty;
      } else if (isVertexModel) {
        // If user provided top_p, use that and remove temperature
        // Otherwise, use temperature and remove top_p
        if (body.top_p !== undefined) {
          delete requestBody.temperature;
        } else {
          delete requestBody.top_p;
        }
      }
    }

    // Forward to provider API
    let providerResponse: Response;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), PROVIDER_TIMEOUT_MS);
    
    try {
      console.log(`[${requestId}] Forwarding to provider: ${model.provider}, URL: ${providerUrl}`);
      // Don't log the full API key, just the prefix
      const keyPrefix = headers['Authorization']?.substring(0, 15) || 'none';
      console.log(`[${requestId}] Auth Header Prefix: ${keyPrefix}`);
      
      providerResponse = await fetch(providerUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      console.log(`[${requestId}] Provider response status: ${providerResponse.status} ${providerResponse.statusText}`);
      
      // Fallback for Pollinations/OpenRouter/Poe/Liz/OpenAI auth errors (401)
      if ((model.provider === 'pollinations' || model.provider === 'gemini' || model.provider === 'claude' || model.provider === 'openrouter' || model.provider === 'poe' || model.provider === 'liz' || model.provider === 'openai') && providerResponse.status === 401) {
        let availableKeys: string[] = [];
        if (model.provider === 'openrouter') {
          availableKeys = getOpenRouterApiKeys();
        } else if (model.provider === 'poe') {
          availableKeys = getPoeApiKeys();
        } else if (model.provider === 'liz') {
          availableKeys = getLizApiKeys();
        } else if (model.provider === 'openai') {
          availableKeys = getOpenAIApiKeys();
        } else if (model.provider === 'claude') {
          availableKeys = getClaudeApiKeys();
        } else {
          availableKeys = getPollinationsApiKeys();
        }

        if (availableKeys.length > 1) {
          console.warn(`[${requestId}] ${model.provider} unauthorized (401). Attempting fallback...`);
          
          for (const fallbackKey of availableKeys) {
            if (fallbackKey === providerApiKey) continue;
            
            console.log(`[${requestId}] Trying ${model.provider} fallback key: ${fallbackKey.substring(0, 4)}...`);
            try {
              const fallbackResponse = await fetch(providerUrl, {
                method: 'POST',
                headers: { ...headers, 'Authorization': `Bearer ${fallbackKey}` },
                body: JSON.stringify(requestBody),
                signal: controller.signal,
              });
              
              if (fallbackResponse.ok) {
                console.log(`[${requestId}] ${model.provider} auth fallback successful!`);
                providerResponse = fallbackResponse;
                providerApiKey = fallbackKey; // Update for future usage if needed
                break;
              }
            } catch (err) {
              console.error(`[${requestId}] ${model.provider} auth fallback failed:`, err);
            }
          }
        }
      }

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
              }
            } catch (err) {
              console.error(`[${requestId}] Pollinations fallback failed:`, err);
            }
          }
        }
      }

      // --- POE FALLBACK LOGIC ---
      // If primary provider failed, check if we can fallback to Poe
      const FALLBACK_TO_POE_MAPPING: Record<string, string> = {
        'deepseek': 'deepseek-v3',
        'mistral': 'mistral-large-2',
        'qwen-coder': 'qwen-2.5-72b-t',
        'gemini': 'gemini-2.5-pro',
        'gemini-large': 'gemini-2.5-pro',
        'gemini-fast': 'gemini-2.5-flash',
        'openai': 'gpt-4o',
        'openai-large': 'gpt-4o',
        'openai-fast': 'gpt-4o-mini',
        'grok': 'grok-4-fast-non-reasoning',
        'claude': 'claude-sonnet-3.5',
        'claude-large': 'claude-opus-4',
      };

      if (!providerResponse.ok && (model.provider === 'pollinations' || model.provider === 'openrouter')) {
        const poeModelId = FALLBACK_TO_POE_MAPPING[modelId] || 
                          (modelId.includes('deepseek') ? 'deepseek-v3' : 
                           modelId.includes('claude') ? 'claude-sonnet-3.5' : 
                           modelId.includes('gpt-4') ? 'gpt-4o' : null);

        if (poeModelId) {
          console.warn(`[${requestId}] Primary provider failed for ${modelId}. Trying Poe fallback to ${poeModelId}...`);
          try {
            const poeKey = getPoeApiKey();
            if (poeKey) {
              const poeResponse = await fetch(`${PROVIDER_URLS.poe}/chat/completions`, {
                method: 'POST',
                headers: { 
                  ...headers, 
                  'Authorization': `Bearer ${poeKey}`,
                  'x-user-id': userId
                },
                body: JSON.stringify({ ...requestBody, model: poeModelId }),
                signal: controller.signal,
              });
              
              if (poeResponse.ok) {
                console.log(`[${requestId}] Poe fallback successful!`);
                providerResponse = poeResponse;
              }
            }
          } catch (err) {
            console.error(`[${requestId}] Poe fallback failed:`, err);
          }
        }
      }
      // --- END POE FALLBACK LOGIC ---

      // Fallback for Gemini models to Pollinations
      if (modelId.includes('gemini') && model.provider === 'openrouter' && providerResponse.status === 429) {
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
        errorMessage = sanitizedMessage || `Authentication error with upstream provider (${model.provider}).`;
      }

      // Try to return the exact JSON from upstream if it's already OpenAI compatible
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.error) {
          return NextResponse.json(errorJson, { 
            status: mappedStatus, 
            headers: getCorsHeaders() 
          });
        }
        
        // Wrap it if it's JSON but not standard OpenAI format
        return NextResponse.json(
          { 
            error: {
              message: errorMessage,
              type: 'api_error',
              param: null,
              code: errorJson.code || 'upstream_error',
              details: errorJson,
              request_id: requestId,
              original_status: providerResponse.status
            }
          },
          { status: mappedStatus, headers: getCorsHeaders() }
        );
      } catch (e) {
        // Fallback for non-JSON errors
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
    if (apiKeyInfo && !isSystemRequest) {
      // Pass messages for token estimation and include usage weight for RPD logic
      const usageWeight = model.usageWeight || 1;
      await trackUsage(apiKeyInfo.id, apiKeyInfo.userId, modelId, 'chat', body.messages, usageWeight);
    }

    // Handle streaming response
    const providerContentType = providerResponse.headers.get('content-type') || '';
    const isStreamingResponse = providerContentType.includes('text/event-stream');
    const acceptHeader = request.headers.get('accept') || '';
    
    // Fallback logic for apps that don't support streaming:
    // 1. If provider didn't return a stream (even if we asked for one)
    // 2. If client explicitly asks for JSON and doesn't mention stream/any
    const clientWantsJsonOnly = acceptHeader.includes('application/json') && 
                                !acceptHeader.includes('text/event-stream') && 
                                !acceptHeader.includes('*/*');

    if (body.stream && isStreamingResponse && !clientWantsJsonOnly) {
      const transformStream = createChatTransformStream(lastMessage, userId, rememberInteraction, characterId, modelId);

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
      
      // Force initial headers and a "kick" event to prevent silent failures in serverless environments
      const headers = {
        ...getCorsHeaders(),
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Request-Id': requestId,
        'X-Accel-Buffering': 'no', // Disable buffering for Nginx/Vercel
      };

      // Create a wrapper stream to send the initial "kick" event
       const kickStream = new ReadableStream({
         async start(controller) {
           // Initial SSE "kick" event - some clients/proxies need this to acknowledge the stream started
           controller.enqueue(new TextEncoder().encode(':\n\n')); 
           
           const reader = providerResponse.body!.pipeThrough(transformStream).getReader();
           
           // Timeout guard for the first token
           let firstTokenReceived = false;
           const timeoutLimit = 15000; // 15 seconds to receive the first chunk
           const streamTimeout = setTimeout(() => {
             if (!firstTokenReceived) {
               console.error(`[${requestId}] STREAM TIMEOUT: No data received from provider after ${timeoutLimit}ms`);
               const timeoutError = {
                 error: {
                   message: "The model is taking too long to respond. Please try again with a shorter prompt.",
                   type: "timeout_error",
                   code: "provider_timeout"
                 }
               };
               controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(timeoutError)}\n\n`));
               controller.enqueue(new TextEncoder().encode(`data: [DONE]\n\n`));
               try { reader.cancel(); } catch (e) {}
               controller.close();
             }
           }, timeoutLimit);

           try {
             while (true) {
               const { done, value } = await reader.read();
               if (done) break;
               
               if (!firstTokenReceived && value.length > 0) {
                 firstTokenReceived = true;
                 clearTimeout(streamTimeout);
                 console.log(`[${requestId}] First stream chunk received successfully.`);
               }
               
               controller.enqueue(value);
             }
           } catch (err) {
             clearTimeout(streamTimeout);
             console.error(`[${requestId}] Stream processing error:`, err);
             // Send a graceful error event if possible
             const errorMessage = err instanceof Error ? err.message : String(err);
             controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ error: { message: `Stream error: ${errorMessage}` } })}\n\n`));
           } finally {
             clearTimeout(streamTimeout);
             try { controller.close(); } catch (e) {}
           }
         }
       });
      
      return new NextResponse(kickStream, { headers });
    }

    // Return JSON response
    const data = await safeResponseJson(providerResponse, null as any);
    
    // DEBUG: Log the raw response from provider
    if (model.provider === 'pollinations' && modelId.includes('gemini')) {
      console.log(`[${requestId}] RAW POLLINATIONS GEMINI RESPONSE:`, JSON.stringify(data, null, 2));
    }
    
    // Transform provider responses to match OpenAI format
    let responseData: any = data;
    
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
              content: (data as any)?.response || '',
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
      if (data && !(data as any).choices && (data as any).content) {
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
                content: (data as any).content,
              },
              finish_reason: 'stop',
            },
          ],
          usage: (data as any).usage || {
            prompt_tokens: 0,
            completion_tokens: 0,
            total_tokens: 0,
          },
        };
      }
      
      // Handle Gemini content_blocks format (code_execution, google_search, etc.)
      if (data && (data as any).choices) {
        for (const choice of (data as any).choices) {
          if (choice.message?.content_blocks && Array.isArray(choice.message.content_blocks)) {
            // Extract text from content_blocks and combine into content field
            let textContent = '';
            for (const block of choice.message.content_blocks) {
              if (block.type === 'text' && block.text) {
                textContent += block.text;
              } else if (block.delta?.text) {
                textContent += block.delta.text;
              } else if (block.type === 'thinking' && block.thinking) {
                textContent += `\n[Thinking]: ${block.thinking}\n`;
              }
            }
            
            // If we extracted text but the content field is empty, populate it
            if (textContent && !choice.message.content) {
              choice.message.content = textContent;
            }
          }
        }
      }
    }
    
    // Ensure object type and model are correct in the final response
    if (responseData) {
      responseData.model = modelId;
      responseData.object = 'chat.completion';
    }
    
    // DEBUG: Check if content is empty
    let assistantContent = responseData?.choices?.[0]?.message?.content || '';
    
    // Automatic response length safeguard for Gemini Large to prevent frontend truncation
    // If the response is exceptionally long (> 12KB), we add a warning/truncation indicator
    if (modelId === 'gemini-large' && assistantContent.length > 12000) {
      console.warn(`[${requestId}] Extremely long response detected (${assistantContent.length} chars). Truncating for frontend compatibility.`);
      assistantContent = assistantContent.substring(0, 12000) + '\n\n[Response truncated by Vetra for frontend compatibility. Use "Continue" to fetch more if supported.]';
      if (responseData.choices[0].message) {
        responseData.choices[0].message.content = assistantContent;
      }
    }

    // --- EMPTY CONTENT FALLBACK ---
    // Gemini models sometimes return empty content if safety filters are triggered 
    // or if the prompt structure is problematic.
    if (!assistantContent && modelId.includes('gemini')) {
      console.error(`[${requestId}] EMPTY CONTENT DETECTED from Gemini! Full response:`, JSON.stringify(responseData, null, 2));
      
      // Provide a graceful fallback instead of an empty response
      const fallbackMessage = "I apologize, but I encountered an issue generating a response for this request. This can sometimes happen with complex prompts or sensitive topics. Please try rephrasing your message or switching to a different model (like OpenAI or Claude).";
      
      if (responseData && responseData.choices && responseData.choices[0] && responseData.choices[0].message) {
        responseData.choices[0].message.content = fallbackMessage;
        responseData.choices[0].finish_reason = 'content_filter';
        assistantContent = fallbackMessage;
      }
    }
    // ------------------------------
    
    // Remember interaction in background
  const isFandomEnabled = apiKeyInfo?.fandomPluginEnabled || false;
  if (userId && lastMessage && (modelId === 'gemini-large' || body.use_memory || isFandomEnabled)) {
       const assistantMessage = assistantContent;
       if (assistantMessage) {
         rememberInteraction(lastMessage, assistantMessage, userId, characterId).catch(err => 
           console.error('Failed to remember interaction:', err)
         );
       }
     }

    const rateLimitInfo = await getRateLimitInfo(effectiveKey, limit, 'chat');
    const dailyLimitInfo = await getDailyLimitInfo(effectiveKey, dailyLimit, apiKeyInfo?.id);
    
    return NextResponse.json(responseData || { error: 'Empty response from provider' }, {
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
