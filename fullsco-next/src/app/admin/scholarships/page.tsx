import type { Metadata } from 'next';
import { ScholarshipsPage } from '@/components/admin/scholarships/scholarships-page';

export const metadata: Metadata = {
  title: 'إدارة المنح الدراسية | منصة فولسكو',
  description: 'إدارة وعرض المنح الدراسية على منصة فولسكو',
};

export default function Scholarships() {
  return <ScholarshipsPage />;
}
