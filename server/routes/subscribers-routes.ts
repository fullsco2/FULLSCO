import { Router } from "express";
import { SubscribersController } from "../controllers/subscribers-controller";
import { isAuthenticated, isAdmin } from "../middlewares/auth-middleware";

/**
 * تسجيل مسارات المشتركين
 * @param router كائن Router من Express
 * @param apiPrefix بادئة مسارات API
 */
export function registerSubscribersRoutes(router: Router, apiPrefix: string) {
  const controller = new SubscribersController();

  // مسار الاشتراك العام، يمكن للأشخاص غير المسجلين استخدامه
  router.post(`${apiPrefix}/subscribers`, controller.createSubscriber.bind(controller));

  // مسارات تتطلب مصادقة وصلاحيات المسؤول
  router.get(`${apiPrefix}/subscribers`, isAuthenticated, isAdmin, controller.listSubscribers.bind(controller));
  router.get(`${apiPrefix}/subscribers/:id(\\d+)`, isAuthenticated, isAdmin, controller.getSubscriber.bind(controller));
  router.delete(`${apiPrefix}/subscribers/:id(\\d+)`, isAuthenticated, isAdmin, controller.deleteSubscriber.bind(controller));
}