import React, { useState, useEffect, useRef } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLocation, useParams } from 'wouter';
import AdminLayout from '@/components/admin/admin-layout';
import RichEditor from '@/components/ui/rich-editor';
import MediaSelector from '@/components/ui/media-selector';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import {
  Pencil,
  Save,
  X,
  Tag,
  Plus,
  Trash2,
  FileText,
  FileCheck,
  AlertCircle,
  Loader2,
  Book,
  ChevronLeft,
  Image,
  Check,
} from 'lucide-react';

// نموذج المقال الجديد
const postFormSchema = z.object({
  title: z.string().min(10, 'العنوان يجب أن يكون 10 أحرف على الأقل').max(200, 'العنوان لا يجب أن يتجاوز 200 حرف'),
  slug: z.string().min(3, 'المسار يجب أن يكون 3 أحرف على الأقل')
    .max(100, 'المسار لا يجب أن يتجاوز 100 حرف')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'المسار يجب أن يحتوي على أحرف لاتينية صغيرة وأرقام وشرطات فقط'),
  excerpt: z.string().min(10, 'المقتطف يجب أن يكون 10 أحرف على الأقل').max(500, 'المقتطف لا يجب أن يتجاوز 500 حرف'),
  content: z.string().min(10, 'المحتوى يجب أن يكون 10 أحرف على الأقل'),
  isPublished: z.boolean().default(true),
  seoTitle: z.string().max(70, 'عنوان SEO لا يجب أن يتجاوز 70 حرف').optional().nullable(),
  seoDescription: z.string().max(170, 'وصف SEO لا يجب أن يتجاوز 170 حرف').optional().nullable(),
  seoKeywords: z.string().optional().nullable(),
  focusKeyword: z.string().optional().nullable(),
  selectedTags: z.array(z.number()).default([]),
  featuredImage: z.string().optional().nullable(),
});

type PostFormValues = z.infer<typeof postFormSchema>;

export default function CreatePostPage() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const params = useParams();
  const postId = params?.id ? parseInt(params.id) : null;
  const isEditMode = !!postId;
  const queryClient = useQueryClient();
  const [showExitAlert, setShowExitAlert] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [showAddTagDialog, setShowAddTagDialog] = useState(false);
  const isMobile = useIsMobile();
  
  // مرجع لتخزين محتوى المقال
  const editorContentRef = useRef<string>('');
  
  // تعريف نوع البيانات للمقال
  type PostData = {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    content: string | null;
    isPublished: boolean;
    isFeatured: boolean;
    views: number;
    seoTitle: string | null;
    seoDescription: string | null;
    seoKeywords: string | null;
    focusKeyword: string | null;
    imageUrl: string | null;
    authorId: number;
    createdAt: string;
    updatedAt: string;
    tags?: any[]; // التصنيفات المرتبطة بالمقال
  };

  // استعلام عن بيانات المقال عند التعديل
  const { data: postData, isLoading: isLoadingPost } = useQuery<PostData>({
    queryKey: ['/api/posts', postId],
    queryFn: async () => {
      if (!postId) return Promise.reject('No post ID provided');
      console.log('Fetching post with ID:', postId);
      
      try {
        const response = await fetch(`/api/posts/${postId}`);
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Error loading post:', errorData);
          throw new Error(errorData.message || 'فشل في استلام بيانات المقال');
        }
        const data = await response.json();
        console.log('Post data loaded:', data);
        return data;
      } catch (error) {
        console.error('Failed to fetch post:', error);
        throw error;
      }
    },
    enabled: !!postId, // تفعيل الاستعلام فقط عند وجود معرف المقال
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    gcTime: 0,
  });

  // استعلام عن التصنيفات
  const { data: tags = [] } = useQuery<any[]>({
    queryKey: ['/api/tags'],
    queryFn: async () => {
      const response = await fetch('/api/tags');
      if (!response.ok) throw new Error('فشل في استلام التصنيفات');
      return response.json();
    }
  });
  
  // إضافة مقال جديد
  const addPostMutation = useMutation({
    mutationFn: async (newPost: PostFormValues) => {
      // تحويل featuredImage إلى imageUrl كما يتوقع الخادم
      const payload = {
        ...newPost,
        imageUrl: newPost.featuredImage, // تحويل featuredImage إلى imageUrl
      };
      
      console.log("بيانات المقال الجديد:", payload);
      
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'فشل في إضافة المقال');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      toast({
        title: 'تم إضافة المقال بنجاح',
        description: 'تمت إضافة المقال الجديد',
      });
      navigate('/admin/posts');
    },
    onError: (error: Error) => {
      toast({
        title: 'خطأ',
        description: `فشل في إضافة المقال: ${error.message}`,
        variant: 'destructive',
      });
      setIsSubmitting(false);
    }
  });
  
  // إضافة تصنيف جديد
  const addTagMutation = useMutation({
    mutationFn: async (tagName: string) => {
      const response = await fetch('/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: tagName }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'فشل في إضافة التصنيف');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tags'] });
      setNewTagName('');
      setShowAddTagDialog(false);
      toast({
        title: 'تم إضافة التصنيف بنجاح',
        description: 'تمت إضافة التصنيف الجديد',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'خطأ',
        description: `فشل في إضافة التصنيف: ${error.message}`,
        variant: 'destructive',
      });
    }
  });
  
  // تهيئة نموذج المقال
  const form = useForm<PostFormValues>({
    resolver: zodResolver(postFormSchema),
    defaultValues: {
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      isPublished: true,
      seoTitle: '',
      seoDescription: '',
      seoKeywords: '',
      focusKeyword: '',
      selectedTags: [],
      featuredImage: '',
    },
  });
  
  // تحديث مقال موجود
  const updatePostMutation = useMutation({
    mutationFn: async (postData: PostFormValues) => {
      if (!postId) throw new Error('معرف المقال غير موجود');
      
      console.log("بيانات المقال قبل الإرسال:", postData);
      console.log("محتوى المقال:", postData.content);
      
      // تحويل featuredImage إلى imageUrl كما يتوقع الخادم
      const payload = {
        ...postData,
        imageUrl: postData.featuredImage, // تحويل featuredImage إلى imageUrl
      };
      
      console.log("البيانات التي سيتم إرسالها:", payload);
      
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("خطأ في تحديث المقال:", errorData);
        throw new Error(errorData.message || 'فشل في تحديث المقال');
      }
      
      const responseData = await response.json();
      console.log("تم تحديث المقال بنجاح:", responseData);
      return responseData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/posts', postId] });
      toast({
        title: 'تم تحديث المقال بنجاح',
        description: 'تم تحديث بيانات المقال',
      });
      navigate('/admin/posts');
    },
    onError: (error: Error) => {
      toast({
        title: 'خطأ',
        description: `فشل في تحديث المقال: ${error.message}`,
        variant: 'destructive',
      });
      setIsSubmitting(false);
    }
  });

  // معالجة تقديم النموذج
  const onSubmit = (data: PostFormValues) => {
    setIsSubmitting(true);
    
    // استخدام المحتوى من المرجع إذا كان متوفرًا
    let finalData = { ...data };
    
    // إذا كان هناك محتوى مخزن في المرجع فنستخدمه
    if (editorContentRef.current) {
      console.log("استخدام المحتوى من المرجع:", editorContentRef.current);
      finalData.content = editorContentRef.current;
    } else if (postData?.content && (!finalData.content || finalData.content.trim() === '')) {
      console.log("استخدام المحتوى من بيانات المقال:", postData.content);
      finalData.content = postData.content;
    }
    
    // إضافة التصنيفات بالتنسيق المطلوب للواجهة الخلفية
    const dataToSubmit = {
      ...finalData,
      tags: finalData.selectedTags, // إرسال التصنيفات للخادم بالاسم المتوقع (tags)
    };
    
    console.log("تقديم البيانات النهائية:", dataToSubmit);
    
    if (isEditMode) {
      updatePostMutation.mutate(dataToSubmit);
    } else {
      addPostMutation.mutate(dataToSubmit);
    }
  };
  
  // إنشاء slug من العنوان
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  };
  
  // تحديث slug عند تغير العنوان
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    form.setValue('title', title);
    
    // تحديث slug فقط إذا لم يتم تعديله يدوياً
    const currentSlug = form.getValues('slug');
    if (!currentSlug || currentSlug === generateSlug(form.getValues('title'))) {
      form.setValue('slug', generateSlug(title));
    }
    
    // تعيين عنوان SEO إذا لم يتم تعبئته
    const seoTitle = form.getValues('seoTitle');
    if (!seoTitle) {
      form.setValue('seoTitle', title);
    }
  };
  
  // تحديث عنوان SEO من العنوان الرئيسي
  const updateSeoFromTitle = () => {
    const title = form.getValues('title');
    form.setValue('seoTitle', title);
  };
  
  // تحديث وصف SEO من المقتطف
  const updateSeoFromExcerpt = () => {
    const excerpt = form.getValues('excerpt');
    form.setValue('seoDescription', excerpt);
  };
  
  // إضافة تصنيف جديد
  const handleAddTag = () => {
    if (newTagName.trim()) {
      addTagMutation.mutate(newTagName.trim());
    }
  };
  
  // إضافة أو إزالة تصنيف
  const toggleTag = (tagId: number) => {
    const currentTags = form.getValues('selectedTags');
    const isSelected = currentTags.includes(tagId);
    
    if (isSelected) {
      form.setValue('selectedTags', currentTags.filter(id => id !== tagId));
    } else {
      form.setValue('selectedTags', [...currentTags, tagId]);
    }
  };
  
  // استعلام عن تصنيفات المقال
  const { data: postTags = [] } = useQuery<any[]>({
    queryKey: ['/api/posts', postId, 'tags'],
    queryFn: async () => {
      if (!postId) return [];
      try {
        const response = await fetch(`/api/posts/${postId}/tags`);
        if (!response.ok) {
          throw new Error('فشل في استلام تصنيفات المقال');
        }
        return response.json();
      } catch (error) {
        console.error('Failed to fetch post tags:', error);
        return [];
      }
    },
    enabled: !!postId,
  });

  // تحميل بيانات المقال عند التعديل
  useEffect(() => {
    if (postData && isEditMode) {
      console.log("تحميل بيانات المقال للتعديل:", postData);
      console.log("محتوى المقال:", postData.content);
      
      // استخراج معرفات التصنيفات
      const tagIds = postTags.map(tag => tag.id) || [];
      console.log("تصنيفات المقال:", tagIds);
      
      // تجهيز المحتوى بشكل صحيح (التعامل مع القيم null أو undefined)
      let safeContent = '';
      if (postData.content !== null && postData.content !== undefined) {
        safeContent = postData.content;
      }
      
      console.log("المحتوى الآمن المجهز للمحرر:", safeContent);
      
      // تحميل القيم في النموذج بشكل كامل
      form.reset({
        title: postData.title || '',
        slug: postData.slug || '',
        excerpt: postData.excerpt || '',
        content: safeContent,
        isPublished: postData.isPublished ?? true,
        seoTitle: postData.seoTitle || '',
        seoDescription: postData.seoDescription || '',
        seoKeywords: postData.seoKeywords || '',
        focusKeyword: postData.focusKeyword || '',
        selectedTags: tagIds,
        featuredImage: postData.imageUrl || '',
      });

      // تحديث المحتوى بشكل منفصل للتأكد من تعبئته بشكل صحيح
      setTimeout(() => {
        form.setValue('content', safeContent);
        console.log("تم تحديث المحتوى في النموذج:", form.getValues('content'));
      }, 100);

      // طباعة قيم النموذج بعد التحميل للتأكد
      console.log("قيم النموذج بعد التحميل:", form.getValues());
    }
  }, [postData, postTags, isEditMode, form]);
  
  // محتوى الصفحة
  const pageActions = (
    <div className="flex items-center gap-2">
      <Button 
        variant="ghost"
        onClick={() => setShowExitAlert(true)}
        disabled={isSubmitting}
        className="flex items-center gap-1"
      >
        <X className="h-4 w-4" />
        <span className="hidden sm:inline">إلغاء</span>
      </Button>
      <Button
        type="submit"
        form="post-form" 
        disabled={isSubmitting}
        className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="ml-2 h-4 w-4 animate-spin" />
            جاري الحفظ...
          </>
        ) : (
          <>
            <Save className="ml-2 h-4 w-4" />
            حفظ المقال
          </>
        )}
      </Button>
    </div>
  );

  return (
    <AdminLayout title={isEditMode ? "تعديل المقال" : "إضافة مقال جديد"} actions={pageActions}>
      <div className="mb-6">
        <Button
          variant="ghost"
          className="flex items-center text-muted-foreground hover:text-primary"
          onClick={() => navigate('/admin/posts')}
        >
          <ChevronLeft className="ml-1 h-4 w-4" />
          العودة للمقالات
        </Button>
      </div>
      
      <Form {...form}>
        <form id="post-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* القسم الرئيسي */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="shadow-sm border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">معلومات المقال الأساسية</CardTitle>
                  <CardDescription>
                    المعلومات الرئيسية للمقال
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>عنوان المقال</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="أدخل عنوان المقال" 
                            {...field} 
                            onChange={handleTitleChange}
                            className="bg-white"
                          />
                        </FormControl>
                        <FormDescription>
                          هذا العنوان سيظهر في صفحة المقال وفي نتائج البحث
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>المسار (Slug)</FormLabel>
                        <FormControl>
                          <div className="flex items-center border rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-0">
                            <span className="pl-3 py-2 text-muted-foreground text-sm border-l">
                              posts/
                            </span>
                            <Input 
                              placeholder="مسار-المقال" 
                              {...field} 
                              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                              dir="ltr"
                              autoComplete="off"
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          سيستخدم هذا المسار في عنوان URL الخاص بالمقال
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="excerpt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>المقتطف (ملخص المقال)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="أدخل ملخصاً للمقال" 
                            {...field} 
                            className="resize-none min-h-[100px] bg-white"
                          />
                        </FormControl>
                        <FormDescription>
                          ملخص قصير يظهر في صفحة المقالات وفي نتائج البحث
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div>
                    <FormField
                      control={form.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>محتوى المقال</FormLabel>
                          <FormControl>
                            <RichEditor
                              initialValue={postData?.content || field.value || ''}
                              onChange={(html) => {
                                console.log("تغيير المحتوى:", html);
                                // حفظ المحتوى في المرجع
                                editorContentRef.current = html;
                                // تحديث قيمة النموذج
                                field.onChange(html);
                              }}
                              placeholder="اكتب محتوى المقال..."
                              height={500}
                              dir="rtl"
                              seoTitle={form.getValues('seoTitle') || ''}
                              onSeoTitleChange={(title) => form.setValue('seoTitle', title)}
                              seoDescription={form.getValues('seoDescription') || ''}
                              onSeoDescriptionChange={(desc) => form.setValue('seoDescription', desc)}
                              seoKeywords={form.getValues('seoKeywords') || ''}
                              onSeoKeywordsChange={(keywords) => form.setValue('seoKeywords', keywords)}
                              focusKeyword={form.getValues('focusKeyword') || ''}
                              onFocusKeywordChange={(keyword) => form.setValue('focusKeyword', keyword)}
                              className="post-editor"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="shadow-sm border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">تحسين محركات البحث (SEO)</CardTitle>
                  <CardDescription>
                    معلومات تساعد في تحسين ظهور المقال في نتائج البحث
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Button type="button" size="sm" variant="outline" onClick={updateSeoFromTitle}>
                      <FileText className="ml-2 h-3.5 w-3.5" />
                      نسخ من العنوان
                    </Button>
                    <Button type="button" size="sm" variant="outline" onClick={updateSeoFromExcerpt}>
                      <FileCheck className="ml-2 h-3.5 w-3.5" />
                      نسخ من المقتطف
                    </Button>
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="seoTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>عنوان SEO</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="عنوان للظهور في نتائج البحث" 
                            {...field} 
                            value={field.value || ''}
                            className="bg-white"
                          />
                        </FormControl>
                        <FormDescription>
                          مثالي: 50-60 حرف. سيظهر في نتائج البحث
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="seoDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>وصف SEO</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="وصف للظهور في نتائج البحث" 
                            {...field} 
                            value={field.value || ''}
                            className="resize-none min-h-[80px] bg-white"
                          />
                        </FormControl>
                        <FormDescription>
                          مثالي: 140-160 حرف. سيظهر في نتائج البحث
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="focusKeyword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>الكلمة المفتاحية الرئيسية</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="مثال: المنح الدراسية" 
                              {...field} 
                              value={field.value || ''}
                              className="bg-white"
                            />
                          </FormControl>
                          <FormDescription>
                            الكلمة المفتاحية الأهم للمقال
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="seoKeywords"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>الكلمات المفتاحية</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="مثال: منح دراسية, دراسة في الخارج" 
                              {...field} 
                              value={field.value || ''}
                              className="bg-white"
                            />
                          </FormControl>
                          <FormDescription>
                            كلمات مفتاحية مفصولة بفواصل
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* القسم الجانبي */}
            <div className="space-y-6">
              <Card className="shadow-sm border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">التصنيفات</CardTitle>
                  <CardDescription>
                    قم بإضافة تصنيفات للمقال
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <FormLabel>التصنيفات المتاحة</FormLabel>
                    <Dialog open={showAddTagDialog} onOpenChange={setShowAddTagDialog}>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline" className="flex items-center">
                          <Plus className="h-3.5 w-3.5 ml-1" />
                          إضافة تصنيف
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>إضافة تصنيف جديد</DialogTitle>
                          <DialogDescription>
                            أدخل اسم التصنيف الجديد الذي ترغب بإضافته
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-3">
                          <Input 
                            placeholder="اسم التصنيف" 
                            value={newTagName} 
                            onChange={(e) => setNewTagName(e.target.value)} 
                            className="bg-white"
                          />
                        </div>
                        <DialogFooter className="sm:justify-start mt-4">
                          <Button
                            type="button"
                            onClick={handleAddTag}
                            disabled={!newTagName.trim() || addTagMutation.isPending}
                            className="flex items-center"
                          >
                            {addTagMutation.isPending ? (
                              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Plus className="ml-2 h-4 w-4" />
                            )}
                            إضافة
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowAddTagDialog(false)}
                            className="mr-2"
                          >
                            إلغاء
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-2">
                    {tags.length === 0 && (
                      <div className="text-muted-foreground text-sm">
                        لا توجد تصنيفات متاحة. قم بإضافة تصنيفات جديدة.
                      </div>
                    )}
                    
                    {tags.map((tag) => {
                      const isSelected = form.getValues('selectedTags').includes(tag.id);
                      return (
                        <Badge
                          key={tag.id}
                          variant={isSelected ? "default" : "outline"}
                          className={`cursor-pointer ${isSelected ? 'bg-primary' : 'hover:bg-primary/10'}`}
                          onClick={() => toggleTag(tag.id)}
                        >
                          {isSelected && <Check className="h-3 w-3 ml-1" />}
                          {tag.name}
                        </Badge>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="shadow-sm border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">صورة المقال الرئيسية</CardTitle>
                  <CardDescription>
                    أضف صورة رئيسية للمقال
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="featuredImage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>صورة المقال</FormLabel>
                        <FormControl>
                          <div>
                            <MediaSelector
                              onSelect={(mediaFile) => {
                                field.onChange(mediaFile.url);
                              }}
                              selectedUrl={field.value || ''}
                              triggerButtonLabel="اختيار صورة من المكتبة"
                              showPreview={true}
                              previewSize="large"
                              allowClear={true}
                              onClear={() => field.onChange('')}
                              onlyImages={true}
                              className="w-full"
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          اختر صورة مميزة للمقال من مكتبة الوسائط
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
              
              <Card className="shadow-sm border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">النشر</CardTitle>
                  <CardDescription>
                    إعدادات نشر المقال
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="isPublished"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between space-x-2 space-y-0 rtl:space-x-reverse">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">نشر المقال</FormLabel>
                          <FormDescription>
                            سيظهر المقال للزوار
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
            </div>
          </div>
        </form>
      </Form>
      
      {/* مربع حوار تأكيد الخروج */}
      <AlertDialog open={showExitAlert} onOpenChange={setShowExitAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من الخروج؟</AlertDialogTitle>
            <AlertDialogDescription>
              ستفقد جميع التغييرات التي قمت بها. هل ترغب بالاستمرار؟
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-0">
            <AlertDialogCancel className="sm:ml-2">إلغاء</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={() => navigate('/admin/posts')}
            >
              نعم، الخروج بدون حفظ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}