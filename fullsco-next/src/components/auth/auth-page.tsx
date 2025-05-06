'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LoginPage } from './login-page';
import { RegisterPage } from './register-page';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

type AuthMode = 'login' | 'register';

export function AuthPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // التحقق من حالة تسجيل الدخول
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          // المستخدم مسجل الدخول بالفعل
          setIsAuthenticated(true);
          // إعادة توجيه المستخدم إلى الصفحة الرئيسية
          router.push('/');
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, [router]);

  // إذا كان المستخدم مسجل الدخول بالفعل، لا تعرض صفحة تسجيل الدخول
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent"></div>
      </div>
    );
  }

  // إذا كان المستخدم مسجل الدخول بالفعل، لا تعرض صفحة تسجيل الدخول
  if (isAuthenticated) {
    return null; // لن يتم عرض هذا لأن هناك إعادة توجيه في useEffect
  }

  return (
    <div className="container mx-auto min-h-screen px-4 py-8 md:py-12">
      <div className="grid gap-6 md:grid-cols-2 md:gap-12 lg:gap-16">
        {/* الجانب الأيمن: النموذج */}
        <div className="flex flex-col justify-center">
          <div className="mx-auto w-full max-w-md">
            <Tabs 
              defaultValue={authMode} 
              onValueChange={(value) => setAuthMode(value as AuthMode)}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">تسجيل الدخول</TabsTrigger>
                <TabsTrigger value="register">التسجيل</TabsTrigger>
              </TabsList>
              <TabsContent value="login">
                <LoginPage />
              </TabsContent>
              <TabsContent value="register">
                <RegisterPage />
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* الجانب الأيسر: النص الترحيبي */}
        <div className="hidden rounded-lg bg-gradient-to-br from-primary/80 to-primary p-8 text-white shadow-lg md:flex md:flex-col md:justify-center">
          <div className="space-y-4">
            <h1 className="text-3xl font-bold tracking-tight lg:text-4xl">مرحباً بك في منصة فولسكو</h1>
            <p className="text-lg leading-relaxed">أكبر منصة للمنح الدراسية في العالم العربي تمكنك من العثور على منح دراسية تناسب طموحاتك.</p>
          </div>

          <div className="mt-8 space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              </div>
              <div>
                <h3 className="font-semibold">ابحث عن المنح</h3>
                <p className="text-sm">اكتشف أكثر من 1000 منحة دراسية متاحة حول العالم</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-book-marked"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/><polyline points="10 2 10 10 13 7 16 10 16 2"/></svg>
              </div>
              <div>
                <h3 className="font-semibold">اطلع على أحدث المقالات</h3>
                <p className="text-sm">نصائح ومعلومات قيمة حول الدراسة بالخارج</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-star"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              </div>
              <div>
                <h3 className="font-semibold">قصص نجاح ملهمة</h3>
                <p className="text-sm">قصص ملهمة لطلاب حققوا حلمهم بالدراسة بالخارج</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
