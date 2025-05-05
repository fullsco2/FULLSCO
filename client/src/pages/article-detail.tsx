import { useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useParams, Link } from 'wouter';
import { queryClient } from '@/lib/queryClient';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Eye, 
  Share2, 
  Bookmark, 
  MessageSquare, 
  Facebook, 
  Twitter, 
  Linkedin, 
  UserCircle 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import Newsletter from '@/components/newsletter';
import { formatDate, getInitials } from '@/lib/utils';
import { Post, User } from '@shared/schema';

const ArticleDetail = () => {
  const { slug } = useParams();
  
  // جلب تفاصيل المقال من خلال الـ slug
  const { data: postResponse, isLoading, error } = useQuery<{ success: boolean, data: Post }>({
    queryKey: [`/api/posts/slug/${slug}`],
  });
  
  // استخراج بيانات المقال من الاستجابة
  const post = postResponse?.data;

  // جلب المستخدمين (المؤلفين)
  const { data: usersResponse } = useQuery<{ success: boolean, data: User[] }>({
    queryKey: ['/api/users'],
  });
  
  // استخراج مصفوفة المستخدمين من الاستجابة
  const users = usersResponse?.data || [];

  // استعلام عن تصنيفات المقال
  const { data: postTags = [] } = useQuery<any[]>({
    queryKey: [`/api/posts/${post?.id}/tags`],
    enabled: !!post?.id, // تأكد من وجود معرف المقال قبل جلب التصنيفات
  });

  // جلب المقالات ذات الصلة
  const { data: relatedPostsResponse } = useQuery<{ success: boolean, data: Post[] }>({
    queryKey: ['/api/posts', { limit: 3 }],
    enabled: !!post?.id, // تأكد من وجود معرف المقال قبل جلب المقالات ذات الصلة
  });
  
  // استخراج مصفوفة المقالات ذات الصلة
  const relatedPosts = relatedPostsResponse?.data || [];

  // Increment view count (this happens automatically on the API side)
  useEffect(() => {
    // Set page metadata
    if (post) {
      document.title = `${post.title} - FULLSCO Blog`;
      
      // Set meta description - handle safely in case content is empty or undefined
      const safeDescription = post.excerpt || (post.content ? post.content.substring(0, 160) : `مقالة: ${post.title}`);
      
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', safeDescription);
      } else {
        const meta = document.createElement('meta');
        meta.name = 'description';
        meta.content = safeDescription;
        document.head.appendChild(meta);
      }
    }
  }, [post]);

  const getAuthorName = (authorId?: number) => {
    if (!authorId || !users) return 'FULLSCO Team';
    const author = users.find(u => u.id === authorId);
    return author?.fullName || 'FULLSCO Team';
  };

  const getReadingTime = (content: string | null | undefined) => {
    // التعامل مع محتوى فارغ أو غير محدد
    if (!content) return 1; // وقت قراءة افتراضي
    
    try {
      const wordsPerMinute = 200;
      const wordCount = content.trim().split(/\s+/).length;
      const readingTime = Math.max(1, Math.ceil(wordCount / wordsPerMinute));
      return readingTime;
    } catch (error) {
      console.error('خطأ في حساب وقت القراءة:', error);
      return 1; // وقت قراءة افتراضي
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="animate-pulse">
          <div className="h-8 w-64 bg-gray-200 rounded mb-4"></div>
          <div className="h-6 w-40 bg-gray-200 rounded mb-8"></div>
          <div className="h-64 bg-gray-200 rounded-lg mb-8"></div>
          <div className="h-4 w-full bg-gray-200 rounded mb-2"></div>
          <div className="h-4 w-full bg-gray-200 rounded mb-2"></div>
          <div className="h-4 w-3/4 bg-gray-200 rounded mb-8"></div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Article Not Found</h1>
        <p className="text-gray-600 mb-8">We couldn't find the article you're looking for.</p>
        <Link href="/articles">
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Articles
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <main className="bg-gray-50 py-12" dir="rtl">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <div className="mb-6">
          <Link href="/articles">
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="ml-2 h-4 w-4" /> العودة للمقالات
            </Button>
          </Link>
          
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {postTags.length > 0 ? (
              postTags.map((tag) => (
                <Badge key={tag.id} variant="secondary" className="mb-1">
                  {tag.name}
                </Badge>
              ))
            ) : (
              <Badge variant="secondary" className="mb-1">مقالات عامة</Badge>
            )}
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{post.title}</h1>
          
          <div className="flex flex-wrap items-center text-sm text-gray-600 mb-8">
            <div className="flex items-center ml-4 mb-2">
              <Calendar className="h-4 w-4 ml-1" /> {formatDate(post.createdAt)}
            </div>
            <div className="flex items-center ml-4 mb-2">
              <Clock className="h-4 w-4 ml-1" /> {getReadingTime(post.content)} دقيقة للقراءة
            </div>
            <div className="flex items-center mb-2">
              <Eye className="h-4 w-4 ml-1" /> {post.views || 0} مشاهدة
            </div>
          </div>
          
          {/* Author */}
          <div className="flex items-center mb-8">
            <Avatar className="h-10 w-10 ml-3">
              <AvatarImage src="https://randomuser.me/api/portraits/men/1.jpg" alt={getAuthorName(post.authorId)} />
              <AvatarFallback>{getInitials(getAuthorName(post.authorId))}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{getAuthorName(post.authorId)}</div>
              <div className="text-sm text-gray-500">خبير المنح الدراسية</div>
            </div>
          </div>
        </div>
        
        {/* Featured image */}
        <div className="rounded-lg overflow-hidden mb-8">
          <img 
            src={post.imageUrl || "https://images.unsplash.com/photo-1517486808906-6ca8b3f8e1c1"}
            alt={post.title}
            className="w-full h-auto object-cover"
          />
        </div>
        
        {/* Article content */}
        <Card className="mb-8">
          <CardContent className="p-6 sm:p-8">
            <div className="prose max-w-none">
              <div className="article-content" dangerouslySetInnerHTML={{ __html: post.content }}></div>
            </div>
            
            {/* Share and save buttons */}
            <div className="flex flex-wrap gap-4 mt-8 pt-6 border-t border-gray-200">
              <Button variant="outline" size="sm" className="flex items-center">
                <Share2 className="h-4 w-4 ml-2" /> مشاركة
              </Button>
              <Button variant="outline" size="sm" className="flex items-center">
                <Bookmark className="h-4 w-4 ml-2" /> حفظ
              </Button>
              <div className="flex items-center mr-auto gap-2">
                <Button variant="outline" size="icon" className="rounded-full h-8 w-8 p-0">
                  <Facebook className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="rounded-full h-8 w-8 p-0">
                  <Twitter className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="rounded-full h-8 w-8 p-0">
                  <Linkedin className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Related articles */}
        {relatedPosts && relatedPosts.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">مقالات ذات صلة</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts
                .filter(p => p.id !== post.id)
                .slice(0, 3)
                .map(relatedPost => (
                  <Card key={relatedPost.id} className="overflow-hidden">
                    <img 
                      src={relatedPost.imageUrl || "https://images.unsplash.com/photo-1517486808906-6ca8b3f8e1c1"}
                      alt={relatedPost.title}
                      className="h-40 w-full object-cover"
                    />
                    <CardContent className="p-4">
                      <h3 className="text-lg font-bold text-gray-900 hover:text-primary mb-2">
                        <Link href={`/articles/${relatedPost.slug}`}>
                          {relatedPost.title}
                        </Link>
                      </h3>
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-3 w-3 ml-1" /> {formatDate(relatedPost.createdAt)}
                        <span className="mx-2">•</span>
                        <UserCircle className="h-3 w-3 ml-1" /> {getAuthorName(relatedPost.authorId)}
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        )}
        
        {/* Newsletter */}
        <Newsletter />
      </div>
    </main>
  );
};

export default ArticleDetail;
