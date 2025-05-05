import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { useSiteSettings } from '@/hooks/use-site-settings';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Skeleton } from '@/components/ui/skeleton';
import AdminLayout from '@/components/admin/admin-layout';
import { 
  RefreshCw, 
  Save, 
  Globe,
  ExternalLink
} from 'lucide-react';
// Usamos íconos de Lucide en lugar de react-icons/si para evitar problemas
import { 
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Linkedin
} from "lucide-react";

// نموذج البيانات للشبكات الاجتماعية
interface SocialSettingsForm {
  facebook: string;
  twitter: string;
  instagram: string;
  youtube: string;
  linkedin: string;
}

// مكون لحقل الإدخال الخاص بالشبكات الاجتماعية
const SocialInputField = ({ 
  icon, 
  label, 
  placeholder, 
  value, 
  onChange, 
  color 
}: { 
  icon: React.ReactNode, 
  label: string, 
  placeholder: string, 
  value: string, 
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, 
  color: string 
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center">
        <div style={{ color }} className="ml-2 flex items-center">
          {icon}
        </div>
        <label className="text-sm font-medium">{label}</label>
      </div>
      <div className="flex items-center">
        <Input
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="flex-1"
          dir="ltr"
          style={{ textAlign: "left" }}
        />
        {value && (
          <a
            href={value.startsWith('http') ? value : `https://${value}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 hover:text-primary transition-colors"
            title="فتح الرابط في نافذة جديدة"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        )}
      </div>
    </div>
  );
};

const SocialSettings = () => {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const { siteSettings, isLoading, isError, refetch, updateSettings } = useSiteSettings();
  
  // إعداد نموذج التحكم
  const form = useForm<SocialSettingsForm>({
    defaultValues: {
      facebook: '',
      twitter: '',
      instagram: '',
      youtube: '',
      linkedin: '',
    },
  });
  
  // تحميل القيم الافتراضية من الإعدادات عند توفرها
  useEffect(() => {
    if (siteSettings) {
      form.reset({
        facebook: siteSettings.facebook || '',
        twitter: siteSettings.twitter || '',
        instagram: siteSettings.instagram || '',
        youtube: siteSettings.youtube || '',
        linkedin: siteSettings.linkedin || '',
      });
    }
  }, [siteSettings, form]);
  
  // معالجة تقديم النموذج
  const onSubmit = async (data: SocialSettingsForm) => {
    setIsSaving(true);
    try {
      // استخدام طريقة PATCH لتحديث إعدادات الشبكات الاجتماعية فقط
      const response = await fetch('/api/site-settings/social', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`فشل في تحديث إعدادات الشبكات الاجتماعية: ${response.status} ${errorText}`);
      }
      
      await response.json();
      toast({
        title: "تم الحفظ",
        description: "تم تحديث إعدادات الشبكات الاجتماعية بنجاح",
        variant: "success",
      });
      
      // تحديث البيانات المعروضة
      refetch();
      
    } catch (error) {
      console.error('Error saving social settings:', error);
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
      title="الشبكات الاجتماعية" 
      actions={pageActions}
      activeItem="settings"
    >
      <Helmet>
        <title>الشبكات الاجتماعية | لوحة التحكم</title>
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
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        ) : isError ? (
          <Card className="border-red-300 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-600">خطأ في تحميل الإعدادات</CardTitle>
              <CardDescription>
                حدث خطأ أثناء محاولة تحميل إعدادات الشبكات الاجتماعية. الرجاء تحديث الصفحة أو المحاولة لاحقًا.
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
                    <Globe className="ml-2 h-5 w-5 text-primary" />
                    حسابات التواصل الاجتماعي
                  </CardTitle>
                  <CardDescription>
                    أدخل روابط حسابات التواصل الاجتماعي الخاصة بالموقع ليتم عرضها للزوار
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* حقل فيسبوك */}
                  <FormField
                    control={form.control}
                    name="facebook"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <SocialInputField
                            icon={<Facebook size={18} />}
                            label="فيسبوك"
                            placeholder="https://facebook.com/fullsco"
                            value={field.value || ''}
                            onChange={field.onChange}
                            color="#1877F2"
                          />
                        </FormControl>
                        <FormDescription>
                          رابط صفحة أو مجموعة فيسبوك الرسمية
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* حقل تويتر */}
                  <FormField
                    control={form.control}
                    name="twitter"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <SocialInputField
                            icon={<Twitter size={18} />}
                            label="تويتر (إكس)"
                            placeholder="https://twitter.com/fullsco"
                            value={field.value || ''}
                            onChange={field.onChange}
                            color="#1DA1F2"
                          />
                        </FormControl>
                        <FormDescription>
                          رابط حساب تويتر (إكس) الرسمي
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* حقل انستغرام */}
                  <FormField
                    control={form.control}
                    name="instagram"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <SocialInputField
                            icon={<Instagram size={18} />}
                            label="انستغرام"
                            placeholder="https://instagram.com/fullsco"
                            value={field.value || ''}
                            onChange={field.onChange}
                            color="#E1306C"
                          />
                        </FormControl>
                        <FormDescription>
                          رابط صفحة انستغرام الرسمية
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* حقل يوتيوب */}
                  <FormField
                    control={form.control}
                    name="youtube"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <SocialInputField
                            icon={<Youtube size={18} />}
                            label="يوتيوب"
                            placeholder="https://youtube.com/c/fullsco"
                            value={field.value || ''}
                            onChange={field.onChange}
                            color="#FF0000"
                          />
                        </FormControl>
                        <FormDescription>
                          رابط قناة يوتيوب الرسمية
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* حقل لينكد إن */}
                  <FormField
                    control={form.control}
                    name="linkedin"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <SocialInputField
                            icon={<Linkedin size={18} />}
                            label="لينكد إن"
                            placeholder="https://linkedin.com/company/fullsco"
                            value={field.value || ''}
                            onChange={field.onChange}
                            color="#0A66C2"
                          />
                        </FormControl>
                        <FormDescription>
                          رابط صفحة لينكد إن للشركة أو المؤسسة
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card className="bg-muted/30">
                <CardHeader>
                  <CardTitle className="text-lg">نصائح لإدارة حسابات التواصل الاجتماعي</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>تأكد من أن جميع الروابط التي تدخلها صحيحة وتعمل بشكل سليم</li>
                    <li>يمكنك ترك أي حقل فارغًا إذا لم يكن لديك حساب على تلك المنصة</li>
                    <li>احرص على تحديث هذه الروابط كلما تغيرت عناوين حساباتك الرسمية</li>
                    <li>يفضل استخدام حسابات رسمية ونشطة تحتوي على محتوى ذو صلة</li>
                    <li>يمكنك الضغط على أيقونة الرابط الخارجي لاختبار الرابط مباشرة</li>
                  </ul>
                </CardContent>
              </Card>
            </form>
          </Form>
        )}
      </div>
    </AdminLayout>
  );
};

export default SocialSettings;