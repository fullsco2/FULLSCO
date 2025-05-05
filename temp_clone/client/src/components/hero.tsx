import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { 
  Search, GraduationCap, BookOpen, Building, DollarSign, 
  Globe, Award, Sparkles, MoveRight, ArrowRight, Zap, 
  CalendarClock, Briefcase, ArrowUpRight, Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface HeroProps {
  title?: string;
  subtitle?: string;
  description?: string;
}

const Hero = ({ 
  title, // تحديد القيمة من الخارج عن طريق البروبس
  subtitle,
  description
}: HeroProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [, navigate] = useLocation();
  const [animateSearch, setAnimateSearch] = useState(false);

  // تفعيل تأثير تحريك البحث عند تحميل الصفحة
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimateSearch(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/scholarships?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  // قائمة المنح المميزة للتحريك في الخلفية
  const featuredScholarships = [
    "منحة فولبرايت للدراسة في الولايات المتحدة",
    "منح جامعة كامبريدج للطلاب الدوليين",
    "منحة مؤسسة DAAD الألمانية",
    "منح إيراسموس موندوس الأوروبية",
    "منح الأغا خان للدراسات العليا",
    "برنامج منح شيفنينج البريطانية",
  ];

  return (
    <section className="relative isolate overflow-hidden bg-gradient-to-br from-primary/95 via-primary to-primary/90 py-20 md:py-28 lg:py-32 border-b border-white/10">
      {/* خلفية متطورة */}
      <div aria-hidden="true" className="absolute inset-0 z-0">
        {/* نمط شبكي */}
        <div className="absolute inset-0 opacity-10">
          <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="hero-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(30)">
                <rect x="0" y="0" width="1" height="1" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hero-pattern)" />
          </svg>
        </div>
        
        {/* أشكال الخلفية */}
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute top-1/2 -right-28 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute -bottom-20 left-1/3 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
        
        {/* تأثير الحركة في الخلفية */}
        <div className="absolute left-0 right-0 top-20 -z-10 hidden opacity-20 lg:block">
          <div className="marquee">
            <div className="marquee__content">
              {featuredScholarships.map((scholarship, index) => (
                <div key={index} className="mx-4 rounded-lg bg-white/10 px-4 py-1 text-sm font-medium text-white backdrop-blur-sm">
                  {scholarship}
                </div>
              ))}
            </div>
            <div className="marquee__content" aria-hidden="true">
              {featuredScholarships.map((scholarship, index) => (
                <div key={`duplicate-${index}`} className="mx-4 rounded-lg bg-white/10 px-4 py-1 text-sm font-medium text-white backdrop-blur-sm">
                  {scholarship}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="gap-12 lg:flex lg:items-center">
          {/* المحتوى النصي */}
          <div className="mx-auto mb-12 max-w-3xl text-center lg:mb-0 lg:text-right lg:w-1/2">
            <div className="mb-4 inline-flex items-center justify-center rounded-full bg-white/10 px-3 py-1 backdrop-blur-sm lg:justify-start">
              <span className="animate-pulse mr-2 h-2 w-2 rounded-full bg-accent"></span>
              <span className="text-sm font-medium text-white">FULLSCO - معًا نحو مستقبل أفضل</span>
            </div>
            
            <h1 className="mb-3 text-4xl font-black tracking-tight text-white sm:text-5xl md:text-6xl md:leading-tight">
              <span className="relative">
                {title}
                <span className="absolute -bottom-2 left-0 right-0 h-1 w-1/3 bg-accent md:h-1.5"></span>
              </span>
            </h1>
            
            {subtitle && (
              <h2 className="mb-4 text-xl text-primary-foreground/90 font-medium md:text-2xl">
                {subtitle}
              </h2>
            )}
            
            <p className="mb-8 text-lg leading-relaxed text-primary-foreground/90 md:text-xl">
              {description}
            </p>
            
            <div className="flex flex-col items-center space-y-4 sm:flex-row sm:justify-center sm:space-x-4 sm:space-y-0 lg:justify-end">
              <Button 
                onClick={() => navigate('/scholarships')}
                size="lg"
                className="group relative inline-flex min-w-44 items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-primary via-primary to-accent p-[2px] text-lg font-semibold transition-all hover:shadow-lg hover:shadow-accent/20"
              >
                <span className="absolute inset-0 overflow-hidden rounded-full opacity-30">
                  <span className="absolute -inset-2 animate-[spin_3s_linear_infinite] bg-gradient-to-r from-accent via-white to-primary opacity-0 group-hover:opacity-100"></span>
                </span>
                <span className="relative flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 transition-all duration-300 group-hover:bg-white/95">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">استكشف المنح</span> 
                  <MoveRight className="h-5 w-5 transform text-accent transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
                </span>
              </Button>
              
              <Button 
                onClick={() => navigate('/articles')}
                variant="outline"
                size="lg"
                className="group inline-flex min-w-44 items-center justify-center gap-2 overflow-hidden rounded-full border-white/50 bg-white/20 px-6 py-3 text-lg font-medium text-white backdrop-blur-sm transition-all hover:bg-white/20 hover:border-white hover:shadow-lg hover:shadow-white/10"
              >
                <span className="relative">دليل التقديم</span>
                <span className="relative flex h-6 w-6 items-center justify-center overflow-hidden rounded-full bg-white/30 group-hover:bg-white/40">
                  <ArrowUpRight className="h-4 w-4 text-white transform transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
                </span>
              </Button>
            </div>
            
            <div className="mt-12 grid grid-cols-2 gap-4 lg:grid-cols-4">
              <Badge className="flex items-center justify-center gap-2 rounded-full bg-white/20 px-4 py-2 text-xs font-medium text-white backdrop-blur-sm">
                <GraduationCap className="h-4 w-4" /> تعليم عالي
              </Badge>
              <Badge className="flex items-center justify-center gap-2 rounded-full bg-white/20 px-4 py-2 text-xs font-medium text-white backdrop-blur-sm">
                <Globe className="h-4 w-4" /> فرص دولية
              </Badge>
              <Badge className="flex items-center justify-center gap-2 rounded-full bg-white/20 px-4 py-2 text-xs font-medium text-white backdrop-blur-sm">
                <DollarSign className="h-4 w-4" /> منح مجانية
              </Badge>
              <Badge className="flex items-center justify-center gap-2 rounded-full bg-white/20 px-4 py-2 text-xs font-medium text-white backdrop-blur-sm">
                <Zap className="h-4 w-4" /> تحديثات يومية
              </Badge>
            </div>
          </div>
          
          {/* مربع البحث والبطاقات */}
          <div className="lg:w-1/2">
            <div className={`mx-auto max-w-md transform rounded-2xl bg-white/15 p-7 shadow-2xl backdrop-blur-xl transition-all duration-700 lg:mx-0 ${animateSearch ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <div className="absolute -left-4 -top-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-lg">
                <Search className="h-6 w-6 text-primary" />
              </div>
              
              <form onSubmit={handleSearch} className="mb-6">
                <h3 className="mb-4 text-center text-xl font-bold text-white">البحث عن المنح الدراسية</h3>
                <div className="relative flex items-stretch w-full">
                  <Input
                    type="text"
                    placeholder="ابحث عن المنح حسب الكلمات المفتاحية..."
                    className="h-14 flex-grow rounded-r-xl rounded-l-none border-0 bg-white/95 pr-6 pl-4 py-4 text-foreground shadow-md backdrop-blur-sm focus-visible:ring-2 focus-visible:ring-accent"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Button 
                    type="submit" 
                    className="h-14 rounded-l-xl rounded-r-none bg-white px-6 text-base font-semibold text-primary shadow-lg transition-all hover:bg-white/90 hover:shadow-white/30 border-l border-l-gray-100"
                  >
                    <Search className="h-5 w-5 mr-2" />
                    ابحث
                  </Button>
                </div>
                
                <div className="my-4 flex flex-wrap justify-between gap-2">
                  <div className="text-center text-xs text-white/80">
                    <span>بحث سريع:</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white hover:bg-white/20"
                    onClick={() => setSearchQuery('منح مجانية')}
                  >
                    منح مجانية
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white hover:bg-white/20"
                    onClick={() => setSearchQuery('تمويل كامل')}
                  >
                    تمويل كامل
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white hover:bg-white/20"
                    onClick={() => setSearchQuery('منح الدكتوراه')}
                  >
                    منح الدكتوراه
                  </Button>
                </div>
                
                <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <Button 
                    variant="ghost" 
                    className="group flex h-auto flex-col items-center justify-center gap-1 rounded-xl border border-white/30 bg-white/10 px-3 py-3 text-white backdrop-blur-sm transition-all hover:bg-white/20"
                    onClick={() => navigate('/scholarships?level=phd')}
                  >
                    <GraduationCap className="h-6 w-6 transition-transform group-hover:scale-110" />
                    <span className="block text-xs font-medium">الدكتوراه</span>
                  </Button>
                  <Button 
                    variant="ghost"
                    className="group flex h-auto flex-col items-center justify-center gap-1 rounded-xl border border-white/30 bg-white/10 px-3 py-3 text-white backdrop-blur-sm transition-all hover:bg-white/20"
                    onClick={() => navigate('/scholarships?level=masters')}
                  >
                    <BookOpen className="h-6 w-6 transition-transform group-hover:scale-110" />
                    <span className="block text-xs font-medium">الماجستير</span>
                  </Button>
                  <Button 
                    variant="ghost"
                    className="group flex h-auto flex-col items-center justify-center gap-1 rounded-xl border border-white/30 bg-white/10 px-3 py-3 text-white backdrop-blur-sm transition-all hover:bg-white/20"
                    onClick={() => navigate('/scholarships?level=bachelor')}
                  >
                    <Building className="h-6 w-6 transition-transform group-hover:scale-110" />
                    <span className="block text-xs font-medium">البكالوريوس</span>
                  </Button>
                  <Button 
                    variant="ghost"
                    className="group flex h-auto flex-col items-center justify-center gap-1 rounded-xl border border-white/30 bg-white/10 px-3 py-3 text-white backdrop-blur-sm transition-all hover:bg-white/20"
                    onClick={() => navigate('/scholarships?funding=full')}
                  >
                    <DollarSign className="h-6 w-6 transition-transform group-hover:scale-110" />
                    <span className="block text-xs font-medium">تمويل كامل</span>
                  </Button>
                </div>
              </form>
            </div>
            
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="group relative overflow-hidden rounded-xl border border-white/5 bg-gradient-to-br from-white/20 to-white/5 p-4 backdrop-blur-lg transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-xl">
                <div className="absolute -right-6 -top-6 h-16 w-16 rounded-full bg-accent/20 opacity-50 blur-xl transition-all duration-300 group-hover:bg-accent/30 group-hover:opacity-80"></div>
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-tr from-white/20 to-white/5 text-white transition-transform duration-300 group-hover:scale-110 group-hover:shadow-lg">
                  <Award className="h-6 w-6" />
                </div>
                <p className="text-xl font-bold text-white transition-transform duration-200 group-hover:scale-105 group-hover:text-accent-foreground">+1000</p>
                <p className="text-xs text-white/90 transition-all duration-200 group-hover:text-white">منحة متاحة</p>
              </div>
              
              <div className="group relative overflow-hidden rounded-xl border border-white/5 bg-gradient-to-br from-white/20 to-white/5 p-4 backdrop-blur-lg transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-xl">
                <div className="absolute -right-6 -top-6 h-16 w-16 rounded-full bg-primary/20 opacity-50 blur-xl transition-all duration-300 group-hover:bg-primary/30 group-hover:opacity-80"></div>
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-tr from-white/20 to-white/5 text-white transition-transform duration-300 group-hover:scale-110 group-hover:shadow-lg">
                  <Globe className="h-6 w-6" />
                </div>
                <p className="text-xl font-bold text-white transition-transform duration-200 group-hover:scale-105 group-hover:text-primary-foreground">+50</p>
                <p className="text-xs text-white/90 transition-all duration-200 group-hover:text-white">دولة حول العالم</p>
              </div>
              
              <div className="group relative overflow-hidden rounded-xl border border-white/5 bg-gradient-to-br from-white/20 to-white/5 p-4 backdrop-blur-lg transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-xl">
                <div className="absolute -right-6 -top-6 h-16 w-16 rounded-full bg-accent/20 opacity-50 blur-xl transition-all duration-300 group-hover:bg-accent/30 group-hover:opacity-80"></div>
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-tr from-white/20 to-white/5 text-white transition-transform duration-300 group-hover:scale-110 group-hover:shadow-lg">
                  <Target className="h-6 w-6" />
                </div>
                <p className="text-xl font-bold text-white transition-transform duration-200 group-hover:scale-105 group-hover:text-accent-foreground">+200</p>
                <p className="text-xs text-white/90 transition-all duration-200 group-hover:text-white">قصة نجاح</p>
              </div>
              
              <div className="group relative overflow-hidden rounded-xl border border-white/5 bg-gradient-to-br from-white/20 to-white/5 p-4 backdrop-blur-lg transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-xl">
                <div className="absolute -right-6 -top-6 h-16 w-16 rounded-full bg-primary/20 opacity-50 blur-xl transition-all duration-300 group-hover:bg-primary/30 group-hover:opacity-80"></div>
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-tr from-white/20 to-white/5 text-white transition-transform duration-300 group-hover:scale-110 group-hover:shadow-lg">
                  <CalendarClock className="h-6 w-6" />
                </div>
                <p className="text-xl font-bold text-white transition-transform duration-200 group-hover:scale-105 group-hover:text-primary-foreground">+100</p>
                <p className="text-xs text-white/90 transition-all duration-200 group-hover:text-white">مقال إرشادي</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* تأثير ضوئي في الزاوية السفلية */}
      <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-accent/30 opacity-30 blur-3xl"></div>
      <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-primary/20 opacity-60 blur-3xl"></div>
    </section>
  );
};

export default Hero;
