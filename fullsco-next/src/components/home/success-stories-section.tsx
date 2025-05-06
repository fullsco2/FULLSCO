'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Quote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getSuccessStories } from '@/lib/api';

interface SuccessStoriesSectionProps {
  title?: string;
  description?: string;
}

export default function SuccessStoriesSection({
  title = 'قصص نجاح',
  description = 'تجارب حقيقية للطلاب الذين حصلوا على منح دراسية',
}: SuccessStoriesSectionProps) {
  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    async function loadSuccessStories() {
      try {
        // طلب مباشر للتأكد من التعامل مع الخادم الحالي
        const response = await fetch('/api/success-stories?limit=3');
        if (!response.ok) {
          throw new Error(`فشل الطلب: ${response.status}`);
        }
        
        const data = await response.json();
        
        // التعامل مع هيكل البيانات من API الحالي
        if (data.success && data.data) {
          setStories(data.data);
        } else if (Array.isArray(data)) {
          setStories(data);
        } else {
          setStories([]);
        }
      } catch (error) {
        console.error('Error loading success stories:', error);
      } finally {
        setLoading(false);
      }
    }

    loadSuccessStories();
    
    // تغيير القصة النشطة كل 5 ثواني إذا كان هناك أكثر من قصة
    const interval = setInterval(() => {
      if (stories.length > 1) {
        setActiveIndex((prevIndex) => (prevIndex + 1) % stories.length);
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [stories.length]);

  return (
    <section className="py-14 md:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h2 className="mb-3 text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">{title}</h2>
          <p className="mx-auto max-w-2xl text-gray-600 dark:text-gray-300">{description}</p>
        </div>

        {loading ? (
          <div className="mx-auto max-w-4xl">
            <div className="animate-pulse space-y-4">
              <div className="h-24 rounded-lg bg-gray-200 dark:bg-gray-800"></div>
              <div className="h-16 rounded-lg bg-gray-200 dark:bg-gray-800"></div>
              <div className="h-12 rounded-lg bg-gray-200 dark:bg-gray-800 w-1/2 mx-auto"></div>
            </div>
          </div>
        ) : stories.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-gray-500 dark:text-gray-400">لا توجد قصص نجاح متاحة حالياً.</p>
          </div>
        ) : (
          <div className="mx-auto max-w-4xl">
            <div className="relative overflow-hidden rounded-xl bg-white p-6 shadow-md dark:bg-gray-900 md:p-8">
              {/* علامة الاقتباس */}
              <div className="absolute right-6 top-6 text-primary/20">
                <Quote className="h-24 w-24 rotate-180" />
              </div>
              
              <div className="relative z-10">
                {stories.map((story, index) => (
                  <div 
                    key={story.id}
                    className={`transition-opacity duration-500 ${activeIndex === index ? 'opacity-100' : 'hidden opacity-0'}`}
                  >
                    <blockquote className="mb-6 text-xl italic text-gray-700 dark:text-gray-300 md:text-2xl">
                      "{story.quote || story.summary || story.content?.slice(0, 200) || 'قصة نجاح ملهمة'}"
                    </blockquote>
                    
                    <div className="flex items-center gap-4">
                      {story.image && (
                        <div className="overflow-hidden rounded-full border-2 border-primary h-16 w-16">
                          <img 
                            src={story.image} 
                            alt={story.name} 
                            className="h-full w-full object-cover"
                          />
                        </div>
                      )}
                      
                      <div>
                        <h4 className="text-lg font-bold text-gray-900 dark:text-white">{story.name}</h4>
                        <p className="text-gray-600 dark:text-gray-400">{story.university || story.institution || story.position}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* مؤشرات القصص */}
              {stories.length > 1 && (
                <div className="mt-8 flex justify-center gap-2">
                  {stories.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveIndex(index)}
                      className={`h-3 w-3 rounded-full transition-all ${activeIndex === index ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-700'}`}
                      aria-label={`الانتقال إلى القصة ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-12 text-center">
          <Link href="/success-stories">
            <Button variant="outline" size="lg" className="gap-2">
              عرض جميع قصص النجاح
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
