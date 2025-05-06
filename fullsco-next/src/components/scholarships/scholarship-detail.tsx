'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  ArrowRight, 
  Calendar, 
  CalendarRange, 
  GraduationCap, 
  Loader2, 
  MapPin, 
  BookOpen, 
  AlertCircle,
  ExternalLink,
  Banknote,
  Share2
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { TypographyH1 } from '@/components/ui/typography';

interface ScholarshipDetailProps {
  slug: string;
}

interface Scholarship {
  id: number;
  title: string;
  slug: string;
  description: string;
  excerpt?: string;
  deadline: string;
  university?: string;
  country?: string;
  categoryId?: number;
  levelId?: number;
  countryId?: number;
  category?: { name: string; slug: string };
  level?: { name: string; slug: string };
  countryObj?: { name: string; slug: string };
  fundingType?: string;
  fundingAmount?: string;
  fundingCurrency?: string;
  scholarshipUrl?: string;
  isFundingComplete?: boolean;
  isFeatured?: boolean;
  createdAt: string;
  updatedAt: string;
}

export function ScholarshipDetail({ slug }: ScholarshipDetailProps) {
  const router = useRouter();
  const [scholarship, setScholarship] = useState<Scholarship | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedScholarships, setRelatedScholarships] = useState<Scholarship[]>([]);

  // جلب بيانات المنحة الدراسية
  useEffect(() => {
    const fetchScholarship = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`/api/scholarships/${slug}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('\u0644\u0645 \u064a\u062a\u0645 \u0627\u0644\u0639\u062b\u0648\u0631 \u0639\u0644\u0649 \u0627\u0644\u0645\u0646\u062d\u0629 \u0627\u0644\u062f\u0631\u0627\u0633\u064a\u0629');
          }
          throw new Error(`\u062e\u0637\u0623 \u0641\u064a \u062c\u0644\u0628 \u0627\u0644\u0645\u0646\u062d\u0629 \u0627\u0644\u062f\u0631\u0627\u0633\u064a\u0629: ${response.status}`);
        }

        const data = await response.json();
        setScholarship(data);

        // بعد جلب المنحة، نجلب منح ذات صلة
        if (data.levelId || data.countryId || data.categoryId) {
          fetchRelatedScholarships(data);
        }
      } catch (error) {
        console.error('Error fetching scholarship:', error);
        setError(error instanceof Error ? error.message : '\u062d\u062f\u062b \u062e\u0637\u0623 \u063a\u064a\u0631 \u0645\u0639\u0631\u0648\u0641');
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) {
      fetchScholarship();
    }
  }, [slug]);

  // جلب منح دراسية ذات صلة
  const fetchRelatedScholarships = async (scholarship: Scholarship) => {
    try {
      const params = new URLSearchParams();
      params.append('limit', '3'); // نجلب 3 منح فقط
      
      // نضيف مرشحات بناءً على المنحة الحالية
      if (scholarship.levelId && scholarship.level) {
        params.append('level', scholarship.level.slug);
      }
      
      if (scholarship.countryId && scholarship.countryObj) {
        params.append('country', scholarship.countryObj.slug);
      }
      
      if (scholarship.categoryId && scholarship.category) {
        params.append('category', scholarship.category.slug);
      }
      
      const response = await fetch(`/api/scholarships?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch related scholarships');
      
      const data = await response.json();
      // نزيل المنحة الحالية من النتائج
      const filteredScholarships = data.data.filter((s: Scholarship) => s.id !== scholarship.id);
      setRelatedScholarships(filteredScholarships.slice(0, 3));
    } catch (error) {
      console.error('Error fetching related scholarships:', error);
    }
  };

  // يتعامل مع مشاركة المنحة
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: scholarship ? scholarship.title : '\u0645\u0646\u062d\u0629 \u062f\u0631\u0627\u0633\u064a\u0629',
          text: scholarship?.excerpt || '\u0645\u0646\u062d\u0629 \u062f\u0631\u0627\u0633\u064a\u0629 \u0645\u062a\u0627\u062d\u0629',
          url: window.location.href,
        });
      } else {
        // ن\u0633\u062e \u0627\u0644\u0631\u0627\u0628\u0637 \u0625\u0644\u0649 \u0627\u0644\u062d\u0627\u0641\u0638\u0629
        await navigator.clipboard.writeText(window.location.href);
        alert('\u062a\u0645 \u0646\u0633\u062e \u0627\u0644\u0631\u0627\u0628\u0637 \u0625\u0644\u0649 \u0627\u0644\u062d\u0627\u0641\u0638\u0629');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  // ي\u0639\u0648\u062f \u0644\u0644\u0635\u0641\u062d\u0629 \u0627\u0644\u0633\u0627\u0628\u0642\u0629
  const handleBack = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <div className="container py-12 flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg">\u062c\u0627\u0631\u064a \u062a\u062d\u0645\u064a\u0644 \u0627\u0644\u0645\u0646\u062d\u0629 \u0627\u0644\u062f\u0631\u0627\u0633\u064a\u0629...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-12 flex flex-col items-center justify-center min-h-[50vh] text-center">
        <AlertCircle className="h-16 w-16 text-destructive mb-4" />
        <h2 className="text-2xl font-bold mb-2">\u062d\u062f\u062b \u062e\u0637\u0623</h2>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Button onClick={handleBack} variant="outline">
          <ArrowRight className="ml-2 h-4 w-4" />
          \u0627\u0644\u0639\u0648\u062f\u0629 \u0644\u0644\u0645\u0646\u062d \u0627\u0644\u062f\u0631\u0627\u0633\u064a\u0629
        </Button>
      </div>
    );
  }

  if (!scholarship) {
    return (
      <div className="container py-12 flex flex-col items-center justify-center min-h-[50vh] text-center">
        <AlertCircle className="h-16 w-16 text-destructive mb-4" />
        <h2 className="text-2xl font-bold mb-2">\u0644\u0645 \u064a\u062a\u0645 \u0627\u0644\u0639\u062b\u0648\u0631 \u0639\u0644\u0649 \u0627\u0644\u0645\u0646\u062d\u0629 \u0627\u0644\u062f\u0631\u0627\u0633\u064a\u0629</h2>
        <p className="text-muted-foreground mb-6">\u0644\u0645 \u064a\u062a\u0645 \u0627\u0644\u0639\u062b\u0648\u0631 \u0639\u0644\u0649 \u0627\u0644\u0645\u0646\u062d\u0629 \u0627\u0644\u062f\u0631\u0627\u0633\u064a\u0629 \u0627\u0644\u0645\u0637\u0644\u0648\u0628\u0629</p>
        <Button onClick={handleBack} variant="outline">
          <ArrowRight className="ml-2 h-4 w-4" />
          \u0627\u0644\u0639\u0648\u062f\u0629 \u0644\u0644\u0645\u0646\u062d \u0627\u0644\u062f\u0631\u0627\u0633\u064a\u0629
        </Button>
      </div>
    );
  }

  const {
    title,
    description,
    deadline,
    university,
    country,
    level,
    category,
    scholarshipUrl,
    fundingType,
    fundingAmount,
    fundingCurrency,
    isFundingComplete
  } = scholarship;

  const deadlineDate = deadline ? new Date(deadline) : null;
  const isDeadlinePassed = deadlineDate ? new Date() > deadlineDate : false;

  return (
    <div className="bg-background min-h-screen py-8 md:py-12">
      <div className="container px-4 md:px-6">
        {/* شريط الملاحة الثانوي */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={handleBack}
            className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowRight className="ml-1 h-4 w-4" />
            \u0627\u0644\u0639\u0648\u062f\u0629
          </button>
          
          <button
            onClick={handleShare}
            className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Share2 className="ml-1 h-4 w-4" />
            \u0645\u0634\u0627\u0631\u0643\u0629
          </button>
        </div>

        {/* المحتوى الرئيسي */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* صفحة المنحة الدراسية */}
          <div className="lg:col-span-3">
            <Card className="mb-8">
              <CardContent className="p-6 md:p-8">
                {/* عنوان المنحة وأهم المعلومات */}
                <div className="mb-6">
                  <TypographyH1 className="mb-6 text-3xl md:text-4xl">
                    {title}
                  </TypographyH1>
                  
                  <div className="flex flex-wrap gap-2 mb-6">
                    {level && (
                      <Badge variant="outline" className="flex items-center">
                        <GraduationCap className="mr-1 h-3 w-3" />
                        <span>{level.name}</span>
                      </Badge>
                    )}
                    
                    {category && (
                      <Badge variant="outline" className="flex items-center">
                        <BookOpen className="mr-1 h-3 w-3" />
                        <span>{category.name}</span>
                      </Badge>
                    )}

                    {isFundingComplete && (
                      <Badge variant="secondary" className="flex items-center">
                        <Banknote className="mr-1 h-3 w-3" />
                        <span>\u062a\u0645\u0648\u064a\u0644 \u0643\u0627\u0645\u0644</span>
                      </Badge>
                    )}
                    
                    {isDeadlinePassed && (
                      <Badge variant="destructive" className="flex items-center">
                        <Calendar className="mr-1 h-3 w-3" />
                        <span>\u0627\u0646\u062a\u0647\u0649 \u0627\u0644\u062a\u0642\u062f\u064a\u0645</span>
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {university && (
                      <div className="flex items-center">
                        <GraduationCap className="ml-2 h-5 w-5 text-muted-foreground" />
                        <div>
                          <div className="text-sm text-muted-foreground">\u0627\u0644\u062c\u0627\u0645\u0639\u0629</div>
                          <div className="font-medium">{university}</div>
                        </div>
                      </div>
                    )}
                    
                    {country && (
                      <div className="flex items-center">
                        <MapPin className="ml-2 h-5 w-5 text-muted-foreground" />
                        <div>
                          <div className="text-sm text-muted-foreground">\u0627\u0644\u062f\u0648\u0644\u0629</div>
                          <div className="font-medium">{country}</div>
                        </div>
                      </div>
                    )}
                    
                    {deadline && (
                      <div className="flex items-center">
                        <CalendarRange className="ml-2 h-5 w-5 text-muted-foreground" />
                        <div>
                          <div className="text-sm text-muted-foreground">\u0622\u062e\u0631 \u0645\u0648\u0639\u062f \u0644\u0644\u062a\u0642\u062f\u064a\u0645</div>
                          <div className="font-medium">{formatDate(deadline)}</div>
                        </div>
                      </div>
                    )}
                    
                    {(fundingType || fundingAmount) && (
                      <div className="flex items-center">
                        <Banknote className="ml-2 h-5 w-5 text-muted-foreground" />
                        <div>
                          <div className="text-sm text-muted-foreground">\u0627\u0644\u062a\u0645\u0648\u064a\u0644</div>
                          <div className="font-medium">
                            {fundingType || ''}
                            {fundingAmount && ` (${fundingAmount} ${fundingCurrency || ''})`}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {scholarshipUrl && (
                    <div className="mt-8">
                      <a 
                        href={scholarshipUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-block"
                      >
                        <Button className="w-full md:w-auto">
                          <ExternalLink className="mr-2 h-4 w-4" />
                          \u0627\u0644\u062a\u0642\u062f\u064a\u0645 \u0644\u0644\u0645\u0646\u062d\u0629
                        </Button>
                      </a>
                    </div>
                  )}
                </div>

                {/* وصف المنحة */}
                <div className="prose prose-stone dark:prose-invert max-w-none">
                  <h2>\u062a\u0641\u0627\u0635\u064a\u0644 \u0627\u0644\u0645\u0646\u062d\u0629 \u0627\u0644\u062f\u0631\u0627\u0633\u064a\u0629</h2>
                  <div dangerouslySetInnerHTML={{ __html: description }} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* الشريط الجانبي */}
          <div className="space-y-8">
            {relatedScholarships.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">\u0645\u0646\u062d \u062f\u0631\u0627\u0633\u064a\u0629 \u0645\u0634\u0627\u0628\u0647\u0629</h3>
                  
                  <div className="space-y-4">
                    {relatedScholarships.map((relatedScholarship) => (
                      <Link
                        key={relatedScholarship.id}
                        href={`/scholarships/${relatedScholarship.slug}`}
                        className="block p-3 rounded-lg border hover:bg-muted transition-colors"
                      >
                        <h4 className="font-medium line-clamp-2 mb-1">
                          {relatedScholarship.title}
                        </h4>
                        
                        <div className="flex flex-wrap gap-2 mt-2">
                          {relatedScholarship.level && (
                            <Badge variant="outline" className="text-xs">
                              {relatedScholarship.level.name}
                            </Badge>
                          )}
                          
                          {relatedScholarship.deadline && (
                            <div className="text-xs text-muted-foreground flex items-center">
                              <Calendar className="mr-1 h-3 w-3" />
                              {formatDate(relatedScholarship.deadline)}
                            </div>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t">
                    <Link href="/scholarships">
                      <Button variant="outline" className="w-full text-sm" size="sm">
                        \u0639\u0631\u0636 \u0643\u0644 \u0627\u0644\u0645\u0646\u062d \u0627\u0644\u062f\u0631\u0627\u0633\u064a\u0629
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
