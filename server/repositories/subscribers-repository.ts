import { db } from "../db";
import { eq } from "drizzle-orm";
import { Subscriber, InsertSubscriber, subscribers } from "@shared/schema";

/**
 * فئة مستودع المشتركين
 * تتعامل مع عمليات قاعدة البيانات المتعلقة بالمشتركين في النشرة البريدية
 */
export class SubscribersRepository {
  /**
   * الحصول على مشترك بواسطة المعرف
   */
  async getSubscriber(id: number): Promise<Subscriber | undefined> {
    try {
      const result = await db.query.subscribers.findFirst({
        where: eq(subscribers.id, id)
      });
      return result;
    } catch (error) {
      console.error("Error in getSubscriber:", error);
      throw error;
    }
  }

  /**
   * الحصول على مشترك بواسطة البريد الإلكتروني
   */
  async getSubscriberByEmail(email: string): Promise<Subscriber | undefined> {
    try {
      const result = await db.query.subscribers.findFirst({
        where: eq(subscribers.email, email)
      });
      return result;
    } catch (error) {
      console.error("Error in getSubscriberByEmail:", error);
      throw error;
    }
  }

  /**
   * إنشاء مشترك جديد
   */
  async createSubscriber(subscriber: InsertSubscriber): Promise<Subscriber> {
    try {
      const [result] = await db.insert(subscribers)
        .values(subscriber)
        .returning();
      return result;
    } catch (error) {
      console.error("Error in createSubscriber:", error);
      throw error;
    }
  }

  /**
   * حذف مشترك
   */
  async deleteSubscriber(id: number): Promise<boolean> {
    try {
      const result = await db.delete(subscribers)
        .where(eq(subscribers.id, id));
      
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      console.error("Error in deleteSubscriber:", error);
      throw error;
    }
  }

  /**
   * الحصول على قائمة بكل المشتركين
   */
  async listSubscribers(): Promise<Subscriber[]> {
    try {
      const result = await db.query.subscribers.findMany({
        orderBy: (subscribers, { desc }) => [desc(subscribers.createdAt)]
      });
      return result;
    } catch (error) {
      console.error("Error in listSubscribers:", error);
      throw error;
    }
  }
}