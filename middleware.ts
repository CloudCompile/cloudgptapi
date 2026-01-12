import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// API routes that use API key authentication instead of session
const isApiKeyRoute = (path: string) => {
  return path.startsWith("/v1") || 
         path.startsWith("/api/keys") || 
         path.startsWith("/api/video") || 
         path.startsWith("/api/image");
};

// Logto specific routes that Clerk should ignore
const isLogtoRoute = (path: string) => {
  return path.startsWith("/api/logto") || 
         path.startsWith("/oidc") || 
         path.startsWith("/.well-known");
};

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;

  // Skip Clerk for API routes and Logto routes
  if (isApiKeyRoute(pathname) || isLogtoRoute(pathname)) {
    return NextResponse.next();
  }

  // Protect dashboard routes with Clerk
  if (isProtectedRoute(req)) {
    await auth.protect();
  }

  return NextResponse.next();
});

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
