import { Metadata } from 'next';
import SiteLayout from '@/components/layouts/site-layout';
import ArticlesList from '@/components/articles/articles-list';

export const metadata: Metadata = {
  title: 'المقالات والأخبار | FULLSCO',
  description: 'استكشف أحدث المقالات والنصائح حول المنح الدراسية والدراسة في الخارج',
  keywords: 'مقالات, نصائح الدراسة, المنح الدراسية, أخبار التعليم',
};

export default function ArticlesPage() {
  return (
    <SiteLayout>
      <ArticlesList />
    </SiteLayout>
  );
}
