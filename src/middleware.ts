import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { UserRole } from "@prisma/client";

export default withAuth(
  function middleware(req: NextRequest) {
    const token = (req as any).nextauth?.token;
    const path = req.nextUrl.pathname;

    const response = NextResponse.next();

    // =========================
    // ROLE PROTECTION
    // =========================

    // Admin routes
    if (path.startsWith("/admin")) {
      if (
        token?.role !== UserRole.ADMIN &&
        token?.role !== UserRole.SUPER_ADMIN
      ) {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    }

    // Driver routes
    if (path.startsWith("/driver")) {
      if (token?.role !== UserRole.DRIVER) {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    }

    // Customer routes
    if (path.startsWith("/dashboard") || path.startsWith("/bookings")) {
      if (!token) {
        return NextResponse.redirect(new URL("/login", req.url));
      }
    }

    // =========================
    // CORS
    // =========================

    const origin = req.headers.get("origin");
    const allowedOrigins = [
      "https://joeymoves.com",
      "https://www.joeymoves.com",
    ];

    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set("Access-Control-Allow-Origin", origin);
      response.headers.set(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS"
      );
      response.headers.set(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization"
      );
    }

    // =========================
    // SECURITY HEADERS
    // =========================

    response.headers.set("X-DNS-Prefetch-Control", "on");
    response.headers.set("Strict-Transport-Security", "max-age=31536000");
    response.headers.set("X-Frame-Options", "SAMEORIGIN");
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-XSS-Protection", "1; mode=block");
    response.headers.set("Referrer-Policy", "origin-when-cross-origin");

    return response;
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/bookings/:path*",
    "/admin/:path*",
    "/driver/:path*",
  ],
};
