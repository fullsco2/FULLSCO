import type { Metadata } from 'next';
import { DashboardPage } from '@/components/admin/dashboard/dashboard-page';

export const metadata: Metadata = {
  title: 'لوحة التحكم | منصة فولسكو',
  description: 'لوحة تحكم منصة فولسكو لإدارة المحتوى والمستخدمين',
};

export default function Dashboard() {
  return <DashboardPage />;
}
