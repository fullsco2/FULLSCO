import { Metadata } from "next";
import ScholarshipForm from "@/components/admin/scholarships/scholarship-form";

export const metadata: Metadata = {
  title: "إضافة منحة دراسية | منصة المنح الدراسية",
  description: "إضافة منحة دراسية جديدة إلى النظام",
};

export default function CreateScholarship() {
  return <ScholarshipForm />;
}
