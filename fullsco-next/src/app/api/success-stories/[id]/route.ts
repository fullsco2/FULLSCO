import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { successStories } from "@/shared/schema";
import { eq } from "drizzle-orm";

// الحصول على قصة نجاح محددة
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { message: "معرف قصة النجاح غير صالح" },
        { status: 400 }
      );
    }

    const story = await db.query.successStories.findFirst({
      where: eq(successStories.id, id),
    });

    if (!story) {
      return NextResponse.json(
        { message: "لم يتم العثور على قصة النجاح" },
        { status: 404 }
      );
    }

    return NextResponse.json(story, { status: 200 });
  } catch (error) {
    console.error("خطأ في جلب قصة النجاح:", error);
    return NextResponse.json(
      { message: "حدث خطأ أثناء جلب قصة النجاح" },
      { status: 500 }
    );
  }
}

// تحديث قصة نجاح محددة
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { message: "معرف قصة النجاح غير صالح" },
        { status: 400 }
      );
    }

    // جلب البيانات من الطلب
    const data = await request.json();

    // تحديث قصة النجاح
    const [updatedStory] = await db
      .update(successStories)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(successStories.id, id))
      .returning();

    if (!updatedStory) {
      return NextResponse.json(
        { message: "لم يتم العثور على قصة النجاح" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedStory, { status: 200 });
  } catch (error) {
    console.error("خطأ في تحديث قصة النجاح:", error);
    return NextResponse.json(
      { message: "حدث خطأ أثناء تحديث قصة النجاح" },
      { status: 500 }
    );
  }
}

// حذف قصة نجاح محددة
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { message: "معرف قصة النجاح غير صالح" },
        { status: 400 }
      );
    }

    // حذف قصة النجاح
    const [deletedStory] = await db
      .delete(successStories)
      .where(eq(successStories.id, id))
      .returning();

    if (!deletedStory) {
      return NextResponse.json(
        { message: "لم يتم العثور على قصة النجاح" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "تم حذف قصة النجاح بنجاح" },
      { status: 200 }
    );
  } catch (error) {
    console.error("خطأ في حذف قصة النجاح:", error);
    return NextResponse.json(
      { message: "حدث خطأ أثناء حذف قصة النجاح" },
      { status: 500 }
    );
  }
}
