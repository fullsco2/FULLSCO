import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusCircle, Edit, Trash2, RefreshCw, Check, X, Menu as MenuIcon, ListPlus, FolderPlus, ArrowDownToLine, ArrowLeft, ArrowRight, LinkIcon, Globe, LayoutDashboard, BookOpen, GraduationCap, FileBadge, ChevronDown, TriangleAlert, Eye, MoveUp, MoveDown } from 'lucide-react';
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import Sidebar from '@/components/admin/sidebar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import { useMenus, useMenuByLocation, useMenuStructure, useMenuItems, useMenuItemsWithDetails } from '@/hooks/use-menu';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { usePages } from '@/hooks/use-pages';
import { useCategories } from '@/hooks/use-categories';
import { useLevels } from '@/hooks/use-levels';
import { useCountries } from '@/hooks/use-countries';
import { Checkbox } from '@/components/ui/checkbox';

// زودج سكيما للتحقق من صحة بيانات القائمة
const menuSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, 'اسم القائمة مطلوب'),
  slug: z.string().min(1, 'المعرف المختصر مطلوب'),
  description: z.string().nullable().optional(),
  location: z.enum(['header', 'footer', 'sidebar', 'mobile']),
  isActive: z.boolean().default(true),
});

// زودج سكيما للتحقق من صحة بيانات عنصر القائمة
const menuItemSchema = z.object({
  id: z.number().optional(),
  menuId: z.number(),
  parentId: z.number().nullable().optional(),
  title: z.string().min(1, 'عنوان العنصر مطلوب'),
  type: z.enum(['page', 'category', 'level', 'country', 'link', 'scholarship', 'post']),
  url: z.string().nullable().optional(),
  targetBlank: z.boolean().default(false),
  pageId: z.number().nullable().optional(),
  categoryId: z.number().nullable().optional(),
  levelId: z.number().nullable().optional(),
  countryId: z.number().nullable().optional(),
  scholarshipId: z.number().nullable().optional(),
  postId: z.number().nullable().optional(),
  order: z.number().default(0),
});

type MenuFormValues = z.infer<typeof menuSchema>;
type MenuItemFormValues = z.infer<typeof menuItemSchema>;

export default function MenusPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddMenuDialogOpen, setIsAddMenuDialogOpen] = useState(false);
  const [isEditMenuDialogOpen, setIsEditMenuDialogOpen] = useState(false);
  const [isDeleteMenuDialogOpen, setIsDeleteMenuDialogOpen] = useState(false);
  const [isAddMenuItemDialogOpen, setIsAddMenuItemDialogOpen] = useState(false);
  const [isEditMenuItemDialogOpen, setIsEditMenuItemDialogOpen] = useState(false);
  const [isDeleteMenuItemDialogOpen, setIsDeleteMenuItemDialogOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState<any | null>(null);
  const [selectedMenuItem, setSelectedMenuItem] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'header' | 'footer' | 'sidebar' | 'mobile'>('header');
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // استعلامات البيانات
  const { data: menus, isLoading: menusLoading, refetch: refetchMenus } = useMenus();
  const { data: pages, isLoading: pagesLoading } = usePages({});
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { data: levels, isLoading: levelsLoading } = useLevels();
  const { data: countries, isLoading: countriesLoading } = useCountries();
  
  // البيانات المفلترة حسب الموقع النشط
  const locationMenus = menus?.data ? Array.isArray(menus.data) 
    ? menus.data.filter(menu => menu.location === activeTab) 
    : [] 
    : [];
  
  // بيانات القائمة المحددة النشطة
  const { data: activeMenuItems, isLoading: menuItemsLoading, refetch: refetchMenuItems } = useMenuItemsWithDetails(activeMenuId || 0);

  // التحقق من تسجيل الدخول
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/admin/login');
    }
  }, [authLoading, isAuthenticated, navigate]);
  
  // تعيين أول قائمة في الموقع المحدد كنشطة بشكل تلقائي
  useEffect(() => {
    if (locationMenus && locationMenus.length > 0 && !activeMenuId) {
      setActiveMenuId(locationMenus[0].id);
    } else if (locationMenus && locationMenus.length === 0) {
      setActiveMenuId(null);
    }
  }, [locationMenus, activeMenuId]);
  
  // نماذج الإضافة والتعديل
  const addMenuForm = useForm<MenuFormValues>({
    resolver: zodResolver(menuSchema.omit({ id: true })),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      location: activeTab,
      isActive: true,
    },
  });
  
  const editMenuForm = useForm<MenuFormValues>({
    resolver: zodResolver(menuSchema),
    defaultValues: {
      id: selectedMenu?.id,
      name: selectedMenu?.name || '',
      slug: selectedMenu?.slug || '',
      description: selectedMenu?.description || '',
      location: selectedMenu?.location || activeTab,
      isActive: selectedMenu?.isActive || true,
    },
  });
  
  const addMenuItemForm = useForm<MenuItemFormValues>({
    resolver: zodResolver(menuItemSchema.omit({ id: true })),
    defaultValues: {
      menuId: activeMenuId || 0,
      parentId: null,
      title: '',
      type: 'link',
      url: '',
      targetBlank: false,
      pageId: null,
      categoryId: null,
      levelId: null,
      countryId: null,
      scholarshipId: null,
      postId: null,
      order: 0,
    },
  });
  
  const editMenuItemForm = useForm<MenuItemFormValues>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      id: selectedMenuItem?.id,
      menuId: selectedMenuItem?.menuId || activeMenuId || 0,
      parentId: selectedMenuItem?.parentId || null,
      title: selectedMenuItem?.title || '',
      type: selectedMenuItem?.type || 'link',
      url: selectedMenuItem?.url || '',
      targetBlank: selectedMenuItem?.targetBlank || false,
      pageId: selectedMenuItem?.pageId || null,
      categoryId: selectedMenuItem?.categoryId || null,
      levelId: selectedMenuItem?.levelId || null,
      countryId: selectedMenuItem?.countryId || null,
      scholarshipId: selectedMenuItem?.scholarshipId || null,
      postId: selectedMenuItem?.postId || null,
      order: selectedMenuItem?.order || 0,
    },
  });
  
  // تحديث نماذج التعديل عند تغيير العناصر المحددة
  useEffect(() => {
    if (selectedMenu) {
      editMenuForm.reset({
        id: selectedMenu.id,
        name: selectedMenu.name,
        slug: selectedMenu.slug,
        description: selectedMenu.description,
        location: selectedMenu.location,
        isActive: selectedMenu.isActive,
      });
    }
  }, [selectedMenu, editMenuForm]);
  
  useEffect(() => {
    if (selectedMenuItem) {
      editMenuItemForm.reset({
        id: selectedMenuItem.id,
        menuId: selectedMenuItem.menuId,
        parentId: selectedMenuItem.parentId,
        title: selectedMenuItem.title,
        type: selectedMenuItem.type,
        url: selectedMenuItem.url,
        targetBlank: selectedMenuItem.targetBlank,
        pageId: selectedMenuItem.pageId,
        categoryId: selectedMenuItem.categoryId,
        levelId: selectedMenuItem.levelId,
        countryId: selectedMenuItem.countryId,
        scholarshipId: selectedMenuItem.scholarshipId,
        postId: selectedMenuItem.postId,
        order: selectedMenuItem.order,
      });
    }
  }, [selectedMenuItem, editMenuItemForm]);
  
  // تحديث حقل الموقع في نموذج إضافة القائمة عند تغيير التبويب النشط
  useEffect(() => {
    addMenuForm.setValue('location', activeTab);
  }, [activeTab, addMenuForm]);
  
  // تحديث حقل menuId في نموذج إضافة عنصر القائمة عند تغيير القائمة النشطة
  useEffect(() => {
    if (activeMenuId) {
      addMenuItemForm.setValue('menuId', activeMenuId);
    }
  }, [activeMenuId, addMenuItemForm]);
  
  // تم تعديل نوع عنصر القائمة
  const handleMenuItemTypeChange = (type: string, form: any) => {
    // إعادة تعيين كافة حقول النوع إلى قيمة فارغة
    form.setValue('pageId', null);
    form.setValue('categoryId', null);
    form.setValue('levelId', null);
    form.setValue('countryId', null);
    form.setValue('scholarshipId', null);
    form.setValue('postId', null);
    form.setValue('url', null);
    
    // إذا كان النوع هو رابط خارجي، ضع قيمة افتراضية للرابط
    if (type === 'link') {
      form.setValue('url', 'https://');
    }
  };
  
  // إعادة ترتيب عناصر القائمة عند السحب والإفلات
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const sourceId = parseInt(result.draggableId.split('-')[1]);
    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;
    
    if (sourceIndex === destinationIndex) return;
    
    // معالجة إعادة ترتيب عناصر القائمة
    const menuItemsArray = activeMenuItems?.data && Array.isArray(activeMenuItems.data) 
      ? activeMenuItems.data 
      : [];
    const menuItem = menuItemsArray.find(item => item.id === sourceId);
    
    if (menuItem) {
      const reorderedItems = reorderMenuItems(
        menuItemsArray,
        sourceIndex,
        destinationIndex,
        menuItem.parentId
      );
      
      // تحديث ترتيب العناصر في قاعدة البيانات
      const updatePromises = reorderedItems.map(item => {
        return apiRequest(`/api/menu-items/${item.id}`, {
          method: 'PATCH',
          data: { order: item.order }
        });
      });
      
      Promise.all(updatePromises)
        .then(() => {
          queryClient.invalidateQueries({ queryKey: ['/api/menu-items-with-details/menu', activeMenuId] });
          toast({
            title: 'تم التحديث',
            description: 'تم إعادة ترتيب عناصر القائمة بنجاح',
          });
        })
        .catch(error => {
          toast({
            title: 'خطأ!',
            description: `فشل في إعادة ترتيب العناصر: ${error.message}`,
            variant: 'destructive',
          });
        });
    }
  };
  
  // إعادة ترتيب عناصر القائمة (المنطق)
  const reorderMenuItems = (
    list: any[],
    startIndex: number,
    endIndex: number,
    parentId: number | null
  ) => {
    // تصفية العناصر بنفس الأب
    const filteredList = list.filter(item => item.parentId === parentId);
    
    // نقل العنصر من المصدر إلى الوجهة
    const [removed] = filteredList.splice(startIndex, 1);
    filteredList.splice(endIndex, 0, removed);
    
    // تحديث أرقام الترتيب
    return filteredList.map((item, index) => ({
      ...item,
      order: index
    }));
  };
  
  // وظائف المعالجة للأحداث
  const handleAddMenu = (data: MenuFormValues) => {
    // إزالة فراغات من المعرف المختصر وتحويله إلى حروف صغيرة
    const sanitizedSlug = data.slug.trim().toLowerCase().replace(/\s+/g, '-');
    
    apiRequest('POST', '/api/menus', { ...data, slug: sanitizedSlug })
      .then(() => {
        queryClient.invalidateQueries({ queryKey: ['/api/menus'] });
        toast({
          title: 'تم الإضافة بنجاح',
          description: 'تمت إضافة القائمة الجديدة بنجاح',
        });
        setIsAddMenuDialogOpen(false);
        addMenuForm.reset();
      })
      .catch(error => {
        toast({
          title: 'خطأ!',
          description: `فشل في إضافة القائمة: ${error.message}`,
          variant: 'destructive',
        });
      });
  };
  
  const handleEditMenu = (data: MenuFormValues) => {
    // إزالة فراغات من المعرف المختصر وتحويله إلى حروف صغيرة
    const sanitizedSlug = data.slug.trim().toLowerCase().replace(/\s+/g, '-');
    
    apiRequest('PATCH', `/api/menus/${data.id}`, { ...data, slug: sanitizedSlug })
      .then(() => {
        queryClient.invalidateQueries({ queryKey: ['/api/menus'] });
        toast({
          title: 'تم التحديث بنجاح',
          description: 'تم تحديث بيانات القائمة بنجاح',
        });
        setIsEditMenuDialogOpen(false);
        setSelectedMenu(null);
      })
      .catch(error => {
        toast({
          title: 'خطأ!',
          description: `فشل في تحديث القائمة: ${error.message}`,
          variant: 'destructive',
        });
      });
  };
  
  const handleDeleteMenu = () => {
    if (!selectedMenu) return;
    
    apiRequest('DELETE', `/api/menus/${selectedMenu.id}`)
      .then(() => {
        queryClient.invalidateQueries({ queryKey: ['/api/menus'] });
        // إذا كانت القائمة المحذوفة هي النشطة حالياً، قم بإعادة التعيين
        if (activeMenuId === selectedMenu.id) {
          setActiveMenuId(null);
        }
        toast({
          title: 'تم الحذف بنجاح',
          description: 'تم حذف القائمة بنجاح',
        });
        setIsDeleteMenuDialogOpen(false);
        setSelectedMenu(null);
      })
      .catch(error => {
        toast({
          title: 'خطأ!',
          description: `فشل في حذف القائمة: ${error.message}`,
          variant: 'destructive',
        });
      });
  };
  
  const handleAddMenuItem = (data: MenuItemFormValues) => {
    // الحصول على العدد الإجمالي للعناصر في نفس المستوى كترتيب افتراضي
    const menuItemsArray = activeMenuItems?.data && Array.isArray(activeMenuItems.data) 
      ? activeMenuItems.data 
      : [];
    const sameLevel = menuItemsArray.filter(
      item => item.parentId === data.parentId
    );
    const order = sameLevel.length;
    
    apiRequest('POST', '/api/menu-items', { ...data, order })
      .then(() => {
        // استخدام المسار الكامل للاستعلام بدلاً من استخدام المفتاح مع المعرف
        queryClient.invalidateQueries({ queryKey: [`/api/menu-items-with-details/menu/${activeMenuId}`] });
        // تحديث كافة استعلامات هيكل القائمة بغض النظر عن الموقع (لضمان تحديث الواجهة الأمامية)
        queryClient.invalidateQueries({ queryKey: ['/api/menu-structure'] });
        // تحديث التبويب النشط أيضاً للواجهة الإدارية
        queryClient.invalidateQueries({ queryKey: ['/api/menu-structure', activeTab] });
        toast({
          title: 'تم الإضافة بنجاح',
          description: 'تمت إضافة عنصر القائمة بنجاح',
        });
        setIsAddMenuItemDialogOpen(false);
        addMenuItemForm.reset({
          menuId: activeMenuId || 0,
          parentId: null,
          title: '',
          type: 'link',
          url: '',
          targetBlank: false,
          pageId: null,
          categoryId: null,
          levelId: null,
          countryId: null,
          scholarshipId: null,
          postId: null,
          order: 0,
        });
      })
      .catch(error => {
        toast({
          title: 'خطأ!',
          description: `فشل في إضافة عنصر القائمة: ${error.message}`,
          variant: 'destructive',
        });
      });
  };
  
  const handleEditMenuItem = (data: MenuItemFormValues) => {
    apiRequest('PATCH', `/api/menu-items/${data.id}`, data)
      .then(() => {
        // استخدام المسار الكامل للاستعلام بدلاً من استخدام المفتاح مع المعرف
        queryClient.invalidateQueries({ queryKey: [`/api/menu-items-with-details/menu/${activeMenuId}`] });
        // تحديث كافة استعلامات هيكل القائمة بغض النظر عن الموقع (لضمان تحديث الواجهة الأمامية)
        queryClient.invalidateQueries({ queryKey: ['/api/menu-structure'] });
        // تحديث التبويب النشط أيضاً للواجهة الإدارية
        queryClient.invalidateQueries({ queryKey: ['/api/menu-structure', activeTab] });
        toast({
          title: 'تم التحديث بنجاح',
          description: 'تم تحديث بيانات عنصر القائمة بنجاح',
        });
        setIsEditMenuItemDialogOpen(false);
        setSelectedMenuItem(null);
      })
      .catch(error => {
        toast({
          title: 'خطأ!',
          description: `فشل في تحديث عنصر القائمة: ${error.message}`,
          variant: 'destructive',
        });
      });
  };
  
  const handleDeleteMenuItem = () => {
    if (!selectedMenuItem) return;
    
    apiRequest('DELETE', `/api/menu-items/${selectedMenuItem.id}`)
      .then(() => {
        // استخدام المسار الكامل للاستعلام بدلاً من استخدام المفتاح مع المعرف
        queryClient.invalidateQueries({ queryKey: [`/api/menu-items-with-details/menu/${activeMenuId}`] });
        // تحديث كافة استعلامات هيكل القائمة بغض النظر عن الموقع (لضمان تحديث الواجهة الأمامية)
        queryClient.invalidateQueries({ queryKey: ['/api/menu-structure'] });
        // تحديث التبويب النشط أيضاً للواجهة الإدارية
        queryClient.invalidateQueries({ queryKey: ['/api/menu-structure', activeTab] });
        toast({
          title: 'تم الحذف بنجاح',
          description: 'تم حذف عنصر القائمة بنجاح',
        });
        setIsDeleteMenuItemDialogOpen(false);
        setSelectedMenuItem(null);
      })
      .catch(error => {
        toast({
          title: 'خطأ!',
          description: `فشل في حذف عنصر القائمة: ${error.message}`,
          variant: 'destructive',
        });
      });
  };
  
  // وظائف مساعدة
  const generateSlug = (name: string) => {
    const slug = name
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-');
    
    addMenuForm.setValue('slug', slug);
  };
  
  // تنظيم عناصر القائمة في هيكل متداخل (الأصل/الفروع)
  const organizeMenuItems = (items: any) => {
    const menuItemsArray = items?.data && Array.isArray(items.data) 
      ? items.data 
      : [];
    
    if (!menuItemsArray.length) return [];
    
    const rootItems = menuItemsArray
      .filter(item => item.parentId === null)
      .sort((a, b) => a.order - b.order);
    
    const populateChildren = (item: any) => {
      const children = menuItemsArray
        .filter(child => child.parentId === item.id)
        .sort((a, b) => a.order - b.order)
        .map(populateChildren);
      
      return { ...item, children: children.length ? children : [] };
    };
    
    return rootItems.map(populateChildren);
  };
  
  // تلخيص نوع العنصر
  const getItemTypeSummary = (item: any) => {
    const types: Record<string, string> = {
      page: 'صفحة',
      category: 'تصنيف',
      level: 'مستوى دراسي',
      country: 'دولة',
      scholarship: 'منحة',
      post: 'مقال',
      link: 'رابط',
    };
    
    return types[item.type] || 'غير محدد';
  };
  
  // الحصول على أيقونة لنوع العنصر
  const getItemTypeIcon = (type: string) => {
    switch (type) {
      case 'page':
        return <BookOpen className="h-4 w-4" />;
      case 'category':
        return <FolderPlus className="h-4 w-4" />;
      case 'level':
        return <LayoutDashboard className="h-4 w-4" />;
      case 'country':
        return <Globe className="h-4 w-4" />;
      case 'scholarship':
        return <GraduationCap className="h-4 w-4" />;
      case 'post':
        return <FileBadge className="h-4 w-4" />;
      case 'link':
        return <LinkIcon className="h-4 w-4" />;
      default:
        return <LinkIcon className="h-4 w-4" />;
    }
  };
  
  // الحصول على الاسم المرئي للعنصر المرتبط
  const getItemRelatedName = (item: any) => {
    if (item.type === 'page' && item.pageId) {
      const page = pages?.find(p => p.id === item.pageId);
      return page?.title || 'صفحة غير موجودة';
    } else if (item.type === 'category' && item.categoryId) {
      const category = categories?.find(c => c.id === item.categoryId);
      return category?.name || 'تصنيف غير موجود';
    } else if (item.type === 'level' && item.levelId) {
      const level = levels?.find(l => l.id === item.levelId);
      return level?.name || 'مستوى غير موجود';
    } else if (item.type === 'country' && item.countryId) {
      const country = countries?.find(c => c.id === item.countryId);
      return country?.name || 'دولة غير موجودة';
    } else if (item.type === 'link') {
      return item.url || '#';
    }
    
    return 'غير محدد';
  };
  
  // الحصول على خيارات أب للعنصر
  const getParentOptions = () => {
    if (!activeMenuItems) return [];
    
    // التحقق من أن activeMenuItems.data موجود ومصفوفة
    const menuItemsArray = activeMenuItems?.data && Array.isArray(activeMenuItems.data) 
      ? activeMenuItems.data 
      : [];
    
    return menuItemsArray
      .filter(item => item.parentId === null && (selectedMenuItem ? item.id !== selectedMenuItem.id : true))
      .map(item => ({
        id: item.id,
        label: item.title
      }));
  };
  
  // تحويل نوع العنصر إلى نص
  const translateMenuItemType = (type: string) => {
    const types: Record<string, string> = {
      page: 'صفحة',
      category: 'تصنيف',
      level: 'مستوى دراسي',
      country: 'دولة',
      scholarship: 'منحة',
      post: 'مقال',
      link: 'رابط',
    };
    
    return types[type] || 'غير محدد';
  };
  
  // في حالة تحميل بيانات المصادقة أو عدم تسجيل الدخول
  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse">جاري التحميل...</div>
      </div>
    );
  }
  
  return (
    <div className="bg-background min-h-screen relative overflow-x-hidden">
      {/* السايدبار للجوال */}
      <Sidebar 
        isMobileOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />
      
      {/* المحتوى الرئيسي */}
      <div className={cn(
        "transition-all duration-300",
        isMobile ? "w-full" : "mr-64"
      )}>
        <main className="p-4 md:p-6">
          {/* زر فتح السايدبار في الجوال والهيدر */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            {isMobile && (
              <Button variant="outline" size="icon" onClick={() => setSidebarOpen(true)} className="self-start">
                <MenuIcon className="h-5 w-5" />
              </Button>
            )}
            <div>
              <h1 className="text-2xl font-bold">إدارة القوائم</h1>
              <p className="text-muted-foreground mt-1">إنشاء وتعديل قوائم الموقع وترتيب العناصر فيها</p>
            </div>
            
            <div className="flex gap-2 self-start sm:self-center">
              <Button variant="outline" onClick={() => refetchMenus()} className="gap-1">
                <RefreshCw className="h-4 w-4" />
                <span className="hidden sm:inline">تحديث</span>
              </Button>
              <Button onClick={() => setIsAddMenuDialogOpen(true)}>
                <PlusCircle className="h-4 w-4 ml-1" />
                إضافة قائمة
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* العمود الأول: تبويبات المواقع وقائمة بالقوائم */}
            <div className="md:col-span-1">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>قوائم الموقع</CardTitle>
                  <CardDescription>
                    حدد موقع القائمة ثم قم بإدارة قوائمه
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs 
                    value={activeTab} 
                    onValueChange={(value) => {
                      setActiveTab(value as any);
                      setActiveMenuId(null);
                    }}
                    className="w-full"
                  >
                    <TabsList className="grid grid-cols-4 w-full mb-4">
                      <TabsTrigger value="header">الرأس</TabsTrigger>
                      <TabsTrigger value="footer">التذييل</TabsTrigger>
                      <TabsTrigger value="sidebar">الجانب</TabsTrigger>
                      <TabsTrigger value="mobile">الموبايل</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value={activeTab}>
                      {menusLoading ? (
                        <div className="p-8 text-center animate-pulse">
                          جاري تحميل القوائم...
                        </div>
                      ) : locationMenus.length === 0 ? (
                        <div className="p-8 text-center border border-dashed rounded-lg">
                          <TriangleAlert className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                          <h3 className="font-medium text-lg mb-1">لا توجد قوائم</h3>
                          <p className="text-muted-foreground mb-4">لم يتم إنشاء أي قوائم في هذا الموقع</p>
                          <Button onClick={() => setIsAddMenuDialogOpen(true)}>
                            <PlusCircle className="h-4 w-4 ml-1" />
                            إضافة قائمة جديدة
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {locationMenus.map(menu => (
                            <Card key={menu.id} className={cn(
                              "cursor-pointer transition-all hover:border-primary/50",
                              activeMenuId === menu.id ? "border-primary bg-primary/5" : ""
                            )} onClick={() => setActiveMenuId(menu.id)}>
                              <CardContent className="p-3 flex items-center justify-between">
                                <div className="flex items-center">
                                  <div className="mr-3">
                                    <h3 className="font-medium">{menu.name}</h3>
                                    <p className="text-xs text-muted-foreground">{menu.slug}</p>
                                  </div>
                                </div>
                                <div className="flex gap-1">
                                  {!menu.isActive && (
                                    <Badge variant="outline" className="mr-1 text-yellow-500 border-yellow-200 bg-yellow-50">
                                      غير نشط
                                    </Badge>
                                  )}
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-7 w-7" 
                                    onClick={(e) => {
                                      e.stopPropagation(); // منع انتشار الحدث
                                      setSelectedMenu(menu);
                                      setIsEditMenuDialogOpen(true);
                                    }}
                                  >
                                    <Edit className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-7 w-7 text-red-500" 
                                    onClick={(e) => {
                                      e.stopPropagation(); // منع انتشار الحدث
                                      setSelectedMenu(menu);
                                      setIsDeleteMenuDialogOpen(true);
                                    }}
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
            
            {/* العمود الثاني والثالث: إدارة عناصر القائمة المحددة */}
            <div className="md:col-span-2">
              <Card>
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>عناصر القائمة</CardTitle>
                    <CardDescription>
                      {activeMenuId ? (
                        <>إدارة عناصر القائمة المحددة وترتيبها</>
                      ) : (
                        <>يرجى اختيار قائمة من القوائم المتاحة</>
                      )}
                    </CardDescription>
                  </div>
                  {activeMenuId && (
                    <Button onClick={() => setIsAddMenuItemDialogOpen(true)}>
                      <PlusCircle className="h-4 w-4 ml-1" />
                      إضافة عنصر
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  {!activeMenuId ? (
                    <div className="p-8 text-center border border-dashed rounded-lg">
                      <TriangleAlert className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <h3 className="font-medium text-lg mb-1">لم يتم اختيار قائمة</h3>
                      <p className="text-muted-foreground">
                        يرجى اختيار قائمة من القائمة الجانبية لعرض وإدارة عناصرها
                      </p>
                    </div>
                  ) : menuItemsLoading ? (
                    <div className="p-8 text-center animate-pulse">
                      جاري تحميل عناصر القائمة...
                    </div>
                  ) : (!activeMenuItems?.data || !Array.isArray(activeMenuItems.data) || activeMenuItems.data.length === 0) ? (
                    <div className="p-8 text-center border border-dashed rounded-lg">
                      <TriangleAlert className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <h3 className="font-medium text-lg mb-1">لا توجد عناصر</h3>
                      <p className="text-muted-foreground mb-4">
                        هذه القائمة لا تحتوي على أي عناصر بعد
                      </p>
                      <Button onClick={() => setIsAddMenuItemDialogOpen(true)}>
                        <PlusCircle className="h-4 w-4 ml-1" />
                        إضافة عنصر جديد
                      </Button>
                    </div>
                  ) : (
                    <DragDropContext onDragEnd={handleDragEnd}>
                      <Droppable droppableId="menu-items">
                        {(provided) => (
                          <div
                            className="space-y-2"
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                          >
                            {organizeMenuItems(activeMenuItems).length > 0 ? (
                              organizeMenuItems(activeMenuItems).map((item, index) => (
                                <Draggable
                                  key={`item-${item.id}`}
                                  draggableId={`item-${item.id}`}
                                  index={index}
                                >
                                  {(provided) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                    >
                                      <Card className="border-primary/20">
                                        <CardContent className="p-3">
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center">
                                            <div
                                              className="px-2 cursor-move"
                                              {...provided.dragHandleProps}
                                            >
                                              <MoveUp className="h-4 w-4 text-muted-foreground" />
                                            </div>
                                            <div className="flex items-center gap-2">
                                              {getItemTypeIcon(item.type)}
                                              <div>
                                                <h4 className="font-medium">{item.title}</h4>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                  <Badge variant="outline" className="text-xs h-5 bg-background">
                                                    {translateMenuItemType(item.type)}
                                                  </Badge>
                                                  <span className="truncate max-w-[150px]" title={getItemRelatedName(item)}>
                                                    {getItemRelatedName(item)}
                                                  </span>
                                                  {item.targetBlank && (
                                                    <Badge variant="outline" className="text-xs h-5 bg-background">
                                                      فتح في نافذة جديدة
                                                    </Badge>
                                                  )}
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                          <div className="flex gap-1">
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              className="h-7 w-7"
                                              onClick={() => {
                                                setSelectedMenuItem(item);
                                                setIsEditMenuItemDialogOpen(true);
                                              }}
                                            >
                                              <Edit className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              className="h-7 w-7 text-red-500"
                                              onClick={() => {
                                                setSelectedMenuItem(item);
                                                setIsDeleteMenuItemDialogOpen(true);
                                              }}
                                            >
                                              <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                          </div>
                                        </div>
                                        
                                        {/* العناصر الفرعية */}
                                        {item.children && item.children.length > 0 && (
                                          <div className="mt-2 pr-6 border-r-2 border-muted">
                                            <div className="space-y-2 mt-2">
                                              {item.children.map((child: any, childIndex: number) => (
                                                <Card key={`child-${child.id}`} className="border-muted/50">
                                                  <CardContent className="p-2.5">
                                                    <div className="flex items-center justify-between">
                                                      <div className="flex items-center gap-2">
                                                        {getItemTypeIcon(child.type)}
                                                        <div>
                                                          <h4 className="font-medium text-sm">{child.title}</h4>
                                                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                            <Badge variant="outline" className="text-xs h-5 px-1.5 py-0 bg-background">
                                                              {translateMenuItemType(child.type)}
                                                            </Badge>
                                                            <span className="truncate max-w-[120px]" title={getItemRelatedName(child)}>
                                                              {getItemRelatedName(child)}
                                                            </span>
                                                          </div>
                                                        </div>
                                                      </div>
                                                      <div className="flex gap-1">
                                                        <Button
                                                          variant="ghost"
                                                          size="icon"
                                                          className="h-6 w-6"
                                                          onClick={() => {
                                                            setSelectedMenuItem(child);
                                                            setIsEditMenuItemDialogOpen(true);
                                                          }}
                                                        >
                                                          <Edit className="h-3 w-3" />
                                                        </Button>
                                                        <Button
                                                          variant="ghost"
                                                          size="icon"
                                                          className="h-6 w-6 text-red-500"
                                                          onClick={() => {
                                                            setSelectedMenuItem(child);
                                                            setIsDeleteMenuItemDialogOpen(true);
                                                          }}
                                                        >
                                                          <Trash2 className="h-3 w-3" />
                                                        </Button>
                                                      </div>
                                                    </div>
                                                  </CardContent>
                                                </Card>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                        </CardContent>
                                      </Card>
                                    </div>
                                  )}
                                </Draggable>
                              ))
                            ) : (
                              <div className="text-center p-4 text-muted-foreground">
                                لا توجد عناصر في هذه القائمة
                              </div>
                            )}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </DragDropContext>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
      
      {/* نوافذ الحوار */}
      {/* نافذة إضافة قائمة جديدة */}
      <Dialog open={isAddMenuDialogOpen} onOpenChange={setIsAddMenuDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>إضافة قائمة جديدة</DialogTitle>
            <DialogDescription>
              قم بإضافة قائمة جديدة للموقع. يمكنك تحديد أين ستظهر هذه القائمة.
            </DialogDescription>
          </DialogHeader>
          <Form {...addMenuForm}>
            <form onSubmit={addMenuForm.handleSubmit(handleAddMenu)} className="space-y-4">
              <FormField
                control={addMenuForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>اسم القائمة</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="اسم القائمة"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          if (!addMenuForm.getValues('slug')) {
                            generateSlug(e.target.value);
                          }
                        }}
                      />
                    </FormControl>
                    <FormDescription>اسم القائمة المعروض للمسؤولين فقط</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={addMenuForm.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>المعرف المختصر</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="معرف-القائمة"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>سيتم استخدامه لتحديد هوية القائمة في النظام</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={addMenuForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>وصف القائمة</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="وصف مختصر للقائمة (اختياري)"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormDescription>وصف توضيحي للمسؤولين فقط</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={addMenuForm.control}
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
                        <SelectItem value="header">رأس الصفحة</SelectItem>
                        <SelectItem value="footer">تذييل الصفحة</SelectItem>
                        <SelectItem value="sidebar">القائمة الجانبية</SelectItem>
                        <SelectItem value="mobile">قائمة الجوال</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      أين ستظهر هذه القائمة في الموقع
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={addMenuForm.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rtl:space-x-reverse">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>تفعيل القائمة</FormLabel>
                      <FormDescription>
                        هل تريد أن تكون القائمة نشطة ومرئية للزوار؟
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="submit" disabled={addMenuForm.formState.isSubmitting}>
                  {addMenuForm.formState.isSubmitting ? (
                    <>جاري الإضافة...</>
                  ) : (
                    <>إضافة القائمة</>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* نافذة تعديل قائمة */}
      <Dialog open={isEditMenuDialogOpen} onOpenChange={setIsEditMenuDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>تعديل القائمة</DialogTitle>
            <DialogDescription>
              قم بتعديل بيانات القائمة المحددة.
            </DialogDescription>
          </DialogHeader>
          <Form {...editMenuForm}>
            <form onSubmit={editMenuForm.handleSubmit(handleEditMenu)} className="space-y-4">
              <FormField
                control={editMenuForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>اسم القائمة</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="اسم القائمة"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>اسم القائمة المعروض للمسؤولين فقط</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editMenuForm.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>المعرف المختصر</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="معرف-القائمة"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>سيتم استخدامه لتحديد هوية القائمة في النظام</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editMenuForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>وصف القائمة</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="وصف مختصر للقائمة (اختياري)"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormDescription>وصف توضيحي للمسؤولين فقط</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editMenuForm.control}
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
                        <SelectItem value="header">رأس الصفحة</SelectItem>
                        <SelectItem value="footer">تذييل الصفحة</SelectItem>
                        <SelectItem value="sidebar">القائمة الجانبية</SelectItem>
                        <SelectItem value="mobile">قائمة الجوال</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      أين ستظهر هذه القائمة في الموقع
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editMenuForm.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rtl:space-x-reverse">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>تفعيل القائمة</FormLabel>
                      <FormDescription>
                        هل تريد أن تكون القائمة نشطة ومرئية للزوار؟
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="submit" disabled={editMenuForm.formState.isSubmitting}>
                  {editMenuForm.formState.isSubmitting ? (
                    <>جاري الحفظ...</>
                  ) : (
                    <>حفظ التعديلات</>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* نافذة حذف قائمة */}
      <AlertDialog open={isDeleteMenuDialogOpen} onOpenChange={setIsDeleteMenuDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من حذف هذه القائمة؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيؤدي هذا الإجراء إلى حذف القائمة {selectedMenu?.name} وجميع عناصرها بشكل نهائي.
              لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteMenu}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* نافذة إضافة عنصر قائمة */}
      <Dialog open={isAddMenuItemDialogOpen} onOpenChange={setIsAddMenuItemDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>إضافة عنصر قائمة جديد</DialogTitle>
            <DialogDescription>
              قم بإضافة عنصر جديد إلى القائمة المحددة.
            </DialogDescription>
          </DialogHeader>
          <Form {...addMenuItemForm}>
            <form onSubmit={addMenuItemForm.handleSubmit(handleAddMenuItem)} className="space-y-4">
              <FormField
                control={addMenuItemForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>عنوان العنصر</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="عنوان العنصر في القائمة"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>العنوان الذي سيظهر في القائمة</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={addMenuItemForm.control}
                name="parentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>العنصر الأب</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value === "null" ? null : parseInt(value))}
                      value={field.value === null ? "null" : field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر العنصر الأب (اختياري)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="null">بدون عنصر أب (عنصر رئيسي)</SelectItem>
                        {getParentOptions().map(option => (
                          <SelectItem key={option.id} value={option.id.toString()}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      اختر إذا كان هذا العنصر تابعًا لعنصر آخر في القائمة. اترك فارغًا ليكون عنصرًا رئيسيًا.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={addMenuItemForm.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نوع العنصر</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        handleMenuItemTypeChange(value, addMenuItemForm);
                      }}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر نوع العنصر" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="link">رابط خارجي</SelectItem>
                        <SelectItem value="page">صفحة ثابتة</SelectItem>
                        <SelectItem value="category">تصنيف</SelectItem>
                        <SelectItem value="level">مستوى دراسي</SelectItem>
                        <SelectItem value="country">دولة</SelectItem>
                        <SelectItem value="post">مقال</SelectItem>
                        <SelectItem value="scholarship">منحة دراسية</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      نوع المحتوى الذي يشير إليه عنصر القائمة
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* الحقول المعتمدة على نوع العنصر */}
              {addMenuItemForm.watch('type') === 'link' && (
                <FormField
                  control={addMenuItemForm.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الرابط</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://example.com"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormDescription>رابط URL للصفحة المقصودة</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              {addMenuItemForm.watch('type') === 'page' && (
                <FormField
                  control={addMenuItemForm.control}
                  name="pageId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الصفحة</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        value={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر صفحة" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {pagesLoading ? (
                            <SelectItem value="loading" disabled>جاري تحميل الصفحات...</SelectItem>
                          ) : pages && pages.length > 0 ? (
                            pages.map(page => (
                              <SelectItem key={page.id} value={page.id.toString()}>
                                {page.title}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="none" disabled>لا توجد صفحات متاحة</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FormDescription>الصفحة التي سيتم الربط بها</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              {addMenuItemForm.watch('type') === 'category' && (
                <FormField
                  control={addMenuItemForm.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>التصنيف</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        value={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر تصنيف" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categoriesLoading ? (
                            <SelectItem value="loading" disabled>جاري تحميل التصنيفات...</SelectItem>
                          ) : categories && categories.length > 0 ? (
                            categories.map(category => (
                              <SelectItem key={category.id} value={category.id.toString()}>
                                {category.name}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="none" disabled>لا توجد تصنيفات متاحة</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FormDescription>التصنيف الذي سيتم الربط به</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              {addMenuItemForm.watch('type') === 'level' && (
                <FormField
                  control={addMenuItemForm.control}
                  name="levelId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>المستوى الدراسي</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        value={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر مستوى دراسي" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {levelsLoading ? (
                            <SelectItem value="loading" disabled>جاري تحميل المستويات...</SelectItem>
                          ) : levels && levels.length > 0 ? (
                            levels.map(level => (
                              <SelectItem key={level.id} value={level.id.toString()}>
                                {level.name}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="none" disabled>لا توجد مستويات متاحة</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FormDescription>المستوى الدراسي الذي سيتم الربط به</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              {addMenuItemForm.watch('type') === 'country' && (
                <FormField
                  control={addMenuItemForm.control}
                  name="countryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الدولة</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        value={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر دولة" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {countriesLoading ? (
                            <SelectItem value="loading" disabled>جاري تحميل الدول...</SelectItem>
                          ) : countries && countries.length > 0 ? (
                            countries.map(country => (
                              <SelectItem key={country.id} value={country.id.toString()}>
                                {country.name}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="none" disabled>لا توجد دول متاحة</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FormDescription>الدولة التي سيتم الربط بها</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              {(addMenuItemForm.watch('type') === 'link') && (
                <FormField
                  control={addMenuItemForm.control}
                  name="targetBlank"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rtl:space-x-reverse">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>فتح في نافذة جديدة</FormLabel>
                        <FormDescription>
                          فتح الرابط في نافذة جديدة بدلاً من النافذة الحالية
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              )}
              
              <DialogFooter>
                <Button type="submit" disabled={addMenuItemForm.formState.isSubmitting}>
                  {addMenuItemForm.formState.isSubmitting ? (
                    <>جاري الإضافة...</>
                  ) : (
                    <>إضافة العنصر</>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* نافذة تعديل عنصر قائمة */}
      <Dialog open={isEditMenuItemDialogOpen} onOpenChange={setIsEditMenuItemDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>تعديل عنصر القائمة</DialogTitle>
            <DialogDescription>
              قم بتعديل بيانات عنصر القائمة المحدد.
            </DialogDescription>
          </DialogHeader>
          <Form {...editMenuItemForm}>
            <form onSubmit={editMenuItemForm.handleSubmit(handleEditMenuItem)} className="space-y-4">
              <FormField
                control={editMenuItemForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>عنوان العنصر</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="عنوان العنصر في القائمة"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>العنوان الذي سيظهر في القائمة</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editMenuItemForm.control}
                name="parentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>العنصر الأب</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value === "null" ? null : parseInt(value))}
                      value={field.value === null ? "null" : field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر العنصر الأب (اختياري)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="null">بدون عنصر أب (عنصر رئيسي)</SelectItem>
                        {getParentOptions().map(option => (
                          <SelectItem key={option.id} value={option.id.toString()}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      اختر إذا كان هذا العنصر تابعًا لعنصر آخر في القائمة. اترك فارغًا ليكون عنصرًا رئيسيًا.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editMenuItemForm.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نوع العنصر</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        handleMenuItemTypeChange(value, editMenuItemForm);
                      }}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر نوع العنصر" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="link">رابط خارجي</SelectItem>
                        <SelectItem value="page">صفحة ثابتة</SelectItem>
                        <SelectItem value="category">تصنيف</SelectItem>
                        <SelectItem value="level">مستوى دراسي</SelectItem>
                        <SelectItem value="country">دولة</SelectItem>
                        <SelectItem value="post">مقال</SelectItem>
                        <SelectItem value="scholarship">منحة دراسية</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      نوع المحتوى الذي يشير إليه عنصر القائمة
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* الحقول المعتمدة على نوع العنصر */}
              {editMenuItemForm.watch('type') === 'link' && (
                <FormField
                  control={editMenuItemForm.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الرابط</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://example.com"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormDescription>رابط URL للصفحة المقصودة</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              {editMenuItemForm.watch('type') === 'page' && (
                <FormField
                  control={editMenuItemForm.control}
                  name="pageId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الصفحة</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        value={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر صفحة" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {pagesLoading ? (
                            <SelectItem value="loading" disabled>جاري تحميل الصفحات...</SelectItem>
                          ) : pages && pages.length > 0 ? (
                            pages.map(page => (
                              <SelectItem key={page.id} value={page.id.toString()}>
                                {page.title}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="none" disabled>لا توجد صفحات متاحة</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FormDescription>الصفحة التي سيتم الربط بها</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              {editMenuItemForm.watch('type') === 'category' && (
                <FormField
                  control={editMenuItemForm.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>التصنيف</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        value={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر تصنيف" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categoriesLoading ? (
                            <SelectItem value="loading" disabled>جاري تحميل التصنيفات...</SelectItem>
                          ) : categories && categories.length > 0 ? (
                            categories.map(category => (
                              <SelectItem key={category.id} value={category.id.toString()}>
                                {category.name}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="none" disabled>لا توجد تصنيفات متاحة</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FormDescription>التصنيف الذي سيتم الربط به</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              {editMenuItemForm.watch('type') === 'level' && (
                <FormField
                  control={editMenuItemForm.control}
                  name="levelId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>المستوى الدراسي</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        value={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر مستوى دراسي" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {levelsLoading ? (
                            <SelectItem value="loading" disabled>جاري تحميل المستويات...</SelectItem>
                          ) : levels && levels.length > 0 ? (
                            levels.map(level => (
                              <SelectItem key={level.id} value={level.id.toString()}>
                                {level.name}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="none" disabled>لا توجد مستويات متاحة</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FormDescription>المستوى الدراسي الذي سيتم الربط به</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              {editMenuItemForm.watch('type') === 'country' && (
                <FormField
                  control={editMenuItemForm.control}
                  name="countryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الدولة</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        value={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر دولة" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {countriesLoading ? (
                            <SelectItem value="loading" disabled>جاري تحميل الدول...</SelectItem>
                          ) : countries && countries.length > 0 ? (
                            countries.map(country => (
                              <SelectItem key={country.id} value={country.id.toString()}>
                                {country.name}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="none" disabled>لا توجد دول متاحة</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FormDescription>الدولة التي سيتم الربط بها</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              {(editMenuItemForm.watch('type') === 'link') && (
                <FormField
                  control={editMenuItemForm.control}
                  name="targetBlank"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rtl:space-x-reverse">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>فتح في نافذة جديدة</FormLabel>
                        <FormDescription>
                          فتح الرابط في نافذة جديدة بدلاً من النافذة الحالية
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              )}
              
              <DialogFooter>
                <Button type="submit" disabled={editMenuItemForm.formState.isSubmitting}>
                  {editMenuItemForm.formState.isSubmitting ? (
                    <>جاري الحفظ...</>
                  ) : (
                    <>حفظ التعديلات</>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* نافذة حذف عنصر قائمة */}
      <AlertDialog open={isDeleteMenuItemDialogOpen} onOpenChange={setIsDeleteMenuItemDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من حذف هذا العنصر؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيؤدي هذا الإجراء إلى حذف عنصر القائمة {selectedMenuItem?.title} بشكل نهائي.
              {selectedMenuItem?.children && selectedMenuItem?.children.length > 0 && (
                <strong className="block mt-2 text-red-500">
                  تحذير: سيتم أيضًا حذف جميع العناصر الفرعية المرتبطة بهذا العنصر!
                </strong>
              )}
              لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteMenuItem}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}