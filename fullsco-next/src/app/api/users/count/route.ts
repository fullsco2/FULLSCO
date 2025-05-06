import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/shared/schema";
import { count } from "drizzle-orm";
import { isAdmin } from "@/lib/auth";

export async function GET() {
  try {
    // التحقق من أن المستخدم مسؤول
    const adminUser = await isAdmin();
    if (!adminUser) {
      return NextResponse.json(
        { message: "غير مصرح به: يجب أن تكون مسؤولًا" },
        { status: 403 }
      );
    }

    const result = await db.select({ count: count() }).from(users);
    return NextResponse.json({ count: result[0].count }, { status: 200 });
  } catch (error) {
    console.error("خطأ في جلب عدد المستخدمين:", error);
    return NextResponse.json(
      { message: "حدث خطأ أثناء جلب عدد المستخدمين" },
      { status: 500 }
    );
  }
}
