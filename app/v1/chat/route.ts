import { NextRequest, NextResponse } from 'next/server';
import { getCorsHeaders } from '@/lib/utils';

export const runtime = 'edge';

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, { 
    status: 204, 
    headers: getCorsHeaders() 
  });
}

// Catch-all for /v1/chat - redirect users to the correct endpoint
export async function GET(request: NextRequest) {
  return NextResponse.json({
    error: {
      message: 'Invalid endpoint. Did you mean /v1/chat/completions? Please check your API base URL configuration.',
      type: 'invalid_request_error',
      param: null,
      code: 'invalid_endpoint',
      hint: 'If using OpenAI SDK, set base_url to the root domain (e.g., https://your-domain.com/v1) not https://your-domain.com/v1/chat/completions'
    }
  }, {
    status: 404,
    headers: getCorsHeaders()
  });
}

export async function POST(request: NextRequest) {
  return NextResponse.json({
    error: {
      message: 'Invalid endpoint. Did you mean /v1/chat/completions? Please check your API base URL configuration.',
      type: 'invalid_request_error',
      param: null,
      code: 'invalid_endpoint',
      hint: 'If using OpenAI SDK, set base_url to the root domain (e.g., https://your-domain.com/v1) not https://your-domain.com/v1/chat/completions'
    }
  }, {
    status: 404,
    headers: getCorsHeaders()
  });
}
