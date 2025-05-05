import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  PlusCircle, 
  Edit, 
  Trash2, 
  RefreshCw, 
  Check, 
  X, 
  FolderOpen, 
  Search, 
  ArrowUpDown, 
  Filter,
  ChevronDown,
  MoreHorizontal,
  Flag,
  BookOpenCheck,
  BookMarked,
  Globe
} from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import AdminLayout from '@/components/admin/admin-layout';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/components/ui/alert-dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

// زودج سكيما للتحقق من صحة البيانات
const categorySchema = z.object({
  name: z.string().min(2, 'الاسم يجب أن يكون على الأقل حرفين'),
  slug: z.string().min(2, 'الاسم المختصر يجب أن يكون على الأقل حرفين').regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'الاسم المختصر يجب أن يحتوي على أحرف صغيرة وأرقام وشرطات فقط'),
  description: z.string().optional(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

// واجهة للتصنيف
interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
}

export default function CategoriesPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  // استلام التصنيفات من الخادم
  const { data: categoriesResponse, isLoading, isError, refetch } = useQuery<{ success?: boolean, data?: Category[] } | Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await fetch('/api/categories');
      if (!response.ok) throw new Error('فشل في استلام التصنيفات');
      return response.json();
    }
  });
  
  // تحديد ما إذا كانت البيانات تستخدم الصيغة الجديدة وجلب المصفوفة المناسبة
  const categories = Array.isArray(categoriesResponse) 
    ? categoriesResponse 
    : categoriesResponse?.data || [];

  // إضافة تصنيف جديد
  const addMutation = useMutation({
    mutationFn: async (newCategory: CategoryFormValues) => {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCategory),
      });
      if (!response.ok) throw new Error('فشل في إضافة التصنيف');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({ title: 'تم إضافة التصنيف بنجاح', description: 'تمت إضافة التصنيف الجديد إلى قاعدة البيانات' });
      setIsAddDialogOpen(false);
    },
    onError: (error) => {
      toast({ title: 'خطأ!', description: `فشل في إضافة التصنيف: ${error.message}`, variant: 'destructive' });
    }
  });

  // تعديل تصنيف
  const updateMutation = useMutation({
    mutationFn: async (updatedCategory: CategoryFormValues & { id: number }) => {
      const { id, ...categoryData } = updatedCategory;
      const response = await fetch(`/api/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryData),
      });
      if (!response.ok) throw new Error('فشل في تحديث التصنيف');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({ title: 'تم التحديث بنجاح', description: 'تم تحديث التصنيف في قاعدة البيانات' });
      setIsEditDialogOpen(false);
      setSelectedCategory(null);
    },
    onError: (error) => {
      toast({ title: 'خطأ!', description: `فشل في تحديث التصنيف: ${error.message}`, variant: 'destructive' });
    }
  });

  // حذف تصنيف
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('فشل في حذف التصنيف');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({ title: 'تم الحذف بنجاح', description: 'تم حذف التصنيف من قاعدة البيانات' });
      setIsDeleteDialogOpen(false);
      setSelectedCategory(null);
    },
    onError: (error) => {
      toast({ title: 'خطأ!', description: `فشل في حذف التصنيف: ${error.message}`, variant: 'destructive' });
    }
  });

  // نموذج إضافة تصنيف جديد
  const addForm = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
    },
  });

  // نموذج تعديل تصنيف
  const editForm = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: selectedCategory?.name || '',
      slug: selectedCategory?.slug || '',
      description: selectedCategory?.description || '',
    },
  });

  // تحديث نموذج التعديل عند تغيير التصنيف المحدد
  useEffect(() => {
    if (selectedCategory) {
      editForm.reset({
        name: selectedCategory.name,
        slug: selectedCategory.slug,
        description: selectedCategory.description || '',
      });
    }
  }, [selectedCategory, editForm]);

  // إعادة ضبط نموذج الإضافة عند فتح نافذة الإضافة
  useEffect(() => {
    if (isAddDialogOpen) {
      addForm.reset({
        name: '',
        slug: '',
        description: '',
      });
    }
  }, [isAddDialogOpen, addForm]);

  // معالجة حدث إرسال نموذج الإضافة
  const onSubmitAdd = (data: CategoryFormValues) => {
    addMutation.mutate(data);
  };

  // معالجة حدث إرسال نموذج التعديل
  const onSubmitEdit = (data: CategoryFormValues) => {
    if (selectedCategory) {
      updateMutation.mutate({ ...data, id: selectedCategory.id });
    }
  };

  // تحضير التصنيف للتعديل
  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setIsEditDialogOpen(true);
  };

  // تحضير التصنيف للحذف
  const handleDelete = (category: Category) => {
    setSelectedCategory(category);
    setIsDeleteDialogOpen(true);
  };

  // تأكيد الحذف
  const confirmDelete = () => {
    if (selectedCategory) {
      deleteMutation.mutate(selectedCategory.id);
    }
  };

  // إنتاج slug من الاسم
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-');
  };

  // معالجة تلقائية لإنشاء slug عند كتابة الاسم في نموذج الإضافة
  const handleNameChangeAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    addForm.setValue('name', name);
    if (!addForm.getValues('slug') || addForm.getValues('slug') === generateSlug(addForm.getValues('name'))) {
      const slug = generateSlug(name);
      addForm.setValue('slug', slug);
    }
  };

  // معالجة تلقائية لإنشاء slug عند كتابة الاسم في نموذج التعديل
  const handleNameChangeEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    editForm.setValue('name', name);
    if (!editForm.getValues('slug') || editForm.getValues('slug') === generateSlug(editForm.getValues('name'))) {
      const slug = generateSlug(name);
      editForm.setValue('slug', slug);
    }
  };

  const actions = (
    <div className="flex gap-2">
      <Button variant="outline" onClick={() => refetch()}>
        <RefreshCw className="ml-2 h-4 w-4" />
        تحديث
      </Button>
      <Button onClick={() => setIsAddDialogOpen(true)}>
        <PlusCircle className="ml-2 h-4 w-4" />
        إضافة تصنيف
      </Button>
    </div>
  );

  return (
    <AdminLayout title="إدارة التصنيفات" actions={actions}>
      <div className="space-y-8">
        {/* الإحصائيات وبطاقات المعلومات */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-white border-none shadow-md">
            <CardHeader className="pb-1 px-3 sm:px-6 pt-3 sm:pt-6">
              <div className="flex justify-between items-start">
                <div className="bg-blue-100 p-2 sm:p-3 rounded-xl">
                  <FolderOpen className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
              <div className="space-y-0 sm:space-y-1">
                <h3 className="text-xl sm:text-3xl font-bold text-gray-800">
                  {categories ? categories.length : 0}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500">إجمالي التصنيفات</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-white border-none shadow-md">
            <CardHeader className="pb-1 px-3 sm:px-6 pt-3 sm:pt-6">
              <div className="flex justify-between items-start">
                <div className="bg-purple-100 p-2 sm:p-3 rounded-xl">
                  <BookOpenCheck className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
              <div className="space-y-0 sm:space-y-1">
                <h3 className="text-xl sm:text-3xl font-bold text-gray-800">
                  {categories ? categories.filter(cat => cat.description && cat.description.length > 0).length : 0}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500">تصنيفات مع وصف</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-white border-none shadow-md">
            <CardHeader className="pb-1 px-3 sm:px-6 pt-3 sm:pt-6">
              <div className="flex justify-between items-start">
                <div className="bg-amber-100 p-2 sm:p-3 rounded-xl">
                  <Globe className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
              <div className="space-y-0 sm:space-y-1">
                <h3 className="text-xl sm:text-3xl font-bold text-gray-800">
                  {categories ? categories.filter(cat => cat.slug && cat.slug.length > 5).length : 0}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500">تصنيفات SEO-friendly</p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* نافذة إضافة تصنيف */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="w-[95%] max-w-[500px] rounded-xl p-0 overflow-hidden">
            <DialogHeader className="bg-blue-50/50 px-4 py-3 border-b">
              <DialogTitle className="flex items-center text-blue-700">
                <PlusCircle className="ml-2 h-5 w-5 text-blue-500" />
                إضافة تصنيف جديد
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-600 mt-1">
                أضف تصنيفًا جديدًا للمنح الدراسية هنا. اضغط على حفظ عند الانتهاء.
              </DialogDescription>
            </DialogHeader>
            <div className="p-4">
              <Form {...addForm}>
                <form onSubmit={addForm.handleSubmit(onSubmitAdd)} className="space-y-4">
                  <FormField
                    control={addForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">اسم التصنيف</FormLabel>
                        <FormControl>
                          <Input 
                            {...field}
                            onChange={handleNameChangeAdd} 
                            placeholder="مثال: دراسات عليا"
                            className="border border-gray-300 focus:border-blue-500 text-sm"
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={addForm.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">الاسم المختصر (Slug)</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="مثال: graduate-studies" 
                            dir="ltr"
                            className="border border-gray-300 focus:border-blue-500 font-mono text-sm"
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          سيستخدم هذا في عنوان URL. يجب أن يحتوي على أحرف صغيرة وأرقام وشرطات فقط.
                        </FormDescription>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={addForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">الوصف</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="وصف اختياري للتصنيف" 
                            className="resize-none min-h-[80px] sm:min-h-[100px] border border-gray-300 focus:border-blue-500 text-sm"
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                  <DialogFooter className="mt-6 sm:mt-8 gap-3 flex flex-col sm:flex-row sm:justify-end">
                    <Button 
                      type="button" 
                      variant="outline"
                      className="w-full sm:w-auto border-gray-300"
                      onClick={() => setIsAddDialogOpen(false)}
                    >
                      إلغاء
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={addMutation.isPending} 
                      className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600"
                    >
                      {addMutation.isPending ? (
                        <>
                          <RefreshCw className="ml-2 h-4 w-4 animate-spin" />
                          جاري الحفظ...
                        </>
                      ) : (
                        <>
                          <Check className="ml-2 h-4 w-4" />
                          حفظ التصنيف
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </div>
          </DialogContent>
        </Dialog>

        {/* البحث وقائمة التصنيفات */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FolderOpen className="ml-2 h-5 w-5 text-blue-500" />
              قائمة التصنيفات
            </CardTitle>
            <CardDescription>
              جميع تصنيفات المنح الدراسية المتوفرة في الموقع
            </CardDescription>
            
            {/* شريط البحث والفلترة */}
            <div className="flex flex-col md:flex-row gap-3 mt-4">
              <div className="relative w-full md:w-[280px]">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="البحث عن تصنيف..." 
                  className="pl-3 pr-9 bg-gray-50 border-gray-200 focus:border-blue-500 h-9 text-sm" 
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" className="text-xs px-2 h-9 flex-shrink-0">
                  <Filter className="ml-1 h-3 w-3" />
                  مع وصف
                </Button>
                <Button variant="outline" size="sm" className="text-xs px-2 h-9 flex-shrink-0">
                  <ArrowUpDown className="ml-1 h-3 w-3" />
                  ترتيب حسب الاسم
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-6">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex gap-4 items-center">
                    <Skeleton className="h-12 w-12 rounded-md bg-gray-200" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-3/4 bg-gray-200" />
                      <Skeleton className="h-4 w-1/2 bg-gray-200" />
                    </div>
                  </div>
                ))}
              </div>
            ) : isError ? (
              <div className="text-center p-8 rounded-lg bg-red-50 border border-red-100">
                <X className="h-12 w-12 mx-auto text-red-400 mb-3" />
                <h3 className="text-lg font-medium text-red-800 mb-2">حدث خطأ أثناء تحميل البيانات</h3>
                <p className="text-red-600 mb-4">لم نتمكن من جلب التصنيفات. يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى.</p>
                <Button onClick={() => refetch()} className="bg-white text-red-600 border border-red-300 hover:bg-red-50">
                  <RefreshCw className="ml-2 h-4 w-4" />
                  إعادة المحاولة
                </Button>
              </div>
            ) : categories && categories.length > 0 ? (
              <div className="rounded-md border overflow-x-auto">
                {/* للأجهزة المكتبية والأجهزة اللوحية الكبيرة */}
                <div className="hidden md:block">
                  <Table>
                    <TableHeader className="bg-gray-50">
                      <TableRow>
                        <TableHead className="w-12 text-right">الرقم</TableHead>
                        <TableHead className="text-right">الاسم</TableHead>
                        <TableHead className="text-right">الاسم المختصر</TableHead>
                        <TableHead className="text-right">الوصف</TableHead>
                        <TableHead className="text-left w-[100px]">الإجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {categories.map((category) => (
                        <TableRow key={category.id} className="hover:bg-blue-50/30">
                          <TableCell className="font-medium">{category.id}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                                  {category.name.substring(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{category.name}</p>
                                <p className="text-xs text-gray-500">تصنيف #{category.id}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 font-mono text-xs" dir="ltr">
                              {category.slug}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-[300px] truncate">
                              {category.description ? 
                                category.description 
                                : 
                                <span className="text-gray-400 text-sm italic">لا يوجد وصف</span>
                              }
                            </div>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">القائمة</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem onClick={() => handleEdit(category)}>
                                  <Edit className="ml-2 h-4 w-4" />
                                  تعديل التصنيف
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Flag className="ml-2 h-4 w-4" />
                                  عرض المنح المرتبطة
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => handleDelete(category)}
                                  className="text-red-600 focus:bg-red-50 focus:text-red-600"
                                >
                                  <Trash2 className="ml-2 h-4 w-4" />
                                  حذف التصنيف
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                {/* للأجهزة المحمولة */}
                <div className="md:hidden space-y-3 py-2">
                  {categories.map((category) => (
                    <div key={category.id} className="border rounded-lg overflow-hidden mb-3 bg-white">
                      <div className="p-3 border-b bg-gray-50 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                              {category.name.substring(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{category.name}</p>
                            <p className="text-xs text-gray-500">تصنيف #{category.id}</p>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">القائمة</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => handleEdit(category)}>
                              <Edit className="ml-2 h-4 w-4" />
                              تعديل التصنيف
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Flag className="ml-2 h-4 w-4" />
                              عرض المنح المرتبطة
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDelete(category)}
                              className="text-red-600 focus:bg-red-50 focus:text-red-600"
                            >
                              <Trash2 className="ml-2 h-4 w-4" />
                              حذف التصنيف
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className="p-3 space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">الاسم المختصر:</span>
                          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 font-mono text-xs" dir="ltr">
                            {category.slug}
                          </Badge>
                        </div>
                        <div>
                          <span className="text-gray-500 block mb-1">الوصف:</span>
                          <div className="text-sm text-gray-700">
                            {category.description ? 
                              category.description 
                              : 
                              <span className="text-gray-400 text-sm italic">لا يوجد وصف</span>
                            }
                          </div>
                        </div>
                        <div className="pt-2 flex gap-2 border-t mt-2">
                          <Button size="sm" variant="outline" className="text-xs h-8 flex-1" onClick={() => handleEdit(category)}>
                            <Edit className="ml-1 h-3.5 w-3.5" />
                            تعديل
                          </Button>
                          <Button size="sm" variant="outline" className="text-xs h-8 flex-1 text-red-600 border-red-200" onClick={() => handleDelete(category)}>
                            <Trash2 className="ml-1 h-3.5 w-3.5" />
                            حذف
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 px-6 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                <FolderOpen className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                <h3 className="text-lg font-medium text-gray-800 mb-2">لا توجد تصنيفات حاليًا</h3>
                <p className="text-gray-500 max-w-md mx-auto mb-6">لم يتم إضافة أي تصنيفات بعد. التصنيفات تساعد في تنظيم المنح الدراسية وتسهل على المستخدمين العثور عليها.</p>
                <Button
                  onClick={() => setIsAddDialogOpen(true)}
                  className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600"
                >
                  <PlusCircle className="ml-2 h-4 w-4" />
                  إضافة تصنيف جديد
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        
        {/* نافذة تعديل التصنيف */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="w-[95%] max-w-[500px] rounded-xl p-0 overflow-hidden">
            <DialogHeader className="bg-blue-50/50 px-4 py-3 border-b">
              <DialogTitle className="flex items-center text-blue-700">
                <Edit className="ml-2 h-5 w-5 text-blue-500" />
                تعديل التصنيف
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-600 mt-1">
                قم بتعديل بيانات التصنيف هنا. اضغط على حفظ عند الانتهاء.
              </DialogDescription>
            </DialogHeader>
            {selectedCategory && (
              <div className="p-4">
                <Form {...editForm}>
                  <form onSubmit={editForm.handleSubmit(onSubmitEdit)} className="space-y-4">
                    <FormField
                      control={editForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">اسم التصنيف</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              onChange={handleNameChangeEdit} 
                              placeholder="مثال: دراسات عليا"
                              className="border border-gray-300 focus:border-blue-500 text-sm" 
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={editForm.control}
                      name="slug"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">الاسم المختصر (Slug)</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="مثال: graduate-studies" 
                              dir="ltr"
                              className="border border-gray-300 focus:border-blue-500 font-mono text-sm" 
                            />
                          </FormControl>
                          <FormDescription className="text-xs">
                            سيستخدم هذا في عنوان URL. يجب أن يحتوي على أحرف صغيرة وأرقام وشرطات فقط.
                          </FormDescription>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={editForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">الوصف</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              placeholder="وصف اختياري للتصنيف"
                              className="resize-none min-h-[80px] sm:min-h-[100px] border border-gray-300 focus:border-blue-500 text-sm" 
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                    <DialogFooter className="mt-6 sm:mt-8 gap-3 flex flex-col sm:flex-row sm:justify-end">
                      <Button 
                        type="button" 
                        variant="outline"
                        className="w-full sm:w-auto border-gray-300"
                        onClick={() => setIsEditDialogOpen(false)}
                      >
                        إلغاء
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={updateMutation.isPending} 
                        className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600"
                      >
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
              </div>
            )}
          </DialogContent>
        </Dialog>
        
        {/* نافذة حذف التصنيف */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent className="w-[95%] max-w-[450px] rounded-xl p-0 overflow-hidden">
            <div className="bg-red-50 px-4 py-3 border-b border-red-100">
              <AlertDialogHeader className="p-0 space-y-1">
                <AlertDialogTitle className="text-base text-red-700 font-bold flex items-center">
                  <Trash2 className="ml-2 h-5 w-5 text-red-600" />
                  تأكيد حذف التصنيف
                </AlertDialogTitle>
                <AlertDialogDescription className="text-sm text-red-600">
                  هل أنت متأكد من رغبتك في حذف هذا التصنيف؟ هذا الإجراء لا يمكن التراجع عنه.
                </AlertDialogDescription>
              </AlertDialogHeader>
            </div>
            
            <div className="p-4">
              {selectedCategory && (
                <div className="mb-4 p-3 bg-gray-50 rounded-md border border-gray-200">
                  <div className="flex items-center mb-2">
                    <div className="ml-3 bg-blue-100 text-blue-700 p-2 rounded-full">
                      <FolderOpen className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">{selectedCategory.name}</h4>
                      <p className="text-xs text-gray-500" dir="ltr">{selectedCategory.slug}</p>
                    </div>
                  </div>
                  {selectedCategory.description && (
                    <p className="text-xs text-gray-600 mt-2 border-t border-gray-200 pt-2">
                      {selectedCategory.description}
                    </p>
                  )}
                </div>
              )}
              
              <div className="rounded-md border border-red-100 bg-red-50 p-2 flex items-start">
                <div className="mt-0.5 ml-2 text-red-600">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </div>
                <p className="text-xs text-red-700">
                  ملاحظة: حذف هذا التصنيف قد يؤثر على المنح الدراسية المرتبطة به.
                </p>
              </div>
              
              <AlertDialogFooter className="mt-5 flex-col sm:flex-row gap-2">
                <AlertDialogCancel className="w-full sm:w-1/2 text-sm h-9">إلغاء</AlertDialogCancel>
                <AlertDialogAction
                  onClick={confirmDelete}
                  disabled={deleteMutation.isPending}
                  className="w-full sm:w-1/2 h-9 text-sm bg-red-600 hover:bg-red-700 text-white focus:ring-red-500"
                >
                  {deleteMutation.isPending ? (
                    <>
                      <RefreshCw className="ml-2 h-4 w-4 animate-spin" />
                      جاري الحذف...
                    </>
                  ) : (
                    <>
                      <Trash2 className="ml-2 h-4 w-4" />
                      تأكيد الحذف
                    </>
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
}