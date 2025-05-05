import { Request, Response } from "express";
import { SeoSettingsService } from "../services/seo-settings-service";
import { z } from "zod";
import { insertSeoSettingsSchema } from "@shared/schema";

/**
 * وحدة التحكم بإعدادات SEO
 * تتعامل مع طلبات HTTP المتعلقة بإعدادات تحسين محركات البحث
 */
export class SeoSettingsController {
  private service: SeoSettingsService;

  constructor() {
    this.service = new SeoSettingsService();
  }

  /**
   * الحصول على إعداد SEO بواسطة المعرف
   */
  async getSeoSetting(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: "معرف الإعداد غير صالح" });
        return;
      }

      const seoSetting = await this.service.getSeoSetting(id);
      if (!seoSetting) {
        res.status(404).json({ success: false, message: "إعداد SEO غير موجود" });
        return;
      }

      res.json({ success: true, data: seoSetting });
    } catch (error) {
      console.error("Error in getSeoSetting controller:", error);
      res.status(500).json({ 
        success: false, 
        message: "حدث خطأ أثناء جلب إعداد SEO", 
        error: (error as Error).message 
      });
    }
  }

  /**
   * الحصول على إعداد SEO بواسطة مسار الصفحة
   */
  async getSeoSettingByPath(req: Request, res: Response): Promise<void> {
    try {
      const { path } = req.params;
      
      const seoSetting = await this.service.getSeoSettingByPath(path);
      if (!seoSetting) {
        res.status(404).json({ success: false, message: "إعداد SEO غير موجود لهذا المسار" });
        return;
      }

      res.json({ success: true, data: seoSetting });
    } catch (error) {
      console.error("Error in getSeoSettingByPath controller:", error);
      res.status(500).json({ 
        success: false, 
        message: "حدث خطأ أثناء جلب إعداد SEO", 
        error: (error as Error).message 
      });
    }
  }

  /**
   * إنشاء إعداد SEO جديد
   */
  async createSeoSetting(req: Request, res: Response): Promise<void> {
    try {
      // التحقق من صحة البيانات المرسلة
      const seoSettingData = req.body;
      
      // إنشاء إعداد SEO
      const seoSetting = await this.service.createSeoSetting(seoSettingData);
      
      res.status(201).json({ success: true, message: "تم إنشاء إعداد SEO بنجاح", data: seoSetting });
    } catch (error) {
      console.error("Error in createSeoSetting controller:", error);
      
      // التعامل مع أخطاء التحقق من صحة البيانات
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          success: false, 
          message: "بيانات إعداد SEO غير صالحة", 
          errors: error.errors 
        });
        return;
      }
      
      // التعامل مع حالة وجود إعداد آخر بنفس المسار
      if ((error as Error).message.includes("already exists")) {
        res.status(409).json({ 
          success: false, 
          message: "يوجد بالفعل إعداد SEO لهذا المسار" 
        });
        return;
      }
      
      res.status(500).json({ 
        success: false, 
        message: "حدث خطأ أثناء إنشاء إعداد SEO", 
        error: (error as Error).message 
      });
    }
  }

  /**
   * تحديث إعداد SEO موجود
   */
  async updateSeoSetting(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: "معرف الإعداد غير صالح" });
        return;
      }

      // التحقق من صحة البيانات المرسلة
      const seoSettingData = req.body;
      
      // تحديث إعداد SEO
      const seoSetting = await this.service.updateSeoSetting(id, seoSettingData);
      
      res.json({ success: true, message: "تم تحديث إعداد SEO بنجاح", data: seoSetting });
    } catch (error) {
      console.error("Error in updateSeoSetting controller:", error);
      
      // التعامل مع أخطاء التحقق من صحة البيانات
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          success: false, 
          message: "بيانات إعداد SEO غير صالحة", 
          errors: error.errors 
        });
        return;
      }
      
      // التعامل مع حالة عدم وجود الإعداد
      if ((error as Error).message.includes("not found")) {
        res.status(404).json({ success: false, message: "إعداد SEO غير موجود" });
        return;
      }
      
      // التعامل مع حالة وجود إعداد آخر بنفس المسار
      if ((error as Error).message.includes("already exists")) {
        res.status(409).json({ 
          success: false, 
          message: "يوجد بالفعل إعداد SEO آخر لهذا المسار" 
        });
        return;
      }
      
      res.status(500).json({ 
        success: false, 
        message: "حدث خطأ أثناء تحديث إعداد SEO", 
        error: (error as Error).message 
      });
    }
  }

  /**
   * حذف إعداد SEO
   */
  async deleteSeoSetting(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: "معرف الإعداد غير صالح" });
        return;
      }

      // حذف إعداد SEO
      const success = await this.service.deleteSeoSetting(id);
      
      if (success) {
        res.json({ success: true, message: "تم حذف إعداد SEO بنجاح" });
      } else {
        res.status(404).json({ success: false, message: "إعداد SEO غير موجود" });
      }
    } catch (error) {
      console.error("Error in deleteSeoSetting controller:", error);
      
      // التعامل مع حالة عدم وجود الإعداد
      if ((error as Error).message.includes("not found")) {
        res.status(404).json({ success: false, message: "إعداد SEO غير موجود" });
        return;
      }
      
      res.status(500).json({ 
        success: false, 
        message: "حدث خطأ أثناء حذف إعداد SEO", 
        error: (error as Error).message 
      });
    }
  }

  /**
   * الحصول على قائمة بكل إعدادات SEO
   */
  async listSeoSettings(req: Request, res: Response): Promise<void> {
    try {
      const seoSettings = await this.service.listSeoSettings();
      res.json({ success: true, data: seoSettings });
    } catch (error) {
      console.error("Error in listSeoSettings controller:", error);
      res.status(500).json({ 
        success: false, 
        message: "حدث خطأ أثناء جلب إعدادات SEO", 
        error: (error as Error).message 
      });
    }
  }
}