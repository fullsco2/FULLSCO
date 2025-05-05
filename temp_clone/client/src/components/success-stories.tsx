import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { ArrowRight, Quote, Award, ArrowUpRight, GraduationCap, MapPin, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { SuccessStory } from '@shared/schema';

interface SuccessStoriesResponse {
  success: boolean;
  data: SuccessStory[];
}

const SuccessStories = () => {
  const { data, isLoading, error } = useQuery<SuccessStoriesResponse>({
    queryKey: ['/api/success-stories'],
  });
  
  // Extract the actual stories array from the response
  const stories = data?.data || [];

  if (isLoading) {
    return (
      <section className="relative overflow-hidden bg-gradient-to-b from-muted/50 to-muted/30 py-16">
        <div className="absolute inset-0 z-0 opacity-5">
          <svg className="absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
            <defs>
              <pattern id="pattern-circles" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse" patternContentUnits="userSpaceOnUse">
                <circle id="pattern-circle" cx="10" cy="10" r="1.6257413380501518" fill="currentColor"></circle>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#pattern-circles)"></rect>
          </svg>
        </div>

        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">قصص النجاح</h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">قصص ملهمة من طلاب تمكنوا من الحصول على منح دراسية والتفوق في مسيرتهم الأكاديمية</p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-2">
            {[1, 2].map((i) => (
              <Card key={i} className="animate-pulse overflow-hidden border-0 shadow-lg">
                <div className="flex flex-col md:flex-row">
                  <div className="h-64 bg-muted md:h-full md:w-2/5"></div>
                  <div className="relative p-6 md:w-3/5">
                    <div className="absolute right-6 top-6 h-8 w-8 rounded-full bg-muted/70"></div>
                    <div className="mb-2 h-6 w-32 rounded-full bg-muted"></div>
                    <div className="mb-3 h-8 w-3/4 rounded bg-muted"></div>
                    <div className="mb-2 h-5 w-1/2 rounded bg-muted"></div>
                    <div className="mb-2 h-4 w-full rounded bg-muted"></div>
                    <div className="mb-2 h-4 w-full rounded bg-muted"></div>
                    <div className="mb-2 h-4 w-3/4 rounded bg-muted"></div>
                    <div className="mt-4 h-8 w-32 rounded-lg bg-muted"></div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error || !stories || stories.length === 0) {
    return (
      <section className="relative overflow-hidden bg-gradient-to-b from-muted/50 to-muted/30 py-16">
        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">قصص النجاح</h2>
            <p className="mx-auto mb-6 max-w-2xl text-muted-foreground">قصص ملهمة من طلاب تمكنوا من الحصول على منح دراسية والتفوق في مسيرتهم الأكاديمية</p>
            {error && <p className="text-destructive">فشل في تحميل قصص النجاح. يرجى المحاولة مرة أخرى لاحقاً.</p>}
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
              className="mt-4 rounded-full"
            >
              إعادة المحاولة
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-muted/50 to-muted/30 py-16">
      {/* خلفية مزخرفة */}
      <div className="absolute inset-0 z-0 opacity-5">
        <svg className="absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
          <defs>
            <pattern id="pattern-circles" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse" patternContentUnits="userSpaceOnUse">
              <circle id="pattern-circle" cx="10" cy="10" r="1.6257413380501518" fill="currentColor"></circle>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#pattern-circles)"></rect>
        </svg>
      </div>

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="mb-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl">قصص النجاح والإلهام</h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">قصص ملهمة من طلاب تمكنوا من الحصول على منح دراسية والتفوق في مسيرتهم الأكاديمية</p>
        </div>
        
        <div className="grid gap-8 md:grid-cols-2">
          {stories.slice(0, 2).map((story) => (
            <Card key={story.id} className="group overflow-hidden border-0 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
              <div className="flex flex-col md:flex-row">
                <div className="relative overflow-hidden md:w-2/5">
                  <div className="image-hover h-64 md:h-full">
                    <img 
                      src={story.imageUrl || "https://plus.unsplash.com/premium_photo-1661355405503-ef50bc031f8e"}
                      alt={story.name}
                      className="h-full w-full object-cover object-center"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  
                  {/* Info badges at the bottom of the image */}
                  <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
                    <Badge className="bg-accent/90 text-xs font-medium text-white shadow-md">
                      <MapPin className="mr-1 h-3 w-3" /> {story.scholarshipName ? 'دولية' : 'محلية'}
                    </Badge>
                    
                    <Badge className="bg-primary/90 text-xs font-medium text-white shadow-md">
                      <GraduationCap className="mr-1 h-3 w-3" /> دراسة
                    </Badge>
                  </div>
                  
                  {/* وسام النجاح */}
                  <div className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-md backdrop-blur-sm">
                    <Award className="h-6 w-6 text-primary" />
                  </div>
                </div>
                
                <div className="relative p-6 md:w-3/5">
                  {/* علامة الاقتباس */}
                  <Quote className="absolute left-6 top-[-15px] h-8 w-8 rotate-180 text-muted-foreground/20" />
                  
                  <div className="mb-6">
                    <Badge 
                      variant="outline" 
                      className="mb-3 border-primary/20 font-medium text-primary"
                    >
                      {story.scholarshipName}
                    </Badge>
                    
                    <h3 className="mb-2 text-2xl font-bold group-hover:text-primary">
                      {story.name}
                    </h3>
                    
                    <p className="mb-3 text-sm font-medium text-muted-foreground">
                      {story.title}
                    </p>
                    
                    <p className="text-muted-foreground line-clamp-4">
                      {story.content}
                    </p>
                  </div>
                  
                  <Link href={`/success-stories/${story.slug}`}>
                    <Button 
                      variant="outline" 
                      className="group/btn flex items-center gap-2 rounded-full border-primary/20 text-primary hover:bg-primary hover:text-white"
                    >
                      اقرأ القصة كاملة
                      <ChevronLeft className="h-4 w-4 transform transition-transform group-hover/btn:-translate-x-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <Link href="/success-stories">
            <Button 
              variant="outline" 
              className="group mx-auto inline-flex items-center gap-2 rounded-full border-primary px-6 py-2.5 font-medium text-primary hover:bg-primary hover:text-white"
            >
              المزيد من قصص النجاح
              <ArrowRight className="h-4 w-4 rotate-180 transform transition-transform group-hover:-translate-x-1" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default SuccessStories;
