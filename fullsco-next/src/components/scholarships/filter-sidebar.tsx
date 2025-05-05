'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Filter, Sliders, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Level {
  id: number;
  name: string;
  slug: string;
}

interface Country {
  id: number;
  name: string;
  slug: string;
  flag?: string;
}

interface FilterSidebarProps {
  initialFilters?: {
    country?: string;
    level?: string;
    category?: string;
    funded?: string;
  };
}

export default function FilterSidebar({ initialFilters = {} }: FilterSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // حالة الفلتر
  const [selectedCountry, setSelectedCountry] = useState<string | undefined>(initialFilters.country);
  const [selectedLevel, setSelectedLevel] = useState<string | undefined>(initialFilters.level);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(initialFilters.category);
  const [isFunded, setIsFunded] = useState<boolean>(initialFilters.funded === 'true');
  
  // بيانات الفلتر
  const [countries, setCountries] = useState<Country[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // جلب بيانات الفلتر
  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        const [countriesRes, levelsRes, categoriesRes] = await Promise.all([
          fetch('/api/countries').then(res => res.json()),
          fetch('/api/levels').then(res => res.json()),
          fetch('/api/categories').then(res => res.json()),
        ]);
        
        setCountries(countriesRes);
        setLevels(levelsRes);
        setCategories(categoriesRes);
      } catch (error) {
        console.error('Error fetching filter data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFilterData();
  }, []);

  // تطبيق الفلاتر
  const applyFilters = () => {
    const params = new URLSearchParams();
    
    if (selectedCountry) params.set('country', selectedCountry);
    if (selectedLevel) params.set('level', selectedLevel);
    if (selectedCategory) params.set('category', selectedCategory);
    if (isFunded) params.set('funded', 'true');
    
    const queryString = params.toString();
    router.push(`${pathname}${queryString ? `?${queryString}` : ''}`);
    
    if (isMobile) {
      setIsOpen(false);
    }
  };

  // إعادة تعيين الفلاتر
  const resetFilters = () => {
    setSelectedCountry(undefined);
    setSelectedLevel(undefined);
    setSelectedCategory(undefined);
    setIsFunded(false);
    router.push(pathname);
    
    if (isMobile) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* زر فتح الفلتر للجوال */}
      {isMobile && (
        <div className="fixed bottom-4 right-4 z-40">
          <Button 
            onClick={() => setIsOpen(true)} 
            size="lg" 
            className="flex items-center gap-2 rounded-full shadow-lg bg-primary hover:bg-primary/90"
          >
            <Filter className="h-5 w-5" />
            <span>الفلتر</span>
          </Button>
        </div>
      )}

      {/* الصندوق الجانبي للفلتر */}
      <div 
        className={`${isMobile ? 'fixed inset-0 z-50 bg-black bg-opacity-50' : ''} ${isMobile && !isOpen ? 'hidden' : ''}`}
        onClick={isMobile ? () => setIsOpen(false) : undefined}
      >
        <aside 
          className={`w-full md:w-72 p-4 md:p-6 bg-white dark:bg-gray-900 shadow-lg overflow-y-auto ${isMobile ? 'fixed bottom-0 right-0 left-0 z-50 rounded-t-2xl max-h-[90vh]' : 'sticky top-20 rounded-xl border border-gray-200 dark:border-gray-800'}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Sliders className="h-5 w-5" />
              خيارات البحث
            </h2>
            {isMobile && (
              <Button size="icon" variant="ghost" onClick={() => setIsOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            )}
          </div>

          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 10 }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-2/3 mb-2"></div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {/* الدول */}
              <div className="space-y-2">
                <h3 className="font-medium text-lg">الدولة</h3>
                <select
                  className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800"
                  value={selectedCountry || ''}
                  onChange={(e) => setSelectedCountry(e.target.value || undefined)}
                >
                  <option value="">جميع الدول</option>
                  {countries.map((country) => (
                    <option key={country.id} value={country.slug}>
                      {country.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* المستوى الدراسي */}
              <div className="space-y-2">
                <h3 className="font-medium text-lg">المستوى الدراسي</h3>
                <div className="grid grid-cols-1 gap-2">
                  <select
                    className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800"
                    value={selectedLevel || ''}
                    onChange={(e) => setSelectedLevel(e.target.value || undefined)}
                  >
                    <option value="">جميع المستويات</option>
                    {levels.map((level) => (
                      <option key={level.id} value={level.slug}>
                        {level.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* التخصص */}
              <div className="space-y-2">
                <h3 className="font-medium text-lg">التخصص</h3>
                <select
                  className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800"
                  value={selectedCategory || ''}
                  onChange={(e) => setSelectedCategory(e.target.value || undefined)}
                >
                  <option value="">جميع التخصصات</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.slug}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* خيارات التمويل */}
              <div className="space-y-2">
                <h3 className="font-medium text-lg">خيارات التمويل</h3>
                <label className="flex items-center space-x-3 rtl:space-x-reverse cursor-pointer p-2 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div className="h-5 w-5 rounded-sm border border-primary flex items-center justify-center">
                    {isFunded && <Check className="h-4 w-4 text-primary" />}
                  </div>
                  <span onClick={() => setIsFunded(!isFunded)} className="select-none">تمويل كامل فقط</span>
                </label>
              </div>

              {/* أزرار العمليات */}
              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={applyFilters}
                  className="flex-1 bg-primary hover:bg-primary/90"
                >
                  تطبيق
                </Button>
                <Button 
                  onClick={resetFilters}
                  variant="outline"
                  className="flex-1"
                >
                  إعادة تعيين
                </Button>
              </div>
            </div>
          )}
        </aside>
      </div>
    </>
  );
}
