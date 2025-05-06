import type { Metadata } from 'next';
import { UserDetail } from '@/components/admin/users/user-detail';

type Props = {
  params: { id: string };
};

export const metadata: Metadata = {
  title: 'تفاصيل المستخدم | منصة فولسكو',
  description: 'عرض تفاصيل المستخدم وإدارة معلوماته',
};

export default function UserPage({ params }: Props) {
  return <UserDetail userId={params.id} />;
}
