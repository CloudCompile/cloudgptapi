import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { extractApiKey, validateApiKey, trackUsage, checkRateLimit, getRateLimitInfo, checkDailyLimit, getDailyLimitInfo, ApiKey, applyPlanOverride } from '@/lib/api-keys';
import { CHAT_MODELS, PROVIDER_URLS } from '@/lib/providers';
import { getCorsHeaders, safeResponseJson } from '@/lib/utils';
import { supabaseAdmin } from '@/lib/supabase';
import { generateRequestId } from '@/lib/chat-utils';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function OPTIONS() {
  return new NextResponse(null, { 
    status: 204, 
    headers: getCorsHeaders() 
  });
}

export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  
  try {
    const { userId: sessionUserId } = await auth();
    const rawApiKey = extractApiKey(request.headers);
    
    const clientIp = (request as any).ip || 
                     request.headers.get('x-forwarded-for')?.split(',')[0] || 
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
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('plan, email')
        .eq('id', sessionUserId)
        .single();
      
      if (profile) {
        userPlan = profile.plan || 'free';
        userPlan = await applyPlanOverride(profile.email, userPlan, sessionUserId, 'id');
      }
    }

    let limit = 100;
    let dailyLimit = 1000;
    
    if (userPlan === 'admin' || userPlan === 'enterprise') {
      limit = 10000; 
      dailyLimit = 100000;
    } else if (userPlan === 'pro') {
      limit = 200;
      dailyLimit = 2000;
    } else if (userPlan === 'developer') {
      limit = 1000;
      dailyLimit = 5000;
    }

    if (apiKeyInfo && apiKeyInfo.rateLimit > limit) {
      limit = apiKeyInfo.rateLimit;
    }
    
    if (!await checkDailyLimit(effectiveKey, dailyLimit, apiKeyInfo?.id)) {
      const dailyInfo = await getDailyLimitInfo(effectiveKey, dailyLimit, apiKeyInfo?.id);
      return NextResponse.json(
        { 
          error: {
            message: `Daily request limit exceeded (${dailyLimit} RPD).`,
            type: 'requests',
            code: 'daily_limit_exceeded'
          }
        },
        { 
          status: 429,
          headers: { ...getCorsHeaders(), 'X-DailyLimit-Remaining': '0' }
        }
      );
    }

    if (!await checkRateLimit(effectiveKey, limit, 'embeddings')) {
      const rateLimitInfo = await getRateLimitInfo(effectiveKey, limit, 'embeddings');
      return NextResponse.json(
        { error: { message: 'Rate limit exceeded', type: 'requests', code: 'rate_limit_exceeded' } },
        { status: 429, headers: { ...getCorsHeaders(), 'X-RateLimit-Remaining': '0' } }
      );
    }

    const body = await request.json();
    const modelId = body.model || 'text-embedding-3-small';
    const model = CHAT_MODELS.find(m => m.id === modelId);

    if (!model || model.provider !== 'github') {
       return NextResponse.json(
        { error: { message: `Unsupported or non-GitHub model: ${modelId}`, type: 'invalid_request_error' } },
        { status: 400, headers: getCorsHeaders() }
      );
    }

    const providerUrl = `${PROVIDER_URLS.github}/embeddings`;
    const providerApiKey = process.env.GITHUB_TOKEN;

    if (!providerApiKey) {
      return NextResponse.json(
        { error: { message: 'GitHub token not configured', type: 'config_error' } },
        { status: 500, headers: getCorsHeaders() }
      );
    }

    const response = await fetch(providerUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${providerApiKey}`
      },
      body: JSON.stringify({
        model: modelId,
        input: body.input,
        encoding_format: body.encoding_format
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: 'GitHub Models Error', details: errorText },
        { status: response.status, headers: getCorsHeaders() }
      );
    }

    const data = await response.json();

    if (apiKeyInfo) {
      const usageWeight = model.usageWeight || 1;
      await trackUsage(apiKeyInfo.id, apiKeyInfo.userId, modelId, 'chat', body.input, usageWeight);
    }

    const rateLimitInfo = await getRateLimitInfo(effectiveKey, limit, 'embeddings');
    const dailyLimitInfo = await getDailyLimitInfo(effectiveKey, dailyLimit, apiKeyInfo?.id);

    return NextResponse.json(data, {
      headers: {
        ...getCorsHeaders(),
        'X-RateLimit-Remaining': String(rateLimitInfo.remaining),
        'X-DailyLimit-Remaining': String(dailyLimitInfo.remaining)
      }
    });

  } catch (error: any) {
    console.error(`[${requestId}] Embeddings error:`, error);
    return NextResponse.json(
      { error: { message: 'Internal server error', type: 'api_error' } },
      { status: 500, headers: getCorsHeaders() }
    );
  }
}
