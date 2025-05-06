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
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
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
} from "@/components/ui/dialog.tsx";
import { Badge } from "@/components/ui/badge";

export default function CountriesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [countryToDelete, setCountryToDelete] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // جلب الدول
  const {
    data: countriesData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["/api/countries", searchTerm, currentPage],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (searchTerm) queryParams.append("keyword", searchTerm);
      queryParams.append("page", currentPage.toString());
      queryParams.append("limit", "10");

      const response = await fetch(
        `/api/countries?${queryParams.toString()}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch countries");
      }
      return response.json();
    },
  });

  // حذف دولة
  const deleteCountry = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/countries/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error deleting country");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "تم حذف الدولة بنجاح",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/countries"] });
      setDeleteDialogOpen(false);
      setCountryToDelete(null);
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ في حذف الدولة",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDeleteClick = (id: number) => {
    setCountryToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (countryToDelete) {
      deleteCountry.mutate(countryToDelete);
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

  const totalPages = countriesData?.pagination?.pages || 1;

  // الحصول على علم الدولة
  const getCountryFlag = (code: string) => {
    // هذه الطريقة تستخدم رموز العلم الافتراضية من نظام اليونيكود
    if (!code || code.length !== 2) return "🌍";
    
    // تحويل رمز الدولة إلى رموز اليونيكود للعلم
    const codePoints = [...code.toUpperCase()].map(c => c.codePointAt(0)! + 127397);
    return String.fromCodePoint(...codePoints);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold tracking-tight">
          إدارة الدول
        </h1>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="ml-2 h-4 w-4" />
            تحديث
          </Button>
          <Button onClick={() => router.push("/admin/countries/create")}>
            <PlusCircle className="ml-2 h-4 w-4" />
            إضافة دولة جديدة
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
            placeholder="ابحث عن دولة..."
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
              <TableHead className="hidden md:table-cell">الرمز</TableHead>
              <TableHead className="hidden md:table-cell">العلم</TableHead>
              <TableHead className="hidden md:table-cell">عدد المنح</TableHead>
              <TableHead>الحالة</TableHead>
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
            ) : countriesData?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  لم يتم العثور على دول
                </TableCell>
              </TableRow>
            ) : (
              countriesData?.map((country: any, index: number) => (
                <TableRow key={country.id}>
                  <TableCell className="text-center">
                    {(currentPage - 1) * 10 + index + 1}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-accent rounded-full flex items-center justify-center overflow-hidden">
                        <span className="text-xl">{getCountryFlag(country.slug)}</span>
                      </div>
                      <div>
                        <p className="font-medium">{country.name}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{country.slug?.toUpperCase()}</TableCell>
                  <TableCell className="hidden md:table-cell text-center">
                    <span className="text-xl">{getCountryFlag(country.slug)}</span>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{country.scholarshipCount || 0}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
                      منشور
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          router.push(`/admin/countries/${country.id}/edit`)
                        }
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClick(country.id)}
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
            <DialogTitle>حذف الدولة</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من أنك تريد حذف هذه الدولة؟ لا يمكن التراجع عن هذا الإجراء.
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
              disabled={deleteCountry.isPending}
            >
              {deleteCountry.isPending ? (
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
