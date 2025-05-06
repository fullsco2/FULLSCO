import type { Metadata } from 'next';
import { ArticlesPage } from '@/components/admin/articles/articles-page';

export const metadata: Metadata = {
  title: 'إدارة المقالات | منصة فولسكو',
  description: 'إدارة وعرض المقالات على منصة فولسكو',
};

export default function Articles() {
  return <ArticlesPage />;
}
