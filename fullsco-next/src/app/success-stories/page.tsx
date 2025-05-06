import { Metadata } from 'next';
import { SuccessStoriesPage } from '@/components/success-stories/success-stories-page';

export const metadata: Metadata = {
  title: 'قصص نجاح | منصة المنح الدراسية',
  description: 'قصص نجاح الطلاب الذين حصلوا على منح دراسية وتجاربهم التعليمية',
};

export default function SuccessStoriesPage() {
  return <SuccessStoriesPage />;
}
