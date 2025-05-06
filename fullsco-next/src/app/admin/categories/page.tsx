import { Metadata } from "next";
import CategoriesPage from "@/components/admin/categories/categories-page";

export const metadata: Metadata = {
  title: "إدارة التصنيفات | منصة المنح الدراسية",
  description: "إدارة وإضافة وتعديل تصنيفات المنح الدراسية",
};

export default function Categories() {
  return <CategoriesPage />;
}
