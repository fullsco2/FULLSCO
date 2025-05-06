'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
  PlusCircle,
  RefreshCw,
  Search,
  Filter,
  FileText,
  Trash,
  Pencil,
  Eye,
  Tags,
  AlertCircle,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// نوع المقال
interface Article {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  tags: string[];
  image?: string;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'published' | 'archived';
}

interface ApiResponse {
  success: boolean;
  data: Article[];
  message?: string;
}

export function ArticlesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [error, setError] = useState<string | null>(null);
  
  const itemsPerPage = 10;
  
  // تصفية المقالات بناءً على البحث والفلاتر
  const filteredArticles = articles.filter((article) => {
    // تصفية البحث
    const matchesSearch = (
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (article.author && article.author.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    
    // تصفية الحالة
    const matchesStatus = statusFilter === 'all' || article.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  // تقسيم الصفحات
  const totalPages = Math.ceil(filteredArticles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedArticles = filteredArticles.slice(startIndex, startIndex + itemsPerPage);

  // جلب المقالات من API
  useEffect(() => {
    fetchArticles();
  }, []);

  // جلب البيانات من API
  const fetchArticles = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/posts');
      
      if (!response.ok) {
        throw new Error(`فشل في جلب المقالات: ${response.status}`);
      }
      
      const data: ApiResponse = await response.json();
      
      if (data.success && Array.isArray(data.data)) {
        setArticles(data.data);
      } else {
        throw new Error(data.message || 'فشل في جلب البيانات');
      }
    } catch (err) {
      console.error('Error fetching articles:', err);
      setError(err instanceof Error ? err.message : 'حدث خطأ غير معروف');
      toast({
        title: 'خطأ في جلب البيانات',
        description: err instanceof Error ? err.message : 'فشل في جلب المقالات',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // تنسيق التاريخ
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy');
    } catch (error) {
      return dateString;
    }
  };

  // عرض شارة الحالة
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge variant="default" className="bg-green-500 hover:bg-green-600">منشور</Badge>;
      case 'draft':
        return <Badge variant="outline" className="border-amber-500 text-amber-500">مسودة</Badge>;
      case 'archived':
        return <Badge variant="secondary">مؤرشف</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // عرض ملخص قصير
  const truncateText = (text: string, maxLength: number = 60) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // الانتقال إلى صفحة إضافة مقال جديد
  const handleAddArticle = () => {
    router.push('/admin/articles/create');
  };

  // عرض شكل التحميل
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">إدارة المقالات</h2>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-[100px]" />
            <Skeleton className="h-9 w-[100px]" />
          </div>
        </div>
        <div className="rounded-md border">
          <div className="p-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <Skeleton className="h-9 w-[250px]" />
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Skeleton className="h-9 w-[120px]" />
              </div>
            </div>
          </div>
          <div className="relative w-full overflow-auto">
            <div className="p-4">
              {Array(5).fill(0).map((_, i) => (
                <div key={i} className="mb-4 flex flex-col gap-2">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // عرض رسالة الخطأ
  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <h2 className="text-2xl font-bold">إدارة المقالات</h2>
          <Button variant="outline" size="sm" onClick={fetchArticles}>
            <RefreshCw className="ml-2 h-4 w-4" />
            إعادة المحاولة
          </Button>
        </div>
        <div className="rounded-md border border-destructive p-4">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <p className="font-medium">فشل في جلب المقالات</p>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <h2 className="text-2xl font-bold">إدارة المقالات</h2>
        <div className="flex w-full gap-2 md:w-auto">
          <Button variant="outline" size="sm" onClick={fetchArticles}>
            <RefreshCw className="ml-2 h-4 w-4" />
            تحديث
          </Button>
          <Button size="sm" onClick={handleAddArticle}>
            <PlusCircle className="ml-2 h-4 w-4" />
            إضافة مقال
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <div className="border-b p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:w-auto">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="بحث عن مقال..."
                className="pl-8 md:w-[300px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">حالة المقال:</span>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-8 w-[150px]">
                  <SelectValue placeholder="الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="published">منشور</SelectItem>
                  <SelectItem value="draft">مسودة</SelectItem>
                  <SelectItem value="archived">مؤرشف</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <div className="relative w-full overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px] text-center">#</TableHead>
                <TableHead>عنوان المقال</TableHead>
                <TableHead className="hidden md:table-cell">الملخص</TableHead>
                <TableHead className="hidden md:table-cell">المؤلف</TableHead>
                <TableHead className="hidden md:table-cell">الوسوم</TableHead>
                <TableHead className="hidden md:table-cell">تاريخ النشر</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead className="text-left">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedArticles.length > 0 ? (
                paginatedArticles.map((article) => (
                  <TableRow key={article.id}>
                    <TableCell className="text-center font-medium">{article.id}</TableCell>
                    <TableCell className="font-medium">{truncateText(article.title, 40)}</TableCell>
                    <TableCell className="hidden max-w-[200px] md:table-cell">{truncateText(article.excerpt, 60)}</TableCell>
                    <TableCell className="hidden md:table-cell">{article.author || '-'}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {Array.isArray(article.tags) && article.tags.length > 0 ? (
                          <>
                            {article.tags.slice(0, 2).map((tag, index) => (
                              <Badge key={index} variant="outline" className="truncate max-w-[100px]">
                                {tag}
                              </Badge>
                            ))}
                            {article.tags.length > 2 && (
                              <Badge variant="outline">+{article.tags.length - 2}</Badge>
                            )}
                          </>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{formatDate(article.publishedAt)}</TableCell>
                    <TableCell>{renderStatusBadge(article.status)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">فتح قائمة</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>الإجراءات</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => router.push(`/admin/articles/${article.id}`)}>
                            <Eye className="ml-2 h-4 w-4" />
                            عرض
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => router.push(`/admin/articles/${article.id}/edit`)}>
                            <Pencil className="ml-2 h-4 w-4" />
                            تعديل
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-600"
                            onClick={() => {
                              // تنفيذ حذف المقال
                              if (window.confirm('هل أنت متأكد من حذف هذا المقال؟')) {
                                // في التطبيق الحقيقي، سيتم استدعاء API هنا لحذف المقال
                                toast({
                                  title: 'جاري تنفيذ الحذف',
                                  description: 'سيتم تنفيذ حذف المقال عند اكتمال الواجهة الخلفية',
                                  variant: 'default',
                                });
                              }
                            }}
                          >
                            <Trash className="ml-2 h-4 w-4" />
                            حذف
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <FileText className="h-8 w-8 text-muted-foreground/50" />
                      <p className="mt-2">لا توجد مقالات متاحة حالياً</p>
                      <p className="text-sm">يمكنك إضافة مقال جديد من الزر أعلاه</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        {filteredArticles.length > 0 && (
          <div className="flex items-center justify-between border-t px-4 py-2">
            <div className="text-sm text-muted-foreground">
              عرض {Math.min(startIndex + 1, filteredArticles.length)} إلى {Math.min(startIndex + itemsPerPage, filteredArticles.length)} من {filteredArticles.length} مقال
            </div>
            <div className="flex items-center space-x-2 space-x-reverse">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              >
                <span className="sr-only">الصفحة الأولى</span>
                <ChevronsRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <span className="sr-only">الصفحة السابقة</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <span className="flex items-center gap-1 text-sm font-medium">
                الصفحة
                <span className="mx-1 text-muted-foreground">{currentPage}</span>
                من
                <span className="mx-1 text-muted-foreground">{totalPages || 1}</span>
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <span className="sr-only">الصفحة التالية</span>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                <span className="sr-only">الصفحة الأخيرة</span>
                <ChevronsLeft className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
