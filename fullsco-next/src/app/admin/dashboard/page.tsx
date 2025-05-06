import { Metadata } from "next";
import DashboardPage from "@/components/admin/dashboard/dashboard-page";

export const metadata: Metadata = {
  title: "لوحة القيادة | منصة المنح الدراسية",
  description: "إحصائيات ومعلومات منصة المنح الدراسية",
};

export default function Dashboard() {
  return <DashboardPage />;
}
