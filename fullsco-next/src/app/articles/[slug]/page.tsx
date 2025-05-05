import { Metadata } from 'next';
import SiteLayout from '@/components/layouts/site-layout';
import ArticleDetail from '@/components/articles/article-detail';

interface ArticleDetailPageProps {
  params: {
    slug: string;
  };
}

// توليد بيانات التعريف (ميتاداتا) الديناميكية
export async function generateMetadata({ params }: ArticleDetailPageProps): Promise<Metadata> {
  try {
    // جلب بيانات المقال من API الحالي
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/posts/${params.slug}`);
    if (!response.ok) {
      return {
        title: 'مقال | FULLSCO',
        description: 'تفاصيل المقال',
      };
    }
    
    const article = await response.json();
    const data = article.data || article;
    
    return {
      title: `${data.title} | FULLSCO`,
      description: data.excerpt?.slice(0, 160) || data.content?.slice(0, 160) || 'تفاصيل المقال',
      openGraph: {
        title: data.title,
        description: data.excerpt?.slice(0, 160) || data.content?.slice(0, 160) || 'تفاصيل المقال',
        images: data.thumbnail ? [{ url: data.thumbnail }] : [],
      },
    };
  } catch (error) {
    console.error('Error fetching article metadata:', error);
    return {
      title: 'مقال | FULLSCO',
      description: 'تفاصيل المقال',
    };
  }
}

export default function ArticleDetailPage({ params }: ArticleDetailPageProps) {
  return (
    <SiteLayout>
      <ArticleDetail slug={params.slug} />
    </SiteLayout>
  );
}
