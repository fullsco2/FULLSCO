import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getUserFromSession } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // الصفحات التي يمكن الوصول إليها بدون مصادقة
  const publicPaths = ['/auth', '/', '/scholarships', '/articles', '/success-stories'];
  const isPublicPath = publicPaths.some(publicPath => 
    path === publicPath || path.startsWith(`${publicPath}/`)
  );
  
  // التحقق مما إذا كان المسار هو مسار لوحة التحكم
  const isAdminPath = path.startsWith('/admin');
  
  // الحصول على معلومات المستخدم من الجلسة
  const user = getUserFromSession(request);
  
  // إعادة توجيه المستخدم غير المصادق من صفحات لوحة التحكم إلى صفحة تسجيل الدخول
  if (isAdminPath && !user) {
    return NextResponse.redirect(new URL('/auth', request.url));
  }
  
  // التحقق من دور المستخدم للوصول إلى لوحة التحكم
  if (isAdminPath && user && user.role !== 'admin') {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  // إعادة توجيه المستخدم المصادق من صفحة تسجيل الدخول إلى لوحة التحكم
  if (path === '/auth' && user) {
    return NextResponse.redirect(new URL(user.role === 'admin' ? '/admin/dashboard' : '/', request.url));
  }
  
  return NextResponse.next();
}

// تكوين المسارات التي سيتم تطبيق الوسيط عليها
export const config = {
  matcher: [
    '/admin/:path*',
    '/auth'
  ],
};
