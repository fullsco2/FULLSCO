import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { scholarships } from "@/shared/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  try {
    const featuredScholarships = await db.query.scholarships.findMany({
      where: eq(scholarships.featured, true),
      with: {
        country: true,
        level: true,
        category: true,
      },
      orderBy: desc(scholarships.createdAt),
      limit: 6, // عرض عدد محدود من المنح المميزة
    });

    return NextResponse.json(featuredScholarships, { status: 200 });
  } catch (error) {
    console.error("خطأ في جلب المنح المميزة:", error);
    return NextResponse.json(
      { message: "حدث خطأ أثناء جلب المنح المميزة" },
      { status: 500 }
    );
  }
}
