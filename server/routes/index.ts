import { Express } from 'express';
import authRoutes from './auth-routes';
import usersRoutes from './users-routes';
import siteSettingsRoutes from './site-settings-routes';
import statisticsRoutes from './statistics-routes';
import partnersRoutes from './partners-routes';
import scholarshipsRoutes from './scholarships-routes';
import postsRoutes from './posts-routes';
import successStoriesRoutes from './success-stories-routes';
import categoriesRoutes from './categories-routes';
import levelsRoutes from './levels-routes';
import countriesRoutes from './countries-routes';
import { registerMenusRoutes } from './menus-routes';
import { registerPagesRoutes } from './pages-routes';
import { registerSubscribersRoutes } from './subscribers-routes';
import { registerSeoSettingsRoutes } from './seo-settings-routes';
import { registerMediaRoutes } from './media-routes';

/**
 * تسجيل جميع مسارات API
 */
export function registerApiRoutes(app: Express, apiPrefix: string): void {
  // تسجيل مسارات المصادقة
  app.use(`${apiPrefix}/auth`, authRoutes);

  // تسجيل مسارات المستخدمين
  app.use(`${apiPrefix}/users`, usersRoutes);

  // تسجيل مسارات إعدادات الموقع
  app.use(`${apiPrefix}/site-settings`, siteSettingsRoutes);

  // تسجيل مسارات الإحصائيات
  app.use(`${apiPrefix}/statistics`, statisticsRoutes);

  // تسجيل مسارات الشركاء
  app.use(`${apiPrefix}/partners`, partnersRoutes);

  // تسجيل مسارات المنح الدراسية
  app.use(`${apiPrefix}/scholarships`, scholarshipsRoutes);

  // تسجيل مسارات المقالات
  app.use(`${apiPrefix}/posts`, postsRoutes);

  // تسجيل مسارات قصص النجاح
  app.use(`${apiPrefix}/success-stories`, successStoriesRoutes);
  
  // تسجيل مسارات الفئات
  app.use(`${apiPrefix}/categories`, categoriesRoutes);
  
  // تسجيل مسارات المستويات الدراسية
  app.use(`${apiPrefix}/levels`, levelsRoutes);
  
  // تسجيل مسارات الدول
  app.use(`${apiPrefix}/countries`, countriesRoutes);
  
  // تسجيل مسارات القوائم
  registerMenusRoutes(app, apiPrefix);
  
  // تسجيل مسارات الصفحات
  registerPagesRoutes(app, apiPrefix);
  
  // تسجيل مسارات المشتركين في النشرة البريدية
  registerSubscribersRoutes(app, apiPrefix);
  
  // تسجيل مسارات إعدادات SEO
  registerSeoSettingsRoutes(app, apiPrefix);
  
  // تسجيل مسارات مكتبة الوسائط
  registerMediaRoutes(app, apiPrefix);
}