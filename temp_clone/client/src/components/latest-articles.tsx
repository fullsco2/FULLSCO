import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { ArrowRight, Eye, Clock, Calendar, ChevronLeft, BookOpen, User } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate, getInitials } from '@/lib/utils';
import { Post, User as UserType } from '@shared/schema';

interface PostsResponse {
  success: boolean;
  data: Post[];
}

interface UsersResponse {
  success: boolean;
  data: UserType[];
}

const LatestArticles = () => {
  const { data: postsResponse, isLoading, error } = useQuery<PostsResponse>({
    queryKey: ['/api/posts'],
  });
  
  // Extract the actual posts array from the response
  const posts = postsResponse?.data || [];

  const { data: usersResponse } = useQuery<UsersResponse>({
    queryKey: ['/api/users'],
  });
  
  // Extract the actual users array from the response
  const users = usersResponse?.data || [];

  const getAuthorName = (authorId?: number) => {
    if (!authorId || !users || users.length === 0) return 'فريق FULLSCO';
    const author = users.find(u => u.id === authorId);
    return author?.fullName || 'فريق FULLSCO';
  };

  // رسالة تحميل محسنة
  if (isLoading) {
    return (
      <section className="bg-muted/10 py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-bold sm:text-4xl">أحدث المقالات والإرشادات</h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">دليلك لفهم عملية التقديم على المنح والنصائح المفيدة للطلاب</p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse overflow-hidden border-0 shadow-md">
                <div className="h-52 bg-muted"></div>
                <CardContent className="p-6">
                  <div className="flex gap-2">
                    <div className="h-5 w-16 rounded-full bg-muted"></div>
                    <div className="h-5 w-24 rounded-full bg-muted"></div>
                  </div>
                  <div className="mt-3 h-7 w-4/5 rounded bg-muted"></div>
                  <div className="mt-3 h-4 w-full rounded bg-muted"></div>
                  <div className="mt-2 h-4 w-full rounded bg-muted"></div>
                  <div className="mt-4 flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-muted"></div>
                    <div className="h-4 w-24 rounded bg-muted"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // رسالة خطأ محسنة
  if (error || !posts) {
    return (
      <section className="bg-muted/10 py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">أحدث المقالات والإرشادات</h2>
            <p className="mx-auto mb-6 max-w-xl text-muted-foreground">فشل في تحميل المقالات. يرجى المحاولة مرة أخرى لاحقاً.</p>
            <Button variant="outline" onClick={() => window.location.reload()}>إعادة المحاولة</Button>
          </div>
        </div>
      </section>
    );
  }

  // عرض المقالات
  return (
    <section className="bg-muted/10 py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="mb-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-3xl font-bold text-transparent sm:text-4xl">أحدث المقالات والإرشادات</h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">دليلك لفهم عملية التقديم على المنح والنصائح المفيدة للطلاب</p>
        </div>
        
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {posts.slice(0, 3).map((post) => (
            <Card key={post.id} className="group overflow-hidden border-0 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
              <div className="relative overflow-hidden">
                <div className="image-hover">
                  <img 
                    src="https://images.unsplash.com/photo-1517486808906-6ca8b3f8e1c1"
                    alt={post.title}
                    className="h-52 w-full object-cover transition-transform duration-500"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-70"></div>
                
                {/* Date badge */}
                <div className="absolute right-4 top-4 rounded-lg bg-white/90 px-3 py-1.5 text-xs font-medium text-foreground shadow-md backdrop-blur-sm">
                  <Calendar className="mb-1 mx-auto h-4 w-4 text-primary" />
                  <span className="block text-center">{formatDate(post.createdAt).split(' ')[0]}</span>
                </div>
                
                {/* Views badge */}
                <div className="absolute left-4 top-4 rounded-lg bg-white/90 px-3 py-1.5 text-xs font-medium text-foreground shadow-md backdrop-blur-sm">
                  <Eye className="mb-1 mx-auto h-4 w-4 text-accent" />
                  <span className="block text-center">0</span>
                </div>
                
                {/* Category */}
                <div className="absolute bottom-4 left-0 right-0 text-center">
                  <Badge className="bg-primary/90 px-3 py-1 text-xs font-medium text-white shadow-md">
                    <BookOpen className="mr-1 h-3 w-3" /> دليل إرشادي
                  </Badge>
                </div>
              </div>
              
              <CardContent className="p-6">
                <h3 className="mb-3 line-clamp-2 text-xl font-bold transition-colors group-hover:text-primary">
                  <Link href={`/articles/${post.slug}`}>
                    <div className="block">{post.title}</div>
                  </Link>
                </h3>
                
                <p className="mb-4 text-sm text-muted-foreground line-clamp-3">
                  {post.excerpt || post.content?.substring(0, 150) + '...'}
                </p>
              </CardContent>
              
              <CardFooter className="flex items-center justify-between border-t bg-muted/5 p-4">
                <div className="flex items-center">
                  <Avatar className="mr-2 h-8 w-8 border-2 border-primary/10">
                    <AvatarImage alt={getAuthorName(post.authorId)} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getInitials(getAuthorName(post.authorId))}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{getAuthorName(post.authorId)}</span>
                </div>
                
                <Link href={`/articles/${post.slug}`}>
                  <Button variant="ghost" size="sm" className="group/btn gap-1 p-0 text-xs font-medium text-primary hover:bg-transparent hover:text-primary">
                    اقرأ المزيد
                    <ChevronLeft className="h-4 w-4 transform transition-transform group-hover/btn:-translate-x-1" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <Link href="/articles">
            <Button variant="outline" className="group mx-auto inline-flex items-center gap-2 rounded-full border-primary px-6 py-2.5 font-medium text-primary hover:bg-primary hover:text-white">
              تصفح جميع المقالات
              <ArrowRight className="h-4 w-4 rotate-180 transform transition-transform group-hover:-translate-x-1" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default LatestArticles;
