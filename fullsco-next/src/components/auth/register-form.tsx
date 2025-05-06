"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

// مخطط التحقق من بيانات التسجيل
const registerSchema = z.object({
  username: z.string().min(3, {
    message: "اسم المستخدم يجب أن يحتوي على الأقل 3 أحرف",
  }),
  email: z.string().email({
    message: "البريد الإلكتروني غير صالح",
  }),
  password: z.string().min(6, {
    message: "كلمة المرور يجب أن تحتوي على الأقل 6 أحرف",
  }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "كلمات المرور غير متطابقة",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterForm({ callbackUrl }: { callbackUrl?: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // إعداد نموذج react-hook-form
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(data: RegisterFormValues) {
    setIsLoading(true);
    
    try {
      // إزالة حقل تأكيد كلمة المرور قبل الإرسال
      const { confirmPassword, ...registerData } = data;
      
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "حدث خطأ أثناء إنشاء الحساب");
      }

      toast({
        title: "تم إنشاء الحساب بنجاح",
        description: "مرحبًا بك في منصة المنح الدراسية",
      });

      // إعادة توجيه المستخدم إلى الصفحة المطلوبة أو الصفحة الرئيسية
      router.push(callbackUrl || "/");
      router.refresh(); // تحديث حالة المستخدم في واجهة المستخدم
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "فشل إنشاء الحساب",
        description: error instanceof Error ? error.message : "حدث خطأ غير معروف",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>اسم المستخدم</FormLabel>
              <FormControl>
                <Input 
                  placeholder="أدخل اسم المستخدم" 
                  {...field} 
                  disabled={isLoading}
                />
              </FormControl>
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
              <FormControl>
                <Input 
                  type="email"
                  placeholder="أدخل البريد الإلكتروني" 
                  {...field} 
                  disabled={isLoading}
                />
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
                <Input 
                  type="password" 
                  placeholder="أدخل كلمة المرور" 
                  {...field} 
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>تأكيد كلمة المرور</FormLabel>
              <FormControl>
                <Input 
                  type="password" 
                  placeholder="أعد إدخال كلمة المرور" 
                  {...field} 
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "جاري إنشاء الحساب..." : "إنشاء حساب جديد"}
        </Button>
      </form>
    </Form>
  );
}
