'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
  PlusCircle,
  RefreshCw,
  Search,
  Shield,
  Trash,
  Pencil,
  Eye,
  UserCog,
  AlertCircle,
  UserPlus,
  Mail,
  Calendar,
  Lock,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

interface ApiResponse {
  success: boolean;
  data: User[];
  message?: string;
}

export function UsersPage() {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const itemsPerPage = 10;

  // جلب قائمة المستخدمين من API
  useEffect(() => {
    fetchUsers();
  }, []);

  // جلب البيانات من API
  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/users');

      if (!response.ok) {
        throw new Error(`فشل في جلب قائمة المستخدمين: ${response.status}`);
      }

      const data = await response.json();

      if (data && Array.isArray(data)) {
        setUsers(data);
      } else if (data && data.data && Array.isArray(data.data)) {
        setUsers(data.data);
      } else {
        throw new Error('فشل في جلب بيانات المستخدمين');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err instanceof Error ? err.message : 'حدث خطأ غير معروف');
      toast({
        title: 'خطأ في جلب البيانات',
        description: err instanceof Error ? err.message : 'فشل في جلب قائمة المستخدمين',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // تصفية المستخدمين بناءً على البحث والفلاتر
  const filteredUsers = users.filter((user) => {
    // تصفية البحث
    const matchesSearch = (
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.fullName && user.fullName.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // تصفية الدور
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;

    // تصفية الحالة
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && user.isActive) || 
      (statusFilter === 'inactive' && !user.isActive);

    return matchesSearch && matchesRole && matchesStatus;
  });

  // تقسيم الصفحات
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

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

  // تنسيق التاريخ
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: ar });
    } catch (error) {
      return dateString;
    }
  };

  // محاكاة حذف مستخدم
  const handleDeleteUser = async (userId: number) => {
    setIsDeleting(true);
    try {
      // في التطبيق الحقيقي، سيتم استدعاء الـ API لحذف المستخدم
      toast({
        title: 'جاري تنفيذ الحذف',
        description: 'سيتم تنفيذ حذف المستخدم عند اكتمال الواجهة الخلفية لحذف المستخدمين',
        variant: 'default',
      });
      setSelectedUserId(null);
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

  // عرض شكل التحميل
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">إدارة المستخدمين</h2>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-[100px]" />
            <Skeleton className="h-9 w-[100px]" />
          </div>
        </div>
        <div className="rounded-md border">
          <div className="p-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <Skeleton className="h-9 w-[250px]" />
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Skeleton className="h-9 w-[120px]" />
                <Skeleton className="h-9 w-[120px]" />
              </div>
            </div>
          </div>
          <div className="relative w-full overflow-auto">
            <div className="p-4">
              {Array(5).fill(0).map((_, i) => (
                <div key={i} className="mb-4 flex flex-col gap-2">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // عرض رسالة الخطأ
  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <h2 className="text-2xl font-bold">إدارة المستخدمين</h2>
          <Button variant="outline" size="sm" onClick={fetchUsers}>
            <RefreshCw className="ml-2 h-4 w-4" />
            إعادة المحاولة
          </Button>
        </div>
        <div className="rounded-md border border-destructive p-4">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <p className="font-medium">فشل في جلب قائمة المستخدمين</p>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <h2 className="text-2xl font-bold">إدارة المستخدمين</h2>
        <div className="flex w-full gap-2 md:w-auto">
          <Button variant="outline" size="sm" onClick={fetchUsers}>
            <RefreshCw className="ml-2 h-4 w-4" />
            تحديث
          </Button>
          <Button size="sm" onClick={() => router.push('/admin/users/create')}>
            <UserPlus className="ml-2 h-4 w-4" />
            إضافة مستخدم
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <div className="border-b p-4">
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 md:max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="بحث عن مستخدم..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="h-9 w-[120px]">
                  <UserCog className="ml-2 h-4 w-4" />
                  <SelectValue placeholder="الدور" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأدوار</SelectItem>
                  <SelectItem value="admin">مدير</SelectItem>
                  <SelectItem value="editor">محرر</SelectItem>
                  <SelectItem value="user">مستخدم</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-9 w-[110px]">
                  <SelectValue placeholder="الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="active">نشط</SelectItem>
                  <SelectItem value="inactive">غير نشط</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <div className="relative w-full overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px] text-center">#</TableHead>
                <TableHead>اسم المستخدم</TableHead>
                <TableHead>البريد الإلكتروني</TableHead>
                <TableHead className="hidden md:table-cell">الدور</TableHead>
                <TableHead className="hidden md:table-cell">الحالة</TableHead>
                <TableHead className="hidden md:table-cell">تاريخ التسجيل</TableHead>
                <TableHead className="text-left">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedUsers.length > 0 ? (
                paginatedUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="text-center font-medium">{user.id}</TableCell>
                    <TableCell className="font-medium">
                      {user.fullName || user.username}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {renderRoleBadge(user.role)}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {renderStatusBadge(user.isActive)}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {formatDate(user.createdAt)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">فتح قائمة</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>الإجراءات</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => router.push(`/admin/users/${user.id}`)}>
                            <Eye className="ml-2 h-4 w-4" />
                            عرض التفاصيل
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => router.push(`/admin/users/${user.id}/edit`)}>
                            <Pencil className="ml-2 h-4 w-4" />
                            تعديل
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <Dialog>
                            <DialogTrigger asChild>
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <Lock className="ml-2 h-4 w-4" />
                                تغيير كلمة المرور
                              </DropdownMenuItem>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>تغيير كلمة المرور</DialogTitle>
                                <DialogDescription>
                                  هذه الوظيفة ستكون متاحة في واجهة المستخدم النهائية
                                </DialogDescription>
                              </DialogHeader>
                              <div className="py-6 text-center text-muted-foreground">
                                <Lock className="mx-auto mb-2 h-12 w-12" />
                                <p>سيتم تنفيذ هذه الميزة عند اكتمال واجهة المستخدم النهائية</p>
                              </div>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => document.querySelector<HTMLButtonElement>('[data-state="open"] [aria-label="Close"]')?.click()}>
                                  إغلاق
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                          <DropdownMenuItem 
                            className={user.isActive ? "text-orange-600 focus:text-orange-600" : "text-green-600 focus:text-green-600"}
                            onClick={() => {
                              toast({
                                title: user.isActive ? 'تعطيل الحساب' : 'تنشيط الحساب',
                                description: user.isActive ? 'سيتم تعطيل حساب المستخدم في الواجهة النهائية' : 'سيتم تنشيط حساب المستخدم في الواجهة النهائية',
                                variant: 'default',
                              });
                            }}
                          >
                            {user.isActive ? (
                              <>
                                <XCircle className="ml-2 h-4 w-4" />
                                تعطيل
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="ml-2 h-4 w-4" />
                                تنشيط
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem 
                                className="text-red-600 focus:text-red-600"
                                onSelect={(e) => e.preventDefault()}
                              >
                                <Trash className="ml-2 h-4 w-4" />
                                حذف
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>حذف مستخدم</AlertDialogTitle>
                                <AlertDialogDescription>
                                  هل أنت متأكد من حذف هذا المستخدم؟ لا يمكن التراجع عن هذه العملية.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteUser(user.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  disabled={isDeleting}
                                >
                                  {isDeleting ? (
                                    <>
                                      <RefreshCw className="ml-2 h-4 w-4 animate-spin" />
                                      جاري الحذف...
                                    </>
                                  ) : (
                                    'حذف'
                                  )}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <Shield className="h-8 w-8 text-muted-foreground/50" />
                      <p className="mt-2">لا يوجد مستخدمين متاحين حالياً</p>
                      <p className="text-sm">يمكنك إضافة مستخدم جديد من الزر أعلاه</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        {filteredUsers.length > 0 && (
          <div className="flex items-center justify-between border-t px-4 py-2">
            <div className="text-sm text-muted-foreground">
              عرض {Math.min(startIndex + 1, filteredUsers.length)} إلى {Math.min(startIndex + itemsPerPage, filteredUsers.length)} من {filteredUsers.length} مستخدم
            </div>
            <div className="flex items-center space-x-2 space-x-reverse">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              >
                <span className="sr-only">الصفحة الأولى</span>
                <ChevronsRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <span className="sr-only">الصفحة السابقة</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <span className="flex items-center gap-1 text-sm font-medium">
                الصفحة
                <span className="mx-1 text-muted-foreground">{currentPage}</span>
                من
                <span className="mx-1 text-muted-foreground">{totalPages || 1}</span>
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <span className="sr-only">الصفحة التالية</span>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                <span className="sr-only">الصفحة الأخيرة</span>
                <ChevronsLeft className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
