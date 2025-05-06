'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Loader2,
  KeyRound,
  Mail,
  LogIn,
  UserPlus,
  ArrowLeft,
} from 'lucide-react';

// مخطط التحقق
const loginSchema = z.object({
  username: z.string().min(3, {
    message: 'اسم المستخدم يجب أن يتكون من 3 أحرف على الأقل',
  }),
  password: z.string().min(6, {
    message: 'كلمة المرور يجب أن تتكون من 6 أحرف على الأقل',
  }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // إعداد نموذج تسجيل الدخول
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  // معالجة تقديم النموذج
  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'فشل تسجيل الدخول');
      }

      // تم تسجيل الدخول بنجاح
      toast({
        title: 'تم تسجيل الدخول بنجاح',
        description: 'مرحباً بك مرة أخرى في منصة فولسكو',
      });

      // الانتقال إلى لوحة التحكم
      router.push('/admin/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: 'فشل تسجيل الدخول',
        description: error instanceof Error ? error.message : 'حدث خطأ أثناء محاولة تسجيل الدخول',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">تسجيل الدخول</CardTitle>
          <CardDescription>
            أدخل اسم المستخدم وكلمة المرور للوصول إلى حسابك
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>اسم المستخدم</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          placeholder="أدخل اسم المستخدم"
                          className="pr-10"
                          disabled={isLoading}
                          {...field}
                        />
                      </FormControl>
                      <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>كلمة المرور</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="كلمة المرور"
                          className="pr-10"
                          disabled={isLoading}
                          {...field}
                        />
                      </FormControl>
                      <KeyRound className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    جاري تسجيل الدخول...
                  </>
                ) : (
                  <>
                    <LogIn className="ml-2 h-4 w-4" />
                    تسجيل الدخول
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-sm text-muted-foreground">
            ليس لديك حساب؟{' '}
            <Link href="/auth/register" className="text-primary hover:underline">
              <span className="inline-flex items-center">
                <UserPlus className="ml-1 h-4 w-4" />
                التسجيل
              </span>
            </Link>
          </div>
          <Button variant="outline" size="sm" className="w-full" onClick={() => router.push('/')}>
            <ArrowLeft className="ml-2 h-4 w-4" />
            العودة إلى الصفحة الرئيسية
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
