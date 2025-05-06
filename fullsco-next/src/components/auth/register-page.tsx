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
  User,
  LogIn,
  ArrowLeft,
} from 'lucide-react';

// مخطط التحقق
const registerSchema = z.object({
  username: z.string().min(3, {
    message: 'اسم المستخدم يجب أن يتكون من 3 أحرف على الأقل',
  }),
  email: z.string().email({
    message: 'البريد الإلكتروني غير صالح',
  }),
  password: z.string().min(6, {
    message: 'كلمة المرور يجب أن تتكون من 6 أحرف على الأقل',
  }),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // إعداد نموذج التسجيل
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
    },
  });

  // معالجة تقديم النموذج
  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'فشل التسجيل');
      }

      // تم التسجيل بنجاح
      toast({
        title: 'تم إنشاء الحساب بنجاح',
        description: 'يمكنك الآن تسجيل الدخول إلى حسابك',
      });

      // الانتقال إلى صفحة تسجيل الدخول
      router.push('/auth/login');
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: 'فشل التسجيل',
        description: error instanceof Error ? error.message : 'حدث خطأ أثناء محاولة إنشاء الحساب',
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
          <CardTitle className="text-2xl font-bold">إنشاء حساب جديد</CardTitle>
          <CardDescription>
            أدخل بياناتك لإنشاء حساب جديد
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
                      <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>البريد الإلكتروني</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="البريد الإلكتروني"
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
                    جاري التسجيل...
                  </>
                ) : (
                  <>
                    <User className="ml-2 h-4 w-4" />
                    إنشاء حساب
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-sm text-muted-foreground">
            لديك حساب بالفعل؟{' '}
            <Link href="/auth/login" className="text-primary hover:underline">
              <span className="inline-flex items-center">
                <LogIn className="ml-1 h-4 w-4" />
                تسجيل الدخول
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
