import React from "react";
import { useStatistics } from "@/hooks/use-statistics";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { Skeleton } from "@/components/ui/skeleton";
import { Book, Award, Users, Globe } from "lucide-react";
import { StatisticData } from "@/hooks/use-statistics";

export function Statistics() {
  const { statistics, isLoading } = useStatistics();
  const { siteSettings } = useSiteSettings();

  if (!siteSettings?.showStatisticsSection) {
    return null;
  }

  // تحديد الأيقونة المناسبة لكل إحصائية
  const getIcon = (statistic: any) => {
    const iconName = statistic.icon?.toLowerCase() || '';
    
    switch (iconName) {
      case 'book':
        return <Book className="h-10 w-10 text-primary" />;
      case 'award':
        return <Award className="h-10 w-10 text-primary" />;
      case 'users':
        return <Users className="h-10 w-10 text-primary" />;
      case 'globe':
        return <Globe className="h-10 w-10 text-primary" />;
      default:
        return <Award className="h-10 w-10 text-primary" />;
    }
  };

  return (
    <section className="py-12 bg-white dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-2">
            {siteSettings?.statisticsSectionTitle || "إحصائيات"}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {siteSettings?.statisticsSectionDescription || "أرقام عن المنح الدراسية والطلاب حول العالم"}
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array(4).fill(0).map((_, index) => (
              <div key={index} className="flex flex-col items-center p-4">
                <Skeleton className="h-10 w-10 rounded-full mb-3" />
                <Skeleton className="h-8 w-28 mb-2 rounded-md" />
                <Skeleton className="h-4 w-40 rounded-md" />
              </div>
            ))}
          </div>
        ) : statistics.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400">
            لا توجد إحصائيات لعرضها حاليًا
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {statistics.filter(stat => stat.isActive).map((statistic) => (
              <div 
                key={statistic.id}
                className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col items-center"
              >
                <div className="mb-3">
                  {getIcon(statistic)}
                </div>
                <h3 className="text-3xl font-bold mb-2 text-primary">{statistic.value}</h3>
                <p className="text-gray-700 dark:text-gray-300 text-center font-medium">
                  {statistic.title}
                </p>
                {statistic.description && (
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 text-center">
                    {statistic.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default Statistics;