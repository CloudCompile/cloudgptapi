import { NextRequest, NextResponse } from 'next/server';
import { trackUsage, getRateLimitInfo, getDailyLimitInfo, ApiKey } from '@/lib/api-keys';
import { handleStableHordeChat } from './stablehorde';
import {
  PROVIDER_URLS,
  PROVIDER_MODEL_MAPPING,
  createChatTransformStream,
  PROVIDER_TIMEOUT_MS,
  sanitizeErrorText
} from '@/lib/chat-utils';
import { CHAT_MODELS } from '@/lib/providers';
import {
  getCorsHeaders, getOpenRouterApiKey,
  getPollinationsApiKey,
  getClaudeApiKey,
  getPoeApiKey,
  getLizApiKey,
  getKivestApiKey,
  getOpenAIApiKey,
  safeResponseJson
} from '@/lib/utils';
import { rememberInteraction } from '@/lib/memory';

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
        { error: { message: 'GitHub Models token is not configured.', type: 'config_error', param: null, code: 'missing_api_key', request_id: requestId } },
        { status: 500, headers: getCorsHeaders() }
      );
    }
  } else if (model.provider === 'poe') {
    providerUrl = `${PROVIDER_URLS.poe}/chat/completions`;
    providerApiKey = getPoeApiKey();
    if (!providerApiKey) {
      console.warn(`[${requestId}] Missing Poe API key for model: ${modelId}`);
      return NextResponse.json(
        { error: { message: 'Poe API key is not configured.', type: 'config_error', param: null, code: 'missing_api_key', request_id: requestId } },
        { status: 500, headers: getCorsHeaders() }
      );
    }
  } else if (model.provider === 'liz') {
    providerUrl = `${PROVIDER_URLS.liz}/v1/chat/completions`;
    providerApiKey = getLizApiKey();
    if (!providerApiKey) {
      console.warn(`[${requestId}] Missing Liz API key for model: ${modelId}`);
      return NextResponse.json(
        { error: { message: 'Liz API key is not configured.', type: 'config_error', param: null, code: 'missing_api_key', request_id: requestId } },
        { status: 500, headers: getCorsHeaders() }
      );
    }
  } else if (model.provider === 'openai') {
    providerUrl = `${PROVIDER_URLS.openai}/chat/completions`;
    providerApiKey = getOpenAIApiKey();
    if (!providerApiKey) {
      console.warn(`[${requestId}] Missing OpenAI API key for model: ${modelId}`);
      return NextResponse.json(
        { error: { message: 'OpenAI API key is not configured.', type: 'config_error', param: null, code: 'missing_api_key', request_id: requestId } },
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
  } else if (model.provider === 'stablehorde') {
    return await handleStableHordeChat(body, modelId, apiKeyInfo, userId, effectiveKey, requestId, limit, dailyLimit, isSystemRequest, characterId);
  } else {
    providerUrl = `${PROVIDER_URLS.pollinations}/v1/chat/completions`;
    providerApiKey = getPollinationsApiKey();
    if (!providerApiKey) {
      console.warn(`[${requestId}] Missing Pollinations API key for model: ${modelId}`);
      return NextResponse.json(
        { error: { message: 'Pollinations API key is not configured.', type: 'config_error', param: null, code: 'missing_api_key', request_id: requestId } },
        { status: 500, headers: getCorsHeaders() }
      );
    }
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-App-Source': apiKeyInfo ? 'Vetra-API' : 'Vetra-Website',
    ...(providerApiKey && { 'Authorization': `Bearer ${providerApiKey}` }),
  };
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

  const standardBody: any = {
    model: modelId,
    messages: processedMessages,
    temperature: body.temperature ?? 0.7,
    max_tokens: effectiveMaxTokens,
    stream: body.stream ?? false,
    top_p: body.top_p ?? 1,
  };

  if (body.seed !== undefined) {
    standardBody.seed = body.seed;
  } else if (model.provider === 'pollinations' && !modelId.includes('gemini') && !modelId.includes('claude')) {
    standardBody.seed = Math.floor(Math.random() * 1000000);
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
      const pollKey = getPollinationsApiKey();
      const startTime = Date.now();
      const response = await fastFetch(`${PROVIDER_URLS.pollinations}/v1/chat/completions`, pollKey || '');
      
      if (response.ok) {
        console.log(`[${requestId}] Fast-path success: ${Date.now() - startTime}ms via Pollinations`);
        const data = await safeResponseJson(response, null as any);
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
      if (e.name === 'AbortError') console.warn(`[${requestId}] Fast-path timeout (30s) for Pollinations, falling back...`);
      else console.warn(`[${requestId}] Fast-path error for Pollinations:`, e);
    }
  }

  if (model.provider === 'meridian') {
    delete headers['Authorization'];
    if (providerApiKey) headers['x-api-key'] = providerApiKey;
  }
  if (model.provider === 'openrouter') {
    headers['HTTP-Referer'] = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    headers['X-Title'] = 'Vetra API';
  }

  let requestBody = { ...standardBody };
  if (PROVIDER_MODEL_MAPPING[modelId]) {
    console.log(`[${requestId}] Mapping model ID for provider: ${modelId} -> ${PROVIDER_MODEL_MAPPING[modelId]}`);
    requestBody.model = PROVIDER_MODEL_MAPPING[modelId];
  }
  
  if (model.provider === 'meridian') {
    const prompt = body.messages.map((msg: any) => `${msg.role}: ${msg.content}`).join('\n');
    requestBody = { prompt };
  } else {
    const isGitHubReasoningModel = model.provider === 'github' && [
      'o1', 'o1-preview', 'o1-mini', 'o3', 'o3-mini', 'o4-mini',
      'Phi-4-reasoning', 'Phi-4-mini-reasoning', 'MAI-DS-R1'
    ].includes(modelId);

    const isVertexModel = (model.provider === 'gemini' || model.provider === 'claude' || modelId.includes('gemini') || modelId.includes('claude')) && 
      model.provider !== 'liz' && model.provider !== 'openrouter';

    if (isGitHubReasoningModel) {
      delete requestBody.temperature;
      delete requestBody.top_p;
      delete requestBody.frequency_penalty;
      delete requestBody.presence_penalty;
    } else if (isVertexModel) {
      if (body.top_p !== undefined) delete requestBody.temperature;
      else delete requestBody.top_p;
    }
  }

  let providerResponse: Response;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), PROVIDER_TIMEOUT_MS);
  
  try {
    console.log(`[${requestId}] Forwarding to provider: ${model.provider}, URL: ${providerUrl}`);
    const keyPrefix = headers['Authorization']?.substring(0, 15) || 'none';
    console.log(`[${requestId}] Auth Header Prefix: ${keyPrefix}`);
    
    providerResponse = await fetch(providerUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });

    console.log(`[${requestId}] Provider response status: ${providerResponse.status} ${providerResponse.statusText}`);
    
  } catch (fetchError: any) {
    clearTimeout(timeoutId);
    if (fetchError.name === 'AbortError') {
      console.error(`[${requestId}] Provider request timed out after ${PROVIDER_TIMEOUT_MS}ms`);
      return NextResponse.json(
        { error: { message: 'Request timed out', type: 'timeout_error', param: null, code: 'request_timeout', request_id: requestId } },
        { status: 504, headers: getCorsHeaders() }
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

    try {
      const errorJson = JSON.parse(errorText);
      if (errorJson.error) return NextResponse.json(errorJson, { status: mappedStatus, headers: getCorsHeaders() });
      return NextResponse.json(
        { error: { message: errorMessage, type: 'api_error', param: null, code: errorJson.code || 'upstream_error', details: errorJson, request_id: requestId, original_status: providerResponse.status } },
        { status: mappedStatus, headers: getCorsHeaders() }
      );
    } catch (e) {
      return NextResponse.json(
        { error: { message: errorMessage, type: 'api_error', param: null, code: 'upstream_error', details: sanitizedMessage, request_id: requestId, original_status: providerResponse.status } },
        { status: mappedStatus, headers: getCorsHeaders() }
      );
    }
  }

  if (apiKeyInfo && !isSystemRequest) {
    const usageWeight = model.usageWeight || 1;
    await trackUsage(apiKeyInfo.id, apiKeyInfo.userId, modelId, 'chat', body.messages, usageWeight);
  }

  const providerContentType = providerResponse.headers.get('content-type') || '';
  const isStreamingResponse = providerContentType.includes('text/event-stream');
  const acceptHeader = request.headers.get('accept') || '';
  const clientWantsJsonOnly = acceptHeader.includes('application/json') && !acceptHeader.includes('text/event-stream') && !acceptHeader.includes('*/*');

  if (body.stream && isStreamingResponse && !clientWantsJsonOnly) {
    const transformStream = createChatTransformStream(lastMessage, userId, rememberInteraction, characterId, modelId);
    if (!providerResponse.body) {
      console.error(`[${requestId}] Provider returned null body for streaming request`);
      return NextResponse.json(
        { error: { message: 'Provider returned empty response', type: 'api_error', param: null, code: 'empty_response', request_id: requestId } },
        { status: 502, headers: getCorsHeaders() }
      );
    }
    
    const headers = {
      ...getCorsHeaders(),
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Request-Id': requestId,
      'X-Accel-Buffering': 'no',
    };

    const kickStream = new ReadableStream({
      async start(controller) {
        controller.enqueue(new TextEncoder().encode(':\n\n')); 
        const reader = providerResponse.body!.pipeThrough(transformStream).getReader();
        
        let firstTokenReceived = false;
        const streamTimeout = setTimeout(() => {
          if (!firstTokenReceived) {
            console.error(`[${requestId}] STREAM TIMEOUT`);
            const timeoutError = { error: { message: "The model is taking too long to respond. Please try again with a shorter prompt.", type: "timeout_error", code: "provider_timeout" } };
            controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(timeoutError)}\n\n`));
            controller.enqueue(new TextEncoder().encode(`data: [DONE]\n\n`));
            try { reader.cancel(); } catch (e) {}
            controller.close();
          }
        }, 15000);

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

  const data = await safeResponseJson(providerResponse, null as any);
  
  if (model.provider === 'pollinations' && modelId.includes('gemini')) {
    console.log(`[${requestId}] RAW POLLINATIONS GEMINI RESPONSE:`, JSON.stringify(data, null, 2));
  }
  
  let responseData: any = data;
  if (model.provider === 'meridian') {
    responseData = {
      id: 'meridian-' + Date.now(),
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: modelId,
      choices: [{ index: 0, message: { role: 'assistant', content: (data as any)?.response || '', }, finish_reason: 'stop', }],
      usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0, },
    };
  } else if (model.provider === 'pollinations') {
    if (data && !(data as any).choices && (data as any).content) {
      responseData = {
        id: 'pollinations-' + Date.now(),
        object: 'chat.completion',
        created: Math.floor(Date.now() / 1000),
        model: modelId,
        choices: [{ index: 0, message: { role: 'assistant', content: (data as any).content, }, finish_reason: 'stop', }],
        usage: (data as any).usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0, },
      };
    }
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
  }
  
  if (responseData) {
    responseData.model = modelId;
    responseData.object = 'chat.completion';
  }
  
  let assistantContent = responseData?.choices?.[0]?.message?.content || '';
  if (modelId === 'gemini-large' && assistantContent.length > 12000) {
    console.warn(`[${requestId}] Extremely long response detected (${assistantContent.length} chars). Truncating for frontend compatibility.`);
    assistantContent = assistantContent.substring(0, 12000) + '\n\n[Response truncated by Vetra for frontend compatibility. Use "Continue" to fetch more if supported.]';
    if (responseData.choices[0].message) responseData.choices[0].message.content = assistantContent;
  }

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
}
