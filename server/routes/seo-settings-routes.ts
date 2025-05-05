import { Router } from "express";
import { SeoSettingsController } from "../controllers/seo-settings-controller";
import { isAuthenticated, isAdmin } from "../middlewares/auth-middleware";

/**
 * تسجيل مسارات إعدادات SEO
 * @param router كائن Router من Express
 * @param apiPrefix بادئة مسارات API
 */
export function registerSeoSettingsRoutes(router: Router, apiPrefix: string) {
  const controller = new SeoSettingsController();

  // مسارات عامة يمكن الوصول إليها بدون تسجيل دخول
  router.get(`${apiPrefix}/seo-settings/path/:path`, controller.getSeoSettingByPath.bind(controller));

  // مسارات تتطلب مصادقة وصلاحيات المسؤول
  router.get(`${apiPrefix}/seo-settings`, isAuthenticated, isAdmin, controller.listSeoSettings.bind(controller));
  router.get(`${apiPrefix}/seo-settings/:id(\\d+)`, isAuthenticated, isAdmin, controller.getSeoSetting.bind(controller));
  router.post(`${apiPrefix}/seo-settings`, isAuthenticated, isAdmin, controller.createSeoSetting.bind(controller));
  router.put(`${apiPrefix}/seo-settings/:id(\\d+)`, isAuthenticated, isAdmin, controller.updateSeoSetting.bind(controller));
  router.delete(`${apiPrefix}/seo-settings/:id(\\d+)`, isAuthenticated, isAdmin, controller.deleteSeoSetting.bind(controller));
}