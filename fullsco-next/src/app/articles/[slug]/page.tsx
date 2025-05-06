import { Metadata } from 'next';
import { ArticleDetail } from '@/components/articles/article-detail';

type Props = {
  params: { slug: string }
};

// هذه الدالة تجلب بيانات المقال بناءً على الـ slug
// وتستخدم لإنشاء العناوين الوصفية للصفحة
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = params.slug;
  
  try {
    const article = await getArticle(slug);
    
    if (!article) {
      return {
        title: 'مقال غير موجود | منصة المنح الدراسية',
        description: 'لم يتم العثور على المقال المطلوب',
      };
    }
    
    return {
      title: `${article.title} | منصة المنح الدراسية`,
      description: article.excerpt || article.title,
      openGraph: {
        title: article.title,
        description: article.excerpt || '',
        images: article.thumbnailUrl ? [{ url: article.thumbnailUrl }] : [],
        type: 'article',
        publishedTime: article.publishedAt || article.createdAt,
        modifiedTime: article.updatedAt,
        authors: article.authorName ? [article.authorName] : [],
      },
    };
  } catch (error) {
    console.error('Error fetching article for metadata:', error);
    return {
      title: 'مقال | منصة المنح الدراسية',
      description: 'مقالات عن المنح الدراسية والدراسة بالخارج',
    };
  }
}

// دالة مساعدة لجلب بيانات المقال
async function getArticle(slug: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/posts/${slug}`, { 
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch article: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching article:', error);
    return null;
  }
}

export default function ArticleDetailPage({ params }: Props) {
  const { slug } = params;
  
  return <ArticleDetail slug={slug} />;
}
