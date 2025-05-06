import { Metadata } from "next";
import CountriesPage from "@/components/admin/countries/countries-page";

export const metadata: Metadata = {
  title: "إدارة الدول | منصة المنح الدراسية",
  description: "إدارة وإضافة وتعديل الدول في منصة المنح الدراسية",
};

export default function Countries() {
  return <CountriesPage />;
}
