import { db } from "../../db";
import { siteSettings, InsertSiteSetting, SiteSetting } from "../../shared/schema";
import { eq } from "drizzle-orm";

export class SiteSettingsRepository {
  /**
   * الحصول على إعدادات الموقع
   * ملاحظة: هناك سجل واحد فقط في جدول إعدادات الموقع (id = 1)
   */
  async getSiteSettings(): Promise<SiteSetting | undefined> {
    try {
      // الحصول على السجل الأول (والوحيد) من جدول الإعدادات
      const settings = await db.query.siteSettings.findFirst();
      return settings;
    } catch (error) {
      console.error("خطأ في الحصول على إعدادات الموقع:", error);
      throw error;
    }
  }

  /**
   * تحديث إعدادات الموقع
   * ملاحظة: هناك سجل واحد فقط في جدول إعدادات الموقع (id = 1)
   */
  async updateSiteSettings(data: Partial<InsertSiteSetting>): Promise<SiteSetting> {
    try {
      // التحقق من وجود إعدادات
      const existingSettings = await this.getSiteSettings();
      
      if (!existingSettings) {
        // إذا لم تكن هناك إعدادات، قم بإنشائها
        const [newSettings] = await db.insert(siteSettings).values(data).returning();
        return newSettings;
      }
      
      // تحديث الإعدادات الموجودة
      const [updatedSettings] = await db.update(siteSettings)
        .set(data)
        .where(eq(siteSettings.id, 1))
        .returning();
      
      if (!updatedSettings) {
        throw new Error("فشل في تحديث إعدادات الموقع");
      }
      
      return updatedSettings;
    } catch (error) {
      console.error("خطأ في تحديث إعدادات الموقع:", error);
      throw error;
    }
  }
}