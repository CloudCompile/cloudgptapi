import { withAuth } from "@kinde-oss/kinde-auth-nextjs/middleware";
import { NextRequest, NextResponse } from "next/server";

export default async function middleware(req: NextRequest) {
  // Let Next.js route handlers manage their own API authentication using the Node runtime
  // For page routes: use Kinde's default redirect-to-login behavior at the Edge
  return withAuth(req, {
    isReturnToCurrentPage: true,
  });
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
  ],
};
