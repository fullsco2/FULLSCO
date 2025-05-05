import { Router } from "express";
import { PagesController } from "../controllers/pages-controller";
import { isAuthenticated, isAdmin } from "../middlewares/auth-middleware";

/**
 * تسجيل مسارات الصفحات
 * @param router كائن Router من Express
 * @param apiPrefix بادئة مسارات API
 */
export function registerPagesRoutes(router: Router, apiPrefix: string) {
  const controller = new PagesController();

  // مسارات عامة يمكن الوصول إليها بدون تسجيل دخول
  router.get(`${apiPrefix}/pages`, controller.listPages.bind(controller));
  router.get(`${apiPrefix}/pages/:id(\\d+)`, controller.getPage.bind(controller));
  router.get(`${apiPrefix}/pages/slug/:slug`, controller.getPageBySlug.bind(controller));

  // مسارات تتطلب مصادقة وصلاحيات المسؤول
  router.post(`${apiPrefix}/pages`, isAuthenticated, isAdmin, controller.createPage.bind(controller));
  router.put(`${apiPrefix}/pages/:id(\\d+)`, isAuthenticated, isAdmin, controller.updatePage.bind(controller));
  router.delete(`${apiPrefix}/pages/:id(\\d+)`, isAuthenticated, isAdmin, controller.deletePage.bind(controller));
}