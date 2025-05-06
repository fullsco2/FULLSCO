import type { Metadata } from 'next';

import SuccessStoryDetail from '@/components/success-stories/success-story-detail';

type Props = {
  params: { slug: string };
};

// سيتم استبدالها في المستقبل بدالة تقوم بإنشاء العنوان بناءً على البيانات الفعلية من الخادم
export const generateMetadata = async ({ params }: Props): Promise<Metadata> => {
  // يمكن إضافة استدعاء للخادم هنا للحصول على البيانات
  return {
    title: `قصة نجاح | منصة فولسكو`,
    description: `قصة نجاح ملهمة لطالب حصل على منحة دراسية وتجربة حقيقية للإلهام`,
  };
};

export default function SuccessStoryPage({ params }: Props) {
  return <SuccessStoryDetail slug={params.slug} />;
}
