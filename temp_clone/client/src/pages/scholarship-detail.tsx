import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'wouter';
import { 
  ArrowLeft, 
  ArrowRight,
  Calendar, 
  DollarSign, 
  Globe, 
  GraduationCap, 
  FileText, 
  ExternalLink 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import Newsletter from '@/components/newsletter';
import { Scholarship, Level, Country, Category } from '@shared/schema';

const ScholarshipDetail = () => {
  const { slug } = useParams();
  
  const { data: scholarship, isLoading, error } = useQuery<Scholarship>({
    queryKey: [`/api/scholarships/slug/${slug}`],
  });

  const { data: countries } = useQuery<Country[]>({
    queryKey: ['/api/countries'],
  });

  const { data: levels } = useQuery<Level[]>({
    queryKey: ['/api/levels'],
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  const { data: relatedScholarships } = useQuery<Scholarship[]>({
    queryKey: ['/api/scholarships', { limit: 3 }],
    enabled: !!scholarship,
  });

  // Set page metadata
  useEffect(() => {
    if (scholarship) {
      document.title = `${scholarship.title} - FULLSCO Scholarship`;
      
      // You can add more metadata here when implementing SEO
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', scholarship.description);
      } else {
        const meta = document.createElement('meta');
        meta.name = 'description';
        meta.content = scholarship.description;
        document.head.appendChild(meta);
      }
    }
  }, [scholarship]);

  const getCountryName = (countryId?: number | null) => {
    if (!countryId || !countries) return '';
    const country = countries.find(c => c.id === countryId);
    return country?.name || '';
  };

  const getLevelName = (levelId?: number | null) => {
    if (!levelId || !levels) return '';
    const level = levels.find(l => l.id === levelId);
    return level?.name || '';
  };

  const getCategoryName = (categoryId?: number | null) => {
    if (!categoryId || !categories) return '';
    const category = categories.find(c => c.id === categoryId);
    return category?.name || '';
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="animate-pulse">
          <div className="h-8 w-64 bg-gray-200 rounded mb-4"></div>
          <div className="h-6 w-40 bg-gray-200 rounded mb-8"></div>
          <div className="h-64 bg-gray-200 rounded-lg mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
          <div className="h-6 w-48 bg-gray-200 rounded mb-4"></div>
          <div className="h-32 bg-gray-200 rounded mb-8"></div>
        </div>
      </div>
    );
  }

  if (error || !scholarship) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Scholarship Not Found</h1>
        <p className="text-gray-600 mb-8">We couldn't find the scholarship you're looking for.</p>
        <Link href="/scholarships">
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Scholarships
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero section with immersive parallax effect */}
      <div className="relative h-[40vh] md:h-[50vh] lg:h-[60vh] bg-primary overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
          <div className="absolute top-1/2 left-1/4 h-40 w-40 rounded-full bg-accent/20 blur-2xl"></div>
          <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/60 via-black/30 to-transparent"></div>
        </div>
        
        {/* Main hero image */}
        <div className="absolute inset-0">
          <img 
            src={scholarship.imageUrl || "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3"}
            alt={scholarship.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/90 to-transparent mix-blend-multiply"></div>
        </div>
        
        {/* Overlay content */}
        <div className="container relative z-10 mx-auto h-full px-4 sm:px-6 lg:px-8">
          <div className="flex h-full flex-col justify-end pb-16">
            <div className="animate-fade-in">
              <Link href="/scholarships" className="inline-block mb-4">
                <Button variant="outline" className="bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm border-white/20">
                  <ArrowLeft className="mr-2 h-4 w-4" /> العودة للمنح
                </Button>
              </Link>
              
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <Badge className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm">
                  {getCountryName(scholarship.countryId)}
                </Badge>
                <Badge variant="secondary" className="bg-accent text-white hover:bg-accent/90">
                  {getLevelName(scholarship.levelId)}
                </Badge>
                {scholarship.isFullyFunded && (
                  <Badge variant="success" className="animate-pulse-custom">منحة ممولة بالكامل</Badge>
                )}
                <Badge variant="outline" className="text-white border-white/40">
                  {getCategoryName(scholarship.categoryId)}
                </Badge>
              </div>
              
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight drop-shadow-sm">
                {scholarship.title}
              </h1>
              
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white">
                <Calendar className="mr-2 h-5 w-5 text-accent" />
                <span>الموعد النهائي: <span className="font-semibold">{scholarship.deadline || 'مفتوح'}</span></span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20">
        {/* Key information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-xl transform transition-all duration-300 hover:-translate-y-1 hover:shadow-accent/10">
            <CardContent className="p-5">
              <div className="flex items-center mb-2">
                <Globe className="h-5 w-5 text-primary mr-2" />
                <h3 className="font-semibold">الدولة المضيفة</h3>
              </div>
              <p className="text-lg font-medium">{getCountryName(scholarship.countryId)}</p>
            </CardContent>
          </Card>
          
          <Card className="shadow-xl transform transition-all duration-300 hover:-translate-y-1 hover:shadow-accent/10">
            <CardContent className="p-5">
              <div className="flex items-center mb-2">
                <GraduationCap className="h-5 w-5 text-primary mr-2" />
                <h3 className="font-semibold">المستوى الدراسي</h3>
              </div>
              <p className="text-lg font-medium">{getLevelName(scholarship.levelId)}</p>
            </CardContent>
          </Card>
          
          <Card className="shadow-xl transform transition-all duration-300 hover:-translate-y-1 hover:shadow-accent/10">
            <CardContent className="p-5">
              <div className="flex items-center mb-2">
                <DollarSign className="h-5 w-5 text-primary mr-2" />
                <h3 className="font-semibold">التمويل</h3>
              </div>
              <p className="text-lg font-medium">{scholarship.amount || 'متنوع'}</p>
            </CardContent>
          </Card>
        </div>
        
        {/* Scholarship details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2">
            <Card className="shadow-xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-6 border-b border-gray-200 pb-4">
                  وصف المنحة
                </h2>
                <div className="prose max-w-none">
                  <p className="mb-6 text-gray-800 leading-relaxed">{scholarship.description}</p>
                  
                  {scholarship.content && (
                    <div className="scholarship-content mb-6">
                      <div 
                        className="prose max-w-none text-gray-800 leading-relaxed rtl:text-right" 
                        dangerouslySetInnerHTML={{ __html: scholarship.content }}
                        dir="rtl"
                      ></div>
                    </div>
                  )}
                  
                  {scholarship.requirements && (
                    <div className="bg-primary/5 rounded-lg p-6 border-r-4 border-primary my-6">
                      <h3 className="text-xl font-bold mb-3 text-primary">متطلبات المنحة</h3>
                      <p className="mb-0 text-gray-800">{scholarship.requirements}</p>
                    </div>
                  )}
                  
                  <div className="mt-8 space-y-4">
                    <a 
                      href={scholarship.applicationLink ?? ""} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <Button size="lg" className="w-full sm:w-auto group bg-gradient-to-r from-primary to-primary hover:shadow-lg transition-all">
                        <span className="flex items-center gap-2">
                          قدم الآن 
                          <ExternalLink className="h-4 w-4 transform transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                        </span>
                      </Button>
                    </a>
                    
                    <Button variant="outline" size="lg" className="w-full sm:w-auto mt-2 sm:mt-0 sm:mr-4">
                      <Calendar className="mr-2 h-4 w-4" /> أضف إلى التقويم
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-primary/5 to-white shadow-xl">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-4 text-primary">المواعيد المهمة</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                    <span className="text-gray-600">الموعد النهائي للتقديم:</span>
                    <span className="font-medium bg-accent/10 text-accent px-3 py-1 rounded-full">
                      {scholarship.deadline || 'مفتوح'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-white to-primary/5 shadow-xl">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-4 text-primary">شارك هذه المنحة</h3>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" className="flex-1 border-primary/20 hover:bg-primary/5">
                    فيسبوك
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 border-primary/20 hover:bg-primary/5">
                    تويتر
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 border-primary/20 hover:bg-primary/5">
                    البريد الإلكتروني
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-xl">
              <CardContent className="p-6">
                <div className="rounded-lg bg-accent/10 p-4 border-r-4 border-accent mb-2">
                  <h4 className="font-bold text-accent mb-1">معلومة مفيدة</h4>
                  <p className="text-sm">تأكد من تجهيز جميع المستندات المطلوبة قبل التقديم لزيادة فرصك في القبول.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Related scholarships */}
        {relatedScholarships && relatedScholarships.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center mb-6">
              <div className="h-1 w-6 bg-primary mr-3 rounded-full"></div>
              <h2 className="text-2xl font-bold">منح دراسية ذات صلة</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedScholarships
                .filter(s => s.id !== scholarship.id)
                .slice(0, 3)
                .map(relatedScholarship => (
                  <Card key={relatedScholarship.id} className="group overflow-hidden transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={relatedScholarship.imageUrl || "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3"}
                        alt={relatedScholarship.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                    </div>
                    <CardContent className="p-5">
                      <Link href={`/scholarships/${relatedScholarship.slug}`}>
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors duration-300 mb-2">
                          {relatedScholarship.title}
                        </h3>
                      </Link>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                          {getCountryName(relatedScholarship.countryId)}
                        </Badge>
                        <Link href={`/scholarships/${relatedScholarship.slug}`}>
                          <span className="text-sm font-medium text-primary hover:text-primary-700 transition-colors duration-300 inline-flex items-center">
                            التفاصيل
                            <ArrowRight className="ml-1 h-3 w-3" />
                          </span>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        )}
        
        {/* Application resources */}
        <div className="mb-12">
          <Card className="bg-gradient-to-r from-gray-50 to-white shadow-xl overflow-hidden">
            <CardContent className="p-8">
              <div className="flex items-start mb-6 border-b border-gray-100 pb-4">
                <FileText className="h-8 w-8 text-primary mr-4 mt-1" />
                <div>
                  <h3 className="text-xl font-bold mb-2 text-gray-900">مصادر التقديم</h3>
                  <p className="text-gray-600">تصفح دليلنا حول كيفية التقديم بنجاح للمنح الدراسية</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <Link href="/articles/how-to-write-winning-scholarship-essay">
                  <Button variant="outline" className="w-full justify-start hover:bg-primary/5 border-primary/10">
                    <FileText className="mr-2 h-4 w-4 text-primary" />
                    كتابة مقال منحة ناجح
                  </Button>
                </Link>
                <Link href="/articles/common-scholarship-application-mistakes">
                  <Button variant="outline" className="w-full justify-start hover:bg-primary/5 border-primary/10">
                    <FileText className="mr-2 h-4 w-4 text-primary" />
                    الأخطاء الشائعة في التقديم
                  </Button>
                </Link>
                <Link href="/articles/how-to-prepare-scholarship-interview">
                  <Button variant="outline" className="w-full justify-start hover:bg-primary/5 border-primary/10">
                    <FileText className="mr-2 h-4 w-4 text-primary" />
                    الاستعداد للمقابلة
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Newsletter />
      </div>
    </main>
  );
};

export default ScholarshipDetail;
