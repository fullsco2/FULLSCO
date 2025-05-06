import type { Metadata } from 'next';
import { UsersPage } from '@/components/admin/users/users-page';

export const metadata: Metadata = {
  title: 'إدارة المستخدمين | منصة فولسكو',
  description: 'إدارة مستخدمي منصة فولسكو وصلاحياتهم',
};

export default function Users() {
  return <UsersPage />;
}
