import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusCircle, Edit, Trash2, RefreshCw, Check, X, Menu as MenuIcon, MoveUp, MoveDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import AdminLayout from '@/components/admin/admin-layout';

// زودج سكيما للتحقق من صحة البيانات
const menuItemSchema = z.object({
  id: z.number().optional(),
  title: z.string().min(1, 'عنوان العنصر مطلوب'),
  url: z.string().min(1, 'الرابط مطلوب'),
  parentId: z.number().nullable(),
  order: z.number().min(0),
  isExternal: z.boolean().default(false),
  location: z.enum(['main', 'footer', 'mobile']),
  isActive: z.boolean().default(true),
});

type MenuItemFormValues = z.infer<typeof menuItemSchema>;

// واجهة لعنصر القائمة
interface MenuItem {
  id: number;
  title: string;
  url: string;
  parentId: number | null;
  order: number;
  isExternal: boolean;
  location: 'main' | 'footer' | 'mobile';
  isActive: boolean;
}

export default function MenusPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null);
  const [activeTab, setActiveTab] = useState<'main' | 'footer' | 'mobile'>('main');
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  // التحقق من تسجيل الدخول
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/admin/login');
    }
  }, [authLoading, isAuthenticated, navigate]);

  // استلام عناصر القوائم
  const { data: menuItems, isLoading, isError, refetch } = useQuery<MenuItem[]>({
    queryKey: ['/api/menu-items'],
    queryFn: async () => {
      try {
        // سنضيف نقطة نهاية API لاحقًا - في الوقت الحالي استخدم بيانات تجريبية للتطوير
        // const response = await fetch('/api/menu-items');
        // if (!response.ok) throw new Error('فشل في استلام عناصر القائمة');
        // return response.json();
        
        // بيانات تجريبية للعرض أثناء التطوير
        return [
          { id: 1, title: 'الرئيسية', url: '/', parentId: null, order: 0, isExternal: false, location: 'main', isActive: true },
          { id: 2, title: 'المنح الدراسية', url: '/scholarships', parentId: null, order: 1, isExternal: false, location: 'main', isActive: true },
          { id: 3, title: 'المقالات', url: '/articles', parentId: null, order: 2, isExternal: false, location: 'main', isActive: true },
          { id: 4, title: 'من نحن', url: '/about', parentId: null, order: 3, isExternal: false, location: 'main', isActive: true },
          { id: 5, title: 'اتصل بنا', url: '/contact', parentId: null, order: 4, isExternal: false, location: 'main', isActive: true },
          { id: 6, title: 'الرئيسية', url: '/', parentId: null, order: 0, isExternal: false, location: 'footer', isActive: true },
          { id: 7, title: 'الشروط والأحكام', url: '/terms', parentId: null, order: 1, isExternal: false, location: 'footer', isActive: true },
          { id: 8, title: 'سياسة الخصوصية', url: '/privacy', parentId: null, order: 2, isExternal: false, location: 'footer', isActive: true },
          { id: 9, title: 'تويتر', url: 'https://twitter.com', parentId: null, order: 3, isExternal: true, location: 'footer', isActive: true },
          { id: 10, title: 'فيسبوك', url: 'https://facebook.com', parentId: null, order: 4, isExternal: true, location: 'footer', isActive: true },
        ] as MenuItem[];
      } catch (error) {
        console.error('Error fetching menu items:', error);
        throw error;
      }
    },
    enabled: isAuthenticated,
  });

  // فلترة العناصر حسب موقع القائمة
  const filteredMenuItems = menuItems?.filter(item => item.location === activeTab) || [];
  
  // ترتيب العناصر حسب الترتيب ثم العنوان
  const sortedMenuItems = [...filteredMenuItems].sort((a, b) => {
    // ترتيب العناصر الأب أولاً
    if (a.parentId === null && b.parentId !== null) return -1;
    if (a.parentId !== null && b.parentId === null) return 1;
    
    // ثم ترتيب حسب خاصية الترتيب
    if (a.order !== b.order) return a.order - b.order;
    
    // ثم ترتيب أبجدي
    return a.title.localeCompare(b.title);
  });

  // الحصول على قائمة بالعناصر الأب المتاحة
  const parentItems = menuItems?.filter(item => 
    item.parentId === null && item.location === activeTab
  ) || [];

  // إضافة عنصر قائمة جديد
  const addMutation = useMutation({
    mutationFn: async (newMenuItem: Omit<MenuItemFormValues, 'id'>) => {
      // سيتم إضافة نقطة نهاية API لاحقًا
      // const response = await fetch('/api/menu-items', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(newMenuItem),
      // });
      // if (!response.ok) throw new Error('فشل في إضافة عنصر القائمة');
      // return response.json();
      
      // محاكاة استجابة API
      const id = Math.max(0, ...menuItems?.map(item => item.id) || []) + 1;
      return { ...newMenuItem, id } as MenuItem;
    },
    onSuccess: (newItem) => {
      queryClient.setQueryData(['/api/menu-items'], (old: MenuItem[] | undefined) => 
        [...(old || []), newItem]
      );
      toast({ title: 'تم الإضافة بنجاح', description: 'تمت إضافة عنصر القائمة الجديد بنجاح' });
      setIsAddDialogOpen(false);
    },
    onError: (error) => {
      toast({ title: 'خطأ!', description: `فشل في إضافة عنصر القائمة: ${error.message}`, variant: 'destructive' });
    }
  });

  // تعديل عنصر قائمة
  const updateMutation = useMutation({
    mutationFn: async (updatedMenuItem: MenuItemFormValues) => {
      // سيتم إضافة نقطة نهاية API لاحقًا
      // const { id, ...itemData } = updatedMenuItem;
      // const response = await fetch(`/api/menu-items/${id}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(itemData),
      // });
      // if (!response.ok) throw new Error('فشل في تحديث عنصر القائمة');
      // return response.json();
      
      // محاكاة استجابة API
      return updatedMenuItem as MenuItem;
    },
    onSuccess: (updatedItem) => {
      queryClient.setQueryData(['/api/menu-items'], (old: MenuItem[] | undefined) => 
        (old || []).map(item => item.id === updatedItem.id ? updatedItem : item)
      );
      toast({ title: 'تم التحديث بنجاح', description: 'تم تحديث عنصر القائمة بنجاح' });
      setIsEditDialogOpen(false);
      setSelectedMenuItem(null);
    },
    onError: (error) => {
      toast({ title: 'خطأ!', description: `فشل في تحديث عنصر القائمة: ${error.message}`, variant: 'destructive' });
    }
  });

  // حذف عنصر قائمة
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      // سيتم إضافة نقطة نهاية API لاحقًا
      // const response = await fetch(`/api/menu-items/${id}`, {
      //   method: 'DELETE',
      // });
      // if (!response.ok) throw new Error('فشل في حذف عنصر القائمة');
      // return response.json();
      
      // محاكاة استجابة API
      return { success: true, id };
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['/api/menu-items'], (old: MenuItem[] | undefined) => 
        (old || []).filter(item => item.id !== data.id)
      );
      toast({ title: 'تم الحذف بنجاح', description: 'تم حذف عنصر القائمة بنجاح' });
      setIsDeleteDialogOpen(false);
      setSelectedMenuItem(null);
    },
    onError: (error) => {
      toast({ title: 'خطأ!', description: `فشل في حذف عنصر القائمة: ${error.message}`, variant: 'destructive' });
    }
  });

  // تغيير ترتيب عنصر قائمة (تحريك للأعلى أو الأسفل)
  const moveItemMutation = useMutation({
    mutationFn: async ({ id, direction }: { id: number, direction: 'up' | 'down' }) => {
      // سيتم إضافة نقطة نهاية API لاحقًا
      // const response = await fetch(`/api/menu-items/${id}/move`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ direction }),
      // });
      // if (!response.ok) throw new Error('فشل في تغيير ترتيب عنصر القائمة');
      // return response.json();
      
      // محاكاة عملية إعادة الترتيب محليًا
      const item = menuItems?.find(item => item.id === id);
      if (!item) throw new Error('عنصر القائمة غير موجود');
      
      const sameLocationAndParent = menuItems?.filter(
        i => i.location === item.location && i.parentId === item.parentId
      ) || [];
      
      const sortedItems = [...sameLocationAndParent].sort((a, b) => a.order - b.order);
      const currentIndex = sortedItems.findIndex(i => i.id === id);
      
      if (direction === 'up' && currentIndex > 0) {
        const itemToSwap = sortedItems[currentIndex - 1];
        return [
          { ...item, order: itemToSwap.order },
          { ...itemToSwap, order: item.order }
        ] as MenuItem[];
      }
      
      if (direction === 'down' && currentIndex < sortedItems.length - 1) {
        const itemToSwap = sortedItems[currentIndex + 1];
        return [
          { ...item, order: itemToSwap.order },
          { ...itemToSwap, order: item.order }
        ] as MenuItem[];
      }
      
      throw new Error('لا يمكن تحريك العنصر في هذا الاتجاه');
    },
    onSuccess: (updatedItems) => {
      queryClient.setQueryData(['/api/menu-items'], (old: MenuItem[] | undefined) => {
        const items = [...(old || [])];
        updatedItems.forEach(updatedItem => {
          const index = items.findIndex(item => item.id === updatedItem.id);
          if (index !== -1) {
            items[index] = updatedItem;
          }
        });
        return items;
      });
      
      toast({ title: 'تم التحديث', description: 'تم تغيير ترتيب العنصر بنجاح' });
    },
    onError: (error) => {
      toast({ title: 'خطأ!', description: `فشل في تغيير ترتيب العنصر: ${error.message}`, variant: 'destructive' });
    }
  });

  // نموذج إضافة عنصر قائمة جديد
  const addForm = useForm<MenuItemFormValues>({
    resolver: zodResolver(menuItemSchema.omit({ id: true })),
    defaultValues: {
      title: '',
      url: '',
      parentId: null,
      order: 0,
      isExternal: false,
      location: activeTab,
      isActive: true,
    },
  });

  // نموذج تعديل عنصر قائمة
  const editForm = useForm<MenuItemFormValues>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      id: selectedMenuItem?.id,
      title: selectedMenuItem?.title || '',
      url: selectedMenuItem?.url || '',
      parentId: selectedMenuItem?.parentId,
      order: selectedMenuItem?.order || 0,
      isExternal: selectedMenuItem?.isExternal || false,
      location: selectedMenuItem?.location || 'main',
      isActive: selectedMenuItem?.isActive || true,
    },
  });

  // تحديث نموذج التعديل عند تغيير العنصر المحدد
  useEffect(() => {
    if (selectedMenuItem) {
      editForm.reset({
        id: selectedMenuItem.id,
        title: selectedMenuItem.title,
        url: selectedMenuItem.url,
        parentId: selectedMenuItem.parentId,
        order: selectedMenuItem.order,
        isExternal: selectedMenuItem.isExternal,
        location: selectedMenuItem.location,
        isActive: selectedMenuItem.isActive,
      });
    }
  }, [selectedMenuItem, editForm]);

  // إعادة ضبط نموذج الإضافة عند فتح نافذة الإضافة
  useEffect(() => {
    if (isAddDialogOpen) {
      // تحديد آخر ترتيب زائد واحد للعناصر في نفس المستوى
      const maxOrder = Math.max(0, ...(filteredMenuItems.map(item => item.order) || []));
      
      addForm.reset({
        title: '',
        url: '',
        parentId: null,
        order: maxOrder + 1,
        isExternal: false,
        location: activeTab,
        isActive: true,
      });
    }
  }, [isAddDialogOpen, addForm, activeTab, filteredMenuItems]);

  // تحديث حقل الموقع في نموذج الإضافة عند تغيير التبويب النشط
  useEffect(() => {
    addForm.setValue('location', activeTab);
  }, [activeTab, addForm]);

  // معالجة حدث إرسال نموذج الإضافة
  const onSubmitAdd = (data: MenuItemFormValues) => {
    addMutation.mutate(data);
  };

  // معالجة حدث إرسال نموذج التعديل
  const onSubmitEdit = (data: MenuItemFormValues) => {
    updateMutation.mutate(data);
  };

  // تحضير العنصر للتعديل
  const handleEdit = (item: MenuItem) => {
    setSelectedMenuItem(item);
    setIsEditDialogOpen(true);
  };

  // تحضير العنصر للحذف
  const handleDelete = (item: MenuItem) => {
    setSelectedMenuItem(item);
    setIsDeleteDialogOpen(true);
  };

  // تأكيد الحذف
  const confirmDelete = () => {
    if (selectedMenuItem) {
      deleteMutation.mutate(selectedMenuItem.id);
    }
  };

  // تحريك عنصر للأعلى
  const moveItemUp = (id: number) => {
    moveItemMutation.mutate({ id, direction: 'up' });
  };

  // تحريك عنصر للأسفل
  const moveItemDown = (id: number) => {
    moveItemMutation.mutate({ id, direction: 'down' });
  };

  // تغيير مستوى العنصر (للأعلى/للأسفل في التسلسل الهرمي)
  const changeHierarchyLevel = (item: MenuItem, makeParent: boolean) => {
    const updatedItem = { ...item };
    
    if (makeParent) {
      // تحويل العنصر إلى عنصر رئيسي
      updatedItem.parentId = null;
    } else {
      // البحث عن عنصر للتعيين كأب
      const potentialParents = menuItems?.filter(i => 
        i.location === item.location && 
        i.id !== item.id && 
        i.parentId === null
      ) || [];
      
      if (potentialParents.length > 0) {
        updatedItem.parentId = potentialParents[0].id;
      }
    }
    
    updateMutation.mutate(updatedItem);
  };

  // في حالة تحميل بيانات المصادقة أو عدم تسجيل الدخول
  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        جاري التحميل...
      </div>
    );
  }

  const actions = (
    <>
      <Button variant="outline" onClick={() => refetch()}>
        <RefreshCw className="ml-2 h-4 w-4" />
        تحديث
      </Button>
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogTrigger asChild>
          <Button>
            <PlusCircle className="ml-2 h-4 w-4" />
            إضافة رابط
          </Button>
        </DialogTrigger>
      </Dialog>
    </>
  );

  return (
    <AdminLayout title="إدارة القوائم والروابط" actions={actions}>
      <div className="p-4 md:p-6">
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>إضافة عنصر قائمة جديد</DialogTitle>
                    <DialogDescription>
                      أضف رابطاً جديداً إلى القائمة المحددة. اضغط على حفظ عند الانتهاء.
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...addForm}>
                    <form onSubmit={addForm.handleSubmit(onSubmitAdd)} className="space-y-4">
                      <FormField
                        control={addForm.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>عنوان الرابط</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="مثال: الرئيسية" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={addForm.control}
                        name="url"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>الرابط</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="مثال: /about أو https://example.com" dir="ltr" />
                            </FormControl>
                            <FormDescription>
                              أدخل / في البداية للروابط الداخلية، وأدخل الرابط كاملاً للروابط الخارجية
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={addForm.control}
                        name="isExternal"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <FormLabel>فتح في نافذة جديدة</FormLabel>
                              <FormDescription>
                                هل هذا رابط خارجي يفتح في نافذة جديدة؟
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
                      <FormField
                        control={addForm.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>موقع القائمة</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="اختر موقع القائمة" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="main">القائمة الرئيسية</SelectItem>
                                <SelectItem value="footer">قائمة التذييل</SelectItem>
                                <SelectItem value="mobile">قائمة الجوال</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              حدد أين سيظهر هذا الرابط في الموقع
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={addForm.control}
                        name="parentId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>العنصر الأب (اختياري)</FormLabel>
                            <Select
                              onValueChange={val => field.onChange(val ? parseInt(val) : null)}
                              value={field.value?.toString() || ""}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="بدون أب (عنصر رئيسي)" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="null">بدون أب (عنصر رئيسي)</SelectItem>
                                {parentItems.map(item => (
                                  <SelectItem key={item.id} value={item.id.toString()}>
                                    {item.title}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              اختر العنصر الأب لإنشاء قائمة متعددة المستويات
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={addForm.control}
                        name="order"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>الترتيب</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="number"
                                min="0"
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                              />
                            </FormControl>
                            <FormDescription>
                              رقم ترتيب العنصر (الأصغر يظهر أولاً)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={addForm.control}
                        name="isActive"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <FormLabel>تفعيل العنصر</FormLabel>
                              <FormDescription>
                                هل هذا العنصر مفعل ومرئي في الموقع؟
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

          <Tabs defaultValue="main" onValueChange={(value) => setActiveTab(value as 'main' | 'footer' | 'mobile')}>
            <TabsList className="mb-6">
              <TabsTrigger value="main">القائمة الرئيسية</TabsTrigger>
              <TabsTrigger value="footer">قائمة التذييل</TabsTrigger>
              <TabsTrigger value="mobile">قائمة الجوال</TabsTrigger>
            </TabsList>
            
            <TabsContent value="main">
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle>القائمة الرئيسية</CardTitle>
                  <CardDescription>
                    إدارة روابط القائمة الرئيسية في أعلى الموقع
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {renderMenuItemsTable('main')}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="footer">
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle>قائمة التذييل</CardTitle>
                  <CardDescription>
                    إدارة روابط قائمة التذييل في أسفل الموقع
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {renderMenuItemsTable('footer')}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="mobile">
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle>قائمة الجوال</CardTitle>
                  <CardDescription>
                    إدارة روابط قائمة الجوال للشاشات الصغيرة
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {renderMenuItemsTable('mobile')}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* نافذة تعديل عنصر القائمة */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>تعديل عنصر القائمة</DialogTitle>
                <DialogDescription>
                  قم بتعديل تفاصيل عنصر القائمة. اضغط على حفظ عند الانتهاء.
                </DialogDescription>
              </DialogHeader>
              {selectedMenuItem && (
                <Form {...editForm}>
                  <form onSubmit={editForm.handleSubmit(onSubmitEdit)} className="space-y-4">
                    <FormField
                      control={editForm.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>عنوان الرابط</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="مثال: الرئيسية" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={editForm.control}
                      name="url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>الرابط</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="مثال: /about أو https://example.com" dir="ltr" />
                          </FormControl>
                          <FormDescription>
                            أدخل / في البداية للروابط الداخلية، وأدخل الرابط كاملاً للروابط الخارجية
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={editForm.control}
                      name="isExternal"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>فتح في نافذة جديدة</FormLabel>
                            <FormDescription>
                              هل هذا رابط خارجي يفتح في نافذة جديدة؟
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
                    <FormField
                      control={editForm.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>موقع القائمة</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="اختر موقع القائمة" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="main">القائمة الرئيسية</SelectItem>
                              <SelectItem value="footer">قائمة التذييل</SelectItem>
                              <SelectItem value="mobile">قائمة الجوال</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            حدد أين سيظهر هذا الرابط في الموقع
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={editForm.control}
                      name="parentId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>العنصر الأب (اختياري)</FormLabel>
                          <Select
                            onValueChange={val => field.onChange(val ? parseInt(val) : null)}
                            value={field.value?.toString() || ""}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="بدون أب (عنصر رئيسي)" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="null">بدون أب (عنصر رئيسي)</SelectItem>
                              {parentItems
                                .filter(item => item.id !== selectedMenuItem.id) // منع اختيار نفس العنصر كأب
                                .map(item => (
                                  <SelectItem key={item.id} value={item.id.toString()}>
                                    {item.title}
                                  </SelectItem>
                                ))
                              }
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            اختر العنصر الأب لإنشاء قائمة متعددة المستويات
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={editForm.control}
                      name="order"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>الترتيب</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              min="0"
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>
                            رقم ترتيب العنصر (الأصغر يظهر أولاً)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={editForm.control}
                      name="isActive"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>تفعيل العنصر</FormLabel>
                            <FormDescription>
                              هل هذا العنصر مفعل ومرئي في الموقع؟
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
                  سيتم حذف عنصر القائمة "{selectedMenuItem?.title}" بشكل نهائي. 
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
      </div>
    </AdminLayout>
  );

  // عرض جدول العناصر حسب نوع القائمة
  function renderMenuItemsTable(location: 'main' | 'footer' | 'mobile') {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-32">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span className="mr-2">جاري التحميل...</span>
        </div>
      );
    }
    
    if (isError) {
      return (
        <div className="text-center py-4 text-red-500">
          <p>حدث خطأ أثناء تحميل البيانات. يرجى المحاولة مرة أخرى.</p>
          <Button variant="outline" onClick={() => refetch()} className="mt-2">
            إعادة المحاولة
          </Button>
        </div>
      );
    }
    
    const locationItems = sortedMenuItems.filter(item => item.location === location);
    
    if (locationItems.length === 0) {
      return (
        <div className="text-center py-6 text-muted-foreground">
          <p>لا توجد عناصر في هذه القائمة حاليًا.</p>
          <Button variant="outline" onClick={() => setIsAddDialogOpen(true)} className="mt-2">
            إضافة عنصر قائمة جديد
          </Button>
        </div>
      );
    }
    
    return (
      <div className="overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12 text-right">الترتيب</TableHead>
              <TableHead className="text-right">العنوان</TableHead>
              <TableHead className="text-right">الرابط</TableHead>
              <TableHead className="text-right">المستوى</TableHead>
              <TableHead className="text-right">الحالة</TableHead>
              <TableHead className="text-left w-[200px]">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {locationItems.map((item) => (
              <TableRow key={item.id} className={item.isActive ? '' : 'opacity-60'}>
                <TableCell>{item.order}</TableCell>
                <TableCell className="font-medium">
                  {item.parentId && <span className="mr-4">↳</span>}
                  {item.title}
                </TableCell>
                <TableCell className={item.isExternal ? 'text-blue-600' : ''} dir="ltr">
                  {item.url}
                  {item.isExternal && <span className="mr-1 text-xs">(خارجي)</span>}
                </TableCell>
                <TableCell>
                  {item.parentId === null ? 'رئيسي' : 'فرعي'}
                </TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${item.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {item.isActive ? 'مفعل' : 'معطل'}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      onClick={() => moveItemUp(item.id)}
                      disabled={moveItemMutation.isPending}
                      title="تحريك لأعلى"
                    >
                      <MoveUp className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      onClick={() => moveItemDown(item.id)}
                      disabled={moveItemMutation.isPending}
                      title="تحريك لأسفل"
                    >
                      <MoveDown className="h-4 w-4" />
                    </Button>
                    {item.parentId !== null && (
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={() => changeHierarchyLevel(item, true)}
                        disabled={updateMutation.isPending}
                        title="رفع للمستوى الرئيسي"
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </Button>
                    )}
                    {item.parentId === null && (
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={() => changeHierarchyLevel(item, false)}
                        disabled={updateMutation.isPending || parentItems.length <= 1}
                        title="جعل كعنصر فرعي"
                      >
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    )}
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      onClick={() => handleEdit(item)}
                      title="تعديل"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="text-red-500" 
                      onClick={() => handleDelete(item)}
                      title="حذف"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }
}