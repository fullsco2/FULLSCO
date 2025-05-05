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
  }, {} as Record<string, typeof Object.values<typeof availablePermissions[keyof typeof availablePermissions]>[number][]>);

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
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
            email: 'admin@fullsco.com',
            roleId: 1,
            createdAt: '2025-01-01T00:00:00Z',
          },
          {
            id: 2,
            username: 'editor',
            email: 'editor@fullsco.com',
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
          {
            id: 4,
            username: 'user2',
            email: 'user2@example.com',
            roleId: 3,
            createdAt: '2025-01-15T00:00:00Z',
          },
        ] as User[];
      } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
      }
    },
    enabled: isAuthenticated && activeTab === 'users',
  });

  // إضافة دور جديد
  const addMutation = useMutation({
    mutationFn: async (newRole: RoleFormValues) => {
      // سيتم إضافة نقطة نهاية API لاحقًا
      // const response = await fetch('/api/roles', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(newRole),
      // });
      // if (!response.ok) throw new Error('فشل في إضافة الدور');
      // return response.json();
      
      // محاكاة استجابة API
      const now = new Date().toISOString();
      const id = Math.max(0, ...roles?.map(role => role.id) || []) + 1;
      
      return { 
        ...newRole, 
        id, 
        isDefault: false,
        createdAt: now, 
        updatedAt: now 
      } as Role;
    },
    onSuccess: (newRole) => {
      queryClient.setQueryData(['/api/roles'], (old: Role[] | undefined) => 
        [...(old || []), newRole]
      );
      toast({ title: 'تم الإضافة بنجاح', description: 'تمت إضافة الدور الجديد بنجاح' });
      setIsAddDialogOpen(false);
    },
    onError: (error) => {
      toast({ title: 'خطأ!', description: `فشل في إضافة الدور: ${error.message}`, variant: 'destructive' });
    }
  });

  // تعديل دور
  const updateMutation = useMutation({
    mutationFn: async ({ id, role }: { id: number, role: RoleFormValues }) => {
      // سيتم إضافة نقطة نهاية API لاحقًا
      // const response = await fetch(`/api/roles/${id}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(role),
      // });
      // if (!response.ok) throw new Error('فشل في تحديث الدور');
      // return response.json();
      
      // محاكاة استجابة API
      const existingRole = roles?.find(r => r.id === id);
      
      if (!existingRole) {
        throw new Error('الدور غير موجود');
      }
      
      return { 
        ...existingRole, 
        ...role,
        updatedAt: new Date().toISOString() 
      } as Role;
    },
    onSuccess: (updatedRole) => {
      queryClient.setQueryData(['/api/roles'], (old: Role[] | undefined) => 
        (old || []).map(role => role.id === updatedRole.id ? updatedRole : role)
      );
      toast({ title: 'تم التحديث بنجاح', description: 'تم تحديث الدور بنجاح' });
      setIsEditDialogOpen(false);
      setSelectedRole(null);
    },
    onError: (error) => {
      toast({ title: 'خطأ!', description: `فشل في تحديث الدور: ${error.message}`, variant: 'destructive' });
    }
  });

  // حذف دور
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      // سيتم إضافة نقطة نهاية API لاحقًا
      // const response = await fetch(`/api/roles/${id}`, {
      //   method: 'DELETE',
      // });
      // if (!response.ok) throw new Error('فشل في حذف الدور');
      // return response.json();
      
      // محاكاة استجابة API
      return { success: true, id };
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['/api/roles'], (old: Role[] | undefined) => 
        (old || []).filter(role => role.id !== data.id)
      );
      toast({ title: 'تم الحذف بنجاح', description: 'تم حذف الدور بنجاح' });
      setIsDeleteDialogOpen(false);
      setSelectedRole(null);
    },
    onError: (error) => {
      toast({ title: 'خطأ!', description: `فشل في حذف الدور: ${error.message}`, variant: 'destructive' });
    }
  });

  // تعيين دور للمستخدم
  const assignRoleMutation = useMutation({
    mutationFn: async ({ userId, roleId }: { userId: number, roleId: number }) => {
      // سيتم إضافة نقطة نهاية API لاحقًا
      // const response = await fetch(`/api/users/${userId}/role`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ roleId }),
      // });
      // if (!response.ok) throw new Error('فشل في تعيين الدور للمستخدم');
      // return response.json();
      
      // محاكاة استجابة API
      const user = users?.find(u => u.id === userId);
      
      if (!user) {
        throw new Error('المستخدم غير موجود');
      }
      
      return { 
        ...user, 
        roleId 
      } as User;
    },
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(['/api/users'], (old: User[] | undefined) => 
        (old || []).map(user => user.id === updatedUser.id ? updatedUser : user)
      );
      toast({ title: 'تم التعيين بنجاح', description: 'تم تعيين الدور للمستخدم بنجاح' });
      setIsAssignDialogOpen(false);
      setSelectedUser(null);
    },
    onError: (error) => {
      toast({ title: 'خطأ!', description: `فشل في تعيين الدور للمستخدم: ${error.message}`, variant: 'destructive' });
    }
  });

  // تعيين الدور الافتراضي
  const setDefaultMutation = useMutation({
    mutationFn: async (id: number) => {
      // سيتم إضافة نقطة نهاية API لاحقًا
      // const response = await fetch(`/api/roles/${id}/default`, {
      //   method: 'PUT',
      // });
      // if (!response.ok) throw new Error('فشل في تعيين الدور الافتراضي');
      // return response.json();
      
      // محاكاة استجابة API
      return { success: true, id };
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['/api/roles'], (old: Role[] | undefined) => 
        (old || []).map(role => ({
          ...role,
          isDefault: role.id === data.id,
        }))
      );
      toast({ title: 'تم التعيين بنجاح', description: 'تم تعيين الدور الافتراضي بنجاح' });
    },
    onError: (error) => {
      toast({ title: 'خطأ!', description: `فشل في تعيين الدور الافتراضي: ${error.message}`, variant: 'destructive' });
    }
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

  // نموذج تعيين دور للمستخدم
  const assignForm = useForm<{ roleId: number }>({
    defaultValues: {
      roleId: selectedUser?.roleId || 0,
    },
  });

  // تحديث نموذج التعديل عند تغيير الدور المحدد
  useEffect(() => {
    if (selectedRole) {
      editForm.reset({
        name: selectedRole.name,
        description: selectedRole.description || '',
        permissions: selectedRole.permissions,
      });
    }
  }, [selectedRole, editForm]);

  // تحديث نموذج التعيين عند تغيير المستخدم المحدد
  useEffect(() => {
    if (selectedUser) {
      assignForm.reset({
        roleId: selectedUser.roleId,
      });
    }
  }, [selectedUser, assignForm]);

  // إعادة ضبط نموذج الإضافة عند فتح نافذة الإضافة
  useEffect(() => {
    if (isAddDialogOpen) {
      addForm.reset({
        name: '',
        description: '',
        permissions: [],
      });
    }
  }, [isAddDialogOpen, addForm]);

  // معالجة حدث إرسال نموذج الإضافة
  const onSubmitAdd = (data: RoleFormValues) => {
    addMutation.mutate(data);
  };

  // معالجة حدث إرسال نموذج التعديل
  const onSubmitEdit = (data: RoleFormValues) => {
    if (selectedRole) {
      updateMutation.mutate({ id: selectedRole.id, role: data });
    }
  };

  // معالجة حدث إرسال نموذج التعيين
  const onSubmitAssign = (data: { roleId: number }) => {
    if (selectedUser) {
      assignRoleMutation.mutate({ userId: selectedUser.id, roleId: data.roleId });
    }
  };

  // الحصول على اسم الدور من معرف الدور
  const getRoleName = (roleId: number) => {
    const role = roles?.find(r => r.id === roleId);
    return role?.name || 'غير معروف';
  };

  // معالجة تحديد جميع الأذونات في مجموعة
  const handleSelectAllInGroup = (group: string, checked: boolean) => {
    const groupPermissions = groupedPermissions[group].map(p => p.id);
    
    if (isEditDialogOpen) {
      const currentPermissions = new Set(editForm.getValues('permissions'));
      
      if (checked) {
        groupPermissions.forEach(p => currentPermissions.add(p));
      } else {
        groupPermissions.forEach(p => currentPermissions.delete(p));
      }
      
      editForm.setValue('permissions', Array.from(currentPermissions));
    } else if (isAddDialogOpen) {
      const currentPermissions = new Set(addForm.getValues('permissions'));
      
      if (checked) {
        groupPermissions.forEach(p => currentPermissions.add(p));
      } else {
        groupPermissions.forEach(p => currentPermissions.delete(p));
      }
      
      addForm.setValue('permissions', Array.from(currentPermissions));
    }
  };

  // التحقق مما إذا كانت جميع الأذونات في مجموعة محددة
  const isGroupSelected = (group: string) => {
    const groupPermissions = groupedPermissions[group].map(p => p.id);
    
    if (isEditDialogOpen) {
      const currentPermissions = editForm.getValues('permissions');
      return groupPermissions.every(p => currentPermissions.includes(p));
    } else if (isAddDialogOpen) {
      const currentPermissions = addForm.getValues('permissions');
      return groupPermissions.every(p => currentPermissions.includes(p));
    }
    
    return false;
  };

  // التحقق مما إذا كانت بعض الأذونات في مجموعة محددة
  const isGroupIndeterminate = (group: string) => {
    const groupPermissions = groupedPermissions[group].map(p => p.id);
    
    if (isEditDialogOpen) {
      const currentPermissions = editForm.getValues('permissions');
      const selected = groupPermissions.filter(p => currentPermissions.includes(p));
      return selected.length > 0 && selected.length < groupPermissions.length;
    } else if (isAddDialogOpen) {
      const currentPermissions = addForm.getValues('permissions');
      const selected = groupPermissions.filter(p => currentPermissions.includes(p));
      return selected.length > 0 && selected.length < groupPermissions.length;
    }
    
    return false;
  };

  // معالجة تحديد جميع الأذونات
  const handleSelectAll = (checked: boolean) => {
    if (isEditDialogOpen) {
      editForm.setValue('permissions', checked ? allPermissions : []);
    } else if (isAddDialogOpen) {
      addForm.setValue('permissions', checked ? allPermissions : []);
    }
  };

  // التحقق مما إذا كانت جميع الأذونات محددة
  const isAllSelected = () => {
    if (isEditDialogOpen) {
      const currentPermissions = editForm.getValues('permissions');
      return allPermissions.every(p => currentPermissions.includes(p));
    } else if (isAddDialogOpen) {
      const currentPermissions = addForm.getValues('permissions');
      return allPermissions.every(p => currentPermissions.includes(p));
    }
    
    return false;
  };

  // التحقق مما إذا كانت بعض الأذونات محددة
  const isAllIndeterminate = () => {
    if (isEditDialogOpen) {
      const currentPermissions = editForm.getValues('permissions');
      return currentPermissions.length > 0 && currentPermissions.length < allPermissions.length;
    } else if (isAddDialogOpen) {
      const currentPermissions = addForm.getValues('permissions');
      return currentPermissions.length > 0 && currentPermissions.length < allPermissions.length;
    }
    
    return false;
  };

  // نسخ قائمة الأذونات إلى الحافظة
  const copyPermissions = (permissions: string[]) => {
    navigator.clipboard.writeText(permissions.join(', '))
      .then(() => {
        toast({ title: 'تم النسخ', description: 'تم نسخ قائمة الأذونات إلى الحافظة' });
      })
      .catch(error => {
        toast({ title: 'خطأ!', description: 'فشل في نسخ قائمة الأذونات', variant: 'destructive' });
        console.error('Failed to copy permissions:', error);
      });
  };

  // في حالة تحميل بيانات المصادقة أو عدم تسجيل الدخول
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
          console.log('Roles: closing sidebar');
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
              <h1 className="text-xl md:text-2xl font-bold">إدارة الأدوار والتصاريح</h1>
            </div>
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
                                    title="نسخ قائمة الأذونات"
                                    onClick={() => copyPermissions(role.permissions)}
                                  >
                                    <Copy className="h-3.5 w-3.5" />
                                  </Button>
                                  <span className="text-sm text-muted-foreground">
                                    {role.permissions.length} إذن
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                {role.isDefault ? (
                                  <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
                                    افتراضي
                                  </Badge>
                                ) : (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-xs h-7"
                                    onClick={() => setDefaultMutation.mutate(role.id)}
                                    disabled={setDefaultMutation.isPending}
                                  >
                                    تعيين كافتراضي
                                  </Button>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="flex justify-end gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    title="عرض المستخدمين"
                                    onClick={() => {
                                      setSelectedRole(role);
                                      setIsUsersDialogOpen(true);
                                    }}
                                  >
                                    <User className="h-4 w-4" />
                                  </Button>
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
                                  {!role.isDefault && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-red-500"
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
                      <p>لا توجد أدوار حاليًا.</p>
                      <Button variant="outline" onClick={() => setIsAddDialogOpen(true)} className="mt-2">
                        إضافة دور جديد
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* تبويب المستخدمين */}
            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <CardTitle>قائمة المستخدمين وأدوارهم</CardTitle>
                  <CardDescription>
                    إدارة أدوار المستخدمين في النظام
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
                      <p>حدث خطأ أثناء تحميل البيانات. يرجى المحاولة مرة أخرى.</p>
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
                            <TableHead className="text-right">تاريخ التسجيل</TableHead>
                            <TableHead className="text-left w-[120px]">الإجراءات</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {users.map((user) => (
                            <TableRow key={user.id}>
                              <TableCell>{user.id}</TableCell>
                              <TableCell className="font-medium">{user.username}</TableCell>
                              <TableCell>{user.email}</TableCell>
                              <TableCell>
                                <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
                                  {getRoleName(user.roleId)}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {new Date(user.createdAt).toLocaleDateString('ar-SA')}
                              </TableCell>
                              <TableCell>
                                <div className="flex justify-end gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => {
                                      setSelectedUser(user);
                                      setIsAssignDialogOpen(true);
                                    }}
                                  >
                                    <Key className="h-4 w-4" />
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
                      <p>لا يوجد مستخدمين حاليًا.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* نافذة تعديل الدور */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>تعديل الدور</DialogTitle>
                <DialogDescription>
                  قم بتعديل اسم الدور والأذونات المرتبطة به.
                </DialogDescription>
              </DialogHeader>
              {selectedRole && (
                <Form {...editForm}>
                  <form onSubmit={editForm.handleSubmit(onSubmitEdit)} className="space-y-6">
                    <FormField
                      control={editForm.control}
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
                      control={editForm.control}
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
                              id="select-all-edit"
                              checked={isAllSelected()}
                              onCheckedChange={handleSelectAll}
                              aria-label="تحديد الكل"
                            />
                            <label
                              htmlFor="select-all-edit"
                              className="text-sm font-medium leading-none cursor-pointer"
                            >
                              تحديد الكل
                            </label>
                          </div>
                        </div>
                      </div>
                      
                      <FormField
                        control={editForm.control}
                        name="permissions"
                        render={() => (
                          <FormItem>
                            <div className="grid gap-4">
                              {Object.entries(groupedPermissions).map(([group, permissions]) => (
                                <div key={group} className="space-y-2">
                                  <div className="flex items-center space-x-2 space-x-reverse">
                                    <Checkbox
                                      id={`group-edit-${group}`}
                                      checked={isGroupSelected(group)}
                                      onCheckedChange={(checked) => handleSelectAllInGroup(group, checked === true)}
                                      aria-label={`تحديد كل أذونات ${group}`}
                                    />
                                    <label
                                      htmlFor={`group-edit-${group}`}
                                      className="text-sm font-medium leading-none cursor-pointer"
                                    >
                                      {group}
                                    </label>
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
                            <FormMessage />
                          </FormItem>
                        )}
                      />
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

          {/* نافذة حذف الدور */}
          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
                <AlertDialogDescription>
                  سيتم حذف الدور "{selectedRole?.name}" بشكل نهائي.
                  هذا الإجراء لا يمكن التراجع عنه. 
                  <br />
                  ملاحظة: لن يتم حذف المستخدمين المرتبطين بهذا الدور، ولكن سيتم تعيين الدور الافتراضي لهم.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>إلغاء</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => selectedRole && deleteMutation.mutate(selectedRole.id)}
                  className="bg-red-500 hover:bg-red-600"
                >
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

          {/* نافذة تعيين دور للمستخدم */}
          <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>تعيين دور للمستخدم</DialogTitle>
                <DialogDescription>
                  قم بتغيير دور المستخدم {selectedUser?.username}.
                </DialogDescription>
              </DialogHeader>
              {selectedUser && (
                <form onSubmit={assignForm.handleSubmit(onSubmitAssign)} className="space-y-4">
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <label htmlFor="role" className="text-sm font-medium leading-none">
                        الدور
                      </label>
                      <select
                        id="role"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={assignForm.getValues('roleId')}
                        onChange={(e) => assignForm.setValue('roleId', parseInt(e.target.value))}
                      >
                        {roles?.map((role) => (
                          <option key={role.id} value={role.id}>
                            {role.name}
                          </option>
                        ))}
                      </select>
                      <p className="text-sm text-muted-foreground">
                        حدد الدور الذي تريد تعيينه لهذا المستخدم
                      </p>
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button type="submit" disabled={assignRoleMutation.isPending}>
                      {assignRoleMutation.isPending ? (
                        <>
                          <RefreshCw className="ml-2 h-4 w-4 animate-spin" />
                          جاري الحفظ...
                        </>
                      ) : (
                        <>
                          <Check className="ml-2 h-4 w-4" />
                          تعيين الدور
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              )}
            </DialogContent>
          </Dialog>

          {/* نافذة مستخدمي الدور */}
          <Dialog open={isUsersDialogOpen} onOpenChange={setIsUsersDialogOpen}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>مستخدمو الدور: {selectedRole?.name}</DialogTitle>
                <DialogDescription>
                  قائمة المستخدمين الذين يملكون هذا الدور
                </DialogDescription>
              </DialogHeader>
              {selectedRole && users && (
                <div className="space-y-4">
                  {(() => {
                    const roleUsers = users.filter(user => user.roleId === selectedRole.id);
                    
                    if (roleUsers.length === 0) {
                      return (
                        <div className="text-center py-6 text-muted-foreground">
                          <p>لا يوجد مستخدمين يملكون هذا الدور حاليًا.</p>
                        </div>
                      );
                    }
                    
                    return (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-12 text-right">الرقم</TableHead>
                              <TableHead className="text-right">اسم المستخدم</TableHead>
                              <TableHead className="text-right">البريد الإلكتروني</TableHead>
                              <TableHead className="text-right">تاريخ التسجيل</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {roleUsers.map(user => (
                              <TableRow key={user.id}>
                                <TableCell>{user.id}</TableCell>
                                <TableCell className="font-medium">{user.username}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>
                                  {new Date(user.createdAt).toLocaleDateString('ar-SA')}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    );
                  })()}
                  
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsUsersDialogOpen(false)}>
                      إغلاق
                    </Button>
                  </DialogFooter>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
}