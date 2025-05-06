import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { db } from "@/lib/db";
import { users, insertUserSchema } from "@/shared/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // التحقق من البيانات المقدمة
    const { username, email, password } = body;

    if (!username || !email || !password) {
      return NextResponse.json(
        { 
          success: false, 
          message: "يرجى توفير جميع البيانات المطلوبة" 
        },
        { status: 400 }
      );
    }

    // التحقق من عدم وجود مستخدم بنفس اسم المستخدم
    const existingUsername = await db.query.users.findFirst({
      where: eq(users.username, username),
    });

    if (existingUsername) {
      return NextResponse.json(
        { 
          success: false, 
          message: "اسم المستخدم موجود بالفعل", 
        },
        { status: 400 }
      );
    }

    // التحقق من عدم وجود مستخدم بنفس البريد الإلكتروني
    const existingEmail = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingEmail) {
      return NextResponse.json(
        { 
          success: false, 
          message: "البريد الإلكتروني مستخدم بالفعل", 
        },
        { status: 400 }
      );
    }

    // تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash(password, 10);

    // إنشاء المستخدم
    try {
      const newUser = await db.insert(users).values({
        username,
        email,
        password: hashedPassword,
        name: username, // يمكن استخدام اسم المستخدم كاسم افتراضي
        role: "user", // دور افتراضي
        isActive: true,
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning();

      // إنشاء cookie للجلسة
      const cookieStore = cookies();
      cookieStore.set("user_id", String(newUser[0].id), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 7 أيام
        path: "/",
      });

      // إرجاع بيانات المستخدم بدون كلمة المرور
      const { password: _, ...userWithoutPassword } = newUser[0];

      return NextResponse.json(userWithoutPassword, { status: 201 });
    } catch (error) {
      console.error("Error creating user:", error);
      return NextResponse.json(
        { success: false, message: "حدث خطأ أثناء إنشاء المستخدم" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { success: false, message: "حدث خطأ أثناء التسجيل" },
      { status: 500 }
    );
  }
}
