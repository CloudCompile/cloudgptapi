import { NextRequest, NextResponse } from 'next/server';
import { getCorsHeaders } from './utils';

export function withErrorHandler(
  handler: (request: NextRequest, ...args: any[]) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: any[]) => {
    try {
      return await handler(request, ...args);
    } catch (error: any) {
      console.error(`[withErrorHandler] Unhandled API error:`, error?.message || error);
      
      const status = error.status || 500;
      return NextResponse.json(
        {
          error: {
            message: error.message || 'Internal server error',
            type: error.type || 'server_error',
            param: error.param || null,
            code: error.code || 'internal_error',
          }
        },
        {
          status,
          headers: getCorsHeaders()
        }
      );
    }
  };
}
