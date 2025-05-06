// api/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getUserByUsername, verifyPassword, createSessionCookie } from '@/lib/auth';

// مسار تسجيل الدخول - POST /api/login
export async function POST(req: NextRequest) {
  try {
    // استخراج بيانات المستخدم من طلب JSON
    const { username, password } = await req.json();

    // التحقق من وجود اسم المستخدم وكلمة المرور
    if (!username || !password) {
      return NextResponse.json(
        { message: 'يرجى توفير اسم المستخدم وكلمة المرور' },
        { status: 400 }
      );
    }

    // البحث عن المستخدم في قاعدة البيانات
    const user = await getUserByUsername(username);

    // التحقق من وجود المستخدم وصحة كلمة المرور
    if (!user || !(await verifyPassword(password, user.password))) {
      return NextResponse.json(
        { message: 'اسم المستخدم أو كلمة المرور غير صحيحة' },
        { status: 401 }
      );
    }

    // إنشاء جلسة للمستخدم
    const sessionCookie = createSessionCookie({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      name: user.name,
      avatar: user.avatar,
    });

    // إنشاء الرد مع كوكي الجلسة
    const response = NextResponse.json(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        name: user.name,
        avatar: user.avatar,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      { status: 200 }
    );

    // إضافة كوكي الجلسة إلى الرد
    response.cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.options);

    return response;
  } catch (error: any) {
    console.error('Error during login:', error);
    return NextResponse.json(
      { message: `خطأ أثناء تسجيل الدخول: ${error.message}` },
      { status: 500 }
    );
  }
}
