import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusCircle, Edit, Trash2, RefreshCw, Check, X } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import AdminLayout from '@/components/admin/admin-layout';

// زودج سكيما للتحقق من صحة البيانات
const countrySchema = z.object({
  name: z.string().min(2, 'الاسم يجب أن يكون على الأقل حرفين'),
  slug: z.string().min(2, 'الاسم المختصر يجب أن يكون على الأقل حرفين').regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'الاسم المختصر يجب أن يحتوي على أحرف صغيرة وأرقام وشرطات فقط'),
  description: z.string().optional(),
  flagUrl: z.string().url('يجب أن يكون رابط صالح').optional().or(z.literal('')),
});

type CountryFormValues = z.infer<typeof countrySchema>;

// واجهة للدولة
interface Country {
  id: number;
  name: string;
  slug: string;
  description?: string;
  flagUrl?: string;
}

export default function CountriesPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  // التحقق من تسجيل الدخول
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/admin/login');
    }
  }, [authLoading, isAuthenticated, navigate]);

  // استلام الدول من الخادم
  const { data: countriesResponse, isLoading, isError, refetch } = useQuery<{ success?: boolean, data?: Country[] } | Country[]>({
    queryKey: ['/api/countries'],
    queryFn: async () => {
      const response = await fetch('/api/countries');
      if (!response.ok) throw new Error('فشل في استلام الدول');
      return response.json();
    },
    enabled: isAuthenticated
  });
  
  // تحديد ما إذا كانت البيانات تستخدم الصيغة الجديدة وجلب المصفوفة المناسبة
  const countries = Array.isArray(countriesResponse) 
    ? countriesResponse 
    : countriesResponse?.data || [];

  // إضافة دولة جديدة
  const addMutation = useMutation({
    mutationFn: async (newCountry: CountryFormValues) => {
      // تنظيف البيانات - إزالة القيم الفارغة
      const cleanedData = { ...newCountry };
      if (!cleanedData.flagUrl) delete cleanedData.flagUrl;
      if (!cleanedData.description) delete cleanedData.description;

      const response = await fetch('/api/countries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanedData),
      });
      if (!response.ok) throw new Error('فشل في إضافة الدولة');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/countries'] });
      toast({ title: 'تم الإضافة بنجاح', description: 'تمت إضافة الدولة الجديدة إلى قاعدة البيانات' });
      setIsAddDialogOpen(false);
    },
    onError: (error) => {
      toast({ title: 'خطأ!', description: `فشل في إضافة الدولة: ${error.message}`, variant: 'destructive' });
    }
  });

  // تعديل دولة
  const updateMutation = useMutation({
    mutationFn: async (updatedCountry: CountryFormValues & { id: number }) => {
      const { id, ...countryData } = updatedCountry;
      
      // تنظيف البيانات - إزالة القيم الفارغة
      const cleanedData = { ...countryData };
      if (!cleanedData.flagUrl) delete cleanedData.flagUrl;
      if (!cleanedData.description) delete cleanedData.description;

      const response = await fetch(`/api/countries/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanedData),
      });
      if (!response.ok) throw new Error('فشل في تحديث الدولة');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/countries'] });
      toast({ title: 'تم التحديث بنجاح', description: 'تم تحديث الدولة في قاعدة البيانات' });
      setIsEditDialogOpen(false);
      setSelectedCountry(null);
    },
    onError: (error) => {
      toast({ title: 'خطأ!', description: `فشل في تحديث الدولة: ${error.message}`, variant: 'destructive' });
    }
  });

  // حذف دولة
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/countries/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('فشل في حذف الدولة');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/countries'] });
      toast({ title: 'تم الحذف بنجاح', description: 'تم حذف الدولة من قاعدة البيانات' });
      setIsDeleteDialogOpen(false);
      setSelectedCountry(null);
    },
    onError: (error) => {
      toast({ title: 'خطأ!', description: `فشل في حذف الدولة: ${error.message}`, variant: 'destructive' });
    }
  });

  // نموذج إضافة دولة جديدة
  const addForm = useForm<CountryFormValues>({
    resolver: zodResolver(countrySchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      flagUrl: '',
    },
  });

  // نموذج تعديل دولة
  const editForm = useForm<CountryFormValues>({
    resolver: zodResolver(countrySchema),
    defaultValues: {
      name: selectedCountry?.name || '',
      slug: selectedCountry?.slug || '',
      description: selectedCountry?.description || '',
      flagUrl: selectedCountry?.flagUrl || '',
    },
  });

  // تحديث نموذج التعديل عند تغيير الدولة المحددة
  useEffect(() => {
    if (selectedCountry) {
      editForm.reset({
        name: selectedCountry.name,
        slug: selectedCountry.slug,
        description: selectedCountry.description || '',
        flagUrl: selectedCountry.flagUrl || '',
      });
    }
  }, [selectedCountry, editForm]);

  // إعادة ضبط نموذج الإضافة عند فتح نافذة الإضافة
  useEffect(() => {
    if (isAddDialogOpen) {
      addForm.reset({
        name: '',
        slug: '',
        description: '',
        flagUrl: '',
      });
    }
  }, [isAddDialogOpen, addForm]);

  // معالجة حدث إرسال نموذج الإضافة
  const onSubmitAdd = (data: CountryFormValues) => {
    addMutation.mutate(data);
  };

  // معالجة حدث إرسال نموذج التعديل
  const onSubmitEdit = (data: CountryFormValues) => {
    if (selectedCountry) {
      updateMutation.mutate({ ...data, id: selectedCountry.id });
    }
  };

  // تحضير الدولة للتعديل
  const handleEdit = (country: Country) => {
    setSelectedCountry(country);
    setIsEditDialogOpen(true);
  };

  // تحضير الدولة للحذف
  const handleDelete = (country: Country) => {
    setSelectedCountry(country);
    setIsDeleteDialogOpen(true);
  };

  // تأكيد الحذف
  const confirmDelete = () => {
    if (selectedCountry) {
      deleteMutation.mutate(selectedCountry.id);
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

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        جاري التحميل...
      </div>
    );
  }

  // أزرار الإجراءات
  const actionButtons = (
    <div className="flex gap-2">
      <Button variant="outline" onClick={() => refetch()}>
        <RefreshCw className="ml-2 h-4 w-4" />
        تحديث
      </Button>
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogTrigger asChild>
          <Button>
            <PlusCircle className="ml-2 h-4 w-4" />
            إضافة دولة
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>إضافة دولة جديدة</DialogTitle>
            <DialogDescription>
              أضف دولة جديدة للمنح هنا. اضغط على حفظ عند الانتهاء.
            </DialogDescription>
          </DialogHeader>
          <Form {...addForm}>
            <form onSubmit={addForm.handleSubmit(onSubmitAdd)} className="space-y-4">
              <FormField
                control={addForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>اسم الدولة</FormLabel>
                    <FormControl>
                      <Input {...field} onChange={handleNameChangeAdd} placeholder="مثال: المملكة المتحدة" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={addForm.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الاسم المختصر (Slug)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="مثال: uk" dir="ltr" />
                    </FormControl>
                    <FormDescription>
                      سيستخدم هذا في عنوان URL. يجب أن يحتوي على أحرف صغيرة وأرقام وشرطات فقط.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={addForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الوصف</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="وصف اختياري للدولة" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={addForm.control}
                name="flagUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رابط العلم</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="https://..." dir="ltr" />
                    </FormControl>
                    <FormDescription>
                      أدخل رابط لصورة علم الدولة (اختياري)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
  );

  return (
    <AdminLayout title="إدارة الدول">
      {/* رأس الصفحة والأزرار */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-semibold">قائمة الدول</h2>
        {actionButtons}
      </div>

      {/* جدول الدول */}
      <Card>
        <CardHeader>
          <CardTitle>الدول</CardTitle>
          <CardDescription>
            جميع الدول المتوفرة في الموقع للمنح الدراسية
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
          ) : countries && countries.length > 0 ? (
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12 text-right">الرقم</TableHead>
                    <TableHead className="w-16 text-right">العلم</TableHead>
                    <TableHead className="text-right">الاسم</TableHead>
                    <TableHead className="text-right">الاسم المختصر</TableHead>
                    <TableHead className="text-right">الوصف</TableHead>
                    <TableHead className="text-left w-[120px]">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {countries.map((country) => (
                    <TableRow key={country.id}>
                      <TableCell>{country.id}</TableCell>
                      <TableCell>
                        {country.flagUrl ? (
                          <img 
                            src={country.flagUrl} 
                            alt={`علم ${country.name}`} 
                            className="w-8 h-6 object-cover rounded border"
                          />
                        ) : (
                          <div className="w-8 h-6 bg-muted rounded border flex items-center justify-center text-xs">
                            ?
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{country.name}</TableCell>
                      <TableCell dir="ltr">{country.slug}</TableCell>
                      <TableCell>{country.description || "—"}</TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button size="icon" variant="ghost" onClick={() => handleEdit(country)}>
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">تعديل</span>
                          </Button>
                          <Button size="icon" variant="ghost" className="text-red-500" onClick={() => handleDelete(country)}>
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
              <p>لا توجد دول حاليًا.</p>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(true)} className="mt-2">
                إضافة دولة جديدة
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* نافذة تعديل الدولة */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>تعديل الدولة</DialogTitle>
            <DialogDescription>
              قم بتعديل بيانات الدولة هنا. اضغط على حفظ عند الانتهاء.
            </DialogDescription>
          </DialogHeader>
          {selectedCountry && (
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(onSubmitEdit)} className="space-y-4">
                <FormField
                  control={editForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>اسم الدولة</FormLabel>
                      <FormControl>
                        <Input {...field} onChange={handleNameChangeEdit} placeholder="مثال: المملكة المتحدة" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الاسم المختصر (Slug)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="مثال: uk" dir="ltr" />
                      </FormControl>
                      <FormDescription>
                        سيستخدم هذا في عنوان URL. يجب أن يحتوي على أحرف صغيرة وأرقام وشرطات فقط.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الوصف</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="وصف اختياري للدولة" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="flagUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>رابط العلم</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="https://..." dir="ltr" />
                      </FormControl>
                      <FormDescription>
                        أدخل رابط لصورة علم الدولة (اختياري)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                        حفظ
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>

      {/* مربع حوار تأكيد الحذف */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedCountry && `سيتم حذف "${selectedCountry.name}" نهائيًا. هذا الإجراء لا يمكن التراجع عنه.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-500 hover:bg-red-600">
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
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}