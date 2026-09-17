import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth/session-token";

// Quick check for admin routes: send visitors without a validly signed
// session cookie to the login page. It does not touch the database, so a
// signed-out or disabled admin can still pass here; requireAdmin() in
// lib/auth/session.ts does the full check in every admin page and action.
export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === "/admin/login") return NextResponse.next();

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!verifySessionToken(token, process.env.SESSION_SECRET)) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
