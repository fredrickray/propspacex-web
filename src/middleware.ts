import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Auth middleware — protects /admin and /buyer routes.
 * Replace the placeholder logic below with your real auth check
 * (e.g. verify a JWT cookie, session token, etc.).
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Public routes that never require auth ──
  const publicPaths = ["/", "/auth"];
  const isPublic = publicPaths.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );

  if (isPublic) {
    return NextResponse.next();
  }

  // ── TODO: Uncomment the block below when connecting to your auth backend ──
  // const token =
  //   request.cookies.get("auth-token")?.value ||
  //   request.cookies.get("next-auth.session-token")?.value;
  //
  // if (!token) {
  //   const loginUrl = new URL("/auth/login", request.url);
  //   loginUrl.searchParams.set("callbackUrl", pathname);
  //   return NextResponse.redirect(loginUrl);
  // }

  // ── Role-based access ──
  // TODO: Decode the token and check roles. For now, allow all authenticated users.
  // Example: if (pathname.startsWith("/admin") && !isAdmin(token)) { redirect to /buyer }

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
