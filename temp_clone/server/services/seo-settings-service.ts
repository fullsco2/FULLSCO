import { z } from "zod";
import { SeoSettingsRepository } from "../repositories/seo-settings-repository";
import { SeoSetting, InsertSeoSetting, insertSeoSettingsSchema } from "@shared/schema";

/**
 * خدمة إعدادات SEO
 * تحتوي على المنطق الأساسي للتعامل مع إعدادات تحسين محركات البحث
 */
export class SeoSettingsService {
  private repository: SeoSettingsRepository;

  constructor() {
    this.repository = new SeoSettingsRepository();
  }

  /**
   * الحصول على إعداد SEO بواسطة المعرف
   */
  async getSeoSetting(id: number): Promise<SeoSetting | undefined> {
    return this.repository.getSeoSetting(id);
  }

  /**
   * الحصول على إعداد SEO بواسطة مسار الصفحة
   */
  async getSeoSettingByPath(pagePath: string): Promise<SeoSetting | undefined> {
    return this.repository.getSeoSettingByPath(pagePath);
  }

  /**
   * إنشاء إعداد SEO جديد
   */
  async createSeoSetting(seoSettingData: z.infer<typeof insertSeoSettingsSchema>): Promise<SeoSetting> {
    // التحقق من صحة البيانات
    const validatedData = insertSeoSettingsSchema.parse(seoSettingData);
    
    // التحقق مما إذا كان هناك إعداد SEO بنفس المسار
    const existingSetting = await this.repository.getSeoSettingByPath(validatedData.pagePath);
    if (existingSetting) {
      throw new Error(`SEO setting for path ${validatedData.pagePath} already exists`);
    }
    
    // إنشاء إعداد SEO
    return this.repository.createSeoSetting(validatedData);
  }

  /**
   * تحديث إعداد SEO موجود
   */
  async updateSeoSetting(id: number, seoSettingData: Partial<z.infer<typeof insertSeoSettingsSchema>>): Promise<SeoSetting | undefined> {
    // التحقق من وجود إعداد SEO
    const existingSetting = await this.repository.getSeoSetting(id);
    if (!existingSetting) {
      throw new Error(`SEO setting with ID ${id} not found`);
    }

    // التحقق من صحة البيانات
    const validatedData = insertSeoSettingsSchema.partial().parse(seoSettingData);
    
    // التحقق مما إذا كان هناك تغيير في المسار وهناك إعداد آخر بنفس المسار الجديد
    if (validatedData.pagePath && validatedData.pagePath !== existingSetting.pagePath) {
      const conflictingSetting = await this.repository.getSeoSettingByPath(validatedData.pagePath);
      if (conflictingSetting && conflictingSetting.id !== id) {
        throw new Error(`Another SEO setting with path ${validatedData.pagePath} already exists`);
      }
    }
    
    // تحديث إعداد SEO
    return this.repository.updateSeoSetting(id, validatedData);
  }

  /**
   * حذف إعداد SEO
   */
  async deleteSeoSetting(id: number): Promise<boolean> {
    // التحقق من وجود إعداد SEO
    const existingSetting = await this.repository.getSeoSetting(id);
    if (!existingSetting) {
      throw new Error(`SEO setting with ID ${id} not found`);
    }

    // حذف إعداد SEO
    return this.repository.deleteSeoSetting(id);
  }

  /**
   * الحصول على قائمة بكل إعدادات SEO
   */
  async listSeoSettings(): Promise<SeoSetting[]> {
    return this.repository.listSeoSettings();
  }
}