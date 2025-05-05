'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getCountries } from '@/lib/api';

interface CountriesSectionProps {
  title?: string;
  description?: string;
}

// رموز الدول المعروفة
const countryFlagEmojis: Record<string, string> = {
  'us': '🇺🇸',
  'uk': '🇬🇧',
  'ca': '🇨🇦',
  'au': '🇦🇺',
  'de': '🇩🇪',
  'fr': '🇫🇷',
  'jp': '🇯🇵',
  'cn': '🇨🇳',
  'kr': '🇰🇷',
  'sg': '🇸🇬',
  'ae': '🇦🇪',
  'sa': '🇸🇦',
  'qa': '🇶🇦',
  'kw': '🇰🇼',
  'eg': '🇪🇬',
  'tr': '🇹🇷',
  'my': '🇲🇾',
  'nl': '🇳🇱',
  'se': '🇸🇪',
  'no': '🇳🇴',
  'fi': '🇫🇮',
  'dk': '🇩🇰',
  'it': '🇮🇹',
  'es': '🇪🇸',
  'pt': '🇵🇹',
  'br': '🇧🇷',
  'ru': '🇷🇺',
  'in': '🇮🇳',
  'id': '🇮🇩',
  'th': '🇹🇭',
  'vn': '🇻🇳',
  'nz': '🇳🇿',
  'za': '🇿🇦',
};

export default function CountriesSection({
  title = 'تصفح حسب البلد',
  description = 'اكتشف المنح الدراسية في بلدان مختلفة',
}: CountriesSectionProps) {
  const [countries, setCountries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCountries() {
      try {
        const data = await getCountries();
        // ترتيب الدول بناءً على الاسم
        const sortedCountries = data.sort((a: any, b: any) => a.name.localeCompare(b.name));
        setCountries(sortedCountries);
      } catch (error) {
        console.error('Error loading countries:', error);
      } finally {
        setLoading(false);
      }
    }

    loadCountries();
  }, []);

  // الحصول على علم الدولة
  const getCountryFlagEmoji = (country: any) => {
    // التحقق أولاً من وجود flag في البيانات
    if (country.flag) {
      return country.flag;
    }
    
    // محاولة الحصول على رمز الدولة من القائمة المعروفة
    const slug = country.slug?.toLowerCase();
    return countryFlagEmojis[slug] || '🌍';
  };

  return (
    <section className="bg-gray-50 py-14 dark:bg-gray-900/50 md:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h2 className="mb-3 text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">{title}</h2>
          <p className="mx-auto max-w-2xl text-gray-600 dark:text-gray-300">{description}</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {Array.from({ length: 18 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="flex flex-col items-center rounded-lg border border-gray-200 bg-white p-4 text-center transition-all hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
                  <div className="mb-3 h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-800"></div>
                  <div className="h-5 w-20 bg-gray-200 dark:bg-gray-800 rounded-md"></div>
                </div>
              </div>
            ))}
          </div>
        ) : countries.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-gray-500 dark:text-gray-400">لا توجد دول متاحة حالياً.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {countries.map((country) => (
              <Link 
                key={country.id} 
                href={`/scholarships?country=${country.slug}`}
                className="flex flex-col items-center rounded-lg border border-gray-200 bg-white p-4 text-center transition-all hover:border-primary hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
              >
                <div className="mb-3 text-3xl">{getCountryFlagEmoji(country)}</div>
                <h3 className="text-sm font-medium">{country.name}</h3>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-10 text-center">
          <Link href="/scholarships">
            <Button variant="outline" size="lg" className="gap-2">
              عرض جميع المنح
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
