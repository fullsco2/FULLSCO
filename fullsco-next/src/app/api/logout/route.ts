// api/logout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { removeSessionCookie } from '@/lib/auth';

// مسار تسجيل الخروج - POST /api/logout
export async function POST(req: NextRequest) {
  try {
    // إنشاء كوكي الخروج
    const logoutCookie = removeSessionCookie();

    // إنشاء الرد مع كوكي الخروج
    const response = NextResponse.json(
      { message: 'تم تسجيل الخروج بنجاح' },
      { status: 200 }
    );

    // إضافة كوكي الخروج إلى الرد
    response.cookies.set(logoutCookie.name, logoutCookie.value, logoutCookie.options);

    return response;
  } catch (error: any) {
    console.error('Error during logout:', error);
    return NextResponse.json(
      { message: `خطأ أثناء تسجيل الخروج: ${error.message}` },
      { status: 500 }
    );
  }
}
