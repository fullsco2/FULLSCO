'use client';

import { useState, useEffect } from 'react';
import { MoveRight, MoveLeft, Search, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import ScholarshipCard from './scholarship-card';
import FilterSidebar from './filter-sidebar';
import { Button } from '@/components/ui/button';

interface ScholarshipsPageProps {
  searchParams?: {
    country?: string;
    level?: string;
    category?: string;
    funded?: string;
    search?: string;
    page?: string;
  };
}

export default function ScholarshipsPage({ searchParams = {} }: ScholarshipsPageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [scholarships, setScholarships] = useState<any[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(searchParams.search || '');
  
  // الصفحة الحالية
  const currentPage = searchParams.page ? parseInt(searchParams.page) : 1;
  const itemsPerPage = 12;

  useEffect(() => {
    const fetchScholarships = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // بناء الاستعلام
        const queryParams = new URLSearchParams();
        
        // إضافة معلمات الصفحة وعدد العناصر
        queryParams.set('page', currentPage.toString());
        queryParams.set('limit', itemsPerPage.toString());
        
        // إضافة معلمات الفلتر
        if (searchParams.country) queryParams.set('country', searchParams.country);
        if (searchParams.level) queryParams.set('level', searchParams.level);
        if (searchParams.category) queryParams.set('category', searchParams.category);
        if (searchParams.funded) queryParams.set('funded', searchParams.funded);
        if (searchParams.search) queryParams.set('search', searchParams.search);
        
        // طلب البيانات من API الحالي
        const response = await fetch(`/api/scholarships?${queryParams.toString()}`);
        if (!response.ok) {
          throw new Error('Failed to fetch scholarships');
        }
        
        const data = await response.json();
        
        // التعامل مع هيكل البيانات من API الحالي
        if (data.success && data.data) {
          setScholarships(data.data);
          setTotalItems(data.totalItems || data.data.length);
        } else if (Array.isArray(data)) {
          // إذا كانت الاستجابة مصفوفة مباشرة
          setScholarships(data);
          setTotalItems(data.length);
        } else {
          setScholarships([]);
          setTotalItems(0);
        }
      } catch (err) {
        console.error('Error fetching scholarships:', err);
        setError(err instanceof Error ? err.message : 'حدث خطأ أثناء جلب المنح الدراسية');
      } finally {
        setLoading(false);
      }
    };
    
    fetchScholarships();
  }, [searchParams, currentPage]);

  // حساب عدد الصفحات
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // معالجة البحث
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // بناء معلمات URL جديدة مع تضمين المعلمات الحالية
    const params = new URLSearchParams();
    
    if (searchQuery) params.set('search', searchQuery);
    if (searchParams.country) params.set('country', searchParams.country);
    if (searchParams.level) params.set('level', searchParams.level);
    if (searchParams.category) params.set('category', searchParams.category);
    if (searchParams.funded) params.set('funded', searchParams.funded);
    
    // العودة للصفحة الأولى عند تغيير البحث
    const queryString = params.toString();
    router.push(`${pathname}${queryString ? `?${queryString}` : ''}`);
  };

  // الانتقال إلى صفحة
  const goToPage = (page: number) => {
    // التأكد من أن الصفحة ضمن النطاق الصحيح
    if (page < 1 || page > totalPages) return;
    
    // بناء معلمات URL جديدة
    const params = new URLSearchParams();
    
    // إضافة رقم الصفحة إذا لم يكن الصفحة الأولى
    if (page > 1) params.set('page', page.toString());
    
    // إضافة معلمات البحث والفلتر الحالية
    if (searchParams.search) params.set('search', searchParams.search);
    if (searchParams.country) params.set('country', searchParams.country);
    if (searchParams.level) params.set('level', searchParams.level);
    if (searchParams.category) params.set('category', searchParams.category);
    if (searchParams.funded) params.set('funded', searchParams.funded);
    
    const queryString = params.toString();
    router.push(`${pathname}${queryString ? `?${queryString}` : ''}`);
  };

  return (
    <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      {/* عنوان الصفحة */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-primary md:text-4xl">المنح الدراسية</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">استكشف المنح الدراسية المتاحة حول العالم والفرص الدراسية المناسبة</p>
      </div>
      
      {/* شريط البحث */}
      <div className="mb-8 rounded-lg bg-gray-50 dark:bg-gray-800 p-4 lg:p-6">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن منحة دراسية..."
              className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 pr-10 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-700 dark:bg-gray-900"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          </div>
          <Button 
            type="submit" 
            className="bg-primary hover:bg-primary/90"
          >
            بحث
          </Button>
        </form>
      </div>
      
      {/* المحتوى الرئيسي */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* فلتر جانبي */}
        <div className="hidden md:block w-72 flex-shrink-0">
          <FilterSidebar initialFilters={searchParams} />
        </div>
        
        {/* فلتر للهاتف المحمول */}
        <div className="md:hidden">
          <FilterSidebar initialFilters={searchParams} />
        </div>
        
        {/* قائمة المنح */}
        <div className="flex-1">
          {/* ضوابط ومعلومات */}
          <div className="mb-4 flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-300">
              {loading ? (
                <span>جاري البحث...</span>
              ) : (
                <span>تم العثور على {totalItems} منحة</span>
              )}
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => router.refresh()}
              className="text-gray-600 dark:text-gray-300"
            >
              <RefreshCw className="ml-1 h-4 w-4" />
              تحديث
            </Button>
          </div>
          
          {loading ? (
            // شاشة التحميل
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="animate-pulse rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                  <div className="h-48 bg-gray-200 dark:bg-gray-800"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2"></div>
                    <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            // رسالة خطأ
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center dark:border-red-800 dark:bg-red-900/20">
              <p className="text-red-600 dark:text-red-400">{error}</p>
              <Button 
                variant="outline" 
                className="mt-2" 
                onClick={() => router.refresh()}
              >
                إعادة المحاولة
              </Button>
            </div>
          ) : scholarships.length === 0 ? (
            // لا توجد نتائج
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center dark:border-gray-800 dark:bg-gray-900">
              <h3 className="mb-2 text-xl font-semibold">لم يتم العثور على منح دراسية</h3>
              <p className="mb-4 text-gray-600 dark:text-gray-300">حاول تغيير معايير البحث أو الفلتر</p>
              <Link href="/scholarships">
                <Button variant="outline">عرض جميع المنح</Button>
              </Link>
            </div>
          ) : (
            // قائمة المنح
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {scholarships.map((scholarship) => (
                  <ScholarshipCard key={scholarship.id} scholarship={scholarship} />
                ))}
              </div>
              
              {/* الترقيم */}
              {totalPages > 1 && (
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
