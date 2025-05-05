import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { useSiteSettings } from '@/hooks/use-site-settings';
import { useIsMobile } from '@/hooks/use-mobile';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import AdminLayout from '@/components/admin/admin-layout';
import { 
  RefreshCw, 
  Save, 
  Info, 
  CheckCircle, 
  PanelTopClose, 
  LayoutDashboard, 
  CircleAlert,
  ChevronDown,
  ChevronUp,
  EyeOff,
  Eye,
  Newspaper,
  Trophy,
  Bell,
  GraduationCap,
  MapPinned,
  FolderKanban,
  Users
} from 'lucide-react';
import { cn } from '@/lib/utils';

const HomeSectionsSettings = () => {
  const { toast } = useToast();
  const { siteSettings, isLoading, isError, refetch, updateSettings } = useSiteSettings();
  const isMobile = useIsMobile();
  const [isSaving, setIsSaving] = useState(false);
  const [accordionState, setAccordionState] = useState({
    hero: true,
    featured: false,
    search: false,
    categories: false,
    countries: false,
    articles: false,
    stories: false,
    newsletter: false,
    statistics: false,
    partners: false
  });

  const form = useForm({
    defaultValues: {
      // إعدادات عرض الأقسام
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

      // محتوى قسم الهيرو
      heroTitle: '',
      heroSubtitle: '',
      heroDescription: '',

      // محتوى قسم المنح المميزة
      featuredScholarshipsTitle: '',
      featuredScholarshipsDescription: '',

      // محتوى قسم التصنيفات
      categoriesSectionTitle: '',
      categoriesSectionDescription: '',

      // محتوى قسم البلدان
      countriesSectionTitle: '',
      countriesSectionDescription: '',

      // محتوى قسم المقالات
      latestArticlesTitle: '',
      latestArticlesDescription: '',

      // محتوى قسم قصص النجاح
      successStoriesTitle: '',
      successStoriesDescription: '',

      // محتوى قسم النشرة البريدية
      newsletterSectionTitle: '',
      newsletterSectionDescription: '',

      // محتوى قسم الإحصائيات
      statisticsSectionTitle: '',
      statisticsSectionDescription: '',

      // محتوى قسم الشركاء
      partnersSectionTitle: '',
      partnersSectionDescription: '',
    },
  });

  useEffect(() => {
    if (siteSettings) {
      // تحديث القيم الافتراضية للنموذج بناءً على إعدادات الموقع
      form.reset({
        showHeroSection: siteSettings.showHeroSection,
        showFeaturedScholarships: siteSettings.showFeaturedScholarships,
        showSearchSection: siteSettings.showSearchSection,
        showCategoriesSection: siteSettings.showCategoriesSection,
        showCountriesSection: siteSettings.showCountriesSection,
        showLatestArticles: siteSettings.showLatestArticles,
        showSuccessStories: siteSettings.showSuccessStories,
        showNewsletterSection: siteSettings.showNewsletterSection,
        showStatisticsSection: siteSettings.showStatisticsSection,
        showPartnersSection: siteSettings.showPartnersSection,

        heroTitle: siteSettings.heroTitle || '',
        heroSubtitle: siteSettings.heroSubtitle || '',
        heroDescription: siteSettings.heroDescription || '',

        featuredScholarshipsTitle: siteSettings.featuredScholarshipsTitle || '',
        featuredScholarshipsDescription: siteSettings.featuredScholarshipsDescription || '',

        categoriesSectionTitle: siteSettings.categoriesSectionTitle || '',
        categoriesSectionDescription: siteSettings.categoriesSectionDescription || '',

        countriesSectionTitle: siteSettings.countriesSectionTitle || '',
        countriesSectionDescription: siteSettings.countriesSectionDescription || '',

        latestArticlesTitle: siteSettings.latestArticlesTitle || '',
        latestArticlesDescription: siteSettings.latestArticlesDescription || '',

        successStoriesTitle: siteSettings.successStoriesTitle || '',
        successStoriesDescription: siteSettings.successStoriesDescription || '',

        newsletterSectionTitle: siteSettings.newsletterSectionTitle || '',
        newsletterSectionDescription: siteSettings.newsletterSectionDescription || '',

        statisticsSectionTitle: siteSettings.statisticsSectionTitle || '',
        statisticsSectionDescription: siteSettings.statisticsSectionDescription || '',

        partnersSectionTitle: siteSettings.partnersSectionTitle || '',
        partnersSectionDescription: siteSettings.partnersSectionDescription || '',
      });
    }
  }, [siteSettings, form]);

  const onSubmit = async (data: any) => {
    setIsSaving(true);

    try {
      // طباعة البيانات التي سيتم إرسالها للتأكد من صحتها
      console.log('Form data to be submitted:', data);
      
      // إضافة id للبيانات حتى يعرف API أي سجل يتم تحديثه
      const dataToSend = {
        ...data,
        id: siteSettings?.id || 1 // استخدام معرف الإعدادات الحالية أو 1 كافتراضي
      };
      
      await updateSettings(dataToSend);
      
      toast({
        title: "تم حفظ الإعدادات",
        description: "تم تحديث إعدادات أقسام الصفحة الرئيسية بنجاح",
      });
      
      // تحديث البيانات بعد الحفظ
      await refetch();
    } catch (error) {
      console.error("Error saving settings:", error);
      
      // رسالة خطأ أكثر تفصيلًا
      let errorMessage = "حدث خطأ أثناء محاولة حفظ الإعدادات";
      
      // إذا كان الخطأ له رسالة، أضفها للوصف
      if (error instanceof Error) {
        errorMessage += ": " + error.message;
      }
      
      toast({
        variant: "destructive",
        title: "خطأ في حفظ الإعدادات",
        description: errorMessage,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const toggleSection = (section: string) => {
    setAccordionState(prev => ({
      ...prev,
      [section]: !prev[section as keyof typeof prev]
    }));
  };

  const renderSkeleton = () => (
    <div className="space-y-6">
      <Skeleton className="w-full h-12" />
      <Skeleton className="w-full h-64" />
      <Skeleton className="w-full h-64" />
    </div>
  );

  const renderError = () => (
    <Alert variant="destructive">
      <CircleAlert className="h-4 w-4" />
      <AlertTitle>خطأ في تحميل البيانات</AlertTitle>
      <AlertDescription>
        حدث خطأ أثناء محاولة تحميل إعدادات الموقع. يرجى تحديث الصفحة أو المحاولة لاحقا.
      </AlertDescription>
      <Button 
        variant="outline" 
        className="mt-2" 
        onClick={() => refetch()}
      >
        <RefreshCw className="ml-2 h-4 w-4" />
        إعادة التحميل
      </Button>
    </Alert>
  );

  const renderContent = () => (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pb-10">
        <div className="grid grid-cols-1 gap-6">
          {/* قسم القسم البطل (Hero) */}
          <Card className="overflow-hidden">
            <CardHeader 
              className={cn(
                "flex flex-row items-center justify-between py-4 cursor-pointer bg-muted/40",
                accordionState.hero ? "border-b" : ""
              )}
              onClick={() => toggleSection('hero')}
            >
              <div className="flex items-center">
                <PanelTopClose className="ml-2 h-5 w-5 text-primary" />
                <CardTitle className="text-lg">قسم الهيرو (Hero)</CardTitle>
              </div>
              <div className="flex items-center gap-3">
                <FormField
                  control={form.control}
                  name="showHeroSection"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2 space-y-0 rtl:space-x-reverse">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </FormControl>
                      <FormLabel className="text-xs text-muted-foreground">
                        {field.value ? "ظاهر" : "مخفي"}
                      </FormLabel>
                    </FormItem>
                  )}
                />
                {accordionState.hero ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </div>
            </CardHeader>

            {accordionState.hero && (
              <CardContent className="pt-4">
                <div className="grid grid-cols-1 gap-4">
                  <FormField
                    control={form.control}
                    name="heroTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>عنوان القسم</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="ابحث عن المنح الدراسية المناسبة لك" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="heroSubtitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>العنوان الفرعي</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="اكتشف آلاف المنح الدراسية" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="heroDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>وصف القسم</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="أكبر قاعدة بيانات للمنح الدراسية حول العالم" 
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            )}
          </Card>

          {/* قسم المنح المميزة */}
          <Card className="overflow-hidden">
            <CardHeader 
              className={cn(
                "flex flex-row items-center justify-between py-4 cursor-pointer bg-muted/40",
                accordionState.featured ? "border-b" : ""
              )}
              onClick={() => toggleSection('featured')}
            >
              <div className="flex items-center">
                <GraduationCap className="ml-2 h-5 w-5 text-primary" />
                <CardTitle className="text-lg">المنح الدراسية المميزة</CardTitle>
              </div>
              <div className="flex items-center gap-3">
                <FormField
                  control={form.control}
                  name="showFeaturedScholarships"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2 space-y-0 rtl:space-x-reverse">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </FormControl>
                      <FormLabel className="text-xs text-muted-foreground">
                        {field.value ? "ظاهر" : "مخفي"}
                      </FormLabel>
                    </FormItem>
                  )}
                />
                {accordionState.featured ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </div>
            </CardHeader>

            {accordionState.featured && (
              <CardContent className="pt-4">
                <div className="grid grid-cols-1 gap-4">
                  <FormField
                    control={form.control}
                    name="featuredScholarshipsTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>عنوان القسم</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="منح دراسية مميزة" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="featuredScholarshipsDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>وصف القسم</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="أبرز المنح الدراسية المتاحة حالياً" 
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            )}
          </Card>
          
          {/* أقسام أخرى... */}
          {/* قسم البحث */}
          <Card className="overflow-hidden">
            <CardHeader 
              className={cn(
                "flex flex-row items-center justify-between py-4 cursor-pointer bg-muted/40",
                accordionState.search ? "border-b" : ""
              )}
              onClick={() => toggleSection('search')}
            >
              <div className="flex items-center">
                <Bell className="ml-2 h-5 w-5 text-primary" />
                <CardTitle className="text-lg">قسم البحث</CardTitle>
              </div>
              <div className="flex items-center gap-3">
                <FormField
                  control={form.control}
                  name="showSearchSection"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2 space-y-0 rtl:space-x-reverse">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </FormControl>
                      <FormLabel className="text-xs text-muted-foreground">
                        {field.value ? "ظاهر" : "مخفي"}
                      </FormLabel>
                    </FormItem>
                  )}
                />
                {accordionState.search ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </div>
            </CardHeader>
          </Card>

          {/* قسم التصنيفات */}
          <Card className="overflow-hidden">
            <CardHeader 
              className={cn(
                "flex flex-row items-center justify-between py-4 cursor-pointer bg-muted/40",
                accordionState.categories ? "border-b" : ""
              )}
              onClick={() => toggleSection('categories')}
            >
              <div className="flex items-center">
                <FolderKanban className="ml-2 h-5 w-5 text-primary" />
                <CardTitle className="text-lg">قسم التصنيفات</CardTitle>
              </div>
              <div className="flex items-center gap-3">
                <FormField
                  control={form.control}
                  name="showCategoriesSection"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2 space-y-0 rtl:space-x-reverse">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </FormControl>
                      <FormLabel className="text-xs text-muted-foreground">
                        {field.value ? "ظاهر" : "مخفي"}
                      </FormLabel>
                    </FormItem>
                  )}
                />
                {accordionState.categories ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </div>
            </CardHeader>

            {accordionState.categories && (
              <CardContent className="pt-4">
                <div className="grid grid-cols-1 gap-4">
                  <FormField
                    control={form.control}
                    name="categoriesSectionTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>عنوان القسم</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="تصفح حسب التخصص" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="categoriesSectionDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>وصف القسم</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="اختر المنح المناسبة حسب مجال دراستك" 
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            )}
          </Card>

          {/* قسم البلدان */}
          <Card className="overflow-hidden">
            <CardHeader 
              className={cn(
                "flex flex-row items-center justify-between py-4 cursor-pointer bg-muted/40",
                accordionState.countries ? "border-b" : ""
              )}
              onClick={() => toggleSection('countries')}
            >
              <div className="flex items-center">
                <MapPinned className="ml-2 h-5 w-5 text-primary" />
                <CardTitle className="text-lg">قسم البلدان</CardTitle>
              </div>
              <div className="flex items-center gap-3">
                <FormField
                  control={form.control}
                  name="showCountriesSection"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2 space-y-0 rtl:space-x-reverse">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </FormControl>
                      <FormLabel className="text-xs text-muted-foreground">
                        {field.value ? "ظاهر" : "مخفي"}
                      </FormLabel>
                    </FormItem>
                  )}
                />
                {accordionState.countries ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </div>
            </CardHeader>

            {accordionState.countries && (
              <CardContent className="pt-4">
                <div className="grid grid-cols-1 gap-4">
                  <FormField
                    control={form.control}
                    name="countriesSectionTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>عنوان القسم</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="تصفح حسب البلد" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="countriesSectionDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>وصف القسم</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="اكتشف المنح الدراسية في بلدان مختلفة" 
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            )}
          </Card>

          {/* قسم المقالات */}
          <Card className="overflow-hidden">
            <CardHeader 
              className={cn(
                "flex flex-row items-center justify-between py-4 cursor-pointer bg-muted/40",
                accordionState.articles ? "border-b" : ""
              )}
              onClick={() => toggleSection('articles')}
            >
              <div className="flex items-center">
                <Newspaper className="ml-2 h-5 w-5 text-primary" />
                <CardTitle className="text-lg">قسم المقالات</CardTitle>
              </div>
              <div className="flex items-center gap-3">
                <FormField
                  control={form.control}
                  name="showLatestArticles"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2 space-y-0 rtl:space-x-reverse">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </FormControl>
                      <FormLabel className="text-xs text-muted-foreground">
                        {field.value ? "ظاهر" : "مخفي"}
                      </FormLabel>
                    </FormItem>
                  )}
                />
                {accordionState.articles ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </div>
            </CardHeader>

            {accordionState.articles && (
              <CardContent className="pt-4">
                <div className="grid grid-cols-1 gap-4">
                  <FormField
                    control={form.control}
                    name="latestArticlesTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>عنوان القسم</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="أحدث المقالات" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="latestArticlesDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>وصف القسم</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="تعرف على آخر النصائح والمعلومات" 
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            )}
          </Card>

          {/* قسم قصص النجاح */}
          <Card className="overflow-hidden">
            <CardHeader 
              className={cn(
                "flex flex-row items-center justify-between py-4 cursor-pointer bg-muted/40",
                accordionState.stories ? "border-b" : ""
              )}
              onClick={() => toggleSection('stories')}
            >
              <div className="flex items-center">
                <Trophy className="ml-2 h-5 w-5 text-primary" />
                <CardTitle className="text-lg">قسم قصص النجاح</CardTitle>
              </div>
              <div className="flex items-center gap-3">
                <FormField
                  control={form.control}
                  name="showSuccessStories"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2 space-y-0 rtl:space-x-reverse">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </FormControl>
                      <FormLabel className="text-xs text-muted-foreground">
                        {field.value ? "ظاهر" : "مخفي"}
                      </FormLabel>
                    </FormItem>
                  )}
                />
                {accordionState.stories ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </div>
            </CardHeader>

            {accordionState.stories && (
              <CardContent className="pt-4">
                <div className="grid grid-cols-1 gap-4">
                  <FormField
                    control={form.control}
                    name="successStoriesTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>عنوان القسم</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="قصص نجاح" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="successStoriesDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>وصف القسم</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="تجارب حقيقية للطلاب الذين حصلوا على منح دراسية" 
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            )}
          </Card>

          {/* قسم النشرة البريدية */}
          <Card className="overflow-hidden">
            <CardHeader 
              className={cn(
                "flex flex-row items-center justify-between py-4 cursor-pointer bg-muted/40",
                accordionState.newsletter ? "border-b" : ""
              )}
              onClick={() => toggleSection('newsletter')}
            >
              <div className="flex items-center">
                <Bell className="ml-2 h-5 w-5 text-primary" />
                <CardTitle className="text-lg">قسم النشرة البريدية</CardTitle>
              </div>
              <div className="flex items-center gap-3">
                <FormField
                  control={form.control}
                  name="showNewsletterSection"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2 space-y-0 rtl:space-x-reverse">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </FormControl>
                      <FormLabel className="text-xs text-muted-foreground">
                        {field.value ? "ظاهر" : "مخفي"}
                      </FormLabel>
                    </FormItem>
                  )}
                />
                {accordionState.newsletter ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </div>
            </CardHeader>

            {accordionState.newsletter && (
              <CardContent className="pt-4">
                <div className="grid grid-cols-1 gap-4">
                  <FormField
                    control={form.control}
                    name="newsletterSectionTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>عنوان القسم</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="النشرة البريدية" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="newsletterSectionDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>وصف القسم</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="اشترك ليصلك كل جديد عن المنح الدراسية" 
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            )}
          </Card>

          {/* قسم الإحصائيات */}
          <Card className="overflow-hidden">
            <CardHeader 
              className={cn(
                "flex flex-row items-center justify-between py-4 cursor-pointer bg-muted/40",
                accordionState.statistics ? "border-b" : ""
              )}
              onClick={() => toggleSection('statistics')}
            >
              <div className="flex items-center">
                <Trophy className="ml-2 h-5 w-5 text-primary" />
                <CardTitle className="text-lg">قسم الإحصائيات</CardTitle>
              </div>
              <div className="flex items-center gap-3">
                <FormField
                  control={form.control}
                  name="showStatisticsSection"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2 space-y-0 rtl:space-x-reverse">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </FormControl>
                      <FormLabel className="text-xs text-muted-foreground">
                        {field.value ? "ظاهر" : "مخفي"}
                      </FormLabel>
                    </FormItem>
                  )}
                />
                {accordionState.statistics ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </div>
            </CardHeader>

            {accordionState.statistics && (
              <CardContent className="pt-4">
                <div className="grid grid-cols-1 gap-4">
                  <FormField
                    control={form.control}
                    name="statisticsSectionTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>عنوان القسم</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="إحصائيات" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="statisticsSectionDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>وصف القسم</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="أرقام عن المنح الدراسية والطلاب حول العالم" 
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            )}
          </Card>
          
          {/* قسم الشركاء */}
          <Card className="overflow-hidden">
            <CardHeader 
              className={cn(
                "flex flex-row items-center justify-between py-4 cursor-pointer bg-muted/40",
                accordionState.partners ? "border-b" : ""
              )}
              onClick={() => toggleSection('partners')}
            >
              <div className="flex items-center">
                <Users className="ml-2 h-5 w-5 text-primary" />
                <CardTitle className="text-lg">قسم الشركاء</CardTitle>
              </div>
              <div className="flex items-center gap-3">
                <FormField
                  control={form.control}
                  name="showPartnersSection"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2 space-y-0 rtl:space-x-reverse">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </FormControl>
                      <FormLabel className="text-xs text-muted-foreground">
                        {field.value ? "ظاهر" : "مخفي"}
                      </FormLabel>
                    </FormItem>
                  )}
                />
                {accordionState.partners ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </div>
            </CardHeader>

            {accordionState.partners && (
              <CardContent className="pt-4">
                <div className="grid grid-cols-1 gap-4">
                  <FormField
                    control={form.control}
                    name="partnersSectionTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>عنوان القسم</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="شركاؤنا" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="partnersSectionDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>وصف القسم</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="المؤسسات والجامعات التي نتعاون معها" 
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            )}
          </Card>

          {/* زر حفظ الإعدادات */}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
              disabled={isSaving}
            >
              <RefreshCw className="ml-2 h-4 w-4" />
              إعادة تعيين
            </Button>
            <Button
              type="submit"
              disabled={isSaving || !form.formState.isDirty}
            >
              {isSaving ? (
                <>
                  <RefreshCw className="ml-2 h-4 w-4 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Save className="ml-2 h-4 w-4" />
                  حفظ الإعدادات
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );

  return (
    <AdminLayout>
      <Helmet>
        <title>إعدادات أقسام الصفحة الرئيسية - لوحة التحكم</title>
      </Helmet>

      <div className="mb-6">
        <h1 className="text-2xl font-bold">إعدادات أقسام الصفحة الرئيسية</h1>
        <p className="text-muted-foreground mt-1">
          إدارة ظهور ومحتوى أقسام الصفحة الرئيسية للموقع
        </p>
      </div>

      {isLoading ? renderSkeleton() : isError ? renderError() : renderContent()}
    </AdminLayout>
  );
};

export default HomeSectionsSettings;