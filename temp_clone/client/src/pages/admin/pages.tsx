import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { formatDate, cn } from "@/lib/utils";
import AdminLayout from "@/components/admin/admin-layout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  PlusCircle,
  Search,
  Edit,
  Trash2,
  ExternalLink,
  Eye,
  Menu,
  CheckCircle,
  XCircle,
  RefreshCw,
  ArrowUpDown,
  FileText
} from "lucide-react";

// تعريف واجهة الصفحة
interface Page {
  id: number;
  title: string;
  slug: string;
  content: string;
  metaTitle?: string;
  metaDescription?: string;
  isPublished: boolean;
  showInFooter?: boolean;
  showInHeader?: boolean;
  createdAt: string;
  updatedAt: string;
  imageUrl?: string;
}

const AdminPages = () => {
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [deleteId, setDeleteId] = useState<number | undefined>(undefined);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedPage, setSelectedPage] = useState<Page | null>(null);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);

  const [sortField, setSortField] = useState<string>("updatedAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // التحقق من تسجيل الدخول
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/admin/login");
    }
  }, [authLoading, isAuthenticated, navigate]);

  // جلب الصفحات
  const {
    data: pages,
    isLoading,
    isError,
    refetch
  } = useQuery<Page[]>({
    queryKey: ["/api/admin/pages"],
    queryFn: async () => {
      try {
        const response = await fetch('/api/admin/pages', {
          credentials: 'include'
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'فشل في استلام الصفحات');
        }
        
        return await response.json();
      } catch (error) {
        console.error('Error fetching pages:', error);
        throw error;
      }
    },
    enabled: isAuthenticated,
  });

  // حذف صفحة
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/pages/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'فشل في حذف الصفحة');
      }
      
      return { success: true, id };
    },
    onSuccess: () => {
      toast({
        title: "تم الحذف بنجاح",
        description: "تم حذف الصفحة بنجاح",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pages"] });
      setShowDeleteDialog(false);
      setSelectedPage(null);
    },
    onError: (error) => {
      toast({
        title: "خطأ!",
        description: `فشل في حذف الصفحة: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // تغيير حالة النشر للصفحة
  const togglePublishMutation = useMutation({
    mutationFn: async ({ id, isPublished }: { id: number, isPublished: boolean }) => {
      const response = await fetch(`/api/pages/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'فشل في تغيير حالة النشر');
      }
      
      return await response.json();
    },
    onSuccess: (updatedPage: Page) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pages"] });
      toast({ 
        title: updatedPage.isPublished ? "تم النشر بنجاح" : "تم إلغاء النشر", 
        description: updatedPage.isPublished ? "الصفحة الآن منشورة ومتاحة للزوار" : "الصفحة الآن غير منشورة" 
      });
    },
    onError: (error) => {
      toast({ 
        title: "خطأ!", 
        description: `فشل في تغيير حالة النشر: ${error.message}`, 
        variant: "destructive" 
      });
    },
  });

  // إعداد الصفحة للحذف
  const handleDeleteClick = (page: Page) => {
    setSelectedPage(page);
    setDeleteId(page.id);
    setShowDeleteDialog(true);
  };

  // تأكيد الحذف
  const confirmDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId);
    }
  };
  
  // تغيير حالة النشر
  const togglePublish = (page: Page) => {
    togglePublishMutation.mutate({ id: page.id, isPublished: !page.isPublished });
  };
  
  // معاينة الصفحة
  const handlePreview = (page: Page) => {
    setSelectedPage(page);
    setIsPreviewDialogOpen(true);
  };
  
  // تعديل الصفحة
  const handleEdit = (page: Page) => {
    navigate(`/admin/pages/edit/${page.id}`);
  };

  // فرز الصفحات
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // تصفية وفرز الصفحات
  const filteredAndSortedPages = Array.isArray(pages) 
    ? pages
        // تصفية حسب مصطلح البحث
        .filter(page => 
          page.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
          page.slug?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          page.content?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        // تصفية حسب التبويب النشط
        .filter(page => {
          if (activeTab === 'all') return true;
          if (activeTab === 'published') return page.isPublished;
          if (activeTab === 'drafts') return !page.isPublished;
          return true;
        })
        // فرز حسب الحقل والاتجاه المحددين
        .sort((a, b) => {
          let aValue: any = (a as any)[sortField];
          let bValue: any = (b as any)[sortField];
          
          // التعامل مع القيم النصية والتواريخ والأرقام
          if (typeof aValue === 'string' && typeof bValue === 'string') {
            if (sortField === 'createdAt' || sortField === 'updatedAt') {
              aValue = new Date(aValue).getTime();
              bValue = new Date(bValue).getTime();
            } else {
              aValue = aValue.toLowerCase();
              bValue = bValue.toLowerCase();
            }
          }
          
          // الترتيب التصاعدي أو التنازلي
          if (sortDirection === 'asc') {
            return aValue > bValue ? 1 : -1;
          } else {
            return aValue < bValue ? 1 : -1;
          }
        })
    : [];

  // حساب عدد الصفحات المنشورة والمسودات
  const publishedPages = Array.isArray(pages) 
    ? pages.filter(page => page.isPublished === true)
    : [];
    
  const draftPages = Array.isArray(pages) 
    ? pages.filter(page => page.isPublished !== true)
    : [];

  // عرض رسالة التحميل
  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        جاري التحميل...
      </div>
    );
  }

  // تحضير أزرار الإجراءات لشريط العنوان
  const actions = (
    <>
      <Button variant="outline" onClick={() => refetch()}>
        <RefreshCw className="ml-2 h-4 w-4" />
        تحديث
      </Button>
      <Link href="/admin/pages/create">
        <Button>
          <PlusCircle className="ml-2 h-4 w-4" />
          إضافة صفحة
        </Button>
      </Link>
    </>
  );

  return (
    <AdminLayout title="إدارة الصفحات الثابتة" actions={actions}>
      {/* تبويبات التصفية وحقل البحث */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <Tabs 
          defaultValue="all" 
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full md:w-auto"
        >
          <TabsList className="grid grid-cols-3 w-full md:w-auto">
            <TabsTrigger value="all">
              جميع الصفحات
              <Badge variant="secondary" className="mr-2">
                {pages?.length || 0}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="published">
              منشورة
              <Badge variant="secondary" className="mr-2">
                {publishedPages.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="drafts">
              مسودات
              <Badge variant="secondary" className="mr-2">
                {draftPages.length}
              </Badge>
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="relative w-full md:w-64">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="search"
            placeholder="بحث في الصفحات..."
            className="w-full pl-3 pr-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {/* جدول الصفحات */}
      <div className="bg-white rounded-md border">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
            <p className="mt-4 text-muted-foreground">جاري تحميل البيانات...</p>
          </div>
        ) : isError ? (
          <div className="p-8 text-center bg-red-50 rounded-lg">
            <XCircle className="h-12 w-12 mx-auto text-red-500 mb-3" />
            <p className="text-red-600 font-medium">حدث خطأ أثناء تحميل البيانات</p>
            <p className="text-gray-600 mt-2">يرجى تحديث الصفحة أو المحاولة مرة أخرى لاحقًا</p>
          </div>
        ) : filteredAndSortedPages.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="h-12 w-12 mx-auto text-gray-400 mb-3" />
            <p className="text-muted-foreground">لا توجد صفحات مطابقة للبحث</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => {
                setSearchTerm('');
                setActiveTab('all');
              }}
            >
              مسح التصفية
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">#</TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('title')}>
                    <div className="flex items-center">
                      العنوان
                      {sortField === 'title' && (
                        <ArrowUpDown className={cn(
                          "mr-2 h-4 w-4",
                          sortDirection === 'desc' && "transform rotate-180"
                        )} />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('slug')}>
                    <div className="flex items-center">
                      المسار
                      {sortField === 'slug' && (
                        <ArrowUpDown className={cn(
                          "mr-2 h-4 w-4",
                          sortDirection === 'desc' && "transform rotate-180"
                        )} />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('updatedAt')}>
                    <div className="flex items-center">
                      آخر تحديث
                      {sortField === 'updatedAt' && (
                        <ArrowUpDown className={cn(
                          "mr-2 h-4 w-4",
                          sortDirection === 'desc' && "transform rotate-180"
                        )} />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('isPublished')}>
                    <div className="flex items-center">
                      الحالة
                      {sortField === 'isPublished' && (
                        <ArrowUpDown className={cn(
                          "mr-2 h-4 w-4",
                          sortDirection === 'desc' && "transform rotate-180"
                        )} />
                      )}
                    </div>
                  </TableHead>
                  <TableHead>إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedPages.map((page, index) => (
                  <TableRow key={page.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell>
                      <div className="font-medium">{page.title}</div>
                      {page.metaTitle && (
                        <div className="text-xs text-muted-foreground mt-1 truncate max-w-xs">
                          {page.metaTitle}
                        </div>
                      )}
                    </TableCell>
                    <TableCell dir="ltr" className="font-mono text-sm">/{page.slug}</TableCell>
                    <TableCell>{formatDate(page.updatedAt)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={page.isPublished ? "success" : "warning"}
                        className="cursor-pointer"
                        onClick={() => togglePublish(page)}
                      >
                        {page.isPublished ? (
                          <>
                            <CheckCircle className="h-3.5 w-3.5 ml-1" />
                            منشورة
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3.5 w-3.5 ml-1" />
                            مسودة
                          </>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handlePreview(page)}
                          title="معاينة"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(page)}
                          title="تعديل"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive/80"
                          onClick={() => handleDeleteClick(page)}
                          title="حذف"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* نافذة تأكيد الحذف */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>حذف الصفحة</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من رغبتك في حذف صفحة "{selectedPage?.title}"؟ لا يمكن التراجع عن هذا الإجراء.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              إلغاء
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
            >
              حذف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* نافذة معاينة الصفحة */}
      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedPage?.title}</DialogTitle>
            <DialogDescription>
              معاينة الصفحة كما ستظهر للزوار
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 p-4 border rounded-md bg-white">
            <div dangerouslySetInnerHTML={{ __html: selectedPage?.content || '' }} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPreviewDialogOpen(false)}>
              إغلاق
            </Button>
            {selectedPage && (
              <Button 
                variant="default" 
                onClick={() => window.open(`/${selectedPage.slug}`, '_blank')}
              >
                فتح في تبويب جديد
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminPages;