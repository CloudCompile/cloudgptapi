import { NextResponse } from 'next/server';
import { getCorsHeaders } from '@/lib/utils';

export const runtime = 'edge';

export async function GET() {
  return NextResponse.json({
    status: 'active',
    message: 'CloudGPT API v1 is running',
    endpoints: [
      '/v1/chat/completions',
      '/v1/models',
      '/v1/images/generations',
      '/v1/video/generations'
    ]
  }, {
    headers: getCorsHeaders()
  });
}

export async function OPTIONS() {
  return new NextResponse(null, { 
    status: 204, 
    headers: getCorsHeaders() 
  });
}
