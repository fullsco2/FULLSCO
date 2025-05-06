import { Metadata } from 'next';
import { ScholarshipsPage } from '@/components/scholarships/scholarships-page';

export const metadata: Metadata = {
  title: 'المنح الدراسية | منصة المنح',
  description: 'تصفح أحدث المنح الدراسية المتاحة في مختلف الجامعات العالمية وابحث عن المنحة المناسبة لك',
  openGraph: {
    title: 'المنح الدراسية | منصة المنح',
    description: 'تصفح أحدث المنح الدراسية المتاحة في مختلف الجامعات العالمية وابحث عن المنحة المناسبة لك',
    type: 'website',
  },
};

export default function ScholarshipsPageRoute() {
  return <ScholarshipsPage />;
}
