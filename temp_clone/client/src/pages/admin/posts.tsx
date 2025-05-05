import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { formatDate } from "@/lib/utils";
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
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  PlusCircle,
  Search,
  Edit,
  Trash2,
  ExternalLink,
  Eye,
  XCircle,
  RefreshCw
} from "lucide-react";
import { Post, User } from "@shared/schema";
import AdminLayout from "@/components/admin/admin-layout";

const AdminPosts = () => {
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteId, setDeleteId] = useState<number | undefined>(undefined);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/admin/login");
    }
  }, [authLoading, isAuthenticated, navigate]);

  // Fetch posts
  const {
    data: postsResponse,
    isLoading,
    error,
    refetch
  } = useQuery<{ success: boolean, data: Post[] }>({
    queryKey: ["/api/posts"],
    enabled: isAuthenticated,
  });
  
  // استخراج المقالات من بيانات الاستجابة
  const posts = postsResponse?.data || [];

  // Fetch users for author info
  const { data: usersResponse } = useQuery<{ success: boolean, data: User[] }>({
    queryKey: ["/api/users"],
    enabled: isAuthenticated,
  });
  
  // استخراج المستخدمين من بيانات الاستجابة
  const users = usersResponse?.data || [];

  // حذف المقال
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/posts/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "تم حذف المقال",
        description: "تم حذف المقال بنجاح.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      setShowDeleteDialog(false);
    },
    onError: (error) => {
      toast({
        title: "خطأ",
        description: `فشل في حذف المقال: ${error}`,
        variant: "destructive",
      });
    },
  });

  const handleDeleteClick = (id: number) => {
    setDeleteId(id);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (deleteId !== undefined) {
      deleteMutation.mutate(deleteId);
    }
  };

  const getAuthorName = (authorId?: number) => {
    if (!authorId || !users) return "كاتب غير معروف";
    const author = users.find((u) => u.id === authorId);
    return author?.fullName || author?.username || "كاتب غير معروف";
  };

  const filteredPosts = posts && Array.isArray(posts) ? posts.filter((post) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      post.title.toLowerCase().includes(search) ||
      (post.content && post.content.toLowerCase().includes(search)) ||
      (post.excerpt && post.excerpt.toLowerCase().includes(search)) ||
      getAuthorName(post.authorId).toLowerCase().includes(search)
    );
  }) : [];

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        جاري التحميل...
      </div>
    );
  }

  // أزرار الإجراءات
  const actionButtons = (
    <div className="flex gap-2">
      <Button variant="outline" onClick={() => refetch()}>
        <RefreshCw className="ml-2 h-4 w-4" />
        تحديث
      </Button>
      <Link href="/admin/posts/create">
        <Button className="flex items-center shadow-soft">
          <PlusCircle className="ml-2 h-4 w-4" /> إضافة مقال جديد
        </Button>
      </Link>
    </div>
  );
  
  return (
    <AdminLayout title="إدارة المقالات">
      {/* رأس الصفحة وأزرار */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-semibold">المقالات</h2>
        {actionButtons}
      </div>

      <Card className="shadow-soft">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <div className="relative w-full sm:w-64">
              <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ابحث عن المقالات..."
                className="pr-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="text-sm text-muted-foreground">
              {filteredPosts?.length || 0} مقال
            </div>
          </div>

          {isLoading ? (
            <div className="py-12 text-center">
              <div className="inline-block animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
              <p className="mt-2 text-muted-foreground">جاري تحميل المقالات...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <XCircle className="h-12 w-12 text-destructive mx-auto mb-2" />
              <h3 className="text-lg font-medium mb-1">
                خطأ في تحميل المقالات
              </h3>
              <p className="text-muted-foreground">يرجى المحاولة مرة أخرى لاحقًا.</p>
              <Button variant="outline" onClick={() => refetch()} className="mt-2">
                إعادة المحاولة
              </Button>
            </div>
          ) : filteredPosts && filteredPosts.length > 0 ? (
            <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>العنوان</TableHead>
                    <TableHead>الكاتب</TableHead>
                    <TableHead>التاريخ</TableHead>
                    <TableHead>المشاهدات</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead className="text-left">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPosts.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell className="font-medium">
                        {post.title}
                      </TableCell>
                      <TableCell>{getAuthorName(post.authorId)}</TableCell>
                      <TableCell>{formatDate(post.createdAt)}</TableCell>
                      <TableCell className="flex items-center">
                        <Eye className="h-3 w-3 ml-1 text-muted-foreground" /> {post.views || 0}
                      </TableCell>
                      <TableCell>
                        {post.isFeatured ? (
                          <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20">مميز</Badge>
                        ) : (
                          <Badge variant="secondary">منشور</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-start gap-2">
                          <Link
                            href={`/articles/${post.slug}`}
                            target="_blank"
                          >
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link
                            href={`/admin/posts/edit/${post.id}`}
                          >
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                            onClick={() => handleDeleteClick(post.id)}
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
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                لم يتم العثور على مقالات. قم بإنشاء أول مقال باستخدام زر "إضافة مقال جديد".
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* نافذة تأكيد الحذف */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>حذف المقال</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من رغبتك في حذف هذا المقال؟ لا يمكن التراجع عن هذا الإجراء.
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
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "جاري الحذف..." : "حذف"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminPosts;