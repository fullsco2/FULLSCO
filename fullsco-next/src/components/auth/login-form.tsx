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

// مخطط التحقق من بيانات تسجيل الدخول
const loginSchema = z.object({
  username: z.string().min(3, {
    message: "اسم المستخدم يجب أن يحتوي على الأقل 3 أحرف",
  }),
  password: z.string().min(6, {
    message: "كلمة المرور يجب أن تحتوي على الأقل 6 أحرف",
  }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm({ callbackUrl }: { callbackUrl?: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // إعداد نموذج react-hook-form
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true);
    
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "حدث خطأ أثناء تسجيل الدخول");
      }

      toast({
        title: "تم تسجيل الدخول بنجاح",
        description: "مرحبًا بك مرة أخرى في منصة المنح الدراسية",
      });

      // إعادة توجيه المستخدم إلى الصفحة المطلوبة أو الصفحة الرئيسية
      router.push(callbackUrl || "/");
      router.refresh(); // تحديث حالة المستخدم في واجهة المستخدم
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "فشل تسجيل الدخول",
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
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
        </Button>
      </form>
    </Form>
  );
}
