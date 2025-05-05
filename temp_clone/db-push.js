// Import required modules
import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import * as schema from './shared/schema.js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

// Configure NeonDB to use WebSockets
neonConfig.webSocketConstructor = ws;

// Validate DATABASE_URL
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

// Function to create a schema or sync
async function createSchema() {
  console.log('Creating database schema...');
  
  try {
    // Connect to the database
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const db = drizzle({ client: pool, schema });

    // Create enums first 
    console.log('Creating enums...');
    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'menu_location') THEN
          CREATE TYPE menu_location AS ENUM ('header', 'footer', 'sidebar', 'mobile');
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'menu_item_type') THEN
          CREATE TYPE menu_item_type AS ENUM ('page', 'category', 'level', 'country', 'link', 'scholarship', 'post');
        END IF;
      END
      $$;
    `);

    // Basic tables first
    console.log('Creating users table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        display_name TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user',
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    
    console.log('Creating categories table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        description TEXT
      );
    `);
    
    console.log('Creating levels table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS levels (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE
      );
    `);
    
    console.log('Creating countries table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS countries (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE
      );
    `);
    
    // Tables with foreign keys
    console.log('Creating scholarships table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS scholarships (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        description TEXT NOT NULL,
        content TEXT,
        deadline TEXT,
        amount TEXT,
        currency TEXT,
        university TEXT,
        department TEXT,
        website TEXT,
        start_date TIMESTAMP,
        end_date TIMESTAMP,
        is_featured BOOLEAN DEFAULT FALSE,
        is_fully_funded BOOLEAN DEFAULT FALSE,
        is_published BOOLEAN DEFAULT TRUE,
        seo_title TEXT,
        seo_description TEXT,
        seo_keywords TEXT,
        focus_keyword TEXT,
        country_id INTEGER REFERENCES countries(id),
        level_id INTEGER REFERENCES levels(id),
        category_id INTEGER REFERENCES categories(id),
        requirements TEXT,
        application_link TEXT,
        image_url TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    
    console.log('Creating posts table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        content TEXT NOT NULL,
        excerpt TEXT,
        author_id INTEGER REFERENCES users(id) NOT NULL,
        status TEXT NOT NULL DEFAULT 'draft',
        image_url TEXT,
        is_featured BOOLEAN DEFAULT FALSE,
        views INTEGER DEFAULT 0,
        meta_title TEXT,
        meta_description TEXT,
        meta_keywords TEXT,
        focus_keyword TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    
    console.log('Creating tags table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tags (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE
      );
    `);
    
    console.log('Creating post_tags table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS post_tags (
        id SERIAL PRIMARY KEY,
        post_id INTEGER REFERENCES posts(id) NOT NULL,
        tag_id INTEGER REFERENCES tags(id) NOT NULL
      );
    `);
    
    console.log('Creating success_stories table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS success_stories (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        title TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        content TEXT NOT NULL,
        scholarship_name TEXT,
        image_url TEXT,
        is_published BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    
    console.log('Creating subscribers table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS subscribers (
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    
    console.log('Creating seo_settings table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS seo_settings (
        id SERIAL PRIMARY KEY,
        page_path TEXT NOT NULL UNIQUE,
        meta_title TEXT,
        meta_description TEXT,
        og_image TEXT,
        keywords TEXT
      );
    `);
    
    console.log('Creating site_settings table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS site_settings (
        id SERIAL PRIMARY KEY,
        site_name TEXT NOT NULL,
        site_tagline TEXT,
        site_description TEXT,
        favicon TEXT,
        logo TEXT,
        logo_dark TEXT,
        email TEXT,
        phone TEXT,
        whatsapp TEXT,
        address TEXT,
        facebook TEXT,
        twitter TEXT,
        instagram TEXT,
        youtube TEXT,
        linkedin TEXT,
        primary_color TEXT,
        secondary_color TEXT,
        accent_color TEXT,
        enable_dark_mode BOOLEAN,
        rtl_direction BOOLEAN,
        default_language TEXT,
        enable_newsletter BOOLEAN,
        enable_scholarship_search BOOLEAN,
        footer_text TEXT,
        show_hero_section BOOLEAN,
        show_featured_scholarships BOOLEAN,
        show_search_section BOOLEAN,
        show_categories_section BOOLEAN,
        show_countries_section BOOLEAN,
        show_latest_articles BOOLEAN,
        show_success_stories BOOLEAN,
        show_newsletter_section BOOLEAN,
        show_statistics_section BOOLEAN,
        show_partners_section BOOLEAN,
        hero_title TEXT,
        hero_subtitle TEXT,
        hero_description TEXT,
        featured_scholarships_title TEXT,
        featured_scholarships_description TEXT,
        categories_section_title TEXT,
        categories_section_description TEXT,
        countries_section_title TEXT,
        countries_section_description TEXT,
        latest_articles_title TEXT,
        latest_articles_description TEXT,
        success_stories_title TEXT,
        success_stories_description TEXT,
        newsletter_section_title TEXT,
        newsletter_section_description TEXT,
        statistics_section_title TEXT,
        statistics_section_description TEXT,
        partners_section_title TEXT,
        partners_section_description TEXT,
        home_page_layout TEXT,
        scholarship_page_layout TEXT,
        article_page_layout TEXT,
        custom_css TEXT
      );
    `);
    
    console.log('Creating pages table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS pages (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        content TEXT NOT NULL,
        meta_title TEXT,
        meta_description TEXT,
        is_published BOOLEAN DEFAULT TRUE,
        show_in_footer BOOLEAN DEFAULT FALSE,
        show_in_header BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    
    console.log('Creating menus table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS menus (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        description TEXT,
        location menu_location NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    
    console.log('Creating menu_items table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS menu_items (
        id SERIAL PRIMARY KEY,
        menu_id INTEGER REFERENCES menus(id) NOT NULL,
        parent_id INTEGER REFERENCES menu_items(id),
        title TEXT NOT NULL,
        type menu_item_type NOT NULL,
        url TEXT,
        target_blank BOOLEAN DEFAULT FALSE,
        page_id INTEGER REFERENCES pages(id),
        category_id INTEGER REFERENCES categories(id),
        level_id INTEGER REFERENCES levels(id),
        country_id INTEGER REFERENCES countries(id),
        scholarship_id INTEGER REFERENCES scholarships(id),
        post_id INTEGER REFERENCES posts(id),
        "order" INTEGER DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    
    console.log('Creating media_files table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS media_files (
        id SERIAL PRIMARY KEY,
        filename TEXT NOT NULL,
        original_filename TEXT NOT NULL,
        url TEXT NOT NULL,
        mime_type TEXT NOT NULL,
        size INTEGER NOT NULL,
        title TEXT,
        alt TEXT,
        width INTEGER,
        height INTEGER,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    
    console.log('All tables created successfully');
    await pool.end();
  } catch (error) {
    console.error('Error creating database schema:', error);
    process.exit(1);
  }
}

// Execute the migration
createSchema()
  .then(() => {
    console.log('Database schema created successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Database schema creation failed:', error);
    process.exit(1);
  });