import { useState, useEffect } from 'react';
import { useRoute, Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Calendar, User, Home, ChevronLeft, Share2, Twitter, Facebook, Link2 } from 'lucide-react';
import Container from '@/components/ui/container';
import PageHeader from '@/components/page-header';
import { formatDate } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from '@/hooks/use-toast';

export default function SuccessStoryDetail() {
  const [, params] = useRoute('/success-stories/:slug');
  const slug = params?.slug || '';
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const { data: story, isLoading, error } = useQuery({
    queryKey: ['/api/success-stories/slug', slug],
    queryFn: async () => {
      const response = await fetch(`/api/success-stories/slug/${slug}`);
      if (!response.ok) {
        throw new Error('فشل في تحميل قصة النجاح');
      }
      return response.json();
    },
    enabled: !!slug && isClient,
  });

  // تعامل مع مشاركة قصة النجاح
  const handleShare = async (platform: string) => {
    if (!story) return;

    const url = window.location.href;
    const title = `قصة نجاح: ${story.title}`;

    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'copy':
        try {
          await navigator.clipboard.writeText(url);
          toast({
            title: 'تم نسخ الرابط',
            description: 'تم نسخ رابط قصة النجاح إلى الحافظة',
            variant: 'default',
          });
        } catch (err) {
          toast({
            title: 'فشل في نسخ الرابط',
            description: 'حدث خطأ أثناء محاولة نسخ الرابط',
            variant: 'destructive',
          });
        }
        break;
    }
  };

  if (!isClient) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !story) {
    return (
      <Container>
        <div className="py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">لم يتم العثور على قصة النجاح</h1>
          <p className="text-muted-foreground mb-6">
            عذراً، لم نتمكن من العثور على قصة النجاح المطلوبة.
          </p>
          <Button asChild>
            <Link href="/success-stories">
              <ChevronLeft className="ml-2 h-4 w-4" />
              العودة إلى قصص النجاح
            </Link>
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <>
      <Helmet>
        <title>{story.title} | قصص النجاح | FULLSCO</title>
        <meta name="description" content={story.briefContent || story.title} />
      </Helmet>

      <PageHeader
        title="قصة نجاح"
        description={story.title}
      />
      
      <Container>
        <div className="py-8 md:py-12">
          {/* مسار التنقل */}
          <div className="flex items-center text-sm text-muted-foreground mb-6">
            <Link href="/">
              <span className="hover:text-primary transition-colors flex items-center">
                <Home className="h-4 w-4 ml-1" />
                الرئيسية
              </span>
            </Link>
            <span className="mx-2">/</span>
            <Link href="/success-stories">
              <span className="hover:text-primary transition-colors">قصص النجاح</span>
            </Link>
            <span className="mx-2">/</span>
            <span className="text-foreground font-medium truncate max-w-[200px]">{story.title}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card className="overflow-hidden border-0 shadow-md">
                {story.imageUrl && (
                  <div className="relative aspect-video w-full overflow-hidden">
                    <img
                      src={story.imageUrl}
                      alt={story.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <CardContent className="p-6 md:p-8">
                  <div className="mb-6">
                    <h1 className="text-2xl md:text-3xl font-bold mb-3">{story.title}</h1>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center">
                        <User className="h-4 w-4 ml-1" />
                        <span className="font-medium text-foreground">{story.name}</span>
                      </div>
                      
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 ml-1" />
                        <span>{formatDate(story.createdAt)}</span>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="ml-auto">
                            <Share2 className="h-4 w-4 ml-1" />
                            مشاركة
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleShare('twitter')}>
                            <Twitter className="h-4 w-4 ml-2" />
                            <span>مشاركة على تويتر</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleShare('facebook')}>
                            <Facebook className="h-4 w-4 ml-2" />
                            <span>مشاركة على فيسبوك</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleShare('copy')}>
                            <Link2 className="h-4 w-4 ml-2" />
                            <span>نسخ الرابط</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  
                  {/* محتوى القصة */}
                  <div 
                    className="prose prose-lg max-w-none dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: story.content || '' }} 
                  />
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-1">
              {/* معلومات الطالب */}
              <Card className="mb-6">
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold mb-4">عن الطالب</h2>
                  
                  <div className="flex flex-col space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">الاسم</h3>
                      <p className="font-medium">{story.name}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">الجامعة</h3>
                      <p className="font-medium">{story.university || "غير متوفر"}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">التخصص</h3>
                      <p className="font-medium">{story.major || "غير متوفر"}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">المنحة</h3>
                      <p className="font-medium">{story.scholarship || "غير متوفر"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* الأزرار */}
              <div className="space-y-3">
                <Button asChild className="w-full">
                  <Link href="/scholarships">
                    استكشاف المنح الدراسية
                  </Link>
                </Button>
                
                <Button asChild variant="outline" className="w-full">
                  <Link href="/success-stories">
                    المزيد من قصص النجاح
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </>
  );
}