'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Globe, Map } from 'lucide-react';
import { useSiteSettings } from '@/hooks/use-site-settings';

type Country = {
  id: number;
  name: string;
  slug: string;
  flagUrl?: string;
};

export function CountriesSection() {
  const { siteSettings } = useSiteSettings();
  const [countries, setCountries] = useState<Country[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setIsLoading(true);
        // جلب الدول من API
        const response = await fetch('/api/countries');
        
        if (!response.ok) {
          throw new Error(`Error fetching countries: ${response.status}`);
        }
        
        const data = await response.json();
        setCountries(Array.isArray(data) ? data : (data.data || []));
      } catch (error) {
        console.error('Error fetching countries:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (siteSettings?.showCountriesSection) {
      fetchCountries();
    }
  }, [siteSettings]);

  // إذا كانت الإعدادات تشير إلى عدم عرض قسم الدول
  if (!siteSettings || !siteSettings.showCountriesSection) return null;

  // الحصول على الحرف الأول من اسم الدولة
  const getCountryInitial = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  // إنشاء لون عشوائي لكل دولة بناءً على الرقم التعريفي
  const getCountryColor = (id: number) => {
    const colors = [
      'bg-blue-100 text-blue-700',
      'bg-amber-100 text-amber-700',
      'bg-green-100 text-green-700',
      'bg-red-100 text-red-700',
      'bg-purple-100 text-purple-700',
      'bg-pink-100 text-pink-700',
      'bg-indigo-100 text-indigo-700',
      'bg-cyan-100 text-cyan-700',
    ];

    return colors[id % colors.length];
  };

  return (
    <section className="py-12 md:py-16 bg-muted/20">
      <div className="container px-4 md:px-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
            {siteSettings.countriesSectionTitle || 'تصفح حسب البلد'}
          </h2>
          <p className="mt-2 text-muted-foreground">
            {siteSettings.countriesSectionDescription || 'اكتشف المنح الدراسية في بلدان مختلفة'}
          </p>
        </div>

        {isLoading ? (
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 animate-pulse">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex flex-col items-center justify-center rounded-lg bg-muted p-6 h-[120px]">
                <div className="h-10 w-10 rounded-full bg-muted-foreground/20 mb-3"></div>
                <div className="h-4 w-24 bg-muted-foreground/20 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {countries.map((country) => (
              <Link
                key={country.id}
                href={`/scholarships?country=${country.slug}`}
                className="group flex flex-col items-center justify-center rounded-lg bg-muted/50 p-6 hover:bg-muted transition-colors"
              >
                {country.flagUrl ? (
                  <div className="mb-3 overflow-hidden rounded-sm h-10 w-16 flex items-center justify-center">
                    <img 
                      src={country.flagUrl} 
                      alt={`${country.name} flag`} 
                      className="w-full h-auto"
                      onError={(e) => {
                        // إذا فشل تحميل الصورة، عرض الحرف الأول كبديل
                        e.currentTarget.style.display = 'none';
                        const parent = e.currentTarget.parentElement;
                        if (parent) {
                          parent.innerHTML = `<div class="flex items-center justify-center w-full h-full ${getCountryColor(country.id)}">${getCountryInitial(country.name)}</div>`;
                        }
                      }}
                    />
                  </div>
                ) : (
                  <div className={`mb-3 rounded-sm h-10 w-16 flex items-center justify-center ${getCountryColor(country.id)}`}>
                    <span className="font-bold">{getCountryInitial(country.name)}</span>
                  </div>
                )}
                <span className="text-sm font-medium">{country.name}</span>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-8 flex justify-center">
          <Link href="/scholarships" passHref>
            <div className="inline-flex items-center justify-center rounded-md px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
              <Globe className="ml-2 h-4 w-4" />
              عرض جميع الدول
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
