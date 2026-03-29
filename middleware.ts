import { withAuth } from "@kinde-oss/kinde-auth-nextjs/middleware";
import { NextRequest } from "next/server";

export default function middleware(req: NextRequest) {
  return withAuth(req, {
    isReturnToCurrentPage: true,
  });
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/api/keys/:path*",
    "/api/profile/:path*",
    "/api/usage/:path*",
  ],
};
