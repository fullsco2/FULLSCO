import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { scholarships } from "@/shared/schema";
import { eq } from "drizzle-orm";

// الحصول على منحة دراسية محددة
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { message: "معرف المنحة الدراسية غير صالح" },
        { status: 400 }
      );
    }

    const scholarship = await db.query.scholarships.findFirst({
      where: eq(scholarships.id, id),
      with: {
        country: true,
        level: true,
        category: true,
      },
    });

    if (!scholarship) {
      return NextResponse.json(
        { message: "لم يتم العثور على المنحة الدراسية" },
        { status: 404 }
      );
    }

    return NextResponse.json(scholarship, { status: 200 });
  } catch (error) {
    console.error("خطأ في جلب المنحة الدراسية:", error);
    return NextResponse.json(
      { message: "حدث خطأ أثناء جلب المنحة الدراسية" },
      { status: 500 }
    );
  }
}

// تحديث منحة دراسية محددة
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { message: "معرف المنحة الدراسية غير صالح" },
        { status: 400 }
      );
    }

    // جلب البيانات من الطلب
    const data = await request.json();

    // تحديث المنحة الدراسية
    const [updatedScholarship] = await db
      .update(scholarships)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(scholarships.id, id))
      .returning();

    if (!updatedScholarship) {
      return NextResponse.json(
        { message: "لم يتم العثور على المنحة الدراسية" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedScholarship, { status: 200 });
  } catch (error) {
    console.error("خطأ في تحديث المنحة الدراسية:", error);
    return NextResponse.json(
      { message: "حدث خطأ أثناء تحديث المنحة الدراسية" },
      { status: 500 }
    );
  }
}

// حذف منحة دراسية محددة
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { message: "معرف المنحة الدراسية غير صالح" },
        { status: 400 }
      );
    }

    // حذف المنحة الدراسية
    const [deletedScholarship] = await db
      .delete(scholarships)
      .where(eq(scholarships.id, id))
      .returning();

    if (!deletedScholarship) {
      return NextResponse.json(
        { message: "لم يتم العثور على المنحة الدراسية" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "تم حذف المنحة الدراسية بنجاح" },
      { status: 200 }
    );
  } catch (error) {
    console.error("خطأ في حذف المنحة الدراسية:", error);
    return NextResponse.json(
      { message: "حدث خطأ أثناء حذف المنحة الدراسية" },
      { status: 500 }
    );
  }
}
