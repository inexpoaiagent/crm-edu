import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const PUBLIC_ROUTES = new Set([
  "/",
  "/portal/login",
  "/api/auth/login",
  "/api/auth/logout",
  "/api/portal/auth/login",
  "/api/portal/auth/logout",
  "/api/student-requests",
]);

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get("crm_session")?.value);

  if (PUBLIC_ROUTES.has(pathname)) return NextResponse.next();

  if (pathname.startsWith("/_next") || pathname.startsWith("/uploads/")) {
    return NextResponse.next();
  }

  if (!hasSession && pathname.startsWith("/api")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasSession && pathname.startsWith("/portal")) {
    return NextResponse.redirect(new URL("/portal/login", request.url));
  }

  if (!hasSession) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!favicon.ico).*)"],
};
