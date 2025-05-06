"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  PlusCircle,
  Trash2,
  Pencil,
  RefreshCw,
  Search,
  Eye,
  Award,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { SuccessStory } from "@/shared/schema";
import { format, parseISO } from "date-fns";
import { ar } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table/index";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function SuccessStoriesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [storyToDelete, setStoryToDelete] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // جلب قصص النجاح
  const {
    data: storiesData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["/api/success-stories", searchTerm, currentPage],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (searchTerm) queryParams.append("keyword", searchTerm);
      queryParams.append("page", currentPage.toString());
      queryParams.append("limit", "10");

      const response = await fetch(
        `/api/success-stories?${queryParams.toString()}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch success stories");
      }
      return response.json();
    },
  });

  // حذف قصة نجاح
  const deleteStory = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/success-stories/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error deleting success story");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "تم حذف قصة النجاح بنجاح",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/success-stories"] });
      setDeleteDialogOpen(false);
      setStoryToDelete(null);
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ في حذف قصة النجاح",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDeleteClick = (id: number) => {
    setStoryToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (storyToDelete) {
      deleteStory.mutate(storyToDelete);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // إعادة تعيين الصفحة عند البحث
    refetch();
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const totalPages = storiesData?.pagination?.pages || 1;

  // تقصير النص إذا كان طويلاً
  const truncateText = (text: string, maxLength: number) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  };

  // تنسيق التاريخ
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    try {
      return format(parseISO(dateString), "yyyy-MM-dd", { locale: ar });
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold tracking-tight">
          إدارة قصص النجاح
        </h1>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="ml-2 h-4 w-4" />
            تحديث
          </Button>
          <Button onClick={() => router.push("/admin/success-stories/create")}>
            <PlusCircle className="ml-2 h-4 w-4" />
            إضافة قصة نجاح
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <form
          onSubmit={handleSearch}
          className="flex items-center flex-1 max-w-sm gap-2"
        >
          <Input
            type="text"
            placeholder="ابحث عن قصة نجاح..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" variant="ghost" size="icon">
            <Search className="h-4 w-4" />
          </Button>
        </form>
      </div>

      <div className="border rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12 text-center">#</TableHead>
              <TableHead>الاسم</TableHead>
              <TableHead className="hidden md:table-cell">الوصف</TableHead>
              <TableHead className="hidden md:table-cell">التاريخ</TableHead>
              <TableHead className="w-[120px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <div className="flex justify-center">
                    <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                  </div>
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-destructive">
                  حدث خطأ أثناء جلب البيانات
                </TableCell>
              </TableRow>
            ) : storiesData?.data?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  لم يتم العثور على قصص نجاح
                </TableCell>
              </TableRow>
            ) : (
              storiesData?.data?.map((story: SuccessStory, index: number) => (
                <TableRow key={story.id}>
                  <TableCell className="text-center">
                    {(currentPage - 1) * 10 + index + 1}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium flex items-center gap-2">
                      <Award className="h-4 w-4 text-amber-500" />
                      {story.name}
                    </div>
                    <div className="text-xs text-muted-foreground md:hidden">
                      {formatDate(story.createdAt.toString())}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {truncateText(story.description || "", 50)}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex items-center">
                      <Calendar className="ml-1 h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">
                        {formatDate(story.createdAt.toString())}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => window.open(`/success-stories/${story.slug}`, "_blank")}
                        title="عرض قصة النجاح"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          router.push(`/admin/success-stories/${story.id}/edit`)
                        }
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClick(story.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {!isLoading && !isError && totalPages > 1 && (
        <div className="flex justify-center mt-4">
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              السابق
            </Button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => goToPage(page)}
                className="w-8"
              >
                {page}
              </Button>
            ))}

            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              التالي
            </Button>
          </div>
        </div>
      )}

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>حذف قصة النجاح</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من أنك تريد حذف هذه القصة؟ لا يمكن التراجع عن هذا الإجراء.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              إلغاء
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteStory.isPending}
            >
              {deleteStory.isPending ? (
                <>
                  <RefreshCw className="ml-2 h-4 w-4 animate-spin" />
                  جاري الحذف...
                </>
              ) : (
                <>
                  <Trash2 className="ml-2 h-4 w-4" />
                  حذف
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
