import { NextRequest, NextResponse } from 'next/server';
import { trackUsage, getRateLimitInfo, getDailyLimitInfo, checkRateLimit, checkDailyLimit, ApiKey, getModelUsageWeight } from '@/lib/api-keys';
import { waitUntil } from '@vercel/functions';
import {
  PROVIDER_URLS,
  PROVIDER_MODEL_MAPPING,
  createChatTransformStream,
  PROVIDER_TIMEOUT_MS,
  sanitizeErrorText,
  BLUESMINDS_MODEL_MAPPING,
  getBluesmindsModelId,
  getBlazeAiModelId,
  getMinoModelId
} from '@/lib/chat-utils';
import { CHAT_MODELS, ULTRA_MODELS, ADMIN_ONLY_MODELS } from '@/lib/providers';
import {
  getCorsHeaders, getPollinationsApiKey,
  getClaudeApiKey,
  getPoeApiKey,
  getLizApiKey,
  getKivestApiKey,
  getOpenRouterApiKeys,
  getOpenAIApiKey,
  getAquaApiKey,
  getBluesmindsApiKey,
  getBluesmindsApiKeys,
  getRandomBluesmindsApiKey,
  getBlazeAiApiKey,
  getGroqApiKey,
  getCerebrasApiKey,
  getElevenLabsApiKey,
  safeResponseJson
} from '@/lib/utils';
import { rememberInteraction } from '@/lib/memory';

function getSecureRandomIndex(maxExclusive: number): number {
  if (maxExclusive <= 1) return 0;
  const maxUint32 = 0x100000000;
  const unbiasedLimit = maxUint32 - (maxUint32 % maxExclusive);
  const randomBytes = new Uint32Array(1);

  while (true) {
    crypto.getRandomValues(randomBytes);
    const value = randomBytes[0];
    if (value < unbiasedLimit) {
      return value % maxExclusive;
    }
  }
}

function secureShuffleArray<T>(items: T[]): T[] {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = getSecureRandomIndex(i + 1);
    const temp = shuffled[i];
    shuffled[i] = shuffled[j];
    shuffled[j] = temp;
  }
  return shuffled;
}

function generateRotatingIp(): string {
  const octet = () => getSecureRandomIndex(256);
  return `${octet()}.${octet()}.${octet()}.${octet()}`;
}

function generateHardwareSignature(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

export interface DispatchOptions {
  request: NextRequest;
  body: any;
  processedMessages: any[];
  modelId: string;
  model: any;
  requestId: string;
  userId: string;
  characterId: string;
  apiKeyInfo: ApiKey | null;
  effectiveKey: string;
  limit: number;
  dailyLimit: number;
  isSystemRequest: boolean;
  lastMessage: string;
}

export async function dispatchChatRequest(options: DispatchOptions): Promise<NextResponse> {
  const {
    request, body, processedMessages, modelId, model, requestId,
    userId, characterId, apiKeyInfo, effectiveKey, limit, dailyLimit,
    isSystemRequest, lastMessage
  } = options;

  const startTime = Date.now();
  const cloudflareGatewayUrl = process.env.CF_AI_GATEWAY_CHAT_COMPLETIONS_URL;
  const cloudflareGatewayToken = process.env.CF_AIG_TOKEN;
  const isCloudflareGatewayEnabled = Boolean(cloudflareGatewayToken && cloudflareGatewayUrl?.trim());
  let providerUrl: string;
  let providerApiKey: string | undefined;
  let openRouterCandidateKeys: string[] = [];
  let providerDailyLimit = dailyLimit;
  let providerPerMinuteLimit = limit;

  // Models that can be routed to Aqua API (primary)
  const aquaModels = new Set([
    // Aqua standard tier (free)
    'gpt-5', 'gemini-2.5', 'gemini-3', 'grok', 'nova', 'haiku-4.5', 'grok-4.1-thinking',
    'gpt-oss', 'minimax', 'glm-5', 'deepseek-v3', 'deepseek-v3.2', 'deepseek-v3.1',
    'kimi-k2', 'kimi-k2.5', 'qwen', 'qwen-3.5', 'mistral', 'step-3.5', 'grok-4.2',
    'llama-4', 'gemini-3.1-lite', 'nemotron', 'llama-3.1', 'minimax-m2.7', 'gpt-5.4-mini',
    'glm-5.1', 'mimo-omni',
    // Aqua premium tier
    'gpt-5.1', 'gpt-5.2', 'gpt-5.2-codex', 'gpt-5.3-codex', 'gpt-5.3-spark', 'gpt-5.4',
    'gemini-2.5-pro', 'gemini-3.1-pro', 'sonnet-4.5', 'sonnet-4.6', 'opus-4.5', 'opus-4.6',
    'mimo-pro', 'deepseek-v3-0324', 'deepseek-v3.1-terminus',
    // xAI Grok models (existing)
    'grok-3', 'grok-4', 'grok-4.1', 'grok-4.2',
    // Kimi/Moonshot models (existing via Kivest)
    'kimi-k2-instruct-0905',
    // Claude models (via Aqua)
    'claude-opus-4-6', 'claude-opus-4.5', 'claude-sonnet-4-6', 'claude-sonnet-4.5', 'claude-sonnet-4.6',
    'claude-sonnet-4.5-20250929', 'claude-haiku-4.5', 'claude-3-haiku', 'claude-3-7-sonnet',
    // OpenAI models
    'gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo',
    // Google models
    'gemini-2.5-flash', 'gemini-3-flash-preview', 'gemini-3-pro-preview',
    'gemini-3.1-flash-preview', 'gemini-3.1-pro-preview', 'gemma-3-12b', 'gemma-2-9b', 'gemma-2b',
    // DeepSeek models
    'deepseek-v3.2', 'deepseek-v3.1', 'deepseek-chat', 'deepseek-reasoner', 'deepseek-r1-0528',
    // Meta models
    'llama-3.1-405b', 'llama-3.1-70b', 'llama-3.1-8b', 'llama-3.3-70b', 'llama-4-maverick', 'llama-4-scout',
    // Mistral models
    'mistral-large', 'mistral-large-3', 'mistral-small-24b', 'mistral-small-4', 'codestral', 'devstral',
    // Qwen models
    'qwen3.5-plus', 'qwen3.5-flash', 'qwen3-32b', 'qwen3-next-80b', 'qwen3-next-80b-thinking',
    // MiniMax models
    'minimax-m2.5', 'minimax-m2.7', 'minimax-m2', 'minimax-m2.1',
    // Microsoft models
    'phi-4-mini', 'phi-4', 'phi-4-multimodal', 'phi-3.5-mini', 'phi-3-mini',
    // NVIDIA models
    'nemotron-3-nano', 'nemotron-4-mini', 'nemotron-4', 'nemotron-super',
    // StepFun
    'step-3.5-flash',
  ]);

  // Models that can fallback to Bluesminds when Aqua fails (Premium & Ultra models)
  const bluesmindsFallbackModels = new Set([
    // Ultra models - most critical for fallback
    'gpt-5.1', 'gpt-5.2', 'gpt-5.2-codex', 'gpt-5.3-codex', 'gpt-5.3-spark', 'gpt-5.4',
    'claude-opus-4-6', 'claude-opus-4.5', 'claude-sonnet-4.6', 'claude-sonnet-4.5',
    'claude-sonnet-4.5-20250929', 'gemini-2.5-pro', 'gemini-3.1-pro',
    'glm-5.1', 'mimo-pro',
    // Premium models - also fallback to Bluesminds
    'gpt-5', 'gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo',
    'claude-haiku-4.5', 'claude-3-haiku', 'claude-3-7-sonnet',
    'gemini-2.5-flash', 'gemini-3-flash-preview', 'gemini-3-pro-preview',
    'gemini-3.1-flash-preview', 'gemini-3.1-pro-preview',
    'deepseek-v3.2', 'deepseek-v3.1', 'deepseek-chat', 'deepseek-reasoner', 'deepseek-r1-0528',
    'llama-3.1-405b', 'llama-3.1-70b', 'llama-3.1-8b', 'llama-3.3-70b', 'llama-4-maverick', 'llama-4-scout',
    'mistral-large', 'mistral-large-3', 'mistral-small-24b', 'mistral-small-4', 'codestral', 'devstral',
    'qwen3.5-plus', 'qwen3.5-flash', 'qwen3-32b', 'qwen3-next-80b', 'qwen3-next-80b-thinking',
    'minimax-m2.5', 'minimax-m2.7', 'minimax-m2', 'minimax-m2.1',
    'glm-4.6',
    'phi-4-mini', 'phi-4', 'phi-4-multimodal', 'phi-3.5-mini', 'phi-3-mini',
    'nemotron-3-nano', 'nemotron-4-mini', 'nemotron-4', 'nemotron-super',
    'step-3.5-flash',
    'grok-3', 'grok-4', 'grok-4.2',
    'kimi-k2.5', 'kimi-k2-instruct-0905',
    'gemma-3-12b', 'gemma-2-9b', 'gemma-2b',
  ]);

  // Ultra models that can fallback to Kivest when both Aqua & Bluesminds fail
  const ultraModelsWithKivest = new Set([
    'gpt-5.4', 'gpt-5.3-codex', 'gpt-5.3-spark', 'gpt-5.2-codex', 'gpt-5.2', 'gpt-5.1',
    'claude-sonnet-4.6', 'claude-sonnet-4-5', 'claude-opus-4-6', 'claude-opus-4-5',
    'gemini-2.5-pro', 'gemini-3.1-pro',
    'glm-5.1', 'mimo-pro'
  ]);

  // Determine routing: Aqua primary, Bluesminds fallback for Premium/Ultra
  if (aquaModels.has(modelId)) {
    // Primary: Aqua
    providerUrl = `${PROVIDER_URLS.aqua}/chat/completions`;
    
    // Ultra and Admin-only models get AQUA_API_KEY_2, free/non-ultra models get AQUA_API_KEY_1 only
    if (ULTRA_MODELS.has(modelId) || ADMIN_ONLY_MODELS.has(modelId)) {
      providerApiKey = process.env.AQUA_API_KEY_2;
      console.log(`[${requestId}] Aqua: using AQUA_API_KEY_2 for ultra/admin model: ${modelId}`);
    } else {
      providerApiKey = process.env.AQUA_API_KEY;
      console.log(`[${requestId}] Aqua: using AQUA_API_KEY_1 for model: ${modelId}`);
    }
    if (!providerApiKey) {
      console.warn(`[${requestId}] Missing Aqua API key for model: ${modelId}`);
      return NextResponse.json(
        { error: { message: 'Aqua API key is not configured.', type: 'config_error', param: null, code: 'missing_api_key', request_id: requestId } },
        { status: 500, headers: getCorsHeaders() }
      );
    }
  } else if (model.provider === 'openrouter') {
    providerUrl = `${PROVIDER_URLS.openrouter}/api/v1/chat/completions`;
    providerDailyLimit = 50;
    providerPerMinuteLimit = 20;

    openRouterCandidateKeys = getOpenRouterApiKeys();
    if (openRouterCandidateKeys.length === 0) {
      console.warn(`[${requestId}] Missing OpenRouter API key for model: ${modelId}`);
      return NextResponse.json(
        { error: { message: 'OpenRouter API key is not configured.', type: 'config_error', param: null, code: 'missing_api_key', request_id: requestId } },
        { status: 500, headers: getCorsHeaders() }
      );
    }

    const shuffledKeys = secureShuffleArray(openRouterCandidateKeys);
    for (const key of shuffledKeys) {
      const minuteOk = await checkRateLimit(key, providerPerMinuteLimit, 'chat:openrouter');
      if (!minuteOk) continue;
      const dailyOk = await checkDailyLimit(key, providerDailyLimit);
      if (!dailyOk) continue;
      providerApiKey = key;
      break;
    }

    if (!providerApiKey) {
      const firstKey = shuffledKeys[0];
      if (!firstKey) {
        return NextResponse.json(
          { error: { message: 'OpenRouter API key is not configured.', type: 'config_error', param: null, code: 'missing_api_key', request_id: requestId } },
          { status: 500, headers: getCorsHeaders() }
        );
      }
      const minuteInfo = await getRateLimitInfo(firstKey, providerPerMinuteLimit, 'chat:openrouter');
      const dailyInfo = await getDailyLimitInfo(firstKey, providerDailyLimit);
      return NextResponse.json(
        {
          error: {
            message: `All OpenRouter keys are currently rate-limited (${providerPerMinuteLimit} RPM / ${providerDailyLimit} RPD per key). Please retry shortly.`,
            type: 'requests',
            param: null,
            code: 'openrouter_keys_rate_limited',
            request_id: requestId
          }
        },
        {
          status: 429,
          headers: {
            ...getCorsHeaders(),
            'X-RateLimit-Remaining': String(minuteInfo.remaining),
            'X-RateLimit-Reset': String(minuteInfo.resetAt),
            'X-RateLimit-Limit': String(minuteInfo.limit),
            'X-DailyLimit-Remaining': String(dailyInfo.remaining),
            'X-DailyLimit-Reset': String(dailyInfo.resetAt),
            'X-DailyLimit-Limit': String(dailyInfo.limit),
          },
        }
      );
    }
  } else if (model.provider === 'pollinations') {
    providerUrl = `${PROVIDER_URLS.pollinations}/v1/chat/completions`;
    providerApiKey = getPollinationsApiKey();
    if (!providerApiKey) {
      console.warn(`[${requestId}] Missing Pollinations API key for model: ${modelId}`);
      return NextResponse.json(
        { error: { message: 'Pollinations API key is not configured.', type: 'config_error', param: null, code: 'missing_api_key', request_id: requestId } },
        { status: 500, headers: getCorsHeaders() }
      );
    }
  } else if (model.provider === 'kivest') {
    providerUrl = `${PROVIDER_URLS.kivest}/chat/completions`;
    providerApiKey = getKivestApiKey();
    if (!providerApiKey) {
      console.warn(`[${requestId}] Missing Kivest API key for model: ${modelId}`);
      return NextResponse.json(
        { error: { message: 'Kivest API key is not configured.', type: 'config_error', param: null, code: 'missing_api_key', request_id: requestId } },
        { status: 500, headers: getCorsHeaders() }
      );
    }
  } else if (model.provider === 'zhipu') {
    // GLM models route via Bluesminds
    providerUrl = `${PROVIDER_URLS.shalom}/chat/completions`;
    providerApiKey = getBluesmindsApiKey();
    if (!providerApiKey) {
      console.warn(`[${requestId}] Missing Bluesminds API key for model: ${modelId}`);
      return NextResponse.json(
        { error: { message: 'Bluesminds API key is not configured.', type: 'config_error', param: null, code: 'missing_api_key', request_id: requestId } },
        { status: 500, headers: getCorsHeaders() }
      );
    }
    console.log(`[${requestId}] Zhipu: routing ${modelId} to Bluesminds`);
  } else if (model.provider === 'mino') {
    // Mino has multiple endpoints based on model type
    const minoModelId = getMinoModelId(modelId);
    if (modelId.startsWith('glm-4') || modelId.startsWith('glm-5')) {
      // GLM models use /x/zai/ endpoint
      providerUrl = `${PROVIDER_URLS.mino}/x/zai/chat/completions`;
    } else if (modelId.startsWith('deepseek-')) {
      // DeepSeek models use /x/deepseek/ endpoint
      providerUrl = `${PROVIDER_URLS.mino}/x/deepseek/chat/completions`;
    } else {
      // Qwen and others use /x/qwen/ endpoint
      providerUrl = `${PROVIDER_URLS.mino}/x/qwen/chat/completions`;
    }
    console.log(`[${requestId}] Mino: routing ${modelId} to ${providerUrl}`);
  } else if (model.provider === 'groq') {
    providerUrl = `${PROVIDER_URLS.groq}/chat/completions`;
    providerApiKey = getGroqApiKey();
    if (!providerApiKey) {
      console.warn(`[${requestId}] Missing Groq API key for model: ${modelId}`);
      return NextResponse.json(
        { error: { message: 'Groq API key is not configured.', type: 'config_error', param: null, code: 'missing_api_key', request_id: requestId } },
        { status: 500, headers: getCorsHeaders() }
      );
    }
  } else if (model.provider === 'cerebras') {
    providerUrl = `${PROVIDER_URLS.cerebras}/chat/completions`;
    providerApiKey = getCerebrasApiKey();
    if (!providerApiKey) {
      console.warn(`[${requestId}] Missing Cerebras API key for model: ${modelId}`);
      return NextResponse.json(
        { error: { message: 'Cerebras API key is not configured.', type: 'config_error', param: null, code: 'missing_api_key', request_id: requestId } },
        { status: 500, headers: getCorsHeaders() }
      );
    }
  } else if (model.provider === 'elevenlabs') {
    // ElevenLabs is a TTS provider - not a chat completions provider
    return NextResponse.json(
      { error: { message: 'ElevenLabs models are text-to-speech only and do not support chat completions. Use the /v1/audio/speech endpoint instead.', type: 'invalid_request_error', param: 'model', code: 'unsupported_for_provider', request_id: requestId } },
      { status: 400, headers: getCorsHeaders() }
    );
  } else {
    // Fallback or Unknown provider
    return NextResponse.json(
      { error: { message: 'Unsupported provider: ' + model.provider, type: 'config_error', param: null, code: 'unsupported_provider', request_id: requestId } },
      { status: 400, headers: getCorsHeaders() }
    );
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-App-Source': apiKeyInfo ? 'Vetra-API' : 'Vetra-Website',
    ...(providerApiKey && { 'Authorization': `Bearer ${providerApiKey}` }),
  };
  if (model.provider === 'openrouter') {
    headers['HTTP-Referer'] = process.env.NEXT_PUBLIC_APP_URL || 'https://vetraai.vercel.app';
    headers['X-Title'] = 'Vetra';
    const initialIp = generateRotatingIp();
    headers['X-Forwarded-For'] = initialIp;
    headers['X-Real-IP'] = initialIp;
    headers['CF-Connecting-IP'] = initialIp;
    headers['X-Hardware-Signature'] = generateHardwareSignature();
  }
  headers['x-user-id'] = userId;

  const isHighSpeedModel = [
     'openai', 'openai-fast', 'gemini-fast', 'gemini', 'deepseek',
     'google/gemini-2.0-flash-exp:free', 'google/gemini-2.0-flash-exp',
     'deepseek/deepseek-chat', 'deepseek/deepseek-v3'
  ].includes(modelId);

  const maxTokensSafetyCap = 4096;
  let defaultMaxTokens = 2048;
  if (modelId === 'gemini-large' || modelId === 'claude-large') {
    defaultMaxTokens = body.stream ? 512 : 1024;
    console.log(`[${requestId}] Setting max_tokens=${defaultMaxTokens} for ${modelId}`);
  }
  const effectiveMaxTokens = body.max_tokens ? Math.min(body.max_tokens, maxTokensSafetyCap) : defaultMaxTokens;

  let providerMessages = processedMessages;
  if (model.provider === 'openrouter') {
    providerMessages = processedMessages.map((message: any) => {
      if (message?.role === 'developer') {
        return { ...message, role: 'system' };
      }
      return message;
    });
  }

  const standardBody: any = {
    model: PROVIDER_MODEL_MAPPING[modelId] || modelId,
    messages: providerMessages,
    temperature: body.temperature ?? 0.7,
    max_tokens: effectiveMaxTokens,
    stream: body.stream ?? false,
    top_p: body.top_p ?? 1,
  };
  console.log(`[${requestId}] Model mapping: ${modelId} -> ${standardBody.model}`);

  // Estimate input tokens and truncate if exceeds provider limit (200k chars / 4 ≈ 50k tokens)
  // Use 180k to leave buffer for headers/model overhead
  const MAX_PROVIDER_CHARS = 180000;
  const totalInputChars = JSON.stringify(standardBody.messages).length;
  if (totalInputChars > MAX_PROVIDER_CHARS) {
    console.log(`[${requestId}] Input too long (${totalInputChars} chars), truncating from ${MAX_PROVIDER_CHARS}...`);
    // Keep system message if present, truncate from oldest messages
    const systemMsgIdx = standardBody.messages.findIndex((m: any) => m.role === 'system');
    if (systemMsgIdx !== -1) {
      const systemMsg = standardBody.messages[systemMsgIdx];
      const otherMessages = standardBody.messages.filter((_: any, i: number) => i !== systemMsgIdx);
      const allowedChars = MAX_PROVIDER_CHARS - JSON.stringify(systemMsg).length - 100;
      let usedChars = 0;
      const kept: any[] = [];
      for (let i = otherMessages.length - 1; i >= 0; i--) {
        const msgJson = JSON.stringify(otherMessages[i]);
        if (usedChars + msgJson.length > allowedChars) break;
        kept.unshift(otherMessages[i]);
        usedChars += msgJson.length;
      }
      standardBody.messages = [systemMsg, ...kept];
      console.log(`[${requestId}] Truncated to ${standardBody.messages.length} messages (${usedChars} chars) from ${totalInputChars} chars`);
    } else {
      const allowedChars = MAX_PROVIDER_CHARS - 100;
      let usedChars = 0;
      const kept: any[] = [];
      for (let i = standardBody.messages.length - 1; i >= 0; i--) {
        const msgJson = JSON.stringify(standardBody.messages[i]);
        if (usedChars + msgJson.length > allowedChars) break;
        kept.unshift(standardBody.messages[i]);
        usedChars += msgJson.length;
      }
      standardBody.messages = kept;
    }
  }

  // Strip provider prefix for Groq and Cerebras (e.g. "groq/llama3-8b-8192" -> "llama3-8b-8192")
  if (model.provider === 'groq' || model.provider === 'cerebras') {
    const slashIdx = standardBody.model.indexOf('/');
    if (slashIdx !== -1) {
      standardBody.model = standardBody.model.substring(slashIdx + 1);
    }
  }

  // Track actual model ID used (for Bluesminds mapping)
  let actualModelId = standardBody.model;
  
  // If routing to Bluesminds, use the mapped model ID
  if (providerUrl.includes('bluesminds') || providerUrl.includes('shalom')) {
    const mappedModelId = getBluesmindsModelId(modelId);
    standardBody.model = mappedModelId;
    actualModelId = mappedModelId;
  }

  if (body.seed !== undefined) {
    standardBody.seed = body.seed;
  } else if (model.provider === 'pollinations' && !modelId.includes('gemini') && !modelId.includes('claude')) {
    standardBody.seed = getSecureRandomIndex(1000000);
  }

  if (body.frequency_penalty !== undefined && body.frequency_penalty !== 0) standardBody.frequency_penalty = body.frequency_penalty;
  if (body.presence_penalty !== undefined && body.presence_penalty !== 0) standardBody.presence_penalty = body.presence_penalty;
  if (body.reasoning_effort) standardBody.reasoning_effort = body.reasoning_effort;
  if (body.include_reasoning) standardBody.include_reasoning = body.include_reasoning;
  if (body.reasoning) standardBody.reasoning = body.reasoning;

  if (isHighSpeedModel && !body.stream) {
    console.log(`[${requestId}] Racing fast model: ${modelId}`);
    const fastPathBody = { ...standardBody };
    if (modelId.includes('gemini') || modelId.includes('claude')) {
      if (body.top_p !== undefined) delete fastPathBody.temperature;
      else delete fastPathBody.top_p;
    }

    const fastFetch = async (url: string, auth: string) => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { ...headers, 'Authorization': `Bearer ${auth}` },
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
      const fastPathUrl = `${PROVIDER_URLS.pollinations}/v1/chat/completions`;
      const pollKey = getPollinationsApiKey();
      const startTime = Date.now();
      if (!pollKey) {
        console.warn(`[${requestId}] Fast-path skipped: no Pollinations API key available`);
        throw new Error('No Pollinations API key configured');
      }
      const response = await fastFetch(fastPathUrl, pollKey);
      
      if (response.ok) {
        console.log(`[${requestId}] Fast-path success: ${Date.now() - startTime}ms via Pollinations`);
        const data = await safeResponseJson(response, null as any);
        if (apiKeyInfo && !isSystemRequest) {
          const usageWeight = getModelUsageWeight(modelId);
          waitUntil(trackUsage(apiKeyInfo.id, apiKeyInfo.userId, modelId, 'chat', body.messages, usageWeight));
        }
        const fastPathIsFandomEnabled = apiKeyInfo?.fandomPluginEnabled || false;
        const fastPathIsMemoryEnabled = Boolean(apiKeyInfo?.fandomSettings?.plugins?.memory?.enabled);
        if (userId && lastMessage && (body.use_memory || fastPathIsFandomEnabled || fastPathIsMemoryEnabled)) {
          const fastPathContent = data?.choices?.[0]?.message?.content || '';
          if (fastPathContent) {
            rememberInteraction(lastMessage, fastPathContent, userId, characterId).catch(err =>
              console.error(`[${requestId}] Failed to remember fast-path interaction:`, err)
            );
          }
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
      if (e.name === 'AbortError') console.warn(`[${requestId}] Fast-path timeout (30s) for Pollinations, falling back...`);
      else console.warn(`[${requestId}] Fast-path error for Pollinations:`, e);
    }
  }

  // Make the actual request to the provider
  let providerResponse: Response | null = null;
  try {
    if (model.provider === 'openrouter' && openRouterCandidateKeys.length > 1) {
      const fallbackStatuses = new Set([401, 403, 429, 500, 502, 503, 504]);
      const keyOrder = providerApiKey
        ? [providerApiKey, ...openRouterCandidateKeys.filter(key => key !== providerApiKey)]
        : [...openRouterCandidateKeys];
      let lastNetworkError: any = null;

      for (let i = 0; i < keyOrder.length; i++) {
        const attemptKey = keyOrder[i];
        const attemptIp = generateRotatingIp();
        const attemptHeaders = {
          ...headers,
          Authorization: `Bearer ${attemptKey}`,
          'X-Forwarded-For': attemptIp,
          'X-Real-IP': attemptIp,
          'CF-Connecting-IP': attemptIp,
          'X-Hardware-Signature': generateHardwareSignature(),
        };

        try {
          const response = await fetch(providerUrl, {
            method: 'POST',
            headers: attemptHeaders,
            body: JSON.stringify(standardBody),
            signal: AbortSignal.timeout(PROVIDER_TIMEOUT_MS)
          });

          providerResponse = response;
          providerApiKey = attemptKey;

          if (response.ok) break;

          if (!fallbackStatuses.has(response.status) || i === keyOrder.length - 1) {
            break;
          }

          console.warn(`[${requestId}] OpenRouter key attempt ${i + 1}/${keyOrder.length} failed with ${response.status}; rotating key...`);
        } catch (fetchError: any) {
          lastNetworkError = fetchError;
          if (i === keyOrder.length - 1) {
            throw fetchError;
          }
          console.warn(`[${requestId}] OpenRouter key attempt ${i + 1}/${keyOrder.length} network error; rotating key...`);
        }
      }

      if (!providerResponse) {
        throw lastNetworkError || new Error('OpenRouter request failed');
      }
    } else {
      providerResponse = await fetch(providerUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(standardBody),
        signal: AbortSignal.timeout(PROVIDER_TIMEOUT_MS)
      });
    }
  } catch (fetchError: any) {
    console.error(`[${requestId}] Fetch error for ${model.provider}:`, fetchError);
    return NextResponse.json(
      { error: { message: `Failed to connect to provider: ${fetchError.message}`, type: 'network_error', param: null, code: 'fetch_failed', request_id: requestId } },
      { status: 502, headers: getCorsHeaders() }
    );
  }

  if (!providerResponse) {
    return NextResponse.json(
      { error: { message: 'Provider returned no response', type: 'network_error', param: null, code: 'empty_provider_response', request_id: requestId } },
      { status: 502, headers: getCorsHeaders() }
    );
  }

  if (!providerResponse.ok) {
    const errorText = await providerResponse.text();
    console.error(`[${requestId}] Provider error from ${model.provider} (${providerResponse.status}):`, errorText.substring(0, 500));

    // Check if we should fallback to Kivest for Ultra models when both Aqua AND Bluesminds fail
    // This applies when: Aqua failed OR Bluesminds (fallback) failed, and model is Ultra
    const isAquaFailed = providerUrl.includes('aquadevs') && !providerResponse.ok;
    const isBluesmindsFailed = providerUrl.includes('bluesminds') && !providerResponse.ok;
    const canFallbackToKivest = (isAquaFailed || isBluesmindsFailed) && ultraModelsWithKivest.has(modelId);
    
    if (canFallbackToKivest && (providerResponse.status === 429 || providerResponse.status === 401 || providerResponse.status === 403 || providerResponse.status >= 500)) {
      console.log(`[${requestId}] Both Aqua and Bluesminds failed for ${modelId}, falling back to Kivest...`);
      
      const kivestUrl = `${PROVIDER_URLS.kivest}/chat/completions`;
      const kivestApiKey = getKivestApiKey();
      
      if (kivestApiKey) {
        const fallbackBody = {
          ...standardBody,
          model: modelId
        };

        try {
          const fallbackResponse = await fetch(kivestUrl, {
            method: 'POST',
            headers: {
              ...headers,
              'Authorization': `Bearer ${kivestApiKey}`
            },
            body: JSON.stringify(fallbackBody),
            signal: AbortSignal.timeout(PROVIDER_TIMEOUT_MS)
          });

          if (fallbackResponse.ok) {
            console.log(`[${requestId}] Kivest fallback succeeded for ${modelId}`);
            providerResponse = fallbackResponse;
          } else {
            const fallbackErrorText = await fallbackResponse.text();
            console.error(`[${requestId}] Kivest fallback also failed:`, fallbackErrorText.substring(0, 300));
          }
        } catch (fallbackError: any) {
          console.error(`[${requestId}] Kivest fallback fetch error:`, fallbackError);
        }
      }
    }

    // Check if we should fallback to BlazeAI for glm-5 on Aqua failure
    const blazeAiFallbackModels = new Set(['glm-5']);
    const canFallbackToBlazeAi = blazeAiFallbackModels.has(modelId) && providerUrl.includes('aquadevs');
    
    if (canFallbackToBlazeAi) {
      console.log(`[${requestId}] Aqua failed for ${modelId}, falling back to BlazeAI...`);
      
      const blazeAiUrl = `${PROVIDER_URLS.blazeai}/chat/completions`;
      const blazeAiApiKey = getBlazeAiApiKey();
      const blazeAiModelId = getBlazeAiModelId(modelId);
      
      if (blazeAiApiKey) {
        const fallbackBody = {
          ...standardBody,
          model: blazeAiModelId
        };

        try {
          const fallbackResponse = await fetch(blazeAiUrl, {
            method: 'POST',
            headers: {
              ...headers,
              'Authorization': `Bearer ${blazeAiApiKey}`
            },
            body: JSON.stringify(fallbackBody),
            signal: AbortSignal.timeout(PROVIDER_TIMEOUT_MS)
          });

          if (fallbackResponse.ok) {
            console.log(`[${requestId}] BlazeAI fallback succeeded for ${modelId}`);
            providerResponse = fallbackResponse;
            actualModelId = blazeAiModelId;
          } else {
            const fallbackErrorText = await fallbackResponse.text();
            console.error(`[${requestId}] BlazeAI fallback also failed:`, fallbackErrorText.substring(0, 300));
          }
        } catch (fallbackError: any) {
          console.error(`[${requestId}] BlazeAI fallback fetch error:`, fallbackError);
        }
      }
    }

    // Fallback from Aqua to Bluesminds when Aqua fails (for Premium & Ultra models)
    const canFallbackToBluesminds = aquaModels.has(modelId) && bluesmindsFallbackModels.has(modelId) && providerUrl.includes('aquadevs');
    
    if (canFallbackToBluesminds && !providerResponse.ok) {
      console.log(`[${requestId}] Aqua failed for ${modelId}, falling back to Bluesminds...`);
      
      const bluesmindsUrl = `${PROVIDER_URLS.shalom}/chat/completions`;
      const bluesmindsApiKey = getRandomBluesmindsApiKey();
      const bluesmindsModelId = getBluesmindsModelId(modelId);
      
      if (bluesmindsApiKey) {
        const fallbackBody = {
          ...standardBody,
          model: bluesmindsModelId
        };

        try {
          const fallbackResponse = await fetch(bluesmindsUrl, {
            method: 'POST',
            headers: {
              ...headers,
              'Authorization': `Bearer ${bluesmindsApiKey}`
            },
            body: JSON.stringify(fallbackBody),
            signal: AbortSignal.timeout(PROVIDER_TIMEOUT_MS)
          });

          if (fallbackResponse.ok) {
            console.log(`[${requestId}] Bluesminds fallback succeeded for ${modelId}`);
            providerResponse = fallbackResponse;
          } else {
            const fallbackErrorText = await fallbackResponse.text();
            console.error(`[${requestId}] Bluesminds fallback also failed:`, fallbackErrorText.substring(0, 300));
          }
        } catch (fallbackError: any) {
          console.error(`[${requestId}] Bluesminds fallback fetch error:`, fallbackError);
        }
      }
    }

    // If providerResponse was replaced by fallback, check if it's now OK
    if (providerResponse.ok) {
      // Continue to success handling below
    } else {
      const sanitizedMessage = sanitizeErrorText(errorText);

      let mappedStatus = providerResponse.status;
      let errorMessage = sanitizedMessage;
      let errorCode = 'upstream_error';
      let shouldRetry = false;
      
      if (providerResponse.status === 418) {
        mappedStatus = 503;
        errorMessage = 'The upstream provider is temporarily unavailable. Please try again or use a different model.';
        errorCode = 'provider_unavailable';
        shouldRetry = true;
      } else if (providerResponse.status === 429) {
        const isQuotaError = errorText.includes('quota') || errorText.includes('Quota') || errorText.includes('allocated') || errorText.includes('exceeded');
        if (isQuotaError) {
          mappedStatus = 429;
          errorMessage = 'Quota exhausted for this model. Please try a different model or contact support.';
          errorCode = 'quota_exhausted';
        } else {
          mappedStatus = 429;
          errorMessage = 'Rate limit exceeded for the upstream provider. Please wait a moment and try again.';
          errorCode = 'rate_limit_exceeded';
        }
        shouldRetry = !isQuotaError;
      } else if (providerResponse.status === 504 || providerResponse.status === 503) {
        errorMessage = `The upstream provider (${model.provider}) is temporarily unavailable or overloaded. Please try again in a few moments or use a different model.`;
        errorCode = 'provider_timeout';
        shouldRetry = true;
      } else if (providerResponse.status >= 500) {
        errorMessage = `Server error from upstream provider ${model.provider}. This usually resolves quickly. Please try again or use a different model.`;
        errorCode = 'provider_server_error';
        shouldRetry = true;
      } else if (providerResponse.status === 401 || providerResponse.status === 403) {
        // Upstream provider rejected our (server-side) credentials — this is NOT the user's auth problem.
        // Map to 503 so clients don't permanently stop retrying on a transient outage.
        mappedStatus = 503;
        errorMessage = 'The upstream provider is temporarily unavailable. Please try a different model or try again later.';
        errorCode = 'provider_unavailable';
        shouldRetry = true;
      } else if (providerResponse.status === 400) {
        errorMessage = sanitizedMessage || `Invalid request format for ${model.provider}. Please check your message format and try again.`;
        errorCode = 'invalid_request';
      }

      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.error) {
          // Never pass through raw upstream errors for auth failures — they look like the
          // user's own auth is broken and include should_retry:false, which stops clients
          // from ever retrying a transient provider outage.
          const upstreamCode = errorJson.error?.code;
          const upstreamMsg: string = errorJson.error?.message || '';
          const isUpstreamProviderAuthError =
            upstreamCode === 'provider_auth_error' ||
            upstreamMsg.toLowerCase().includes('authentication error with upstream') ||
            upstreamMsg.toLowerCase().includes('upstream provider');

          if (isUpstreamProviderAuthError) {
            return NextResponse.json(
              {
                error: {
                  message: 'The upstream provider is temporarily unavailable. Please try a different model or try again later.',
                  type: 'api_error',
                  param: null,
                  code: 'provider_unavailable',
                  request_id: requestId,
                  original_status: providerResponse.status,
                  should_retry: true,
                },
              },
              {
                status: 503,
                headers: { ...getCorsHeaders(), 'Retry-After': '30' },
              }
            );
          }

          return NextResponse.json(errorJson, { 
            status: mappedStatus, 
            headers: {
              ...getCorsHeaders(),
              ...(shouldRetry && { 'Retry-After': '10' })
            }
          });
        }
        return NextResponse.json(
          { error: { message: errorMessage, type: 'api_error', param: null, code: errorJson.code || errorCode, details: errorJson.error?.message || errorJson.message, request_id: requestId, original_status: providerResponse.status, should_retry: shouldRetry } },
          { 
            status: mappedStatus, 
            headers: {
              ...getCorsHeaders(),
              ...(shouldRetry && { 'Retry-After': '10' })
            }
          }
        );
      } catch (e) {
        return NextResponse.json(
          { error: { message: errorMessage, type: 'api_error', param: null, code: errorCode, request_id: requestId, original_status: providerResponse.status, should_retry: shouldRetry } },
          { 
            status: mappedStatus, 
            headers: {
              ...getCorsHeaders(),
              ...(shouldRetry && { 'Retry-After': '10' })
            }
          }
        );
      }
    }
  }

  if (apiKeyInfo && !isSystemRequest) {
    const usageWeight = getModelUsageWeight(modelId);
    console.log(`[${requestId}] Tracking usage with weight: ${usageWeight} for model: ${modelId}`);
    waitUntil(trackUsage(apiKeyInfo.id, apiKeyInfo.userId, modelId, 'chat', body.messages, usageWeight));
  }

  const providerContentType = providerResponse.headers.get('content-type') || '';
  const isStreamingResponse = providerContentType.includes('text/event-stream');
  const acceptHeader = request.headers.get('accept') || '';
  const clientWantsJsonOnly = acceptHeader.includes('application/json') && !acceptHeader.includes('text/event-stream') && !acceptHeader.includes('*/*');

  if (body.stream && isStreamingResponse && !clientWantsJsonOnly) {
    const isFandomEnabledForStream = apiKeyInfo?.fandomPluginEnabled || false;
    const isMemoryPluginEnabledForStream = Boolean(apiKeyInfo?.fandomSettings?.plugins?.memory?.enabled);
    const useMemory = body.use_memory || isFandomEnabledForStream || isMemoryPluginEnabledForStream;
    const transformStream = createChatTransformStream(lastMessage, userId, rememberInteraction, characterId, modelId, useMemory);
    if (!providerResponse.body) {
      console.error(`[${requestId}] Provider returned null body for streaming request`);
      return NextResponse.json(
        { error: { message: 'Provider returned empty response', type: 'api_error', param: null, code: 'empty_response', request_id: requestId } },
        { status: 502, headers: getCorsHeaders() }
      );
    }
    
    const headers = {
      ...getCorsHeaders(),
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Request-Id': requestId,
      'X-Accel-Buffering': 'no',
      'X-Vetra-Provider': model.provider || 'unknown',
      'X-Vetra-Weight': String(getModelUsageWeight(modelId)),
    };

    const kickStream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        controller.enqueue(encoder.encode(':\n\n'));
        const reader = providerResponse.body!.pipeThrough(transformStream).getReader();

        let firstTokenReceived = false;
        let lastTokenTime = Date.now();
        const streamStartTime = Date.now();

        // Abort upstream reader when the client disconnects
        const clientAbortHandler = () => {
          console.log(`[${requestId}] Client disconnected — aborting upstream reader.`);
          try { reader.cancel('client disconnected'); } catch (e) {}
          try { controller.close(); } catch (e) {}
        };
        request.signal.addEventListener('abort', clientAbortHandler, { once: true });

        // Heartbeat: send an SSE comment every 15 s during thinking gaps so that
        // clients and reverse-proxies never see an idle connection.
        // Also enforces a hard 5-minute stall limit (matching maxDuration / PROVIDER_TIMEOUT_MS).
        const HEARTBEAT_INTERVAL_MS = 15000;
        const MAX_STALL_MS = 300000; // 5 minutes
        const heartbeatTimer = setInterval(() => {
          const idleMs = Date.now() - lastTokenTime;
          if (idleMs >= MAX_STALL_MS) {
            clearInterval(heartbeatTimer);
            clearTimeout(firstTokenTimeout);
            console.error(`[${requestId}] Stream stalled for ${idleMs}ms — closing.`);
            const stallError = { error: { message: 'The model stopped responding. The response may be incomplete.', type: 'timeout_error', code: 'stream_stall' } };
            try { controller.enqueue(encoder.encode(`data: ${JSON.stringify(stallError)}\n\n`)); } catch (e) {}
            try { controller.enqueue(encoder.encode('data: [DONE]\n\n')); } catch (e) {}
            try { reader.cancel('stream stall'); } catch (e) {}
            try { controller.close(); } catch (e) {}
          } else {
            // Keep-alive ping so idle-timeout watchdogs see activity
            try { controller.enqueue(encoder.encode(': ping\n\n')); } catch (e) {}
          }
        }, HEARTBEAT_INTERVAL_MS);

        // Abort if the very first token never arrives within 60 seconds
        const firstTokenTimeout = setTimeout(() => {
          if (!firstTokenReceived) {
            clearInterval(heartbeatTimer);
            console.error(`[${requestId}] STREAM FIRST TOKEN TIMEOUT — no response after 60s`);
            const timeoutError = { error: { message: 'The model is taking too long to start responding. This usually happens when the provider is overloaded. Try again in a moment.', type: 'timeout_error', code: 'first_token_timeout' } };
            try { controller.enqueue(encoder.encode(`data: ${JSON.stringify(timeoutError)}\n\n`)); } catch (e) {}
            try { controller.enqueue(encoder.encode('data: [DONE]\n\n')); } catch (e) {}
            try { reader.cancel('first token timeout'); } catch (e) {}
            try { controller.close(); } catch (e) {}
          }
        }, 60000);

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            if (!firstTokenReceived && value.length > 0) {
              firstTokenReceived = true;
              clearTimeout(firstTokenTimeout);
              console.log(`[${requestId}] First stream chunk received after ${Date.now() - streamStartTime}ms.`);
            }
            if (value.length > 0) {
              lastTokenTime = Date.now();
            }
            controller.enqueue(value);
          }
        } catch (err) {
          if (!request.signal.aborted) {
            console.error(`[${requestId}] Stream processing error:`, err);
            const errorMessage = err instanceof Error ? err.message : String(err);
            try { controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: { message: `Stream error: ${errorMessage}` } })}\n\n`)); } catch (e) {}
          }
        } finally {
          clearInterval(heartbeatTimer);
          clearTimeout(firstTokenTimeout);
          request.signal.removeEventListener('abort', clientAbortHandler);
          try { controller.close(); } catch (e) {}
        }
      }
    });
    
    return new NextResponse(kickStream, { headers });
  }

  const data = await safeResponseJson(providerResponse, null as any);
  
  if (model.provider === 'pollinations' && modelId.includes('gemini')) {
    console.log(`[${requestId}] RAW POLLINATIONS GEMINI RESPONSE:`, JSON.stringify(data, null, 2));
  }
  
  let responseData: any = data;
  if (data && (data as any).choices) {
      for (const choice of (data as any).choices) {
        if (choice.message?.content_blocks && Array.isArray(choice.message.content_blocks)) {
          let textContent = '';
          for (const block of choice.message.content_blocks) {
            if (block.type === 'text' && block.text) textContent += block.text;
            else if (block.delta?.text) textContent += block.delta.text;
            else if (block.type === 'thinking' && block.thinking) textContent += `\n[Thinking]: ${block.thinking}\n`;
          }
          if (textContent && !choice.message.content) choice.message.content = textContent;
        }
      }
    }
  
  if (responseData) {
    responseData.model = modelId;
    responseData.object = 'chat.completion';
  }
  
  let assistantContent = responseData?.choices?.[0]?.message?.content || '';
  
  // Don't truncate responses - let the model output its full response
  // Frontend can handle scrolling for long responses
  if (!assistantContent && modelId.includes('gemini')) {
    console.error(`[${requestId}] EMPTY CONTENT DETECTED from Gemini! Full response:`, JSON.stringify(responseData, null, 2));
    const fallbackMessage = "I apologize, but I encountered an issue generating a response for this request. This can sometimes happen with complex prompts or sensitive topics. Please try rephrasing your message or switching to a different model (like OpenAI or Claude).";
    if (responseData && responseData.choices && responseData.choices[0] && responseData.choices[0].message) {
      responseData.choices[0].message.content = fallbackMessage;
      responseData.choices[0].finish_reason = 'content_filter';
      assistantContent = fallbackMessage;
    }
  }
  
  const isFandomEnabled = apiKeyInfo?.fandomPluginEnabled || false;
  const isMemoryPluginEnabled = Boolean((apiKeyInfo?.fandomSettings as any)?.plugins?.memory?.enabled);
  if (userId && lastMessage && (modelId === 'gemini-large' || body.use_memory || isFandomEnabled || isMemoryPluginEnabled)) {
    const assistantMessage = assistantContent;
    if (assistantMessage) {
      rememberInteraction(lastMessage, assistantMessage, userId, characterId).catch(err => 
        console.error('Failed to remember interaction:', err)
      );
    }
  }

  const rateLimitInfo = await getRateLimitInfo(effectiveKey, limit, 'chat');
  const dailyLimitInfo = await getDailyLimitInfo(effectiveKey, dailyLimit, apiKeyInfo?.id);
  let responseRateLimitInfo = rateLimitInfo;
  let responseDailyLimitInfo = dailyLimitInfo;

  if (model.provider === 'openrouter' && providerApiKey) {
    responseRateLimitInfo = await getRateLimitInfo(providerApiKey, providerPerMinuteLimit, 'chat:openrouter');
    responseDailyLimitInfo = await getDailyLimitInfo(providerApiKey, providerDailyLimit);
  }
  
  return NextResponse.json(responseData || { error: 'Empty response from provider' }, {
    headers: {
      ...getCorsHeaders(),
      'X-RateLimit-Remaining': String(responseRateLimitInfo.remaining),
      'X-RateLimit-Reset': String(responseRateLimitInfo.resetAt),
      'X-RateLimit-Limit': String(responseRateLimitInfo.limit),
      'X-DailyLimit-Remaining': String(responseDailyLimitInfo.remaining),
      'X-DailyLimit-Reset': String(responseDailyLimitInfo.resetAt),
      'X-DailyLimit-Limit': String(responseDailyLimitInfo.limit),
      'X-Request-Id': requestId,
      'X-Vetra-Latency': `${Date.now() - startTime}ms`,
      'X-Vetra-Provider': model.provider || 'unknown',
      'X-Vetra-Weight': String(getModelUsageWeight(modelId)),
    },
  });
}
