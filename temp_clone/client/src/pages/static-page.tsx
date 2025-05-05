import { useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { usePage, usePages } from "@/hooks/use-pages";
import { Helmet } from "react-helmet";
import { Loader2 } from "lucide-react";

type StaticPageProps = 
  | { slug?: string }
  | { params: Record<string, string> };

const StaticPage = (props: StaticPageProps) => {
  // الحصول على الـ slug من البروبس أو المعاملات
  let slug: string | undefined;
  
  if ('slug' in props) {
    // إذا كان props يحتوي على slug، نستخدمه
    slug = props.slug;
  } else {
    // استخدام المسار الذي تم تمريره من الراوتر
    const params = useParams<{ slug: string }>();
    slug = params.slug;
  }
  
  // جلب قائمة الصفحات لاستخدامها في التحقق من المسارات المحجوزة
  const { data: allPages } = usePages();
  const [_, setLocation] = useLocation();
  
  // التحقق من المسارات المحجوزة - إذا كان المسار يمثل مساراً آخر في التطبيق وليس صفحة ثابتة
  const reservedPaths = [
    'admin', 'scholarships', 'scholarship', 'articles', 'article', 'login', 'register',
    'dashboard', 'profile', 'search', 'pages', 'page', 'api'
  ];
  
  // التحقق مما إذا كان المسار محجوزاً 
  useEffect(() => {
    if (slug && reservedPaths.includes(slug)) {
      console.log(`المسار /${slug} محجوز لاستخدام آخر في التطبيق`);
      setLocation("/404");
      return;
    }
  }, [slug, setLocation]);
  
  // فحص إذا كان المسار موجود في قائمة الصفحات
  const isValidPage = allPages && slug ? allPages.some(page => page.slug === slug) : false;
  
  // جلب بيانات الصفحة فقط إذا كانت المسارات صالحة
  const { data: page, isLoading, error } = usePage(slug || '', isValidPage);
  
  useEffect(() => {
    // إذا كان هناك خطأ (مثل الصفحة غير موجودة)، قم بالتوجيه إلى صفحة الخطأ
    if ((error && !isLoading) || (!isValidPage && slug)) {
      setLocation("/404");
    }
  }, [error, isLoading, setLocation, isValidPage, slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!page) {
    return null; // سيتم توجيهنا بواسطة useEffect إلى صفحة الخطأ
  }

  return (
    <div className="bg-background pb-16">
      <Helmet>
        <title>{page.metaTitle || `${page.title} | FULLSCO`}</title>
        {page.metaDescription && <meta name="description" content={page.metaDescription} />}
      </Helmet>

      {/* قسم الهيدر */}
      <div className="bg-primary/5 border-b">
        <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">{page.title}</h1>
          </div>
        </div>
      </div>

      {/* محتوى الصفحة */}
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-8 rtl">
          <div 
            className="prose prose-lg dark:prose-invert rtl
              prose-headings:text-foreground prose-headings:font-bold prose-headings:mb-4
              prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg
              prose-p:text-muted-foreground prose-p:mb-4 prose-p:leading-relaxed
              prose-a:text-primary prose-a:no-underline hover:prose-a:text-primary/80 hover:prose-a:underline
              prose-strong:text-foreground/90 prose-strong:font-bold
              prose-ul:mr-6 prose-ul:list-disc prose-ul:mb-4
              prose-ol:mr-6 prose-ol:list-decimal prose-ol:mb-4
              prose-li:mb-1
              max-w-none"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        </div>
      </div>
    </div>
  );
};

export default StaticPage;