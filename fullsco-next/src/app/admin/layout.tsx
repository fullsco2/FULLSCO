import { Metadata } from "next";
import AdminHeader from "@/components/admin/admin-header";
import AdminSidebar from "@/components/admin/admin-sidebar";
import { isAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "لوحة الإدارة | منصة المنح الدراسية",
  description: "إدارة محتوى منصة المنح الدراسية",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // التحقق من أن المستخدم مسؤول
  const adminUser = await isAdmin();
  
  // إذا لم يكن المستخدم مسؤولًا، يتم توجيهه إلى صفحة تسجيل الدخول
  if (!adminUser) {
    redirect("/auth");
  }

  return (
    <div className="bg-background min-h-screen flex flex-col">
      <AdminHeader />
      <div className="flex flex-1 overflow-hidden">
        <AdminSidebar />
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
