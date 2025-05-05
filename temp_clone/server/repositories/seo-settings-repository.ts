import { db } from "../db";
import { eq } from "drizzle-orm";
import { SeoSetting, InsertSeoSetting, seoSettings } from "@shared/schema";

/**
 * فئة مستودع إعدادات SEO
 * تتعامل مع عمليات قاعدة البيانات المتعلقة بإعدادات تحسين محركات البحث
 */
export class SeoSettingsRepository {
  /**
   * الحصول على إعداد SEO بواسطة المعرف
   */
  async getSeoSetting(id: number): Promise<SeoSetting | undefined> {
    try {
      const result = await db.query.seoSettings.findFirst({
        where: eq(seoSettings.id, id)
      });
      return result;
    } catch (error) {
      console.error("Error in getSeoSetting:", error);
      throw error;
    }
  }

  /**
   * الحصول على إعداد SEO بواسطة مسار الصفحة
   */
  async getSeoSettingByPath(pagePath: string): Promise<SeoSetting | undefined> {
    try {
      const result = await db.query.seoSettings.findFirst({
        where: eq(seoSettings.pagePath, pagePath)
      });
      return result;
    } catch (error) {
      console.error("Error in getSeoSettingByPath:", error);
      throw error;
    }
  }

  /**
   * إنشاء إعداد SEO جديد
   */
  async createSeoSetting(seoSetting: InsertSeoSetting): Promise<SeoSetting> {
    try {
      const [result] = await db.insert(seoSettings)
        .values(seoSetting)
        .returning();
      return result;
    } catch (error) {
      console.error("Error in createSeoSetting:", error);
      throw error;
    }
  }

  /**
   * تحديث إعداد SEO موجود
   */
  async updateSeoSetting(id: number, seoSetting: Partial<InsertSeoSetting>): Promise<SeoSetting | undefined> {
    try {
      const [result] = await db.update(seoSettings)
        .set(seoSetting)
        .where(eq(seoSettings.id, id))
        .returning();
      return result;
    } catch (error) {
      console.error("Error in updateSeoSetting:", error);
      throw error;
    }
  }

  /**
   * حذف إعداد SEO
   */
  async deleteSeoSetting(id: number): Promise<boolean> {
    try {
      const result = await db.delete(seoSettings)
        .where(eq(seoSettings.id, id));
      
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      console.error("Error in deleteSeoSetting:", error);
      throw error;
    }
  }

  /**
   * الحصول على قائمة بكل إعدادات SEO
   */
  async listSeoSettings(): Promise<SeoSetting[]> {
    try {
      const result = await db.query.seoSettings.findMany();
      return result;
    } catch (error) {
      console.error("Error in listSeoSettings:", error);
      throw error;
    }
  }
}