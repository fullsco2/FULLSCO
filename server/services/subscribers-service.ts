import { z } from "zod";
import { SubscribersRepository } from "../repositories/subscribers-repository";
import { Subscriber, InsertSubscriber, insertSubscriberSchema } from "@shared/schema";

/**
 * خدمة المشتركين
 * تحتوي على المنطق الأساسي للتعامل مع المشتركين في النشرة البريدية
 */
export class SubscribersService {
  private repository: SubscribersRepository;

  constructor() {
    this.repository = new SubscribersRepository();
  }

  /**
   * الحصول على مشترك بواسطة المعرف
   */
  async getSubscriber(id: number): Promise<Subscriber | undefined> {
    return this.repository.getSubscriber(id);
  }

  /**
   * الحصول على مشترك بواسطة البريد الإلكتروني
   */
  async getSubscriberByEmail(email: string): Promise<Subscriber | undefined> {
    return this.repository.getSubscriberByEmail(email);
  }

  /**
   * إنشاء مشترك جديد
   */
  async createSubscriber(subscriberData: z.infer<typeof insertSubscriberSchema>): Promise<Subscriber> {
    // التحقق من صحة البيانات
    const validatedData = insertSubscriberSchema.parse(subscriberData);
    
    // التحقق مما إذا كان البريد الإلكتروني مسجلاً بالفعل
    const existingSubscriber = await this.repository.getSubscriberByEmail(validatedData.email);
    if (existingSubscriber) {
      throw new Error(`Email ${validatedData.email} is already subscribed`);
    }
    
    // إنشاء المشترك
    return this.repository.createSubscriber(validatedData);
  }

  /**
   * حذف مشترك
   */
  async deleteSubscriber(id: number): Promise<boolean> {
    // التحقق من وجود المشترك
    const existingSubscriber = await this.repository.getSubscriber(id);
    if (!existingSubscriber) {
      throw new Error(`Subscriber with ID ${id} not found`);
    }

    // حذف المشترك
    return this.repository.deleteSubscriber(id);
  }

  /**
   * الحصول على قائمة بكل المشتركين
   */
  async listSubscribers(): Promise<Subscriber[]> {
    return this.repository.listSubscribers();
  }
}