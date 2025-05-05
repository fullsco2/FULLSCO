'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Calendar, Globe, GraduationCap, Award, ExternalLink, Clock, ChevronRight, Share2, Bookmark, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface ScholarshipDetailProps {
  slug: string;
}

export default function ScholarshipDetail({ slug }: ScholarshipDetailProps) {
  const router = useRouter();
  const [scholarship, setScholarship] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchScholarship = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // جلب بيانات المنحة الدراسية من API الحالي
        const response = await fetch(`/api/scholarships/${slug}`);
        if (!response.ok) {
          throw new Error(`فشل جلب بيانات المنحة: ${response.status}`);
        }
        
        const data = await response.json();
        // التعامل مع هيكل البيانات من API الحالي
        setScholarship(data.data || data);
      } catch (err) {
        console.error('Error fetching scholarship details:', err);
        setError(err instanceof Error ? err.message : 'حدث خطأ أثناء جلب بيانات المنحة');
      } finally {
        setLoading(false);
      }
    };
    
    fetchScholarship();
  }, [slug]);

  // التحقق من موعد انتهاء التقديم
  const isDeadlinePassed = scholarship?.deadline 
    ? new Date(scholarship.deadline) < new Date() 
    : false;
  
  // مشاركة المنحة
  const shareScholarship = () => {
    if (typeof window !== 'undefined' && navigator.share) {
      navigator.share({
        title: scholarship?.title || 'منحة دراسية',
        text: scholarship?.description?.slice(0, 100) || '',
        url: window.location.href
      }).catch(err => console.error('Error sharing:', err));
    } else {
      // نسخ الرابط إلى الحافظة
      navigator.clipboard.writeText(window.location.href)
        .then(() => alert('تم نسخ الرابط'))
        .catch(err => console.error('Error copying link:', err));
    }
  };
  
  // طباعة المنحة
  const printScholarship = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-lg">جاري تحميل بيانات المنحة...</p>
        </div>
      </div>
    );
  }

  if (error || !scholarship) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-center sm:px-6 lg:px-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-900/20">
          <h2 className="mb-4 text-xl font-bold text-red-700 dark:text-red-400">لم يتم العثور على المنحة الدراسية</h2>
          <p className="mb-4 text-red-600 dark:text-red-300">{error || 'لم يتم العثور على المنحة المطلوبة. ربما تم حذفها أو نقلها.'}</p>
          <div className="flex justify-center gap-3">
            <Button variant="outline" onClick={() => router.back()}>
              العودة للصفحة السابقة
            </Button>
            <Link href="/scholarships">
              <Button>عرض جميع المنح</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="scholarship-detail-container pb-12">
      {/* التنقل الفرعي */}
      <div className="bg-gray-50 dark:bg-gray-900 py-2 mb-6">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex text-sm">
            <Link href="/" className="text-gray-500 hover:text-primary transition-colors">
              الرئيسية
            </Link>
            <ChevronRight className="mx-2 h-4 w-4 text-gray-400" />
            <Link href="/scholarships" className="text-gray-500 hover:text-primary transition-colors">
              المنح الدراسية
            </Link>
            <ChevronRight className="mx-2 h-4 w-4 text-gray-400" />
            <span className="text-primary">{scholarship.title}</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* تفاصيل المنحة */}
          <div className="lg:col-span-2">
            {/* عنوان المنحة */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white md:text-3xl">
                {scholarship.title}
              </h1>
              
              {/* معلومات أساسية */}
              <div className="mt-4 flex flex-wrap gap-4 text-sm">
                {scholarship.university && (
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <Award className="ml-1.5 h-4 w-4 text-primary" />
                    <span>{scholarship.university}</span>
                  </div>
                )}
                
                {scholarship.country && (
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <Globe className="ml-1.5 h-4 w-4 text-primary" />
                    <span>{typeof scholarship.country === 'object' ? scholarship.country.name : scholarship.country}</span>
                  </div>
                )}
                
                {scholarship.level && (
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <GraduationCap className="ml-1.5 h-4 w-4 text-primary" />
                    <span>{typeof scholarship.level === 'object' ? scholarship.level.name : scholarship.level}</span>
                  </div>
                )}
                
                {scholarship.deadline && (
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <Calendar className="ml-1.5 h-4 w-4 text-primary" />
                    <span className={isDeadlinePassed ? 'text-red-500 dark:text-red-400' : ''}>
                      {isDeadlinePassed ? 'انتهى التقديم: ' : 'آخر موعد: '}
                      {formatDate(new Date(scholarship.deadline))}
                    </span>
                  </div>
                )}
                
                {scholarship.createdAt && (
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <Clock className="ml-1.5 h-4 w-4 text-primary" />
                    <span>تاريخ النشر: {formatDate(new Date(scholarship.createdAt))}</span>
                  </div>
                )}
              </div>
              
              {/* علامات */}
              <div className="mt-4 flex flex-wrap gap-2">
                {scholarship.funded && (
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800 dark:bg-green-800/30 dark:text-green-300">
                    تمويل كامل
                  </span>
                )}
                
                {scholarship.featured && (
                  <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-300">
                    منحة مميزة
                  </span>
                )}
                
                {scholarship.category && (
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary dark:bg-primary/20">
                    {typeof scholarship.category === 'object' ? scholarship.category.name : scholarship.category}
                  </span>
                )}
              </div>
            </div>
            
            {/* صورة المنحة */}
            {scholarship.thumbnail && (
              <div className="mb-8 overflow-hidden rounded-lg">
                <img 
                  src={scholarship.thumbnail} 
                  alt={scholarship.title} 
                  className="h-auto w-full object-cover"
                />
              </div>
            )}
            
            {/* وصف المنحة */}
            <div className="mb-8">
              <h2 className="mb-4 text-xl font-bold">وصف المنحة</h2>
              <div className="prose max-w-none dark:prose-invert">
                {/* إذا كان الوصف يحتوي على HTML */}
                {scholarship.description && typeof scholarship.description === 'string' ? (
                  scholarship.description.includes('<') ? (
                    <div dangerouslySetInnerHTML={{ __html: scholarship.description }} />
                  ) : (
                    <p>{scholarship.description}</p>
                  )
                ) : (
                  <p>لا يوجد وصف متاح لهذه المنحة.</p>
                )}
              </div>
            </div>
            
            {/* متطلبات المنحة */}
            {scholarship.requirements && (
              <div className="mb-8">
                <h2 className="mb-4 text-xl font-bold">متطلبات التقديم</h2>
                <div className="prose max-w-none dark:prose-invert">
                  {typeof scholarship.requirements === 'string' ? (
                    scholarship.requirements.includes('<') ? (
                      <div dangerouslySetInnerHTML={{ __html: scholarship.requirements }} />
                    ) : (
                      <p>{scholarship.requirements}</p>
                    )
                  ) : (
                    <p>لا توجد متطلبات محددة لهذه المنحة.</p>
                  )}
                </div>
              </div>
            )}
            
            {/* معلومات إضافية */}
            {scholarship.additionalInfo && (
              <div className="mb-8">
                <h2 className="mb-4 text-xl font-bold">معلومات إضافية</h2>
                <div className="prose max-w-none dark:prose-invert">
                  {typeof scholarship.additionalInfo === 'string' ? (
                    scholarship.additionalInfo.includes('<') ? (
                      <div dangerouslySetInnerHTML={{ __html: scholarship.additionalInfo }} />
                    ) : (
                      <p>{scholarship.additionalInfo}</p>
                    )
                  ) : null}
                </div>
              </div>
            )}
            
            {/* أزرار العمليات */}
            <div className="mt-8 flex flex-wrap gap-3">
              {scholarship.url && (
                <a href={scholarship.url} target="_blank" rel="noopener noreferrer" className="flex-1 sm:flex-none">
                  <Button 
                    className="w-full bg-primary hover:bg-primary/90 sm:w-auto" 
                    disabled={isDeadlinePassed}
                  >
                    <ExternalLink className="ml-2 h-4 w-4" />
                    {isDeadlinePassed ? 'انتهى التقديم' : 'التقديم للمنحة'}
                  </Button>
                </a>
              )}
              
              <Button variant="outline" onClick={shareScholarship} className="flex-1 sm:flex-none sm:w-auto">
                <Share2 className="ml-2 h-4 w-4" />
                مشاركة
              </Button>
              
              <Button variant="outline" onClick={printScholarship} className="flex-1 sm:flex-none sm:w-auto">
                <Printer className="ml-2 h-4 w-4" />
                طباعة
              </Button>
            </div>
          </div>
          
          {/* القسم الجانبي */}
          <div className="lg:col-span-1">
            {/* مربع ملخص المنحة */}
            <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <h3 className="mb-3 text-lg font-bold">ملخص المنحة</h3>
              
              <div className="space-y-3 text-sm">
                {scholarship.university && (
                  <div className="flex justify-between border-b border-gray-100 pb-2 dark:border-gray-800">
                    <span className="font-medium">الجامعة:</span>
                    <span>{scholarship.university}</span>
                  </div>
                )}
                
                {scholarship.level && (
                  <div className="flex justify-between border-b border-gray-100 pb-2 dark:border-gray-800">
                    <span className="font-medium">المستوى الدراسي:</span>
                    <span>{typeof scholarship.level === 'object' ? scholarship.level.name : scholarship.level}</span>
                  </div>
                )}
                
                {scholarship.country && (
                  <div className="flex justify-between border-b border-gray-100 pb-2 dark:border-gray-800">
                    <span className="font-medium">الدولة:</span>
                    <span>{typeof scholarship.country === 'object' ? scholarship.country.name : scholarship.country}</span>
                  </div>
                )}
                
                {scholarship.category && (
                  <div className="flex justify-between border-b border-gray-100 pb-2 dark:border-gray-800">
                    <span className="font-medium">التخصص:</span>
                    <span>{typeof scholarship.category === 'object' ? scholarship.category.name : scholarship.category}</span>
                  </div>
                )}
                
                {scholarship.deadline && (
                  <div className="flex justify-between border-b border-gray-100 pb-2 dark:border-gray-800">
                    <span className="font-medium">آخر موعد للتقديم:</span>
                    <span className={isDeadlinePassed ? 'text-red-500 dark:text-red-400' : ''}>
                      {formatDate(new Date(scholarship.deadline))}
                    </span>
                  </div>
                )}
                
                {scholarship.funded !== undefined && (
                  <div className="flex justify-between pb-2">
                    <span className="font-medium">نوع التمويل:</span>
                    <span>
                      {scholarship.funded ? 'تمويل كامل' : 'تمويل جزئي'}
                    </span>
                  </div>
                )}
              </div>
              
              {/* أزرار العمليات للشاشة الصغيرة */}
              {scholarship.url && (
                <div className="mt-4">
                  <a href={scholarship.url} target="_blank" rel="noopener noreferrer">
                    <Button 
                      className="w-full bg-primary hover:bg-primary/90" 
                      disabled={isDeadlinePassed}
                    >
                      {isDeadlinePassed ? 'انتهى التقديم' : 'التقديم للمنحة'}
                    </Button>
                  </a>
                </div>
              )}
            </div>
            
            {/* المنح ذات الصلة - يمكن إضافتها لاحقاً */}
            {/* <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <h3 className="mb-3 text-lg font-bold">منح ذات صلة</h3>
              <div className="space-y-3">
                ...
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
}
