import { NextRequest, NextResponse } from 'next/server';
import { trackUsage, checkRateLimit, getRateLimitInfo, checkDailyLimit, getDailyLimitInfo, ApiKey } from '@/lib/api-keys';
import { processAuth } from './services/auth';
import { processContextAndMemory, sanitizeMessagesForProvider } from './services/parser';
import { dispatchChatRequest } from './services/dispatcher';
import { CHAT_MODELS, PREMIUM_MODELS, ULTRA_MODELS, FREE_MODELS } from '@/lib/providers';
import { getCorsHeaders, safeResponseJson, hasProAccess } from '@/lib/utils';
import { rememberInteraction } from '@/lib/memory';
import {
  validateMessages,
  generateRequestId,
  resolveModelId,
  PROVIDER_MODEL_MAPPING,
  applySearchPluginModel,
} from '@/lib/chat-utils';

import { withErrorHandler } from '@/lib/api-wrapper';
import { ChatCompletionRequestSchema } from '@/lib/schema';

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes max for long reasoning or slow providers

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, { 
    status: 204, 
    headers: getCorsHeaders() 
  });
}

export const GET = withErrorHandler(async function GET(request: NextRequest) {
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
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: 'Hello!' }]
    }
  }, {
    headers: getCorsHeaders()
  });
});

export const POST = withErrorHandler(async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  console.log(`[${requestId}] POST /v1/chat/completions started`);
  
  try {
    const clientIp = (request as any).ip || 
                     request.headers.get('x-forwarded-for')?.split(',')[0] || 
                     request.headers.get('x-real-ip') || 
                     'anonymous';

    const {
      sessionUserId,
      rawApiKey,
      apiKeyInfo,
      userPlan,
      limit,
      dailyLimit,
      isSystemRequest,
      effectiveKey
    } = await processAuth(request, requestId, clientIp);
    
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

    const rawBody = await request.json();
    
    // Validate request schema with Zod
    const schemaValidation = ChatCompletionRequestSchema.safeParse(rawBody);
    if (!schemaValidation.success) {
      console.warn(`[${requestId}] Invalid request schema:`, schemaValidation.error.errors);
      return NextResponse.json(
        {
          error: {
            message: `Invalid request: ${schemaValidation.error.errors.map(e => e.message).join(', ')}`,
            type: 'invalid_request_error',
            param: schemaValidation.error.errors[0]?.path.join('.') || null,
            code: 'invalid_request',
            request_id: requestId
          }
        },
        { status: 400, headers: getCorsHeaders() }
      );
    }
    const body = schemaValidation.data;

    // Save last message before memory/lore injection for later tracking
    const rawLastMessageContent = body.messages && body.messages.length > 0 ? body.messages[body.messages.length - 1]?.content || '' : '';
    const lastMessage = typeof rawLastMessageContent === 'string' ? rawLastMessageContent : JSON.stringify(rawLastMessageContent);
    
    // Log request details for debugging (especially token issues)
    console.log(`[${requestId}] Request model: ${body.model}, max_tokens: ${body.max_tokens}, messages: ${body.messages?.length}`);

    // Detailed content validation (ensure no completely empty strings if that's what validateMessages checks)
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
    const resolvedModelId = resolveModelId(body.model || 'deepseek-chat');
    const isSearchPluginEnabled = Boolean((apiKeyInfo?.fandomSettings as any)?.plugins?.search?.enabled);
    const modelId = applySearchPluginModel(resolvedModelId, isSearchPluginEnabled);

    // Check if model is premium/ultra/free and if user has access
    const isPremium = PREMIUM_MODELS.has(modelId);
    const isUltra = ULTRA_MODELS.has(modelId);
    const isFree = FREE_MODELS.has(modelId);
    // Pro access if they have a pro/enterprise/developer/admin plan
    const hasPro = hasProAccess(userPlan);

    console.log(`[${requestId}] FINAL Access Check: model=${modelId}, plan=${userPlan}, isPremium=${isPremium}, isUltra=${isUltra}, isFree=${isFree}, hasProAccess=${hasPro}, apiKeyPlan=${apiKeyInfo?.plan}`);

    // Diagnostic logging for access issues
    if (isPremium || isUltra || userPlan !== 'free') {
      console.log(`[${requestId}] Access Check: model=${modelId}, plan=${userPlan}, isPremium=${isPremium}, isUltra=${isUltra}, isFree=${isFree}, hasProAccess=${hasPro}`);
    }

    // Ultra models require ultra plan
    if (isUltra && !hasPro) {
      console.warn(`[${requestId}] Ultra model access denied: ${modelId} for key: ${effectiveKey.substring(0, 10)}...`);
      return NextResponse.json(
        {
          error: {
            message: `The model '${modelId}' is only available on Ultra plans. Please upgrade at ${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
            type: 'access_denied',
            param: 'model',
            code: 'ultra_model_required',
            request_id: requestId
          }
        },
        {
          status: 403,
          headers: getCorsHeaders()
        }
      );
    }

    // Premium models require pro plan (unless it's also a free model)
    if (isPremium && !isFree && !hasPro) {
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

    // Process context, memory, and remote fandom knowledge
    const parseResult = await processContextAndMemory(
      body.messages,
      request.headers,
      body,
      apiKeyInfo,
      sessionUserId,
      clientIp,
      modelId,
      requestId
    );
    const { userId, characterId } = parseResult;
    body.messages = parseResult.messages;

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

    // Sanitize messages for specific strict providers (like Gemini)
    const processedMessages = sanitizeMessagesForProvider(body.messages, modelId, requestId);

    // Dispatch request through modular service
    return await dispatchChatRequest({
      request,
      body,
      processedMessages,
      modelId,
      model,
      requestId,
      userId,
      characterId,
      apiKeyInfo,
      effectiveKey,
      limit,
      dailyLimit,
      isSystemRequest,
      lastMessage
    });
    
  } catch (error: any) {
    console.error(`[${requestId}] Chat API error:`, error?.message || error);
    throw error;
  }
});
