'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CalendarIcon, ArrowLeft, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatDate } from '@/lib/utils';

export default function SuccessStoriesPage() {
  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadSuccessStories() {
      try {
        // استدعاء قصص النجاح من الخادم
        const response = await fetch('/api/success-stories');
        if (!response.ok) {
          throw new Error(`خطأ في الطلب: ${response.status}`);
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
  }, []);

  // تصفية قصص النجاح بناءً على البحث
  const filteredStories = stories.filter((story) => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      story.name?.toLowerCase().includes(query) ||
      story.title?.toLowerCase().includes(query) ||
      story.university?.toLowerCase().includes(query) ||
      story.institution?.toLowerCase().includes(query) ||
      story.summary?.toLowerCase().includes(query) ||
      story.content?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 text-center md:mb-12">
        <h1 className="mb-4 text-3xl font-bold md:text-4xl">قصص نجاح وتجارب ملهمة</h1>
        <p className="mx-auto max-w-2xl text-gray-600 dark:text-gray-300">
          تجارب حقيقية للطلاب الذين حصلوا على منح دراسية ونجحوا في مسيرتهم الأكاديمية والمهنية
        </p>
      </div>

      {/* مربع البحث */}
      <div className="mb-8">
        <div className="relative mx-auto max-w-md">
          <Search className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="ابحث في قصص النجاح..."
            className="text-md rounded-full border-gray-300 pr-10 focus:border-primary"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div 
              key={index} 
              className="animate-pulse overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="h-48 bg-gray-200 dark:bg-gray-800"></div>
              <div className="p-4 space-y-3">
                <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full"></div>
                <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded mt-4"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredStories.length === 0 ? (
        searchQuery ? (
          <div className="py-12 text-center">
            <p className="text-lg text-gray-600 dark:text-gray-300">لا توجد نتائج للبحث عن "{searchQuery}"</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => setSearchQuery('')}
            >
              مسح البحث
            </Button>
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="text-lg text-gray-600 dark:text-gray-300">لا توجد قصص نجاح متاحة حالياً.</p>
          </div>
        )
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filteredStories.map((story) => (
            <div 
              key={story.id} 
              className="group overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
            >
              {/* صورة القصة */}
              <div className="relative h-48 overflow-hidden bg-gray-200 dark:bg-gray-800">
                {story.image ? (
                  <img 
                    src={story.image} 
                    alt={story.name} 
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/60 to-primary text-white">
                    <span className="text-lg font-bold">{story.name?.charAt(0) || "S"}</span>
                  </div>
                )}
              </div>
              
              <div className="p-5">
                {/* عنوان القصة */}
                <h2 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">{story.name || story.title}</h2>
                
                {/* الجامعة أو المؤسسة */}
                {(story.university || story.institution) && (
                  <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
                    {story.university || story.institution}
                  </p>
                )}
                
                {/* ملخص القصة */}
                <p className="mb-5 line-clamp-3 text-gray-600 dark:text-gray-300">
                  {story.summary || story.quote || story.content?.slice(0, 150) || 'قصة نجاح ملهمة...'}
                </p>
                
                {/* تاريخ النشر */}
                {story.createdAt && (
                  <div className="mb-4 flex items-center text-xs text-gray-500 dark:text-gray-400">
                    <CalendarIcon className="ml-1 h-3 w-3" />
                    {formatDate(story.createdAt)}
                  </div>
                )}
                
                {/* زر عرض المزيد */}
                <Link href={`/success-stories/${story.slug || story.id}`}>
                  <Button className="w-full gap-2">
                    قراءة القصة
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
