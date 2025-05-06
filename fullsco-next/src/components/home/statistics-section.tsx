'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { GraduationCap, BookOpen, Globe, Users } from 'lucide-react';
import { useSiteSettings } from '@/hooks/use-site-settings';
import { Counter } from '@/components/ui/counter';

type Statistic = {
  id: number;
  title: string;
  value: number;
  icon?: string;
};

export function StatisticsSection() {
  const { siteSettings } = useSiteSettings();
  const [statistics, setStatistics] = useState<Statistic[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/statistics');
        
        if (!response.ok) {
          throw new Error(`Error fetching statistics: ${response.status}`);
        }
        
        const data = await response.json();
        setStatistics(data?.data || []);
      } catch (error) {
        console.error('Error fetching statistics:', error);
        // في حالة فشل الجلب، نستخدم بيانات افتراضية
        setStatistics([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (siteSettings?.showStatisticsSection) {
      fetchStatistics();
    }
  }, [siteSettings]);

  if (!siteSettings || !siteSettings.showStatisticsSection) return null;

  // تحديد الأيقونة المناسبة حسب النوع
  const getIcon = (icon?: string, index?: number) => {
    const iconClass = "h-8 w-8 text-primary";
    if (icon) {
      // إذا كان هناك اسم أيقونة محدد
      switch (icon.toLowerCase()) {
        case 'graduation':
        case 'cap':
          return <GraduationCap className={iconClass} />;
        case 'book':
        case 'books':
          return <BookOpen className={iconClass} />;
        case 'globe':
        case 'world':
          return <Globe className={iconClass} />;
        case 'users':
        case 'people':
          return <Users className={iconClass} />;
        default:
          return <GraduationCap className={iconClass} />;
      }
    }
    
    // اختيار الأيقونة الافتراضية بناءً على الترتيب
    const icons = [<GraduationCap key="grad" className={iconClass} />, <BookOpen key="book" className={iconClass} />, <Globe key="globe" className={iconClass} />, <Users key="users" className={iconClass} />];
    return icons[index! % icons.length];
  };

  return (
    <section className="py-12 md:py-16 bg-gradient-to-br from-primary/5 to-primary/10">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
            {siteSettings.statisticsSectionTitle || 'إحصائيات'}
          </h2>
          <p className="mt-2 text-muted-foreground">
            {siteSettings.statisticsSectionDescription || 'أرقام عن المنح الدراسية والطلاب حول العالم'}
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-pulse">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="overflow-hidden border-0 shadow-sm bg-muted/30">
                <CardContent className="p-6 flex flex-col items-center justify-center min-h-[160px]">
                  <div className="rounded-full bg-muted h-12 w-12 mb-4"></div>
                  <div className="h-6 bg-muted rounded w-24 mb-2"></div>
                  <div className="h-4 bg-muted rounded w-16"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : statistics.length === 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {/* إحصائيات افتراضية للعرض فقط */}
            <StatisticCard 
              title="منح دراسية" 
              value={1500} 
              icon={<GraduationCap className="h-8 w-8 text-primary" />} 
            />
            <StatisticCard 
              title="طلاب" 
              value={5000} 
              icon={<Users className="h-8 w-8 text-primary" />} 
            />
            <StatisticCard 
              title="جامعات" 
              value={250} 
              icon={<BookOpen className="h-8 w-8 text-primary" />} 
            />
            <StatisticCard 
              title="دول" 
              value={80} 
              icon={<Globe className="h-8 w-8 text-primary" />} 
            />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {statistics.map((stat, index) => (
              <StatisticCard 
                key={stat.id}
                title={stat.title} 
                value={stat.value} 
                icon={getIcon(stat.icon, index)} 
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function StatisticCard({ title, value, icon }: { title: string; value: number; icon: React.ReactNode }) {
  return (
    <Card className="overflow-hidden border-0 shadow-sm bg-muted/30 hover:shadow-md transition-shadow duration-300">
      <CardContent className="p-6 flex flex-col items-center justify-center text-center">
        <div className="rounded-full bg-primary/10 p-3 mb-4">
          {icon}
        </div>
        <h3 className="text-3xl font-bold">
          <Counter value={value} duration={2000} />
        </h3>
        <p className="text-muted-foreground">{title}</p>
      </CardContent>
    </Card>
  );
}
