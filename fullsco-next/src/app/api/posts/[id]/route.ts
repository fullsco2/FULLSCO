import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { posts } from "@/shared/schema";
import { eq } from "drizzle-orm";

// الحصول على مقال محدد
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { message: "معرف المقال غير صالح" },
        { status: 400 }
      );
    }

    const post = await db.query.posts.findFirst({
      where: eq(posts.id, id),
      with: {
        author: true,
        category: true,
      },
    });

    if (!post) {
      return NextResponse.json(
        { message: "لم يتم العثور على المقال" },
        { status: 404 }
      );
    }

    return NextResponse.json(post, { status: 200 });
  } catch (error) {
    console.error("خطأ في جلب المقال:", error);
    return NextResponse.json(
      { message: "حدث خطأ أثناء جلب المقال" },
      { status: 500 }
    );
  }
}

// تحديث مقال محدد
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { message: "معرف المقال غير صالح" },
        { status: 400 }
      );
    }

    // جلب البيانات من الطلب
    const data = await request.json();

    // تحديث المقال
    const [updatedPost] = await db
      .update(posts)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(posts.id, id))
      .returning();

    if (!updatedPost) {
      return NextResponse.json(
        { message: "لم يتم العثور على المقال" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedPost, { status: 200 });
  } catch (error) {
    console.error("خطأ في تحديث المقال:", error);
    return NextResponse.json(
      { message: "حدث خطأ أثناء تحديث المقال" },
      { status: 500 }
    );
  }
}

// حذف مقال محدد
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { message: "معرف المقال غير صالح" },
        { status: 400 }
      );
    }

    // حذف المقال
    const [deletedPost] = await db
      .delete(posts)
      .where(eq(posts.id, id))
      .returning();

    if (!deletedPost) {
      return NextResponse.json(
        { message: "لم يتم العثور على المقال" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "تم حذف المقال بنجاح" },
      { status: 200 }
    );
  } catch (error) {
    console.error("خطأ في حذف المقال:", error);
    return NextResponse.json(
      { message: "حدث خطأ أثناء حذف المقال" },
      { status: 500 }
    );
  }
}
