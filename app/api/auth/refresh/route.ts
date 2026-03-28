import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * Token refresh endpoint — exchanges a refresh token for a new access token.
 * Called by the middleware when it detects an expired access token.
 */
export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('kinde_refresh_token')?.value;

    if (!refreshToken) {
      return NextResponse.json({ error: 'No refresh token' }, { status: 401 });
    }

    const tokenResponse = await fetch(
      `${process.env.KINDE_AUTH_DOMAIN}/oauth2/token`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
          client_id: process.env.KINDE_CLIENT_ID!,
          client_secret: process.env.KINDE_CLIENT_SECRET!,
        }).toString(),
      }
    );

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      console.error('[Refresh] Token refresh failed:', error);
      // Clear stale cookies on permanent failure
      cookieStore.delete('kinde_access_token');
      cookieStore.delete('kinde_refresh_token');
      return NextResponse.json({ error: 'Refresh failed' }, { status: 401 });
    }

    const tokenData = await tokenResponse.json();
    const { access_token, refresh_token: newRefreshToken } = tokenData;

    if (!access_token) {
      return NextResponse.json({ error: 'No access token in response' }, { status: 401 });
    }

    const isSecure = req.nextUrl.protocol === 'https:' || process.env.NODE_ENV === 'production';

    cookieStore.set('kinde_access_token', access_token, {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'lax',
      maxAge: 86400 * 7,
      path: '/',
    });

    // Kinde may rotate the refresh token — store the new one if provided
    if (newRefreshToken) {
      cookieStore.set('kinde_refresh_token', newRefreshToken, {
        httpOnly: true,
        secure: isSecure,
        sameSite: 'lax',
        maxAge: 86400 * 30,
        path: '/',
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Refresh] Error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
