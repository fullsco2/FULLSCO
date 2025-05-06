import { Metadata } from "next";
import PostsPage from "@/components/admin/posts/posts-page";

export const metadata: Metadata = {
  title: "إدارة المقالات | منصة المنح الدراسية",
  description: "إدارة وإضافة وتعديل المقالات",
};

export default function Posts() {
  return <PostsPage />;
}
