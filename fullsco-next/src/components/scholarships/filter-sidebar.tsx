'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Search, Loader2 } from 'lucide-react';

type FilterParams = {
  country?: string;
  level?: string;
  category?: string;
  query?: string;
  funded?: boolean;
  page?: number;
};

type Country = {
  id: number;
  name: string;
  slug: string;
};

type Level = {
  id: number;
  name: string;
  slug: string;
};

type Category = {
  id: number;
  name: string;
  slug: string;
};

type FilterSidebarProps = {
  activeFilters: FilterParams;
};

export function FilterSidebar({ activeFilters }: FilterSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(activeFilters.query || '');
  const [countries, setCountries] = useState<Country[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isFullyFunded, setIsFullyFunded] = useState(activeFilters.funded || false);
  const [isLoadingCountries, setIsLoadingCountries] = useState(true);
  const [isLoadingLevels, setIsLoadingLevels] = useState(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  // Fetch filter data
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setIsLoadingCountries(true);
        const response = await fetch('/api/countries');
        if (!response.ok) throw new Error('Failed to fetch countries');
        const data = await response.json();
        setCountries(data);
      } catch (error) {
        console.error('Error fetching countries:', error);
      } finally {
        setIsLoadingCountries(false);
      }
    };

    const fetchLevels = async () => {
      try {
        setIsLoadingLevels(true);
        const response = await fetch('/api/levels');
        if (!response.ok) throw new Error('Failed to fetch levels');
        const data = await response.json();
        setLevels(data);
      } catch (error) {
        console.error('Error fetching levels:', error);
      } finally {
        setIsLoadingLevels(false);
      }
    };

    const fetchCategories = async () => {
      try {
        setIsLoadingCategories(true);
        const response = await fetch('/api/categories');
        if (!response.ok) throw new Error('Failed to fetch categories');
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCountries();
    fetchLevels();
    fetchCategories();
  }, []);

  // Set initial values from activeFilters
  useEffect(() => {
    setQuery(activeFilters.query || '');
    setIsFullyFunded(activeFilters.funded || false);
  }, [activeFilters]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters({ ...activeFilters, query, page: 1 });
  };

  const handleCountryFilter = (slug: string) => {
    applyFilters({ ...activeFilters, country: slug, page: 1 });
  };

  const handleLevelFilter = (slug: string) => {
    applyFilters({ ...activeFilters, level: slug, page: 1 });
  };

  const handleCategoryFilter = (slug: string) => {
    applyFilters({ ...activeFilters, category: slug, page: 1 });
  };

  const handleFullyFundedFilter = (checked: boolean) => {
    setIsFullyFunded(checked);
    applyFilters({ ...activeFilters, funded: checked, page: 1 });
  };

  const applyFilters = (filters: FilterParams) => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Reset page to 1 when applying new filters
    params.set('page', '1');
    
    // Apply or remove filters based on their values
    if (filters.query) params.set('query', filters.query);
    else params.delete('query');
    
    if (filters.country) params.set('country', filters.country);
    else params.delete('country');
    
    if (filters.level) params.set('level', filters.level);
    else params.delete('level');
    
    if (filters.category) params.set('category', filters.category);
    else params.delete('category');
    
    if (filters.funded) params.set('funded', 'true');
    else params.delete('funded');
    
    router.push(`/scholarships?${params.toString()}`);
  };

  const isActiveFilter = (type: string, slug: string) => {
    switch (type) {
      case 'country':
        return activeFilters.country === slug;
      case 'level':
        return activeFilters.level === slug;
      case 'category':
        return activeFilters.category === slug;
      default:
        return false;
    }
  };

  return (
    <div className="bg-card rounded-lg p-4 border">
      <h3 className="font-medium text-lg mb-4">تصفية المنح</h3>
      
      {/* Search */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="بحث"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 pr-4"
          />
        </div>
        <Button type="submit" className="w-full mt-2">بحث</Button>
      </form>

      {/* Fully Funded Checkbox */}
      <div className="mb-6">
        <div className="flex items-center space-x-2 space-x-reverse">
          <Checkbox 
            id="fully-funded" 
            checked={isFullyFunded}
            onCheckedChange={handleFullyFundedFilter}
          />
          <Label htmlFor="fully-funded" className="mr-2">تمويل كامل فقط</Label>
        </div>
      </div>
      
      <Accordion type="multiple" defaultValue={['countries', 'levels', 'categories']} className="space-y-2">
        {/* Countries */}
        <AccordionItem value="countries" className="border-b-0">
          <AccordionTrigger className="py-3 hover:no-underline">
            <span className="font-medium">البلدان</span>
          </AccordionTrigger>
          <AccordionContent>
            {isLoadingCountries ? (
              <div className="flex justify-center py-2">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                {countries.map((country) => (
                  <div key={country.id} className="flex items-center">
                    <Button
                      variant={isActiveFilter('country', country.slug) ? "secondary" : "ghost"}
                      className="w-full justify-start text-sm h-auto py-1.5 font-normal hover:bg-muted"
                      onClick={() => handleCountryFilter(country.slug)}
                    >
                      {country.name}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* Levels */}
        <AccordionItem value="levels" className="border-b-0">
          <AccordionTrigger className="py-3 hover:no-underline">
            <span className="font-medium">المستوى الدراسي</span>
          </AccordionTrigger>
          <AccordionContent>
            {isLoadingLevels ? (
              <div className="flex justify-center py-2">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-2">
                {levels.map((level) => (
                  <div key={level.id} className="flex items-center">
                    <Button
                      variant={isActiveFilter('level', level.slug) ? "secondary" : "ghost"}
                      className="w-full justify-start text-sm h-auto py-1.5 font-normal hover:bg-muted"
                      onClick={() => handleLevelFilter(level.slug)}
                    >
                      {level.name}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* Categories */}
        <AccordionItem value="categories" className="border-b-0">
          <AccordionTrigger className="py-3 hover:no-underline">
            <span className="font-medium">التخصصات</span>
          </AccordionTrigger>
          <AccordionContent>
            {isLoadingCategories ? (
              <div className="flex justify-center py-2">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center">
                    <Button
                      variant={isActiveFilter('category', category.slug) ? "secondary" : "ghost"}
                      className="w-full justify-start text-sm h-auto py-1.5 font-normal hover:bg-muted"
                      onClick={() => handleCategoryFilter(category.slug)}
                    >
                      {category.name}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
