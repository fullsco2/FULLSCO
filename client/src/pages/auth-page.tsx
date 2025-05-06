import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

// Login form schema
const loginFormSchema = z.object({
  username: z.string().min(1, "اسم المستخدم مطلوب"),
  password: z.string().min(1, "كلمة المرور مطلوبة"),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

// Register form schema
const registerFormSchema = z.object({
  username: z.string().min(3, "اسم المستخدم يجب أن يكون على الأقل 3 أحرف"),
  email: z.string().email("البريد الإلكتروني غير صالح"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون على الأقل 6 أحرف"),
  fullName: z.string().min(2, "الاسم الكامل مطلوب"),
});

type RegisterFormValues = z.infer<typeof registerFormSchema>;

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<string>('login');
  const { user, login, register, loginStatus, isLoading } = useAuth();
  const [location, navigate] = useLocation();

  // Redirect to home if already logged in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Register form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      fullName: "",
    },
  });

  // Form submission handlers
  const onLoginSubmit = (data: LoginFormValues) => {
    login(data);
  };

  const onRegisterSubmit = (data: RegisterFormValues) => {
    register(data);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12">
      <div className="flex flex-col md:flex-row gap-8 items-center">
        {/* Left Column - Auth Forms */}
        <div className="w-full md:w-1/2 space-y-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary">حساب المنصة</h1>
            <p className="text-muted-foreground mt-2">سجل دخولك للوصول إلى المزيد من المزايا</p>
          </div>

          <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">تسجيل دخول</TabsTrigger>
              <TabsTrigger value="register">حساب جديد</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle>تسجيل الدخول</CardTitle>
                  <CardDescription>
                    أدخل بيانات حسابك للوصول إلى منصة فلسكو
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>اسم المستخدم</FormLabel>
                            <FormControl>
                              <Input placeholder="أدخل اسم المستخدم" {...field} />
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
                            <FormLabel>كلمة المرور</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="أدخل كلمة المرور" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="submit" 
                        className="w-full mt-2"
                        disabled={loginStatus.isLoading}
                      >
                        {loginStatus.isLoading ? (
                          <>
                            <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                            جاري تسجيل الدخول...
                          </>
                        ) : (
                          "تسجيل الدخول"
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
                <CardFooter className="flex justify-center">
                  <div className="text-sm text-muted-foreground">
                    ليس لديك حساب؟{" "}
                    <Button variant="link" className="p-0" onClick={() => setActiveTab("register")}>
                      أنشئ حسابك الآن
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="register">
              <Card>
                <CardHeader>
                  <CardTitle>إنشاء حساب جديد</CardTitle>
                  <CardDescription>
                    أنشئ حسابك في منصة فلسكو للوصول إلى جميع المزايا
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                      <FormField
                        control={registerForm.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>الاسم الكامل</FormLabel>
                            <FormControl>
                              <Input placeholder="أدخل اسمك الكامل" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>اسم المستخدم</FormLabel>
                            <FormControl>
                              <Input placeholder="أدخل اسم المستخدم" {...field} />
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
                            <FormLabel>البريد الإلكتروني</FormLabel>
                            <FormControl>
                              <Input placeholder="أدخل البريد الإلكتروني" type="email" {...field} />
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
                            <FormLabel>كلمة المرور</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="أدخل كلمة المرور" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="submit" 
                        className="w-full mt-2"
                        disabled={loginStatus.isLoading}
                      >
                        {loginStatus.isLoading ? (
                          <>
                            <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                            جاري إنشاء الحساب...
                          </>
                        ) : (
                          "إنشاء حساب"
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
                <CardFooter className="flex justify-center">
                  <div className="text-sm text-muted-foreground">
                    لديك حساب بالفعل؟{" "}
                    <Button variant="link" className="p-0" onClick={() => setActiveTab("login")}>
                      تسجيل الدخول
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column - App Description */}
        <div className="w-full md:w-1/2 p-6 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-primary">منصة فلسكو للمنح الدراسية</h2>
            <p className="text-lg text-muted-foreground mt-2">وجهتك الأولى للعثور على المنح الدراسية المناسبة</p>
          </div>

          <div className="space-y-6">
            <div className="flex items-start">
              <div className="ml-4 p-2 bg-primary/20 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/></svg>
              </div>
              <div>
                <h3 className="font-semibold text-foreground">آلاف المنح الدراسية</h3>
                <p className="text-muted-foreground">اكتشف آلاف المنح الدراسية من مختلف أنحاء العالم والمحدثة باستمرار</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="ml-4 p-2 bg-primary/20 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="m8 3 4 8 5-5 5 15H2L8 3z"/></svg>
              </div>
              <div>
                <h3 className="font-semibold text-foreground">تصفية متقدمة</h3>
                <p className="text-muted-foreground">تصفية المنح حسب البلد أو التخصص أو المستوى الدراسي لإيجاد المنح الأنسب لك</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="ml-4 p-2 bg-primary/20 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>
              </div>
              <div>
                <h3 className="font-semibold text-foreground">حساب مميز</h3>
                <p className="text-muted-foreground">اكتشف المنح المناسبة لك واحفظها في المفضلة وتلقى إشعارات بالمنح الجديدة</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="ml-4 p-2 bg-primary/20 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M5.5 8.5 9 12l-3.5 3.5L2 12l3.5-3.5Z"/><path d="m12 2 3.5 3.5L12 9 8.5 5.5 12 2Z"/><path d="M18.5 8.5 22 12l-3.5 3.5L15 12l3.5-3.5Z"/><path d="m12 15 3.5 3.5L12 22l-3.5-3.5L12 15Z"/></svg>
              </div>
              <div>
                <h3 className="font-semibold text-foreground">موارد تعليمية</h3>
                <p className="text-muted-foreground">اطلع على مقالات ونصائح قيمة حول التقديم للمنح الدراسية وإعداد الملف الشخصي</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
