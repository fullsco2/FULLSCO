import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { ArrowRight, DollarSign, Calendar, MapPin, Award, ChevronLeft, GraduationCap, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Scholarship, Level, Country } from '@shared/schema';

const FeaturedScholarships = () => {
  const { data: scholarships, isLoading, error } = useQuery<Scholarship[]>({
    queryKey: ['/api/scholarships/featured'],
  });

  const { data: levelsResponse } = useQuery<{ success: boolean, data: Level[] }>({
    queryKey: ['/api/levels'],
  });
  
  const levels = levelsResponse?.data || [];

  const { data: countriesResponse } = useQuery<{ success: boolean, data: Country[] }>({
    queryKey: ['/api/countries'],
  });
  
  const countries = countriesResponse?.data || [];

  const getCountryName = (countryId: number | null | undefined) => {
    if (!countryId || !countries) return '';
    const country = countries.find(c => c.id === countryId);
    return country?.name || '';
  };

  const getLevelName = (levelId: number | null | undefined) => {
    if (!levelId || !levels) return '';
    const level = levels.find(l => l.id === levelId);
    return level?.name || '';
  };

  if (isLoading) {
    return (
      <section className="bg-gradient-to-b from-background to-muted/30 py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-bold sm:text-4xl">المنح الدراسية المميزة</h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">اكتشف أفضل فرص المنح الدراسية المتاحة حاليًا لمختلف المستويات والتخصصات</p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse overflow-hidden border-0 shadow-md">
                <div className="h-48 bg-muted"></div>
                <CardContent className="p-6">
                  <div className="h-5 w-24 rounded-full bg-muted"></div>
                  <div className="mt-3 h-7 w-4/5 rounded bg-muted"></div>
                  <div className="mt-3 h-4 w-full rounded bg-muted"></div>
                  <div className="mt-2 h-4 w-full rounded bg-muted"></div>
                  <div className="mt-4 flex gap-2">
                    <div className="h-6 w-24 rounded-full bg-muted"></div>
                    <div className="h-6 w-24 rounded-full bg-muted"></div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between border-t bg-muted/20 p-4">
                  <div className="h-5 w-32 rounded bg-muted"></div>
                  <div className="h-5 w-24 rounded bg-muted"></div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error || !scholarships) {
    return (
      <section className="bg-gradient-to-b from-background to-muted/30 py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">المنح الدراسية المميزة</h2>
            <p className="mx-auto mb-6 max-w-xl text-muted-foreground">فشل في تحميل المنح الدراسية. يرجى المحاولة مرة أخرى لاحقاً.</p>
            <Button variant="outline" onClick={() => window.location.reload()}>إعادة المحاولة</Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-gradient-to-b from-background to-muted/30 py-20 border-b border-border/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <div className="relative inline-block">
            <h2 className="mb-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-3xl font-bold text-transparent sm:text-4xl md:text-5xl">المنح الدراسية المميزة</h2>
            <div className="absolute -bottom-2 left-1/4 right-1/4 h-1 rounded bg-gradient-to-r from-primary to-accent opacity-70"></div>
          </div>
          <p className="mx-auto max-w-3xl text-lg text-muted-foreground">اكتشف أفضل فرص المنح الدراسية المتاحة حاليًا لمختلف المستويات والتخصصات</p>
        </div>
        
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {scholarships.map((scholarship) => (
            <Card key={scholarship.id} className="group card-shadow-hover relative overflow-hidden rounded-xl border-0 bg-white shadow-lg transition-all duration-500 dark:bg-gray-900/90">
              <div className="relative overflow-hidden">
                <div className="overflow-hidden">
                  <img 
                    src={scholarship.imageUrl || "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3"}
                    alt={scholarship.title}
                    className="h-52 w-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-110"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                
                {/* Badges */}
                <div className="absolute bottom-0 left-0 right-0 flex justify-between p-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-primary/90 text-xs font-medium text-white hover:bg-primary">
                      <GraduationCap className="mr-1 h-3 w-3" /> {getLevelName(scholarship.levelId)}
                    </Badge>
                    
                    <Badge className="bg-accent/90 text-xs font-medium text-white hover:bg-accent">
                      <MapPin className="mr-1 h-3 w-3" /> {getCountryName(scholarship.countryId)}
                    </Badge>
                  </div>
                  
                  {scholarship.isFullyFunded && (
                    <Badge className="bg-green-600/90 text-xs font-medium text-white">
                      <Award className="mr-1 h-3 w-3" /> تمويل كامل
                    </Badge>
                  )}
                </div>
                
                {/* Deadline sticker */}
                {scholarship.deadline && (
                  <div className="absolute -left-12 top-5 transform rotate-[-45deg] bg-gradient-to-r from-primary to-accent py-1 px-12 text-center text-xs font-semibold text-white shadow-md transition-all duration-300 group-hover:from-accent group-hover:to-primary">
                    <span className="block transform rotate-[0deg]">الموعد النهائي: {scholarship.deadline}</span>
                  </div>
                )}
              </div>
              
              <CardContent className="p-6">
                <h3 className="mb-3 text-xl font-bold transition-colors group-hover:text-primary">
                  <Link href={`/scholarships/${scholarship.slug}`} className="block">
                    {scholarship.title}
                  </Link>
                </h3>
                
                <p className="mb-4 text-sm text-muted-foreground line-clamp-3">
                  {scholarship.description}
                </p>
                
                <div className="mt-4 flex flex-wrap gap-2">
                  {scholarship.deadline && (
                    <div className="flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                      <Calendar className="mr-1 h-3 w-3" /> {scholarship.deadline}
                    </div>
                  )}
                  
                  <div className="flex items-center rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
                    <DollarSign className="mr-1 h-3 w-3" /> {scholarship.amount || 'قيمة متغيرة'}
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="flex items-center justify-between border-t border-border/30 bg-muted/5 p-4">
                <Link href={`/scholarships/${scholarship.slug}`}>
                  <Button variant="ghost" size="sm" className="group/btn relative overflow-hidden rounded-full gap-1 text-xs font-medium text-primary hover:bg-primary/10 hover:text-primary">
                    <span className="relative z-10">تفاصيل المنحة</span>
                    <ChevronLeft className="relative z-10 h-4 w-4 transform transition-transform group-hover/btn:-translate-x-1" />
                    <span className="absolute inset-0 -z-10 bg-primary/5 opacity-0 transition-opacity group-hover/btn:opacity-100"></span>
                  </Button>
                </Link>
                
                {scholarship.applicationLink && (
                  <a href={scholarship.applicationLink} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" className="group/apply rounded-full gap-1 bg-gradient-to-r from-accent to-primary text-xs font-medium text-white transition-all duration-300 hover:shadow-md hover:shadow-accent/20 hover:from-primary hover:to-accent">
                      <span>التقديم</span>
                      <ExternalLink className="h-3 w-3 transition-transform group-hover/apply:translate-x-0.5 group-hover/apply:-translate-y-0.5" />
                    </Button>
                  </a>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
        
        <div className="mt-16 text-center">
          <Link href="/scholarships">
            <Button variant="outline" className="group relative mx-auto inline-flex items-center gap-2 overflow-hidden rounded-full border-2 border-primary/30 px-8 py-3 font-medium text-primary transition-all duration-300 hover:border-primary hover:bg-primary/5 hover:text-primary hover:shadow-md">
              <span className="relative z-10">عرض جميع المنح الدراسية</span>
              <ArrowRight className="relative z-10 h-5 w-5 rotate-180 transform transition-transform duration-300 group-hover:-translate-x-1" />
              <span className="absolute inset-0 -z-10 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100"></span>
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedScholarships;
