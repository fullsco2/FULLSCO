import { drizzle } from "drizzle-orm/neon-serverless";
import { neon } from "@neondatabase/serverless";
import * as schema from "@/shared/schema";

// استخدام رابط قاعدة البيانات من متغيرات البيئة
const sql = neon(process.env.DATABASE_URL!);

// إنشاء اتصال Drizzle
export const db = drizzle(sql, { schema });
