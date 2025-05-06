import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { users } from "@/shared/schema";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

// تحويل scrypt إلى دالة async/await
const scryptAsync = promisify(scrypt);

/**
 * تشفير كلمة المرور
 */
async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function POST(request: NextRequest) {
  try {
    const { username, email, password } = await request.json();

    // التحقق من توفر كافة الحقول المطلوبة
    if (!username || !email || !password) {
      return NextResponse.json(
        { message: "يجب توفير اسم المستخدم والبريد الإلكتروني وكلمة المرور" },
        { status: 400 }
      );
    }

    // التحقق من عدم وجود اسم المستخدم أو البريد الإلكتروني مسبقاً
    const existingUser = await db.query.users.findFirst({
      where: eq(users.username, username),
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "اسم المستخدم موجود بالفعل" },
        { status: 400 }
      );
    }

    const existingEmail = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingEmail) {
      return NextResponse.json(
        { message: "البريد الإلكتروني مستخدم بالفعل" },
        { status: 400 }
      );
    }

    // تشفير كلمة المرور
    const hashedPassword = await hashPassword(password);

    // إنشاء المستخدم الجديد
    const [newUser] = await db.insert(users).values({
      username,
      email,
      password: hashedPassword,
      role: "user", // الدور الافتراضي للمستخدمين الجدد
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();

    // إعداد ملف تعريف الارتباط (كوكي)
    const cookieStore = cookies();
    cookieStore.set("user_id", newUser.id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 أيام
      path: "/",
    });

    // إرجاع بيانات المستخدم بدون كلمة المرور
    const { password: _, ...userWithoutPassword } = newUser;
    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    console.error("خطأ أثناء إنشاء الحساب:", error);
    return NextResponse.json(
      { message: "حدث خطأ أثناء إنشاء الحساب" },
      { status: 500 }
    );
  }
}
