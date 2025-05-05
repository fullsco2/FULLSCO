'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Code, Flask, Briefcase, Stethoscope, Building, Users, Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getCategories } from '@/lib/api';

interface CategoriesSectionProps {
  title?: string;
  description?: string;
}

// رموز للتخصصات
const categoryIcons: Record<string, any> = {
  'business': <Briefcase className="h-6 w-6" />,
  'computer-science': <Code className="h-6 w-6" />,
  'engineering': <Building className="h-6 w-6" />,
  'medicine': <Stethoscope className="h-6 w-6" />,
  'science': <Flask className="h-6 w-6" />,
  'humanities': <Users className="h-6 w-6" />,
  'education': <BookOpen className="h-6 w-6" />,
  // الرمز الافتراضي للتخصصات غير المعروفة
  'default': <Compass className="h-6 w-6" />
};

export default function CategoriesSection({
  title = 'تصفح حسب التخصص',
  description = 'اختر المنح المناسبة حسب مجال دراستك',
}: CategoriesSectionProps) {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (error) {
        console.error('Error loading categories:', error);
      } finally {
        setLoading(false);
      }
    }

    loadCategories();
  }, []);

  // الحصول على رمز للتخصص
  const getCategoryIcon = (category: any) => {
    const slug = category.slug?.toLowerCase();
    // تحقق من وجود رمز مخصص للتخصص بناءً على الاسم المستعار
    return categoryIcons[slug] || categoryIcons.default;
  };

  return (
    <section className="py-14 md:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h2 className="mb-3 text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">{title}</h2>
          <p className="mx-auto max-w-2xl text-gray-600 dark:text-gray-300">{description}</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {Array.from({ length: 10 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="flex flex-col items-center rounded-lg border border-gray-200 bg-white p-4 text-center transition-all hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
                  <div className="mb-3 h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-800"></div>
                  <div className="h-5 w-24 bg-gray-200 dark:bg-gray-800 rounded-md"></div>
                </div>
              </div>
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-gray-500 dark:text-gray-400">لا توجد تخصصات متاحة حالياً.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {categories.map((category) => (
              <Link 
                key={category.id} 
                href={`/scholarships?category=${category.slug}`}
                className="flex flex-col items-center rounded-lg border border-gray-200 bg-white p-4 text-center transition-all hover:border-primary hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
              >
                <div className="mb-3 rounded-full bg-primary/10 p-3 text-primary">
                  {getCategoryIcon(category)}
                </div>
                <h3 className="font-medium">{category.name}</h3>
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
