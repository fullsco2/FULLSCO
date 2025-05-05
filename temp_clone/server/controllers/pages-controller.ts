import { Request, Response } from "express";
import { PagesService } from "../services/pages-service";
import { z } from "zod";
import { insertPageSchema } from "@shared/schema";

/**
 * وحدة التحكم بالصفحات
 * تتعامل مع طلبات HTTP المتعلقة بالصفحات
 */
export class PagesController {
  private service: PagesService;

  constructor() {
    this.service = new PagesService();
  }

  /**
   * الحصول على صفحة بواسطة المعرف
   */
  async getPage(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: "معرف الصفحة غير صالح" });
        return;
      }

      const page = await this.service.getPage(id);
      if (!page) {
        res.status(404).json({ success: false, message: "الصفحة غير موجودة" });
        return;
      }

      res.json({ success: true, data: page });
    } catch (error) {
      console.error("Error in getPage controller:", error);
      res.status(500).json({ 
        success: false, 
        message: "حدث خطأ أثناء جلب الصفحة", 
        error: (error as Error).message 
      });
    }
  }

  /**
   * الحصول على صفحة بواسطة slug
   */
  async getPageBySlug(req: Request, res: Response): Promise<void> {
    try {
      const { slug } = req.params;
      
      const page = await this.service.getPageBySlug(slug);
      if (!page) {
        res.status(404).json({ success: false, message: "الصفحة غير موجودة" });
        return;
      }

      res.json({ success: true, data: page });
    } catch (error) {
      console.error("Error in getPageBySlug controller:", error);
      res.status(500).json({ 
        success: false, 
        message: "حدث خطأ أثناء جلب الصفحة", 
        error: (error as Error).message 
      });
    }
  }

  /**
   * إنشاء صفحة جديدة
   */
  async createPage(req: Request, res: Response): Promise<void> {
    try {
      // التحقق من صحة البيانات المرسلة
      const pageData = req.body;
      
      // إنشاء الصفحة
      const page = await this.service.createPage(pageData);
      
      res.status(201).json({ success: true, message: "تم إنشاء الصفحة بنجاح", data: page });
    } catch (error) {
      console.error("Error in createPage controller:", error);
      
      // التعامل مع أخطاء التحقق من صحة البيانات
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          success: false, 
          message: "بيانات الصفحة غير صالحة", 
          errors: error.errors 
        });
        return;
      }
      
      res.status(500).json({ 
        success: false, 
        message: "حدث خطأ أثناء إنشاء الصفحة", 
        error: (error as Error).message 
      });
    }
  }

  /**
   * تحديث صفحة موجودة
   */
  async updatePage(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: "معرف الصفحة غير صالح" });
        return;
      }

      // التحقق من صحة البيانات المرسلة
      const pageData = req.body;
      
      // تحديث الصفحة
      const page = await this.service.updatePage(id, pageData);
      
      res.json({ success: true, message: "تم تحديث الصفحة بنجاح", data: page });
    } catch (error) {
      console.error("Error in updatePage controller:", error);
      
      // التعامل مع أخطاء التحقق من صحة البيانات
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          success: false, 
          message: "بيانات الصفحة غير صالحة", 
          errors: error.errors 
        });
        return;
      }
      
      // التعامل مع حالة عدم وجود الصفحة
      if ((error as Error).message.includes("not found")) {
        res.status(404).json({ success: false, message: "الصفحة غير موجودة" });
        return;
      }
      
      res.status(500).json({ 
        success: false, 
        message: "حدث خطأ أثناء تحديث الصفحة", 
        error: (error as Error).message 
      });
    }
  }

  /**
   * حذف صفحة
   */
  async deletePage(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: "معرف الصفحة غير صالح" });
        return;
      }

      // حذف الصفحة
      const success = await this.service.deletePage(id);
      
      if (success) {
        res.json({ success: true, message: "تم حذف الصفحة بنجاح" });
      } else {
        res.status(404).json({ success: false, message: "الصفحة غير موجودة" });
      }
    } catch (error) {
      console.error("Error in deletePage controller:", error);
      
      // التعامل مع حالة عدم وجود الصفحة
      if ((error as Error).message.includes("not found")) {
        res.status(404).json({ success: false, message: "الصفحة غير موجودة" });
        return;
      }
      
      res.status(500).json({ 
        success: false, 
        message: "حدث خطأ أثناء حذف الصفحة", 
        error: (error as Error).message 
      });
    }
  }

  /**
   * الحصول على قائمة بكل الصفحات
   */
  async listPages(req: Request, res: Response): Promise<void> {
    try {
      // استخراج المعلمات من الاستعلام
      const isPublished = req.query.isPublished !== undefined 
        ? req.query.isPublished === 'true' 
        : undefined;
      const showInHeader = req.query.showInHeader !== undefined 
        ? req.query.showInHeader === 'true' 
        : undefined;
      const showInFooter = req.query.showInFooter !== undefined 
        ? req.query.showInFooter === 'true' 
        : undefined;
      
      // إنشاء كائن الفلتر
      const filters = {} as any;
      if (isPublished !== undefined) filters.isPublished = isPublished;
      if (showInHeader !== undefined) filters.showInHeader = showInHeader;
      if (showInFooter !== undefined) filters.showInFooter = showInFooter;
      
      // جلب الصفحات
      const pages = await this.service.listPages(
        Object.keys(filters).length > 0 ? filters : undefined
      );
      
      res.json({ success: true, data: pages });
    } catch (error) {
      console.error("Error in listPages controller:", error);
      res.status(500).json({ 
        success: false, 
        message: "حدث خطأ أثناء جلب الصفحات", 
        error: (error as Error).message 
      });
    }
  }
}