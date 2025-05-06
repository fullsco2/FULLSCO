import type { Metadata } from 'next';
import { RegisterPage } from '@/components/auth/register-page';

export const metadata: Metadata = {
  title: 'التسجيل | منصة فولسكو',
  description: 'قم بإنشاء حساب جديد في منصة فولسكو',
};

export default function RegisterRoute() {
  return <RegisterPage />;
}
