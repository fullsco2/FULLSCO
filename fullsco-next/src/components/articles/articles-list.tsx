'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Grid, List, RefreshCw, MoveRight, MoveLeft, Clock } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import ArticleCard from './article-card';
import ArticleListItem from './article-list-item';
import { formatDate } from '@/lib/utils';

export default function ArticlesList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [articles, setArticles] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(searchParams?.get('search') || '');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // الصفحة الحالية
  const currentPage = searchParams?.get('page') ? parseInt(searchParams.get('page') as string) : 1;
  const tagFilter = searchParams?.get('tag') || '';
  const itemsPerPage = 9;

  // جلب المقالات
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // بناء الاستعلام
        const queryParams = new URLSearchParams();
        queryParams.set('page', currentPage.toString());
        queryParams.set('limit', itemsPerPage.toString());
        
        if (searchQuery) queryParams.set('search', searchQuery);
        if (tagFilter) queryParams.set('tag', tagFilter);
        
        // جلب البيانات من API
        const response = await fetch(`/api/posts?${queryParams.toString()}`);
        if (!response.ok) {
          throw new Error('Failed to fetch articles');
        }
        
        const data = await response.json();
        
        // التعامل مع هيكل البيانات من API
        if (data.success && data.data) {
          setArticles(data.data);
          setTotalItems(data.totalItems || data.data.length);
        } else if (Array.isArray(data)) {
          setArticles(data);
          setTotalItems(data.length);
        } else {
          setArticles([]);
          setTotalItems(0);
        }
      } catch (err) {
        console.error('Error fetching articles:', err);
        setError(err instanceof Error ? err.message : 'حدث خطأ أثناء جلب المقالات');
      } finally {
        setLoading(false);
      }
    };
    
    const fetchTags = async () => {
      try {
        const response = await fetch('/api/tags');
        if (!response.ok) {
          throw new Error('Failed to fetch tags');
        }
        
        const data = await response.json();
        // التعامل مع هيكل البيانات من API
        if (data.success && data.data) {
          setTags(data.data);
        } else if (Array.isArray(data)) {
          setTags(data);
        } else {
          setTags([]);
        }
      } catch (err) {
        console.error('Error fetching tags:', err);
        // لا نحتاج لعرض رسالة خطأ عند فشل جلب التصنيفات
      }
    };
    
    fetchArticles();
    fetchTags();
  }, [currentPage, searchQuery, tagFilter]);

  // حساب عدد الصفحات
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // تغيير الصفحة
  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    
    const params = new URLSearchParams(searchParams?.toString() || '');
    
    if (page > 1) {
      params.set('page', page.toString());
    } else {
      params.delete('page');
    }
    
    router.push(`/articles${params.toString() ? `?${params.toString()}` : ''}`);
  };

  // معالجة البحث
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    const params = new URLSearchParams(searchParams?.toString() || '');
    
    if (searchQuery) {
      params.set('search', searchQuery);
    } else {
      params.delete('search');
    }
    
    // العودة للصفحة الأولى عند تغيير البحث
    params.delete('page');
    
    router.push(`/articles${params.toString() ? `?${params.toString()}` : ''}`);
  };

  // تفلتر بواسطة التصنيف
  const filterByTag = (tag: string) => {
    const params = new URLSearchParams(searchParams?.toString() || '');
    
    if (tag) {
      params.set('tag', tag);
    } else {
      params.delete('tag');
    }
    
    // العودة للصفحة الأولى عند تغيير التصنيف
    params.delete('page');
    
    router.push(`/articles${params.toString() ? `?${params.toString()}` : ''}`);
  };

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* عنوان الصفحة */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-primary md:text-4xl">المقالات والأخبار</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">استكشف أحدث المقالات والنصائح حول المنح الدراسية والدراسة في الخارج</p>
      </div>
      
      {/* شريط البحث والتحكم */}
      <div className="mb-6 flex flex-col gap-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-800 sm:flex-row sm:items-center sm:justify-between">
        <form onSubmit={handleSearch} className="flex max-w-md flex-1 gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث في المقالات..."
              className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 pr-10 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-700 dark:bg-gray-900"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          </div>
          <Button type="submit" className="bg-primary hover:bg-primary/90">
            بحث
          </Button>
        </form>
        
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-300">عرض:</span>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('grid')}
              className={viewMode === 'grid' ? 'bg-primary hover:bg-primary/90' : ''}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('list')}
              className={viewMode === 'list' ? 'bg-primary hover:bg-primary/90' : ''}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* المحتوى الرئيسي */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        {/* القائمة الجانبية */}
        <div className="space-y-6 lg:col-span-1">
          {/* التصنيفات */}
          <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <h3 className="mb-3 text-lg font-bold">التصنيفات</h3>
            <div className="space-y-2">
              <button
                onClick={() => filterByTag('')}
                className={`block w-full rounded-md px-3 py-2 text-right hover:bg-gray-100 dark:hover:bg-gray-800 ${!tagFilter ? 'bg-primary/10 text-primary' : 'text-gray-700 dark:text-gray-300'}`}
              >
                جميع المقالات
              </button>
              
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => filterByTag(tag.slug || tag.id)}
                  className={`block w-full rounded-md px-3 py-2 text-right hover:bg-gray-100 dark:hover:bg-gray-800 ${tagFilter === (tag.slug || tag.id) ? 'bg-primary/10 text-primary' : 'text-gray-700 dark:text-gray-300'}`}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>
          
          {/* آخر المقالات - للهواتف المحمولة فقط */}
          <div className="block lg:hidden">
            <h3 className="mb-3 text-lg font-bold">آخر المقالات</h3>
            <div className="space-y-3">
              {articles.slice(0, 3).map((article) => (
                <div key={article.id} className="flex gap-3">
                  <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-gray-200 dark:bg-gray-800">
                    {article.thumbnail && (
                      <img
                        src={article.thumbnail}
                        alt={article.title}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div>
                    <Link href={`/articles/${article.slug || article.id}`}>
                      <h4 className="line-clamp-2 font-medium hover:text-primary">{article.title}</h4>
                    </Link>
                    <div className="mt-1 flex items-center text-xs text-gray-500">
                      <Clock className="ml-1 h-3 w-3" />
                      {article.createdAt && formatDate(article.createdAt)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* قائمة المقالات */}
        <div className="lg:col-span-3">
          {loading ? (
            // شاشة التحميل
            <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3' : 'grid-cols-1'}`}>
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="animate-pulse rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
                  <div className="h-48 bg-gray-200 dark:bg-gray-800"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            // رسالة خطأ
            <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center dark:border-red-800 dark:bg-red-900/20">
              <p className="text-red-600 dark:text-red-400">{error}</p>
              <Button variant="outline" className="mt-4" onClick={() => router.refresh()}>
                إعادة المحاولة
              </Button>
            </div>
          ) : articles.length === 0 ? (
            // لا توجد نتائج
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center dark:border-gray-800 dark:bg-gray-900">
              <h3 className="mb-2 text-xl font-semibold">لم يتم العثور على مقالات</h3>
              <p className="mb-4 text-gray-600 dark:text-gray-300">حاول تغيير معايير البحث أو التصنيف</p>
              <Button variant="outline" onClick={() => {
                setSearchQuery('');
                filterByTag('');
              }}>
                عرض جميع المقالات
              </Button>
            </div>
          ) : viewMode === 'grid' ? (
            // عرض الشبكة
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
              {articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          ) : (
            // عرض القائمة
            <div className="space-y-4">
              {articles.map((article) => (
                <ArticleListItem key={article.id} article={article} />
              ))}
            </div>
          )}
          
          {/* الترقيم */}
          {!loading && articles.length > 0 && totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <div className="flex items-center rounded-lg border border-gray-200 dark:border-gray-800">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 text-gray-600 dark:text-gray-300"
                >
                  <MoveRight className="h-4 w-4" />
                  <span className="sr-only">السابق</span>
                </Button>
                
                <div className="border-r border-l border-gray-200 px-3 py-1 text-sm dark:border-gray-800">
                  <span className="font-medium text-primary">{currentPage}</span>
                  <span className="mx-1 text-gray-600 dark:text-gray-300">/</span>
                  <span className="text-gray-600 dark:text-gray-300">{totalPages}</span>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1 text-gray-600 dark:text-gray-300"
                >
                  <MoveLeft className="h-4 w-4" />
                  <span className="sr-only">التالي</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
