import { Express } from 'express';
import authRoutes from './auth-routes';
import usersRoutes from './users-routes';
import siteSettingsRoutes from './site-settings-routes';
import statisticsRoutes from './statistics-routes';
import partnersRoutes from './partners-routes';
import scholarshipsRoutes from './scholarships-routes';
import postsRoutes from './posts-routes';
import successStoriesRoutes from './success-stories-routes';

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
}