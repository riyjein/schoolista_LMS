import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/" || pathname.startsWith("/auth")) {
    return NextResponse.redirect(new URL("/faculty-evaluation", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/auth/:path*"],
};
