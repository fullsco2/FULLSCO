import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/shared/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    // الحصول على معرف المستخدم من cookie
    const cookieStore = cookies();
    const userId = cookieStore.get("user_id")?.value;

    if (!userId) {
      return NextResponse.json(null, { status: 401 });
    }

    // البحث عن المستخدم في قاعدة البيانات
    const user = await db.query.users.findFirst({
      where: eq(users.id, parseInt(userId)),
    });

    if (!user) {
      // إذا لم يتم العثور على المستخدم، قم بإزالة ملف تعريف cookie
      cookieStore.delete("user_id");
      return NextResponse.json(null, { status: 401 });
    }

    // إرجاع بيانات المستخدم بدون كلمة المرور
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(userWithoutPassword, { status: 200 });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { success: false, message: "حدث خطأ أثناء جلب بيانات المستخدم" },
      { status: 500 }
    );
  }
}
