import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { LockKeyhole, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const loginSchema = z.object({
  username: z.string().min(1, 'اسم المستخدم مطلوب'),
  password: z.string().min(1, 'كلمة المرور مطلوبة'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const { login, loginStatus, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  // سنستخدم useEffect بدلاً من القيام بعملية التوجيه المباشر
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin/dashboard');
    }
  }, [isAuthenticated, navigate]);
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const onSubmit = (data: LoginFormValues) => {
    login(data);
  };

  // استخدام useEffect لعرض رسالة الخطأ
  useEffect(() => {
    if (loginStatus.isError) {
      toast({
        title: "فشل تسجيل الدخول",
        description: "اسم المستخدم أو كلمة المرور غير صحيحة. حاول مرة أخرى.",
        variant: "destructive",
      });
    }
  }, [loginStatus.isError, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <span className="text-3xl font-bold text-primary">
            FULL<span className="text-accent">SCO</span> <span className="text-primary/70 text-xl">Admin</span>
          </span>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">تسجيل الدخول إلى لوحة التحكم</CardTitle>
            <CardDescription>
              أدخل بيانات الاعتماد للوصول إلى منطقة الإدارة
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
                      <FormControl>
                        <div className="relative">
                          <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500">
                            <User className="h-5 w-5" />
                          </span>
                          <Input 
                            placeholder="أدخل اسم المستخدم" 
                            className="pr-10" 
                            {...field} 
                          />
                        </div>
                      </FormControl>
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
                      <FormControl>
                        <div className="relative">
                          <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500">
                            <LockKeyhole className="h-5 w-5" />
                          </span>
                          <Input 
                            type="password" 
                            placeholder="أدخل كلمة المرور" 
                            className="pr-10" 
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={loginStatus.isLoading}
                >
                  {loginStatus.isLoading ? 'جارٍ تسجيل الدخول...' : 'تسجيل الدخول'}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col">
            <p className="text-center text-sm text-gray-600 mt-2">
              بيانات العرض التوضيحي: اسم المستخدم <span className="font-semibold">admin</span> / كلمة المرور <span className="font-semibold">admin123</span>
            </p>
          </CardFooter>
        </Card>
        
        <div className="mt-6 text-center">
          <a href="/" className="text-sm text-primary hover:text-primary-700">
            العودة إلى الصفحة الرئيسية
          </a>
        </div>
      </div>
    </div>
  );
}
