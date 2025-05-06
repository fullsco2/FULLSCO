import { Metadata } from "next";
import PostForm from "@/components/admin/posts/post-form";

export const metadata: Metadata = {
  title: "تحرير مقال | منصة المنح الدراسية",
  description: "تحرير وتحديث مقال موجود",
};

export default function EditPost({ params }: { params: { id: string } }) {
  return <PostForm postId={params.id} />;
}
