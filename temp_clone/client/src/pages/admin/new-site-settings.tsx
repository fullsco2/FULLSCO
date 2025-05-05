import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminLayout from '@/components/admin/admin-layout';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, RefreshCw, Palette, Globe, Phone, Mail, Settings } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// زودج سكيما للتحقق من صحة البيانات
const siteSettingsSchema = z.object({
  // إعدادات عامة
  siteName: z.string().min(1, 'اسم الموقع مطلوب'),
  siteTagline: z.string().optional(),
  siteDescription: z.string().optional(),
  favicon: z.string().url('يجب أن يكون رابط صورة صالح').optional().or(z.literal('')),
  logo: z.string().url('يجب أن يكون رابط صورة صالح').optional().or(z.literal('')),
  logoDark: z.string().url('يجب أن يكون رابط صورة صالح').optional().or(z.literal('')),
  
  // إعدادات التواصل
  email: z.string().email('يجب إدخال بريد إلكتروني صالح').optional().or(z.literal('')),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  address: z.string().optional(),
  
  // روابط التواصل الاجتماعي
  facebook: z.string().url('يجب أن يكون رابط صالح').optional().or(z.literal('')),
  twitter: z.string().url('يجب أن يكون رابط صالح').optional().or(z.literal('')),
  instagram: z.string().url('يجب أن يكون رابط صالح').optional().or(z.literal('')),
  youtube: z.string().url('يجب أن يكون رابط صالح').optional().or(z.literal('')),
  linkedin: z.string().url('يجب أن يكون رابط صالح').optional().or(z.literal('')),
  
  // إعدادات الألوان
  primaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'يجب أن يكون لون صالح (هيكس)').optional(),
  secondaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'يجب أن يكون لون صالح (هيكس)').optional(),
  accentColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'يجب أن يكون لون صالح (هيكس)').optional(),
  
  // إعدادات أخرى
  enableDarkMode: z.boolean().default(true),
  rtlDirection: z.boolean().default(true),
  defaultLanguage: z.string().default('ar'),
  enableNewsletter: z.boolean().default(true),
  enableScholarshipSearch: z.boolean().default(true),
  footerText: z.string().optional(),
});

type SiteSettingsFormValues = z.infer<typeof siteSettingsSchema>;

// واجهة لإعدادات الموقع
interface SiteSettings {
  id: number;
  siteName: string;
  siteTagline?: string;
  siteDescription?: string;
  favicon?: string;
  logo?: string;
  logoDark?: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  address?: string;
  facebook?: string;
  twitter?: string;
  instagram?: string;
  youtube?: string;
  linkedin?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  enableDarkMode: boolean;
  rtlDirection: boolean;
  defaultLanguage: string;
  enableNewsletter: boolean;
  enableScholarshipSearch: boolean;
  footerText?: string;
}

export default function NewSiteSettingsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<string>('general');

  // استلام إعدادات الموقع
  const { data: settings, isLoading, isError, refetch } = useQuery<SiteSettings>({
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
    }
  });

  // تحديث إعدادات الموقع
  const updateMutation = useMutation({
    mutationFn: async (updatedSettings: SiteSettingsFormValues) => {
      try {
        const response = await fetch('/api/site-settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedSettings),
        });
        if (!response.ok) throw new Error('فشل في تحديث إعدادات الموقع');
        return response.json();
      } catch (error) {
        console.error('Error updating site settings:', error);
        throw error;
      }
    },
    onSuccess: (updatedSettings) => {
      // تحديث البيانات في ذاكرة التخزين المؤقت
      queryClient.setQueryData(['/api/site-settings'], updatedSettings);
      
      // إعادة تحميل البيانات فقط (بدون إعادة تحميل كامل للصفحة) لتحسين الأداء
      queryClient.invalidateQueries({ queryKey: ['/api/site-settings'] });
      
      toast({ 
        title: 'تم الحفظ بنجاح', 
        description: 'تم تحديث إعدادات الموقع بنجاح' 
      });
      
      // تطبيق التغييرات الأساسية مباشرة (بدون إعادة تحميل)
      if (updatedSettings.primaryColor) {
        try {
          const hexToHSL = (hex: string) => {
            const hexColor = hex.replace('#', '');
            const r = parseInt(hexColor.substr(0, 2), 16) / 255;
            const g = parseInt(hexColor.substr(2, 2), 16) / 255;
            const b = parseInt(hexColor.substr(4, 2), 16) / 255;
            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            let h = 0, s = 0, l = (max + min) / 2;
            if (max !== min) {
              const d = max - min;
              s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
              if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
              else if (max === g) h = (b - r) / d + 2;
              else h = (r - g) / d + 4;
              h *= 60;
            }
            return {
              h: Math.round(h),
              s: Math.round(s * 100),
              l: Math.round(l * 100)
            };
          };
          
          const hsl = hexToHSL(updatedSettings.primaryColor);
          document.documentElement.style.setProperty('--primary', `${hsl.h} ${hsl.s}% ${hsl.l}%`);
          
          if (updatedSettings.secondaryColor) {
            const hsl2 = hexToHSL(updatedSettings.secondaryColor);
            document.documentElement.style.setProperty('--secondary', `${hsl2.h} ${hsl2.s}% ${hsl2.l}%`);
          }
          
          if (updatedSettings.accentColor) {
            const hsl3 = hexToHSL(updatedSettings.accentColor);
            document.documentElement.style.setProperty('--accent', `${hsl3.h} ${hsl3.s}% ${hsl3.l}%`);
          }
        } catch (e) {
          console.error('Error applying color updates:', e);
        }
      }
    },
    onError: (error) => {
      toast({ title: 'خطأ!', description: `فشل في تحديث إعدادات الموقع: ${error.message}`, variant: 'destructive' });
    }
  });

  // نموذج إعدادات الموقع
  const form = useForm<SiteSettingsFormValues>({
    resolver: zodResolver(siteSettingsSchema),
    defaultValues: {
      siteName: '',
      siteTagline: '',
      siteDescription: '',
      favicon: '',
      logo: '',
      logoDark: '',
      email: '',
      phone: '',
      whatsapp: '',
      address: '',
      facebook: '',
      twitter: '',
      instagram: '',
      youtube: '',
      linkedin: '',
      primaryColor: '',
      secondaryColor: '',
      accentColor: '',
      enableDarkMode: true,
      rtlDirection: true,
      defaultLanguage: 'ar',
      enableNewsletter: true,
      enableScholarshipSearch: true,
      footerText: '',
    },
  });

  // تحديث النموذج عند تغيير البيانات
  useEffect(() => {
    if (settings) {
      form.reset({
        siteName: settings.siteName,
        siteTagline: settings.siteTagline || '',
        siteDescription: settings.siteDescription || '',
        favicon: settings.favicon || '',
        logo: settings.logo || '',
        logoDark: settings.logoDark || '',
        email: settings.email || '',
        phone: settings.phone || '',
        whatsapp: settings.whatsapp || '',
        address: settings.address || '',
        facebook: settings.facebook || '',
        twitter: settings.twitter || '',
        instagram: settings.instagram || '',
        youtube: settings.youtube || '',
        linkedin: settings.linkedin || '',
        primaryColor: settings.primaryColor || '',
        secondaryColor: settings.secondaryColor || '',
        accentColor: settings.accentColor || '',
        enableDarkMode: settings.enableDarkMode,
        rtlDirection: settings.rtlDirection,
        defaultLanguage: settings.defaultLanguage,
        enableNewsletter: settings.enableNewsletter,
        enableScholarshipSearch: settings.enableScholarshipSearch,
        footerText: settings.footerText || '',
      });
    }
  }, [settings, form]);

  // معالجة حدث إرسال النموذج
  const onSubmit = (data: SiteSettingsFormValues) => {
    console.log('Submitting complete site settings data', data);
    updateMutation.mutate(data);
  };

  // أزرار العمليات
  const SettingsActions = () => (
    <>
      <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
        <RefreshCw className="ml-2 h-4 w-4" />
        إعادة تحميل
      </Button>
      <Button onClick={form.handleSubmit(onSubmit)} disabled={updateMutation.isPending}>
        {updateMutation.isPending ? (
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
    </>
  );

  return (
    <AdminLayout title="تخصيص الموقع" actions={<SettingsActions />}>
      {isLoading ? (
        <div className="flex justify-center items-center min-h-[50vh]">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          <span className="mr-3 text-lg">جاري التحميل...</span>
        </div>
      ) : isError ? (
        <div className="text-center py-8 bg-destructive/10 rounded-lg">
          <p className="text-destructive text-lg mb-4">حدث خطأ أثناء تحميل البيانات</p>
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="ml-2 h-4 w-4" />
            إعادة المحاولة
          </Button>
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="bg-background sticky top-[72px] z-20 pt-2 pb-3 border-b">
                <TabsList className="w-full">
                  <TabsTrigger value="general">
                    <Settings className="ml-2 h-4 w-4" />
                    إعدادات عامة
                  </TabsTrigger>
                  <TabsTrigger value="appearance">
                    <Palette className="ml-2 h-4 w-4" />
                    المظهر والألوان
                  </TabsTrigger>
                  <TabsTrigger value="contact">
                    <Phone className="ml-2 h-4 w-4" />
                    معلومات التواصل
                  </TabsTrigger>
                  <TabsTrigger value="social">
                    <Globe className="ml-2 h-4 w-4" />
                    التواصل الاجتماعي
                  </TabsTrigger>
                </TabsList>
              </div>
              
              {/* إعدادات عامة */}
              <TabsContent value="general" className="pt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>الإعدادات العامة</CardTitle>
                    <CardDescription>
                      الإعدادات الأساسية للموقع مثل الاسم والوصف
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
                            <Input {...field} placeholder="مثال: FULLSCO" />
                          </FormControl>
                          <FormDescription>
                            اسم الموقع كما سيظهر في شريط العنوان والهيدر
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
                            <Input {...field} placeholder="مثال: منصة المنح الدراسية" />
                          </FormControl>
                          <FormDescription>
                            شعار قصير يظهر بجانب اسم الموقع
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
                              placeholder="وصف قصير للموقع" 
                              rows={3}
                            />
                          </FormControl>
                          <FormDescription>
                            وصف قصير للموقع يظهر في نتائج البحث
                          </FormDescription>
                          <FormMessage />
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
                            <Input {...field} placeholder="مثال: © 2025 FULLSCO. جميع الحقوق محفوظة." />
                          </FormControl>
                          <FormDescription>
                            النص الذي سيظهر في تذييل الموقع
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="defaultLanguage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>اللغة الافتراضية</FormLabel>
                            <Select 
                              value={field.value} 
                              onValueChange={field.onChange}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="اختر اللغة" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="ar">العربية</SelectItem>
                                <SelectItem value="en">الإنجليزية</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="rtlDirection"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between p-3 border rounded-md">
                            <div>
                              <FormLabel className="mb-0">اتجاه RTL</FormLabel>
                              <FormDescription>
                                تمكين الكتابة من اليمين لليسار
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
                        name="enableDarkMode"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between p-3 border rounded-md">
                            <div>
                              <FormLabel className="mb-0">الوضع الداكن</FormLabel>
                              <FormDescription>
                                إتاحة الوضع الداكن للموقع
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
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* إعدادات المظهر */}
              <TabsContent value="appearance" className="pt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>إعدادات المظهر والألوان</CardTitle>
                    <CardDescription>
                      تخصيص مظهر الموقع والشعارات والألوان
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="favicon"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>أيقونة الموقع (Favicon)</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="رابط صورة أيقونة الموقع" />
                            </FormControl>
                            <FormDescription>
                              أيقونة صغيرة تظهر في تبويب المتصفح
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="logo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>شعار الموقع</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="رابط صورة شعار الموقع" />
                            </FormControl>
                            <FormDescription>
                              شعار الموقع في الوضع الفاتح
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="logoDark"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>شعار الوضع الداكن</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="رابط صورة الشعار للوضع الداكن" />
                            </FormControl>
                            <FormDescription>
                              شعار الموقع في الوضع الداكن
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="primaryColor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>اللون الرئيسي</FormLabel>
                            <div className="flex gap-2">
                              <FormControl>
                                <Input {...field} placeholder="#3B82F6" />
                              </FormControl>
                              <input
                                type="color"
                                value={field.value || '#3B82F6'}
                                onChange={(e) => field.onChange(e.target.value)}
                                className="w-10 h-10 rounded-md p-1"
                              />
                            </div>
                            <FormDescription>
                              اللون الرئيسي للموقع (رمز هيكس)
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
                            <div className="flex gap-2">
                              <FormControl>
                                <Input {...field} placeholder="#10B981" />
                              </FormControl>
                              <input
                                type="color"
                                value={field.value || '#10B981'}
                                onChange={(e) => field.onChange(e.target.value)}
                                className="w-10 h-10 rounded-md p-1"
                              />
                            </div>
                            <FormDescription>
                              اللون الثانوي للموقع (رمز هيكس)
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
                            <div className="flex gap-2">
                              <FormControl>
                                <Input {...field} placeholder="#8B5CF6" />
                              </FormControl>
                              <input
                                type="color"
                                value={field.value || '#8B5CF6'}
                                onChange={(e) => field.onChange(e.target.value)}
                                className="w-10 h-10 rounded-md p-1"
                              />
                            </div>
                            <FormDescription>
                              لون التمييز للعناصر البارزة (رمز هيكس)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="enableNewsletter"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between p-3 border rounded-md">
                            <div>
                              <FormLabel className="mb-0">النشرة البريدية</FormLabel>
                              <FormDescription>
                                عرض نموذج الاشتراك بالنشرة البريدية
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
                          <FormItem className="flex flex-row items-center justify-between p-3 border rounded-md">
                            <div>
                              <FormLabel className="mb-0">بحث المنح</FormLabel>
                              <FormDescription>
                                عرض محرك بحث المنح في الصفحة الرئيسية
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
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* إعدادات التواصل */}
              <TabsContent value="contact" className="pt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>معلومات التواصل</CardTitle>
                    <CardDescription>
                      معلومات التواصل الرئيسية للموقع
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
                            <Input {...field} placeholder="info@example.com" />
                          </FormControl>
                          <FormDescription>
                            البريد الإلكتروني العام للتواصل
                          </FormDescription>
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
                            <Input {...field} placeholder="+966 5xxxxxxxx" />
                          </FormControl>
                          <FormDescription>
                            رقم الهاتف للتواصل
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="whatsapp"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>رقم واتساب</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="+966 5xxxxxxxx" />
                          </FormControl>
                          <FormDescription>
                            رقم واتساب للتواصل
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
                            <Textarea {...field} placeholder="عنوان المكتب أو المقر" rows={3} />
                          </FormControl>
                          <FormDescription>
                            عنوان المقر أو المكتب
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* إعدادات التواصل الاجتماعي */}
              <TabsContent value="social" className="pt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>وسائل التواصل الاجتماعي</CardTitle>
                    <CardDescription>
                      روابط الحسابات على مواقع التواصل الاجتماعي
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="facebook"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>فيسبوك</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="https://facebook.com/yourpage" />
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
                            <FormLabel>تويتر</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="https://twitter.com/yourhandle" />
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
                            <FormLabel>انستقرام</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="https://instagram.com/yourprofile" />
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
                              <Input {...field} placeholder="https://youtube.com/c/yourchannel" />
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
                              <Input {...field} placeholder="https://linkedin.com/company/yourcompany" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <p className="text-muted-foreground text-sm">
                      ملاحظة: اترك الحقل فارغًا للحسابات غير المتوفرة
                    </p>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
            
            <div className="sticky bottom-0 py-3 bg-background/80 backdrop-blur-md border-t">
              <div className="container flex justify-end">
                <Button type="submit" disabled={updateMutation.isPending || isLoading}>
                  {updateMutation.isPending ? (
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
      )}
    </AdminLayout>
  );
}