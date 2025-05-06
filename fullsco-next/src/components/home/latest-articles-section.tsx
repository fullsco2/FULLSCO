'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clock, FileText, Tag, User, Loader2, AlertCircle } from 'lucide-react';
import { useSiteSettings } from '@/hooks/use-site-settings';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

type Post = {
  id: number;
  title: string;
  excerpt: string;
  slug: string;
  authorName?: string;
  createdAt: string;
  readTime?: number;
  thumbnailUrl?: string;
  category?: string;
};

export function LatestArticlesSection() {
  const { siteSettings } = useSiteSettings();
  const [articles, setArticles] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/posts?limit=3');
        
        if (!response.ok) {
          throw new Error(`Error fetching articles: ${response.status}`);
        }
        
        const data = await response.json();
        setArticles(data?.data || []);
      } catch (error) {
        console.error('Error fetching articles:', error);
        setError('Failed to load articles');
      } finally {
        setIsLoading(false);
      }
    };

    if (siteSettings?.showLatestArticles) {
      fetchArticles();
    }
  }, [siteSettings]);

  if (!siteSettings || !siteSettings.showLatestArticles) return null;

  // تنسيق التاريخ
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'PPP', { locale: ar });
    } catch (error) {
      return dateString;
    }
  };

  return (
    <section className="py-12 md:py-16">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
              {siteSettings.latestArticlesTitle || 'أحدث المقالات'}
            </h2>
            <p className="text-muted-foreground">
              {siteSettings.latestArticlesDescription || 'تعرف على آخر النصائح والمعلومات'}
            </p>
          </div>

          <Link href="/articles" passHref>
            <Button variant="outline" className="shrink-0">
              <ArrowLeft className="ml-2 h-4 w-4" />
              عرض جميع المقالات
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center min-h-[300px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="mr-2">جاري تحميل المقالات...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center min-h-[300px] text-center">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <h3 className="text-xl font-semibold">حدث خطأ أثناء تحميل المقالات</h3>
            <p className="text-muted-foreground mt-2">{error}</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              إعادة المحاولة
            </Button>
          </div>
        ) : articles.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[300px] text-center">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold">لا توجد مقالات حالياً</h3>
            <p className="text-muted-foreground mt-2">ستظهر هنا آخر المقالات والمحتوى المفيد بمجرد نشرها</p>
          </div>
        ) : (
          <div className="grid gap-6 pt-8 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <Card key={article.id} className="overflow-hidden">
                {article.thumbnailUrl && (
                  <div className="relative h-48 w-full overflow-hidden">
                    <img
                      src={article.thumbnailUrl}
                      alt={article.title}
                      className="w-full h-full object-cover transition-transform hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="line-clamp-2">
                    <Link href={`/articles/${article.slug || article.id}`} className="hover:text-primary transition-colors">
                      {article.title}
                    </Link>
                  </CardTitle>
                  {article.category && (
                    <CardDescription className="flex items-center">
                      <Tag className="h-3 w-3 ml-1" />
                      {article.category}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-3 text-muted-foreground text-sm">
                    {article.excerpt}
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    {article.authorName && (
                      <div className="flex items-center">
                        <User className="h-3 w-3 ml-1" />
                        {article.authorName}
                      </div>
                    )}
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 ml-1" />
                      {formatDate(article.createdAt)}
                    </div>
                    {article.readTime && (
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 ml-1" />
                        {article.readTime} دقيقة للقراءة
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Link href={`/articles/${article.slug || article.id}`} passHref className="w-full">
                    <Button variant="outline" className="w-full">
                      قراءة المزيد
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
