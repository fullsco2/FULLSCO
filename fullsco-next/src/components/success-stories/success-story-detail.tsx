'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TypographyH1, TypographyP } from '@/components/ui/typography';
import { Share2, ArrowRight, Loader2, AlertCircle, CalendarIcon, GraduationCap, MapPin, Clock } from 'lucide-react';
import { formatDate } from '@/lib/utils';

type SuccessStoryDetailProps = {
  slug: string;
};

type SuccessStory = {
  id: number;
  name: string;
  title: string;
  content: string;
  excerpt?: string;
  slug: string;
  university?: string;
  country?: string;
  profileImage?: string;
  thumbnailUrl?: string;
  year?: number;
  createdAt: string;
  updatedAt: string;
};

export function SuccessStoryDetail({ slug }: SuccessStoryDetailProps) {
  const router = useRouter();
  const pathname = usePathname();
  
  const [story, setStory] = useState<SuccessStory | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedStories, setRelatedStories] = useState<SuccessStory[]>([]);

  // جلب بيانات قصة النجاح
  useEffect(() => {
    const fetchSuccessStory = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`/api/success-stories/${slug}`);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('\u0642\u0635\u0629 \u0627\u0644\u0646\u062c\u0627\u062d \u063a\u064a\u0631 \u0645\u0648\u062c\u0648\u062f\u0629');
          }
          throw new Error(`\u062e\u0637\u0623 \u0641\u064a \u062c\u0644\u0628 \u0642\u0635\u0629 \u0627\u0644\u0646\u062c\u0627\u062d: ${response.status}`);
        }

        const data = await response.json();
        setStory(data);

        // بعد جلب قصة النجاح، نجلب قصص نجاح ذات صلة
        fetchRelatedStories(data.id);
      } catch (error) {
        console.error('Error fetching success story:', error);
        setError(error instanceof Error ? error.message : '\u062d\u062f\u062b \u062e\u0637\u0623 \u063a\u064a\u0631 \u0645\u0639\u0631\u0648\u0641');
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) {
      fetchSuccessStory();
    }
  }, [slug]);

  // جلب قصص نجاح ذات صلة
  const fetchRelatedStories = async (storyId: number) => {
    try {
      const response = await fetch(`/api/success-stories?limit=3`);
      if (!response.ok) throw new Error('Failed to fetch related stories');
      
      const data = await response.json();
      // فلترة قصة النجاح الحالية من النتائج
      const filteredStories = data.data.filter((s: SuccessStory) => s.id !== storyId);
      setRelatedStories(filteredStories.slice(0, 3));
    } catch (error) {
      console.error('Error fetching related stories:', error);
    }
  };

  // يتعامل مع مشاركة قصة النجاح
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: story ? `${story.name}: ${story.title}` : '\u0642\u0635\u0629 \u0646\u062c\u0627\u062d',
          text: story?.excerpt || '\u0627\u0643\u062a\u0634\u0641 \u0647\u0630\u0647 \u0627\u0644\u0642\u0635\u0629 \u0627\u0644\u0645\u0644\u0647\u0645\u0629',
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
        <p className="text-lg">\u062c\u0627\u0631\u064a \u062a\u062d\u0645\u064a\u0644 \u0642\u0635\u0629 \u0627\u0644\u0646\u062c\u0627\u062d...</p>
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
          \u0627\u0644\u0639\u0648\u062f\u0629 \u0644\u0642\u0635\u0635 \u0627\u0644\u0646\u062c\u0627\u062d
        </Button>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="container py-12 flex flex-col items-center justify-center min-h-[50vh] text-center">
        <AlertCircle className="h-16 w-16 text-destructive mb-4" />
        <h2 className="text-2xl font-bold mb-2">\u0644\u0645 \u064a\u062a\u0645 \u0627\u0644\u0639\u062b\u0648\u0631 \u0639\u0644\u0649 \u0642\u0635\u0629 \u0627\u0644\u0646\u062c\u0627\u062d</h2>
        <p className="text-muted-foreground mb-6">\u0644\u0645 \u064a\u062a\u0645 \u0627\u0644\u0639\u062b\u0648\u0631 \u0639\u0644\u0649 \u0642\u0635\u0629 \u0627\u0644\u0646\u062c\u0627\u062d \u0627\u0644\u0645\u0637\u0644\u0648\u0628\u0629</p>
        <Button onClick={handleBack} variant="outline">
          <ArrowRight className="ml-2 h-4 w-4" />
          \u0627\u0644\u0639\u0648\u062f\u0629 \u0644\u0642\u0635\u0635 \u0627\u0644\u0646\u062c\u0627\u062d
        </Button>
      </div>
    );
  }

  const {
    name,
    title,
    content,
    excerpt,
    university,
    country,
    profileImage,
    thumbnailUrl,
    year,
    createdAt
  } = story;

  const imageUrl = profileImage || thumbnailUrl || '/images/placeholder-profile.jpg';
  const formattedDate = formatDate(createdAt);

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

        {/* ا\u0644\u0645\u062d\u062a\u0648\u0649 \u0627\u0644\u0631\u0626\u064a\u0633\u064a */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* \u0642\u0635\u0629 \u0627\u0644\u0646\u062c\u0627\u062d */}
          <div className="lg:col-span-3 space-y-8">
            {/* \u0645\u0639\u0644\u0648\u0645\u0627\u062a \u0627\u0644\u0634\u062e\u0635 */}
            <div className="bg-card p-6 rounded-lg border">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <div className="relative w-32 h-32 rounded-full overflow-hidden border flex-shrink-0">
                  <Image
                    src={imageUrl}
                    alt={name}
                    fill
                    priority
                    className="object-cover"
                  />
                </div>
                
                <div className="text-center md:text-right">
                  <h1 className="text-2xl md:text-3xl font-bold mb-2">{name}</h1>
                  <h2 className="text-xl font-semibold text-primary mb-4">{title}</h2>
                  
                  <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-muted-foreground mb-3">
                    {university && (
                      <div className="flex items-center">
                        <GraduationCap className="h-4 w-4 ml-1" />
                        <span>{university}</span>
                      </div>
                    )}
                    
                    {country && (
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 ml-1" />
                        <span>{country}</span>
                      </div>
                    )}
                    
                    {year && (
                      <div className="flex items-center">
                        <CalendarIcon className="h-4 w-4 ml-1" />
                        <span>{year}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* \u0627\u0644\u0645\u0642\u062f\u0645\u0629 */}
            {excerpt && (
              <div>
                <TypographyP className="text-lg leading-relaxed text-muted-foreground">
                  {excerpt}
                </TypographyP>
              </div>
            )}
            
            {/* \u0645\u062d\u062a\u0648\u0649 \u0642\u0635\u0629 \u0627\u0644\u0646\u062c\u0627\u062d */}
            <div className="prose prose-lg dark:prose-invert prose-stone max-w-none">
              <div dangerouslySetInnerHTML={{ __html: content }} />
            </div>
          </div>
          
          {/* \u0627\u0644\u0634\u0631\u064a\u0637 \u0627\u0644\u062c\u0627\u0646\u0628\u064a */}
          <div className="space-y-8">
            {/* \u0642\u0635\u0635 \u0646\u062c\u0627\u062d \u0630\u0627\u062a \u0635\u0644\u0629 */}
            {relatedStories && relatedStories.length > 0 && (
              <div className="bg-card rounded-lg border p-6">
                <h3 className="text-xl font-semibold mb-4">\u0642\u0635\u0635 \u0646\u062c\u0627\u062d \u0623\u062e\u0631\u0649</h3>
                
                <div className="space-y-4">
                  {relatedStories.map((relatedStory) => (
                    <div key={relatedStory.id} className="flex gap-3 pb-4 border-b last:border-0 last:pb-0">
                      <div className="flex-shrink-0 w-16 h-16 relative rounded-full overflow-hidden">
                        <Link href={`/success-stories/${relatedStory.slug}`}>
                          <Image
                            src={relatedStory.profileImage || relatedStory.thumbnailUrl || '/images/placeholder-profile.jpg'}
                            alt={relatedStory.name}
                            fill
                            className="object-cover"
                          />
                        </Link>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm line-clamp-1 mb-1">
                          <Link href={`/success-stories/${relatedStory.slug}`} className="hover:text-primary">
                            {relatedStory.name}
                          </Link>
                        </h4>
                        <p className="text-xs line-clamp-2 text-muted-foreground">
                          {relatedStory.title}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 pt-4 border-t">
                  <Link href="/success-stories">
                    <Button variant="outline" className="w-full text-sm" size="sm">
                      \u0639\u0631\u0636 \u0643\u0644 \u0642\u0635\u0635 \u0627\u0644\u0646\u062c\u0627\u062d
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
