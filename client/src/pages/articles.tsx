import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useLocation } from 'wouter';
import { ArrowRight } from 'lucide-react';
import { Eye, Calendar, UserCircle, Tag, Bookmark, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import SearchBar from '@/components/search-bar';
import { formatDate } from '@/lib/utils';
import { Post, User, Tag as TagType } from '@shared/schema';
import { Helmet } from 'react-helmet';
import { apiRequest } from '@/lib/queryClient';

const Articles = () => {
  const [location, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  
  // معالجة معلمات البحث في URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.split('?')[1]);
    const search = searchParams.get('search');
    if (search) setSearchTerm(search);
  }, [location]);

  // جلب المقالات
  const { data: postsResponse, isLoading } = useQuery<{ success: boolean, data: Post[] }>({
    queryKey: ['/api/posts'],
  });
  
  // استخراج مصفوفة المقالات من الاستجابة
  const posts = postsResponse?.data || [];

  // جلب المستخدمين (المؤلفين)
  const { data: usersResponse } = useQuery<{ success: boolean, data: User[] }>({
    queryKey: ['/api/users'],
  });
  
  const users = usersResponse?.data || [];
  
  // جلب التصنيفات
  const { data: tagsResponse } = useQuery<{ success: boolean, data: TagType[] }>({
    queryKey: ['/api/tags'],
  });
  
  const tags = tagsResponse?.data || [];
  
  // الحصول على تصنيفات المقال
  const [postTagsMap, setPostTagsMap] = useState<Record<number, TagType[]>>({});
  
  useEffect(() => {
    const fetchPostTags = async () => {
      if (posts && posts.length > 0) {
        const tagsMap: Record<number, TagType[]> = {};
        
        for (const post of posts) {
          try {
            const response = await fetch(`/api/posts/${post.id}/tags`);
            if (response.ok) {
              const data = await response.json();
              tagsMap[post.id] = data;
            } else {
              console.error(`Error fetching tags for post ${post.id}: ${response.status}`);
              tagsMap[post.id] = [];
            }
          } catch (error) {
            console.error(`Error fetching tags for post ${post.id}:`, error);
            tagsMap[post.id] = [];
          }
        }
        
        setPostTagsMap(tagsMap);
      }
    };
    
    fetchPostTags();
  }, [posts]);

  // الحصول على اسم المؤلف
  const getAuthorName = (authorId?: number) => {
    if (!authorId || !users) return 'فريق FULLSCO';
    const author = users.find(u => u.id === authorId);
    return author?.fullName || 'فريق FULLSCO';
  };
  
  // تصفية المقالات بناءً على مصطلح البحث
  const filteredPosts = posts?.filter(post => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      post.title.toLowerCase().includes(search) ||
      post.content.toLowerCase().includes(search) ||
      (post.excerpt && post.excerpt.toLowerCase().includes(search))
    );
  });

  return (
    <>
      <Helmet>
        <title>مقالات ومصادر تعليمية عن المنح الدراسية | FULLSCO</title>
        <meta name="description" content="استكشف مجموعتنا من المقالات والأدلة والنصائح حول المنح الدراسية، كتابة مقالات القبول، والدراسة في الخارج." />
        <meta name="keywords" content="مقالات عن المنح الدراسية, دليل التقديم للمنح, كتابة مقال القبول, الدراسة في الخارج, FULLSCO" />
        <meta property="og:title" content="مقالات ومصادر تعليمية عن المنح الدراسية | FULLSCO" />
        <meta property="og:description" content="استكشف مجموعتنا من المقالات والأدلة والنصائح حول المنح الدراسية، كتابة مقالات القبول، والدراسة في الخارج." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://fullsco.com/articles" />
        <link rel="canonical" href="https://fullsco.com/articles" />
      </Helmet>

      <main className="bg-gradient-to-br from-white to-gray-50 py-12" dir="rtl">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative mb-12 rounded-2xl bg-gradient-to-br from-accent/5 via-accent/10 to-accent/5 p-8 shadow-lg overflow-hidden">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-accent/10 blur-3xl"></div>
            <div className="absolute -bottom-8 -left-8 h-40 w-40 rounded-full bg-primary/20 blur-3xl"></div>
            <div className="relative">
              <div className="mb-2 inline-flex items-center rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
                <Bookmark className="mr-1 h-3 w-3" /> مصادر تعليمية
              </div>
              <h1 className="mb-4 text-4xl font-bold text-gray-900">المقالات والمصادر التعليمية</h1>
              <p className="mb-0 max-w-3xl text-gray-600">
                استكشف مجموعتنا من الأدلة والنصائح والمصادر التي ستساعدك في التنقل خلال عملية التقديم للمنح الدراسية بنجاح.
              </p>
            </div>
          </div>

          {/* البحث */}
          <div className="bg-white p-6 rounded-lg shadow-sm mb-8 border border-gray-200">
            <SearchBar 
              placeholder="ابحث في المقالات..." 
              fullWidth 
              buttonText="بحث"
              className="max-w-xl"
            />
          </div>

          {/* المقالات المميزة */}
          {posts && posts.filter(post => post.isFeatured).length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Star className="ml-2 h-5 w-5 text-amber-500" />
                المقالات المميزة
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {posts
                  .filter(post => post.isFeatured)
                  .slice(0, 2)
                  .map(post => (
                    <Card key={post.id} className="overflow-hidden flex flex-col md:flex-row border-primary/10 hover:border-primary/30 hover:shadow-md transition-all duration-300">
                      <div className="md:w-2/5 relative overflow-hidden">
                        <img 
                          src={post.imageUrl || "https://images.unsplash.com/photo-1517486808906-6ca8b3f8e1c1"}
                          alt={post.title}
                          className="h-48 md:h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-tr from-primary/50 to-transparent opacity-50"></div>
                        <Badge variant="secondary" className="absolute top-3 right-3 rounded-full bg-amber-500 text-white shadow-md backdrop-blur-sm">
                          <Star className="ml-1 h-3 w-3" /> مميز
                        </Badge>
                      </div>
                      <CardContent className="p-6 md:w-3/5">
                        <div className="mb-3 flex items-center flex-wrap gap-2">
                          <Badge variant="outline" className="rounded-full border-gray-200 text-gray-600 flex items-center">
                            <Calendar className="ml-1 h-3 w-3" /> {formatDate(post.createdAt)}
                          </Badge>
                          <Badge variant="outline" className="rounded-full border-gray-200 text-gray-600 flex items-center">
                            <Eye className="ml-1 h-3 w-3" /> {post.views || 0} مشاهدة
                          </Badge>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                          <span onClick={() => setLocation(`/articles/${post.slug}`)} className="hover:text-primary transition-colors hover:underline cursor-pointer">
                            {post.title}
                          </span>
                        </h3>
                        <p className="text-gray-600 mb-4 line-clamp-3">
                          {post.excerpt || post.content.substring(0, 150) + '...'}
                        </p>
                        <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
                          <div className="flex items-center">
                            <UserCircle className="ml-2 h-5 w-5 text-primary/70" />
                            <span className="text-sm font-medium text-gray-700">{getAuthorName(post.authorId)}</span>
                          </div>
                          <Link href={`/articles/${post.slug}`}>
                            <Button variant="outline" size="sm" className="group rounded-full text-primary border-primary/30 hover:bg-primary/5">
                              قراءة المزيد <ArrowRight className="mr-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          )}

          {/* كل المقالات */}
          <div className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">جميع المقالات</h2>
              {searchTerm && (
                <p className="text-gray-600">
                  نتائج البحث عن: <span className="font-medium">"{searchTerm}"</span>
                </p>
              )}
            </div>
            
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="h-48 bg-gray-200"></div>
                    <CardContent className="p-5">
                      <div className="h-4 w-20 bg-gray-200 mb-2 rounded"></div>
                      <div className="h-6 w-3/4 bg-gray-200 mb-2 rounded"></div>
                      <div className="h-20 bg-gray-200 mb-4 rounded"></div>
                      <div className="flex justify-between">
                        <div className="h-4 w-24 bg-gray-200 rounded"></div>
                        <div className="h-4 w-16 bg-gray-200 rounded"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredPosts && filteredPosts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPosts.map(post => (
                  <Card key={post.id} className="group overflow-hidden border-none transition-all duration-300 hover:-translate-y-1 hover:shadow-xl shadow-lg">
                    <div className="relative overflow-hidden">
                      <img 
                        src={post.imageUrl || "https://images.unsplash.com/photo-1517486808906-6ca8b3f8e1c1"}
                        alt={post.title}
                        className="h-52 w-full object-cover transition-transform duration-700 group-hover:scale-110"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-70 group-hover:opacity-60 transition-opacity"></div>
                      
                      {/* تأثير زر القراءة عند التحويم */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span 
                          onClick={() => setLocation(`/articles/${post.slug}`)} 
                          className="text-white font-bold text-base opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-75 group-hover:scale-100 bg-accent/80 px-4 py-2 rounded-full cursor-pointer backdrop-blur-sm hover:bg-accent"
                        >
                          اقرأ المقال
                        </span>
                      </div>
                      
                      {/* تاريخ النشر */}
                      <div className="absolute bottom-3 right-3">
                        <Badge variant="secondary" className="rounded-full bg-white/20 backdrop-blur-md text-white border border-white/10 shadow-md">
                          <Calendar className="ml-1 h-3 w-3" /> {formatDate(post.createdAt)}
                        </Badge>
                      </div>
                    </div>
                    
                    <CardContent className="p-6 bg-white">
                      <div className="mb-3 flex items-center flex-wrap gap-2">
                        {postTagsMap[post.id]?.length > 0 ? (
                          postTagsMap[post.id].map(tag => (
                            <Badge key={tag.id} variant="secondary" className="rounded-full bg-accent/10 text-accent hover:bg-accent/20 transition-colors">
                              <Tag className="ml-1 h-3 w-3" /> {tag.name}
                            </Badge>
                          ))
                        ) : (
                          <Badge variant="secondary" className="rounded-full bg-accent/10 text-accent hover:bg-accent/20 transition-colors">
                            <Tag className="ml-1 h-3 w-3" /> مقال
                          </Badge>
                        )}
                        <Badge variant="outline" className="rounded-full border-gray-200 text-gray-600 flex items-center ml-auto">
                          <Eye className="ml-1 h-3 w-3" /> {post.views || 0} مشاهدة
                        </Badge>
                      </div>
                      
                      <h3 className="mb-3 text-xl font-bold text-gray-900 group-hover:text-accent transition-colors line-clamp-2 leading-tight">
                        <span onClick={() => setLocation(`/articles/${post.slug}`)} className="cursor-pointer">
                          {post.title}
                        </span>
                      </h3>
                      
                      <p className="mb-5 text-sm text-gray-600 line-clamp-3 leading-relaxed">
                        {post.excerpt || post.content.substring(0, 120) + '...'}
                      </p>
                      
                      <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center">
                          <div className="bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center ml-2">
                            <UserCircle className="h-5 w-5 text-primary" />
                          </div>
                          <span className="text-sm font-medium text-gray-700">{getAuthorName(post.authorId)}</span>
                        </div>
                        
                        <Link href={`/articles/${post.slug}`}>
                          <Button variant="outline" size="sm" className="group rounded-full bg-accent/5 text-accent border-accent/20 hover:bg-accent/10 hover:border-accent/30">
                            المزيد <ArrowRight className="mr-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-2">لم يتم العثور على مقالات</h3>
                <p className="text-gray-600 mb-6">لم نتمكن من العثور على أي مقالات تطابق معايير البحث الخاصة بك.</p>
                {searchTerm && (
                  <Button onClick={() => setSearchTerm('')}>
                    مسح البحث
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* تصنيفات المقالات */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Bookmark className="ml-2 h-5 w-5 text-primary" />
              تصفح حسب التصنيف
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <Link href="/articles?category=application-tips">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 p-4 rounded-lg border border-blue-200 transition-all duration-300 flex flex-col items-center text-center h-full shadow-sm hover:shadow group">
                  <div className="bg-blue-500/10 p-3 rounded-full mb-3 group-hover:bg-blue-500/20 transition-colors">
                    <Tag className="h-5 w-5 text-blue-500" />
                  </div>
                  <span className="font-medium text-blue-700">نصائح التقديم</span>
                </div>
              </Link>
              <Link href="/articles?category=essay-writing">
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 p-4 rounded-lg border border-purple-200 transition-all duration-300 flex flex-col items-center text-center h-full shadow-sm hover:shadow group">
                  <div className="bg-purple-500/10 p-3 rounded-full mb-3 group-hover:bg-purple-500/20 transition-colors">
                    <Tag className="h-5 w-5 text-purple-500" />
                  </div>
                  <span className="font-medium text-purple-700">كتابة المقالات</span>
                </div>
              </Link>
              <Link href="/articles?category=interviews">
                <div className="bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 p-4 rounded-lg border border-green-200 transition-all duration-300 flex flex-col items-center text-center h-full shadow-sm hover:shadow group">
                  <div className="bg-green-500/10 p-3 rounded-full mb-3 group-hover:bg-green-500/20 transition-colors">
                    <Tag className="h-5 w-5 text-green-500" />
                  </div>
                  <span className="font-medium text-green-700">المقابلات</span>
                </div>
              </Link>
              <Link href="/articles?category=financial-aid">
                <div className="bg-gradient-to-br from-amber-50 to-amber-100 hover:from-amber-100 hover:to-amber-200 p-4 rounded-lg border border-amber-200 transition-all duration-300 flex flex-col items-center text-center h-full shadow-sm hover:shadow group">
                  <div className="bg-amber-500/10 p-3 rounded-full mb-3 group-hover:bg-amber-500/20 transition-colors">
                    <Tag className="h-5 w-5 text-amber-500" />
                  </div>
                  <span className="font-medium text-amber-700">المساعدات المالية</span>
                </div>
              </Link>
              <Link href="/articles?category=studying-abroad">
                <div className="bg-gradient-to-br from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 p-4 rounded-lg border border-red-200 transition-all duration-300 flex flex-col items-center text-center h-full shadow-sm hover:shadow group">
                  <div className="bg-red-500/10 p-3 rounded-full mb-3 group-hover:bg-red-500/20 transition-colors">
                    <Tag className="h-5 w-5 text-red-500" />
                  </div>
                  <span className="font-medium text-red-700">الدراسة في الخارج</span>
                </div>
              </Link>
              <Link href="/articles?category=research">
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 hover:from-indigo-100 hover:to-indigo-200 p-4 rounded-lg border border-indigo-200 transition-all duration-300 flex flex-col items-center text-center h-full shadow-sm hover:shadow group">
                  <div className="bg-indigo-500/10 p-3 rounded-full mb-3 group-hover:bg-indigo-500/20 transition-colors">
                    <Tag className="h-5 w-5 text-indigo-500" />
                  </div>
                  <span className="font-medium text-indigo-700">البحث العلمي</span>
                </div>
              </Link>
            </div>
          </div>

          {/* قسم النصائح السريعة */}
          <div className="mb-12 bg-gradient-to-r from-primary/5 to-transparent p-8 rounded-lg shadow-sm border border-primary/10 relative overflow-hidden">
            <div className="absolute inset-0 overflow-hidden opacity-10">
              <div className="absolute top-0 -right-10 w-40 h-40 bg-primary/20 rounded-full"></div>
              <div className="absolute bottom-0 left-10 w-20 h-20 bg-secondary/20 rounded-full"></div>
              <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-accent/20 rounded-full transform -translate-y-1/2"></div>
            </div>
            <div className="relative">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2 text-primary">
                  <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
                  <path d="m9 12 2 2 4-4"></path>
                </svg>
                نصائح سريعة للحصول على المنح الدراسية
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 hover:border-primary hover:shadow transition-all duration-300 relative">
                  <div className="absolute top-0 right-0 bg-blue-500 text-white w-8 h-8 rounded-bl-lg flex items-center justify-center font-bold">1</div>
                  <h3 className="font-medium text-lg mb-3 mt-2 text-blue-700">ابدأ مبكراً</h3>
                  <p className="text-gray-600">ابدأ بالبحث عن المنح قبل الموعد النهائي بأشهر للحصول على وقت كافٍ لإعداد طلب قوي.</p>
                </div>
                <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 hover:border-primary hover:shadow transition-all duration-300 relative">
                  <div className="absolute top-0 right-0 bg-green-500 text-white w-8 h-8 rounded-bl-lg flex items-center justify-center font-bold">2</div>
                  <h3 className="font-medium text-lg mb-3 mt-2 text-green-700">كن منظمًا</h3>
                  <p className="text-gray-600">احتفظ بسجل للمواعيد النهائية والمستندات المطلوبة لكل منحة دراسية تتقدم لها.</p>
                </div>
                <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 hover:border-primary hover:shadow transition-all duration-300 relative">
                  <div className="absolute top-0 right-0 bg-purple-500 text-white w-8 h-8 rounded-bl-lg flex items-center justify-center font-bold">3</div>
                  <h3 className="font-medium text-lg mb-3 mt-2 text-purple-700">شخصن مقالك</h3>
                  <p className="text-gray-600">اكتب مقالًا فريدًا يعكس تجاربك الشخصية وأهدافك بدلاً من استخدام قوالب عامة.</p>
                </div>
              </div>
              <div className="mt-6 text-center">
                <Button className="bg-primary hover:bg-primary/90 text-white shadow-md hover:shadow-lg transition-all duration-300">
                  اقرأ المزيد من النصائح
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Articles;
