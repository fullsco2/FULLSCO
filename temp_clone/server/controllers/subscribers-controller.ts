import { Request, Response } from "express";
import { SubscribersService } from "../services/subscribers-service";
import { z } from "zod";
import { insertSubscriberSchema } from "@shared/schema";

/**
 * وحدة التحكم بالمشتركين
 * تتعامل مع طلبات HTTP المتعلقة بالمشتركين في النشرة البريدية
 */
export class SubscribersController {
  private service: SubscribersService;

  constructor() {
    this.service = new SubscribersService();
  }

  /**
   * الحصول على مشترك بواسطة المعرف
   */
  async getSubscriber(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: "معرف المشترك غير صالح" });
        return;
      }

      const subscriber = await this.service.getSubscriber(id);
      if (!subscriber) {
        res.status(404).json({ success: false, message: "المشترك غير موجود" });
        return;
      }

      res.json({ success: true, data: subscriber });
    } catch (error) {
      console.error("Error in getSubscriber controller:", error);
      res.status(500).json({ 
        success: false, 
        message: "حدث خطأ أثناء جلب بيانات المشترك", 
        error: (error as Error).message 
      });
    }
  }

  /**
   * إنشاء مشترك جديد
   */
  async createSubscriber(req: Request, res: Response): Promise<void> {
    try {
      // التحقق من صحة البيانات المرسلة
      const subscriberData = req.body;
      
      // إنشاء المشترك
      const subscriber = await this.service.createSubscriber(subscriberData);
      
      res.status(201).json({ success: true, message: "تم تسجيل الاشتراك بنجاح", data: subscriber });
    } catch (error) {
      console.error("Error in createSubscriber controller:", error);
      
      // التعامل مع أخطاء التحقق من صحة البيانات
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          success: false, 
          message: "بيانات المشترك غير صالحة", 
          errors: error.errors 
        });
        return;
      }
      
      // التعامل مع حالة وجود البريد الإلكتروني مسبقاً
      if ((error as Error).message.includes("already subscribed")) {
        res.status(409).json({ 
          success: false, 
          message: "البريد الإلكتروني مسجل بالفعل" 
        });
        return;
      }
      
      res.status(500).json({ 
        success: false, 
        message: "حدث خطأ أثناء تسجيل الاشتراك", 
        error: (error as Error).message 
      });
    }
  }

  /**
   * حذف مشترك
   */
  async deleteSubscriber(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: "معرف المشترك غير صالح" });
        return;
      }

      // حذف المشترك
      const success = await this.service.deleteSubscriber(id);
      
      if (success) {
        res.json({ success: true, message: "تم إلغاء الاشتراك بنجاح" });
      } else {
        res.status(404).json({ success: false, message: "المشترك غير موجود" });
      }
    } catch (error) {
      console.error("Error in deleteSubscriber controller:", error);
      
      // التعامل مع حالة عدم وجود المشترك
      if ((error as Error).message.includes("not found")) {
        res.status(404).json({ success: false, message: "المشترك غير موجود" });
        return;
      }
      
      res.status(500).json({ 
        success: false, 
        message: "حدث خطأ أثناء إلغاء الاشتراك", 
        error: (error as Error).message 
      });
    }
  }

  /**
   * الحصول على قائمة بكل المشتركين
   */
  async listSubscribers(req: Request, res: Response): Promise<void> {
    try {
      const subscribers = await this.service.listSubscribers();
      res.json({ success: true, data: subscribers });
    } catch (error) {
      console.error("Error in listSubscribers controller:", error);
      res.status(500).json({ 
        success: false, 
        message: "حدث خطأ أثناء جلب المشتركين", 
        error: (error as Error).message 
      });
    }
  }
}