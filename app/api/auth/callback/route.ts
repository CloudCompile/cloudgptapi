import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * Kinde OAuth callback endpoint
 * Receives the authorization code and exchanges it for tokens
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
      console.error('Kinde auth error:', error);
      return NextResponse.redirect(new URL('/login?error=' + error, req.url));
    }

    if (!code) {
      return NextResponse.redirect(new URL('/login?error=no_code', req.url));
    }

    // Exchange the authorization code for tokens
    const tokenResponse = await fetch(
      `${process.env.KINDE_AUTH_DOMAIN}/oauth/token`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          client_id: process.env.KINDE_CLIENT_ID!,
          client_secret: process.env.KINDE_CLIENT_SECRET!,
          redirect_uri: `${process.env.KINDE_REDIRECT_URI}`,
        }).toString(),
      }
    );

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      console.error('Token exchange failed:', error);
      return NextResponse.redirect(new URL('/login?error=token_exchange_failed', req.url));
    }

    const tokenData = await tokenResponse.json();
    const { access_token, refresh_token, id_token } = tokenData;

    if (!access_token) {
      return NextResponse.redirect(new URL('/login?error=no_access_token', req.url));
    }

    // Store tokens in secure httpOnly cookies
    const cookieStore = await cookies();
    
    cookieStore.set('kinde_access_token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 3600, // 1 hour
    });

    if (refresh_token) {
      cookieStore.set('kinde_refresh_token', refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 86400 * 7, // 7 days
      });
    }

    if (id_token) {
      cookieStore.set('kinde_id_token', id_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      });
    }

    // Get redirect destination from state parameter (encoded in base64 or similar)
    let redirectUrl = '/dashboard';
    if (state) {
      try {
        redirectUrl = Buffer.from(state, 'base64').toString('utf-8');
      } catch (e) {
        // If state decoding fails, use default
      }
    }

    return NextResponse.redirect(new URL(redirectUrl, req.url));
  } catch (error) {
    console.error('Callback error:', error);
    return NextResponse.redirect(new URL('/login?error=callback_error', req.url));
  }
}
