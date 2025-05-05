import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { useSiteSettings } from '@/hooks/use-site-settings';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Skeleton } from '@/components/ui/skeleton';
import AdminLayout from '@/components/admin/admin-layout';
import { 
  RefreshCw, 
  Save, 
  Palette,
  ImageIcon,
  FileEdit,
  SunMoon,
  Smartphone,
  Monitor,
  Code
} from 'lucide-react';

// نموذج البيانات للمظهر والألوان
interface AppearanceSettingsForm {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  favicon: string | null;
  logo: string | null;
  logoDark: string | null;
  customCss: string | null;
}

// معالج اختيار اللون
const ColorPicker = ({ value, onChange, label, description }: { 
  value: string;
  onChange: (value: string) => void;
  label: string;
  description: string;
}) => {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-4">
        <Input 
          type="color" 
          value={value} 
          onChange={(e) => onChange(e.target.value)} 
          className="w-12 h-12 p-1 cursor-pointer"
        />
        <Input 
          type="text" 
          value={value} 
          onChange={(e) => onChange(e.target.value)} 
          className="flex-1"
          placeholder="#000000"
          pattern="^#[0-9A-Fa-f]{6}$"
        />
      </div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );
};

const AppearanceSettings = () => {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const { siteSettings, isLoading, isError, refetch, updateSettings } = useSiteSettings();
  
  // إعداد نموذج التحكم
  const form = useForm<AppearanceSettingsForm>({
    defaultValues: {
      primaryColor: '#3b82f6',
      secondaryColor: '#f59e0b',
      accentColor: '#a855f7',
      favicon: null,
      logo: null,
      logoDark: null,
      customCss: null,
    },
  });
  
  // تحميل القيم الافتراضية من الإعدادات عند توفرها
  useState(() => {
    if (siteSettings) {
      form.reset({
        primaryColor: siteSettings.primaryColor || '#3b82f6',
        secondaryColor: siteSettings.secondaryColor || '#f59e0b',
        accentColor: siteSettings.accentColor || '#a855f7',
        favicon: siteSettings.favicon || null,
        logo: siteSettings.logo || null,
        logoDark: siteSettings.logoDark || null,
        customCss: siteSettings.customCss || null,
      });
    }
  });
  
  // معالجة تقديم النموذج
  const onSubmit = async (data: AppearanceSettingsForm) => {
    setIsSaving(true);
    try {
      // استخدام طريقة PATCH لتحديث إعدادات المظهر والألوان فقط
      const response = await fetch('/api/site-settings/appearance', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`فشل في تحديث إعدادات المظهر: ${response.status} ${errorText}`);
      }
      
      await response.json();
      toast({
        title: "تم الحفظ",
        description: "تم تحديث إعدادات المظهر والألوان بنجاح",
        variant: "success",
      });
      
      // تحديث البيانات المعروضة
      refetch();
      
    } catch (error) {
      console.error('Error saving appearance settings:', error);
      toast({
        title: "خطأ في الحفظ",
        description: `${error instanceof Error ? error.message : 'حدث خطأ أثناء حفظ الإعدادات'}`,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // معاينة تطبيق اللون الأساسي
  const CustomColorPreview = ({ color, name }: { color: string, name: string }) => {
    return (
      <div className="flex justify-center items-center gap-2 py-2">
        <div 
          className="w-6 h-6 rounded-full border" 
          style={{ backgroundColor: color }}
        ></div>
        <span className="text-sm">{name}</span>
      </div>
    );
  };

  // إجراءات الصفحة
  const pageActions = (
    <>
      <Button 
        variant="outline"
        onClick={() => refetch()}
        disabled={isLoading || isSaving}
      >
        <RefreshCw className="ml-2 h-4 w-4" />
        تحديث
      </Button>
      <Button 
        onClick={form.handleSubmit(onSubmit)}
        disabled={isLoading || isSaving}
      >
        {isSaving ? (
          <>
            <span className="spinner-border spinner-border-sm ml-2"></span>
            جارِ الحفظ...
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
    <AdminLayout 
      title="المظهر والألوان" 
      actions={pageActions}
      activeItem="settings"
    >
      <Helmet>
        <title>المظهر والألوان | لوحة التحكم</title>
      </Helmet>

      <div className="space-y-6">
        {isLoading ? (
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-1/3" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        ) : isError ? (
          <Card className="border-red-300 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-600">خطأ في تحميل الإعدادات</CardTitle>
              <CardDescription>
                حدث خطأ أثناء محاولة تحميل إعدادات الموقع. الرجاء تحديث الصفحة أو المحاولة لاحقًا.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button variant="outline" onClick={() => refetch()}>
                <RefreshCw className="ml-2 h-4 w-4" />
                إعادة المحاولة
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl flex items-center">
                    <Palette className="ml-2 h-5 w-5 text-primary" />
                    ألوان الموقع
                  </CardTitle>
                  <CardDescription>
                    اختر الألوان الأساسية التي تظهر في جميع أنحاء الموقع
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                      control={form.control}
                      name="primaryColor"
                      render={({ field }) => (
                        <FormItem>
                          <ColorPicker 
                            label="اللون الأساسي"
                            value={field.value}
                            onChange={field.onChange}
                            description="اللون الرئيسي للأزرار والروابط والعناصر المهمة"
                          />
                          <div className="mt-2 border rounded-md overflow-hidden">
                            <div style={{ backgroundColor: field.value }} className="h-8 w-full"></div>
                            <CustomColorPreview color={field.value} name="اللون الأساسي" />
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="secondaryColor"
                      render={({ field }) => (
                        <FormItem>
                          <ColorPicker 
                            label="اللون الثانوي"
                            value={field.value}
                            onChange={field.onChange}
                            description="اللون الثانوي للأزرار والروابط والعناصر الداعمة"
                          />
                          <div className="mt-2 border rounded-md overflow-hidden">
                            <div style={{ backgroundColor: field.value }} className="h-8 w-full"></div>
                            <CustomColorPreview color={field.value} name="اللون الثانوي" />
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="accentColor"
                      render={({ field }) => (
                        <FormItem>
                          <ColorPicker 
                            label="لون التمييز"
                            value={field.value}
                            onChange={field.onChange}
                            description="لون العناصر المميزة والتوكيدية في الموقع"
                          />
                          <div className="mt-2 border rounded-md overflow-hidden">
                            <div style={{ backgroundColor: field.value }} className="h-8 w-full"></div>
                            <CustomColorPreview color={field.value} name="لون التمييز" />
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl flex items-center">
                    <ImageIcon className="ml-2 h-5 w-5 text-primary" />
                    الشعارات والأيقونات
                  </CardTitle>
                  <CardDescription>
                    قم بتحميل شعار الموقع والأيقونة المميزة له
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="favicon"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="flex items-center">
                          <ImageIcon className="ml-2 h-4 w-4" /> 
                          أيقونة الموقع (Favicon)
                        </FormLabel>
                        <FormControl>
                          <div className="flex items-start gap-4">
                            <div className="border rounded-md p-2 bg-muted/30">
                              {field.value ? (
                                <img 
                                  src={field.value} 
                                  alt="Favicon" 
                                  className="w-8 h-8 object-contain"
                                />
                              ) : (
                                <div className="w-8 h-8 flex items-center justify-center bg-muted rounded-md">
                                  <ImageIcon className="h-4 w-4 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <Input
                                placeholder="رابط أيقونة الموقع (16×16 or 32×32 px)"
                                value={field.value || ''}
                                onChange={(e) => field.onChange(e.target.value)}
                              />
                              <FormDescription className="mt-1">
                                يفضل أن تكون بحجم 16×16 أو 32×32 بكسل بصيغة PNG أو ICO
                              </FormDescription>
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="logo"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="flex items-center">
                          <ImageIcon className="ml-2 h-4 w-4" /> 
                          شعار الموقع (الوضع العادي)
                        </FormLabel>
                        <FormControl>
                          <div className="flex items-start gap-4">
                            <div className="border rounded-md p-2 bg-muted/30">
                              {field.value ? (
                                <img 
                                  src={field.value} 
                                  alt="Logo" 
                                  className="w-24 h-16 object-contain"
                                />
                              ) : (
                                <div className="w-24 h-16 flex items-center justify-center bg-muted rounded-md">
                                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <Input
                                placeholder="رابط شعار الموقع"
                                value={field.value || ''}
                                onChange={(e) => field.onChange(e.target.value)}
                              />
                              <FormDescription className="mt-1">
                                الشعار الرئيسي للموقع، يفضل أن يكون بخلفية شفافة بصيغة PNG أو SVG
                              </FormDescription>
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="logoDark"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="flex items-center">
                          <SunMoon className="ml-2 h-4 w-4" /> 
                          شعار الموقع (الوضع الداكن)
                        </FormLabel>
                        <FormControl>
                          <div className="flex items-start gap-4">
                            <div className="border rounded-md p-2 bg-gray-800">
                              {field.value ? (
                                <img 
                                  src={field.value} 
                                  alt="Dark Logo" 
                                  className="w-24 h-16 object-contain"
                                />
                              ) : (
                                <div className="w-24 h-16 flex items-center justify-center bg-gray-700 rounded-md">
                                  <ImageIcon className="h-8 w-8 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <Input
                                placeholder="رابط شعار الموقع للوضع الداكن"
                                value={field.value || ''}
                                onChange={(e) => field.onChange(e.target.value)}
                              />
                              <FormDescription className="mt-1">
                                نسخة الشعار المستخدمة في الوضع الداكن (Dark Mode)
                              </FormDescription>
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl flex items-center">
                    <Code className="ml-2 h-5 w-5 text-primary" />
                    CSS مخصص
                  </CardTitle>
                  <CardDescription>
                    أضف أكواد CSS مخصصة لتخصيص مظهر الموقع بشكل أكبر
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="customCss"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea 
                            placeholder="/* أضف أكواد CSS المخصصة هنا... */"
                            rows={8}
                            value={field.value || ''}
                            onChange={(e) => field.onChange(e.target.value)}
                            className="font-mono text-sm"
                          />
                        </FormControl>
                        <FormDescription>
                          سيتم تطبيق هذه الأكواد على جميع صفحات الموقع. كن حذرًا عند استخدام هذه الميزة.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </form>
          </Form>
        )}
      </div>
    </AdminLayout>
  );
};

export default AppearanceSettings;