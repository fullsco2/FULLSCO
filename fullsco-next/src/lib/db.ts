// src/lib/db.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@/shared/schema';

// إنشاء اتصال قاعدة البيانات
const connectionString = process.env.DATABASE_URL || '';
const client = postgres(connectionString);

// إنشاء مثيل لقاعدة البيانات باستخدام Drizzle ORM
export const db = drizzle(client, { schema });

// تأكد من إغلاق الاتصال عند انتهاء التطبيق (في بيئة الإنتاج)
if (process.env.NODE_ENV === 'production') {
  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing database connection');
    client.end().then(() => {
      console.log('Database connection closed');
      process.exit(0);
    });
  });
}

// تصدير الاتصال لاستخدامه في أجزاء أخرى من التطبيق
export { client };
