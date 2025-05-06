"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoginForm } from "@/components/auth/login-form";
import { RegisterForm } from "@/components/auth/register-form";

export default function AuthPage({
  callbackUrl,
}: {
  callbackUrl?: string;
}) {
  const [activeTab, setActiveTab] = useState<string>("login");
  const router = useRouter();

  return (
    <div className="container mx-auto flex h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-l">
        <div className="absolute inset-0 bg-primary" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="ml-2 h-6 w-6"
          >
            <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
          </svg>
          بوابة المنح الدراسية
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              &ldquo;تزود منصتنا الطلاب بفرص تعليمية متميزة حول العالم. انضم إلينا اليوم وابدأ رحلتك نحو النجاح الأكاديمي.&rdquo;
            </p>
            <footer className="text-sm">فريق بوابة المنح الدراسية</footer>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              {activeTab === "login" ? "تسجيل الدخول" : "إنشاء حساب جديد"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {activeTab === "login"
                ? "أدخل بيانات الدخول للوصول إلى حسابك"
                : "املأ البيانات التالية لإنشاء حساب جديد"}
            </p>
          </div>
          <Tabs
            defaultValue="login"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">تسجيل الدخول</TabsTrigger>
              <TabsTrigger value="register">حساب جديد</TabsTrigger>
            </TabsList>
            <TabsContent value="login" className="pt-4">
              <LoginForm callbackUrl={callbackUrl} />
            </TabsContent>
            <TabsContent value="register" className="pt-4">
              <RegisterForm callbackUrl={callbackUrl} />
            </TabsContent>
          </Tabs>
          <p className="px-8 text-center text-sm text-muted-foreground">
            بتسجيل دخولك، أنت توافق على{" "}
            <a
              href="/terms"
              className="underline underline-offset-4 hover:text-primary"
            >
              شروط الاستخدام
            </a>{" "}
            و{" "}
            <a
              href="/privacy"
              className="underline underline-offset-4 hover:text-primary"
            >
              سياسة الخصوصية
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
