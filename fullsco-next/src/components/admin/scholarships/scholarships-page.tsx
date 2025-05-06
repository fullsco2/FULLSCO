"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  PlusCircle,
  Trash2,
  Pencil,
  RefreshCw,
  Search,
  Star,
  Check,
  X,
  GraduationCap,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Scholarship } from "@/shared/schema";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table/index";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ScholarshipsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [scholarshipToDelete, setScholarshipToDelete] = useState<number | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);

  // جلب المنح الدراسية
  const {
    data: scholarshipsData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: [
      "/api/scholarships",
      searchTerm,
      categoryFilter,
      levelFilter,
      currentPage,
    ],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (searchTerm) queryParams.append("keyword", searchTerm);
      if (categoryFilter !== "all")
        queryParams.append("category", categoryFilter);
      if (levelFilter !== "all") queryParams.append("level", levelFilter);
      queryParams.append("page", currentPage.toString());
      queryParams.append("limit", "10");

      const response = await fetch(
        `/api/scholarships?${queryParams.toString()}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch scholarships");
      }
      return response.json();
    },
  });

  // جلب التصنيفات
  const { data: categories } = useQuery({
    queryKey: ["/api/categories"],
    queryFn: async () => {
      const response = await fetch("/api/categories");
      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }
      return response.json();
    },
  });

  // جلب المستويات
  const { data: levels } = useQuery({
    queryKey: ["/api/levels"],
    queryFn: async () => {
      const response = await fetch("/api/levels");
      if (!response.ok) {
        throw new Error("Failed to fetch levels");
      }
      return response.json();
    },
  });

  // حذف منحة دراسية
  const deleteScholarship = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/scholarships/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error deleting scholarship");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "تم حذف المنحة الدراسية بنجاح",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/scholarships"] });
      setDeleteDialogOpen(false);
      setScholarshipToDelete(null);
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ في حذف المنحة الدراسية",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // تبديل حالة التميز للمنحة الدراسية
  const toggleFeatured = useMutation({
    mutationFn: async ({ id, featured }: { id: number; featured: boolean }) => {
      const response = await fetch(`/api/scholarships/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ featured }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error updating scholarship");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "تم تحديث حالة التميز بنجاح",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/scholarships"] });
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ في تحديث حالة التميز",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDeleteClick = (id: number) => {
    setScholarshipToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (scholarshipToDelete) {
      deleteScholarship.mutate(scholarshipToDelete);
    }
  };

  const handleFeaturedToggle = (id: number, currentFeatured: boolean) => {
    toggleFeatured.mutate({ id, featured: !currentFeatured });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // إعادة تعيين الصفحة عند البحث
    refetch();
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const totalPages = scholarshipsData?.pagination?.pages || 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold tracking-tight">
          إدارة المنح الدراسية
        </h1>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="ml-2 h-4 w-4" />
            تحديث
          </Button>
          <Button onClick={() => router.push("/admin/scholarships/create")}>
            <PlusCircle className="ml-2 h-4 w-4" />
            إضافة منحة
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
            placeholder="ابحث عن منحة دراسية..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" variant="ghost" size="icon">
            <Search className="h-4 w-4" />
          </Button>
        </form>

        <div className="flex gap-2">
          <div className="flex flex-col space-y-1 min-w-[180px]">
            <Select
              value={categoryFilter}
              onValueChange={setCategoryFilter}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="التصنيف" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع التصنيفات</SelectItem>
                {categories?.map((category: any) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col space-y-1 min-w-[180px]">
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="المستوى" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع المستويات</SelectItem>
                {levels?.map((level: any) => (
                  <SelectItem key={level.id} value={level.id.toString()}>
                    {level.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setSearchTerm("");
              setCategoryFilter("all");
              setLevelFilter("all");
              setCurrentPage(1);
            }}
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="border rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12 text-center">#</TableHead>
              <TableHead>العنوان</TableHead>
              <TableHead className="hidden md:table-cell">التصنيف</TableHead>
              <TableHead className="hidden md:table-cell">المستوى</TableHead>
              <TableHead className="hidden md:table-cell">الدولة</TableHead>
              <TableHead className="hidden md:table-cell text-center">مميزة</TableHead>
              <TableHead className="w-[120px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="flex justify-center">
                    <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                  </div>
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-destructive">
                  حدث خطأ أثناء جلب البيانات
                </TableCell>
              </TableRow>
            ) : scholarshipsData?.data?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  لم يتم العثور على منح دراسية
                </TableCell>
              </TableRow>
            ) : (
              scholarshipsData?.data?.map((scholarship: Scholarship & { country: any, level: any, category: any }, index: number) => (
                <TableRow key={scholarship.id}>
                  <TableCell className="text-center">
                    {(currentPage - 1) * 10 + index + 1}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{scholarship.title}</div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {scholarship.category?.name || "-"}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {scholarship.level?.name || "-"}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {scholarship.country?.name || "-"}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-center">
                    {scholarship.featured ? (
                      <Check className="h-5 w-5 mx-auto text-green-500" />
                    ) : (
                      <X className="h-5 w-5 mx-auto text-muted-foreground" />
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          handleFeaturedToggle(
                            scholarship.id,
                            !!scholarship.featured
                          )
                        }
                        title={scholarship.featured ? "إلغاء التميز" : "تمييز المنحة"}
                      >
                        <Star
                          className={`h-4 w-4 ${
                            scholarship.featured
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-muted-foreground"
                          }`}
                        />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          router.push(
                            `/admin/scholarships/${scholarship.id}/edit`
                          )
                        }
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClick(scholarship.id)}
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
            <DialogTitle>حذف المنحة الدراسية</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من أنك تريد حذف هذه المنحة الدراسية؟ لا يمكن التراجع عن هذا الإجراء.
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
              disabled={deleteScholarship.isPending}
            >
              {deleteScholarship.isPending ? (
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
