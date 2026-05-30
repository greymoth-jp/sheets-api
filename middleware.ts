import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED = ["/dashboard", "/projects", "/settings", "/welcome"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Auth gate for app routes
  const requiresAuth = PROTECTED.some((p) => pathname.startsWith(p));
  if (requiresAuth) {
    const session = request.cookies.get("better-auth.session_token");
    if (!session) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/projects/:path*",
    "/settings/:path*",
    "/welcome/:path*",
    "/api/auth/:path*",
  ],
};
