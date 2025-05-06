import { Metadata } from 'next';
import { ArticlesList } from '@/components/articles/articles-list';

export const metadata: Metadata = {
  title: 'المقالات | منصة المنح الدراسية',
  description: 'اقرأ أحدث المقالات عن المنح الدراسية ونصائح دراسية للطلاب',
};

export default function ArticlesPage() {
  return <ArticlesList />;
}
