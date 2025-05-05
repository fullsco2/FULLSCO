// سكريبت لإنشاء جداول statistics و partners
// ملاحظة: هذا الملف مؤقت وسيتم استخدامه مرة واحدة فقط لإنشاء الجداول المطلوبة

import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function createTables() {
  try {
    const client = await pool.connect();
    try {
      // التحقق من وجود جدول statistics
      const statsTableExists = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public'
          AND table_name = 'statistics'
        );
      `);
      
      // إنشاء جدول statistics إذا لم يكن موجودًا
      if (!statsTableExists.rows[0].exists) {
        console.log('Creating statistics table...');
        await client.query(`
          CREATE TABLE statistics (
            id SERIAL PRIMARY KEY,
            title TEXT NOT NULL,
            value TEXT NOT NULL,
            description TEXT,
            icon TEXT NOT NULL,
            color TEXT,
            "order" INTEGER DEFAULT 0,
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
          );
        `);
        console.log('Statistics table created successfully.');
      } else {
        console.log('Statistics table already exists.');
      }
      
      // التحقق من وجود جدول partners
      const partnersTableExists = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public'
          AND table_name = 'partners'
        );
      `);
      
      // إنشاء جدول partners إذا لم يكن موجودًا
      if (!partnersTableExists.rows[0].exists) {
        console.log('Creating partners table...');
        await client.query(`
          CREATE TABLE partners (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            logo_url TEXT,
            website_url TEXT,
            description TEXT,
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
          );
        `);
        console.log('Partners table created successfully.');
      } else {
        console.log('Partners table already exists.');
      }
      
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Error creating tables:', err);
  } finally {
    await pool.end();
  }
}

createTables();