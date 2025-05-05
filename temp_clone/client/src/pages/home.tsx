import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Hero from '@/components/hero';
import FeaturedScholarships from '@/components/featured-scholarships';
import ScholarshipCategories from '@/components/scholarship-categories';
import LatestArticles from '@/components/latest-articles';
import SuccessStories from '@/components/success-stories';
import Newsletter from '@/components/newsletter';
import Statistics from '@/components/statistics';
import Partners from '@/components/partners';
import AdminPreview from '@/components/admin-preview';
import { SiteSetting } from '@shared/schema';

const Home = () => {
  // الحصول على إعدادات الموقع
  const { data: siteSettingsResponse, isLoading, error } = useQuery<{ success: boolean, data: SiteSetting }>({
    queryKey: ['/api/site-settings'],
  });
  
  // استخراج إعدادات الموقع من الاستجابة
  const siteSettings = siteSettingsResponse?.data;
  
  console.log('Site settings loaded:', siteSettings);
  console.log('Show hero section:', siteSettings?.showHeroSection);
  console.log('Show categories section:', siteSettings?.showCategoriesSection);
  console.log('Show featured scholarships:', siteSettings?.showFeaturedScholarships);
  
  // تعيين بيانات الصفحة التعريفية
  useEffect(() => {
    if (siteSettings) {
      // استخدام عنوان الموقع من الإعدادات
      document.title = `${siteSettings.siteName} - ${siteSettings.siteTagline || 'اعثر على فرصة المنحة الدراسية المثالية'}`;
      
      // استخدام وصف الموقع من الإعدادات
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', siteSettings.siteDescription || 'اكتشف آلاف المنح الدراسية حول العالم واحصل على إرشادات حول كيفية التقديم بنجاح.');
      } else {
        const meta = document.createElement('meta');
        meta.name = 'description';
        meta.content = siteSettings.siteDescription || 'اكتشف آلاف المنح الدراسية حول العالم واحصل على إرشادات حول كيفية التقديم بنجاح.';
        document.head.appendChild(meta);
      }
      
      // تطبيق CSS المخصص إذا كان موجودًا
      if (siteSettings.customCss) {
        const style = document.getElementById('custom-css') || document.createElement('style');
        style.id = 'custom-css';
        style.textContent = siteSettings.customCss;
        if (!document.getElementById('custom-css')) {
          document.head.appendChild(style);
        }
      }
    }
  }, [siteSettings]);

  // إظهار رسالة التحميل إذا كانت البيانات قيد التحميل
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري تحميل الصفحة...</p>
        </div>
      </div>
    );
  }

  // إظهار رسالة خطأ إذا كان هناك خطأ في تحميل الإعدادات
  if (error) {
    console.error('Error loading site settings:', error);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500">حدث خطأ أثناء تحميل إعدادات الموقع</p>
        </div>
      </div>
    );
  }

  // إذا كانت الإعدادات غير محددة
  if (!siteSettings) {
    console.warn('Site settings not available');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">إعدادات الموقع غير متوفرة</p>
        </div>
      </div>
    );
  }

  // لإظهار البيانات الحقيقية من الإعدادات وقيمها ونوعها
  console.log('Complete site settings object:', siteSettings);
  console.log('showHeroSection value:', siteSettings.showHeroSection, 'type:', typeof siteSettings.showHeroSection);
  console.log('showFeaturedScholarships value:', siteSettings.showFeaturedScholarships, 'type:', typeof siteSettings.showFeaturedScholarships);
  console.log('heroTitle value:', siteSettings.heroTitle, 'type:', typeof siteSettings.heroTitle);
  console.log('heroDescription value:', siteSettings.heroDescription, 'type:', typeof siteSettings.heroDescription);

  // التحقق من قيم العرض في الإعدادات برقة أكبر
  // استخدام دالة مساعدة للتحقق من القيم البوليانية بشكل صحيح
  const isTrueValue = (value: any): boolean => {
    // التحقق من القيم المختلفة التي يمكن أن تأتي من قاعدة البيانات
    return value === true || value === 't' || value === 'true' || value === 1;
  };
  
  const showHero = isTrueValue(siteSettings.showHeroSection);
  const showFeatured = isTrueValue(siteSettings.showFeaturedScholarships);
  const showCategories = isTrueValue(siteSettings.showCategoriesSection);
  const showLatestArticles = isTrueValue(siteSettings.showLatestArticles);
  const showSuccessStories = isTrueValue(siteSettings.showSuccessStories);
  const showNewsletter = isTrueValue(siteSettings.showNewsletterSection) && isTrueValue(siteSettings.enableNewsletter);
  const showStatistics = isTrueValue(siteSettings.showStatisticsSection);
  const showPartners = isTrueValue(siteSettings.showPartnersSection);

  console.log('Display decisions:', { showHero, showFeatured, showCategories, showLatestArticles, showSuccessStories, showNewsletter, showStatistics, showPartners });

  return (
    <main>
      {/* عرض كل مكون مع التحقق من وجود الإعداد وقيمته */}
      {showHero && (
        <Hero 
          title={siteSettings.heroTitle || "ابحث عن المنح الدراسية المناسبة لك"}
          subtitle={siteSettings.heroSubtitle || ""}
          description={siteSettings.heroDescription || "أكبر قاعدة بيانات للمنح الدراسية حول العالم"} 
        />
      )}
      
      {showFeatured && (
        <FeaturedScholarships />
      )}
      
      {showCategories && (
        <ScholarshipCategories />
      )}
      
      {showLatestArticles && (
        <LatestArticles />
      )}
      
      {showSuccessStories && (
        <SuccessStories />
      )}
      
      {showNewsletter && (
        <Newsletter />
      )}
      
      {showStatistics && (
        <Statistics />
      )}
      
      {showPartners && (
        <Partners />
      )}
      
      <AdminPreview />
    </main>
  );
};

export default Home;
