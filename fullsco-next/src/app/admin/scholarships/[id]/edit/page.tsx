import type { Metadata } from 'next';
import { ScholarshipForm } from '@/components/admin/scholarships/scholarship-form';

type Props = {
  params: { id: string };
};

export const metadata: Metadata = {
  title: 'تحرير منحة دراسية | منصة فولسكو',
  description: 'تحرير معلومات منحة دراسية على منصة فولسكو',
};

export default function EditScholarship({ params }: Props) {
  return <ScholarshipForm scholarshipId={params.id} />;
}
