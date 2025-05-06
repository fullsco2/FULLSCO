"use client";

import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { RefreshCw, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// نموذج البيانات للإعدادات
const siteSettingsSchema = z.object({
  // المعلومات الأساسية
  siteName: z.string().min(2, { message: "اسم الموقع مطلوب" }),
  siteTagline: z.string().optional(),
  siteDescription: z.string().optional(),
  email: z.string().email({ message: "البريد الإلكتروني غير صالح" }).optional().or(z.literal("")),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  address: z.string().optional(),

  // وسائل التواصل الاجتماعي
  facebook: z.string().url({ message: "الرابط غير صالح" }).optional().or(z.literal("")),
  twitter: z.string().url({ message: "الرابط غير صالح" }).optional().or(z.literal("")),
  instagram: z.string().url({ message: "الرابط غير صالح" }).optional().or(z.literal("")),
  youtube: z.string().url({ message: "الرابط غير صالح" }).optional().or(z.literal("")),
  linkedin: z.string().url({ message: "الرابط غير صالح" }).optional().or(z.literal("")),

  // الألوان والظهور
  primaryColor: z.string().regex(/^#([A-Fa-f0-9]{6})$/, { message: "اللون غير صالح" }),
  secondaryColor: z.string().regex(/^#([A-Fa-f0-9]{6})$/, { message: "اللون غير صالح" }),
  accentColor: z.string().regex(/^#([A-Fa-f0-9]{6})$/, { message: "اللون غير صالح" }),
  enableDarkMode: z.boolean().default(true),
  rtlDirection: z.boolean().default(true),
  
  // نص التذييل
  footerText: z.string().optional(),
  
  // إعدادات اللغة والوظائف
  defaultLanguage: z.string().default("ar"),
  enableNewsletter: z.boolean().default(true),
  enableScholarshipSearch: z.boolean().default(true),

  // إعدادات الصفحة الرئيسية
  showHeroSection: z.boolean().default(true),
  heroTitle: z.string().optional(),
  heroSubtitle: z.string().optional(),
  heroDescription: z.string().optional(),
  
  showFeaturedScholarships: z.boolean().default(true),
  featuredScholarshipsTitle: z.string().optional(),
  featuredScholarshipsDescription: z.string().optional(),
  
  showSearchSection: z.boolean().default(true),
  showCategoriesSection: z.boolean().default(true),
  categoriesSectionTitle: z.string().optional(),
  categoriesSectionDescription: z.string().optional(),
  
  showCountriesSection: z.boolean().default(true),
  countriesSectionTitle: z.string().optional(),
  countriesSectionDescription: z.string().optional(),
  
  showLatestArticles: z.boolean().default(true),
  latestArticlesTitle: z.string().optional(),
  latestArticlesDescription: z.string().optional(),
  
  showSuccessStories: z.boolean().default(true),
  successStoriesTitle: z.string().optional(),
  successStoriesDescription: z.string().optional(),
  
  showNewsletterSection: z.boolean().default(true),
  newsletterSectionTitle: z.string().optional(),
  newsletterSectionDescription: z.string().optional(),
  
  showStatisticsSection: z.boolean().default(true),
  statisticsSectionTitle: z.string().optional(),
  statisticsSectionDescription: z.string().optional(),
  
  showPartnersSection: z.boolean().default(false),
  partnersSectionTitle: z.string().optional(),
  partnersSectionDescription: z.string().optional(),
  
  // إعدادات تخطيط الصفحات
  homePageLayout: z.string().default("default"),
  scholarshipPageLayout: z.string().default("default"),
  articlePageLayout: z.string().default("default"),
  
  // CSS مخصص
  customCss: z.string().optional(),
});

type SiteSettingsFormValues = z.infer<typeof siteSettingsSchema>;

export default function SiteSettingsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("general");

  // جلب بيانات إعدادات الموقع
  const { data: settings, isLoading } = useQuery({
    queryKey: ["/api/site-settings"],
    queryFn: async () => {
      const response = await fetch("/api/site-settings");
      if (!response.ok) {
        throw new Error("فشل في جلب إعدادات الموقع");
      }
      
      const data = await response.json();
      return data.data || data;
    },
  });

  // إعداد نموذج التحرير
  const form = useForm<SiteSettingsFormValues>({
    resolver: zodResolver(siteSettingsSchema),
    defaultValues: {
      siteName: "",
      siteTagline: "",
      siteDescription: "",
      email: "",
      phone: "",
      whatsapp: "",
      address: "",
      facebook: "",
      twitter: "",
      instagram: "",
      youtube: "",
      linkedin: "",
      primaryColor: "#3b82f6", // أزرق
      secondaryColor: "#f59e0b", // برتقالي
      accentColor: "#a855f7", // أرجواني
      enableDarkMode: true,
      rtlDirection: true,
      footerText: "",
      defaultLanguage: "ar",
      enableNewsletter: true,
      enableScholarshipSearch: true,
      showHeroSection: true,
      heroTitle: "",
      heroSubtitle: "",
      heroDescription: "",
      showFeaturedScholarships: true,
      featuredScholarshipsTitle: "",
      featuredScholarshipsDescription: "",
      showSearchSection: true,
      showCategoriesSection: true,
      categoriesSectionTitle: "",
      categoriesSectionDescription: "",
      showCountriesSection: true,
      countriesSectionTitle: "",
      countriesSectionDescription: "",
      showLatestArticles: true,
      latestArticlesTitle: "",
      latestArticlesDescription: "",
      showSuccessStories: true,
      successStoriesTitle: "",
      successStoriesDescription: "",
      showNewsletterSection: true,
      newsletterSectionTitle: "",
      newsletterSectionDescription: "",
      showStatisticsSection: true,
      statisticsSectionTitle: "",
      statisticsSectionDescription: "",
      showPartnersSection: false,
      partnersSectionTitle: "",
      partnersSectionDescription: "",
      homePageLayout: "default",
      scholarshipPageLayout: "default",
      articlePageLayout: "default",
      customCss: "",
    },
  });

  // عند استلام البيانات من الخادم، تحديث النموذج
  React.useEffect(() => {
    if (settings) {
      // تحويل Boolean من النص إلى القيم الصحيحة
      const processedSettings = {
        ...settings,
        enableDarkMode: Boolean(settings.enableDarkMode),
        rtlDirection: Boolean(settings.rtlDirection),
        enableNewsletter: Boolean(settings.enableNewsletter),
        enableScholarshipSearch: Boolean(settings.enableScholarshipSearch),
        showHeroSection: Boolean(settings.showHeroSection),
        showFeaturedScholarships: Boolean(settings.showFeaturedScholarships),
        showSearchSection: Boolean(settings.showSearchSection),
        showCategoriesSection: Boolean(settings.showCategoriesSection),
        showCountriesSection: Boolean(settings.showCountriesSection),
        showLatestArticles: Boolean(settings.showLatestArticles),
        showSuccessStories: Boolean(settings.showSuccessStories),
        showNewsletterSection: Boolean(settings.showNewsletterSection),
        showStatisticsSection: Boolean(settings.showStatisticsSection),
        showPartnersSection: Boolean(settings.showPartnersSection),
      };

      // تحديث النموذج بالقيم الواردة
      Object.keys(processedSettings).forEach((key) => {
        if (processedSettings[key] !== undefined) {
          form.setValue(key as any, processedSettings[key]);
        }
      });
    }
  }, [settings, form]);

  // تحديث الإعدادات
  const updateSettings = useMutation({
    mutationFn: async (data: SiteSettingsFormValues) => {
      const response = await fetch("/api/site-settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "حدث خطأ أثناء تحديث الإعدادات");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "تم تحديث الإعدادات بنجاح",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/site-settings"] });
    },
    onError: (error: Error) => {
      toast({
        title: "فشل تحديث الإعدادات",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // معالجة تقديم النموذج
  const onSubmit = (data: SiteSettingsFormValues) => {
    updateSettings.mutate(data);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold tracking-tight">
          إعدادات الموقع
        </h1>
        <Button
          type="submit"
          form="site-settings-form"
          disabled={updateSettings.isPending}
        >
          {updateSettings.isPending ? (
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

      {isLoading ? (
        <div className="flex justify-center py-8">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <Form {...form}>
          <form id="site-settings-form" onSubmit={form.handleSubmit(onSubmit)}>
            <Tabs
              defaultValue="general"
              value={activeTab}
              onValueChange={setActiveTab}
              className="space-y-6"
            >
              <TabsList className="flex flex-wrap w-full h-auto p-1 gap-1">
                <TabsTrigger value="general" className="flex-1">
                  معلومات عامة
                </TabsTrigger>
                <TabsTrigger value="social" className="flex-1">
                  التواصل الاجتماعي
                </TabsTrigger>
                <TabsTrigger value="appearance" className="flex-1">
                  المظهر والألوان
                </TabsTrigger>
                <TabsTrigger value="homepage" className="flex-1">
                  الصفحة الرئيسية
                </TabsTrigger>
                <TabsTrigger value="advanced" className="flex-1">
                  إعدادات متقدمة
                </TabsTrigger>
              </TabsList>

              {/* تبويب المعلومات العامة */}
              <TabsContent value="general" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>المعلومات الأساسية</CardTitle>
                    <CardDescription>
                      إدارة المعلومات الأساسية للموقع
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="siteName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>اسم الموقع</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="اسم الموقع" />
                          </FormControl>
                          <FormDescription>
                            يظهر في عنوان المتصفح وفي القوائم
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="siteTagline"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>شعار الموقع</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="شعار الموقع" />
                          </FormControl>
                          <FormDescription>
                            وصف مختصر يظهر بجانب اسم الموقع
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="siteDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>وصف الموقع</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="وصف الموقع"
                              rows={3}
                            />
                          </FormControl>
                          <FormDescription>
                            يستخدم لتحسين محركات البحث (SEO)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>معلومات الاتصال</CardTitle>
                    <CardDescription>
                      معلومات الاتصال الأساسية للموقع
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>البريد الإلكتروني</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="info@example.com"
                              type="email"
                              dir="ltr"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>رقم الهاتف</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="+123456789"
                              dir="ltr"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="whatsapp"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>رقم الواتساب</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="+123456789"
                              dir="ltr"
                            />
                          </FormControl>
                          <FormDescription>
                            يستخدم لزر الاتصال المباشر عبر الواتساب
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>العنوان</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="عنوان المكتب أو الشركة"
                              rows={2}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* تبويب وسائل التواصل الاجتماعي */}
              <TabsContent value="social" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>وسائل التواصل الاجتماعي</CardTitle>
                    <CardDescription>
                      روابط حسابات التواصل الاجتماعي للموقع
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="facebook"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>فيسبوك</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="https://facebook.com/yourpage"
                              dir="ltr"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="twitter"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>تويتر (اكس)</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="https://twitter.com/youraccount"
                              dir="ltr"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="instagram"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>انستغرام</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="https://instagram.com/youraccount"
                              dir="ltr"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="youtube"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>يوتيوب</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="https://youtube.com/c/yourchannel"
                              dir="ltr"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="linkedin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>لينكد إن</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="https://linkedin.com/company/yourcompany"
                              dir="ltr"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* تبويب المظهر والألوان */}
              <TabsContent value="appearance" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>ألوان الموقع</CardTitle>
                    <CardDescription>
                      ضبط الألوان الرئيسية للموقع
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="primaryColor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>اللون الرئيسي</FormLabel>
                            <div className="flex">
                              <FormControl>
                                <Input
                                  {...field}
                                  dir="ltr"
                                  className="rounded-l-none"
                                />
                              </FormControl>
                              <div
                                className="h-10 w-10 rounded-l-md border border-r-0"
                                style={{ backgroundColor: field.value }}
                              />
                            </div>
                            <FormDescription>
                              يستخدم للأزرار والعناصر الأساسية
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="secondaryColor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>اللون الثانوي</FormLabel>
                            <div className="flex">
                              <FormControl>
                                <Input
                                  {...field}
                                  dir="ltr"
                                  className="rounded-l-none"
                                />
                              </FormControl>
                              <div
                                className="h-10 w-10 rounded-l-md border border-r-0"
                                style={{ backgroundColor: field.value }}
                              />
                            </div>
                            <FormDescription>
                              يستخدم للتأكيد على العناصر الثانوية
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="accentColor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>لون التمييز</FormLabel>
                            <div className="flex">
                              <FormControl>
                                <Input
                                  {...field}
                                  dir="ltr"
                                  className="rounded-l-none"
                                />
                              </FormControl>
                              <div
                                className="h-10 w-10 rounded-l-md border border-r-0"
                                style={{ backgroundColor: field.value }}
                              />
                            </div>
                            <FormDescription>
                              يستخدم لإبراز عناصر محددة
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>إعدادات العرض</CardTitle>
                    <CardDescription>
                      ضبط خيارات العرض الأساسية
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="enableDarkMode"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              تفعيل الوضع الداكن
                            </FormLabel>
                            <FormDescription>
                              السماح للمستخدمين بتبديل المظهر بين الوضع الفاتح والداكن
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="rtlDirection"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              اتجاه من اليمين لليسار (RTL)
                            </FormLabel>
                            <FormDescription>
                              ضبط اتجاه الموقع من اليمين لليسار لدعم اللغة العربية
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="footerText"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>نص التذييل</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="© 2024 جميع الحقوق محفوظة" />
                          </FormControl>
                          <FormDescription>
                            نص حقوق النشر في تذييل الموقع
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* تبويب الصفحة الرئيسية */}
              <TabsContent value="homepage" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>مقدمة الصفحة الرئيسية</CardTitle>
                    <CardDescription>
                      إعدادات قسم الترحيب في الصفحة الرئيسية
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="showHeroSection"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              عرض قسم المقدمة
                            </FormLabel>
                            <FormDescription>
                              إظهار قسم الترحيب الرئيسي في الصفحة الرئيسية
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {form.watch("showHeroSection") && (
                      <div className="grid grid-cols-1 gap-4">
                        <FormField
                          control={form.control}
                          name="heroTitle"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>عنوان المقدمة</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="ابحث عن المنح الدراسية المناسبة لك"
                                />
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
                                <Input
                                  {...field}
                                  placeholder="اكتشف آلاف المنح الدراسية حول العالم"
                                />
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
                              <FormLabel>وصف المقدمة</FormLabel>
                              <FormControl>
                                <Textarea
                                  {...field}
                                  placeholder="وصف تفصيلي للمقدمة"
                                  rows={2}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>أقسام الصفحة الرئيسية</CardTitle>
                    <CardDescription>
                      التحكم في الأقسام المعروضة في الصفحة الرئيسية
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="showFeaturedScholarships"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              عرض المنح المميزة
                            </FormLabel>
                            <FormDescription>
                              إظهار قسم المنح الدراسية المميزة
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="showCategoriesSection"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              عرض التصنيفات
                            </FormLabel>
                            <FormDescription>
                              إظهار قسم تصنيفات المنح الدراسية
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="showCountriesSection"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              عرض الدول
                            </FormLabel>
                            <FormDescription>
                              إظهار قسم الدول المانحة للمنح الدراسية
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="showLatestArticles"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              عرض أحدث المقالات
                            </FormLabel>
                            <FormDescription>
                              إظهار قسم أحدث المقالات المنشورة
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="showSuccessStories"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              عرض قصص النجاح
                            </FormLabel>
                            <FormDescription>
                              إظهار قسم قصص نجاح الطلاب
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="showNewsletterSection"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              عرض النشرة البريدية
                            </FormLabel>
                            <FormDescription>
                              إظهار قسم الاشتراك في النشرة البريدية
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="showStatisticsSection"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              عرض الإحصاءات
                            </FormLabel>
                            <FormDescription>
                              إظهار قسم إحصاءات المنصة
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="showPartnersSection"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              عرض الشركاء
                            </FormLabel>
                            <FormDescription>
                              إظهار قسم الشركاء والرعاة
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* تبويب الإعدادات المتقدمة */}
              <TabsContent value="advanced" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>خيارات متقدمة</CardTitle>
                    <CardDescription>
                      إعدادات متقدمة للمستخدمين المتخصصين
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="defaultLanguage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>اللغة الافتراضية</FormLabel>
                          <FormControl>
                            <select
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              {...field}
                            >
                              <option value="ar">العربية</option>
                              <option value="en">الإنجليزية</option>
                            </select>
                          </FormControl>
                          <FormDescription>
                            اللغة الافتراضية للموقع
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="enableNewsletter"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              تفعيل النشرة البريدية
                            </FormLabel>
                            <FormDescription>
                              السماح للمستخدمين بالاشتراك في النشرة البريدية
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="enableScholarshipSearch"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              تفعيل بحث المنح الدراسية
                            </FormLabel>
                            <FormDescription>
                              تمكين خاصية البحث عن المنح الدراسية
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="customCss"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CSS مخصص</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="/* CSS مخصص للموقع */"
                              rows={5}
                              dir="ltr"
                              className="font-mono"
                            />
                          </FormControl>
                          <FormDescription>
                            إضافة أكواد CSS مخصصة لتخصيص مظهر الموقع
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </form>
        </Form>
      )}
    </div>
  );
}
