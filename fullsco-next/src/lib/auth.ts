import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { createHash } from "crypto";

// استيراد أنواع وجداول المستخدمين
import { users } from "@/shared/schema";

/**
 * التحقق مما إذا كان المستخدم مسجل الدخول من خلال فحص ملف تعريف الارتباط
 */
export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = cookies();
  const userId = cookieStore.get("user_id")?.value;

  if (!userId) return false;

  // التحقق من وجود المستخدم في قاعدة البيانات
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, parseInt(userId)),
    });

    return !!user;
  } catch (error) {
    console.error("خطأ أثناء التحقق من المصادقة:", error);
    return false;
  }
}

/**
 * الحصول على بيانات المستخدم الحالي
 */
export async function getCurrentUser() {
  const cookieStore = cookies();
  const userId = cookieStore.get("user_id")?.value;

  if (!userId) return null;

  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, parseInt(userId)),
    });

    if (!user) return null;

    // إرجاع بيانات المستخدم بدون كلمة المرور
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    console.error("خطأ أثناء جلب بيانات المستخدم الحالي:", error);
    return null;
  }
}

/**
 * إنشاء توكن CSRF لحماية النماذج
 */
export function generateCsrfToken(): string {
  const timestamp = Date.now().toString();
  const randomString = Math.random().toString(36).substring(2, 15);
  const data = `${timestamp}:${randomString}`;
  
  return createHash("sha256").update(data).digest("hex");
}

/**
 * التحقق من صحة توكن CSRF
 */
export function validateCsrfToken(token: string): boolean {
  // في التطبيق الحقيقي، يجب مقارنة التوكن مع القيمة المخزنة في الجلسة
  // هذا مجرد تنفيذ بسيط للعرض
  return token && token.length === 64; // التحقق من طول التوكن المتوقع من sha256
}

/**
 * تأمين الصفحات التي تتطلب مصادقة
 */
export async function requireAuth(request: NextRequest) {
  // التحقق مما إذا كان المستخدم مسجل الدخول
  const authenticated = await isAuthenticated();
  
  if (!authenticated) {
    // إعادة توجيه المستخدم إلى صفحة تسجيل الدخول
    const url = new URL("/auth", request.url);
    url.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  
  return null; // السماح بالوصول للصفحة
}
