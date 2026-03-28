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

export function middleware(req: NextRequest) {
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

    if (!accessToken) {
      // Redirect to login
      return NextResponse.redirect(new URL('/api/auth/login?redirect=' + encodeURIComponent(pathname), req.url));
    }

    try {
      const decoded: any = jwtDecode(accessToken);
      const now = Math.floor(Date.now() / 1000);

      // Check if token is expired
      if (decoded.exp && decoded.exp < now) {
        // Redirect to login if token expired
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
