import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { extractApiKey, validateApiKey, trackUsage, checkRateLimit, getRateLimitInfo } from '@/lib/api-keys';

export const runtime = 'edge';

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, { status: 200 });
}

export async function POST(request: NextRequest) {
  try {
    // Get user from session
    const { userId: sessionUserId } = await auth();

    // Extract and validate CloudGPT API key
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
    
    // Check rate limit
    if (!checkRateLimit(rawApiKey, apiKeyInfo.rateLimit, 'mem')) {
      const rateLimitInfo = getRateLimitInfo(rawApiKey, apiKeyInfo.rateLimit, 'mem');
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
    const substrateApiKey = 'ps_6od22i7ddomt18c1jyk9hm';

    // Build headers
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                     request.headers.get('x-real-ip') || 
                     'anonymous';
    
    // Priority: 1. Header x-user-id (from API client) 2. API Key owner 3. Session User 4. IP-based
    const userId = request.headers.get('x-user-id') || apiKeyInfo?.userId || sessionUserId || `anonymous-${clientIp}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-api-key': substrateApiKey,
      'x-user-id': userId,
      'X-App-Source': apiKeyInfo ? 'CloudGPT-API' : 'CloudGPT-Website',
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

    // Track usage in background
    await trackUsage(apiKeyInfo.id, apiKeyInfo.userId, 'meridian-mem', 'mem');
    
    const rateLimitInfo = getRateLimitInfo(rawApiKey);
    return NextResponse.json(data, {
      headers: {
        'X-RateLimit-Remaining': String(rateLimitInfo.remaining),
        'X-RateLimit-Reset': String(rateLimitInfo.resetAt),
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
