import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import * as schema from "@/shared/schema";

/**
 * استخدم متغير البيئة DATABASE_URL للاتصال بقاعدة البيانات
 * إذا لم يكن متوفراً، استخدم قيمة افتراضية للتطوير المحلي
 */
const connectionString = process.env.DATABASE_URL || "postgres://user:password@localhost:5432/db";

// إنشاء client منفصل للاستعلامات
const queryClient = postgres(connectionString);

// إنشاء client منفصل للتهجير
const migrationClient = postgres(connectionString, { max: 1 });

// تهيئة Drizzle مع المخطط
export const db = drizzle(queryClient, { schema });

/**
 * دالة لتشغيل عملية التهجير (migrations)
 * استخدمها عندما تحتاج إلى تحديث هيكل قاعدة البيانات
 */
export async function runMigrations() {
  try {
    console.log("بدء عملية التهجير...");
    
    await migrate(drizzle(migrationClient), { migrationsFolder: "drizzle" });
    
    console.log("اكتملت عملية التهجير بنجاح");
  } catch (error) {
    console.error("فشل في تنفيذ عمليات التهجير:", error);
    throw error;
  } finally {
    // إغلاق client التهجير
    await migrationClient.end();
  }
}

// التأكد من إغلاق اتصال قاعدة البيانات عند إيقاف التطبيق
process.on("beforeExit", async () => {
  await queryClient.end();
});
