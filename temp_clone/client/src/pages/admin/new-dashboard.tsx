import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import AdminLayout from '@/components/admin/admin-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  RefreshCw,
  GraduationCap,
  Users,
  FileText,
  BarChart,
  TrendingUp,
  Eye,
  Mail,
  PlusCircle
} from 'lucide-react';
import { Link } from 'wouter';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function NewDashboard() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  // إحصائيات المنح
  const { data: scholarships, isLoading: scholarshipsLoading, refetch: refetchScholarships } = useQuery({
    queryKey: ['/api/scholarships'],
    queryFn: async () => {
      const response = await fetch('/api/scholarships');
      if (!response.ok) throw new Error('فشل في استلام المنح');
      return response.json();
    }
  });

  // إحصائيات المستخدمين
  const { data: users, isLoading: usersLoading, refetch: refetchUsers } = useQuery({
    queryKey: ['/api/users'],
    queryFn: async () => {
      const response = await fetch('/api/users');
      if (!response.ok) throw new Error('فشل في استلام المستخدمين');
      return response.json();
    }
  });

  // إحصائيات المقالات
  const { data: posts, isLoading: postsLoading, refetch: refetchPosts } = useQuery({
    queryKey: ['/api/posts'],
    queryFn: async () => {
      const response = await fetch('/api/posts');
      if (!response.ok) throw new Error('فشل في استلام المقالات');
      return response.json();
    }
  });

  // إحصائيات المشتركين في النشرة البريدية
  const { data: subscribers, isLoading: subscribersLoading, refetch: refetchSubscribers } = useQuery({
    queryKey: ['/api/subscribers'],
    queryFn: async () => {
      const response = await fetch('/api/subscribers');
      if (!response.ok) throw new Error('فشل في استلام المشتركين');
      return response.json();
    }
  });

  // تحديث جميع البيانات
  const refreshAll = async () => {
    setIsRefreshing(true);
    await Promise.all([
      refetchScholarships(),
      refetchUsers(),
      refetchPosts(),
      refetchSubscribers(),
    ]);
    setIsRefreshing(false);
  };

  // أزرار العمليات السريعة
  const ActionButtons = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button>
          <PlusCircle className="ml-2 h-4 w-4" />
          إضافة جديد
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuLabel>إضافة محتوى جديد</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <Link href="/admin/scholarships/create">
          <DropdownMenuItem>
            <GraduationCap className="ml-2 h-4 w-4" />
            منحة دراسية
          </DropdownMenuItem>
        </Link>
        <Link href="/admin/posts/create">
          <DropdownMenuItem>
            <FileText className="ml-2 h-4 w-4" />
            مقال جديد
          </DropdownMenuItem>
        </Link>
        <Link href="/admin/categories/create">
          <DropdownMenuItem>
            <GraduationCap className="ml-2 h-4 w-4" />
            تصنيف جديد
          </DropdownMenuItem>
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  // أزرار التحديث
  const RefreshButton = () => (
    <Button variant="outline" onClick={refreshAll} disabled={isRefreshing}>
      {isRefreshing ? (
        <>
          <RefreshCw className="ml-2 h-4 w-4 animate-spin" />
          جاري التحديث...
        </>
      ) : (
        <>
          <RefreshCw className="ml-2 h-4 w-4" />
          تحديث البيانات
        </>
      )}
    </Button>
  );

  return (
    <AdminLayout 
      title="لوحة التحكم" 
      actions={
        <>
          <RefreshButton />
          <ActionButtons />
        </>
      }
    >
      {/* صف البطاقات الإحصائية */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* بطاقة إحصائيات المنح */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center justify-between">
              <span>المنح الدراسية</span>
              <GraduationCap className="h-5 w-5 text-primary" />
            </CardTitle>
            <CardDescription>إجمالي المنح المنشورة</CardDescription>
          </CardHeader>
          <CardContent>
            {scholarshipsLoading ? (
              <div className="animate-pulse h-8 bg-muted rounded-md"></div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold">{scholarships?.length || 0}</span>
                <Link href="/admin/scholarships">
                  <Button variant="ghost" size="sm">عرض الكل</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* بطاقة إحصائيات المستخدمين */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center justify-between">
              <span>المستخدمين</span>
              <Users className="h-5 w-5 text-primary" />
            </CardTitle>
            <CardDescription>إجمالي المستخدمين المسجلين</CardDescription>
          </CardHeader>
          <CardContent>
            {usersLoading ? (
              <div className="animate-pulse h-8 bg-muted rounded-md"></div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold">{users?.length || 0}</span>
                <Link href="/admin/users">
                  <Button variant="ghost" size="sm">عرض الكل</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* بطاقة إحصائيات المقالات */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center justify-between">
              <span>المقالات</span>
              <FileText className="h-5 w-5 text-primary" />
            </CardTitle>
            <CardDescription>إجمالي المقالات المنشورة</CardDescription>
          </CardHeader>
          <CardContent>
            {postsLoading ? (
              <div className="animate-pulse h-8 bg-muted rounded-md"></div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold">{posts?.length || 0}</span>
                <Link href="/admin/posts">
                  <Button variant="ghost" size="sm">عرض الكل</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* بطاقة إحصائيات المشتركين */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center justify-between">
              <span>النشرة البريدية</span>
              <Mail className="h-5 w-5 text-primary" />
            </CardTitle>
            <CardDescription>إجمالي المشتركين في النشرة</CardDescription>
          </CardHeader>
          <CardContent>
            {subscribersLoading ? (
              <div className="animate-pulse h-8 bg-muted rounded-md"></div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold">{subscribers?.length || 0}</span>
                <Button variant="ghost" size="sm">عرض الكل</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* القسم الرئيسي */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* البطاقة الأولى: أحدث المنح الدراسية */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>آخر المنح الدراسية</CardTitle>
            <CardDescription>أحدث المنح الدراسية المضافة للموقع</CardDescription>
          </CardHeader>
          <CardContent>
            {scholarshipsLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse h-12 bg-muted rounded-md"></div>
                ))}
              </div>
            ) : scholarships?.length ? (
              <div className="space-y-2 divide-y">
                {scholarships.slice(0, 5).map((scholarship: any) => (
                  <div key={scholarship.id} className="pt-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium truncate max-w-[300px]">{scholarship.title}</h4>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <span className="ml-2">
                            {new Date(scholarship.deadline).toLocaleDateString('ar-SA')}
                          </span>
                          {scholarship.isFeatured && (
                            <span className="mr-2 bg-primary/10 text-primary text-xs py-0.5 px-1.5 rounded-full">
                              مميزة
                            </span>
                          )}
                        </div>
                      </div>
                      <Link href={`/admin/scholarships/edit/${scholarship.id}`}>
                        <Button variant="ghost" size="sm">تعديل</Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                لا توجد منح دراسية مضافة بعد
              </div>
            )}
          </CardContent>
        </Card>

        {/* بطاقة الإحصائيات والأنشطة */}
        <Card>
          <CardHeader>
            <CardTitle>أنشطة حديثة</CardTitle>
            <CardDescription>آخر الأنشطة على الموقع</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="ml-3 p-2 bg-primary/10 rounded-full">
                  <Eye className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">120+ مشاهدة</p>
                  <p className="text-xs text-muted-foreground">اليوم</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="ml-3 p-2 bg-primary/10 rounded-full">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">15 مشترك جديد</p>
                  <p className="text-xs text-muted-foreground">هذا الأسبوع</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="ml-3 p-2 bg-primary/10 rounded-full">
                  <GraduationCap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">5 منح جديدة</p>
                  <p className="text-xs text-muted-foreground">آخر 24 ساعة</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="ml-3 p-2 bg-primary/10 rounded-full">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">7 مشتركين جدد</p>
                  <p className="text-xs text-muted-foreground">في النشرة البريدية</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}