// api/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getUserByUsername, hashPassword, createSessionCookie } from '@/lib/auth';
import { db } from '@/lib/db';
import { users } from '@/shared/schema';

// مسار إنشاء حساب جديد - POST /api/register
export async function POST(req: NextRequest) {
  try {
    // استخراج بيانات المستخدم من طلب JSON
    const { username, email, password } = await req.json();

    // التحقق من وجود جميع الحقول المطلوبة
    if (!username || !email || !password) {
      return NextResponse.json(
        { message: 'يرجى توفير جميع الحقول المطلوبة' },
        { status: 400 }
      );
    }

    // التحقق من صحة تنسيق البريد الإلكتروني
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: 'يرجى توفير بريد إلكتروني صحيح' },
        { status: 400 }
      );
    }

    // التحقق من طول كلمة المرور
    if (password.length < 8) {
      return NextResponse.json(
        { message: 'يجب أن تكون كلمة المرور 8 أحرف على الأقل' },
        { status: 400 }
      );
    }

    // التحقق من عدم وجود المستخدم بالفعل
    const existingUser = await getUserByUsername(username);
    if (existingUser) {
      return NextResponse.json(
        { message: 'اسم المستخدم مستخدم بالفعل' },
        { status: 400 }
      );
    }

    // تشفير كلمة المرور
    const hashedPassword = await hashPassword(password);

    // إنشاء المستخدم الجديد في قاعدة البيانات
    const [newUser] = await db
      .insert(users)
      .values({
        username,
        email,
        password: hashedPassword,
        role: 'user', // دور افتراضي للمستخدمين الجدد
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    // إنشاء جلسة للمستخدم
    const sessionCookie = createSessionCookie({
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
      name: newUser.name,
      avatar: newUser.avatar,
    });

    // إنشاء الرد مع كوكي الجلسة
    const response = NextResponse.json(
      {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        name: newUser.name,
        avatar: newUser.avatar,
        createdAt: newUser.createdAt,
        updatedAt: newUser.updatedAt,
      },
      { status: 201 }
    );

    // إضافة كوكي الجلسة إلى الرد
    response.cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.options);

    return response;
  } catch (error: any) {
    console.error('Error during registration:', error);
    return NextResponse.json(
      { message: `خطأ أثناء التسجيل: ${error.message}` },
      { status: 500 }
    );
  }
}
