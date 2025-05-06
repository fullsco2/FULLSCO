import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { posts } from "@/shared/schema";
import { count } from "drizzle-orm";

export async function GET() {
  try {
    const result = await db.select({ count: count() }).from(posts);
    return NextResponse.json({ count: result[0].count }, { status: 200 });
  } catch (error) {
    console.error("خطأ في جلب عدد المقالات:", error);
    return NextResponse.json(
      { message: "حدث خطأ أثناء جلب عدد المقالات" },
      { status: 500 }
    );
  }
}
