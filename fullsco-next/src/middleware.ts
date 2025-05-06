import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "./lib/auth";

// المسارات التي تتطلب مصادقة
const protectedRoutes = [
  "/admin",
  "/profile",
  "/settings",
];

// المسارات التي يجب ألا يتم الوصول إليها في حالة تسجيل الدخول
const authRoutes = [
  "/auth",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // التحقق من حالة المصادقة
  const isUserAuthenticated = await isAuthenticated();

  // إذا كان المسار يتطلب مصادقة وليس هناك مستخدم مسجل الدخول
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  if (isProtectedRoute && !isUserAuthenticated) {
    const url = new URL("/auth", request.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  // إذا كان المسار خاص بالمصادقة والمستخدم مسجل الدخول بالفعل
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));
  if (isAuthRoute && isUserAuthenticated) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * مطابقة جميع المسارات المحمية ومسارات المصادقة
     */
    ...protectedRoutes,
    ...authRoutes,
  ],
};
