import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    // حذف ملف تعريف الارتباط (cookie) الخاص بالمستخدم
    const cookieStore = cookies();
    cookieStore.delete("user_id");

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("خطأ أثناء تسجيل الخروج:", error);
    return NextResponse.json(
      { message: "حدث خطأ أثناء تسجيل الخروج" },
      { status: 500 }
    );
  }
}
