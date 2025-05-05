import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusCircle, Edit, Trash2, RefreshCw, Check, X, Menu, Shield, User, Key, Copy } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import AdminLayout from '@/components/admin/admin-layout';

// زودج سكيما للتحقق من صحة البيانات
const roleSchema = z.object({
  name: z.string().min(2, 'اسم الدور يجب أن يكون على الأقل حرفين'),
  description: z.string().optional(),
  permissions: z.array(z.string()),
});

type RoleFormValues = z.infer<typeof roleSchema>;

// واجهة للدور
interface Role {
  id: number;
  name: string;
  description?: string;
  permissions: string[];
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

// واجهة للمستخدم
interface User {
  id: number;
  username: string;
  email: string;
  roleId: number;
  createdAt: string;
}

// قائمة الأذونات المتاحة
const availablePermissions = {
  dashboard: {
    view: {
      id: 'dashboard.view',
      label: 'عرض لوحة التحكم',
      group: 'لوحة التحكم',
    },
    analytics: {
      id: 'dashboard.analytics',
      label: 'عرض التحليلات',
      group: 'لوحة التحكم',
    },
  },
  scholarships: {
    view: {
      id: 'scholarships.view',
      label: 'عرض المنح الدراسية',
      group: 'المنح الدراسية',
    },
    create: {
      id: 'scholarships.create',
      label: 'إنشاء المنح الدراسية',
      group: 'المنح الدراسية',
    },
    edit: {
      id: 'scholarships.edit',
      label: 'تعديل المنح الدراسية',
      group: 'المنح الدراسية',
    },
    delete: {
      id: 'scholarships.delete',
      label: 'حذف المنح الدراسية',
      group: 'المنح الدراسية',
    },
  },
  categories: {
    view: {
      id: 'categories.view',
      label: 'عرض التصنيفات',
      group: 'التصنيفات',
    },
    manage: {
      id: 'categories.manage',
      label: 'إدارة التصنيفات',
      group: 'التصنيفات',
    },
  },
  levels: {
    view: {
      id: 'levels.view',
      label: 'عرض المستويات الدراسية',
      group: 'المستويات الدراسية',
    },
    manage: {
      id: 'levels.manage',
      label: 'إدارة المستويات الدراسية',
      group: 'المستويات الدراسية',
    },
  },
  countries: {
    view: {
      id: 'countries.view',
      label: 'عرض الدول',
      group: 'الدول',
    },
    manage: {
      id: 'countries.manage',
      label: 'إدارة الدول',
      group: 'الدول',
    },
  },
  posts: {
    view: {
      id: 'posts.view',
      label: 'عرض المقالات',
      group: 'المقالات',
    },
    create: {
      id: 'posts.create',
      label: 'إنشاء المقالات',
      group: 'المقالات',
    },
    edit: {
      id: 'posts.edit',
      label: 'تعديل المقالات',
      group: 'المقالات',
    },
    delete: {
      id: 'posts.delete',
      label: 'حذف المقالات',
      group: 'المقالات',
    },
  },
  pages: {
    view: {
      id: 'pages.view',
      label: 'عرض الصفحات',
      group: 'الصفحات',
    },
    manage: {
      id: 'pages.manage',
      label: 'إدارة الصفحات',
      group: 'الصفحات',
    },
  },
  media: {
    view: {
      id: 'media.view',
      label: 'عرض الوسائط',
      group: 'الوسائط',
    },
    upload: {
      id: 'media.upload',
      label: 'رفع الوسائط',
      group: 'الوسائط',
    },
    delete: {
      id: 'media.delete',
      label: 'حذف الوسائط',
      group: 'الوسائط',
    },
  },
  menus: {
    view: {
      id: 'menus.view',
      label: 'عرض القوائم',
      group: 'القوائم',
    },
    manage: {
      id: 'menus.manage',
      label: 'إدارة القوائم',
      group: 'القوائم',
    },
  },
  users: {
    view: {
      id: 'users.view',
      label: 'عرض المستخدمين',
      group: 'المستخدمين',
    },
    create: {
      id: 'users.create',
      label: 'إنشاء المستخدمين',
      group: 'المستخدمين',
    },
    edit: {
      id: 'users.edit',
      label: 'تعديل المستخدمين',
      group: 'المستخدمين',
    },
    delete: {
      id: 'users.delete',
      label: 'حذف المستخدمين',
      group: 'المستخدمين',
    },
  },
  roles: {
    view: {
      id: 'roles.view',
      label: 'عرض الأدوار',
      group: 'الأدوار والتصاريح',
    },
    manage: {
      id: 'roles.manage',
      label: 'إدارة الأدوار',
      group: 'الأدوار والتصاريح',
    },
  },
  settings: {
    view: {
      id: 'settings.view',
      label: 'عرض الإعدادات',
      group: 'الإعدادات',
    },
    manage: {
      id: 'settings.manage',
      label: 'إدارة الإعدادات',
      group: 'الإعدادات',
    },
  },
  seo: {
    view: {
      id: 'seo.view',
      label: 'عرض إعدادات SEO',
      group: 'تحسين محركات البحث',
    },
    manage: {
      id: 'seo.manage',
      label: 'إدارة إعدادات SEO',
      group: 'تحسين محركات البحث',
    },
  },
};

// تحويل قائمة الأذونات إلى مصفوفة
const allPermissions = Object.values(availablePermissions)
  .flatMap(category => Object.values(category))
  .map(permission => permission.id);

// تجميع الأذونات حسب المجموعة
const groupedPermissions = Object.values(availablePermissions)
  .flatMap(category => Object.values(category))
  .reduce((groups, permission) => {
    if (!groups[permission.group]) {
      groups[permission.group] = [];
    }
    groups[permission.group].push(permission);
    return groups;
  }, {} as Record<string, any[]>);

export default function RolesManagementPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isUsersDialogOpen, setIsUsersDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<string>('roles');
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  // التحقق من تسجيل الدخول
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/admin/login');
    }
  }, [authLoading, isAuthenticated, navigate]);

  // استلام الأدوار من الخادم
  const { data: roles, isLoading: rolesLoading, isError: rolesError, refetch: refetchRoles } = useQuery<Role[]>({
    queryKey: ['/api/roles'],
    queryFn: async () => {
      try {
        // سنضيف نقطة نهاية API لاحقًا - في الوقت الحالي استخدم بيانات تجريبية للتطوير
        // const response = await fetch('/api/roles');
        // if (!response.ok) throw new Error('فشل في استلام الأدوار');
        // return response.json();
        
        // بيانات تجريبية للعرض أثناء التطوير
        return [
          {
            id: 1,
            name: 'مدير النظام',
            description: 'يملك كافة الصلاحيات في النظام',
            permissions: allPermissions,
            isDefault: false,
            createdAt: '2025-01-01T00:00:00Z',
            updatedAt: '2025-01-01T00:00:00Z',
          },
          {
            id: 2,
            name: 'محرر',
            description: 'يستطيع إدارة المحتوى ولكن بدون صلاحيات إدارية كاملة',
            permissions: [
              'dashboard.view',
              'scholarships.view',
              'scholarships.create',
              'scholarships.edit',
              'categories.view',
              'categories.manage',
              'levels.view',
              'countries.view',
              'posts.view',
              'posts.create',
              'posts.edit',
              'pages.view',
              'pages.manage',
              'media.view',
              'media.upload',
            ],
            isDefault: false,
            createdAt: '2025-01-05T00:00:00Z',
            updatedAt: '2025-01-05T00:00:00Z',
          },
          {
            id: 3,
            name: 'مستخدم',
            description: 'مستخدم عادي مع صلاحيات محدودة',
            permissions: [
              'dashboard.view',
              'scholarships.view',
              'categories.view',
              'levels.view',
              'countries.view',
              'posts.view',
              'pages.view',
              'media.view',
            ],
            isDefault: true,
            createdAt: '2025-01-10T00:00:00Z',
            updatedAt: '2025-01-10T00:00:00Z',
          },
        ] as Role[];
      } catch (error) {
        console.error('Error fetching roles:', error);
        throw error;
      }
    },
    enabled: isAuthenticated,
  });

  // استلام المستخدمين من الخادم
  const { data: users, isLoading: usersLoading, isError: usersError, refetch: refetchUsers } = useQuery<User[]>({
    queryKey: ['/api/users'],
    queryFn: async () => {
      try {
        // سنضيف نقطة نهاية API لاحقًا - في الوقت الحالي استخدم بيانات تجريبية للتطوير
        // const response = await fetch('/api/users');
        // if (!response.ok) throw new Error('فشل في استلام المستخدمين');
        // return response.json();
        
        // بيانات تجريبية للعرض أثناء التطوير
        return [
          {
            id: 1,
            username: 'admin',
            email: 'admin@example.com',
            roleId: 1,
            createdAt: '2025-01-01T00:00:00Z',
          },
          {
            id: 2,
            username: 'editor',
            email: 'editor@example.com',
            roleId: 2,
            createdAt: '2025-01-05T00:00:00Z',
          },
          {
            id: 3,
            username: 'user1',
            email: 'user1@example.com',
            roleId: 3,
            createdAt: '2025-01-10T00:00:00Z',
          },
        ] as User[];
      } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
      }
    },
    enabled: isAuthenticated && activeTab === 'users',
  });

  // نموذج إضافة دور جديد
  const addForm = useForm<RoleFormValues>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: '',
      description: '',
      permissions: [],
    },
  });

  // نموذج تعديل دور
  const editForm = useForm<RoleFormValues>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: selectedRole?.name || '',
      description: selectedRole?.description || '',
      permissions: selectedRole?.permissions || [],
    },
  });

  // تحديث قيم نموذج التعديل عند تغيير الدور المحدد
  useEffect(() => {
    if (selectedRole) {
      editForm.setValue('name', selectedRole.name);
      editForm.setValue('description', selectedRole.description || '');
      editForm.setValue('permissions', selectedRole.permissions);
    }
  }, [selectedRole, editForm]);

  // إضافة دور جديد - mutation
  const addMutation = useMutation({
    mutationFn: async (data: RoleFormValues) => {
      // في التطبيق الحقيقي سنرسل إلى الخادم
      // const response = await fetch('/api/roles', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data),
      // });
      // if (!response.ok) throw new Error('فشل في إضافة الدور');
      // return response.json();
      
      // محاكاة الاستجابة
      return {
        ...data,
        id: roles ? Math.max(...roles.map(r => r.id)) + 1 : 1,
        isDefault: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/roles'] });
      setIsAddDialogOpen(false);
      addForm.reset();
      toast({
        title: "تم إضافة الدور بنجاح",
        description: "تم إنشاء الدور الجديد وإضافته إلى النظام",
      });
    },
    onError: (error) => {
      console.error('Error adding role:', error);
      toast({
        title: "خطأ في إضافة الدور",
        description: "حدث خطأ أثناء محاولة إضافة الدور الجديد",
        variant: "destructive",
      });
    },
  });

  // تعديل دور - mutation
  const editMutation = useMutation({
    mutationFn: async (data: RoleFormValues) => {
      if (!selectedRole) throw new Error('لم يتم تحديد دور للتعديل');
      
      // في التطبيق الحقيقي سنرسل إلى الخادم
      // const response = await fetch(`/api/roles/${selectedRole.id}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data),
      // });
      // if (!response.ok) throw new Error('فشل في تعديل الدور');
      // return response.json();
      
      // محاكاة الاستجابة
      return {
        ...selectedRole,
        ...data,
        updatedAt: new Date().toISOString(),
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/roles'] });
      setIsEditDialogOpen(false);
      toast({
        title: "تم تحديث الدور بنجاح",
        description: "تم تحديث معلومات وصلاحيات الدور",
      });
    },
    onError: (error) => {
      console.error('Error updating role:', error);
      toast({
        title: "خطأ في تحديث الدور",
        description: "حدث خطأ أثناء محاولة تحديث الدور",
        variant: "destructive",
      });
    },
  });

  // حذف دور - mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!selectedRole) throw new Error('لم يتم تحديد دور للحذف');
      
      // في التطبيق الحقيقي سنرسل إلى الخادم
      // const response = await fetch(`/api/roles/${selectedRole.id}`, {
      //   method: 'DELETE',
      // });
      // if (!response.ok) throw new Error('فشل في حذف الدور');
      // return response.json();
      
      // محاكاة الاستجابة
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/roles'] });
      setIsDeleteDialogOpen(false);
      toast({
        title: "تم حذف الدور بنجاح",
        description: "تم حذف الدور من النظام بنجاح",
      });
    },
    onError: (error) => {
      console.error('Error deleting role:', error);
      toast({
        title: "خطأ في حذف الدور",
        description: "حدث خطأ أثناء محاولة حذف الدور",
        variant: "destructive",
      });
    },
  });

  // تقديم نموذج إضافة دور جديد
  const onSubmitAdd = (data: RoleFormValues) => {
    addMutation.mutate(data);
  };

  // تقديم نموذج تعديل دور
  const onSubmitEdit = (data: RoleFormValues) => {
    editMutation.mutate(data);
  };

  // تعيين دور للمستخدم - mutation
  const assignRoleMutation = useMutation({
    mutationFn: async ({ userId, roleId }: { userId: number, roleId: number }) => {
      // في التطبيق الحقيقي سنرسل إلى الخادم
      // const response = await fetch(`/api/users/${userId}/role`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ roleId }),
      // });
      // if (!response.ok) throw new Error('فشل في تعيين الدور للمستخدم');
      // return response.json();
      
      // محاكاة الاستجابة
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      setIsAssignDialogOpen(false);
      toast({
        title: "تم تعيين الدور بنجاح",
        description: "تم تحديث دور المستخدم بنجاح",
      });
    },
    onError: (error) => {
      console.error('Error assigning role:', error);
      toast({
        title: "خطأ في تعيين الدور",
        description: "حدث خطأ أثناء محاولة تعيين الدور للمستخدم",
        variant: "destructive",
      });
    },
  });

  // التحقق مما إذا كانت جميع الأذونات محددة
  const isAllSelected = () => {
    const permissions = addForm.getValues('permissions');
    return allPermissions.every(permission => permissions.includes(permission));
  };

  // التحقق مما إذا كانت جميع أذونات مجموعة معينة محددة
  const isGroupSelected = (group: string) => {
    const permissions = addForm.getValues('permissions');
    const groupPermissions = groupedPermissions[group].map(p => p.id);
    return groupPermissions.every(permission => permissions.includes(permission));
  };

  // تحديد/إلغاء تحديد جميع الأذونات
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      addForm.setValue('permissions', allPermissions);
    } else {
      addForm.setValue('permissions', []);
    }
  };

  // تحديد/إلغاء تحديد جميع أذونات مجموعة معينة
  const handleSelectAllInGroup = (group: string, checked: boolean) => {
    const currentPermissions = addForm.getValues('permissions');
    const groupPermissions = groupedPermissions[group].map(p => p.id);
    
    if (checked) {
      // إضافة جميع أذونات المجموعة التي لم تكن محددة بالفعل
      const newPermissions = [...new Set([...currentPermissions, ...groupPermissions])];
      addForm.setValue('permissions', newPermissions);
    } else {
      // إزالة جميع أذونات المجموعة
      const newPermissions = currentPermissions.filter(p => !groupPermissions.includes(p));
      addForm.setValue('permissions', newPermissions);
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
  
  // تحضير أزرار الإجراءات لشريط العنوان
  const actions = (
    <>
      <Button variant="outline" onClick={() => {
        refetchRoles();
        refetchUsers();
      }}>
        <RefreshCw className="ml-2 h-4 w-4" />
        تحديث
      </Button>
      
      <Button onClick={() => {
        setSelectedRole(null);
        setIsAddDialogOpen(true);
      }}>
        <PlusCircle className="ml-2 h-4 w-4" />
        إضافة دور جديد
      </Button>
    </>
  );

  return (
    <AdminLayout title="إدارة الأدوار والتصاريح" actions={actions}>
      <div className="p-4 md:p-6">
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => activeTab === 'roles' ? refetchRoles() : refetchUsers()}>
            <RefreshCw className="ml-2 h-4 w-4" />
            تحديث
          </Button>
          
          {activeTab === 'roles' && (
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="ml-2 h-4 w-4" />
                  إضافة دور جديد
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>إضافة دور جديد</DialogTitle>
                  <DialogDescription>
                    قم بإنشاء دور جديد وتعيين الأذونات المناسبة له.
                  </DialogDescription>
                </DialogHeader>
                <Form {...addForm}>
                  <form onSubmit={addForm.handleSubmit(onSubmitAdd)} className="space-y-6">
                    <FormField
                      control={addForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>اسم الدور</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="مثال: محرر محتوى" />
                          </FormControl>
                          <FormDescription>
                            اسم الدور كما سيظهر في النظام
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
                          <FormLabel>وصف الدور (اختياري)</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="وصف مختصر للدور وصلاحياته"
                              rows={2}
                            />
                          </FormControl>
                          <FormDescription>
                            وصف موجز لمسؤوليات وصلاحيات هذا الدور
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="border rounded-md p-4 space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-md font-medium">الأذونات والصلاحيات</h3>
                        <div className="flex items-center space-x-1 space-x-reverse">
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <Checkbox
                              id="select-all"
                              checked={isAllSelected()}
                              onCheckedChange={handleSelectAll}
                              aria-label="تحديد الكل"
                            />
                            <label
                              htmlFor="select-all"
                              className="text-sm font-medium leading-none cursor-pointer"
                            >
                              تحديد الكل
                            </label>
                          </div>
                        </div>
                      </div>
                      
                      <FormField
                        control={addForm.control}
                        name="permissions"
                        render={() => (
                          <FormItem>
                            <div className="grid gap-4">
                              {Object.entries(groupedPermissions).map(([group, permissions]) => (
                                <div key={group} className="space-y-2">
                                  <div className="flex items-center space-x-2 space-x-reverse">
                                    <Checkbox
                                      id={`group-${group}`}
                                      checked={isGroupSelected(group)}
                                      onCheckedChange={(checked) => handleSelectAllInGroup(group, checked === true)}
                                      aria-label={`تحديد كل أذونات ${group}`}
                                    />
                                    <label
                                      htmlFor={`group-${group}`}
                                      className="text-sm font-medium leading-none cursor-pointer"
                                    >
                                      {group}
                                    </label>
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mr-6 border-r pr-3 border-dashed">
                                    {permissions.map((permission) => (
                                      <FormField
                                        key={permission.id}
                                        control={addForm.control}
                                        name="permissions"
                                        render={({ field }) => {
                                          return (
                                            <FormItem
                                              key={permission.id}
                                              className="flex flex-row items-start space-x-2 space-x-reverse"
                                            >
                                              <FormControl>
                                                <Checkbox
                                                  checked={field.value?.includes(permission.id)}
                                                  onCheckedChange={(checked) => {
                                                    return checked
                                                      ? field.onChange([...field.value, permission.id])
                                                      : field.onChange(
                                                          field.value?.filter(
                                                            (value) => value !== permission.id
                                                          )
                                                        )
                                                  }}
                                                />
                                              </FormControl>
                                              <FormLabel className="text-sm font-normal cursor-pointer">
                                                {permission.label}
                                              </FormLabel>
                                            </FormItem>
                                          )
                                        }}
                                      />
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
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
                            إنشاء الدور
                          </>
                        )}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="roles">
            <Shield className="ml-2 h-4 w-4" />
            الأدوار
          </TabsTrigger>
          <TabsTrigger value="users">
            <User className="ml-2 h-4 w-4" />
            المستخدمين والأدوار
          </TabsTrigger>
        </TabsList>
        
        {/* تبويب الأدوار */}
        <TabsContent value="roles">
          <Card>
            <CardHeader>
              <CardTitle>قائمة الأدوار</CardTitle>
              <CardDescription>
                إدارة الأدوار وتصاريح المستخدمين في النظام
              </CardDescription>
            </CardHeader>
            <CardContent>
              {rolesLoading ? (
                <div className="flex justify-center items-center h-32">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                  <span className="mr-2">جاري التحميل...</span>
                </div>
              ) : rolesError ? (
                <div className="text-center py-4 text-red-500">
                  <p>حدث خطأ أثناء تحميل البيانات. يرجى المحاولة مرة أخرى.</p>
                  <Button variant="outline" onClick={() => refetchRoles()} className="mt-2">
                    إعادة المحاولة
                  </Button>
                </div>
              ) : roles && roles.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12 text-right">الرقم</TableHead>
                        <TableHead className="text-right">اسم الدور</TableHead>
                        <TableHead className="text-right">الوصف</TableHead>
                        <TableHead className="text-right">الأذونات</TableHead>
                        <TableHead className="text-right">الحالة</TableHead>
                        <TableHead className="text-left w-[180px]">الإجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {roles.map((role) => (
                        <TableRow key={role.id}>
                          <TableCell>{role.id}</TableCell>
                          <TableCell className="font-medium">{role.name}</TableCell>
                          <TableCell>{role.description || '-'}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1 space-x-reverse">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-6 w-6" 
                                onClick={() => {
                                  setSelectedRole(role);
                                  setIsEditDialogOpen(true);
                                }}
                                title="عرض الأذونات"
                              >
                                <Key className="h-3.5 w-3.5" />
                              </Button>
                              <Badge variant="outline">
                                {role.permissions.length} أذونات
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            {role.isDefault ? (
                              <Badge>افتراضي</Badge>
                            ) : (
                              <Badge variant="outline">عادي</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => {
                                  setSelectedRole(role);
                                  setIsEditDialogOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => {
                                  setSelectedRole(role);
                                  setIsUsersDialogOpen(true);
                                }}
                              >
                                <User className="h-4 w-4" />
                              </Button>
                              {!role.isDefault && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-red-500 hover:text-red-700"
                                  onClick={() => {
                                    setSelectedRole(role);
                                    setIsDeleteDialogOpen(true);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <p>لا توجد أدوار بعد. قم بإضافة دور جديد للبدء.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* تبويب المستخدمين */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>المستخدمين والأدوار</CardTitle>
              <CardDescription>
                إدارة أدوار المستخدمين وتعديلها
              </CardDescription>
            </CardHeader>
            <CardContent>
              {usersLoading ? (
                <div className="flex justify-center items-center h-32">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                  <span className="mr-2">جاري التحميل...</span>
                </div>
              ) : usersError ? (
                <div className="text-center py-4 text-red-500">
                  <p>حدث خطأ أثناء تحميل بيانات المستخدمين. يرجى المحاولة مرة أخرى.</p>
                  <Button variant="outline" onClick={() => refetchUsers()} className="mt-2">
                    إعادة المحاولة
                  </Button>
                </div>
              ) : users && users.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12 text-right">الرقم</TableHead>
                        <TableHead className="text-right">اسم المستخدم</TableHead>
                        <TableHead className="text-right">البريد الإلكتروني</TableHead>
                        <TableHead className="text-right">الدور</TableHead>
                        <TableHead className="text-right">تاريخ الإنشاء</TableHead>
                        <TableHead className="text-left w-[100px]">الإجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => {
                        const userRole = roles?.find(r => r.id === user.roleId);
                        
                        return (
                          <TableRow key={user.id}>
                            <TableCell>{user.id}</TableCell>
                            <TableCell className="font-medium">{user.username}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                              <Badge variant={userRole?.isDefault ? "default" : "outline"}>
                                {userRole?.name || 'غير معروف'}
                              </Badge>
                            </TableCell>
                            <TableCell>{new Date(user.createdAt).toLocaleDateString('ar-SA')}</TableCell>
                            <TableCell>
                              <div className="flex justify-end">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setIsAssignDialogOpen(true);
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <p>لا يوجد مستخدمين في النظام.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* حوار تعديل الدور */}
      {selectedRole && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>تعديل دور: {selectedRole.name}</DialogTitle>
              <DialogDescription>
                قم بتعديل معلومات الدور وتحديد الأذونات المناسبة.
              </DialogDescription>
            </DialogHeader>
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(onSubmitEdit)} className="space-y-6">
                <FormField
                  control={editForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>اسم الدور</FormLabel>
                      <FormControl>
                        <Input {...field} />
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
                      <FormLabel>وصف الدور (اختياري)</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={2} />
                      </FormControl>
                      <FormDescription>
                        وصف موجز لمسؤوليات وصلاحيات هذا الدور
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="border rounded-md p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-md font-medium">الأذونات والصلاحيات</h3>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => {
                          if (editForm.getValues('permissions').length === allPermissions.length) {
                            editForm.setValue('permissions', []);
                          } else {
                            editForm.setValue('permissions', [...allPermissions]);
                          }
                        }}
                      >
                        {editForm.getValues('permissions').length === allPermissions.length ? 'إلغاء تحديد الكل' : 'تحديد الكل'}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid gap-4">
                    {Object.entries(groupedPermissions).map(([group, permissions]) => (
                      <div key={group} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-medium">{group}</div>
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => {
                              const currentPermissions = editForm.getValues('permissions');
                              const groupPermissionIds = permissions.map(p => p.id);
                              const allSelected = groupPermissionIds.every(id => currentPermissions.includes(id));
                              
                              if (allSelected) {
                                // إلغاء تحديد كل الأذونات في هذه المجموعة
                                editForm.setValue(
                                  'permissions',
                                  currentPermissions.filter(id => !groupPermissionIds.includes(id))
                                );
                              } else {
                                // تحديد كل الأذونات في هذه المجموعة
                                const newPermissions = [...currentPermissions];
                                groupPermissionIds.forEach(id => {
                                  if (!newPermissions.includes(id)) {
                                    newPermissions.push(id);
                                  }
                                });
                                editForm.setValue('permissions', newPermissions);
                              }
                            }}
                          >
                            {permissions.every(p => editForm.getValues('permissions').includes(p.id)) 
                              ? 'إلغاء تحديد الكل' 
                              : 'تحديد الكل'}
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mr-6 border-r pr-3 border-dashed">
                          {permissions.map((permission) => (
                            <FormField
                              key={permission.id}
                              control={editForm.control}
                              name="permissions"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={permission.id}
                                    className="flex flex-row items-start space-x-2 space-x-reverse"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(permission.id)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...field.value, permission.id])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== permission.id
                                                )
                                              )
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="text-sm font-normal cursor-pointer">
                                      {permission.label}
                                    </FormLabel>
                                  </FormItem>
                                )
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <DialogFooter>
                  <Button type="submit" disabled={editMutation.isPending}>
                    {editMutation.isPending ? (
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
          </DialogContent>
        </Dialog>
      )}
      
      {/* حوار حذف الدور */}
      {selectedRole && (
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>هل أنت متأكد من حذف هذا الدور؟</AlertDialogTitle>
              <AlertDialogDescription>
                سيتم حذف الدور "{selectedRole.name}" من النظام. هذا الإجراء لا يمكن التراجع عنه.
                <br />
                المستخدمين المرتبطين بهذا الدور سيتم نقلهم إلى الدور الافتراضي.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>إلغاء</AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => deleteMutation.mutate()}
                className="bg-destructive hover:bg-destructive/90"
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? (
                  <>
                    <RefreshCw className="ml-2 h-4 w-4 animate-spin" />
                    جاري الحذف...
                  </>
                ) : (
                  <>
                    <Trash2 className="ml-2 h-4 w-4" />
                    حذف الدور
                  </>
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
      
      {/* حوار عرض المستخدمين بدور معين */}
      {selectedRole && (
        <Dialog open={isUsersDialogOpen} onOpenChange={setIsUsersDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>المستخدمون بدور: {selectedRole.name}</DialogTitle>
              <DialogDescription>
                قائمة المستخدمين الذين يملكون هذا الدور في النظام
              </DialogDescription>
            </DialogHeader>
            {usersLoading ? (
              <div className="flex justify-center items-center h-32">
                <RefreshCw className="h-6 w-6 animate-spin" />
                <span className="mr-2">جاري التحميل...</span>
              </div>
            ) : users?.filter(u => u.roleId === selectedRole.id).length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <p>لا يوجد مستخدمين يملكون هذا الدور حاليًا.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12 text-right">الرقم</TableHead>
                      <TableHead className="text-right">اسم المستخدم</TableHead>
                      <TableHead className="text-right">البريد الإلكتروني</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users
                      ?.filter(u => u.roleId === selectedRole.id)
                      .map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>{user.id}</TableCell>
                          <TableCell>{user.username}</TableCell>
                          <TableCell>{user.email}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
      
      {/* حوار تعيين دور للمستخدم */}
      {selectedUser && (
        <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>تغيير دور المستخدم</DialogTitle>
              <DialogDescription>
                اختر الدور الذي تريد تعيينه للمستخدم {selectedUser.username}
              </DialogDescription>
            </DialogHeader>
            {rolesLoading ? (
              <div className="flex justify-center items-center h-32">
                <RefreshCw className="h-6 w-6 animate-spin" />
                <span className="mr-2">جاري التحميل...</span>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  {roles?.map((role) => (
                    <div key={role.id} className="flex items-center space-x-2 space-x-reverse p-2 rounded-md hover:bg-muted">
                      <Checkbox
                        id={`role-${role.id}`}
                        checked={selectedUser.roleId === role.id}
                        onCheckedChange={() => {
                          assignRoleMutation.mutate({
                            userId: selectedUser.id,
                            roleId: role.id
                          });
                        }}
                      />
                      <div className="flex flex-col mr-2">
                        <label htmlFor={`role-${role.id}`} className="text-sm font-medium cursor-pointer">
                          {role.name}
                          {role.isDefault && <Badge className="mr-2 text-xs">افتراضي</Badge>}
                        </label>
                        {role.description && (
                          <p className="text-xs text-muted-foreground">{role.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </AdminLayout>
  );
}