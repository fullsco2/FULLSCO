import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { useSiteSettings } from '@/hooks/use-site-settings';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AdminLayout from '@/components/admin/admin-layout';
import { 
  RefreshCw, 
  Save, 
  Settings,
  Languages,
  Globe,
  Moon,
  LayoutGrid
} from 'lucide-react';

// نموذج البيانات للإعدادات العامة
interface GeneralSettingsForm {
  siteName: string;
  siteTagline: string;
  siteDescription: string;
  rtlDirection: boolean;
  enableDarkMode: boolean;
  defaultLanguage: string;
}

const GeneralSettings = () => {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const { siteSettings, isLoading, isError, refetch, updateSettings } = useSiteSettings();
  
  // إعداد نموذج التحكم
  const form = useForm<GeneralSettingsForm>({
    defaultValues: {
      siteName: '',
      siteTagline: '',
      siteDescription: '',
      rtlDirection: true,
      enableDarkMode: true,
      defaultLanguage: 'ar',
    },
  });
  
  // تحميل القيم الافتراضية من الإعدادات عند توفرها
  useState(() => {
    if (siteSettings) {
      form.reset({
        siteName: siteSettings.siteName || '',
        siteTagline: siteSettings.siteTagline || '',
        siteDescription: siteSettings.siteDescription || '',
        rtlDirection: siteSettings.rtlDirection !== false,
        enableDarkMode: siteSettings.enableDarkMode !== false,
        defaultLanguage: siteSettings.defaultLanguage || 'ar',
      });
    }
  });
  
  // معالجة تقديم النموذج
  const onSubmit = async (data: GeneralSettingsForm) => {
    setIsSaving(true);
    try {
      // استخدام طريقة PATCH لتحديث الإعدادات العامة فقط
      const response = await fetch('/api/site-settings/general', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`فشل في تحديث الإعدادات: ${response.status} ${errorText}`);
      }
      
      await response.json();
      toast({
        title: "تم الحفظ",
        description: "تم تحديث الإعدادات العامة بنجاح",
        variant: "success",
      });
      
      // تحديث البيانات المعروضة
      refetch();
      
    } catch (error) {
      console.error('Error saving general settings:', error);
      toast({
        title: "خطأ في الحفظ",
        description: `${error instanceof Error ? error.message : 'حدث خطأ أثناء حفظ الإعدادات'}`,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
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
      title="الإعدادات العامة" 
      actions={pageActions}
      activeItem="settings"
    >
      <Helmet>
        <title>الإعدادات العامة | لوحة التحكم</title>
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
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-10 w-1/2" />
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
                  <CardTitle className="text-xl">معلومات الموقع الأساسية</CardTitle>
                  <CardDescription>
                    أدخل المعلومات الأساسية لموقعك التي ستظهر للزوار والمستخدمين
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
                          <Input {...field} placeholder="مثال: فلسكو" />
                        </FormControl>
                        <FormDescription>
                          اسم الموقع كما سيظهر في العنوان وفي جميع أنحاء الموقع
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
                          <Input {...field} placeholder="مثال: منصة المنح الدراسية الرائدة" />
                        </FormControl>
                        <FormDescription>
                          وصف موجز للموقع يظهر أسفل اسم الموقع
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
                            placeholder="أدخل وصفاً مختصراً للموقع..." 
                            rows={3}
                          />
                        </FormControl>
                        <FormDescription>
                          وصف الموقع المستخدم في محركات البحث ووسائل التواصل الاجتماعي
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">إعدادات العرض واللغة</CardTitle>
                  <CardDescription>
                    تحكم في كيفية عرض الموقع واللغة الافتراضية
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="rtlDirection"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base flex items-center">
                            <Globe className="ml-2 h-5 w-5" />
                            اتجاه الموقع من اليمين إلى اليسار (RTL)
                          </FormLabel>
                          <FormDescription>
                            مناسب للغة العربية والفارسية والعبرية وغيرها
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
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base flex items-center">
                            <Moon className="ml-2 h-5 w-5" />
                            تفعيل الوضع الداكن
                          </FormLabel>
                          <FormDescription>
                            السماح للمستخدمين بتفعيل الوضع الداكن (الألوان الداكنة)
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
                    name="defaultLanguage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center">
                          <Languages className="ml-2 h-5 w-5" />
                          اللغة الافتراضية
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="اختر اللغة الافتراضية" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="ar">العربية</SelectItem>
                            <SelectItem value="en">الإنجليزية</SelectItem>
                            <SelectItem value="fr">الفرنسية</SelectItem>
                            <SelectItem value="tr">التركية</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          اللغة الافتراضية للموقع عند زيارته لأول مرة
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

export default GeneralSettings;