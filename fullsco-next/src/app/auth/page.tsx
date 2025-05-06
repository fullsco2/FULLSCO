import type { Metadata } from 'next';
import { AuthPage } from '@/components/auth/auth-page';

export const metadata: Metadata = {
  title: 'تسجيل الدخول | منصة فولسكو',
  description: 'قم بتسجيل الدخول أو إنشاء حساب جديد في منصة فولسكو',
};

export default function AuthRoute() {
  return <AuthPage />;
}
