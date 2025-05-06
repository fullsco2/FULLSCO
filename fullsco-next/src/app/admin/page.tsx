import { redirect } from "next/navigation";

export default function AdminPage() {
  // اعادة توجيه المستخدم إلى لوحة القيادة
  redirect("/admin/dashboard");
}
