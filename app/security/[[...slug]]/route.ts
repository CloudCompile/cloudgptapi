import { NextRequest, NextResponse } from 'next/server';

/**
 * Honeypot Endpoint: /security
 * Captures all traffic and forwards it to the specified target.
 * Used for security monitoring and threat intelligence gathering.
 */

const TARGET_IP = '157.151.169.121';
const TARGET_PORT = '8000';
const TARGET_URL = `http://${TARGET_IP}:${TARGET_PORT}`;

export const runtime = 'nodejs';

async function handleHoneypot(request: NextRequest) {
  const clientIp = (request as any).ip || 
                   request.headers.get('x-forwarded-for')?.split(',')[0] || 
                   request.headers.get('x-real-ip') || 
                   'anonymous';

  const { method, url, headers: requestHeaders } = request;
  const path = new URL(url).pathname;
  const searchParams = new URL(url).search;

  // Clone headers and add metadata
  const headers = new Headers(requestHeaders);
  headers.set('X-Honeypot-Source', 'Vetra');
  headers.set('X-Original-IP', clientIp);
  headers.set('X-Original-Path', path);

  try {
    // Read body for methods that usually have one
    let body: any = null;
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      body = await request.text();
    }

    // Forward the request to the target collector
    // If you are using an SSH tunnel on the server, you might change TARGET_URL to http://localhost:8000
    const forwardResponse = await fetch(`${TARGET_URL}${path}${searchParams}`, {
      method,
      headers,
      body: body || undefined,
      cache: 'no-store',
      // We don't want to wait forever for the collector
      signal: AbortSignal.timeout(5000), 
    });

    const responseData = await forwardResponse.text();

    // Return the collector's response or a generic "success" to avoid alerting the attacker
    return new NextResponse(responseData, {
      status: forwardResponse.status,
      headers: {
        'Content-Type': forwardResponse.headers.get('Content-Type') || 'text/plain',
        'X-Honeypot-Processed': 'true',
      },
    });
  } catch (error) {
    console.error(`[Honeypot] Error forwarding traffic from ${clientIp}:`, error);
    
    // Fallback: return a generic fake error or success
    // 403 Forbidden is often a good "honeypot" response to see if they try to bypass it
    return new NextResponse('Forbidden', { status: 403 });
  }
}

export async function GET(request: NextRequest) { return handleHoneypot(request); }
export async function POST(request: NextRequest) { return handleHoneypot(request); }
export async function PUT(request: NextRequest) { return handleHoneypot(request); }
export async function DELETE(request: NextRequest) { return handleHoneypot(request); }
export async function PATCH(request: NextRequest) { return handleHoneypot(request); }
export async function HEAD(request: NextRequest) { return handleHoneypot(request); }
export async function OPTIONS(request: NextRequest) { return handleHoneypot(request); }
