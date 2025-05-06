'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { FilterSidebar } from './filter-sidebar';
import { ScholarshipCard } from './scholarship-card';
import { Pagination } from '@/components/ui/pagination';
import { Loader2, AlertCircle, Filter, X } from 'lucide-react';

type Scholarship = {
  id: number;
  title: string;
  excerpt?: string;
  slug: string;
  deadline: string;
  thumbnailUrl?: string;
  country?: string;
  university?: string;
  degree?: string;
  categoryName?: string;
  isFeatured?: boolean;
  isFullyFunded?: boolean;
};

type FilterParams = {
  country?: string;
  level?: string;
  category?: string;
  query?: string;
  funded?: boolean;
  page?: number;
};

export function ScholarshipsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterParams>({});

  // Extract current filters from URL
  useEffect(() => {
    const params: FilterParams = {};

    if (searchParams.has('country')) params.country = searchParams.get('country') || undefined;
    if (searchParams.has('level')) params.level = searchParams.get('level') || undefined;
    if (searchParams.has('category')) params.category = searchParams.get('category') || undefined;
    if (searchParams.has('query')) params.query = searchParams.get('query') || undefined;
    if (searchParams.has('funded')) params.funded = searchParams.get('funded') === 'true';
    if (searchParams.has('page')) {
      const pageParam = parseInt(searchParams.get('page') || '1');
      params.page = isNaN(pageParam) ? 1 : pageParam;
      setCurrentPage(params.page);
    } else {
      setCurrentPage(1);
    }

    setActiveFilters(params);
  }, [searchParams]);

  // Fetch scholarships based on filters
  useEffect(() => {
    const fetchScholarships = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Build query params
        const queryParams = new URLSearchParams();
        if (activeFilters.country) queryParams.append('country', activeFilters.country);
        if (activeFilters.level) queryParams.append('level', activeFilters.level);
        if (activeFilters.category) queryParams.append('category', activeFilters.category);
        if (activeFilters.query) queryParams.append('search', activeFilters.query);
        if (activeFilters.funded) queryParams.append('funded', 'true');
        if (activeFilters.page) queryParams.append('page', activeFilters.page.toString());
        queryParams.append('limit', '10');

        const response = await fetch(`/api/scholarships?${queryParams.toString()}`);
        if (!response.ok) {
          throw new Error(`Error fetching scholarships: ${response.status}`);
        }

        const data = await response.json();
        setScholarships(data?.data || []);
        setTotalPages(data?.meta?.totalPages || 1);
      } catch (error) {
        console.error('Error fetching scholarships:', error);
        setError('فشل في تحميل المنح الدراسية. يرجى المحاولة مرة أخرى.');
        setScholarships([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchScholarships();
  }, [activeFilters]);

  const handlePageChange = (page: number) => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set('page', page.toString());
    router.push(`/scholarships?${newParams.toString()}`);
  };

  const clearFilter = (filterName: string) => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.delete(filterName);
    newParams.set('page', '1');
    router.push(`/scholarships?${newParams.toString()}`);
  };

  const clearAllFilters = () => {
    router.push('/scholarships');
  };

  const hasActiveFilters = (
    activeFilters.country || 
    activeFilters.level || 
    activeFilters.category || 
    activeFilters.query || 
    activeFilters.funded
  );

  // Count the number of active filters
  const activeFilterCount = Object.entries(activeFilters).filter(([key, value]) => {
    return key !== 'page' && value !== undefined && value !== '';
  }).length;

  return (
    <div className="min-h-screen bg-background">
      <div className="container px-4 py-8 md:px-6 lg:py-12">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">المنح الدراسية</h1>
              <p className="text-muted-foreground mt-2">استكشف المنح الدراسية المتاحة حول العالم</p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="md:hidden"
                onClick={() => setIsMobileFilterOpen(true)}
              >
                <Filter className="h-4 w-4 ml-2" />
                تصفية
                {activeFilterCount > 0 && (
                  <span className="inline-flex items-center justify-center w-5 h-5 mr-2 text-xs font-bold text-white bg-primary rounded-full">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
              
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
          </div>

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 mt-4">
              {activeFilters.country && (
                <div className="bg-muted rounded-full px-3 py-1 text-sm flex items-center">
                  البلد: {activeFilters.country}
                  <button onClick={() => clearFilter('country')} className="mr-2 hover:text-primary">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              {activeFilters.level && (
                <div className="bg-muted rounded-full px-3 py-1 text-sm flex items-center">
                  المستوى: {activeFilters.level}
                  <button onClick={() => clearFilter('level')} className="mr-2 hover:text-primary">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              {activeFilters.category && (
                <div className="bg-muted rounded-full px-3 py-1 text-sm flex items-center">
                  التخصص: {activeFilters.category}
                  <button onClick={() => clearFilter('category')} className="mr-2 hover:text-primary">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              {activeFilters.query && (
                <div className="bg-muted rounded-full px-3 py-1 text-sm flex items-center">
                  البحث: {activeFilters.query}
                  <button onClick={() => clearFilter('query')} className="mr-2 hover:text-primary">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              {activeFilters.funded && (
                <div className="bg-muted rounded-full px-3 py-1 text-sm flex items-center">
                  تمويل كامل
                  <button onClick={() => clearFilter('funded')} className="mr-2 hover:text-primary">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar - Hidden on mobile, shown on larger screens */}
          <div className="hidden md:block w-72 shrink-0">
            <FilterSidebar activeFilters={activeFilters} />
          </div>
          
          {/* Mobile Filter Sidebar - Shown when filter button is clicked */}
          {isMobileFilterOpen && (
            <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm md:hidden">
              <div className="fixed inset-y-0 left-0 z-50 h-full w-3/4 bg-background shadow-lg">
                <div className="flex items-center justify-between p-4 border-b">
                  <h2 className="text-lg font-medium">تصفية المنح</h2>
                  <Button variant="ghost" size="icon" onClick={() => setIsMobileFilterOpen(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="p-4 h-[calc(100%-4rem)] overflow-y-auto">
                  <FilterSidebar activeFilters={activeFilters} />
                </div>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p>جاري تحميل المنح الدراسية...</p>
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
            ) : scholarships.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                <h3 className="text-xl font-semibold">لا توجد منح دراسية</h3>
                <p className="text-muted-foreground mt-2">لم يتم العثور على منح دراسية تطابق معايير البحث</p>
                {hasActiveFilters && (
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={clearAllFilters}
                  >
                    عرض كل المنح
                  </Button>
                )}
              </div>
            ) : (
              <>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                  {scholarships.map((scholarship) => (
                    <ScholarshipCard key={scholarship.id} scholarship={scholarship} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-8 flex justify-center">
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
    </div>
  );
}
