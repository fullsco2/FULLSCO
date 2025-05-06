import { Metadata } from "next";
import ScholarshipsPage from "@/components/admin/scholarships/scholarships-page";

export const metadata: Metadata = {
  title: "إدارة المنح الدراسية | منصة المنح الدراسية",
  description: "إدارة وإضافة وتعديل المنح الدراسية",
};

export default function Scholarships() {
  return <ScholarshipsPage />;
}
