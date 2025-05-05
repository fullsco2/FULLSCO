import { useState, useEffect, createContext, useContext } from 'react';
import { useQuery } from '@tanstack/react-query';

// نوع بيانات إعدادات الموقع
export interface SiteSettings {
  id: number;
  siteName: string;
  siteTagline?: string;
  siteDescription?: string;
  rtlDirection: boolean;
  enableDarkMode: boolean;
  defaultLanguage: string;
  // الحقول الأخرى التي نحتاجها
  [key: string]: any;
}

// إنشاء سياق إعدادات الموقع
const SiteSettingsContext = createContext<{
  siteSettings: SiteSettings | null;
  isLoading: boolean;
  isError: boolean;
  refetch: () => Promise<any>;
  setRtlDirection: (value: boolean) => void;
  updateSettings: (data: Partial<SiteSettings>) => Promise<any>;
}>({
  siteSettings: null,
  isLoading: true,
  isError: false,
  refetch: async () => {},
  setRtlDirection: () => {},
  updateSettings: async () => {},
});

// ثوابت لاستخدامها في localStorage
const LOCAL_STORAGE_KEY = 'site_settings';
const RTL_STORAGE_KEY = 'rtl_direction';

// مزود إعدادات الموقع
export const SiteSettingsProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  // استعلام للحصول على إعدادات الموقع من الخادم
  const { 
    data: settingsResponse, 
    isLoading, 
    isError, 
    refetch 
  } = useQuery<{success: boolean, message: string, data: SiteSettings}>({
    queryKey: ['/api/site-settings'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/site-settings');
        if (!response.ok) throw new Error('فشل في استلام إعدادات الموقع');
        return response.json();
      } catch (error) {
        console.error('Error fetching site settings:', error);
        throw error;
      }
    },
  });
  
  // استخراج بيانات الإعدادات من الاستجابة
  const siteSettings = settingsResponse?.data || null;

  // وظيفة لتغيير اتجاه RTL
  const setRtlDirection = (value: boolean) => {
    if (!siteSettings) return;
    
    // تحديث الاتجاه في المستند
    document.dir = value ? 'rtl' : 'ltr';
    
    // حفظ الإعداد في localStorage
    localStorage.setItem(RTL_STORAGE_KEY, String(value));
    
    console.log('RTL direction updated to:', value);
  };
  
  // وظيفة لتحديث إعدادات الموقع
  const updateSettings = async (data: Partial<SiteSettings>) => {
    try {
      console.log('Updating settings with data:', data);
      
      // نستخدم طريقة PUT بدلاً من PATCH لتتطابق مع الخادم
      const response = await fetch('/api/site-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Server responded with status ${response.status}: ${errorText}`);
        throw new Error(`فشل في تحديث إعدادات الموقع: ${response.status} ${errorText}`);
      }
      
      const updatedSettings = await response.json();
      console.log('Successfully updated settings:', updatedSettings);
      return updatedSettings;
    } catch (error) {
      console.error('Error updating site settings:', error);
      // تحديد نوع الخطأ بشكل أفضل للعرض للمستخدم
      throw error;
    }
  };

  // تطبيق إعدادات RTL وألوان الموقع عند تحميل الإعدادات
  useEffect(() => {
    if (siteSettings) {
      // تطبيق قيم البوليان من API
      const processedSettings = {
        ...siteSettings,
        // التحقق من تنسيق القيم البوليانية وتحويلها
        showHeroSection: convertToBoolean(siteSettings.showHeroSection),
        showFeaturedScholarships: convertToBoolean(siteSettings.showFeaturedScholarships),
        showSearchSection: convertToBoolean(siteSettings.showSearchSection),
        showCategoriesSection: convertToBoolean(siteSettings.showCategoriesSection),
        showCountriesSection: convertToBoolean(siteSettings.showCountriesSection),
        showLatestArticles: convertToBoolean(siteSettings.showLatestArticles),
        showSuccessStories: convertToBoolean(siteSettings.showSuccessStories),
        showNewsletterSection: convertToBoolean(siteSettings.showNewsletterSection),
        showStatisticsSection: convertToBoolean(siteSettings.showStatisticsSection),
        showPartnersSection: convertToBoolean(siteSettings.showPartnersSection),
        enableDarkMode: convertToBoolean(siteSettings.enableDarkMode),
        rtlDirection: convertToBoolean(siteSettings.rtlDirection),
        enableNewsletter: convertToBoolean(siteSettings.enableNewsletter),
        enableScholarshipSearch: convertToBoolean(siteSettings.enableScholarshipSearch)
      };
      
      console.log('Processed settings with fixed booleans:', processedSettings);

      // تحديث localStorage بالإعدادات المعالجة
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(processedSettings));
      
      // تطبيق إعدادات RTL
      const rtlDirection = processedSettings.rtlDirection;
      document.dir = rtlDirection ? 'rtl' : 'ltr';
      console.log('RTL direction set from API:', rtlDirection);
      
      // تطبيق ألوان الموقع من إعدادات الموقع
      if (processedSettings.primaryColor) {
        document.documentElement.style.setProperty('--primary', hexToHSL(processedSettings.primaryColor));
        console.log('Primary color set:', processedSettings.primaryColor);
      }
      
      if (processedSettings.secondaryColor) {
        document.documentElement.style.setProperty('--accent', hexToHSL(processedSettings.secondaryColor));
        console.log('Secondary color set:', processedSettings.secondaryColor);
      }
      
      if (processedSettings.accentColor) {
        // يمكن استخدام لون accentColor كلون ثالث للتمييز
        document.documentElement.style.setProperty('--info', hexToHSL(processedSettings.accentColor));
        console.log('Accent color set:', processedSettings.accentColor);
      }
    }
  }, [siteSettings]);
  
  // دالة مساعدة لتحويل قيم البوليان من API
  function convertToBoolean(value: any): boolean {
    // التحقق من القيم المختلفة التي يمكن أن تأتي من قاعدة البيانات
    return value === true || value === 't' || value === 'true' || value === 1;
  }
  
  // دالة لتحويل اللون من HEX إلى HSL (هو التنسيق المستخدم في متغيرات CSS)
  function hexToHSL(hex: string): string {
    // التأكد من أن اللون يبدأ بـ #
    if (hex.charAt(0) !== '#') {
      hex = '#' + hex;
    }
    
    // تحويل HEX إلى RGB
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      
      h = Math.round(h * 60);
    }
    
    s = Math.round(s * 100);
    l = Math.round(l * 100);
    
    return `${h} ${s}% ${l}%`;
  }

  // استرجاع إعدادات RTL من localStorage عند تشغيل التطبيق
  useEffect(() => {
    // إذا كان هناك إعداد RTL في localStorage، استخدمه مباشرةً قبل استجابة API
    const storedRtl = localStorage.getItem(RTL_STORAGE_KEY);
    if (storedRtl !== null) {
      const rtlValue = storedRtl === 'true';
      document.dir = rtlValue ? 'rtl' : 'ltr';
      console.log('RTL direction set from localStorage:', rtlValue);
    }

    // راقب تغييرات localStorage من نوافذ أخرى
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === RTL_STORAGE_KEY && e.newValue !== null) {
        const rtlValue = e.newValue === 'true';
        document.dir = rtlValue ? 'rtl' : 'ltr';
        console.log('RTL direction updated from another tab:', rtlValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <SiteSettingsContext.Provider value={{ 
      siteSettings, 
      isLoading, 
      isError, 
      refetch,
      setRtlDirection,
      updateSettings
    }}>
      {children}
    </SiteSettingsContext.Provider>
  );
};

// هوك لاستخدام إعدادات الموقع
export const useSiteSettings = () => useContext(SiteSettingsContext);

export default useSiteSettings;