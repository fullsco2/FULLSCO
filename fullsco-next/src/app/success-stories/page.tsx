import type { Metadata } from 'next';

import SuccessStoriesPage from '@/components/success-stories/success-stories-page';

export const metadata: Metadata = {
  title: 'قصص نجاح | منصة فولسكو',
  description: 'قصص نجاح ملهمة لطلاب حصلوا على منح دراسية وتجارب حقيقية للطلاب للهام الآخرين',
};

export default function SuccessStories() {
  return <SuccessStoriesPage />;
}
