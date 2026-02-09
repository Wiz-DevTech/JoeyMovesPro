import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { UserRole } from "@prisma/client";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Admin routes
    if (path.startsWith("/admin")) {
      if (token?.role !== UserRole.ADMIN && token?.role !== UserRole.SUPER_ADMIN) {
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

    return NextResponse.next();
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