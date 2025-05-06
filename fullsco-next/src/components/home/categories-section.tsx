'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Briefcase, Code, GraduationCap, HeartPulse, Lightbulb, PenSquare, Ruler, Beaker } from 'lucide-react';
import { useSiteSettings } from '@/hooks/use-site-settings';

type Category = {
  id: number;
  name: string;
  slug: string;
  description?: string;
};

export function CategoriesSection() {
  const { siteSettings } = useSiteSettings();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        // جلب التصنيفات من API
        const response = await fetch('/api/categories');
        
        if (!response.ok) {
          throw new Error(`Error fetching categories: ${response.status}`);
        }
        
        const data = await response.json();
        setCategories(Array.isArray(data) ? data : (data.data || []));
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (siteSettings?.showCategoriesSection) {
      fetchCategories();
    }
  }, [siteSettings]);

  // إذا كانت الإعدادات تشير إلى عدم عرض قسم التصنيفات
  if (!siteSettings || !siteSettings.showCategoriesSection) return null;

  // تحديد الأيقونة المناسبة لكل فئة
  const getCategoryIcon = (slug: string) => {
    const iconClasses = "h-6 w-6 shrink-0";

    switch (slug.toLowerCase()) {
      case 'business':
      case 'business-administration':
      case 'economics':
        return <Briefcase className={iconClasses} />;
      case 'computer-science':
      case 'it':
      case 'programming':
        return <Code className={iconClasses} />;
      case 'medicine':
      case 'pharmacy':
        return <HeartPulse className={iconClasses} />;
      case 'engineering':
      case 'architecture':
        return <Ruler className={iconClasses} />;
      case 'science':
      case 'physics':
      case 'chemistry':
        return <Lightbulb className={iconClasses} />;
      case 'arts':
      case 'literature':
        return <PenSquare className={iconClasses} />;
      case 'education':
        return <BookOpen className={iconClasses} />;
      default:
        return <GraduationCap className={iconClasses} />;
    }
  };

  return (
    <section className="py-12 md:py-16">
      <div className="container px-4 md:px-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
            {siteSettings.categoriesSectionTitle || 'تصفح حسب التخصص'}
          </h2>
          <p className="mt-2 text-muted-foreground">
            {siteSettings.categoriesSectionDescription || 'اختر المنح المناسبة حسب مجال دراستك'}
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
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/scholarships?category=${category.slug}`}
                className="group flex flex-col items-center justify-center rounded-lg bg-muted/50 p-6 hover:bg-muted transition-colors"
              >
                <div className="mb-3 rounded-full bg-primary/10 p-3 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  {getCategoryIcon(category.slug)}
                </div>
                <span className="text-sm font-medium">{category.name}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
