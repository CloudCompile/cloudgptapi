import { NextRequest, NextResponse } from 'next/server';
import { extractApiKey, checkRateLimit, getRateLimitInfo } from '@/lib/api-keys';

export const runtime = 'edge';

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, { status: 200 });
}

export async function POST(request: NextRequest) {
  try {
    // Extract and validate CloudGPT API key (optional for now, following /api/chat pattern)
    const apiKey = extractApiKey(request.headers);
    
    // Check rate limit (allow anonymous with lower limits)
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                     request.headers.get('x-real-ip') || 
                     'anonymous';
    const effectiveKey = apiKey || clientIp;
    const limit = apiKey ? 60 : 10; // Higher limit for authenticated users
    
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
    if (!body.prompt) {
      return NextResponse.json(
        { error: 'prompt is required' },
        { status: 400 }
      );
    }

    const providerUrl = 'https://meridianlabsapp.website/api/chat';
    const substrateApiKey = 'ps_6od22i7ddomt18c1jyk9hm';

    // Forward to Substrate API
    const providerResponse = await fetch(providerUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': substrateApiKey,
      },
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
    
    const rateLimitInfo = getRateLimitInfo(effectiveKey);
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
