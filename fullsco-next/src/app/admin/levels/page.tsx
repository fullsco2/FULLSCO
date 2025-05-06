import { Metadata } from "next";
import LevelsPage from "@/components/admin/levels/levels-page";

export const metadata: Metadata = {
  title: "إدارة المستويات الدراسية | منصة المنح الدراسية",
  description: "إدارة وإضافة وتعديل المستويات الدراسية في منصة المنح الدراسية",
};

export default function Levels() {
  return <LevelsPage />;
}
