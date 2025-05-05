import { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLocation, useParams } from 'wouter';
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

// زودج سكيما للتحقق من صحة البيانات
const pageSchema = z.object({
  title: z.string().min(1, 'العنوان مطلوب'),
  slug: z.string().min(1, 'المسار المختصر مطلوب').regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'المسار المختصر يجب أن يحتوي على أحرف صغيرة وأرقام وشرطات فقط'),
  content: z.string().min(1, 'المحتوى مطلوب'),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  isPublished: z.boolean().default(true),
  featuredImage: z.string().optional(),
});

type PageFormValues = z.infer<typeof pageSchema>;

// واجهة للصفحة
interface Page {
  id: number;
  title: string;
  slug: string;
  content: string;
  metaTitle?: string;
  metaDescription?: string;
  isPublished: boolean;
  showInFooter?: boolean;
  showInHeader?: boolean;
  createdAt: string;
  updatedAt: string;
  imageUrl?: string;
}

export default function EditPage() {
  const [, navigate] = useLocation();
  const params = useParams();
  const pageId = parseInt(params.id, 10);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  // التحقق من تسجيل الدخول
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/admin/login');
    }
  }, [authLoading, isAuthenticated, navigate]);

  // استلام بيانات الصفحة
  const { data: page, isLoading: isLoadingPage, isError } = useQuery<Page>({
    queryKey: [`/api/pages/${pageId}`],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/pages/${pageId}`, {
          credentials: 'include'
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'فشل في استلام بيانات الصفحة');
        }
        
        return await response.json();
      } catch (error) {
        console.error('Error fetching page:', error);
        throw error;
      }
    },
    enabled: isAuthenticated && !isNaN(pageId),
  });

  // نموذج تعديل الصفحة
  const form = useForm<PageFormValues>({
    resolver: zodResolver(pageSchema),
    defaultValues: {
      title: '',
      slug: '',
      content: '',
      metaTitle: '',
      metaDescription: '',
      isPublished: true,
      featuredImage: '',
    },
  });

  // تحديث النموذج عند استلام بيانات الصفحة
  useEffect(() => {
    if (page) {
      form.reset({
        title: page.title,
        slug: page.slug,
        content: page.content,
        metaTitle: page.metaTitle || '',
        metaDescription: page.metaDescription || '',
        isPublished: page.isPublished,
        featuredImage: page.imageUrl || '',
      });
    }
  }, [page, form]);

  // تعديل الصفحة
  const updateMutation = useMutation({
    mutationFn: async (data: PageFormValues) => {
      // تحويل featuredImage إلى imageUrl كما يتوقع الخادم
      const payload = {
        ...data,
        imageUrl: data.featuredImage, // تحويل featuredImage إلى imageUrl
      };
      
      console.log("بيانات تحديث الصفحة للإرسال:", payload);
      
      const response = await fetch(`/api/pages/${pageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'فشل في تحديث الصفحة');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'تم التحديث بنجاح',
        description: 'تم تحديث الصفحة بنجاح',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/pages'] });
      queryClient.invalidateQueries({ queryKey: [`/api/pages/${pageId}`] });
      navigate('/admin/pages-new');
    },
    onError: (error) => {
      toast({
        title: 'خطأ!',
        description: `فشل في تحديث الصفحة: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (values: PageFormValues) => {
    updateMutation.mutate(values);
  };

  // إنتاج slug من العنوان
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-');
  };

  // معالجة تلقائية لإنشاء slug عند كتابة العنوان
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    form.setValue('title', title);
    
    // إذا لم يتم تعديل الـ slug يدويًا أو إذا كان الـ slug مطابقًا للعنوان السابق
    if (!form.getValues('slug') || form.getValues('slug') === generateSlug(form.getValues('title').replace(/ /g, '-'))) {
      const slug = generateSlug(title);
      form.setValue('slug', slug);
    }
    
    // إذا لم يتم تعديل عنوان ميتا، قم بتعيينه إلى العنوان + اسم الموقع
    if (!form.getValues('metaTitle')) {
      form.setValue('metaTitle', title ? `${title} | FULLSCO` : '');
    }
  };

  // في حالة تحميل بيانات المصادقة أو عدم تسجيل الدخول
  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        جاري التحميل...
      </div>
    );
  }

  // في حالة تحميل بيانات الصفحة
  if (isLoadingPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="mr-2">جاري تحميل بيانات الصفحة...</span>
      </div>
    );
  }

  // في حالة حدوث خطأ في استلام بيانات الصفحة
  if (isError || !page) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <div className="text-red-500 mb-4">فشل في استلام بيانات الصفحة</div>
        <Button variant="outline" onClick={() => navigate('/admin/pages-new')}>
          العودة إلى قائمة الصفحات
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen relative overflow-x-hidden">
      {/* السايدبار للجوال */}
      <Sidebar 
        isMobileOpen={sidebarOpen} 
        onClose={() => {
          console.log('Edit Page: closing sidebar');
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
              <div>
                <Button
                  variant="outline"
                  className="mb-4"
                  onClick={() => navigate("/admin/pages-new")}
                >
                  <ArrowLeft className="ml-2 h-4 w-4" /> العودة إلى قائمة الصفحات
                </Button>
                <h1 className="text-2xl font-bold">تعديل صفحة: {page.title}</h1>
              </div>
            </div>
          </div>

          {/* نموذج تعديل الصفحة */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>عنوان الصفحة</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              onChange={handleTitleChange}
                              placeholder="مثال: من نحن" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="slug"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>المسار المختصر (Slug)</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="مثال: about-us" dir="ltr" />
                          </FormControl>
                          <FormDescription>
                            سيستخدم هذا في عنوان URL. يجب أن يحتوي على أحرف صغيرة وأرقام وشرطات فقط.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="metaTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>عنوان ميتا (SEO)</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="مثال: من نحن | FULLSCO" />
                          </FormControl>
                          <FormDescription>
                            عنوان الصفحة لمحركات البحث
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="metaDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>وصف ميتا (SEO)</FormLabel>
                          <FormControl>
                            <Textarea {...field} placeholder="وصف قصير للصفحة لمحركات البحث" />
                          </FormControl>
                          <FormDescription>
                            وصف الصفحة الذي سيظهر في نتائج البحث
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="isPublished"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">نشر الصفحة</FormLabel>
                            <FormDescription>
                              عند التفعيل، ستكون الصفحة متاحة للزوار
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
                      name="featuredImage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>الصورة المميزة</FormLabel>
                          <FormControl>
                            <MediaSelector
                              value={field.value}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <FormDescription>
                            اختر صورة تمثل الصفحة (اختياري)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>محتوى الصفحة</FormLabel>
                          <FormControl>
                            <RichEditor
                              initialValue={field.value}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="button" variant="outline" className="ml-2" onClick={() => navigate('/admin/pages-new')}>
                    إلغاء
                  </Button>
                  <Button type="submit" disabled={updateMutation.isPending}>
                    {updateMutation.isPending ? (
                      <>
                        <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                        جاري الحفظ...
                      </>
                    ) : (
                      <>
                        <Check className="ml-2 h-4 w-4" />
                        حفظ التغييرات
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </main>
      </div>
    </div>
  );
}