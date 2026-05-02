import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip API routes — they handle their own auth
  if (pathname.startsWith("/api/")) return NextResponse.next();
  if (pathname.startsWith("/_next/")) return NextResponse.next();
  if (pathname.includes(".")) return NextResponse.next(); // static files

  const name = request.cookies.get("derby_name")?.value?.trim();

  // No name → must go to homepage to enter name
  if (!name && pathname !== "/") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Has name but is on homepage → send to pick page
  // (pick page itself will redirect to results if they already picked)
  if (name && pathname === "/") {
    return NextResponse.redirect(new URL("/pick", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
