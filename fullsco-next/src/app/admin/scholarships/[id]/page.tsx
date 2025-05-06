import type { Metadata } from 'next';
import { ScholarshipDetail } from '@/components/admin/scholarships/scholarship-detail';

type Props = {
  params: { id: string };
};

export const metadata: Metadata = {
  title: 'تفاصيل المنحة الدراسية | منصة فولسكو',
  description: 'عرض تفاصيل المنحة الدراسية على منصة فولسكو',
};

export default function ScholarshipPage({ params }: Props) {
  return <ScholarshipDetail scholarshipId={params.id} />;
}
