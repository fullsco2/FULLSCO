import type { Metadata } from 'next';
import { ScholarshipForm } from '@/components/admin/scholarships/scholarship-form';

export const metadata: Metadata = {
  title: 'إضافة منحة دراسية | منصة فولسكو',
  description: 'إضافة منحة دراسية جديدة إلى منصة فولسكو',
};

export default function CreateScholarship() {
  return <ScholarshipForm />;
}
