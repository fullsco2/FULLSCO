import { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLocation } from 'wouter';
import { ArrowLeft, Check, Loader2, Menu } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import Sidebar from '@/components/admin/sidebar';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import MediaSelector from '@/components/ui/media-selector';
import RichEditor from '@/components/ui/rich-editor';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// زودج سكيما للتحقق من صحة البيانات
const successStorySchema = z.object({
  name: z.string().min(1, 'اسم الشخص مطلوب'),
  title: z.string().min(1, 'العنوان مطلوب'),
  content: z.string().min(1, 'المحتوى مطلوب'),
  scholarshipId: z.string().optional().nullable(),
  isPublished: z.boolean().default(true),
  featuredImage: z.string().optional(),
});

type FormValues = z.infer<typeof successStorySchema>;

type Scholarship = {
  id: number;
  title: string;
};

const CreateSuccessStory = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isLoading: authLoading, isAuthenticated } = useAuth();

  // التحقق من تسجيل الدخول
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/admin/login');
    }
  }, [authLoading, isAuthenticated, navigate]);

  // جلب المنح الدراسية للقائمة المنسدلة
  const { data: scholarshipsResponse } = useQuery<{ success: boolean; data: Scholarship[] }>({
    queryKey: ['/api/scholarships'],
    enabled: isAuthenticated,
  });
  
  // استخراج المنح الدراسية من البيانات المستجابة
  const scholarships = scholarshipsResponse?.data || [];

  // إعداد نموذج react-hook-form
  const form = useForm<FormValues>({
    resolver: zodResolver(successStorySchema),
    defaultValues: {
      name: '',
      title: '',
      content: '',
      scholarshipId: null,
      isPublished: true,
      featuredImage: '',
    },
  });

  // إنشاء قصة نجاح جديدة
  const createMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      // تحويل featuredImage إلى imageUrl كما يتوقع الخادم
      const payload = {
        ...data,
        imageUrl: data.featuredImage, // تحويل featuredImage إلى imageUrl
        scholarshipId: data.scholarshipId && data.scholarshipId !== "none" ? parseInt(data.scholarshipId) : null,
      };
      
      console.log("بيانات قصة النجاح الجديدة للإرسال:", payload);
      
      const response = await fetch('/api/success-stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'فشل في إضافة قصة النجاح');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // تحديث ذاكرة التخزين المؤقت
      queryClient.invalidateQueries({ queryKey: ['/api/success-stories'] });
      
      toast({ 
        title: 'تم الإضافة بنجاح', 
        description: 'تمت إضافة قصة النجاح الجديدة بنجاح' 
      });
      
      // العودة إلى صفحة قصص النجاح
      navigate('/admin/success-stories');
    },
    onError: (error) => {
      toast({ 
        title: 'خطأ!', 
        description: `فشل في إضافة قصة النجاح: ${error.message}`, 
        variant: 'destructive' 
      });
    }
  });

  // معالجة إرسال النموذج
  const onSubmit = (data: FormValues) => {
    createMutation.mutate(data);
  };

  // إنتاج slug من العنوان (إذا احتجنا لاحقًا)
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-');
  };

  // في حالة تحميل بيانات المصادقة أو عدم تسجيل الدخول
  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        جاري التحميل...
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen relative overflow-x-hidden">
      {/* السايدبار للجوال */}
      <Sidebar 
        isMobileOpen={sidebarOpen} 
        onClose={() => {
          console.log('Create Success Story: closing sidebar');
          setSidebarOpen(false);
        }} 
      />
      
      {/* المحتوى الرئيسي */}
      <div className={cn(
        "transition-all duration-300",
        isMobile ? "w-full" : "mr-64"
      )}>
        <main className="p-4 md:p-6">
          {/* زر فتح السايدبار في الجوال والهيدر */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex items-center">
              {isMobile && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="ml-2" 
                  onClick={() => setSidebarOpen(true)}
                  aria-label="فتح القائمة"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              )}
              <h1 className="text-xl md:text-2xl font-bold">إضافة قصة نجاح جديدة</h1>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate('/admin/success-stories')}>
                <ArrowLeft className="ml-2 h-4 w-4" />
                العودة
              </Button>
            </div>
          </div>

          {/* نموذج إضافة قصة نجاح */}
          <div className="bg-white rounded-md shadow p-6 max-w-4xl">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* اسم الشخص */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>اسم الشخص</FormLabel>
                      <FormControl>
                        <Input placeholder="أدخل اسم صاحب قصة النجاح" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* عنوان القصة */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>عنوان القصة</FormLabel>
                      <FormControl>
                        <Input placeholder="أدخل عنوان قصة النجاح" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* المنحة المرتبطة */}
                <FormField
                  control={form.control}
                  name="scholarshipId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>المنحة المرتبطة (اختياري)</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر المنحة المرتبطة" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">بدون منحة</SelectItem>
                          {scholarships.map((scholarship) => (
                            <SelectItem key={scholarship.id} value={scholarship.id.toString()}>
                              {scholarship.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        حدد المنحة الدراسية المرتبطة بقصة النجاح إن وجدت
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* الصورة */}
                <FormField
                  control={form.control}
                  name="featuredImage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>صورة صاحب القصة</FormLabel>
                      <MediaSelector
                        value={field.value}
                        onChange={field.onChange}
                      />
                      <FormDescription>
                        اختر صورة شخصية لصاحب قصة النجاح
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* محتوى القصة */}
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>محتوى قصة النجاح</FormLabel>
                      <FormControl>
                        <RichEditor
                          initialValue={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormDescription>
                        اكتب محتوى قصة النجاح بالتفصيل
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* حالة النشر */}
                <FormField
                  control={form.control}
                  name="isPublished"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          نشر القصة
                        </FormLabel>
                        <FormDescription>
                          حدد ما إذا كنت تريد نشر قصة النجاح الآن أو حفظها كمسودة
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* زر الحفظ */}
                <Button 
                  type="submit" 
                  className="w-full sm:w-auto"
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                      جاري الحفظ...
                    </>
                  ) : (
                    <>
                      <Check className="ml-2 h-4 w-4" />
                      حفظ قصة النجاح
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CreateSuccessStory;
