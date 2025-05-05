'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Calendar, User, Tag, Share2, Printer, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';

interface ArticleDetailProps {
  slug: string;
}

export default function ArticleDetail({ slug }: ArticleDetailProps) {
  const router = useRouter();
  const [article, setArticle] = useState<any>(null);
  const [relatedArticles, setRelatedArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // جلب بيانات المقال
        const response = await fetch(`/api/posts/${slug}`);
        if (!response.ok) {
          throw new Error(`فشل جلب بيانات المقال: ${response.status}`);
        }
        
        const data = await response.json();
        // التعامل مع هيكل البيانات من API
        const articleData = data.data || data;
        setArticle(articleData);
        
        // جلب المقالات ذات الصلة
        try {
          // يمكن استخدام tags أو التصنيفات لجلب مقالات مشابهة
          const tag = articleData.tags && articleData.tags.length > 0 ? 
            (typeof articleData.tags[0] === 'object' ? articleData.tags[0].slug || articleData.tags[0].id : articleData.tags[0]) : 
            null;
            
          if (tag) {
            const relatedResponse = await fetch(`/api/posts?tag=${tag}&limit=3`);
            if (relatedResponse.ok) {
              const relatedData = await relatedResponse.json();
              // استبعاد المقال الحالي من المقالات ذات الصلة
              const filteredRelated = (relatedData.data || relatedData).filter(
                (item: any) => item.id !== articleData.id
              ).slice(0, 3);
              
              setRelatedArticles(filteredRelated);
            }
          } else {
            // جلب أحدث المقالات إذا لم يكن هناك تصنيفات
            const recentResponse = await fetch(`/api/posts?limit=3`);
            if (recentResponse.ok) {
              const recentData = await recentResponse.json();
              // استبعاد المقال الحالي من المقالات الأخيرة
              const filteredRecent = (recentData.data || recentData).filter(
                (item: any) => item.id !== articleData.id
              ).slice(0, 3);
              
              setRelatedArticles(filteredRecent);
            }
          }
        } catch (relatedErr) {
          // عدم إظهار أخطاء للمقالات ذات الصلة
          console.error('Error fetching related articles:', relatedErr);
        }
      } catch (err) {
        console.error('Error fetching article details:', err);
        setError(err instanceof Error ? err.message : 'حدث خطأ أثناء جلب بيانات المقال');
      } finally {
        setLoading(false);
      }
    };
    
    fetchArticle();
  }, [slug]);

  // مشاركة المقال
  const shareArticle = () => {
    if (typeof window !== 'undefined' && navigator.share) {
      navigator.share({
        title: article?.title || 'مقال',
        text: article?.excerpt || article?.content?.slice(0, 100) || '',
        url: window.location.href
      }).catch(err => console.error('Error sharing:', err));
    } else {
      // نسخ الرابط إلى الحافظة
      navigator.clipboard.writeText(window.location.href)
        .then(() => alert('تم نسخ الرابط'))
        .catch(err => console.error('Error copying link:', err));
    }
  };
  
  // طباعة المقال
  const printArticle = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-lg">جاري تحميل المقال...</p>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-center sm:px-6 lg:px-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-900/20">
          <h2 className="mb-4 text-xl font-bold text-red-700 dark:text-red-400">لم يتم العثور على المقال</h2>
          <p className="mb-4 text-red-600 dark:text-red-300">{error || 'لم يتم العثور على المقال المطلوب. ربما تم حذفه أو نقله.'}</p>
          <div className="flex justify-center gap-3">
            <Button variant="outline" onClick={() => router.back()}>
              العودة للصفحة السابقة
            </Button>
            <Link href="/articles">
              <Button>عرض جميع المقالات</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // تاريخ النشر
  const publishDate = article.createdAt
    ? formatDate(article.createdAt)
    : article.publishedAt
    ? formatDate(article.publishedAt)
    : null;

  return (
    <div className="article-detail-container pb-12">
      {/* التنقل الفرعي */}
      <div className="bg-gray-50 dark:bg-gray-900 py-2 mb-6">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex text-sm">
            <Link href="/" className="text-gray-500 hover:text-primary transition-colors">
              الرئيسية
            </Link>
            <ChevronRight className="mx-2 h-4 w-4 text-gray-400" />
            <Link href="/articles" className="text-gray-500 hover:text-primary transition-colors">
              المقالات
            </Link>
            <ChevronRight className="mx-2 h-4 w-4 text-gray-400" />
            <span className="text-primary truncate">{article.title}</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          {/* رأس المقال */}
          <div className="mb-8 text-center">
            <h1 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">
              {article.title}
            </h1>

            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              {publishDate && (
                <div className="flex items-center">
                  <Calendar className="ml-1.5 h-4 w-4 text-primary" />
                  <span>{publishDate}</span>
                </div>
              )}
              
              {article.author && (
                <div className="flex items-center">
                  <User className="ml-1.5 h-4 w-4 text-primary" />
                  <span>{typeof article.author === 'object' ? article.author.name : article.author}</span>
                </div>
              )}
              
              {article.tags && article.tags.length > 0 && (
                <div className="flex items-center">
                  <Tag className="ml-1.5 h-4 w-4 text-primary" />
                  <div className="flex flex-wrap gap-1">
                    {article.tags.map((tag: any, index: number) => (
                      <span key={typeof tag === 'object' ? tag.id : `tag-${index}`}>
                        <Link 
                          href={`/articles?tag=${typeof tag === 'object' ? tag.slug || tag.id : tag}`}
                          className="hover:text-primary hover:underline"
                        >
                          {typeof tag === 'object' ? tag.name : tag}
                        </Link>
                        {index < article.tags.length - 1 && <span className="mx-1">,</span>}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* صورة المقال */}
          {article.thumbnail && (
            <div className="mb-8">
              <img 
                src={article.thumbnail} 
                alt={article.title} 
                className="h-auto w-full rounded-lg object-cover"
              />
            </div>
          )}
          
          {/* محتوى المقال */}
          <div className="article-content mb-8">
            <div className="prose max-w-none dark:prose-invert">
              {article.content ? (
                article.content.includes('<') ? (
                  <div dangerouslySetInnerHTML={{ __html: article.content }} />
                ) : (
                  <p>{article.content}</p>
                )
              ) : (
                <p className="text-gray-600 dark:text-gray-400">لا يوجد محتوى للمقال</p>
              )}
            </div>
          </div>
          
          {/* أزرار المشاركة */}
          <div className="mb-12 flex flex-wrap justify-center gap-3">
            <Button variant="outline" onClick={shareArticle} className="flex items-center">
              <Share2 className="ml-2 h-4 w-4" />
              مشاركة
            </Button>
            <Button variant="outline" onClick={printArticle} className="flex items-center">
              <Printer className="ml-2 h-4 w-4" />
              طباعة
            </Button>
          </div>
          
          {/* مقالات ذات صلة */}
          {relatedArticles.length > 0 && (
            <div className="border-t border-gray-200 pt-8 dark:border-gray-800">
              <h2 className="mb-6 text-2xl font-bold">مقالات ذات صلة</h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
                {relatedArticles.map((related) => (
                  <div key={related.id} className="group overflow-hidden rounded-lg border border-gray-200 bg-white hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
                    {related.thumbnail && (
                      <Link href={`/articles/${related.slug || related.id}`} className="block h-40 overflow-hidden bg-gray-200 dark:bg-gray-800">
                        <img
                          src={related.thumbnail}
                          alt={related.title}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </Link>
                    )}
                    <div className="p-4">
                      <Link href={`/articles/${related.slug || related.id}`}>
                        <h3 className="line-clamp-2 font-bold transition-colors group-hover:text-primary">
                          {related.title}
                        </h3>
                      </Link>
                      {related.createdAt && (
                        <div className="mt-2 flex items-center text-xs text-gray-500 dark:text-gray-400">
                          <Calendar className="ml-1 h-3 w-3" />
                          {formatDate(related.createdAt)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
