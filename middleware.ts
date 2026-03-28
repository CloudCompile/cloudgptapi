import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtDecode } from "jwt-decode";

// API routes that use API key authentication instead of session
const isApiKeyRoute = (path: string) => {
  return path.startsWith("/v1") || 
         path.startsWith("/api/keys") || 
         path.startsWith("/api/video") || 
         path.startsWith("/api/image");
};

// Routes that require authentication
const protectedRoutes = [
  "/dashboard",
  "/admin",
];

const isProtectedRoute = (path: string) => {
  return protectedRoutes.some(route => path.startsWith(route));
};

/**
 * Attempt to refresh the access token using the refresh token cookie.
 * Returns the new token data on success, or null on failure.
 */
async function refreshAccessToken(refreshToken: string): Promise<{
  access_token: string;
  refresh_token?: string;
} | null> {
  try {
    const response = await fetch(
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

    if (!response.ok) {
      console.error('[Middleware] Token refresh failed:', response.status);
      return null;
    }

    const data = await response.json();
    return data.access_token ? data : null;
  } catch (error) {
    console.error('[Middleware] Token refresh error:', error);
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip middleware for API routes that use API key authentication
  if (isApiKeyRoute(pathname)) {
    return NextResponse.next();
  }

  // Skip auth routes
  if (pathname.startsWith("/api/auth/")) {
    return NextResponse.next();
  }

  // Check protected routes
  if (isProtectedRoute(pathname)) {
    const accessToken = req.cookies.get('kinde_access_token')?.value;
    const refreshToken = req.cookies.get('kinde_refresh_token')?.value;

    if (!accessToken) {
      // No access token at all — try refresh if we have a refresh token
      if (refreshToken) {
        const tokenData = await refreshAccessToken(refreshToken);
        if (tokenData) {
          // Set new cookies on the response and let the request through
          const response = NextResponse.next();
          const isSecure = req.nextUrl.protocol === 'https:' || process.env.NODE_ENV === 'production';

          response.cookies.set('kinde_access_token', tokenData.access_token, {
            httpOnly: true,
            secure: isSecure,
            sameSite: 'lax',
            maxAge: 86400 * 7,
            path: '/',
          });

          if (tokenData.refresh_token) {
            response.cookies.set('kinde_refresh_token', tokenData.refresh_token, {
              httpOnly: true,
              secure: isSecure,
              sameSite: 'lax',
              maxAge: 86400 * 30,
              path: '/',
            });
          }

          return response;
        }
      }

      // No refresh token or refresh failed — redirect to login
      return NextResponse.redirect(new URL('/api/auth/login?redirect=' + encodeURIComponent(pathname), req.url));
    }

    try {
      const decoded: any = jwtDecode(accessToken);
      const now = Math.floor(Date.now() / 1000);

      // Check if token is expired
      if (decoded.exp && decoded.exp < now) {
        // Token expired — try silent refresh
        if (refreshToken) {
          const tokenData = await refreshAccessToken(refreshToken);
          if (tokenData) {
            const response = NextResponse.next();
            const isSecure = req.nextUrl.protocol === 'https:' || process.env.NODE_ENV === 'production';

            response.cookies.set('kinde_access_token', tokenData.access_token, {
              httpOnly: true,
              secure: isSecure,
              sameSite: 'lax',
              maxAge: 86400 * 7,
              path: '/',
            });

            if (tokenData.refresh_token) {
              response.cookies.set('kinde_refresh_token', tokenData.refresh_token, {
                httpOnly: true,
                secure: isSecure,
                sameSite: 'lax',
                maxAge: 86400 * 30,
                path: '/',
              });
            }

            return response;
          }
        }

        // Refresh failed — redirect to login
        return NextResponse.redirect(new URL('/api/auth/login?redirect=' + encodeURIComponent(pathname), req.url));
      }
    } catch (error) {
      // Invalid token, redirect to login
      return NextResponse.redirect(new URL('/api/auth/login?redirect=' + encodeURIComponent(pathname), req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
    // Include v1 API routes
    '/v1(.*)',
  ],
};

