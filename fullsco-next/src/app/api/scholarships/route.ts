import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { scholarships, countries, levels, categories } from "@/shared/schema";
import { and, desc, eq, ilike, or } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    
    // جلب معاملات التصفية
    const keyword = searchParams.get("keyword");
    const categoryId = searchParams.get("category");
    const levelId = searchParams.get("level");
    const countryId = searchParams.get("country");
    const funded = searchParams.get("funded");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;
    
    // بناء أسئلة البحث
    let filters = [];
    
    if (keyword) {
      filters.push(
        or(
          ilike(scholarships.title, `%${keyword}%`),
          ilike(scholarships.description, `%${keyword}%`)
        )
      );
    }
    
    if (categoryId && categoryId !== "all") {
      filters.push(eq(scholarships.categoryId, parseInt(categoryId)));
    }
    
    if (levelId && levelId !== "all") {
      filters.push(eq(scholarships.levelId, parseInt(levelId)));
    }
    
    if (countryId && countryId !== "all") {
      filters.push(eq(scholarships.countryId, parseInt(countryId)));
    }
    
    if (funded === "true") {
      filters.push(eq(scholarships.fullyFunded, true));
    }
    
    // جلب المنح مع العلاقات
    const query = filters.length > 0
      ? db.query.scholarships.findMany({
          where: and(...filters),
          with: {
            country: true,
            level: true,
            category: true,
          },
          orderBy: desc(scholarships.createdAt),
          limit,
          offset,
        })
      : db.query.scholarships.findMany({
          with: {
            country: true,
            level: true,
            category: true,
          },
          orderBy: desc(scholarships.createdAt),
          limit,
          offset,
        });
    
    const result = await query;
    
    // عد النتائج الإجمالية للتصفح
    const countQuery = filters.length > 0
      ? db.select({ count: db.fn.count() }).from(scholarships).where(and(...filters))
      : db.select({ count: db.fn.count() }).from(scholarships);
    
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
    console.error("خطأ في جلب المنح الدراسية:", error);
    return NextResponse.json(
      { message: "حدث خطأ أثناء جلب المنح الدراسية" },
      { status: 500 }
    );
  }
}
