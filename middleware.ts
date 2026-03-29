import { withAuth } from "@kinde-oss/kinde-auth-nextjs/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

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

export default withAuth(async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip middleware for API routes that use API key authentication
  if (isApiKeyRoute(pathname)) {
    return NextResponse.next();
  }

  if (isProtectedRoute(pathname)) {
    // withAuth already handles redirect to login if unauthenticated
    // You can add role checks here if needed
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|api/auth|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/v1(.*)",
  ],
};
