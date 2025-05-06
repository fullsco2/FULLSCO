'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getLatestArticles } from '@/lib/api';
import { formatDate } from '@/lib/utils';

interface LatestArticlesSectionProps {
  title?: string;
  description?: string;
}

export default function LatestArticlesSection({
  title = 'أحدث المقالات',
  description = 'تعرف على آخر النصائح والمعلومات',
}: LatestArticlesSectionProps) {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadArticles() {
      try {
        // طلب مباشر للتأكد من التعامل مع الخادم الحالي
        const response = await fetch('/api/posts?limit=3');
        if (!response.ok) {
          throw new Error(`فشل الطلب: ${response.status}`);
        }
        
        const data = await response.json();
        
        // التعامل مع هيكل البيانات من API الحالي
        if (data.success && data.data) {
          setArticles(data.data);
        } else if (Array.isArray(data)) {
          setArticles(data);
        } else {
          setArticles([]);
        }
      } catch (error) {
        console.error('Error loading articles:', error);
      } finally {
        setLoading(false);
      }
    }

    loadArticles();
  }, []);

  return (
    <section className="py-14 md:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h2 className="mb-3 text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">{title}</h2>
          <p className="mx-auto max-w-2xl text-gray-600 dark:text-gray-300">{description}</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="animate-pulse rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                <div className="h-48 bg-gray-200 dark:bg-gray-800"></div>
                <div className="p-4 space-y-3">
                  <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-gray-500 dark:text-gray-400">لا توجد مقالات متاحة حالياً.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <div 
                key={article.id} 
                className="group overflow-hidden rounded-lg border border-gray-200 bg-white transition-all hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
              >
                {/* صورة المقال */}
                <Link 
                  href={`/articles/${article.slug || article.id}`} 
                  className="block h-48 overflow-hidden bg-gray-200 dark:bg-gray-800"
                >
                  {article.thumbnail && (
                    <img 
                      src={article.thumbnail} 
                      alt={article.title} 
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  )}
                </Link>
                
                <div className="p-4">
                  {/* عنوان المقال */}
                  <Link href={`/articles/${article.slug || article.id}`}>
                    <h3 className="mb-2 line-clamp-2 text-xl font-bold transition-colors group-hover:text-primary">
                      {article.title}
                    </h3>
                  </Link>
                  
                  {/* وصف مختصر */}
                  <p className="mb-4 line-clamp-2 text-sm text-gray-600 dark:text-gray-300">
                    {article.summary || article.excerpt || article.content?.slice(0, 150)}
                  </p>
                  
                  {/* معلومات النشر */}
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    {article.createdAt && (
                      <div className="flex items-center">
                        <Clock className="ml-1 h-3 w-3" />
                        {formatDate(article.createdAt)}
                      </div>
                    )}
                    
                    <Link 
                      href={`/articles/${article.slug || article.id}`}
                      className="font-medium text-primary transition-colors hover:text-primary/80"
                    >
                      قراءة المزيد
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <Link href="/articles">
            <Button variant="outline" size="lg" className="gap-2">
              عرض جميع المقالات
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
