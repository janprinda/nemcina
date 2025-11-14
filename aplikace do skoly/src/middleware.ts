import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public assets and auth routes
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/robots.txt") ||
    pathname.startsWith("/sitemap.xml") ||
    pathname.startsWith("/uploads/") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/api/auth")
  ) {
    return NextResponse.next();
  }

  // Ověřit skutečný NextAuth JWT token, ne jen existenci cookie
  const token = await getToken({ req });
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/auth";
    url.searchParams.set("callbackUrl", req.nextUrl.pathname + req.nextUrl.search);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/:path*"],
};
