'use client';

import { useState, useEffect } from 'react';
import { getStatistics } from '@/lib/api';
import { TrendingUp, GraduationCap, Globe, Award, Users } from 'lucide-react';

interface StatisticsSectionProps {
  title?: string;
  description?: string;
}

interface StatisticItem {
  id: number;
  title: string;
  value: string;
  icon?: string;
  color?: string;
}

// رموز الإحصائيات
const statisticIcons: Record<string, any> = {
  scholarships: <Award className="h-8 w-8" />,
  students: <Users className="h-8 w-8" />,
  countries: <Globe className="h-8 w-8" />,
  universities: <GraduationCap className="h-8 w-8" />,
  // رمز افتراضي
  default: <TrendingUp className="h-8 w-8" />,
};

// ألوان الإحصائيات
const statisticColors: Record<string, string> = {
  scholarships: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  students: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
  countries: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
  universities: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
  // لون افتراضي
  default: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300',
};

export default function StatisticsSection({
  title = 'إحصائيات',
  description = 'أرقام عن المنح الدراسية والطلاب حول العالم',
}: StatisticsSectionProps) {
  const [statistics, setStatistics] = useState<StatisticItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStatistics() {
      try {
        // طلب مباشر للتأكد من التعامل مع الخادم الحالي
        const response = await fetch('/api/statistics');
        if (!response.ok) {
          throw new Error(`فشل الطلب: ${response.status}`);
        }
        
        const data = await response.json();
        
        // التعامل مع هيكل البيانات من API الحالي
        if (data.success && data.data) {
          setStatistics(data.data);
        } else if (Array.isArray(data)) {
          setStatistics(data);
        } else {
          setStatistics([]);
        }
      } catch (error) {
        console.error('Error loading statistics:', error);
      } finally {
        setLoading(false);
      }
    }

    loadStatistics();
  }, []);

  // الحصول على رمز للإحصائية
  const getStatisticIcon = (statistic: StatisticItem) => {
    // محاولة العثور على رمز بناءً على العنوان أو العنوان بالإنجليزية إذا كان موجوداً في البيانات
    const iconKey = statistic.icon?.toLowerCase() || statistic.title.toLowerCase();
    for (const key in statisticIcons) {
      if (iconKey.includes(key)) {
        return statisticIcons[key];
      }
    }
    return statisticIcons.default;
  };

  // الحصول على لون للإحصائية
  const getStatisticColor = (statistic: StatisticItem) => {
    // إذا كان هناك لون محدد من الخادم
    if (statistic.color) {
      return `bg-${statistic.color}-100 text-${statistic.color}-600 dark:bg-${statistic.color}-900/30 dark:text-${statistic.color}-400`;
    }
  
    // محاولة العثور على لون بناءً على العنوان أو العنوان بالإنجليزية
    const colorKey = statistic.icon?.toLowerCase() || statistic.title.toLowerCase();
    for (const key in statisticColors) {
      if (colorKey.includes(key)) {
        return statisticColors[key];
      }
    }
    return statisticColors.default;
  };

  return (
    <section className="bg-gray-50 py-14 dark:bg-gray-900/50 md:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h2 className="mb-3 text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">{title}</h2>
          <p className="mx-auto max-w-2xl text-gray-600 dark:text-gray-300">{description}</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="animate-pulse rounded-lg border border-gray-200 bg-white p-6 text-center dark:border-gray-800 dark:bg-gray-900">
                <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gray-200 dark:bg-gray-800"></div>
                <div className="mx-auto mb-2 h-5 w-20 bg-gray-200 dark:bg-gray-800 rounded-md"></div>
                <div className="mx-auto h-8 w-28 bg-gray-200 dark:bg-gray-800 rounded-md"></div>
              </div>
            ))}
          </div>
        ) : statistics.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-gray-500 dark:text-gray-400">لا توجد إحصائيات متاحة حالياً.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {statistics.map((statistic) => (
              <div 
                key={statistic.id} 
                className="rounded-lg border border-gray-200 bg-white p-6 text-center dark:border-gray-800 dark:bg-gray-900"
              >
                <div className={`mb-4 mx-auto flex h-16 w-16 items-center justify-center rounded-full ${getStatisticColor(statistic)}`}>
                  {getStatisticIcon(statistic)}
                </div>
                <p className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">{statistic.title}</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{statistic.value}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
