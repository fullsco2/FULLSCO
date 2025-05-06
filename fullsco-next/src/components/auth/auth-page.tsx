'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { TypographyH1, TypographyH2, TypographyP } from '@/components/ui/typography';
import { Loader2, ArrowRight } from 'lucide-react';

// Schemas de validación
const loginSchema = z.object({
  email: z.string().email({ message: '\u064a\u0631\u062c\u0649 \u0625\u062f\u062e\u0627\u0644 \u0628\u0631\u064a\u062f \u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a \u0635\u062d\u064a\u062d' }),
  password: z.string().min(8, { message: '\u064a\u062c\u0628 \u0623\u0646 \u062a\u062a\u0643\u0648\u0646 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0645\u0646 8 \u0623\u062d\u0631\u0641 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644' }),
});

const registerSchema = z.object({
  username: z.string().min(3, { message: '\u064a\u062c\u0628 \u0623\u0646 \u064a\u062a\u0643\u0648\u0646 \u0627\u0633\u0645 \u0627\u0644\u0645\u0633\u062a\u062e\u062f\u0645 \u0645\u0646 3 \u0623\u062d\u0631\u0641 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644' }),
  email: z.string().email({ message: '\u064a\u0631\u062c\u0649 \u0625\u062f\u062e\u0627\u0644 \u0628\u0631\u064a\u062f \u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a \u0635\u062d\u064a\u062d' }),
  password: z.string().min(8, { message: '\u064a\u062c\u0628 \u0623\u0646 \u062a\u062a\u0643\u0648\u0646 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0645\u0646 8 \u0623\u062d\u0631\u0641 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644' }),
  confirmPassword: z.string().min(8, { message: '\u064a\u062c\u0628 \u0623\u0646 \u062a\u062a\u0643\u0648\u0646 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0645\u0646 8 \u0623\u062d\u0631\u0641 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644' }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "\u0643\u0644\u0645\u0627\u062a \u0627\u0644\u0645\u0631\u0648\u0631 \u063a\u064a\u0631 \u0645\u062a\u0637\u0627\u0628\u0642\u0629",
  path: ["confirmPassword"],
});

type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;

export function AuthPage() {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null); // будем использовать для проверки авторизации
  const { toast } = useToast();
  const router = useRouter();

  // Проверка авторизации пользователя
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/user');
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          
          // Если пользователь уже авторизован, перенаправляем его на главную страницу
          router.push('/');
        }
      } catch (error) {
        console.error('Ошибка проверки авторизации:', error);
      }
    };
    
    checkAuth();
  }, [router]);

  // Форма входа
  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  // Форма регистрации
  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    }
  });

  // Обработка входа
  const onLoginSubmit = async (data: LoginForm) => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: data.email, // API использует username, но мы используем email
          password: data.password
        })
      });

      if (!response.ok) {
        throw new Error('\u062e\u0637\u0623 \u0641\u064a \u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062f\u062e\u0648\u0644');
      }

      const userData = await response.json();
      
      toast({
        title: "\u062a\u0645 \u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062f\u062e\u0648\u0644 \u0628\u0646\u062c\u0627\u062d",
        description: `\u0645\u0631\u062d\u0628\u0627\u064b \u0628\u0643 \u0645\u0631\u0629 \u0623\u062e\u0631\u0649${userData?.username ? `, ${userData.username}` : ''}!`,
      });

      // Перенаправление на главную страницу
      router.push('/');
      
    } catch (error) {
      console.error('Login error:', error);
      toast({
        variant: "destructive",
        title: "\u062e\u0637\u0623 \u0641\u064a \u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062f\u062e\u0648\u0644",
        description: error instanceof Error ? error.message : "\u062d\u062f\u062b \u062e\u0637\u0623 \u063a\u064a\u0631 \u0645\u062a\u0648\u0642\u0639",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Обработка регистрации
  const onRegisterSubmit = async (data: RegisterForm) => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: data.username,
          password: data.password,
          email: data.email
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '\u062e\u0637\u0623 \u0641\u064a \u0627\u0644\u062a\u0633\u062c\u064a\u0644');
      }

      const userData = await response.json();
      
      toast({
        title: "\u062a\u0645 \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u062d\u0633\u0627\u0628 \u0628\u0646\u062c\u0627\u062d",
        description: `\u0645\u0631\u062d\u0628\u0627\u064b \u0628\u0643${userData?.username ? `, ${userData.username}` : ''}!`,
      });

      // Перенаправление на главную страницу
      router.push('/');
      
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        variant: "destructive",
        title: "\u062e\u0637\u0623 \u0641\u064a \u0627\u0644\u062a\u0633\u062c\u064a\u0644",
        description: error instanceof Error ? error.message : "\u062d\u062f\u062b \u062e\u0637\u0623 \u063a\u064a\u0631 \u0645\u062a\u0648\u0642\u0639",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Если пользователь уже авторизован и еще не перенаправлен,
  // показываем загрузку
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-2">\u062c\u0627\u0631\u064a \u0627\u0644\u062a\u0648\u062c\u064a\u0647...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Левая колонка с формой */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center mb-8">
            <Link href="/" className="inline-block mb-6">
              <h2 className="text-3xl font-bold">\u0645\u0646\u0635\u0629 \u0627\u0644\u0645\u0646\u062d</h2>
            </Link>
          </div>

          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'login' | 'register')}>
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="login">\u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062f\u062e\u0648\u0644</TabsTrigger>
              <TabsTrigger value="register">\u0625\u0646\u0634\u0627\u0621 \u062d\u0633\u0627\u0628</TabsTrigger>
            </TabsList>

            {/* Форма входа */}
            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle>\u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062f\u062e\u0648\u0644</CardTitle>
                  <CardDescription>
                    \u0623\u062f\u062e\u0644 \u0628\u064a\u0627\u0646\u0627\u062a\u0643 \u0644\u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062f\u062e\u0648\u0644 \u0625\u0644\u0649 \u062d\u0633\u0627\u0628\u0643
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>\u0627\u0644\u0628\u0631\u064a\u062f \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="example@example.com"
                                type="email"
                                autoComplete="email"
                                disabled={isLoading}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="********"
                                type="password"
                                autoComplete="current-password"
                                disabled={isLoading}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? (
                          <>
                            <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                            \u062c\u0627\u0631\u064a \u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062f\u062e\u0648\u0644...
                          </>
                        ) : (
                          <>\u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062f\u062e\u0648\u0644</>
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
                <CardFooter className="flex flex-col items-center">
                  <div className="text-sm text-muted-foreground mt-2">
                    \u0644\u064a\u0633 \u0644\u062f\u064a\u0643 \u062d\u0633\u0627\u0628\u061f{" "}
                    <button
                      type="button"
                      className="text-primary hover:underline"
                      onClick={() => setActiveTab('register')}
                    >
                      \u0625\u0646\u0634\u0627\u0621 \u062d\u0633\u0627\u0628
                    </button>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Форма регистрации */}
            <TabsContent value="register">
              <Card>
                <CardHeader>
                  <CardTitle>\u0625\u0646\u0634\u0627\u0621 \u062d\u0633\u0627\u0628 \u062c\u062f\u064a\u062f</CardTitle>
                  <CardDescription>
                    \u0623\u062f\u062e\u0644 \u0628\u064a\u0627\u0646\u0627\u062a\u0643 \u0644\u0625\u0646\u0634\u0627\u0621 \u062d\u0633\u0627\u0628 \u062c\u062f\u064a\u062f
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>\u0627\u0633\u0645 \u0627\u0644\u0645\u0633\u062a\u062e\u062f\u0645</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="\u0627\u0633\u0645 \u0627\u0644\u0645\u0633\u062a\u062e\u062f\u0645"
                                autoComplete="username"
                                disabled={isLoading}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>\u0627\u0644\u0628\u0631\u064a\u062f \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="example@example.com"
                                type="email"
                                autoComplete="email"
                                disabled={isLoading}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="********"
                                type="password"
                                autoComplete="new-password"
                                disabled={isLoading}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>\u062a\u0623\u0643\u064a\u062f \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="********"
                                type="password"
                                autoComplete="new-password"
                                disabled={isLoading}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? (
                          <>
                            <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                            \u062c\u0627\u0631\u064a \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u062d\u0633\u0627\u0628...
                          </>
                        ) : (
                          <>\u0625\u0646\u0634\u0627\u0621 \u062d\u0633\u0627\u0628</>
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
                <CardFooter className="flex flex-col items-center">
                  <div className="text-sm text-muted-foreground mt-2">
                    \u0644\u062f\u064a\u0643 \u062d\u0633\u0627\u0628 \u0628\u0627\u0644\u0641\u0639\u0644\u061f{" "}
                    <button
                      type="button"
                      className="text-primary hover:underline"
                      onClick={() => setActiveTab('login')}
                    >
                      \u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062f\u062e\u0648\u0644
                    </button>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Правая колонка с информацией */}
      <div className="flex-1 bg-primary text-primary-foreground p-6 md:p-12 flex items-center hidden md:flex">
        <div className="max-w-lg mx-auto">
          <TypographyH1 className="text-4xl font-bold mb-6">\u0645\u0646\u0635\u0629 \u0627\u0644\u0645\u0646\u062d \u0627\u0644\u062f\u0631\u0627\u0633\u064a\u0629</TypographyH1>
          <TypographyH2 className="text-2xl font-semibold mb-4">\u0627\u0644\u0639\u062b\u0648\u0631 \u0639\u0644\u0649 \u0627\u0644\u0645\u0646\u062d\u0629 \u0627\u0644\u0645\u0646\u0627\u0633\u0628\u0629 \u0644\u0643</TypographyH2>
          
          <TypographyP className="text-lg mb-8">
            \u0627\u0646\u0636\u0645 \u0625\u0644\u0649 \u0645\u0646\u0635\u062a\u0646\u0627 \u0627\u0644\u064a\u0648\u0645 \u0648\u0627\u0643\u062a\u0634\u0641 \u0627\u0644\u0622\u0644\u0627\u0641 \u0645\u0646 \u0641\u0631\u0635 \u0627\u0644\u0645\u0646\u062d \u0627\u0644\u062f\u0631\u0627\u0633\u064a\u0629 \u062d\u0648\u0644 \u0627\u0644\u0639\u0627\u0644\u0645. \u0646\u062d\u0646 \u0646\u0633\u0627\u0639\u062f\u0643 \u0641\u064a \u0627\u0644\u0639\u062b\u0648\u0631 \u0639\u0644\u0649 \u0627\u0644\u0645\u0646\u062d\u0629 \u0627\u0644\u0645\u0646\u0627\u0633\u0628\u0629 \u0644\u0630\u0647\u0627\u0628\u0643 \u0641\u064a \u0631\u062d\u0644\u062a\u0643 \u0627\u0644\u062a\u0639\u0644\u064a\u0645\u064a\u0629.
          </TypographyP>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <ArrowRight className="ml-2 h-5 w-5" />
              <span>\u0627\u0644\u0628\u062d\u062b \u0641\u064a \u0645\u0646\u062d \u062f\u0631\u0627\u0633\u064a\u0629 \u0645\u0646 \u0645\u062e\u062a\u0644\u0641 \u0627\u0644\u062c\u0627\u0645\u0639\u0627\u062a</span>
            </div>
            <div className="flex items-center">
              <ArrowRight className="ml-2 h-5 w-5" />
              <span>\u062a\u0635\u0641\u064a\u0629 \u0627\u0644\u0646\u062a\u0627\u0626\u062c \u062d\u0633\u0628 \u0627\u0644\u062a\u062e\u0635\u0635 \u0648\u0627\u0644\u0628\u0644\u062f \u0648\u0627\u0644\u0645\u0633\u062a\u0648\u0649 \u0627\u0644\u062f\u0631\u0627\u0633\u064a</span>
            </div>
            <div className="flex items-center">
              <ArrowRight className="ml-2 h-5 w-5" />
              <span>\u0627\u0644\u062d\u0635\u0648\u0644 \u0639\u0644\u0649 \u0646\u0635\u0627\u0626\u062d \u0648\u0645\u0648\u0627\u0631\u062f \u0644\u0644\u062a\u0642\u062f\u064a\u0645 \u0644\u0644\u0645\u0646\u062d \u0627\u0644\u062f\u0631\u0627\u0633\u064a\u0629</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
