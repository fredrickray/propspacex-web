import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthRoute = pathname === "/auth" || pathname.startsWith("/auth/");
  const isProtectedRoute =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/agent") ||
    pathname.startsWith("/buyer");

  if (!isAuthRoute && !isProtectedRoute) return NextResponse.next();

  const token = request.cookies.get("propspacex_auth_token")?.value;
  const role = request.cookies.get("propspacex_role")?.value;

  if (isProtectedRoute && !token) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname.startsWith("/admin") && role !== "admin") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (pathname.startsWith("/agent") && role !== "agent") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (pathname.startsWith("/buyer") && role !== "buyer") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (isAuthRoute && token) {
    if (role === "admin") return NextResponse.redirect(new URL("/admin", request.url));
    if (role === "agent") return NextResponse.redirect(new URL("/agent", request.url));
    if (role === "buyer") return NextResponse.redirect(new URL("/buyer", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all routes except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, sitemap.xml, robots.txt
     * - public assets
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
