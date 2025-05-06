// src/lib/db.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@/shared/schema';

// استخدام متغير بيئي للاتصال بقاعدة البيانات
const connectionString = process.env.DATABASE_URL || 'postgres://user:password@localhost:5432/fullsco';

// تأسيس عميل postgres
const client = postgres(connectionString);

// تهيئة درزل مع الاتصال والمخطط
export const db = drizzle(client, { schema });
