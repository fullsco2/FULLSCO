import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // الصفحات التي يمكن الوصول إليها بدون مصادقة
  const publicPaths = ['/login', '/register', '/', '/scholarships', '/articles', '/success-stories'];
  const isPublicPath = publicPaths.some(publicPath => 
    path === publicPath || path.startsWith(`${publicPath}/`)
  );
  
  // التحقق مما إذا كان المسار هو مسار لوحة التحكم
  const isAdminPath = path.startsWith('/admin');
  
  // الحصول على توكن المصادقة
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET
  });
  
  // إعادة توجيه المستخدم غير المصادق من صفحات لوحة التحكم إلى صفحة تسجيل الدخول
  if (isAdminPath && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // التحقق من دور المستخدم للوصول إلى لوحة التحكم
  if (isAdminPath && token && token.role !== 'admin') {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  // إعادة توجيه المستخدم المصادق من صفحة تسجيل الدخول إلى لوحة التحكم
  if (path === '/login' && token) {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }
  
  return NextResponse.next();
}

// تكوين المسارات التي سيتم تطبيق الوسيط عليها
export const config = {
  matcher: [
    '/admin/:path*',
    '/login',
    '/register'
  ],
};
