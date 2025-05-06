import { Metadata } from "next";

export const metadata: Metadata = {
  title: "المقالات والمدونة | فلسكو",
  description: "اقرأ أحدث المقالات والمدونات المتعلقة بالمنح الدراسية وتطوير المهارات",
};

export default function ArticlesPage() {
  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold mb-6">المقالات والمدونة</h1>
      <p className="text-muted-foreground mb-8">
        استكشف أحدث المقالات والمدونات المتعلقة بالمنح الدراسية والتعليم العالي
      </p>

      {/* سيتم إضافة مكون عرض المقالات لاحقاً */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <p className="text-center col-span-full py-12">جاري تحميل المقالات...</p>
      </div>
    </div>
  );
}
