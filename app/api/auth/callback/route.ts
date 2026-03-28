import { NextRequest, NextResponse } from 'next/server';
import { jwtDecode } from 'jwt-decode';
import { syncUser } from '@/lib/admin-actions';

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
      `${process.env.KINDE_AUTH_DOMAIN}/oauth2/token`,
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

    // Sync/migrate user profile in Supabase (handles Clerk → Kinde ID migration by email)
    try {
      const decoded: any = jwtDecode(access_token);
      const userId: string = decoded.sub;
      const email: string = decoded.email || '';
      const givenName: string = decoded.given_name || '';
      const familyName: string = decoded.family_name || '';
      const picture: string = decoded.picture || '';

      if (userId && email) {
        await syncUser(
          userId,
          email,
          email.split('@')[0],
          [givenName, familyName].filter(Boolean).join(' ') || undefined,
          picture || undefined
        );
      }
    } catch (syncError) {
      // Non-fatal: log but don't block login
      console.error('[Callback] Failed to sync user profile:', syncError);
    }

    // Get redirect destination from state parameter (encoded in base64)
    let redirectUrl = '/dashboard';
    if (state) {
      try {
        redirectUrl = Buffer.from(state, 'base64').toString('utf-8');
      } catch (e) {
        // If state decoding fails, use default
      }
    }

    const isSecure = req.nextUrl.protocol === 'https:';
    const response = NextResponse.redirect(new URL(redirectUrl, req.url));

    response.cookies.set('kinde_access_token', access_token, {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'lax',
      maxAge: 3600, // 1 hour
      path: '/',
    });

    if (refresh_token) {
      response.cookies.set('kinde_refresh_token', refresh_token, {
        httpOnly: true,
        secure: isSecure,
        sameSite: 'lax',
        maxAge: 86400 * 7, // 7 days
        path: '/',
      });
    }

    if (id_token) {
      response.cookies.set('kinde_id_token', id_token, {
        httpOnly: true,
        secure: isSecure,
        sameSite: 'lax',
        maxAge: 3600,
        path: '/',
      });
    }

    return response;
  } catch (error) {
    console.error('Callback error:', error);
    return NextResponse.redirect(new URL('/login?error=callback_error', req.url));
  }
}
