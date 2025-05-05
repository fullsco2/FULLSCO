import { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLocation, useParams } from 'wouter';
import { ArrowLeft, Check, Loader2, Menu, Trash } from 'lucide-react';

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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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

interface SuccessStory {
  id: number;
  name: string;
  title: string;
  content: string;
  scholarshipId?: number | null;
  scholarshipName?: string;
  imageUrl?: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

const EditSuccessStory = () => {
  const params = useParams<{ id: string }>();
  const storyId = parseInt(params.id);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // التحقق من تسجيل الدخول
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/admin/login');
    }
  }, [authLoading, isAuthenticated, navigate]);

  // جلب بيانات قصة النجاح
  const { data: successStoryResponse, isLoading: isStoryLoading, isError: isStoryError } = useQuery<{ success: boolean, data: SuccessStory } | SuccessStory>({
    queryKey: [`/api/success-stories/${storyId}`],
    queryFn: async () => {
      const response = await fetch(`/api/success-stories/${storyId}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('فشل في جلب بيانات قصة النجاح');
      }
      
      return await response.json();
    },
    enabled: isAuthenticated && !isNaN(storyId),
  });
  
  // استخراج بيانات قصة النجاح من الاستجابة
  const successStory = (successStoryResponse && 'data' in successStoryResponse) 
    ? successStoryResponse.data 
    : successStoryResponse;

  // جلب المنح الدراسية للقائمة المنسدلة
  const { data: scholarshipsResponse } = useQuery<{ success: boolean, data: Scholarship[] } | Scholarship[]>({
    queryKey: ['/api/scholarships'],
    enabled: isAuthenticated,
  });
  
  // استخراج المنح الدراسية من الاستجابة
  const scholarships = Array.isArray(scholarshipsResponse)
    ? scholarshipsResponse
    : scholarshipsResponse?.data || [];

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

  // تحديث النموذج عند جلب بيانات قصة النجاح
  useEffect(() => {
    if (successStory) {
      form.reset({
        name: successStory.name,
        title: successStory.title,
        content: successStory.content,
        scholarshipId: successStory.scholarshipId?.toString() || null,
        isPublished: successStory.isPublished,
        featuredImage: successStory.imageUrl || '',
      });
    }
  }, [successStory, form]);

  // تحديث قصة النجاح
  const updateMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      // تحويل featuredImage إلى imageUrl كما يتوقع الخادم
      const payload = {
        ...data,
        imageUrl: data.featuredImage, // تحويل featuredImage إلى imageUrl
        scholarshipId: data.scholarshipId && data.scholarshipId !== "none" ? parseInt(data.scholarshipId) : null,
      };
      
      console.log("بيانات تحديث قصة النجاح للإرسال:", payload);
      
      const response = await fetch(`/api/success-stories/${storyId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'فشل في تحديث قصة النجاح');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // تحديث ذاكرة التخزين المؤقت
      queryClient.invalidateQueries({ queryKey: ['/api/success-stories'] });
      queryClient.invalidateQueries({ queryKey: [`/api/success-stories/${storyId}`] });
      
      toast({ 
        title: 'تم التحديث بنجاح', 
        description: 'تم تحديث قصة النجاح بنجاح' 
      });
    },
    onError: (error) => {
      toast({ 
        title: 'خطأ!', 
        description: `فشل في تحديث قصة النجاح: ${error.message}`, 
        variant: 'destructive' 
      });
    }
  });

  // حذف قصة النجاح
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/success-stories/${storyId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'فشل في حذف قصة النجاح');
      }
      
      return { success: true };
    },
    onSuccess: () => {
      // تحديث ذاكرة التخزين المؤقت
      queryClient.invalidateQueries({ queryKey: ['/api/success-stories'] });
      
      toast({ 
        title: 'تم الحذف بنجاح', 
        description: 'تم حذف قصة النجاح بنجاح' 
      });
      
      // العودة إلى صفحة قصص النجاح
      navigate('/admin/success-stories');
    },
    onError: (error) => {
      toast({ 
        title: 'خطأ!', 
        description: `فشل في حذف قصة النجاح: ${error.message}`, 
        variant: 'destructive' 
      });
    }
  });

  // معالجة إرسال النموذج
  const onSubmit = (data: FormValues) => {
    updateMutation.mutate(data);
  };

  // معالجة الحذف
  const handleDelete = () => {
    setIsDeleteDialogOpen(false);
    deleteMutation.mutate();
  };

  // في حالة تحميل بيانات المصادقة أو عدم تسجيل الدخول
  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        جاري التحميل...
      </div>
    );
  }

  // في حالة تحميل بيانات قصة النجاح
  if (isStoryLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">جاري تحميل بيانات قصة النجاح...</p>
        </div>
      </div>
    );
  }

  // في حالة حدوث خطأ أثناء جلب بيانات قصة النجاح
  if (isStoryError || !successStory) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 text-center max-w-md">
          <p className="text-red-500 font-medium">حدث خطأ أثناء جلب بيانات قصة النجاح</p>
          <p className="text-muted-foreground">قد تكون قصة النجاح غير موجودة أو غير متاحة حاليًا</p>
          <Button onClick={() => navigate('/admin/success-stories')}>
            <ArrowLeft className="ml-2 h-4 w-4" />
            العودة إلى قصص النجاح
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen relative overflow-x-hidden">
      {/* السايدبار للجوال */}
      <Sidebar 
        isMobileOpen={sidebarOpen} 
        onClose={() => {
          console.log('Edit Success Story: closing sidebar');
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
              <h1 className="text-xl md:text-2xl font-bold">تعديل قصة نجاح</h1>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate('/admin/success-stories')}>
                <ArrowLeft className="ml-2 h-4 w-4" />
                العودة
              </Button>
              <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash className="ml-2 h-4 w-4" />
                    حذف
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
                    <AlertDialogDescription>
                      سيتم حذف قصة النجاح نهائيًا. هذا الإجراء لا يمكن التراجع عنه.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="gap-2">
                    <AlertDialogCancel>إلغاء</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleDelete}
                      className="bg-red-500 text-white hover:bg-red-600"
                    >
                      {deleteMutation.isPending ? (
                        <>
                          <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                          جاري الحذف...
                        </>
                      ) : (
                        <>
                          <Trash className="ml-2 h-4 w-4" />
                          نعم، حذف
                        </>
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          {/* نموذج تعديل قصة نجاح */}
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
                  disabled={updateMutation.isPending}
                >
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
              </form>
            </Form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default EditSuccessStory;
