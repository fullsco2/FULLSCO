import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { db } from "@/lib/db";
import { users } from "@/shared/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: "يرجى توفير اسم المستخدم وكلمة المرور" },
        { status: 400 }
      );
    }

    // البحث عن المستخدم باستخدام اسم المستخدم أو البريد الإلكتروني
    const user = await db.query.users.findFirst({
      where: (
        username.includes("@") 
          ? eq(users.email, username) 
          : eq(users.username, username)
      ),
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "اسم المستخدم أو كلمة المرور غير صحيحة" },
        { status: 401 }
      );
    }

    // التحقق من كلمة المرور
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return NextResponse.json(
        { success: false, message: "اسم المستخدم أو كلمة المرور غير صحيحة" },
        { status: 401 }
      );
    }

    // إنشاء JWT token إذا كان مطلوبًا
    // const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET as string, { expiresIn: '7d' });

    // إنشاء cookie للجلسة
    const cookieStore = cookies();
    cookieStore.set("user_id", String(user.id), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 أيام
      path: "/",
    });

    // إرجاع بيانات المستخدم بدون كلمة المرور
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(userWithoutPassword, { status: 200 });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, message: "حدث خطأ أثناء تسجيل الدخول" },
      { status: 500 }
    );
  }
}
