import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { 
  Trophy, PlusCircle, Edit, Trash2, Search, 
  CheckCircle, XCircle, AlertTriangle, 
  RefreshCw, ArrowUpDown, Filter
} from 'lucide-react';
import { useSuccessStories } from '@/hooks/use-success-stories';
import { useAuth } from '@/hooks/use-auth';
import { cn, formatDate } from '@/lib/utils';

// Importing shadcn components
import AdminLayout from '@/components/admin/admin-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog, DialogContent, DialogDescription, 
  DialogFooter, DialogHeader, DialogTitle 
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

// Define types if not already defined
interface SuccessStory {
  id: number;
  name: string;
  title: string;
  content: string;
  scholarshipName?: string | null;
  scholarshipId?: number | null;
  imageUrl?: string | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

const AdminSuccessStories = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState('all');
  const [deleteId, setDeleteId] = useState<number | undefined>(undefined);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedStory, setSelectedStory] = useState<SuccessStory | null>(null);
  const [sortField, setSortField] = useState<string>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const { toast } = useToast();
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  
  // استخدام الهوك المحدث للحصول على قصص النجاح والوظائف المرتبطة بها
  const { 
    successStories, 
    isLoading, 
    error,
    deleteSuccessStory,
    updateSuccessStoryStatus
  } = useSuccessStories();

  // التحقق من تسجيل الدخول
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/admin/login');
    }
  }, [authLoading, isAuthenticated, navigate]);

  // التعامل مع حذف قصة نجاح
  const handleDeleteClick = (story: SuccessStory) => {
    setSelectedStory(story);
    setDeleteId(story.id);
    setShowDeleteDialog(true);
  };

  // تأكيد الحذف
  const confirmDelete = async () => {
    if (deleteId) {
      try {
        await deleteSuccessStory(deleteId);
        toast({
          title: "تم الحذف بنجاح",
          description: "تم حذف قصة النجاح بنجاح"
        });
        setShowDeleteDialog(false);
      } catch (error) {
        console.error("خطأ في حذف قصة النجاح:", error);
        toast({
          title: "خطأ في الحذف",
          description: "حدث خطأ أثناء محاولة حذف قصة النجاح",
          variant: "destructive"
        });
      }
    }
  };

  // تبديل حالة النشر
  const togglePublish = async (id: number, currentStatus: boolean) => {
    try {
      // تعيين القيمة العكسية للحالة الحالية
      const newStatus = !currentStatus;
      await updateSuccessStoryStatus(id, newStatus);
      toast({
        title: newStatus ? "تم النشر بنجاح" : "تم إلغاء النشر",
        description: newStatus 
          ? "أصبحت قصة النجاح متاحة للجميع الآن" 
          : "تم إلغاء نشر قصة النجاح"
      });
    } catch (error) {
      console.error("خطأ في تغيير حالة النشر:", error);
      toast({
        title: "خطأ في تغيير الحالة",
        description: "حدث خطأ أثناء محاولة تغيير حالة النشر",
        variant: "destructive"
      });
    }
  };

  // فرز القصص
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // تصفية وفرز قصص النجاح
  const filteredAndSortedStories = Array.isArray(successStories) 
    ? successStories
        // تصفية حسب مصطلح البحث
        .filter(story => 
          story.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
          story.title?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        // تصفية حسب التبويب النشط
        .filter(story => {
          if (activeTab === 'all') return true;
          if (activeTab === 'published') return story.isPublished;
          if (activeTab === 'drafts') return !story.isPublished;
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

  // عد القصص المنشورة والمسودات
  const publishedCount = Array.isArray(successStories) 
    ? successStories.filter(story => story.isPublished === true).length 
    : 0;
  
  const draftCount = Array.isArray(successStories) 
    ? successStories.filter(story => story.isPublished !== true).length 
    : 0;

  // الانتقال إلى صفحة التعديل
  const handleEdit = (id: number) => {
    navigate(`/admin/success-stories/edit/${id}`);
  };

  // في حالة تحميل بيانات المصادقة أو عدم تسجيل الدخول
  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        جاري التحميل...
      </div>
    );
  }

  // تحديد أزرار الإجراءات
  const actions = (
    <>
      <Button variant="outline" onClick={() => window.location.reload()}>
        <RefreshCw className="ml-2 h-4 w-4" />
        تحديث
      </Button>
      <Button onClick={() => navigate('/admin/success-stories/create')}>
        <PlusCircle className="ml-2 h-4 w-4" />
        إضافة قصة جديدة
      </Button>
    </>
  );

  return (
    <AdminLayout title="إدارة قصص النجاح" actions={actions}>
      <div className="p-4 md:p-6">
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
                جميع القصص
                <Badge variant="secondary" className="mr-2">
                  {successStories?.length || 0}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="published">
                منشورة
                <Badge variant="secondary" className="mr-2">
                  {publishedCount}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="drafts">
                مسودات
                <Badge variant="secondary" className="mr-2">
                  {draftCount}
                </Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="relative w-full md:w-64">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="بحث في قصص النجاح..."
              className="w-full pl-3 pr-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {/* جدول قصص النجاح مع تحسينات الواجهة */}
        <div className="bg-white rounded-md border">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
              <p className="mt-4 text-muted-foreground">جاري تحميل البيانات...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center bg-red-50 rounded-lg">
              <AlertTriangle className="h-12 w-12 mx-auto text-red-500 mb-3" />
              <p className="text-red-600 font-medium">حدث خطأ أثناء تحميل البيانات</p>
              <p className="text-gray-600 mt-2">يرجى تحديث الصفحة أو المحاولة مرة أخرى لاحقًا</p>
            </div>
          ) : filteredAndSortedStories.length === 0 ? (
            <div className="p-8 text-center">
              <Trophy className="h-12 w-12 mx-auto text-gray-400 mb-3" />
              <p className="text-muted-foreground">لا توجد قصص نجاح مطابقة للبحث</p>
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
                    <TableHead className="cursor-pointer" onClick={() => handleSort('name')}>
                      <div className="flex items-center">
                        الاسم
                        {sortField === 'name' && (
                          <ArrowUpDown className={cn(
                            "mr-2 h-4 w-4",
                            sortDirection === 'desc' && "transform rotate-180"
                          )} />
                        )}
                      </div>
                    </TableHead>
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
                    <TableHead className="cursor-pointer" onClick={() => handleSort('createdAt')}>
                      <div className="flex items-center">
                        تاريخ الإنشاء
                        {sortField === 'createdAt' && (
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
                  {filteredAndSortedStories.map((story, index) => (
                    <TableRow key={story.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>
                        <div className="font-medium">{story.name}</div>
                        {story.scholarshipName && (
                          <div className="text-xs text-muted-foreground mt-1">
                            المنحة: {story.scholarshipName}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{story.title}</TableCell>
                      <TableCell>{formatDate(story.createdAt)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={story.isPublished ? "success" : "warning"}
                          className="cursor-pointer"
                          onClick={() => togglePublish(story.id, !!story.isPublished)}
                        >
                          {story.isPublished ? (
                            <>
                              <CheckCircle className="h-3.5 w-3.5 ml-1" />
                              منشور
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
                            onClick={() => handleEdit(story.id)}
                            title="تعديل"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive/80"
                            onClick={() => handleDeleteClick(story)}
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
      </div>

      {/* حوار تأكيد الحذف */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تأكيد الحذف</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من رغبتك في حذف قصة النجاح "{selectedStory?.title}"؟
              <br />
              هذا الإجراء لا يمكن التراجع عنه.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              إلغاء
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmDelete}
            >
              تأكيد الحذف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminSuccessStories;