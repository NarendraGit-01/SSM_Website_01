import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
    const token = request.cookies.get("ssm-admin-token");
    const isLoginPage = request.nextUrl.pathname === "/admin/login";
    const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");
    const isApiLogin = request.nextUrl.pathname === "/api/admin/login";
    const isApiLogout = request.nextUrl.pathname === "/api/admin/logout";

    // API routes — let them through
    if (isApiLogin || isApiLogout) return NextResponse.next();

    // If accessing admin routes without a token → redirect to login
    if (isAdminRoute && !isLoginPage && !token) {
        const loginUrl = new URL("/admin/login", request.url);
        loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
        return NextResponse.redirect(loginUrl);
    }

    // If already logged in and accessing login page → redirect to dashboard
    if (isLoginPage && token) {
        return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*", "/api/admin/:path*"],
};
