'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Pagination } from '@/components/ui/pagination';
import { ArticleCard } from './article-card';
import { Loader2, AlertCircle, Search, Filter, X } from 'lucide-react';

type Article = {
  id: number;
  title: string;
  content?: string;
  excerpt?: string;
  slug: string;
  thumbnailUrl?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  categoryName?: string;
  authorName?: string;
};

type Category = {
  id: number;
  name: string;
  slug: string;
};

type FilterParams = {
  category?: string;
  query?: string;
  page?: number;
};

export function ArticlesList() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<FilterParams>({});

  // Extract current filters from URL
  useEffect(() => {
    const params: FilterParams = {};

    if (searchParams.has('category')) {
      params.category = searchParams.get('category') || undefined;
      setActiveCategory(params.category || 'all');
    } else {
      setActiveCategory('all');
    }
    
    if (searchParams.has('query')) {
      params.query = searchParams.get('query') || undefined;
      setSearchQuery(params.query || '');
    } else {
      setSearchQuery('');
    }
    
    if (searchParams.has('page')) {
      const pageParam = parseInt(searchParams.get('page') || '1');
      params.page = isNaN(pageParam) ? 1 : pageParam;
      setCurrentPage(params.page);
    } else {
      setCurrentPage(1);
    }

    setActiveFilters(params);
  }, [searchParams]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (!response.ok) throw new Error('Failed to fetch categories');
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  // Fetch articles based on filters
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Build query params
        const queryParams = new URLSearchParams();
        if (activeFilters.category) queryParams.append('category', activeFilters.category);
        if (activeFilters.query) queryParams.append('search', activeFilters.query);
        if (activeFilters.page) queryParams.append('page', activeFilters.page.toString());
        queryParams.append('limit', '9');

        const response = await fetch(`/api/posts?${queryParams.toString()}`);
        if (!response.ok) {
          throw new Error(`Error fetching articles: ${response.status}`);
        }

        const data = await response.json();
        setArticles(data?.data || []);
        setTotalPages(data?.meta?.totalPages || 1);
      } catch (error) {
        console.error('Error fetching articles:', error);
        setError('\u0641\u0634\u0644 \u0641\u064a \u062a\u062d\u0645\u064a\u0644 \u0627\u0644\u0645\u0642\u0627\u0644\u0627\u062a. \u064a\u0631\u062c\u0649 \u0627\u0644\u0645\u062d\u0627\u0648\u0644\u0629 \u0645\u0631\u0629 \u0623\u062e\u0631\u0649.');
        setArticles([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticles();
  }, [activeFilters]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters({ ...activeFilters, query: searchQuery, page: 1 });
  };

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    applyFilters({
      ...activeFilters,
      category: category === 'all' ? undefined : category,
      page: 1
    });
  };

  const handlePageChange = (page: number) => {
    applyFilters({ ...activeFilters, page });
  };

  const applyFilters = (filters: FilterParams) => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Apply or remove filters based on their values
    if (filters.query) params.set('query', filters.query);
    else params.delete('query');
    
    if (filters.category) params.set('category', filters.category);
    else params.delete('category');
    
    if (filters.page && filters.page > 1) params.set('page', filters.page.toString());
    else params.delete('page');
    
    router.push(`/articles?${params.toString()}`);
  };

  const clearAllFilters = () => {
    router.push('/articles');
  };

  const hasActiveFilters = activeFilters.category || activeFilters.query;

  return (
    <div className="bg-background min-h-screen py-8 md:py-12">
      <div className="container px-4 md:px-6">
        {/* Page Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">المقالات</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">اقرأ أحدث المقالات عن المنح الدراسية ونصائح دراسية للطلاب</p>
        </div>

        {/* Search Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 max-w-3xl mx-auto">
          <form onSubmit={handleSearch} className="flex-1 flex">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="بحث عن مقال"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 w-full"
              />
            </div>
            <Button type="submit" className="ms-2">بحث</Button>
          </form>
          
          {hasActiveFilters && (
            <Button 
              variant="ghost" 
              onClick={clearAllFilters}
              className="whitespace-nowrap"
            >
              <X className="h-4 w-4 ml-2" />
              مسح التصفية
            </Button>
          )}
        </div>

        {/* Categories Tabs */}
        <Tabs 
          defaultValue="all" 
          value={activeCategory}
          onValueChange={handleCategoryChange}
          className="mb-8"
        >
          <div className="flex justify-center">
            <TabsList className="grid grid-flow-col auto-cols-max gap-1 overflow-x-auto max-w-full p-1">
              <TabsTrigger 
                value="all"
                className="px-4 py-2"
              >
                الكل
              </TabsTrigger>
              
              {categories.map((category) => (
                <TabsTrigger 
                  key={category.id} 
                  value={category.slug}
                  className="px-4 py-2 whitespace-nowrap"
                >
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </Tabs>

        {/* Content Area */}
        <div className="mt-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p>جاري تحميل المقالات...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
              <AlertCircle className="h-12 w-12 text-destructive mb-4" />
              <h3 className="text-xl font-semibold">حدث خطأ</h3>
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
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
              <h3 className="text-xl font-semibold">لا توجد مقالات</h3>
              <p className="text-muted-foreground mt-2">لم يتم العثور على مقالات تطابق معايير البحث</p>
              {hasActiveFilters && (
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={clearAllFilters}
                >
                  عرض كل المقالات
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {articles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-12 flex justify-center">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
