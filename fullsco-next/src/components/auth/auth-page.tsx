'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { LoginForm } from './login-form';
import { RegisterForm } from './register-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AuthPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  
  // التأكد من أن الكود ينفذ فقط على جانب العميل
  useEffect(() => {
    setMounted(true);
  }, []);

  // إعادة توجيه المستخدم المسجل دخوله بالفعل إلى الصفحة الرئيسية
  useEffect(() => {
    if (mounted && user && !isLoading) {
      router.push('/');
    }
  }, [user, isLoading, router, mounted]);

  // عرض صفحة تحميل أثناء التحقق من حالة المصادقة
  if (isLoading || !mounted) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  // عدم عرض صفحة المصادقة إذا كان المستخدم مسجل دخوله بالفعل
  if (user) {
    return null;
  }

  return (
    <div className="container mx-auto grid min-h-screen items-center px-4 py-12 md:grid-cols-2 md:gap-8 lg:gap-12">
      {/* قسم النموذج */}
      <div className="mx-auto w-full max-w-md space-y-6 rounded-lg border border-border bg-card p-6 shadow-sm dark:border-border/50 md:mx-0 md:p-8">
        <div className="text-center">
          <h1 className="mb-2 text-2xl font-bold text-foreground md:text-3xl">
            مرحباً بك في منصة فولسكو
          </h1>
          <p className="text-muted-foreground">
            قم بتسجيل الدخول أو إنشاء حساب جديد للوصول إلى خدمات المنصة
          </p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">تسجيل الدخول</TabsTrigger>
            <TabsTrigger value="register">إنشاء حساب</TabsTrigger>
          </TabsList>
          <TabsContent value="login" className="mt-4">
            <LoginForm />
          </TabsContent>
          <TabsContent value="register" className="mt-4">
            <RegisterForm />
          </TabsContent>
        </Tabs>
      </div>

      {/* قسم الشعار والوصف */}
      <div className="hidden text-center md:block">
        <div className="mx-auto max-w-md space-y-4">
          <h2 className="text-3xl font-bold text-foreground lg:text-4xl">
            ابحث عن المنح الدراسية المناسبة لك
          </h2>
          <p className="text-xl text-muted-foreground">
            اكتشف آلاف المنح الدراسية حول العالم واحصل على فرصتك للدراسة في أفضل الجامعات
          </p>
          <div className="mt-8 grid grid-cols-2 gap-4 text-center">
            <div className="rounded-lg bg-muted p-4">
              <div className="text-2xl font-bold text-primary">+5000</div>
              <div className="text-sm text-muted-foreground">منحة دراسية</div>
            </div>
            <div className="rounded-lg bg-muted p-4">
              <div className="text-2xl font-bold text-primary">+120</div>
              <div className="text-sm text-muted-foreground">دولة حول العالم</div>
            </div>
            <div className="rounded-lg bg-muted p-4">
              <div className="text-2xl font-bold text-primary">+250</div>
              <div className="text-sm text-muted-foreground">جامعة مرموقة</div>
            </div>
            <div className="rounded-lg bg-muted p-4">
              <div className="text-2xl font-bold text-primary">+1000</div>
              <div className="text-sm text-muted-foreground">طالب استفاد</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
