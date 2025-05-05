import { Router } from "express";
import { MediaController } from "../controllers/media-controller";
import { isAuthenticated, isAdmin } from "../middlewares/auth-middleware";

/**
 * تسجيل مسارات مكتبة الوسائط
 * @param router كائن Router من Express
 * @param apiPrefix بادئة مسارات API
 */
export function registerMediaRoutes(router: Router, apiPrefix: string) {
  const controller = new MediaController();

  // مسارات عامة يمكن الوصول إليها بدون تسجيل دخول للقراءة فقط
  router.get(`${apiPrefix}/media`, controller.listMediaFiles.bind(controller));
  router.get(`${apiPrefix}/media/:id(\\d+)`, controller.getMediaFile.bind(controller));

  // مسارات تتطلب مصادقة وصلاحيات المسؤول للكتابة
  // إضافة مسار POST مباشر لـ /api/media
  router.post(`${apiPrefix}/media`, isAuthenticated, isAdmin, controller.uploadMiddleware(), controller.uploadMediaFile.bind(controller));
  // الإبقاء على المسار القديم للتوافق مع الشيفرة القديمة
  router.post(`${apiPrefix}/media/upload`, isAuthenticated, isAdmin, controller.uploadMiddleware(), controller.uploadMediaFile.bind(controller));
  router.put(`${apiPrefix}/media/:id(\\d+)`, isAuthenticated, isAdmin, controller.updateMediaFile.bind(controller));
  router.delete(`${apiPrefix}/media/:id(\\d+)`, isAuthenticated, isAdmin, controller.deleteMediaFile.bind(controller));
  router.post(`${apiPrefix}/media/bulk-delete`, isAuthenticated, isAdmin, controller.bulkDeleteMediaFiles.bind(controller));
}