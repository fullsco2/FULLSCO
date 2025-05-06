import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    // حذف ملف تعريف cookie
    const cookieStore = cookies();
    cookieStore.delete("user_id");

    // إرجاع استجابة نجاح
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { success: false, message: "حدث خطأ أثناء تسجيل الخروج" },
      { status: 500 }
    );
  }
}
