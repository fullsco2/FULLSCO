import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { successStories } from "@/shared/schema";
import { desc, eq, or, ilike } from "drizzle-orm";

// جلب قائمة قصص النجاح مع دعم البحث والتصفية والترقيم
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get("keyword");
    const published = searchParams.get("published");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    // البناء الأساسي للاستعلام
    let query = db.select().from(successStories).orderBy(desc(successStories.createdAt));

    // إضافة فلتر البحث إذا تم توفيره
    if (keyword) {
      query = query.where(
        or(
          ilike(successStories.name, `%${keyword}%`),
          ilike(successStories.description, `%${keyword}%`),
          ilike(successStories.university, `%${keyword}%`),
          ilike(successStories.major, `%${keyword}%`)
        )
      );
    }

    // إضافة فلتر النشر إذا تم توفيره
    if (published !== null && published !== undefined) {
      const isPublished = published === "true";
      query = query.where(eq(successStories.published, isPublished));
    }

    // عد إجمالي النتائج للترقيم
    const countQuery = db
      .select({ count: db.fn.count() })
      .from(successStories)
      .as("count");

    // نسخ شروط البحث للعد
    if (keyword) {
      countQuery.where(
        or(
          ilike(successStories.name, `%${keyword}%`),
          ilike(successStories.description, `%${keyword}%`),
          ilike(successStories.university, `%${keyword}%`),
          ilike(successStories.major, `%${keyword}%`)
        )
      );
    }

    if (published !== null && published !== undefined) {
      const isPublished = published === "true";
      countQuery.where(eq(successStories.published, isPublished));
    }

    // تنفيذ الاستعلامات
    const [stories, totalResults] = await Promise.all([
      query.limit(limit).offset(offset),
      db.select({ count: db.fn.count() }).from(successStories).get(),
    ]);

    const total = Number(totalResults?.count || "0");
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: stories,
      pagination: {
        total,
        page,
        limit,
        pages: totalPages,
      },
    });
  } catch (error) {
    console.error("خطأ في جلب قصص النجاح:", error);
    return NextResponse.json(
      {
        success: false,
        message: "حدث خطأ أثناء جلب قصص النجاح",
      },
      { status: 500 }
    );
  }
}

// إنشاء قصة نجاح جديدة
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // التحقق من وجود الشروط الضرورية
    if (!data.name || !data.slug || !data.description || !data.content) {
      return NextResponse.json(
        {
          success: false,
          message: "المعلومات المقدمة غير كافية. الاسم، الرابط، الوصف، والمحتوى مطلوبة.",
        },
        { status: 400 }
      );
    }

    // التحقق من تفرد الرابط
    const existingSlug = await db.query.successStories.findFirst({
      where: eq(successStories.slug, data.slug),
    });

    if (existingSlug) {
      return NextResponse.json(
        {
          success: false,
          message: "الرابط مستخدم بالفعل. الرجاء استخدام رابط مختلف.",
        },
        { status: 400 }
      );
    }

    // إنشاء قصة النجاح
    const [newSuccessStory] = await db
      .insert(successStories)
      .values({
        name: data.name,
        slug: data.slug,
        description: data.description,
        content: data.content,
        image: data.image || null,
        video: data.video || null,
        quote: data.quote || null,
        published: data.published ?? true,
        major: data.major || null,
        university: data.university || null,
        seoTitle: data.seoTitle || null,
        seoDescription: data.seoDescription || null,
        seoKeywords: data.seoKeywords || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return NextResponse.json({ success: true, data: newSuccessStory }, { status: 201 });
  } catch (error) {
    console.error("خطأ في إنشاء قصة نجاح:", error);
    return NextResponse.json(
      {
        success: false,
        message: "حدث خطأ أثناء إنشاء قصة النجاح",
      },
      { status: 500 }
    );
  }
}
