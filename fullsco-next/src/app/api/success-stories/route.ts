import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { successStories } from "@/shared/schema";
import { and, desc, eq, ilike, or } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    
    // جلب معاملات التصفية
    const keyword = searchParams.get("keyword");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;
    
    // بناء أسئلة البحث
    let filters = [];
    
    if (keyword) {
      filters.push(
        or(
          ilike(successStories.name, `%${keyword}%`),
          ilike(successStories.content, `%${keyword}%`),
          ilike(successStories.description, `%${keyword}%`)
        )
      );
    }
    
    // جلب قصص النجاح
    const query = filters.length > 0
      ? db.query.successStories.findMany({
          where: and(...filters),
          orderBy: desc(successStories.createdAt),
          limit,
          offset,
        })
      : db.query.successStories.findMany({
          orderBy: desc(successStories.createdAt),
          limit,
          offset,
        });
    
    const result = await query;
    
    // عد النتائج الإجمالية للتصفح
    const countQuery = filters.length > 0
      ? db.select({ count: db.fn.count() }).from(successStories).where(and(...filters))
      : db.select({ count: db.fn.count() }).from(successStories);
    
    const totalCount = await countQuery;
    const total = Number(totalCount[0].count || "0");
    
    return NextResponse.json({
      data: result,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    }, { status: 200 });
  } catch (error) {
    console.error("خطأ في جلب قصص النجاح:", error);
    return NextResponse.json(
      { message: "حدث خطأ أثناء جلب قصص النجاح" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // إضافة تاريخ الإنشاء والتحديث
    const newData = {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    // إنشاء قصة نجاح جديدة
    const [newSuccessStory] = await db.insert(successStories).values(newData).returning();
    
    return NextResponse.json(newSuccessStory, { status: 201 });
  } catch (error) {
    console.error("خطأ في إنشاء قصة نجاح:", error);
    return NextResponse.json(
      { message: "حدث خطأ أثناء إنشاء قصة نجاح" },
      { status: 500 }
    );
  }
}
