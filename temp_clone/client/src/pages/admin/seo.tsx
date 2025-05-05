import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusCircle, Edit, Trash2, RefreshCw, Check, Search, Menu } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import Sidebar from '@/components/admin/sidebar';

// زودج سكيما للتحقق من صحة البيانات
const seoSettingSchema = z.object({
  pagePath: z.string().min(1, 'مسار الصفحة مطلوب').startsWith('/', 'يجب أن يبدأ المسار بشرطة مائلة (/)'),
  title: z.string().min(1, 'العنوان مطلوب'),
  description: z.string().min(1, 'الوصف مطلوب').max(160, 'يجب أن يكون الوصف 160 حرفًا أو أقل'),
  keywords: z.string().optional(),
  ogTitle: z.string().optional(),
  ogDescription: z.string().optional(),
  ogImage: z.string().url('يجب أن يكون رابط صورة صالح').optional().or(z.literal('')),
});

type SeoSettingFormValues = z.infer<typeof seoSettingSchema>;

// واجهة لإعدادات SEO
interface SeoSetting {
  id: number;
  pagePath: string;
  title: string;
  description: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
}

export default function SeoPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSeoSetting, setSelectedSeoSetting] = useState<SeoSetting | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // التحقق من تسجيل الدخول
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/admin/login');
    }
  }, [authLoading, isAuthenticated, navigate]);

  // استلام إعدادات SEO من الخادم
  const { data: seoSettings, isLoading, isError, refetch } = useQuery<SeoSetting[]>({
    queryKey: ['/api/seo-settings'],
    queryFn: async () => {
      const response = await fetch('/api/seo-settings');
      if (!response.ok) throw new Error('فشل في استلام إعدادات SEO');
      return response.json();
    },
    enabled: isAuthenticated
  });

  // تصفية إعدادات SEO بناءً على مصطلح البحث
  const filteredSeoSettings = seoSettings?.filter(setting => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      setting.pagePath.toLowerCase().includes(search) ||
      setting.title.toLowerCase().includes(search) ||
      setting.description.toLowerCase().includes(search)
    );
  });

  // إضافة إعداد SEO جديد
  const addMutation = useMutation({
    mutationFn: async (newSeoSetting: SeoSettingFormValues) => {
      // تنظيف البيانات
      const cleanedData = { ...newSeoSetting };
      if (!cleanedData.keywords) delete cleanedData.keywords;
      if (!cleanedData.ogTitle) delete cleanedData.ogTitle;
      if (!cleanedData.ogDescription) delete cleanedData.ogDescription;
      if (!cleanedData.ogImage) delete cleanedData.ogImage;

      const response = await fetch('/api/seo-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanedData),
      });
      if (!response.ok) throw new Error('فشل في إضافة إعداد SEO');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/seo-settings'] });
      toast({ title: 'تم الإضافة بنجاح', description: 'تمت إضافة إعداد SEO الجديد إلى قاعدة البيانات' });
      setIsAddDialogOpen(false);
    },
    onError: (error) => {
      toast({ title: 'خطأ!', description: `فشل في إضافة إعداد SEO: ${error.message}`, variant: 'destructive' });
    }
  });

  // تعديل إعداد SEO
  const updateMutation = useMutation({
    mutationFn: async (updatedSeoSetting: SeoSettingFormValues & { id: number }) => {
      const { id, ...seoSettingData } = updatedSeoSetting;
      
      // تنظيف البيانات
      const cleanedData = { ...seoSettingData };
      if (!cleanedData.keywords) delete cleanedData.keywords;
      if (!cleanedData.ogTitle) delete cleanedData.ogTitle;
      if (!cleanedData.ogDescription) delete cleanedData.ogDescription;
      if (!cleanedData.ogImage) delete cleanedData.ogImage;

      const response = await fetch(`/api/seo-settings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanedData),
      });
      if (!response.ok) throw new Error('فشل في تحديث إعداد SEO');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/seo-settings'] });
      toast({ title: 'تم التحديث بنجاح', description: 'تم تحديث إعداد SEO في قاعدة البيانات' });
      setIsEditDialogOpen(false);
      setSelectedSeoSetting(null);
    },
    onError: (error) => {
      toast({ title: 'خطأ!', description: `فشل في تحديث إعداد SEO: ${error.message}`, variant: 'destructive' });
    }
  });

  // حذف إعداد SEO
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/seo-settings/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('فشل في حذف إعداد SEO');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/seo-settings'] });
      toast({ title: 'تم الحذف بنجاح', description: 'تم حذف إعداد SEO من قاعدة البيانات' });
      setIsDeleteDialogOpen(false);
      setSelectedSeoSetting(null);
    },
    onError: (error) => {
      toast({ title: 'خطأ!', description: `فشل في حذف إعداد SEO: ${error.message}`, variant: 'destructive' });
    }
  });

  // نموذج إضافة إعداد SEO جديد
  const addForm = useForm<SeoSettingFormValues>({
    resolver: zodResolver(seoSettingSchema),
    defaultValues: {
      pagePath: '',
      title: '',
      description: '',
      keywords: '',
      ogTitle: '',
      ogDescription: '',
      ogImage: '',
    },
  });

  // نموذج تعديل إعداد SEO
  const editForm = useForm<SeoSettingFormValues>({
    resolver: zodResolver(seoSettingSchema),
    defaultValues: {
      pagePath: selectedSeoSetting?.pagePath || '',
      title: selectedSeoSetting?.title || '',
      description: selectedSeoSetting?.description || '',
      keywords: selectedSeoSetting?.keywords || '',
      ogTitle: selectedSeoSetting?.ogTitle || '',
      ogDescription: selectedSeoSetting?.ogDescription || '',
      ogImage: selectedSeoSetting?.ogImage || '',
    },
  });

  // تحديث نموذج التعديل عند تغيير إعداد SEO المحدد
  useEffect(() => {
    if (selectedSeoSetting) {
      editForm.reset({
        pagePath: selectedSeoSetting.pagePath,
        title: selectedSeoSetting.title,
        description: selectedSeoSetting.description,
        keywords: selectedSeoSetting.keywords || '',
        ogTitle: selectedSeoSetting.ogTitle || '',
        ogDescription: selectedSeoSetting.ogDescription || '',
        ogImage: selectedSeoSetting.ogImage || '',
      });
    }
  }, [selectedSeoSetting, editForm]);

  // إعادة ضبط نموذج الإضافة عند فتح نافذة الإضافة
  useEffect(() => {
    if (isAddDialogOpen) {
      addForm.reset({
        pagePath: '',
        title: '',
        description: '',
        keywords: '',
        ogTitle: '',
        ogDescription: '',
        ogImage: '',
      });
    }
  }, [isAddDialogOpen, addForm]);

  // معالجة حدث إرسال نموذج الإضافة
  const onSubmitAdd = (data: SeoSettingFormValues) => {
    addMutation.mutate(data);
  };

  // معالجة حدث إرسال نموذج التعديل
  const onSubmitEdit = (data: SeoSettingFormValues) => {
    if (selectedSeoSetting) {
      updateMutation.mutate({ ...data, id: selectedSeoSetting.id });
    }
  };

  // تحضير إعداد SEO للتعديل
  const handleEdit = (seoSetting: SeoSetting) => {
    setSelectedSeoSetting(seoSetting);
    setIsEditDialogOpen(true);
  };

  // تحضير إعداد SEO للحذف
  const handleDelete = (seoSetting: SeoSetting) => {
    setSelectedSeoSetting(seoSetting);
    setIsDeleteDialogOpen(true);
  };

  // تأكيد الحذف
  const confirmDelete = () => {
    if (selectedSeoSetting) {
      deleteMutation.mutate(selectedSeoSetting.id);
    }
  };

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
          console.log('SEO: closing sidebar');
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
              <h1 className="text-xl md:text-2xl font-bold">إدارة SEO</h1>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => refetch()}>
                <RefreshCw className="ml-2 h-4 w-4" />
                تحديث
              </Button>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <PlusCircle className="ml-2 h-4 w-4" />
                    إضافة إعداد SEO
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>إضافة إعداد SEO جديد</DialogTitle>
                    <DialogDescription>
                      أضف إعدادات SEO جديدة لصفحة ما. اضغط على حفظ عند الانتهاء.
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...addForm}>
                    <form onSubmit={addForm.handleSubmit(onSubmitAdd)} className="space-y-4">
                      <FormField
                        control={addForm.control}
                        name="pagePath"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>مسار الصفحة</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="/example-page" dir="ltr" />
                            </FormControl>
                            <FormDescription>
                              المسار النسبي للصفحة، مثل: <code>/</code> للصفحة الرئيسية، <code>/about</code> لصفحة "من نحن"
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={addForm.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>عنوان الصفحة</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="عنوان الصفحة لمحركات البحث" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={addForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>وصف الصفحة</FormLabel>
                            <FormControl>
                              <Textarea {...field} placeholder="وصف الصفحة لمحركات البحث (يفضل أقل من 160 حرف)" />
                            </FormControl>
                            <FormDescription>
                              عدد الأحرف: {field.value?.length || 0}/160
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={addForm.control}
                        name="keywords"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>الكلمات المفتاحية</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="كلمة مفتاحية 1, كلمة مفتاحية 2, كلمة مفتاحية 3" />
                            </FormControl>
                            <FormDescription>
                              الكلمات المفتاحية مفصولة بفواصل
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="bg-muted/30 p-4 rounded-md border border-border">
                        <h3 className="text-md font-medium mb-3">إعدادات Open Graph</h3>
                        <div className="space-y-4">
                          <FormField
                            control={addForm.control}
                            name="ogTitle"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>عنوان Open Graph</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="عنوان للمشاركة على وسائل التواصل الاجتماعي" />
                                </FormControl>
                                <FormDescription>
                                  اترك فارغًا لاستخدام عنوان الصفحة الأساسي
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={addForm.control}
                            name="ogDescription"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>وصف Open Graph</FormLabel>
                                <FormControl>
                                  <Textarea {...field} placeholder="وصف للمشاركة على وسائل التواصل الاجتماعي" />
                                </FormControl>
                                <FormDescription>
                                  اترك فارغًا لاستخدام وصف الصفحة الأساسي
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={addForm.control}
                            name="ogImage"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>صورة Open Graph</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="https://example.com/image.jpg" dir="ltr" />
                                </FormControl>
                                <FormDescription>
                                  رابط الصورة التي ستظهر عند مشاركة الصفحة على وسائل التواصل الاجتماعي
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      <DialogFooter>
                        <Button type="submit" disabled={addMutation.isPending}>
                          {addMutation.isPending ? (
                            <>
                              <RefreshCw className="ml-2 h-4 w-4 animate-spin" />
                              جاري الحفظ...
                            </>
                          ) : (
                            <>
                              <Check className="ml-2 h-4 w-4" />
                              حفظ
                            </>
                          )}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <Card className="shadow-soft mb-6">
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="ابحث عن إعدادات SEO حسب المسار أو العنوان..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-9"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>إعدادات SEO</CardTitle>
              <CardDescription>
                إدارة إعدادات SEO لجميع صفحات الموقع
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-32">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                  <span className="mr-2">جاري التحميل...</span>
                </div>
              ) : isError ? (
                <div className="text-center py-4 text-red-500">
                  <p>حدث خطأ أثناء تحميل البيانات. يرجى المحاولة مرة أخرى.</p>
                  <Button variant="outline" onClick={() => refetch()} className="mt-2">
                    إعادة المحاولة
                  </Button>
                </div>
              ) : filteredSeoSettings && filteredSeoSettings.length > 0 ? (
                <div className="overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12 text-right">الرقم</TableHead>
                        <TableHead className="text-right">مسار الصفحة</TableHead>
                        <TableHead className="text-right">العنوان</TableHead>
                        <TableHead className="text-right">الوصف</TableHead>
                        <TableHead className="text-left w-[120px]">الإجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSeoSettings.map((seoSetting) => (
                        <TableRow key={seoSetting.id}>
                          <TableCell>{seoSetting.id}</TableCell>
                          <TableCell dir="ltr" className="font-mono">{seoSetting.pagePath}</TableCell>
                          <TableCell className="max-w-xs truncate">{seoSetting.title}</TableCell>
                          <TableCell className="max-w-xs truncate">{seoSetting.description}</TableCell>
                          <TableCell>
                            <div className="flex justify-end gap-2">
                              <Button size="icon" variant="ghost" onClick={() => handleEdit(seoSetting)}>
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">تعديل</span>
                              </Button>
                              <Button size="icon" variant="ghost" className="text-red-500" onClick={() => handleDelete(seoSetting)}>
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">حذف</span>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  {searchTerm ? (
                    <p>لا توجد إعدادات SEO تطابق بحثك "{searchTerm}".</p>
                  ) : (
                    <>
                      <p>لا توجد إعدادات SEO حاليًا.</p>
                      <Button variant="outline" onClick={() => setIsAddDialogOpen(true)} className="mt-2">
                        إضافة إعداد SEO جديد
                      </Button>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* نافذة تعديل إعداد SEO */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>تعديل إعداد SEO</DialogTitle>
                <DialogDescription>
                  قم بتعديل إعدادات SEO للصفحة. اضغط على حفظ عند الانتهاء.
                </DialogDescription>
              </DialogHeader>
              {selectedSeoSetting && (
                <Form {...editForm}>
                  <form onSubmit={editForm.handleSubmit(onSubmitEdit)} className="space-y-4">
                    <FormField
                      control={editForm.control}
                      name="pagePath"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>مسار الصفحة</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="/example-page" dir="ltr" />
                          </FormControl>
                          <FormDescription>
                            المسار النسبي للصفحة، مثل: <code>/</code> للصفحة الرئيسية، <code>/about</code> لصفحة "من نحن"
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={editForm.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>عنوان الصفحة</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="عنوان الصفحة لمحركات البحث" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={editForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>وصف الصفحة</FormLabel>
                          <FormControl>
                            <Textarea {...field} placeholder="وصف الصفحة لمحركات البحث (يفضل أقل من 160 حرف)" />
                          </FormControl>
                          <FormDescription>
                            عدد الأحرف: {field.value?.length || 0}/160
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={editForm.control}
                      name="keywords"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>الكلمات المفتاحية</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="كلمة مفتاحية 1, كلمة مفتاحية 2, كلمة مفتاحية 3" />
                          </FormControl>
                          <FormDescription>
                            الكلمات المفتاحية مفصولة بفواصل
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="bg-muted/30 p-4 rounded-md border border-border">
                      <h3 className="text-md font-medium mb-3">إعدادات Open Graph</h3>
                      <div className="space-y-4">
                        <FormField
                          control={editForm.control}
                          name="ogTitle"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>عنوان Open Graph</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="عنوان للمشاركة على وسائل التواصل الاجتماعي" />
                              </FormControl>
                              <FormDescription>
                                اترك فارغًا لاستخدام عنوان الصفحة الأساسي
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={editForm.control}
                          name="ogDescription"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>وصف Open Graph</FormLabel>
                              <FormControl>
                                <Textarea {...field} placeholder="وصف للمشاركة على وسائل التواصل الاجتماعي" />
                              </FormControl>
                              <FormDescription>
                                اترك فارغًا لاستخدام وصف الصفحة الأساسي
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={editForm.control}
                          name="ogImage"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>صورة Open Graph</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="https://example.com/image.jpg" dir="ltr" />
                              </FormControl>
                              <FormDescription>
                                رابط الصورة التي ستظهر عند مشاركة الصفحة على وسائل التواصل الاجتماعي
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <DialogFooter>
                      <Button type="submit" disabled={updateMutation.isPending}>
                        {updateMutation.isPending ? (
                          <>
                            <RefreshCw className="ml-2 h-4 w-4 animate-spin" />
                            جاري الحفظ...
                          </>
                        ) : (
                          <>
                            <Check className="ml-2 h-4 w-4" />
                            حفظ التغييرات
                          </>
                        )}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              )}
            </DialogContent>
          </Dialog>

          {/* نافذة تأكيد الحذف */}
          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
                <AlertDialogDescription>
                  سيتم حذف إعداد SEO للصفحة "{selectedSeoSetting?.pagePath}" بشكل نهائي. 
                  هذا الإجراء لا يمكن التراجع عنه.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>إلغاء</AlertDialogCancel>
                <AlertDialogAction onClick={confirmDelete} className="bg-red-500 hover:bg-red-600">
                  {deleteMutation.isPending ? (
                    <>
                      <RefreshCw className="ml-2 h-4 w-4 animate-spin" />
                      جارٍ الحذف...
                    </>
                  ) : (
                    'حذف'
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </main>
      </div>
    </div>
  );
}