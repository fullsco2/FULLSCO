import type { Metadata } from 'next';
import { LoginPage } from '@/components/auth/login-page';

export const metadata: Metadata = {
  title: 'تسجيل الدخول | منصة فولسكو',
  description: 'قم بتسجيل الدخول إلى حسابك في منصة فولسكو',
};

export default function LoginRoute() {
  return <LoginPage />;
}
