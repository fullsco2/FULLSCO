import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { queryClient } from "@/lib/queryClient";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw, PlusCircle, Edit, Trash, Loader } from "lucide-react";
import AdminLayout from "@/components/admin/admin-layout";
import { useToast } from "@/hooks/use-toast";

export default function StatisticsPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const { data: statistics = [], isLoading } = useQuery({
    queryKey: ['/api/statistics'],
    queryFn: async () => {
      const res = await fetch('/api/statistics', {
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error(`${res.status}: ${await res.text() || res.statusText}`);
      }
      return res.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/statistics/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!res.ok) {
        throw new Error(`${res.status}: ${await res.text() || res.statusText}`);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/statistics'] });
      toast({
        title: "تم الحذف بنجاح",
        description: "تم حذف الإحصائية بنجاح",
      });
    },
    onError: (error) => {
      toast({
        title: "خطأ في الحذف",
        description: error instanceof Error ? error.message : "حدث خطأ أثناء محاولة حذف الإحصائية",
        variant: "destructive",
      });
    }
  });

  const handleEdit = (statistic: any) => {
    navigate(`/admin/statistics/edit/${statistic.id}`);
  };

  const handleDelete = (statistic: any) => {
    if (window.confirm(`هل أنت متأكد من رغبتك في حذف إحصائية "${statistic.title}"؟`)) {
      deleteMutation.mutate(statistic.id);
    }
  };

  // تحديد أزرار الإجراءات
  const actions = (
    <>
      <Button variant="outline" onClick={() => window.location.reload()}>
        <RefreshCw className="ml-2 h-4 w-4" />
        تحديث
      </Button>
      <Button onClick={() => navigate('/admin/statistics/create')}>
        <PlusCircle className="ml-2 h-4 w-4" />
        إضافة إحصائية جديدة
      </Button>
    </>
  );

  return (
    <AdminLayout activeItem="statistics" title="إدارة الإحصائيات" actions={actions}>
      <Card>
        <CardHeader>
          <CardTitle>الإحصائيات</CardTitle>
          <CardDescription>
            عرض وإدارة الإحصائيات التي تظهر في الموقع
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader size={32} />
            </div>
          ) : statistics.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              لا توجد إحصائيات حالياً. أضف إحصائية جديدة لعرضها هنا.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>العنوان</TableHead>
                  <TableHead>القيمة</TableHead>
                  <TableHead>الأيقونة</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {statistics.map((statistic: any) => (
                  <TableRow key={statistic.id}>
                    <TableCell className="font-medium">{statistic.title}</TableCell>
                    <TableCell>{statistic.value}</TableCell>
                    <TableCell>{statistic.icon || "—"}</TableCell>
                    <TableCell>
                      {statistic.isActive ? (
                        <span className="text-green-600">نشط</span>
                      ) : (
                        <span className="text-gray-500">غير نشط</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(statistic)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Trash className="h-4 w-4 text-red-500" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                هل أنت متأكد من رغبتك في الحذف؟
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                سيتم حذف هذه الإحصائية نهائياً ولن تتمكن من استعادتها.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>إلغاء</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-red-500 hover:bg-red-600"
                                onClick={() => handleDelete(statistic)}
                              >
                                حذف
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
}