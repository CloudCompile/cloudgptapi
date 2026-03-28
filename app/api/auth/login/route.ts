import { NextRequest, NextResponse } from 'next/server';

/**
 * Login endpoint - redirects to Kinde login page
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const redirectUrl = searchParams.get('redirect') || '/dashboard';

    // Encode the redirect URL in state parameter
    const state = Buffer.from(redirectUrl).toString('base64');

    // Build the Kinde login URL
    const kindeAuthDomain = process.env.KINDE_AUTH_DOMAIN;
    const kindeClientId = process.env.KINDE_CLIENT_ID;
    const kindeRedirectUri = process.env.KINDE_REDIRECT_URI;

    if (!kindeAuthDomain || !kindeClientId || !kindeRedirectUri) {
      console.error('Missing Kinde configuration');
      return NextResponse.json(
        { error: 'Authentication service not configured' },
        { status: 500 }
      );
    }

    // Ensure auth domain doesn't have trailing slash before appending path
    const cleanAuthDomain = kindeAuthDomain.replace(/\/$/, '');
    const loginUrl = new URL(`${cleanAuthDomain}/oauth2/auth`);
    loginUrl.searchParams.set('client_id', kindeClientId);
    loginUrl.searchParams.set('response_type', 'code');
    loginUrl.searchParams.set('redirect_uri', kindeRedirectUri);
    loginUrl.searchParams.set('state', state);
    loginUrl.searchParams.set('scope', 'openid profile email offline');
    loginUrl.searchParams.set('prompt', 'login');

    console.log(`[LOGIN] Redirecting to Kinde: ${loginUrl.toString().substring(0, 100)}...`);
    return NextResponse.redirect(loginUrl.toString());
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}
