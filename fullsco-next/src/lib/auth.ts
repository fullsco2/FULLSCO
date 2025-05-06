import { cookies } from "next/headers";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { users } from "@/shared/schema";
import { scrypt, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

/**
 * مقارنة كلمات المرور بأمان
 */
export async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

/**
 * التحقق من المصادقة
 */
export async function isAuthenticated() {
  try {
    const cookieStore = cookies();
    const userId = cookieStore.get("user_id")?.value;

    if (!userId) {
      return false;
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, parseInt(userId)),
    });

    return !!user;
  } catch (error) {
    console.error("خطأ في التحقق من المصادقة:", error);
    return false;
  }
}

/**
 * الحصول على بيانات المستخدم الحالي
 */
export async function getCurrentUser() {
  try {
    const cookieStore = cookies();
    const userId = cookieStore.get("user_id")?.value;

    if (!userId) {
      return null;
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, parseInt(userId)),
    });

    if (!user) {
      return null;
    }

    // إزالة كلمة المرور من بيانات المستخدم قبل إرجاعها
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    console.error("خطأ في الحصول على بيانات المستخدم الحالي:", error);
    return null;
  }
}

/**
 * التحقق من صلاحيات المستخدم
 */
export async function hasPermission(permission: string) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return false;
    }

    // للتبسيط، سنفترض أن المستخدم بدور "admin" لديه جميع الصلاحيات
    if (user.role === "admin") {
      return true;
    }

    // يمكن تنفيذ منطق أكثر تعقيدًا للتحقق من الصلاحيات حسب احتياجات التطبيق
    return false;
  } catch (error) {
    console.error("خطأ في التحقق من الصلاحيات:", error);
    return false;
  }
}

/**
 * التحقق من أن المستخدم هو مسؤول النظام
 */
export async function isAdmin() {
  try {
    const user = await getCurrentUser();
    return user?.role === "admin";
  } catch (error) {
    console.error("خطأ في التحقق من صلاحيات المسؤول:", error);
    return false;
  }
}
