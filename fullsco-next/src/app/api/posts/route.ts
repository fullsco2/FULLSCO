import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { posts, users, categories } from "@/shared/schema";
import { and, desc, eq, ilike, or } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    
    // جلب معاملات التصفية
    const keyword = searchParams.get("keyword");
    const categoryId = searchParams.get("category");
    const authorId = searchParams.get("author");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;
    
    // بناء أسئلة البحث
    let filters = [];
    
    if (keyword) {
      filters.push(
        or(
          ilike(posts.title, `%${keyword}%`),
          ilike(posts.excerpt, `%${keyword}%`),
          ilike(posts.content, `%${keyword}%`)
        )
      );
    }
    
    if (categoryId && categoryId !== "all") {
      filters.push(eq(posts.categoryId, parseInt(categoryId)));
    }
    
    if (authorId && authorId !== "all") {
      filters.push(eq(posts.authorId, parseInt(authorId)));
    }
    
    // جلب المقالات مع العلاقات
    const query = filters.length > 0
      ? db.query.posts.findMany({
          where: and(...filters),
          with: {
            author: true,
            category: true,
          },
          orderBy: desc(posts.createdAt),
          limit,
          offset,
        })
      : db.query.posts.findMany({
          with: {
            author: true,
            category: true,
          },
          orderBy: desc(posts.createdAt),
          limit,
          offset,
        });
    
    const result = await query;
    
    // عد النتائج الإجمالية للتصفح
    const countQuery = filters.length > 0
      ? db.select({ count: db.fn.count() }).from(posts).where(and(...filters))
      : db.select({ count: db.fn.count() }).from(posts);
    
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
    console.error("خطأ في جلب المقالات:", error);
    return NextResponse.json(
      { message: "حدث خطأ أثناء جلب المقالات" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // التحقق من وجود المستخدم والتصنيف
    if (data.authorId) {
      const author = await db.query.users.findFirst({
        where: eq(users.id, data.authorId),
      });
      
      if (!author) {
        return NextResponse.json(
          { message: "لم يتم العثور على المؤلف" },
          { status: 400 }
        );
      }
    }
    
    if (data.categoryId) {
      const category = await db.query.categories.findFirst({
        where: eq(categories.id, data.categoryId),
      });
      
      if (!category) {
        return NextResponse.json(
          { message: "لم يتم العثور على التصنيف" },
          { status: 400 }
        );
      }
    }
    
    // إضافة تاريخ الإنشاء والتحديث
    const newData = {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    // إنشاء المقال الجديد
    const [newPost] = await db.insert(posts).values(newData).returning();
    
    return NextResponse.json(newPost, { status: 201 });
  } catch (error) {
    console.error("خطأ في إنشاء المقال:", error);
    return NextResponse.json(
      { message: "حدث خطأ أثناء إنشاء المقال" },
      { status: 500 }
    );
  }
}
