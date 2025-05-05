import { db } from '../../db';
import { siteSettings } from '../../shared/schema';
import { InsertSiteSetting, SiteSetting } from '../../shared/schema';
import { eq } from 'drizzle-orm';

export class SiteSettingsRepository {
  /**
   * الحصول على إعدادات الموقع
   * @returns إعدادات الموقع أو undefined إذا لم تكن موجودة
   */
  async getSiteSettings(): Promise<SiteSetting | undefined> {
    try {
      const result = await db.select().from(siteSettings).limit(1);
      return result[0];
    } catch (error) {
      console.error('Error in SiteSettingsRepository.getSiteSettings:', error);
      throw error;
    }
  }

  /**
   * إنشاء إعدادات موقع جديدة
   * @param data البيانات المراد إدخالها
   * @returns إعدادات الموقع التي تم إنشاؤها
   */
  async createSiteSettings(data: Partial<InsertSiteSetting>): Promise<SiteSetting> {
    try {
      // القيم الافتراضية
      const defaultSettings: InsertSiteSetting = {
        siteName: 'FULSCO',
        siteTagline: 'فلسكو',
        siteDescription: 'منصة منح دراسية مميزة للطلاب العرب مجانا',
        favicon: null,
        logo: null,
        logoDark: null,
        email: 'info@fullsco.com',
        phone: '0960525425',
        whatsapp: null,
        address: 'امدرمان، السودان',
        facebook: 'https://Facebook.com/fullsco',
        twitter: 'https://twitter.com/fullsco',
        instagram: 'https://instagram.com/fullsco',
        youtube: 'https://youtube.com/c/fullsco',
        linkedin: 'https://linkedin.com/company/fullsco',
        primaryColor: '#3b82f6',
        secondaryColor: '#f59e0b',
        accentColor: '#a855f7',
        enableDarkMode: true,
        rtlDirection: true,
        defaultLanguage: 'ar',
        enableNewsletter: true,
        enableScholarshipSearch: true,
        footerText: '© 2027 FULLSCO. جميع الحقوق محفوظة.',
        showHeroSection: true,
        showFeaturedScholarships: true,
        showSearchSection: true,
        showCategoriesSection: true,
        showCountriesSection: true,
        showLatestArticles: true,
        showSuccessStories: true,
        showNewsletterSection: true,
        showStatisticsSection: true,
        showPartnersSection: true,
        heroTitle: 'ابحث عن المنح الدراسية المناسبة لك',
        heroDescription: 'أكبر قاعدة بيانات للمنح الدراسية حول العالم',
        heroButtonText: 'تصفح المنح',
        customCss: null
      };

      // دمج البيانات المخصصة مع القيم الافتراضية
      const mergedData = { ...defaultSettings, ...data };

      // إدراج البيانات في قاعدة البيانات
      const result = await db.insert(siteSettings).values(mergedData).returning();

      return result[0];
    } catch (error) {
      console.error('Error in SiteSettingsRepository.createSiteSettings:', error);
      throw error;
    }
  }

  /**
   * تحديث إعدادات الموقع
   * @param data البيانات المراد تحديثها
   * @returns إعدادات الموقع المحدثة
   */
  async updateSiteSettings(data: Partial<InsertSiteSetting>): Promise<SiteSetting> {
    try {
      const existingSettings = await this.getSiteSettings();

      if (!existingSettings) {
        // إذا لم تكن الإعدادات موجودة، قم بإنشائها
        return this.createSiteSettings(data);
      }

      // تحديث الإعدادات الموجودة
      const result = await db
        .update(siteSettings)
        .set(data)
        .where(eq(siteSettings.id, existingSettings.id))
        .returning();

      return result[0];
    } catch (error) {
      console.error('Error in SiteSettingsRepository.updateSiteSettings:', error);
      throw error;
    }
  }
}