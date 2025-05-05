import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusCircle, Edit, Trash2, RefreshCw, Check, X } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import AdminLayout from '@/components/admin/admin-layout';

// زودج سكيما للتحقق من صحة البيانات
const levelSchema = z.object({
  name: z.string().min(2, 'الاسم يجب أن يكون على الأقل حرفين'),
  slug: z.string().min(2, 'الاسم المختصر يجب أن يكون على الأقل حرفين').regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'الاسم المختصر يجب أن يحتوي على أحرف صغيرة وأرقام وشرطات فقط'),
  description: z.string().optional(),
});

type LevelFormValues = z.infer<typeof levelSchema>;

// واجهة للمستوى الدراسي
interface Level {
  id: number;
  name: string;
  slug: string;
  description?: string;
}

export default function LevelsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  // التحقق من تسجيل الدخول
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/admin/login');
    }
  }, [authLoading, isAuthenticated, navigate]);

  // استلام المستويات الدراسية من الخادم
  const { data: levelsResponse, isLoading, isError, refetch } = useQuery<{ success?: boolean, data?: Level[] } | Level[]>({
    queryKey: ['/api/levels'],
    queryFn: async () => {
      const response = await fetch('/api/levels');
      if (!response.ok) throw new Error('فشل في استلام المستويات الدراسية');
      return response.json();
    },
    enabled: isAuthenticated
  });
  
  // تحديد ما إذا كانت البيانات تستخدم الصيغة الجديدة وجلب المصفوفة المناسبة
  const levels = Array.isArray(levelsResponse) 
    ? levelsResponse 
    : levelsResponse?.data || [];

  // إضافة مستوى دراسي جديد
  const addMutation = useMutation({
    mutationFn: async (newLevel: LevelFormValues) => {
      const response = await fetch('/api/levels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLevel),
      });
      if (!response.ok) throw new Error('فشل في إضافة المستوى الدراسي');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/levels'] });
      toast({ title: 'تم الإضافة بنجاح', description: 'تمت إضافة المستوى الدراسي الجديد إلى قاعدة البيانات' });
      setIsAddDialogOpen(false);
    },
    onError: (error) => {
      toast({ title: 'خطأ!', description: `فشل في إضافة المستوى الدراسي: ${error.message}`, variant: 'destructive' });
    }
  });

  // تعديل مستوى دراسي
  const updateMutation = useMutation({
    mutationFn: async (updatedLevel: LevelFormValues & { id: number }) => {
      const { id, ...levelData } = updatedLevel;
      const response = await fetch(`/api/levels/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(levelData),
      });
      if (!response.ok) throw new Error('فشل في تحديث المستوى الدراسي');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/levels'] });
      toast({ title: 'تم التحديث بنجاح', description: 'تم تحديث المستوى الدراسي في قاعدة البيانات' });
      setIsEditDialogOpen(false);
      setSelectedLevel(null);
    },
    onError: (error) => {
      toast({ title: 'خطأ!', description: `فشل في تحديث المستوى الدراسي: ${error.message}`, variant: 'destructive' });
    }
  });

  // حذف مستوى دراسي
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/levels/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('فشل في حذف المستوى الدراسي');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/levels'] });
      toast({ title: 'تم الحذف بنجاح', description: 'تم حذف المستوى الدراسي من قاعدة البيانات' });
      setIsDeleteDialogOpen(false);
      setSelectedLevel(null);
    },
    onError: (error) => {
      toast({ title: 'خطأ!', description: `فشل في حذف المستوى الدراسي: ${error.message}`, variant: 'destructive' });
    }
  });

  // نموذج إضافة مستوى دراسي جديد
  const addForm = useForm<LevelFormValues>({
    resolver: zodResolver(levelSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
    },
  });

  // نموذج تعديل مستوى دراسي
  const editForm = useForm<LevelFormValues>({
    resolver: zodResolver(levelSchema),
    defaultValues: {
      name: selectedLevel?.name || '',
      slug: selectedLevel?.slug || '',
      description: selectedLevel?.description || '',
    },
  });

  // تحديث نموذج التعديل عند تغيير المستوى الدراسي المحدد
  useEffect(() => {
    if (selectedLevel) {
      editForm.reset({
        name: selectedLevel.name,
        slug: selectedLevel.slug,
        description: selectedLevel.description || '',
      });
    }
  }, [selectedLevel, editForm]);

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
  const onSubmitAdd = (data: LevelFormValues) => {
    addMutation.mutate(data);
  };

  // معالجة حدث إرسال نموذج التعديل
  const onSubmitEdit = (data: LevelFormValues) => {
    if (selectedLevel) {
      updateMutation.mutate({ ...data, id: selectedLevel.id });
    }
  };

  // تحضير المستوى الدراسي للتعديل
  const handleEdit = (level: Level) => {
    setSelectedLevel(level);
    setIsEditDialogOpen(true);
  };

  // تحضير المستوى الدراسي للحذف
  const handleDelete = (level: Level) => {
    setSelectedLevel(level);
    setIsDeleteDialogOpen(true);
  };

  // تأكيد الحذف
  const confirmDelete = () => {
    if (selectedLevel) {
      deleteMutation.mutate(selectedLevel.id);
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

  // أزرار إجراءات صفحة المستويات الدراسية
  const levelsActions = (
    <div className="flex gap-2">
      <Button variant="outline" onClick={() => refetch()}>
        <RefreshCw className="ml-2 h-4 w-4" />
        تحديث
      </Button>
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogTrigger asChild>
          <Button>
            <PlusCircle className="ml-2 h-4 w-4" />
            إضافة مستوى
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>إضافة مستوى دراسي جديد</DialogTitle>
            <DialogDescription>
              أضف مستوى دراسي جديد للمنح هنا. اضغط على حفظ عند الانتهاء.
            </DialogDescription>
          </DialogHeader>
          <Form {...addForm}>
            <form onSubmit={addForm.handleSubmit(onSubmitAdd)} className="space-y-4">
              <FormField
                control={addForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>اسم المستوى</FormLabel>
                    <FormControl>
                      <Input {...field} onChange={handleNameChangeAdd} placeholder="مثال: دكتوراه" />
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
                      <Input {...field} placeholder="مثال: doctorate" dir="ltr" />
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
                      <Textarea {...field} placeholder="وصف اختياري للمستوى الدراسي" />
                    </FormControl>
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
    <AdminLayout title="إدارة المستويات الدراسية" actions={levelsActions}>
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>قائمة المستويات الدراسية</CardTitle>
          <CardDescription>
            جميع المستويات الدراسية المتوفرة في الموقع
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
          ) : levels && levels.length > 0 ? (
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12 text-right">الرقم</TableHead>
                    <TableHead className="text-right">الاسم</TableHead>
                    <TableHead className="text-right">الاسم المختصر</TableHead>
                    <TableHead className="text-right">الوصف</TableHead>
                    <TableHead className="text-left w-[120px]">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {levels.map((level) => (
                    <TableRow key={level.id}>
                      <TableCell>{level.id}</TableCell>
                      <TableCell className="font-medium">{level.name}</TableCell>
                      <TableCell dir="ltr">{level.slug}</TableCell>
                      <TableCell>{level.description || "—"}</TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button size="icon" variant="ghost" onClick={() => handleEdit(level)}>
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">تعديل</span>
                          </Button>
                          <Button size="icon" variant="ghost" className="text-red-500" onClick={() => handleDelete(level)}>
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
              <p>لا توجد مستويات دراسية حاليًا.</p>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(true)} className="mt-2">
                إضافة مستوى دراسي جديد
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* نافذة تعديل المستوى الدراسي */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>تعديل المستوى الدراسي</DialogTitle>
            <DialogDescription>
              قم بتعديل بيانات المستوى الدراسي هنا. اضغط على حفظ عند الانتهاء.
            </DialogDescription>
          </DialogHeader>
          {selectedLevel && (
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(onSubmitEdit)} className="space-y-4">
                <FormField
                  control={editForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>اسم المستوى</FormLabel>
                      <FormControl>
                        <Input {...field} onChange={handleNameChangeEdit} placeholder="مثال: دكتوراه" />
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
                        <Input {...field} placeholder="مثال: doctorate" dir="ltr" />
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
                        <Textarea {...field} placeholder="وصف اختياري للمستوى الدراسي" />
                      </FormControl>
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
              سيتم حذف المستوى الدراسي "{selectedLevel?.name}" بشكل نهائي. 
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
    </AdminLayout>
  );
}