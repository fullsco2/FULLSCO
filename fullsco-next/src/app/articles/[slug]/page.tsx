import { ArticleDetail } from "@/components/articles/article-detail";
import { Metadata } from "next";

type Props = {
  params: {
    slug: string;
  };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // ملاحظة: في الحالة النهائية يجب جلب البيانات من الواجهة الخلفية هنا
  return {
    title: `المقال: ${params.slug} | فلسكو`,
    description: "مقال تفصيلي حول الموضوع",
  };
}

export default function ArticlePage({ params }: Props) {
  return <ArticleDetail slug={params.slug} />;
}
