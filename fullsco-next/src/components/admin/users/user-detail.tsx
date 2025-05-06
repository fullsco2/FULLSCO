'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Pencil,
  Shield,
  Mail,
  Calendar,
  UserCog,
  Key,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
  ClipboardList,
  FileClock,
  RefreshCw,
  Trash,
} from 'lucide-react';
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
} from '@/components/ui/alert-dialog';

// نوع المستخدم
interface User {
  id: number;
  username: string;
  email: string;
  fullName?: string;
  role: 'admin' | 'editor' | 'user';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
}

export function UserDetail({ userId }: { userId: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // جلب بيانات المستخدم
  useEffect(() => {
    fetchUserDetails();
  }, [userId]);

  // جلب بيانات المستخدم من API
  const fetchUserDetails = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/users/${userId}`);

      if (!response.ok) {
        // إذا كان الرد 401 أو 403، فهذا يعني أن المستخدم غير مصرح له
        if (response.status === 401 || response.status === 403) {
          throw new Error('ليس لديك صلاحية الوصول إلى هذه البيانات');
        }
        // إذا كان الرد 404، فهذا يعني أن المستخدم غير موجود
        if (response.status === 404) {
          throw new Error('لم يتم العثور على المستخدم');
        }
        throw new Error(`خطأ في جلب بيانات المستخدم: ${response.status}`);
      }

      // محاكاة الرد عندما لا يكون الـ API جاهزًا
      // في التطبيق الفعلي، سيتم جلب البيانات من الخادم
      // API مع رد مثل { success: true, data: { ... } }
      setUser({
        id: parseInt(userId),
        username: 'admin',
        email: 'admin@example.com',
        fullName: 'مدير النظام',
        role: 'admin',
        isActive: true,
        createdAt: '2025-01-01T10:00:00Z',
        updatedAt: '2025-05-01T14:30:00Z',
        lastLogin: '2025-05-05T09:15:00Z',
      });
      
      // سيتم استبدال هذا بالشكل التالي:
      // const data = await response.json();
      // if (data.success && data.data) {
      //   setUser(data.data);
      // } else {
      //   throw new Error(data.message || 'فشل في جلب بيانات المستخدم');
      // }
      
    } catch (err) {
      console.error('Error fetching user details:', err);
      setError(err instanceof Error ? err.message : 'حدث خطأ غير معروف');
      toast({
        title: 'خطأ في جلب البيانات',
        description: err instanceof Error ? err.message : 'فشل في جلب بيانات المستخدم',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // تنسيق التاريخ
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'PPP', { locale: ar });
    } catch (error) {
      return dateString;
    }
  };

  // عرض شارة الدور
  const renderRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-red-500 hover:bg-red-600">مدير</Badge>;
      case 'editor':
        return <Badge className="bg-blue-500 hover:bg-blue-600">محرر</Badge>;
      case 'user':
        return <Badge variant="outline">مستخدم</Badge>;
      default:
        return <Badge variant="secondary">{role}</Badge>;
    }
  };

  // عرض حالة المستخدم
  const renderStatusBadge = (isActive: boolean) => {
    return isActive ? 
      <Badge variant="default" className="bg-green-500 hover:bg-green-600">نشط</Badge> : 
      <Badge variant="secondary">غير نشط</Badge>;
  };

  // محاكاة حذف مستخدم
  const handleDeleteUser = async () => {
    setIsDeleting(true);
    try {
      // في التطبيق الحقيقي، سيتم استدعاء الـ API لحذف المستخدم
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'تم حذف المستخدم',
        description: 'تم حذف المستخدم بنجاح',
      });
      
      router.push('/admin/users');
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: 'خطأ في الحذف',
        description: 'حدث خطأ أثناء محاولة حذف المستخدم',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // عرض شاشة التحميل
  if (isLoading) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="mr-2 text-lg font-medium">جاري تحميل بيانات المستخدم...</span>
      </div>
    );
  }

  // عرض رسالة الخطأ
  if (error) {
    return (
      <Card className="mx-auto max-w-2xl border-destructive">
        <CardHeader className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
          <CardTitle className="mt-2 text-xl">خطأ في جلب بيانات المستخدم</CardTitle>
          <CardDescription className="text-destructive">
            {error}
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-center gap-2">
          <Button onClick={() => router.push('/admin/users')}>
            <ArrowLeft className="ml-2 h-4 w-4" />
            العودة إلى قائمة المستخدمين
          </Button>
          <Button variant="outline" onClick={fetchUserDetails}>
            <RefreshCw className="ml-2 h-4 w-4" />
            إعادة المحاولة
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // إذا لم يتم العثور على المستخدم
  if (!user) {
    return (
      <Card className="mx-auto max-w-2xl border-destructive">
        <CardHeader className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
          <CardTitle className="mt-2 text-xl">المستخدم غير موجود</CardTitle>
          <CardDescription className="text-destructive">
            لم يتم العثور على المستخدم المطلوب
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-center">
          <Button onClick={() => router.push('/admin/users')}>
            <ArrowLeft className="ml-2 h-4 w-4" />
            العودة إلى قائمة المستخدمين
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* عنوان الصفحة وأزرار الإجراءات */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold">تفاصيل المستخدم</h2>
          <p className="text-sm text-muted-foreground">عرض وإدارة معلومات المستخدم</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => router.push('/admin/users')}>
            <ArrowLeft className="ml-2 h-4 w-4" />
            العودة
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => router.push(`/admin/users/${userId}/edit`)}
          >
            <Pencil className="ml-2 h-4 w-4" />
            تعديل
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash className="ml-2 h-4 w-4" />
                حذف
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>هل أنت متأكد من حذف هذا المستخدم؟</AlertDialogTitle>
                <AlertDialogDescription>
                  سيتم حذف هذا المستخدم بشكل نهائي. لا يمكن التراجع عن هذا الإجراء.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>إلغاء</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteUser}
                  disabled={isDeleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                      جاري الحذف...
                    </>
                  ) : (
                    'نعم، حذف المستخدم'
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* بطاقة المعلومات الأساسية */}
      <Card>
        <CardHeader>
          <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
            <div>
              <CardTitle className="text-xl">{user.fullName || user.username}</CardTitle>
              <CardDescription className="flex items-center gap-1 mt-1">
                <Shield className="h-4 w-4" />
                <span>{renderRoleBadge(user.role)}</span>
                <span className="mx-1">•</span>
                <span>{renderStatusBadge(user.isActive)}</span>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* المعلومات الأساسية */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">معلومات المستخدم</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-md border p-3">
                <div className="text-sm text-muted-foreground">اسم المستخدم</div>
                <div className="mt-1 font-medium">{user.username}</div>
              </div>
              <div className="rounded-md border p-3">
                <div className="text-sm text-muted-foreground">البريد الإلكتروني</div>
                <div className="mt-1 flex items-center font-medium">
                  <Mail className="mr-1 h-4 w-4 text-muted-foreground" />
                  {user.email}
                </div>
              </div>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-md border p-3">
                <div className="text-sm text-muted-foreground">الدور</div>
                <div className="mt-1 flex items-center font-medium">
                  <UserCog className="mr-1 h-4 w-4 text-muted-foreground" />
                  {renderRoleBadge(user.role)}
                </div>
              </div>
              <div className="rounded-md border p-3">
                <div className="text-sm text-muted-foreground">الحالة</div>
                <div className="mt-1 flex items-center font-medium">
                  {user.isActive ? (
                    <>
                      <CheckCircle2 className="mr-1 h-4 w-4 text-green-500" />
                      <span>نشط</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="mr-1 h-4 w-4 text-muted-foreground" />
                      <span>غير نشط</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <Separator />
          
          {/* معلومات التواريخ */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">معلومات التواريخ</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-md border p-3">
                <div className="text-sm text-muted-foreground">تاريخ التسجيل</div>
                <div className="mt-1 flex items-center font-medium">
                  <Calendar className="mr-1 h-4 w-4 text-muted-foreground" />
                  {formatDate(user.createdAt)}
                </div>
              </div>
              <div className="rounded-md border p-3">
                <div className="text-sm text-muted-foreground">آخر تحديث</div>
                <div className="mt-1 flex items-center font-medium">
                  <FileClock className="mr-1 h-4 w-4 text-muted-foreground" />
                  {formatDate(user.updatedAt)}
                </div>
              </div>
              <div className="rounded-md border p-3">
                <div className="text-sm text-muted-foreground">آخر تسجيل دخول</div>
                <div className="mt-1 flex items-center font-medium">
                  <Key className="mr-1 h-4 w-4 text-muted-foreground" />
                  {user.lastLogin ? formatDate(user.lastLogin) : '-'}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* علامات التبويب للمعلومات الإضافية */}
      <Tabs defaultValue="activities" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="activities">
            <ClipboardList className="mr-2 h-4 w-4" />
            نشاطات المستخدم
          </TabsTrigger>
          <TabsTrigger value="permissions">
            <Shield className="mr-2 h-4 w-4" />
            الصلاحيات
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="activities" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>نشاطات المستخدم</CardTitle>
              <CardDescription>سجل النشاطات الأخيرة للمستخدم</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md bg-muted p-6 text-center">
                <ClipboardList className="mx-auto h-10 w-10 text-muted-foreground/60" />
                <p className="mt-2 text-sm text-muted-foreground">سجل النشاطات سيكون متاحًا في الإصدار القادم</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="permissions" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>صلاحيات المستخدم</CardTitle>
              <CardDescription>إدارة صلاحيات المستخدم والأدوار</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md bg-muted p-6 text-center">
                <Shield className="mx-auto h-10 w-10 text-muted-foreground/60" />
                <p className="mt-2 text-sm text-muted-foreground">إدارة الصلاحيات ستكون متاحة في الإصدار القادم</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
