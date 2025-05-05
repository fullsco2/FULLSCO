import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, ArrowLeft, User } from 'lucide-react';
import PageHeader from '@/components/page-header';
import Container from '@/components/ui/container';
import { formatDate } from '@/lib/utils';

export default function SuccessStories() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // تعريف نوع بيانات استجابة API لقصص النجاح
  interface SuccessStoriesResponse {
    success: boolean;
    data: any[];
    message?: string;
  }

  const { data: storiesResponse, isLoading, error } = useQuery<SuccessStoriesResponse>({
    queryKey: ['/api/success-stories'],
    queryFn: async () => {
      const response = await fetch('/api/success-stories');
      if (!response.ok) {
        throw new Error('Failed to fetch success stories');
      }
      return response.json();
    },
    enabled: isClient,
  });
  
  // استخراج قصص النجاح من الاستجابة
  const stories = storiesResponse?.success && Array.isArray(storiesResponse.data) 
    ? storiesResponse.data 
    : [];

  if (!isClient) {
    return null;
  }

  return (
    <>
      <Helmet>
        <title>قصص النجاح | FULLSCO</title>
        <meta name="description" content="استمتع بقراءة قصص نجاح طلابنا الذين حصلوا على منح دراسية عالمية" />
      </Helmet>

      <PageHeader
        title="قصص النجاح"
        description="تجارب حقيقية للطلاب الذين حصلوا على منح دراسية حول العالم"
      />

      <Container className="py-8 md:py-10">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
            <p>جاري تحميل قصص النجاح...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">حدث خطأ أثناء تحميل قصص النجاح</p>
            <Button onClick={() => window.location.reload()} variant="outline">
              إعادة المحاولة
            </Button>
          </div>
        ) : stories && stories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stories.map((story) => (
              <Link key={story.id} href={`/success-stories/${story.slug}`}>
                <a className="block h-full">
                  <Card className="h-full hover:shadow-md transition-shadow overflow-hidden border-0 shadow-sm">
                    {story.imageUrl && (
                      <div className="relative h-48 w-full overflow-hidden">
                        <img
                          src={story.imageUrl}
                          alt={story.title}
                          className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <CardContent className="p-5">
                      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-3">
                        <div className="flex items-center">
                          <User className="h-4 w-4 ml-1" />
                          <span>{story.name}</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 ml-1" />
                          <span>{formatDate(story.createdAt)}</span>
                        </div>
                      </div>
                      
                      <h2 className="text-xl font-bold mb-2 hover:text-primary transition-colors line-clamp-2">
                        {story.title}
                      </h2>
                      
                      {story.briefContent && (
                        <p className="text-muted-foreground line-clamp-3 mb-4">
                          {story.briefContent}
                        </p>
                      )}
                      
                      <div className="flex items-center text-primary font-medium">
                        قراءة المزيد
                        <ArrowLeft className="h-4 w-4 mr-1" />
                      </div>
                    </CardContent>
                  </Card>
                </a>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">لا توجد قصص نجاح متاحة حاليًا</p>
          </div>
        )}
      </Container>
    </>
  );
}