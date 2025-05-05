'use client';

import Image from 'next/image';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { Calendar, GraduationCap, Globe, Award, Clock, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ScholarshipCardProps {
  scholarship: any; // استخدام أي نوع للتوافق مع البيانات الحالية من API
  featured?: boolean;
}

export default function ScholarshipCard({ scholarship, featured = false }: ScholarshipCardProps) {
  // التحقق من موعد انتهاء التقديم
  const isDeadlinePassed = scholarship.deadline 
    ? new Date(scholarship.deadline) < new Date() 
    : false;
  
  // عنوان الصورة من API
  const thumbnailUrl = scholarship.thumbnail || '/placeholder-scholarship.jpg';

  return (
    <div 
      className={`group relative overflow-hidden rounded-xl border transition-all duration-300 hover:shadow-md ${isDeadlinePassed ? 'opacity-75 grayscale' : ''} ${
        featured || scholarship.featured ? 'border-primary/30 bg-gradient-to-bl from-primary/5 to-transparent shadow-md' : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900'
      }`}
    >
      {/* شارة التمويل الكامل */}
      {scholarship.funded && (
        <div className="absolute left-0 top-4 z-10 rounded-e-lg bg-accent/90 px-3 py-1 text-xs font-medium text-white shadow-sm">
          تمويل كامل
        </div>
      )}
      
      {/* شارة مميز */}
      {(featured || scholarship.featured) && (
        <div className="absolute right-0 top-4 z-10 rounded-s-lg bg-yellow-500/90 px-3 py-1 text-xs font-medium text-white shadow-sm">
          منحة مميزة
        </div>
      )}
      
      {/* صورة الجامعة أو المنحة */}
      <div className="relative h-48 w-full overflow-hidden bg-gray-200 dark:bg-gray-800">
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10"></div>
        {thumbnailUrl && (
          // استخدام عنصر img العادي بدلاً من Image لتجنب مشاكل الأدوات
          <img 
            src={thumbnailUrl} 
            alt={scholarship.university || scholarship.title} 
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"  
          />
        )}
        
        {/* معلومات على الصورة */}
        <div className="absolute bottom-0 right-0 left-0 z-20 p-4 text-white">
          {scholarship.university && (
            <h3 className="font-bold">{scholarship.university}</h3>
          )}
          {scholarship.country?.name && (
            <div className="flex items-center text-sm">
              <Globe className="ml-1 h-4 w-4" />
              <span>{scholarship.country.name}</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="p-4">
        {/* عنوان المنحة */}
        <Link href={`/scholarships/${scholarship.slug || scholarship.id}`} className="block">
          <h2 className="mb-2 text-xl font-bold line-clamp-2 transition-colors group-hover:text-primary">
            {scholarship.title}
          </h2>
        </Link>
        
        {/* وصف مختصر */}
        <p className="mb-4 text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
          {scholarship.description}
        </p>
        
        {/* معلومات المنحة */}
        <div className="mb-4 grid grid-cols-2 gap-2 text-sm">
          {scholarship.level && (
            <div className="flex items-center text-gray-600 dark:text-gray-300">
              <GraduationCap className="ml-1.5 h-4 w-4 text-primary" />
              <span>{typeof scholarship.level === 'object' ? scholarship.level.name : scholarship.level}</span>
            </div>
          )}
          
          {scholarship.category && (
            <div className="flex items-center text-gray-600 dark:text-gray-300">
              <Award className="ml-1.5 h-4 w-4 text-primary" />
              <span>{typeof scholarship.category === 'object' ? scholarship.category.name : scholarship.category}</span>
            </div>
          )}
          
          {scholarship.deadline && (
            <div className="flex items-center text-gray-600 dark:text-gray-300 col-span-2">
              <Calendar className="ml-1.5 h-4 w-4 text-primary" />
              <span className={isDeadlinePassed ? 'text-red-500 dark:text-red-400' : ''}>
                {isDeadlinePassed ? 'انتهى التقديم: ' : 'آخر موعد: '}
                {formatDate(new Date(scholarship.deadline))}
              </span>
            </div>
          )}
          
          {scholarship.createdAt && (
            <div className="flex items-center text-gray-600 dark:text-gray-300 col-span-2">
              <Clock className="ml-1.5 h-4 w-4 text-primary" />
              <span>تاريخ النشر: {formatDate(new Date(scholarship.createdAt))}</span>
            </div>
          )}
        </div>
        
        {/* أزرار العمليات */}
        <div className="flex gap-2">
          <Link href={`/scholarships/${scholarship.slug || scholarship.id}`} className="flex-1">
            <Button className="w-full bg-primary hover:bg-primary/90">
              التفاصيل
            </Button>
          </Link>
          
          {scholarship.url && (
            <a href={scholarship.url} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="icon">
                <ExternalLink className="h-4 w-4" />
              </Button>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
