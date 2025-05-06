import { Metadata } from "next";
import SuccessStoryForm from "@/components/admin/success-stories/success-story-form";

type Props = {
  params: { id: string };
};

export const metadata: Metadata = {
  title: "تحرير قصة نجاح | منصة المنح الدراسية",
  description: "تحرير وتعديل قصة نجاح موجودة",
};

export default function EditSuccessStory({ params }: Props) {
  return <SuccessStoryForm storyId={params.id} />;
}
