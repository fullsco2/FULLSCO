'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Pagination } from '@/components/ui/pagination';
import { 
  ArrowUpDown, 
  Check, 
  ChevronDown, 
  Filter, 
  Search, 
  X, 
  Loader2, 
  AlertCircle,
  CalendarRange,
  GraduationCap,
  MapPin,
  BookOpen,
  Banknote
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface Scholarship {
  id: number;
  title: string;
  slug: string;
  description: string;
  excerpt?: string;
  deadline: string;
  university?: string;
  country?: string;
  categoryId?: number;
  levelId?: number;
  countryId?: number;
  category?: { name: string; slug: string };
  level?: { name: string; slug: string };
  countryObj?: { name: string; slug: string };
  fundingType?: string;
  fundingAmount?: string;
  fundingCurrency?: string;
  scholarshipUrl?: string;
  isFundingComplete?: boolean;
  isFeatured?: boolean;
  createdAt: string;
  updatedAt: string;
}

interface FilterOption {
  id: number;
  name: string;
  slug: string;
}

interface ScholarshipsResponse {
  data: Scholarship[];
  meta: {
    total: number;
    totalPages: number;
    currentPage: number;
  };
}

export function ScholarshipsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // حالة التحميل والخطأ
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // المنح الدراسية
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0
  });
  
  // خيارات التصفية
  const [levels, setLevels] = useState<FilterOption[]>([]);
  const [countries, setCountries] = useState<FilterOption[]>([]);
  const [categories, setCategories] = useState<FilterOption[]>([]);
  
  // حالة المرشحات
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // تم إعداد المرشحات من معلمات URL
  const [activeFilters, setActiveFilters] = useState<{
    levelId?: string;
    countryId?: string;
    categoryId?: string;
    isFundingComplete?: boolean;
    searchQuery?: string;
  }>({});

  // تحميل خيارات التصفية
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const [levelsRes, countriesRes, categoriesRes] = await Promise.all([
          fetch('/api/levels'),
          fetch('/api/countries'),
          fetch('/api/categories')
        ]);

        if (!levelsRes.ok || !countriesRes.ok || !categoriesRes.ok) {
          throw new Error('Failed to fetch filter options');
        }

        const levelsData = await levelsRes.json();
        const countriesData = await countriesRes.json();
        const categoriesData = await categoriesRes.json();

        setLevels(levelsData);
        setCountries(countriesData);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error fetching filter options:', error);
      }
    };

    fetchFilterOptions();
  }, []);

  // تحديث المرشحات النشطة بناءً على معلمات URL
  useEffect(() => {
    const params = Object.fromEntries(searchParams.entries());
    
    const newFilters: typeof activeFilters = {};
    if (params.level) newFilters.levelId = params.level;
    if (params.country) newFilters.countryId = params.country;
    if (params.category) newFilters.categoryId = params.category;
    if (params.funded === 'true') newFilters.isFundingComplete = true;
    if (params.q) {
      newFilters.searchQuery = params.q;
      setSearchQuery(params.q);
    }
    
    setActiveFilters(newFilters);
    setPagination(prev => ({ ...prev, currentPage: Number(params.page) || 1 }));
  }, [searchParams]);

  // جلب المنح الدراسية بناءً على المرشحات النشطة
  useEffect(() => {
    const fetchScholarships = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const params = new URLSearchParams();
        params.append('page', pagination.currentPage.toString());
        params.append('limit', '10');
        
        // إضافة المرشحات النشطة إلى الطلب
        if (activeFilters.levelId) params.append('level', activeFilters.levelId);
        if (activeFilters.countryId) params.append('country', activeFilters.countryId);
        if (activeFilters.categoryId) params.append('category', activeFilters.categoryId);
        if (activeFilters.isFundingComplete) params.append('funded', 'true');
        if (activeFilters.searchQuery) params.append('q', activeFilters.searchQuery);

        const response = await fetch(`/api/scholarships?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error(`Error fetching scholarships: ${response.status}`);
        }

        const data: ScholarshipsResponse = await response.json();
        
        setScholarships(data.data || []);
        setPagination({
          currentPage: data.meta?.currentPage || 1,
          totalPages: data.meta?.totalPages || 1,
          total: data.meta?.total || 0
        });
      } catch (error) {
        console.error('Error fetching scholarships:', error);
        setError('\u0641\u0634\u0644 \u0641\u064a \u062a\u062d\u0645\u064a\u0644 \u0627\u0644\u0645\u0646\u062d \u0627\u0644\u062f\u0631\u0627\u0633\u064a\u0629. \u064a\u0631\u062c\u0649 \u0627\u0644\u0645\u062d\u0627\u0648\u0644\u0629 \u0645\u0631\u0629 \u0623\u062e\u0631\u0649.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchScholarships();
  }, [activeFilters, pagination.currentPage]);

  // تطبيق المرشحات
  const applyFilters = (filters: typeof activeFilters) => {
    const params = new URLSearchParams(searchParams.toString());

    // إزالة المرشحات الحالية
    params.delete('level');
    params.delete('country');
    params.delete('category');
    params.delete('funded');
    params.delete('q');
    params.delete('page');

    // إضافة المرشحات الجديدة
    if (filters.levelId) params.set('level', filters.levelId);
    if (filters.countryId) params.set('country', filters.countryId);
    if (filters.categoryId) params.set('category', filters.categoryId);
    if (filters.isFundingComplete) params.set('funded', 'true');
    if (filters.searchQuery) params.set('q', filters.searchQuery);

    // إعادة تعيين الصفحة إلى 1 عند تغيير المرشحات
    params.set('page', '1');

    // تحديث URL
    router.push(`/scholarships?${params.toString()}`);
  };

  // إرسال نموذج البحث
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters({ ...activeFilters, searchQuery });
  };

  // التغيير إلى صفحة معينة
  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`/scholarships?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // مسح المرشح
  const clearFilter = (type: keyof typeof activeFilters) => {
    const newFilters = { ...activeFilters };
    delete newFilters[type];
    applyFilters(newFilters);
  };

  // مسح جميع المرشحات
  const clearAllFilters = () => {
    router.push('/scholarships');
  };

  // حساب ما إذا كانت هناك مرشحات نشطة
  const hasActiveFilters = Object.keys(activeFilters).length > 0;

  // احصل على أسماء المرشحات لعرضها
  const getFilterName = (type: string, id: string) => {
    switch (type) {
      case 'levelId':
        return levels.find(l => l.slug === id)?.name || id;
      case 'countryId':
        return countries.find(c => c.slug === id)?.name || id;
      case 'categoryId':
        return categories.find(c => c.slug === id)?.name || id;
      case 'isFundingComplete':
        return '\u062a\u0645\u0648\u064a\u0644 \u0643\u0627\u0645\u0644';
      default:
        return '';
    }
  };

  // العدد الإجمالي للمنح الدراسية المعروضة
  const resultsCount = pagination.total;

  // إنشاء شريط المرشحات النشطة
  const activeFilterBadges = useMemo(() => {
    return Object.entries(activeFilters)
      .filter(([key]) => key !== 'searchQuery') // لا تظهر شارة للبحث
      .map(([key, value]) => {
        if (!value) return null;
        
        return (
          <Badge key={key} variant="secondary" className="mr-2 mb-2">
            {getFilterName(key, value as string)}
            <button 
              onClick={() => clearFilter(key as keyof typeof activeFilters)}
              className="mr-1 ml-2 text-xs"
              aria-label={`\u0625\u0632\u0627\u0644\u0629 \u0645\u0631\u0634\u062d ${getFilterName(key, value as string)}`}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        );
      });
  }, [activeFilters, levels, countries, categories]);

  return (
    <div className="min-h-screen bg-background pb-10">
      <div className="container py-8">
        {/* ر\u0623\u0633 \u0627\u0644\u0635\u0641\u062d\u0629 */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">\u0627\u0644\u0645\u0646\u062d \u0627\u0644\u062f\u0631\u0627\u0633\u064a\u0629</h1>
          <p className="text-muted-foreground">
            \u0627\u0643\u062a\u0634\u0641 \u0623\u062d\u062f\u062b \u0627\u0644\u0645\u0646\u062d \u0627\u0644\u062f\u0631\u0627\u0633\u064a\u0629 \u0641\u064a \u0645\u062e\u062a\u0644\u0641 \u0627\u0644\u062c\u0627\u0645\u0639\u0627\u062a \u0627\u0644\u0639\u0627\u0644\u0645\u064a\u0629
          </p>
        </div>

        {/* ا\u0644\u0628\u062d\u062b \u0648\u0632\u0631 \u0627\u0644\u0645\u0631\u0634\u062d */}
        <div className="flex flex-col md:flex-row gap-4 items-stretch mb-6">
          <form 
            className="flex-1 flex items-center relative" 
            onSubmit={handleSearch}
          >
            <Input
              placeholder="\u0627\u0628\u062d\u062b \u0639\u0646 \u0645\u0646\u062d\u0629 \u062f\u0631\u0627\u0633\u064a\u0629..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button type="submit" size="icon" variant="ghost" className="absolute right-1">
              <Search className="h-4 w-4" />
            </Button>
          </form>
          
          <Button
            variant="outline"
            className="md:w-auto w-full"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <Filter className="h-4 w-4 ml-2" />
            <span>\u0645\u0631\u0634\u062d\u0627\u062a</span>
            <ChevronDown className="h-4 w-4 mr-2" />
          </Button>
        </div>

        {/* ش\u0631\u064a\u0637 \u0627\u0644\u0645\u0631\u0634\u062d\u0627\u062a \u0627\u0644\u0646\u0634\u0637\u0629 */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center mb-6">
            <div className="ml-2 font-medium text-sm mb-2">\u0627\u0644\u0645\u0631\u0634\u062d\u0627\u062a:</div>
            {activeFilterBadges}
            {hasActiveFilters && (
              <Button 
                variant="outline" 
                size="sm" 
                className="mb-2" 
                onClick={clearAllFilters}
              >
                \u0645\u0633\u062d \u0627\u0644\u0643\u0644
              </Button>
            )}
          </div>
        )}

        {/* \u0648\u0627\u062c\u0647\u0629 \u0627\u0644\u0645\u0633\u062a\u062e\u062f\u0645 \u0627\u0644\u0631\u0626\u064a\u0633\u064a\u0629 */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* \u0627\u0644\u0634\u0631\u064a\u0637 \u0627\u0644\u062c\u0627\u0646\u0628\u064a \u0644\u0644\u0645\u0631\u0634\u062d\u0627\u062a */}
          <aside 
            className={`lg:block ${isSidebarOpen ? 'block' : 'hidden'} col-span-1 bg-card rounded-lg border p-5 h-fit sticky top-4`}
          >
            <div className="mb-5">
              <h3 className="text-lg font-medium mb-3">\u0627\u0644\u0645\u0633\u062a\u0648\u0649 \u0627\u0644\u062f\u0631\u0627\u0633\u064a</h3>
              <div className="space-y-2">
                {levels.map(level => (
                  <button
                    key={level.id}
                    className="flex items-center w-full justify-between px-2 py-1.5 rounded hover:bg-muted text-sm transition-colors text-right"
                    onClick={() => applyFilters({ ...activeFilters, levelId: level.slug })}
                  >
                    <span className="truncate">{level.name}</span>
                    {activeFilters.levelId === level.slug && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-5">
              <h3 className="text-lg font-medium mb-3">\u0627\u0644\u0628\u0644\u062f</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {countries.map(country => (
                  <button
                    key={country.id}
                    className="flex items-center w-full justify-between px-2 py-1.5 rounded hover:bg-muted text-sm transition-colors text-right"
                    onClick={() => applyFilters({ ...activeFilters, countryId: country.slug })}
                  >
                    <span className="truncate">{country.name}</span>
                    {activeFilters.countryId === country.slug && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-5">
              <h3 className="text-lg font-medium mb-3">\u0627\u0644\u062a\u062e\u0635\u0635</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {categories.map(category => (
                  <button
                    key={category.id}
                    className="flex items-center w-full justify-between px-2 py-1.5 rounded hover:bg-muted text-sm transition-colors text-right"
                    onClick={() => applyFilters({ ...activeFilters, categoryId: category.slug })}
                  >
                    <span className="truncate">{category.name}</span>
                    {activeFilters.categoryId === category.slug && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-5">
              <h3 className="text-lg font-medium mb-3">\u0646\u0648\u0639 \u0627\u0644\u062a\u0645\u0648\u064a\u0644</h3>
              <div className="space-y-2">
                <button
                  className="flex items-center w-full justify-between px-2 py-1.5 rounded hover:bg-muted text-sm transition-colors text-right"
                  onClick={() => applyFilters({ ...activeFilters, isFundingComplete: true })}
                >
                  <span className="truncate">\u062a\u0645\u0648\u064a\u0644 \u0643\u0627\u0645\u0644</span>
                  {activeFilters.isFundingComplete && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </button>
              </div>
            </div>

            <Button className="w-full" onClick={clearAllFilters}>
              \u0625\u0632\u0627\u0644\u0629 \u062c\u0645\u064a\u0639 \u0627\u0644\u0645\u0631\u0634\u062d\u0627\u062a
            </Button>
          </aside>

          {/* \u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0645\u0646\u062d \u0627\u0644\u062f\u0631\u0627\u0633\u064a\u0629 */}
          <div className="lg:col-span-3">
            {/* \u0645\u0639\u0644\u0648\u0645\u0627\u062a \u0646\u062a\u064a\u062c\u0629 \u0627\u0644\u0628\u062d\u062b */}
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-muted-foreground">
                \u0639\u0631\u0636 <span className="font-medium">{resultsCount}</span> \u0645\u0646\u062d\u0629 \u062f\u0631\u0627\u0633\u064a\u0629
              </p>
              
              <div className="flex items-center">
                <span className="text-sm text-muted-foreground ml-2">\u062a\u0635\u0646\u064a\u0641:</span>
                <button className="flex items-center text-sm">
                  <span className="ml-1">\u0627\u0644\u0623\u062d\u062f\u062b</span>
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </div>
            </div>

            {/* \u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0645\u0646\u062d \u0627\u0644\u062f\u0631\u0627\u0633\u064a\u0629 */}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p>\u062c\u0627\u0631\u064a \u062a\u062d\u0645\u064a\u0644 \u0627\u0644\u0645\u0646\u062d \u0627\u0644\u062f\u0631\u0627\u0633\u064a\u0629...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                <AlertCircle className="h-12 w-12 text-destructive mb-4" />
                <h3 className="text-xl font-semibold">\u062d\u062f\u062b \u062e\u0637\u0623</h3>
                <p className="text-muted-foreground mt-2">{error}</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => window.location.reload()}
                >
                  \u0625\u0639\u0627\u062f\u0629 \u0627\u0644\u0645\u062d\u0627\u0648\u0644\u0629
                </Button>
              </div>
            ) : scholarships.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                <h3 className="text-xl font-semibold">\u0644\u0645 \u064a\u062a\u0645 \u0627\u0644\u0639\u062b\u0648\u0631 \u0639\u0644\u0649 \u0645\u0646\u062d \u062f\u0631\u0627\u0633\u064a\u0629</h3>
                <p className="text-muted-foreground mt-2">
                  \u0644\u0645 \u064a\u062a\u0645 \u0627\u0644\u0639\u062b\u0648\u0631 \u0639\u0644\u0649 \u0645\u0646\u062d \u062f\u0631\u0627\u0633\u064a\u0629 \u062a\u0637\u0627\u0628\u0642 \u0645\u0639\u0627\u064a\u064a\u0631 \u0627\u0644\u0628\u062d\u062b
                </p>
                {hasActiveFilters && (
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={clearAllFilters}
                  >
                    \u0625\u0632\u0627\u0644\u0629 \u0627\u0644\u0645\u0631\u0634\u062d\u0627\u062a
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {scholarships.map((scholarship) => (
                  <ScholarshipCard key={scholarship.id} scholarship={scholarship} />
                ))}
                
                {/* أزرار التنقل بين الصفحات */}
                {pagination.totalPages > 1 && (
                  <div className="pt-8 flex justify-center">
                    <Pagination
                      currentPage={pagination.currentPage}
                      totalPages={pagination.totalPages}
                      onPageChange={handlePageChange}
                    />
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

function ScholarshipCard({ scholarship }: { scholarship: Scholarship }) {
  const {
    title,
    excerpt,
    slug,
    deadline,
    university,
    country,
    category,
    level,
    isFundingComplete,
  } = scholarship;

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow duration-300">
      <CardContent className="p-6">
        <div className="flex justify-between gap-4">
          <div className="space-y-3">
            <h3 className="font-bold text-xl">
              <Link href={`/scholarships/${slug}`} className="hover:text-primary">
                {title}
              </Link>
            </h3>

            {excerpt && (
              <p className="text-muted-foreground line-clamp-2">
                {excerpt}
              </p>
            )}

            <div className="flex flex-wrap gap-2 pt-1">
              {level && (
                <Badge variant="outline" className="flex items-center">
                  <GraduationCap className="mr-1 h-3 w-3" />
                  <span>{level.name}</span>
                </Badge>
              )}
              
              {category && (
                <Badge variant="outline" className="flex items-center">
                  <BookOpen className="mr-1 h-3 w-3" />
                  <span>{category.name}</span>
                </Badge>
              )}

              {isFundingComplete && (
                <Badge variant="secondary" className="flex items-center">
                  <Banknote className="mr-1 h-3 w-3" />
                  <span>\u062a\u0645\u0648\u064a\u0644 \u0643\u0627\u0645\u0644</span>
                </Badge>
              )}
            </div>
            
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              {university && (
                <div className="flex items-center">
                  <GraduationCap className="mr-1 h-4 w-4 opacity-70" />
                  <span>{university}</span>
                </div>
              )}
              
              {country && (
                <div className="flex items-center">
                  <MapPin className="mr-1 h-4 w-4 opacity-70" />
                  <span>{country}</span>
                </div>
              )}

              {deadline && (
                <div className="flex items-center">
                  <CalendarRange className="mr-1 h-4 w-4 opacity-70" />
                  <span>\u0622\u062e\u0631 \u0645\u0648\u0639\u062f: {formatDate(deadline)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
