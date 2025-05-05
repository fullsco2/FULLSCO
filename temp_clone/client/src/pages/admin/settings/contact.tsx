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
  Mail,
  Phone,
  MapPin,
  MessageSquare,
  FileText
} from 'lucide-react';

// نموذج البيانات لمعلومات الاتصال
interface ContactSettingsForm {
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  footerText: string;
}

const ContactSettings = () => {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const { siteSettings, isLoading, isError, refetch, updateSettings } = useSiteSettings();
  
  // إعداد نموذج التحكم
  const form = useForm<ContactSettingsForm>({
    defaultValues: {
      email: '',
      phone: '',
      whatsapp: '',
      address: '',
      footerText: '',
    },
  });
  
  // تحميل القيم الافتراضية من الإعدادات عند توفرها
  useState(() => {
    if (siteSettings) {
      form.reset({
        email: siteSettings.email || '',
        phone: siteSettings.phone || '',
        whatsapp: siteSettings.whatsapp || '',
        address: siteSettings.address || '',
        footerText: siteSettings.footerText || '',
      });
    }
  });
  
  // معالجة تقديم النموذج
  const onSubmit = async (data: ContactSettingsForm) => {
    setIsSaving(true);
    try {
      // استخدام طريقة PATCH لتحديث إعدادات معلومات الاتصال فقط
      const response = await fetch('/api/site-settings/contact', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`فشل في تحديث معلومات الاتصال: ${response.status} ${errorText}`);
      }
      
      await response.json();
      toast({
        title: "تم الحفظ",
        description: "تم تحديث معلومات الاتصال بنجاح",
        variant: "success",
      });
      
      // تحديث البيانات المعروضة
      refetch();
      
    } catch (error) {
      console.error('Error saving contact settings:', error);
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
      title="معلومات الاتصال" 
      actions={pageActions}
      activeItem="settings"
    >
      <Helmet>
        <title>معلومات الاتصال | لوحة التحكم</title>
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
            </CardContent>
          </Card>
        ) : isError ? (
          <Card className="border-red-300 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-600">خطأ في تحميل الإعدادات</CardTitle>
              <CardDescription>
                حدث خطأ أثناء محاولة تحميل معلومات الاتصال. الرجاء تحديث الصفحة أو المحاولة لاحقًا.
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
                    <MessageSquare className="ml-2 h-5 w-5 text-primary" />
                    معلومات الاتصال الأساسية
                  </CardTitle>
                  <CardDescription>
                    أدخل معلومات الاتصال الرئيسية التي ستظهر للزوار ووسائل التواصل معك
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center">
                          <Mail className="ml-2 h-4 w-4" />
                          البريد الإلكتروني
                        </FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="مثال: info@fullsco.com" 
                            type="email"
                            dir="ltr"
                            className="text-left"
                          />
                        </FormControl>
                        <FormDescription>
                          البريد الإلكتروني الرسمي للتواصل مع إدارة الموقع
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
                        <FormLabel className="flex items-center">
                          <Phone className="ml-2 h-4 w-4" />
                          رقم الهاتف
                        </FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="مثال: +966 12 345 6789" 
                            dir="ltr"
                            className="text-left"
                          />
                        </FormControl>
                        <FormDescription>
                          رقم الهاتف الرسمي لاستفسارات الزوار والتواصل
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
                        <FormLabel className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21"/>
                            <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1z"/>
                            <path d="M14 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1z"/>
                            <path d="M7.5 13.5a.5.5 0 0 0 .5.5h8a.5.5 0 0 0 .5-.5V13a.5.5 0 0 0-.5-.5h-8a.5.5 0 0 0-.5.5v.5z"/>
                          </svg>
                          رقم واتساب
                        </FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="مثال: 966123456789" 
                            dir="ltr"
                            className="text-left"
                          />
                        </FormControl>
                        <FormDescription>
                          رقم واتساب للدعم والاستفسارات (بدون علامة + أو مسافات)
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
                        <FormLabel className="flex items-center">
                          <MapPin className="ml-2 h-4 w-4" />
                          العنوان
                        </FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="مثال: الرياض، المملكة العربية السعودية"
                            rows={2} 
                          />
                        </FormControl>
                        <FormDescription>
                          العنوان الفعلي أو المدينة ومكان التواجد
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl flex items-center">
                    <FileText className="ml-2 h-5 w-5 text-primary" />
                    نص حقوق الملكية (Footer)
                  </CardTitle>
                  <CardDescription>
                    النص الذي سيظهر في أسفل كل صفحات الموقع
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="footerText"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="مثال: © 2025 فلسكو. جميع الحقوق محفوظة."
                            rows={2} 
                          />
                        </FormControl>
                        <FormDescription>
                          يمكنك استخدام كود HTML بسيط مثل الروابط والنصوص المنسقة
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

export default ContactSettings;