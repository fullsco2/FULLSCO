'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getCategories, getLevels, getCountries } from '@/lib/api';

export default function SearchSection() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [isFunded, setIsFunded] = useState(false);
  
  const [categories, setCategories] = useState<any[]>([]);
  const [levels, setLevels] = useState<any[]>([]);
  const [countries, setCountries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFilterData() {
      setLoading(true);
      try {
        // جلب بيانات الفلتر بالتوازي
        const [categoriesData, levelsData, countriesData] = await Promise.all([
          getCategories(),
          getLevels(),
          getCountries()
        ]);
        
        setCategories(categoriesData);
        setLevels(levelsData);
        setCountries(countriesData);
      } catch (error) {
        console.error('Error loading filter data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadFilterData();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // بناء معلمات URL للبحث
    const params = new URLSearchParams();
    
    if (searchQuery) params.set('search', searchQuery);
    if (selectedCategory) params.set('category', selectedCategory);
    if (selectedLevel) params.set('level', selectedLevel);
    if (selectedCountry) params.set('country', selectedCountry);
    if (isFunded) params.set('funded', 'true');
    
    // الانتقال إلى صفحة المنح مع معلمات البحث
    const queryString = params.toString();
    router.push(`/scholarships${queryString ? `?${queryString}` : ''}`);
  };

  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6 text-center">
            <h2 className="mb-3 text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">ابحث عن منحة دراسية</h2>
            <p className="text-gray-600 dark:text-gray-300">استخدم أدوات البحث المتقدمة للعثور على المنحة المناسبة لك</p>
          </div>
          
          <form onSubmit={handleSearch} className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="space-y-4">
              {/* مربع البحث */}
              <div>
                <label htmlFor="search" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">البحث العام</label>
                <div className="relative">
                  <input
                    type="text"
                    id="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ابحث باسم الجامعة أو المنحة..."
                    className="w-full rounded-md border border-gray-300 px-4 py-2 pl-10 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-700 dark:bg-gray-800"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
                {/* التخصص */}
                <div>
                  <label htmlFor="category" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">التخصص</label>
                  <select
                    id="category"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-700 dark:bg-gray-800"
                    disabled={loading}
                  >
                    <option value="">جميع التخصصات</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.slug}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* المستوى الدراسي */}
                <div>
                  <label htmlFor="level" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">المستوى الدراسي</label>
                  <select
                    id="level"
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-700 dark:bg-gray-800"
                    disabled={loading}
                  >
                    <option value="">جميع المستويات</option>
                    {levels.map((level) => (
                      <option key={level.id} value={level.slug}>
                        {level.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* الدولة */}
                <div>
                  <label htmlFor="country" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">الدولة</label>
                  <select
                    id="country"
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-700 dark:bg-gray-800"
                    disabled={loading}
                  >
                    <option value="">جميع الدول</option>
                    {countries.map((country) => (
                      <option key={country.id} value={country.slug}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* نوع التمويل */}
                <div>
                  <label htmlFor="funded" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">نوع التمويل</label>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="funded"
                      checked={isFunded}
                      onChange={(e) => setIsFunded(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary dark:border-gray-700"
                    />
                    <label htmlFor="funded" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      تمويل كامل فقط
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 text-center">
                <Button type="submit" size="lg" className="px-8 bg-primary hover:bg-primary/90">
                  <Search className="ml-2 h-4 w-4" />
                  بحث عن منح
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
