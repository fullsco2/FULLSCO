import { Metadata } from "next";
import SuccessStoriesPage from "@/components/admin/success-stories/success-stories-page";

export const metadata: Metadata = {
  title: "إدارة قصص النجاح | منصة المنح الدراسية",
  description: "إدارة وإضافة وتعديل قصص النجاح",
};

export default function SuccessStories() {
  return <SuccessStoriesPage />;
}
