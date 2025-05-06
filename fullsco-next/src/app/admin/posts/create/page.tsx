import { Metadata } from "next";
import PostForm from "@/components/admin/posts/post-form";

export const metadata: Metadata = {
  title: "إضافة مقال | منصة المنح الدراسية",
  description: "إضافة مقال جديد إلى النظام",
};

export default function CreatePost() {
  return <PostForm />;
}
