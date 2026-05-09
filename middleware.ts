import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

import type { Role } from "@prisma/client";

const SEGMENT_ROLES: { match: RegExp; allow: Role[] }[] = [
  { match: /^\/admin(\/|$)/, allow: ["ADMIN"] },
  { match: /^\/seller(\/|$)/, allow: ["SELLER", "AGENT", "ADMIN"] },
  { match: /^\/dashboard(\/|$)/, allow: ["BUYER", "SELLER", "AGENT", "ADMIN"] },
];

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    if (!token) return NextResponse.next();

    if (pathname !== "/complete-profile" && !token.phone) {
      const url = req.nextUrl.clone();
      url.pathname = "/complete-profile";
      url.search = "";
      return NextResponse.redirect(url);
    }

    const segment = SEGMENT_ROLES.find((s) => s.match.test(pathname));
    if (segment) {
      const role = (token.role ?? "BUYER") as Role;
      if (!segment.allow.includes(role)) {
        const url = req.nextUrl.clone();
        url.pathname = "/";
        url.search = "";
        return NextResponse.redirect(url);
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => Boolean(token),
    },
    pages: { signIn: "/login" },
  },
);

export const config = {
  matcher: ["/dashboard/:path*", "/seller/:path*", "/admin/:path*", "/complete-profile"],
};
