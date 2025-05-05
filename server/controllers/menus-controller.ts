import { Request, Response } from "express";
import { MenusService } from "../services/menus-service";
import { z } from "zod";
import { insertMenuSchema, insertMenuItemSchema } from "@shared/schema";

/**
 * وحدة التحكم بالقوائم
 * تتعامل مع طلبات HTTP المتعلقة بالقوائم وعناصر القائمة
 */
export class MenusController {
  private service: MenusService;

  constructor() {
    this.service = new MenusService();
  }

  /**
   * الحصول على قائمة بواسطة المعرف
   */
  async getMenu(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: "معرف القائمة غير صالح" });
        return;
      }

      const menu = await this.service.getMenu(id);
      if (!menu) {
        res.status(404).json({ success: false, message: "القائمة غير موجودة" });
        return;
      }

      res.json({ success: true, data: menu });
    } catch (error) {
      console.error("Error in getMenu controller:", error);
      res.status(500).json({ 
        success: false, 
        message: "حدث خطأ أثناء جلب القائمة", 
        error: (error as Error).message 
      });
    }
  }

  /**
   * الحصول على قائمة بواسطة slug
   */
  async getMenuBySlug(req: Request, res: Response): Promise<void> {
    try {
      const { slug } = req.params;
      
      const menu = await this.service.getMenuBySlug(slug);
      if (!menu) {
        res.status(404).json({ success: false, message: "القائمة غير موجودة" });
        return;
      }

      res.json({ success: true, data: menu });
    } catch (error) {
      console.error("Error in getMenuBySlug controller:", error);
      res.status(500).json({ 
        success: false, 
        message: "حدث خطأ أثناء جلب القائمة", 
        error: (error as Error).message 
      });
    }
  }

  /**
   * الحصول على قائمة بواسطة الموقع
   */
  async getMenuByLocation(req: Request, res: Response): Promise<void> {
    try {
      const { location } = req.params;
      
      const menu = await this.service.getMenuByLocation(location);
      if (!menu) {
        res.status(404).json({ success: false, message: "القائمة غير موجودة" });
        return;
      }

      res.json({ success: true, data: menu });
    } catch (error) {
      console.error("Error in getMenuByLocation controller:", error);
      res.status(500).json({ 
        success: false, 
        message: "حدث خطأ أثناء جلب القائمة", 
        error: (error as Error).message 
      });
    }
  }

  /**
   * إنشاء قائمة جديدة
   */
  async createMenu(req: Request, res: Response): Promise<void> {
    try {
      // التحقق من صحة البيانات المرسلة
      const menuData = req.body;
      
      // إنشاء القائمة
      const menu = await this.service.createMenu(menuData);
      
      res.status(201).json({ success: true, message: "تم إنشاء القائمة بنجاح", data: menu });
    } catch (error) {
      console.error("Error in createMenu controller:", error);
      
      // التعامل مع أخطاء التحقق من صحة البيانات
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          success: false, 
          message: "بيانات القائمة غير صالحة", 
          errors: error.errors 
        });
        return;
      }
      
      res.status(500).json({ 
        success: false, 
        message: "حدث خطأ أثناء إنشاء القائمة", 
        error: (error as Error).message 
      });
    }
  }

  /**
   * تحديث قائمة موجودة
   */
  async updateMenu(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: "معرف القائمة غير صالح" });
        return;
      }

      // التحقق من صحة البيانات المرسلة
      const menuData = req.body;
      
      // تحديث القائمة
      const menu = await this.service.updateMenu(id, menuData);
      
      res.json({ success: true, message: "تم تحديث القائمة بنجاح", data: menu });
    } catch (error) {
      console.error("Error in updateMenu controller:", error);
      
      // التعامل مع أخطاء التحقق من صحة البيانات
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          success: false, 
          message: "بيانات القائمة غير صالحة", 
          errors: error.errors 
        });
        return;
      }
      
      // التعامل مع حالة عدم وجود القائمة
      if ((error as Error).message.includes("not found")) {
        res.status(404).json({ success: false, message: "القائمة غير موجودة" });
        return;
      }
      
      res.status(500).json({ 
        success: false, 
        message: "حدث خطأ أثناء تحديث القائمة", 
        error: (error as Error).message 
      });
    }
  }

  /**
   * حذف قائمة
   */
  async deleteMenu(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: "معرف القائمة غير صالح" });
        return;
      }

      // حذف القائمة
      const success = await this.service.deleteMenu(id);
      
      if (success) {
        res.json({ success: true, message: "تم حذف القائمة بنجاح" });
      } else {
        res.status(404).json({ success: false, message: "القائمة غير موجودة" });
      }
    } catch (error) {
      console.error("Error in deleteMenu controller:", error);
      
      // التعامل مع حالة عدم وجود القائمة
      if ((error as Error).message.includes("not found")) {
        res.status(404).json({ success: false, message: "القائمة غير موجودة" });
        return;
      }
      
      res.status(500).json({ 
        success: false, 
        message: "حدث خطأ أثناء حذف القائمة", 
        error: (error as Error).message 
      });
    }
  }

  /**
   * الحصول على قائمة بكل القوائم
   */
  async listMenus(req: Request, res: Response): Promise<void> {
    try {
      const menus = await this.service.listMenus();
      res.json({ success: true, data: menus });
    } catch (error) {
      console.error("Error in listMenus controller:", error);
      res.status(500).json({ 
        success: false, 
        message: "حدث خطأ أثناء جلب القوائم", 
        error: (error as Error).message 
      });
    }
  }

  /**
   * الحصول على عنصر قائمة بواسطة المعرف
   */
  async getMenuItem(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: "معرف عنصر القائمة غير صالح" });
        return;
      }

      const menuItem = await this.service.getMenuItem(id);
      if (!menuItem) {
        res.status(404).json({ success: false, message: "عنصر القائمة غير موجود" });
        return;
      }

      res.json({ success: true, data: menuItem });
    } catch (error) {
      console.error("Error in getMenuItem controller:", error);
      res.status(500).json({ 
        success: false, 
        message: "حدث خطأ أثناء جلب عنصر القائمة", 
        error: (error as Error).message 
      });
    }
  }

  /**
   * إنشاء عنصر قائمة جديد
   */
  async createMenuItem(req: Request, res: Response): Promise<void> {
    try {
      // التحقق من صحة البيانات المرسلة
      const itemData = req.body;
      
      // إنشاء عنصر القائمة
      const menuItem = await this.service.createMenuItem(itemData);
      
      res.status(201).json({ success: true, message: "تم إنشاء عنصر القائمة بنجاح", data: menuItem });
    } catch (error) {
      console.error("Error in createMenuItem controller:", error);
      
      // التعامل مع أخطاء التحقق من صحة البيانات
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          success: false, 
          message: "بيانات عنصر القائمة غير صالحة", 
          errors: error.errors 
        });
        return;
      }
      
      // التعامل مع حالة عدم وجود القائمة أو العنصر الأب
      if ((error as Error).message.includes("not found")) {
        res.status(404).json({ 
          success: false, 
          message: (error as Error).message 
        });
        return;
      }
      
      res.status(500).json({ 
        success: false, 
        message: "حدث خطأ أثناء إنشاء عنصر القائمة", 
        error: (error as Error).message 
      });
    }
  }

  /**
   * تحديث عنصر قائمة موجود
   */
  async updateMenuItem(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: "معرف عنصر القائمة غير صالح" });
        return;
      }

      // التحقق من صحة البيانات المرسلة
      const itemData = req.body;
      
      // تحديث عنصر القائمة
      const menuItem = await this.service.updateMenuItem(id, itemData);
      
      res.json({ success: true, message: "تم تحديث عنصر القائمة بنجاح", data: menuItem });
    } catch (error) {
      console.error("Error in updateMenuItem controller:", error);
      
      // التعامل مع أخطاء التحقق من صحة البيانات
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          success: false, 
          message: "بيانات عنصر القائمة غير صالحة", 
          errors: error.errors 
        });
        return;
      }
      
      // التعامل مع حالة عدم وجود عنصر القائمة أو العنصر الأب
      if ((error as Error).message.includes("not found")) {
        res.status(404).json({ 
          success: false, 
          message: (error as Error).message 
        });
        return;
      }
      
      res.status(500).json({ 
        success: false, 
        message: "حدث خطأ أثناء تحديث عنصر القائمة", 
        error: (error as Error).message 
      });
    }
  }

  /**
   * حذف عنصر قائمة
   */
  async deleteMenuItem(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: "معرف عنصر القائمة غير صالح" });
        return;
      }

      // حذف عنصر القائمة
      const success = await this.service.deleteMenuItem(id);
      
      if (success) {
        res.json({ success: true, message: "تم حذف عنصر القائمة بنجاح" });
      } else {
        res.status(404).json({ success: false, message: "عنصر القائمة غير موجود" });
      }
    } catch (error) {
      console.error("Error in deleteMenuItem controller:", error);
      
      // التعامل مع حالة عدم وجود عنصر القائمة
      if ((error as Error).message.includes("not found")) {
        res.status(404).json({ success: false, message: "عنصر القائمة غير موجود" });
        return;
      }
      
      res.status(500).json({ 
        success: false, 
        message: "حدث خطأ أثناء حذف عنصر القائمة", 
        error: (error as Error).message 
      });
    }
  }

  /**
   * الحصول على قائمة بعناصر القائمة التي تنتمي إلى قائمة معينة
   */
  async listMenuItems(req: Request, res: Response): Promise<void> {
    try {
      const menuId = parseInt(req.params.menuId);
      if (isNaN(menuId)) {
        res.status(400).json({ success: false, message: "معرف القائمة غير صالح" });
        return;
      }

      // قراءة parentId من query parameters إذا كان موجوداً
      let parentId: number | null | undefined;
      if (req.query.parentId !== undefined) {
        if (req.query.parentId === 'null') {
          parentId = null;
        } else {
          const parsedParentId = parseInt(req.query.parentId as string);
          if (!isNaN(parsedParentId)) {
            parentId = parsedParentId;
          }
        }
      }

      const menuItems = await this.service.listMenuItems(menuId, parentId);
      res.json({ success: true, data: menuItems });
    } catch (error) {
      console.error("Error in listMenuItems controller:", error);
      
      // التعامل مع حالة عدم وجود القائمة
      if ((error as Error).message.includes("not found")) {
        res.status(404).json({ success: false, message: "القائمة غير موجودة" });
        return;
      }
      
      res.status(500).json({ 
        success: false, 
        message: "حدث خطأ أثناء جلب عناصر القائمة", 
        error: (error as Error).message 
      });
    }
  }

  /**
   * الحصول على جميع عناصر القائمة مع تفاصيلها بشكل متداخل
   */
  async getAllMenuItemsWithDetails(req: Request, res: Response): Promise<void> {
    try {
      const menuId = parseInt(req.params.menuId);
      if (isNaN(menuId)) {
        res.status(400).json({ success: false, message: "معرف القائمة غير صالح" });
        return;
      }

      const menuItems = await this.service.getAllMenuItemsWithDetails(menuId);
      res.json({ success: true, data: menuItems });
    } catch (error) {
      console.error("Error in getAllMenuItemsWithDetails controller:", error);
      
      // التعامل مع حالة عدم وجود القائمة
      if ((error as Error).message.includes("not found")) {
        res.status(404).json({ success: false, message: "القائمة غير موجودة" });
        return;
      }
      
      res.status(500).json({ 
        success: false, 
        message: "حدث خطأ أثناء جلب هيكل القائمة", 
        error: (error as Error).message 
      });
    }
  }

  /**
   * الحصول على هيكل القائمة الكامل بناءً على الموقع
   */
  async getMenuStructure(req: Request, res: Response): Promise<void> {
    try {
      const { location } = req.params;
      
      const menuStructure = await this.service.getMenuStructure(location);
      if (!menuStructure) {
        res.status(404).json({ success: false, message: "القائمة غير موجودة في هذا الموقع" });
        return;
      }

      res.json({ success: true, data: menuStructure });
    } catch (error) {
      console.error("Error in getMenuStructure controller:", error);
      res.status(500).json({ 
        success: false, 
        message: "حدث خطأ أثناء جلب هيكل القائمة", 
        error: (error as Error).message 
      });
    }
  }
}