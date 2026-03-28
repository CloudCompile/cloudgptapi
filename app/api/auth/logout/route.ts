import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * Logout endpoint - clears session and redirects to Kinde logout
 */
export async function GET(req: NextRequest) {
  try {
    // Clear authentication cookies
    const cookieStore = await cookies();
    cookieStore.delete('kinde_access_token');
    cookieStore.delete('kinde_refresh_token');
    cookieStore.delete('kinde_id_token');

    // Build the Kinde logout URL
    const kindeAuthDomain = process.env.KINDE_AUTH_DOMAIN;
    const kindeClientId = process.env.KINDE_CLIENT_ID;
    const logoutRedirectUri = process.env.KINDE_LOGOUT_REDIRECT_URI || process.env.KINDE_REDIRECT_URI?.split('/callback')[0] || 'http://localhost:3000';

    if (!kindeAuthDomain || !kindeClientId) {
      // If Kinde not configured, just redirect home
      return NextResponse.redirect(new URL('/', req.url));
    }

    const logoutUrl = new URL(`${kindeAuthDomain}/logout`);
    logoutUrl.searchParams.set('client_id', kindeClientId);
    logoutUrl.searchParams.set('logout_uri', logoutRedirectUri);

    return NextResponse.redirect(logoutUrl.toString());
  } catch (error) {
    console.error('Logout error:', error);
    // Even if error occurs, clear cookies and redirect home
    const cookieStore = await cookies();
    cookieStore.delete('kinde_access_token');
    cookieStore.delete('kinde_refresh_token');
    cookieStore.delete('kinde_id_token');
    return NextResponse.redirect(new URL('/', req.url));
  }
}
