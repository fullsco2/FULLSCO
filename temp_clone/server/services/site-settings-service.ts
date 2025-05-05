import { SiteSettingsRepository } from '../repositories/site-settings-repository';
import { InsertSiteSetting, SiteSetting } from '../../shared/schema';

export class SiteSettingsService {
  private repository: SiteSettingsRepository;

  constructor() {
    this.repository = new SiteSettingsRepository();
  }

  /**
   * الحصول على إعدادات الموقع
   */
  async getSiteSettings(): Promise<SiteSetting | undefined> {
    // نقوم بتحويل القيم المنطقية عند الضرورة
    const settings = await this.repository.getSiteSettings();
    
    if (!settings) {
      return undefined;
    }
    
    // نعالج القيم المنطقية
    return this.processBooleanValues(settings);
  }

  /**
   * تحديث إعدادات الموقع
   */
  async updateSiteSettings(data: Partial<InsertSiteSetting>): Promise<SiteSetting> {
    // نقوم بتحويل القيم المنطقية عند الضرورة
    const processedData = this.processBooleanValues(data);
    
    const updateResult = await this.repository.updateSiteSettings(processedData);
    
    return this.processBooleanValues(updateResult);
  }

  /**
   * معالجة القيم المنطقية (Boolean)
   * تحويل القيم النصية ('true', 'false') إلى قيم منطقية
   */
  private processBooleanValues<T extends Record<string, any>>(data: T): T {
    // قائمة بالحقول المنطقية في كائن إعدادات الموقع
    const booleanFields = [
      'enableDarkMode',
      'rtlDirection',
      'enableNewsletter',
      'enableScholarshipSearch',
      'showHeroSection',
      'showFeaturedScholarships',
      'showSearchSection',
      'showCategoriesSection',
      'showCountriesSection',
      'showLatestArticles',
      'showSuccessStories',
      'showNewsletterSection',
      'showStatisticsSection',
      'showPartnersSection'
    ];
    
    // نسخة جديدة من البيانات لتجنب تعديل البيانات الأصلية
    const processed = { ...data };
    
    // نعالج كل حقل منطقي
    for (const field of booleanFields) {
      if (field in processed) {
        const value = processed[field];
        
        // نحول القيم النصية إلى قيم منطقية
        if (typeof value === 'string') {
          console.log(`Converting boolean value: ${value}, type: ${typeof value}`);
          if (value.toLowerCase() === 'true') {
            processed[field] = true;
            console.log('  -> converted to TRUE');
          } else if (value.toLowerCase() === 'false') {
            processed[field] = false;
            console.log('  -> converted to FALSE');
          }
        } else if (typeof value === 'boolean') {
          console.log(`Converting boolean value: ${value}, type: ${typeof value}`);
          // لا تغيير مطلوب، فقط للتسجيل
          console.log(`  -> converted to ${value ? 'TRUE' : 'FALSE'}`);
        }
      }
    }
    
    console.log('Processed site settings:', processed);
    
    return processed as T;
  }
}