import { Metadata } from "next";
import SiteSettingsPage from "@/components/admin/site-settings/site-settings-page";

export const metadata: Metadata = {
  title: "إعدادات الموقع | منصة المنح الدراسية",
  description: "إدارة الإعدادات الأساسية للموقع",
};

export default function SiteSettings() {
  return <SiteSettingsPage />;
}
