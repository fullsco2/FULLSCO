'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, GraduationCap, Calendar, Globe, AlertCircle, Loader2 } from 'lucide-react';
import { useSiteSettings } from '@/hooks/use-site-settings';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

type Scholarship = {
  id: number;
  title: string;
  university: string;
  country: string;
  deadline: string;
  level: string;
  status: 'active' | 'closed' | 'coming_soon';
  featured: boolean;
};

export function FeaturedScholarships() {
  const { siteSettings } = useSiteSettings();
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchScholarships = async () => {
      try {
        setIsLoading(true);
        // جلب المنح المميزة من API
        const response = await fetch('/api/scholarships/featured');
        
        if (!response.ok) {
          throw new Error(`Error fetching featured scholarships: ${response.status}`);
        }
        
        const data = await response.json();
        setScholarships(Array.isArray(data) ? data : (data.data || []));
      } catch (error) {
        console.error('Error fetching featured scholarships:', error);
        setError('Failed to load featured scholarships');
      } finally {
        setIsLoading(false);
      }
    };

    if (siteSettings?.showFeaturedScholarships) {
      fetchScholarships();
    }
  }, [siteSettings]);

  if (!siteSettings || !siteSettings.showFeaturedScholarships) return null;

  // تنسيق التاريخ
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'PPP', { locale: ar });
    } catch (error) {
      return dateString;
    }
  };

  // عرض شارة الحالة
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-500 hover:bg-green-600">نشطة</Badge>;
      case 'closed':
        return <Badge variant="destructive">مغلقة</Badge>;
      case 'coming_soon':
        return <Badge variant="outline" className="border-amber-500 text-amber-500">قريباً</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <section className="py-12 md:py-16 bg-muted/30">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
              {siteSettings.featuredScholarshipsTitle || 'منح دراسية مميزة'}
            </h2>
            <p className="text-muted-foreground">
              {siteSettings.featuredScholarshipsDescription || 'أبرز المنح الدراسية المتاحة حالياً'}
            </p>
          </div>

          <Link href="/scholarships" passHref>
            <Button variant="outline" className="shrink-0">
              <ArrowLeft className="ml-2 h-4 w-4" />
              عرض جميع المنح
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center min-h-[300px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="mr-2">جاري تحميل المنح الدراسية...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center min-h-[300px] text-center">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <h3 className="text-xl font-semibold">حدث خطأ أثناء تحميل المنح الدراسية</h3>
            <p className="text-muted-foreground mt-2">{error}</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              إعادة المحاولة
            </Button>
          </div>
        ) : scholarships.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[300px] text-center">
            <GraduationCap className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold">لا توجد منح دراسية مميزة حالياً</h3>
            <p className="text-muted-foreground mt-2">الرجاء العودة لاحقاً للاطلاع على المنح المميزة</p>
            <Link href="/scholarships" passHref>
              <Button className="mt-4">
                <GraduationCap className="ml-2 h-4 w-4" />
                تصفح جميع المنح
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 pt-8 md:grid-cols-2 lg:grid-cols-3">
            {scholarships.map((scholarship) => (
              <Card key={scholarship.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{scholarship.title}</CardTitle>
                    {renderStatusBadge(scholarship.status)}
                  </div>
                  <CardDescription className="flex items-center pt-2">
                    <Globe className="h-4 w-4 ml-1" />
                    {scholarship.university}, {scholarship.country}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="grid grid-cols-2 gap-y-2">
                    <div className="flex items-center">
                      <GraduationCap className="h-4 w-4 ml-1 text-muted-foreground" />
                      <span className="text-sm">{scholarship.level}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 ml-1 text-muted-foreground" />
                      <span className="text-sm">{formatDate(scholarship.deadline)}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Link href={`/scholarships/${scholarship.id}`} passHref className="w-full">
                    <Button variant="outline" className="w-full">
                      عرض التفاصيل
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
