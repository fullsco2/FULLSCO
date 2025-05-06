import type { Metadata } from 'next';
import AuthPage from '@/components/auth/auth-page';

export const metadata: Metadata = {
  title: 'تسجيل الدخول | منصة فولسكو',
  description: 'قم بتسجيل الدخول أو إنشاء حساب جديد للوصول إلى خدمات المنصة',
};

export default function Auth() {
  return <AuthPage />;
}
