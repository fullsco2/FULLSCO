'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Calendar, Building2, Award, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate } from '@/lib/utils';

interface SuccessStoryDetailProps {
  slug: string;
}

export default function SuccessStoryDetail({ slug }: SuccessStoryDetailProps) {
  const router = useRouter();
  const [story, setStory] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSuccessStory() {
      try {
        // استدعاء قصة النجاح من الخادم
        const response = await fetch(`/api/success-stories/${slug}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('لم يتم العثور على قصة النجاح');
          }
          throw new Error(`خطأ في الطلب: ${response.status}`);
        }
        
        const data = await response.json();
        
        // التعامل مع هيكل البيانات من API الحالي
        if (data.success && data.data) {
          setStory(data.data);
        } else if (data && !data.success) {
          throw new Error(data.message || 'حدث خطأ أثناء تحميل قصة النجاح');
        } else {
          setStory(data);
        }
      } catch (err) {
        console.error('Error loading success story:', err);
        setError(err instanceof Error ? err.message : 'حدث خطأ أثناء تحميل قصة النجاح');
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      loadSuccessStory();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6">
            <Skeleton className="h-8 w-3/4 rounded-md" />
            <Skeleton className="mt-2 h-6 w-1/2 rounded-md" />
          </div>
          
          <Skeleton className="mb-8 h-64 w-full rounded-lg" />
          
          <div className="space-y-4">
            <Skeleton className="h-4 w-full rounded-md" />
            <Skeleton className="h-4 w-full rounded-md" />
            <Skeleton className="h-4 w-full rounded-md" />
            <Skeleton className="h-4 w-3/4 rounded-md" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-lg rounded-lg border border-red-200 bg-red-50 p-6 text-center dark:border-red-900 dark:bg-red-900/20">
          <h2 className="mb-4 text-xl font-bold text-red-700 dark:text-red-400">خطأ في تحميل قصة النجاح</h2>
          <p className="mb-6 text-red-600 dark:text-red-300">{error}</p>
          <Button onClick={() => router.push('/success-stories')} variant="outline">
            <ChevronLeft className="ml-2 h-4 w-4" />
            العودة إلى قصص النجاح
          </Button>
        </div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-lg rounded-lg border border-yellow-200 bg-yellow-50 p-6 text-center dark:border-yellow-900 dark:bg-yellow-900/20">
          <h2 className="mb-4 text-xl font-bold text-yellow-700 dark:text-yellow-400">لم يتم العثور على قصة النجاح</h2>
          <p className="mb-6 text-yellow-600 dark:text-yellow-300">لا يمكن العثور على قصة النجاح المطلوبة. قد تكون غير موجودة أو تم حذفها.</p>
          <Button onClick={() => router.push('/success-stories')} variant="outline">
            <ChevronLeft className="ml-2 h-4 w-4" />
            العودة إلى قصص النجاح
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        {/* عنوان القصة */}
        <div className="mb-8">
          <div className="flex items-center mb-2">
            <Link 
              href="/success-stories" 
              className="inline-flex items-center text-primary hover:text-primary/80 text-sm mb-2"
            >
              <ChevronLeft className="h-4 w-4 ml-1" />
              العودة إلى قصص النجاح
            </Link>
          </div>
          
          <h1 className="mb-4 text-3xl font-bold md:text-4xl">{story.name || story.title}</h1>
          
          <div className="flex flex-wrap gap-4">
            {story.university && (
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <Building2 className="ml-1 h-4 w-4 text-primary" />
                {story.university}
              </div>
            )}
            
            {story.scholarship && (
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <Award className="ml-1 h-4 w-4 text-primary" />
                {story.scholarship}
              </div>
            )}
            
            {story.createdAt && (
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <Calendar className="ml-1 h-4 w-4 text-primary" />
                {formatDate(story.createdAt)}
              </div>
            )}
          </div>
        </div>
        
        {/* صورة القصة */}
        {story.image && (
          <div className="mb-8 overflow-hidden rounded-lg">
            <img 
              src={story.image} 
              alt={story.name || story.title} 
              className="h-auto w-full object-cover"
            />
          </div>
        )}
        
        {/* ملخص القصة */}
        {story.summary && (
          <div className="mb-8 rounded-lg bg-gray-50 p-6 dark:bg-gray-800/50">
            <blockquote className="text-lg italic text-gray-700 dark:text-gray-300">
              {story.summary}
            </blockquote>
          </div>
        )}
        
        {/* محتوى القصة */}
        <div className="prose prose-lg max-w-none dark:prose-invert">
          {story.content ? (
            <div dangerouslySetInnerHTML={{ __html: story.content }} />
          ) : (
            <p className="text-gray-600 dark:text-gray-400">
              {story.quote || story.summary || 'لا يوجد محتوى مفصل لهذه القصة.'}
            </p>
          )}
        </div>
        
        {/* معلومات الطالب */}
        {story.studentInfo && (
          <div className="mt-8 rounded-lg bg-gray-50 p-6 dark:bg-gray-800/50">
            <h2 className="mb-4 text-xl font-bold">عن الطالب</h2>
            <div className="flex items-start gap-4">
              {story.studentImage ? (
                <img 
                  src={story.studentImage} 
                  alt={story.name} 
                  className="h-16 w-16 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <User className="h-8 w-8" />
                </div>
              )}
              <div>
                <h3 className="text-lg font-semibold">{story.name}</h3>
                <p className="text-gray-600 dark:text-gray-400">{story.studentInfo}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* زر العودة */}
        <div className="mt-12 flex justify-center">
          <Button 
            onClick={() => router.push('/success-stories')} 
            variant="outline"
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            العودة إلى قصص النجاح
          </Button>
        </div>
      </div>
    </div>
  );
}
