'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Award, FileText, Loader2, AlertCircle, Quote } from 'lucide-react';
import { useSiteSettings } from '@/hooks/use-site-settings';

type SuccessStory = {
  id: number;
  name: string;
  title: string;
  excerpt: string;
  content: string;
  slug: string;
  imageUrl?: string;
  university?: string;
  scholarship?: string;
  year?: number;
};

export function SuccessStoriesSection() {
  const { siteSettings } = useSiteSettings();
  const [stories, setStories] = useState<SuccessStory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/success-stories?limit=3');
        
        if (!response.ok) {
          throw new Error(`Error fetching success stories: ${response.status}`);
        }
        
        const data = await response.json();
        setStories(data?.data || []);
      } catch (error) {
        console.error('Error fetching success stories:', error);
        setError('Failed to load success stories');
      } finally {
        setIsLoading(false);
      }
    };

    if (siteSettings?.showSuccessStories) {
      fetchStories();
    }
  }, [siteSettings]);

  if (!siteSettings || !siteSettings.showSuccessStories) return null;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <section className="py-12 md:py-16 bg-muted/20">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
              {siteSettings.successStoriesTitle || 'قصص نجاح'}
            </h2>
            <p className="text-muted-foreground">
              {siteSettings.successStoriesDescription || 'تجارب حقيقية للطلاب الذين حصلوا على منح دراسية'}
            </p>
          </div>

          <Link href="/success-stories" passHref>
            <Button variant="outline" className="shrink-0">
              <ArrowLeft className="ml-2 h-4 w-4" />
              عرض جميع القصص
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center min-h-[300px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="mr-2">جاري تحميل قصص النجاح...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center min-h-[300px] text-center">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <h3 className="text-xl font-semibold">حدث خطأ أثناء تحميل قصص النجاح</h3>
            <p className="text-muted-foreground mt-2">{error}</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              إعادة المحاولة
            </Button>
          </div>
        ) : stories.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[300px] text-center">
            <Award className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold">لا توجد قصص نجاح حالياً</h3>
            <p className="text-muted-foreground mt-2">ستظهر هنا قصص وتجارب الطلاب الذين حصلوا على منح دراسية بمجرد نشرها</p>
          </div>
        ) : (
          <div className="grid gap-6 pt-8 md:grid-cols-3">
            {stories.map((story) => (
              <Card key={story.id} className="overflow-hidden bg-muted/30 border-primary/10">
                <CardHeader className="text-center relative pb-0">
                  <div className="mx-auto mb-4">
                    <Avatar className="h-20 w-20 border-4 border-background">
                      {story.imageUrl ? (
                        <AvatarImage src={story.imageUrl} alt={story.name} />
                      ) : null}
                      <AvatarFallback>{getInitials(story.name)}</AvatarFallback>
                    </Avatar>
                  </div>
                  <Quote className="absolute top-4 right-4 h-6 w-6 text-primary/40" />
                  <CardTitle className="text-lg">{story.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {story.scholarship ? `${story.scholarship} - ` : ''}
                    {story.university}
                    {story.year ? ` (${story.year})` : ''}
                  </p>
                </CardHeader>
                <CardContent className="text-center px-8 pt-6">
                  <p className="italic text-muted-foreground line-clamp-4">
                    "{story.excerpt || story.content.substring(0, 150)}..."
                  </p>
                </CardContent>
                <CardFooter className="justify-center">
                  <Link href={`/success-stories/${story.slug || story.id}`} passHref>
                    <Button variant="outline" size="sm">
                      قراءة القصة كاملة
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
