import { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import AuthPage from "@/components/auth/auth-page";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "المصادقة | بوابة المنح الدراسية",
  description: "تسجيل الدخول أو إنشاء حساب جديد للوصول إلى منصة المنح الدراسية",
};

export default async function AuthenticationPage({
  searchParams,
}: {
  searchParams: { callbackUrl?: string };
}) {
  // التحقق مما إذا كان المستخدم مسجل الدخول
  const user = await getCurrentUser();

  // إذا كان المستخدم مسجل الدخول، قم بتوجيهه إلى الصفحة الرئيسية أو صفحة العودة
  if (user) {
    redirect(searchParams.callbackUrl || "/");
  }

  return <AuthPage callbackUrl={searchParams.callbackUrl} />;
}
