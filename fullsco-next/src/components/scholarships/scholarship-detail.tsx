'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TypographyH1, TypographyH2, TypographyP } from '@/components/ui/typography';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Calendar, GraduationCap, Building, MapPin, Globe, User, CheckCircle2, School, AlertCircle, Share2, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';

type ScholarshipDetailProps = {
  slug: string;
};

type Scholarship = {
  id: number;
  title: string;
  description: string;
  excerpt?: string;
  slug: string;
  deadline: string;
  createdAt: string;
  updatedAt: string;
  thumbnailUrl?: string;
  applyUrl?: string;
  requirements?: string;
  benefits?: string;
  categoryName?: string;
  categoryId?: number;
  countryName?: string;
  countryId?: number;
  university?: string;
  degree?: string;
  isFullyFunded?: boolean;
  isFeatured?: boolean;
};

export function ScholarshipDetail({ slug }: ScholarshipDetailProps) {
  const router = useRouter();
  const pathname = usePathname();
  
  const [scholarship, setScholarship] = useState<Scholarship | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchScholarship = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`/api/scholarships/${slug}`);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('\u0627\u0644\u0645\u0646\u062d\u0629 \u0627\u0644\u062f\u0631\u0627\u0633\u064a\u0629 \u063a\u064a\u0631 \u0645\u0648\u062c\u0648\u062f\u0629');
          }
          throw new Error(`\u062e\u0637\u0623 \u0641\u064a \u062c\u0644\u0628 \u0627\u0644\u0645\u0646\u062d\u0629 \u0627\u0644\u062f\u0631\u0627\u0633\u064a\u0629: ${response.status}`);
        }

        const data = await response.json();
        setScholarship(data);
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

  // يتعامل مع مشاركة المنحة الدراسية
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: scholarship?.title || '\u0645\u0646\u062d\u0629 \u062f\u0631\u0627\u0633\u064a\u0629',
          text: scholarship?.excerpt || '\u0627\u0643\u062a\u0634\u0641 \u0647\u0630\u0647 \u0627\u0644\u0645\u0646\u062d\u0629 \u0627\u0644\u062f\u0631\u0627\u0633\u064a\u0629',
          url: window.location.href,
        });
      } else {
        // نسخ الرابط إلى الحافظة إذا كانت واجهة المشاركة غير متوفرة
        await navigator.clipboard.writeText(window.location.href);
        alert('\u062a\u0645 \u0646\u0633\u062e \u0627\u0644\u0631\u0627\u0628\u0637 \u0625\u0644\u0649 \u0627\u0644\u062d\u0627\u0641\u0638\u0629');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  // يعود للصفحة السابقة
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
        <h2 className="text-2xl font-bold mb-2">\u0644\u0645 \u064a\u062a\u0645 \u0627\u0644\u0639\u062b\u0648\u0631 \u0639\u0644\u0649 \u0627\u0644\u0645\u0646\u062d\u0629</h2>
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
    excerpt,
    deadline,
    thumbnailUrl,
    applyUrl,
    requirements,
    benefits,
    categoryName,
    countryName,
    university,
    degree,
    isFullyFunded,
    createdAt,
    updatedAt,
  } = scholarship;

  const formattedDeadline = formatDate(deadline);
  const formattedCreatedAt = formatDate(createdAt);
  const formattedUpdatedAt = formatDate(updatedAt);
  
  // تحديد الصورة المناسبة للمنحة
  const imageUrl = thumbnailUrl || '/images/placeholder-scholarship.jpg';

  return (
    <div className="container px-4 md:px-6 py-8 md:py-12">
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

      {/* القسم الرئيسي */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* المحتوى الرئيسي */}
        <div className="lg:col-span-2 space-y-8">
          {/* العنوان والمعلومات الأساسية */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              {isFullyFunded && (
                <Badge variant="secondary" className="bg-green-600 hover:bg-green-700 text-white">
                  \u062a\u0645\u0648\u064a\u0644 \u0643\u0627\u0645\u0644
                </Badge>
              )}
              
              {categoryName && (
                <Badge variant="outline">{categoryName}</Badge>
              )}
            </div>
            
            <TypographyH1 className="mb-4">{title}</TypographyH1>
            
            {excerpt && (
              <TypographyP className="text-lg text-muted-foreground mb-6">
                {excerpt}
              </TypographyP>
            )}
          </div>

          {/* صورة المنحة */}
          <div className="rounded-lg overflow-hidden border relative aspect-video">
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>

          {/* تبويبات المحتوى */}
          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">\u0646\u0638\u0631\u0629 \u0639\u0627\u0645\u0629</TabsTrigger>
              <TabsTrigger value="requirements">\u0645\u062a\u0637\u0644\u0628\u0627\u062a</TabsTrigger>
              <TabsTrigger value="benefits">\u0627\u0644\u0645\u0632\u0627\u064a\u0627</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6 py-4">
              <div className="prose prose-lg prose-stone dark:prose-invert max-w-none">
                <div dangerouslySetInnerHTML={{ __html: description }} />
              </div>
            </TabsContent>
            
            <TabsContent value="requirements" className="space-y-6 py-4">
              {requirements ? (
                <div className="prose prose-lg prose-stone dark:prose-invert max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: requirements }} />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium mb-2">\u0644\u0627 \u062a\u0648\u062c\u062f \u0645\u0639\u0644\u0648\u0645\u0627\u062a \u0639\u0646 \u0627\u0644\u0645\u062a\u0637\u0644\u0628\u0627\u062a</p>
                  <p className="text-muted-foreground">
                    \u064a\u0631\u062c\u0649 \u0632\u064a\u0627\u0631\u0629 \u0635\u0641\u062d\u0629 \u0627\u0644\u0645\u0646\u062d\u0629 \u0627\u0644\u0631\u0633\u0645\u064a\u0629 \u0644\u0644\u062d\u0635\u0648\u0644 \u0639\u0644\u0649 \u0645\u0639\u0644\u0648\u0645\u0627\u062a \u0645\u0641\u0635\u0644\u0629 \u0639\u0646 \u0627\u0644\u0645\u062a\u0637\u0644\u0628\u0627\u062a.
                  </p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="benefits" className="space-y-6 py-4">
              {benefits ? (
                <div className="prose prose-lg prose-stone dark:prose-invert max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: benefits }} />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium mb-2">\u0644\u0627 \u062a\u0648\u062c\u062f \u0645\u0639\u0644\u0648\u0645\u0627\u062a \u0639\u0646 \u0627\u0644\u0645\u0632\u0627\u064a\u0627</p>
                  <p className="text-muted-foreground">
                    \u064a\u0631\u062c\u0649 \u0632\u064a\u0627\u0631\u0629 \u0635\u0641\u062d\u0629 \u0627\u0644\u0645\u0646\u062d\u0629 \u0627\u0644\u0631\u0633\u0645\u064a\u0629 \u0644\u0644\u062d\u0635\u0648\u0644 \u0639\u0644\u0649 \u0645\u0639\u0644\u0648\u0645\u0627\u062a \u0645\u0641\u0635\u0644\u0629 \u0639\u0646 \u0627\u0644\u0645\u0632\u0627\u064a\u0627.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* الشريط الجانبي والمعلومات الإضافية */}
        <div className="space-y-6">
          {/* قسم التقديم */}
          <div className="bg-card rounded-lg p-6 border space-y-4">
            <h3 className="text-xl font-semibold mb-4">\u0645\u0639\u0644\u0648\u0645\u0627\u062a \u0627\u0644\u062a\u0642\u062f\u064a\u0645</h3>
            
            <div className="space-y-3">
              {deadline && (
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 ml-3 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">\u0627\u0644\u0645\u0648\u0639\u062f \u0627\u0644\u0646\u0647\u0627\u0626\u064a</p>
                    <p className="font-medium">{formattedDeadline}</p>
                  </div>
                </div>
              )}
              
              <Separator />
              
              {applyUrl && (
                <div className="pt-3">
                  <Link href={applyUrl} target="_blank" rel="noopener noreferrer">
                    <Button className="w-full">
                      \u0627\u0644\u062a\u0642\u062f\u064a\u0645 \u0644\u0644\u0645\u0646\u062d\u0629
                      <ArrowLeft className="mr-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* معلومات إضافية */}
          <div className="bg-card rounded-lg p-6 border space-y-4">
            <h3 className="text-xl font-semibold mb-4">\u0627\u0644\u0645\u0639\u0644\u0648\u0645\u0627\u062a \u0627\u0644\u0623\u0633\u0627\u0633\u064a\u0629</h3>
            
            <div className="space-y-4">
              {countryName && (
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 ml-3 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">\u0627\u0644\u0628\u0644\u062f</p>
                    <p className="font-medium">{countryName}</p>
                  </div>
                </div>
              )}
              
              {university && (
                <div className="flex items-center">
                  <School className="h-5 w-5 ml-3 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">\u0627\u0644\u062c\u0627\u0645\u0639\u0629</p>
                    <p className="font-medium">{university}</p>
                  </div>
                </div>
              )}
              
              {degree && (
                <div className="flex items-center">
                  <GraduationCap className="h-5 w-5 ml-3 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">\u0627\u0644\u062f\u0631\u062c\u0629 \u0627\u0644\u0639\u0644\u0645\u064a\u0629</p>
                    <p className="font-medium">{degree}</p>
                  </div>
                </div>
              )}
              
              {categoryName && (
                <div className="flex items-center">
                  <Building className="h-5 w-5 ml-3 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">\u0627\u0644\u062a\u062e\u0635\u0635</p>
                    <p className="font-medium">{categoryName}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* تاريخ النشر والتحديث */}
          <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
            <p>\u062a\u0627\u0631\u064a\u062e \u0627\u0644\u0646\u0634\u0631: {formattedCreatedAt}</p>
            <p>\u0622\u062e\u0631 \u062a\u062d\u062f\u064a\u062b: {formattedUpdatedAt}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
