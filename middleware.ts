import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);
// API routes that use API key authentication instead of Clerk session
const isApiKeyRoute = createRouteMatcher(["/v1(.*)", "/api/keys(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  // Skip Clerk auth for API routes - they use API key authentication
  if (isApiKeyRoute(req)) {
    return;
  }
  if (isProtectedRoute(req)) await auth.protect();
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
