// api/user/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getUserFromSessionServer } from '@/lib/auth';

// مسار جلب بيانات المستخدم الحالي - GET /api/user
export async function GET(req: NextRequest) {
  try {
    // جلب المستخدم من الجلسة
    const user = getUserFromSessionServer();

    // التحقق من وجود المستخدم
    if (!user) {
      return NextResponse.json(
        { message: 'غير مصرح له' },
        { status: 401 }
      );
    }

    // إرجاع بيانات المستخدم بدون كلمة المرور
    return NextResponse.json(user, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { message: `خطأ في جلب بيانات المستخدم: ${error.message}` },
      { status: 500 }
    );
  }
}
