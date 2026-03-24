import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequestEdge, verifyTokenEdge } from "@/lib/auth-edge";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = getTokenFromRequestEdge(req);
  const user = token ? await verifyTokenEdge(token) : null;

  // ── Admin routes ─────────────────────────────────────────────────
  if (pathname.startsWith("/admin")) {
    if (!user || user.role !== "admin") {
      return NextResponse.redirect(new URL("/admin-login", req.url));
    }
  }

  // ── Profile routes (auth required) ───────────────────────────────
  if (pathname.startsWith("/profile")) {
    if (!user) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // ── Login/Register: redirect already-authenticated users ─────────
  if ((pathname === "/login" || pathname === "/register") && user) {
    return NextResponse.redirect(new URL("/profile", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/profile/:path*", "/login", "/register"],
};
