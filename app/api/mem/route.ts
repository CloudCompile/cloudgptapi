import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserId } from '@/lib/kinde-auth';
import { extractApiKey, validateApiKey, trackUsage, checkRateLimit, getRateLimitInfo, applyPeakHoursLimit, checkDailyLimit, getDailyLimitInfo, getDailyLimitForPlan } from '@/lib/api-keys';

export const runtime = 'nodejs';

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, { status: 200 });
}

export async function POST(request: NextRequest) {
  try {
    // Get user from session
    let sessionUserId = null;
    try {
      const userId = await getCurrentUserId();
      if (userId) {
        sessionUserId = userId;
      }
    } catch (authError) {
      // Ignore auth error for API keys
    }

    // Extract and validate Vetra API key
    const rawApiKey = extractApiKey(request.headers);
    if (!rawApiKey) {
      return NextResponse.json(
        { error: 'Missing or invalid API key' },
        { status: 401 }
      );
    }

    const apiKeyInfo = await validateApiKey(rawApiKey);
    if (!apiKeyInfo) {
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 401 }
      );
    }
    
    // Determine plan and limits
    const userPlan = apiKeyInfo.plan || 'free';
    
    // Determine limit based on plan
    let limit = 20; // Default baseline limit for mem
    let dailyLimit = getDailyLimitForPlan(userPlan);
    
    if (userPlan === 'admin' || userPlan === 'enterprise') {
      limit = 1000;
    } else if (userPlan === 'pro') {
      limit = 50;
    } else if (userPlan === 'developer') {
      limit = 100;
    } else if (userPlan === 'free') {
      limit = 20;
    }

    // Apply peak hours reduction (5 PM - 5 AM UTC): 50% reduction for all users
    limit = applyPeakHoursLimit(limit);
    dailyLimit = applyPeakHoursLimit(dailyLimit);

    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                     request.headers.get('x-real-ip') || 
                     'anonymous';
    
    // VPS Bypass: Don't count requests from our own VPS against RPD
    const isSystemRequest = clientIp === '157.151.169.121';

    // Check daily limit
    if (!isSystemRequest && !await checkDailyLimit(rawApiKey, dailyLimit, apiKeyInfo?.id)) {
      const dailyInfo = await getDailyLimitInfo(rawApiKey, dailyLimit, apiKeyInfo?.id);
      return NextResponse.json(
        { error: 'Daily limit exceeded', resetAt: dailyInfo.resetAt },
        { 
          status: 429,
          headers: {
            'X-DailyLimit-Remaining': '0',
            'X-DailyLimit-Reset': String(dailyInfo.resetAt),
          },
        }
      );
    }

    // Check rate limit
    if (!isSystemRequest && !await checkRateLimit(rawApiKey, limit, 'mem')) {
      const rateLimitInfo = await getRateLimitInfo(rawApiKey, limit, 'mem');
      
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

    const providerUrl = 'https://meridianlabsapp.website/api/chat';
    const substrateApiKey = process.env.MERIDIAN_API_KEY;

    if (!substrateApiKey) {
      return NextResponse.json(
        { error: 'Memory provider API key is not configured' },
        { status: 500 }
      );
    }
    
    // Priority: 1. Header x-user-id (from API client) 2. API Key owner 3. Session User 4. IP-based
    const userId = request.headers.get('x-user-id') || apiKeyInfo?.userId || sessionUserId || `anonymous-${clientIp}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-api-key': substrateApiKey,
      'x-user-id': userId,
      'X-App-Source': apiKeyInfo ? 'Vetra-API' : 'Vetra-Website',
    };

    // Forward to Substrate API
    const providerResponse = await fetch(providerUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        prompt: body.prompt,
      }),
    });

    if (!providerResponse.ok) {
      const errorText = await providerResponse.text();
      return NextResponse.json(
        { error: 'Upstream API error', details: errorText },
        { status: providerResponse.status }
      );
    }

    const data = await providerResponse.json();

    const rateLimitInfo = await getRateLimitInfo(rawApiKey);
    const dailyLimitInfo = await getDailyLimitInfo(rawApiKey, dailyLimit, apiKeyInfo?.id);

    return NextResponse.json(data, {
      headers: {
        'X-RateLimit-Remaining': String(rateLimitInfo.remaining),
        'X-RateLimit-Reset': String(rateLimitInfo.resetAt),
        'X-DailyLimit-Remaining': String(dailyLimitInfo.remaining),
        'X-DailyLimit-Reset': String(dailyLimitInfo.resetAt),
      },
    });
    
  } catch (error) {
    console.error('Memory API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
