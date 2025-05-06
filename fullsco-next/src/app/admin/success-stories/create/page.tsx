import { Metadata } from "next";
import SuccessStoryForm from "@/components/admin/success-stories/success-story-form";

export const metadata: Metadata = {
  title: "إضافة قصة نجاح | منصة المنح الدراسية",
  description: "إضافة قصة نجاح جديدة إلى النظام",
};

export default function CreateSuccessStory() {
  return <SuccessStoryForm />;
}
