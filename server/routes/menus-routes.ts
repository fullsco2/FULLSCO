import { Express } from "express";
import { MenusController } from "../controllers/menus-controller";
import { isAdmin, isAuthenticated } from "../middlewares/auth-middleware";

/**
 * تسجيل مسارات القوائم
 * @param app تطبيق Express
 * @param apiPrefix بادئة مسار API
 */
export function registerMenusRoutes(app: Express, apiPrefix: string = '/api'): void {
  console.log('📋 تسجيل مسارات القوائم');
  
  const controller = new MenusController();

  // مسارات القوائم
  
  // الحصول على قائمة بكل القوائم - متاح فقط للمسؤولين
  app.get(`${apiPrefix}/menus`, isAdmin, (req, res) => controller.listMenus(req, res));
  
  // إنشاء قائمة جديدة - متاح فقط للمسؤولين
  app.post(`${apiPrefix}/menus`, isAdmin, (req, res) => controller.createMenu(req, res));
  
  // الحصول على قائمة بواسطة الموقع - متاح للجميع
  app.get(`${apiPrefix}/menu-structure/:location`, (req, res) => controller.getMenuStructure(req, res));
  
  // الحصول على قائمة بواسطة slug - متاح للجميع
  app.get(`${apiPrefix}/menus/slug/:slug`, (req, res) => controller.getMenuBySlug(req, res));
  
  // الحصول على قائمة بواسطة الموقع - متاح للجميع
  app.get(`${apiPrefix}/menus/location/:location`, (req, res) => controller.getMenuByLocation(req, res));
  
  // الحصول على قائمة بواسطة المعرف - متاح فقط للمسؤولين
  app.get(`${apiPrefix}/menus/:id`, isAdmin, (req, res) => controller.getMenu(req, res));
  
  // تحديث قائمة موجودة - متاح فقط للمسؤولين
  app.put(`${apiPrefix}/menus/:id`, isAdmin, (req, res) => controller.updateMenu(req, res));
  
  // تحديث قائمة موجودة (PATCH) - متاح فقط للمسؤولين
  app.patch(`${apiPrefix}/menus/:id`, isAdmin, (req, res) => controller.updateMenu(req, res));
  
  // حذف قائمة - متاح فقط للمسؤولين
  app.delete(`${apiPrefix}/menus/:id`, isAdmin, (req, res) => controller.deleteMenu(req, res));
  
  // مسارات عناصر القائمة
  
  // الحصول على جميع عناصر القائمة التي تنتمي إلى قائمة معينة - متاح فقط للمسؤولين
  app.get(`${apiPrefix}/menus/:menuId/items`, isAdmin, (req, res) => controller.listMenuItems(req, res));
  
  // الحصول على هيكل كامل لعناصر القائمة - متاح فقط للمسؤولين
  app.get(`${apiPrefix}/menus/:menuId/structure`, isAdmin, (req, res) => controller.getAllMenuItemsWithDetails(req, res));
  
  // إنشاء عنصر قائمة جديد - متاح فقط للمسؤولين
  app.post(`${apiPrefix}/menu-items`, isAdmin, (req, res) => controller.createMenuItem(req, res));
  
  // الحصول على عنصر قائمة بواسطة المعرف - متاح فقط للمسؤولين
  app.get(`${apiPrefix}/menu-items/:id`, isAdmin, (req, res) => controller.getMenuItem(req, res));
  
  // تحديث عنصر قائمة موجود - متاح فقط للمسؤولين
  app.put(`${apiPrefix}/menu-items/:id`, isAdmin, (req, res) => controller.updateMenuItem(req, res));
  
  // تحديث عنصر قائمة موجود (PATCH) - متاح فقط للمسؤولين
  app.patch(`${apiPrefix}/menu-items/:id`, isAdmin, (req, res) => controller.updateMenuItem(req, res));
  
  // حذف عنصر قائمة - متاح فقط للمسؤولين
  app.delete(`${apiPrefix}/menu-items/:id`, isAdmin, (req, res) => controller.deleteMenuItem(req, res));
}