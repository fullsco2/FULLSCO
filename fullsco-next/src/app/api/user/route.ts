import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { message: "غير مصادق عليه" },
        { status: 401 }
      );
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error("خطأ أثناء جلب بيانات المستخدم:", error);
    return NextResponse.json(
      { message: "حدث خطأ أثناء جلب بيانات المستخدم" },
      { status: 500 }
    );
  }
}
