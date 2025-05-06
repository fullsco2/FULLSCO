import { Metadata } from 'next';
import { ScholarshipsPage } from '@/components/scholarships/scholarships-page';

export const metadata: Metadata = {
  title: 'المنح الدراسية | منصة المنح الدراسية',
  description: 'استكشف المنح الدراسية المتاحة حول العالم وتصفح حسب البلد أو المجال الدراسي',
};

export default function ScholarshipsPageRoot() {
  return <ScholarshipsPage />;
}
