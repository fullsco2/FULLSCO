'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TypographyH1, TypographyP } from '@/components/ui/typography';
import { Card, CardContent } from '@/components/ui/card';
import { Share2, ArrowRight, Loader2, AlertCircle, CalendarIcon, User, Clock, Tag } from 'lucide-react';
import { formatDate } from '@/lib/utils';

type ArticleDetailProps = {
  slug: string;
};

type Article = {
  id: number;
  title: string;
  content: string;
  excerpt?: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  thumbnailUrl?: string;
  categoryName?: string;
  categoryId?: number;
  categorySlug?: string;
  authorName?: string;
  authorId?: number;
  readTime?: number;
  tags?: string[];
};

export function ArticleDetail({ slug }: ArticleDetailProps) {
  const router = useRouter();
  const pathname = usePathname();
  
  const [article, setArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);

  // جلب بيانات المقال
  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`/api/posts/${slug}`);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('\u0627\u0644\u0645\u0642\u0627\u0644 \u063a\u064a\u0631 \u0645\u0648\u062c\u0648\u062f');
          }
          throw new Error(`\u062e\u0637\u0623 \u0641\u064a \u062c\u0644\u0628 \u0627\u0644\u0645\u0642\u0627\u0644: ${response.status}`);
        }

        const data = await response.json();
        setArticle(data);

        // بعد جلب المقال، نجلب المقالات ذات الصلة
        if (data && data.categoryId) {
          fetchRelatedArticles(data.id, data.categoryId);
        }
      } catch (error) {
        console.error('Error fetching article:', error);
        setError(error instanceof Error ? error.message : '\u062d\u062f\u062b \u062e\u0637\u0623 \u063a\u064a\u0631 \u0645\u0639\u0631\u0648\u0641');
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) {
      fetchArticle();
    }
  }, [slug]);

  // جلب مقالات ذات صلة
  const fetchRelatedArticles = async (articleId: number, categoryId: number) => {
    try {
      const response = await fetch(`/api/posts?category=${categoryId}&limit=3`);
      if (!response.ok) throw new Error('Failed to fetch related articles');
      
      const data = await response.json();
      // فلترة المقال الحالي من النتائج
      const filteredArticles = data.data.filter((a: Article) => a.id !== articleId);
      setRelatedArticles(filteredArticles.slice(0, 3));
    } catch (error) {
      console.error('Error fetching related articles:', error);
    }
  };

  // يتعامل مع مشاركة المقال
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: article?.title || '\u0645\u0642\u0627\u0644',
          text: article?.excerpt || '\u0627\u0643\u062a\u0634\u0641 \u0647\u0630\u0627 \u0627\u0644\u0645\u0642\u0627\u0644 \u0627\u0644\u0645\u0641\u064a\u062f',
          url: window.location.href,
        });
      } else {
        // نسخ الرابط إلى الحافظة إذا كانت واجهة المشاركة غير متوفرة
        await navigator.clipboard.writeText(window.location.href);
        alert('\u062a\u0645 \u0646\u0633\u062e \u0627\u0644\u0631\u0627\u0628\u0637 \u0625\u0644\u0649 \u0627\u0644\u062d\u0627\u0641\u0638\u0629');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  // يعود للصفحة السابقة
  const handleBack = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <div className="container py-12 flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg">\u062c\u0627\u0631\u064a \u062a\u062d\u0645\u064a\u0644 \u0627\u0644\u0645\u0642\u0627\u0644...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-12 flex flex-col items-center justify-center min-h-[50vh] text-center">
        <AlertCircle className="h-16 w-16 text-destructive mb-4" />
        <h2 className="text-2xl font-bold mb-2">\u062d\u062f\u062b \u062e\u0637\u0623</h2>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Button onClick={handleBack} variant="outline">
          <ArrowRight className="ml-2 h-4 w-4" />
          \u0627\u0644\u0639\u0648\u062f\u0629 \u0644\u0644\u0645\u0642\u0627\u0644\u0627\u062a
        </Button>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="container py-12 flex flex-col items-center justify-center min-h-[50vh] text-center">
        <AlertCircle className="h-16 w-16 text-destructive mb-4" />
        <h2 className="text-2xl font-bold mb-2">\u0644\u0645 \u064a\u062a\u0645 \u0627\u0644\u0639\u062b\u0648\u0631 \u0639\u0644\u0649 \u0627\u0644\u0645\u0642\u0627\u0644</h2>
        <p className="text-muted-foreground mb-6">\u0644\u0645 \u064a\u062a\u0645 \u0627\u0644\u0639\u062b\u0648\u0631 \u0639\u0644\u0649 \u0627\u0644\u0645\u0642\u0627\u0644 \u0627\u0644\u0645\u0637\u0644\u0648\u0628</p>
        <Button onClick={handleBack} variant="outline">
          <ArrowRight className="ml-2 h-4 w-4" />
          \u0627\u0644\u0639\u0648\u062f\u0629 \u0644\u0644\u0645\u0642\u0627\u0644\u0627\u062a
        </Button>
      </div>
    );
  }

  const {
    title,
    content,
    excerpt,
    thumbnailUrl,
    createdAt,
    publishedAt,
    categoryName,
    categorySlug,
    authorName,
    readTime,
    tags
  } = article;

  const formattedDate = formatDate(publishedAt || createdAt);
  const imageUrl = thumbnailUrl || '/images/placeholder-article.jpg';

  return (
    <div className="bg-background min-h-screen py-8 md:py-12">
      <div className="container px-4 md:px-6">
        {/* شريط الملاحة الثانوي */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={handleBack}
            className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowRight className="ml-1 h-4 w-4" />
            \u0627\u0644\u0639\u0648\u062f\u0629
          </button>
          
          <button
            onClick={handleShare}
            className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Share2 className="ml-1 h-4 w-4" />
            \u0645\u0634\u0627\u0631\u0643\u0629
          </button>
        </div>

        {/* ا\u0644\u0645\u062d\u062a\u0648\u0649 \u0627\u0644\u0631\u0626\u064a\u0633\u064a */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* \u0627\u0644\u0645\u0642\u0627\u0644 */}
          <div className="lg:col-span-3 space-y-8">
            {/* \u0645\u0639\u0644\u0648\u0645\u0627\u062a \u0627\u0644\u0645\u0642\u0627\u0644 */}
            <div>
              {categoryName && categorySlug && (
                <Link href={`/articles?category=${categorySlug}`} className="inline-block mb-4">
                  <Badge variant="outline">{categoryName}</Badge>
                </Link>
              )}
              
              <TypographyH1 className="mb-4">{title}</TypographyH1>
              
              {excerpt && (
                <TypographyP className="text-lg text-muted-foreground mb-6">
                  {excerpt}
                </TypographyP>
              )}

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                {authorName && (
                  <div className="flex items-center">
                    <User className="h-4 w-4 ml-1" />
                    <span>{authorName}</span>
                  </div>
                )}
                
                <div className="flex items-center">
                  <CalendarIcon className="h-4 w-4 ml-1" />
                  <span>{formattedDate}</span>
                </div>
                
                {readTime && (
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 ml-1" />
                    <span>\u0648\u0642\u062a \u0627\u0644\u0642\u0631\u0627\u0621\u0629: {readTime} \u062f\u0642\u064a\u0642\u0629</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* \u0635\u0648\u0631\u0629 \u0627\u0644\u0645\u0642\u0627\u0644 */}
            <div className="aspect-video relative rounded-lg overflow-hidden">
              <Image
                src={imageUrl}
                alt={title}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 60vw"
              />
            </div>
            
            {/* \u0645\u062d\u062a\u0648\u0649 \u0627\u0644\u0645\u0642\u0627\u0644 */}
            <div className="prose prose-lg dark:prose-invert prose-stone max-w-none">
              <div dangerouslySetInnerHTML={{ __html: content }} />
            </div>

            {/* \u0627\u0644\u0648\u0633\u0648\u0645 */}
            {tags && tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-6 border-t">
                <div className="flex items-center">
                  <Tag className="h-4 w-4 ml-2" />
                  <span>\u0627\u0644\u0648\u0633\u0648\u0645:</span>
                </div>
                
                {tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="font-normal">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          
          {/* \u0627\u0644\u0634\u0631\u064a\u0637 \u0627\u0644\u062c\u0627\u0646\u0628\u064a */}
          <div className="space-y-8">
            {/* \u0645\u0642\u0627\u0644\u0627\u062a \u0630\u0627\u062a \u0635\u0644\u0629 */}
            {relatedArticles && relatedArticles.length > 0 && (
              <div className="bg-card rounded-lg border p-6">
                <h3 className="text-xl font-semibold mb-4">\u0645\u0642\u0627\u0644\u0627\u062a \u0630\u0627\u062a \u0635\u0644\u0629</h3>
                
                <div className="space-y-4">
                  {relatedArticles.map((relatedArticle) => (
                    <div key={relatedArticle.id} className="flex gap-3 pb-4 border-b last:border-0 last:pb-0">
                      <div className="flex-shrink-0 w-20 h-16 relative rounded overflow-hidden">
                        <Link href={`/articles/${relatedArticle.slug}`}>
                          <Image
                            src={relatedArticle.thumbnailUrl || '/images/placeholder-article.jpg'}
                            alt={relatedArticle.title}
                            fill
                            className="object-cover"
                          />
                        </Link>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm line-clamp-2 mb-1">
                          <Link href={`/articles/${relatedArticle.slug}`} className="hover:text-primary">
                            {relatedArticle.title}
                          </Link>
                        </h4>
                        
                        <div className="text-xs text-muted-foreground">
                          {formatDate(relatedArticle.publishedAt || relatedArticle.createdAt)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {categorySlug && (
                  <div className="mt-4 pt-4 border-t">
                    <Link href={`/articles?category=${categorySlug}`}>
                      <Button variant="outline" className="w-full text-sm" size="sm">
                        \u0627\u0644\u0645\u0632\u064a\u062f \u0645\u0646 \u0645\u0642\u0627\u0644\u0627\u062a {categoryName}
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
