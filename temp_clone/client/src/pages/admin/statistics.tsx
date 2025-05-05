import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { RefreshCw, PlusCircle, Edit, Trash } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useQuery, useMutation } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/admin-layout";
import Loader from "@/components/ui/loader";
import { useLocation } from "wouter";

const statisticFormSchema = z.object({
  title: z.string().min(1, "يجب إدخال العنوان"),
  value: z.string().min(1, "يجب إدخال القيمة"),
  icon: z.string().optional(),
  isActive: z.boolean().default(true),
});

type StatisticFormValues = z.infer<typeof statisticFormSchema>;

export default function StatisticsPage() {
  const [, setLocation] = useLocation();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentStatistic, setCurrentStatistic] = useState<any>(null);

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

  const createForm = useForm<StatisticFormValues>({
    resolver: zodResolver(statisticFormSchema),
    defaultValues: {
      title: "",
      value: "",
      icon: "",
      isActive: true,
    },
  });

  const editForm = useForm<StatisticFormValues>({
    resolver: zodResolver(statisticFormSchema),
    defaultValues: {
      title: "",
      value: "",
      icon: "",
      isActive: true,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: StatisticFormValues) => {
      const res = await fetch('/api/statistics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include'
      });
      if (!res.ok) {
        throw new Error(`${res.status}: ${await res.text() || res.statusText}`);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/statistics'] });
      setIsCreateDialogOpen(false);
      createForm.reset();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { id: number; values: StatisticFormValues }) => {
      const res = await fetch(`/api/statistics/${data.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data.values),
        credentials: 'include'
      });
      if (!res.ok) {
        throw new Error(`${res.status}: ${await res.text() || res.statusText}`);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/statistics'] });
      setIsEditDialogOpen(false);
      setCurrentStatistic(null);
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
    },
  });

  const handleEdit = (statistic: any) => {
    setCurrentStatistic(statistic);
    editForm.reset({
      title: statistic.title,
      value: statistic.value,
      icon: statistic.icon || "",
      isActive: statistic.isActive,
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (statistic: any) => {
    if (window.confirm(`هل أنت متأكد من رغبتك في حذف إحصائية "${statistic.title}"؟`)) {
      deleteMutation.mutate(statistic.id);
    }
  };

  const onCreateSubmit = (values: StatisticFormValues) => {
    createMutation.mutate(values);
  };

  const onEditSubmit = (values: StatisticFormValues) => {
    if (currentStatistic) {
      updateMutation.mutate({
        id: currentStatistic.id,
        values,
      });
    }
  };

  return (
    <AdminLayout activeItem="statistics" title="إدارة الإحصائيات" actions={
      <>
        <Button variant="outline" onClick={() => window.location.reload()}>
          <RefreshCw className="ml-2 h-4 w-4" />
          تحديث
        </Button>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <PlusCircle className="ml-2 h-4 w-4" />
          إضافة إحصائية جديدة
        </Button>
      </>
    }>
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

      {/* إضافة إحصائية جديدة */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>إضافة إحصائية جديدة</DialogTitle>
            <DialogDescription>
              أدخل بيانات الإحصائية الجديدة. اضغط حفظ عند الانتهاء.
            </DialogDescription>
          </DialogHeader>
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-6">
              <FormField
                control={createForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>العنوان</FormLabel>
                    <FormControl>
                      <Input placeholder="مثال: عدد المنح" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>القيمة</FormLabel>
                    <FormControl>
                      <Input placeholder="مثال: 500+" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="icon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الأيقونة (اختياري)</FormLabel>
                    <FormControl>
                      <Input placeholder="مثال: scholarship" {...field} />
                    </FormControl>
                    <FormDescription>
                      اسم الأيقونة من Lucide React (اتركها فارغة إذا لم تكن متأكداً)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">نشط</FormLabel>
                      <FormDescription>
                        عرض هذه الإحصائية في الموقع
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? <Loader className="ml-2" size={16} /> : null}
                  حفظ
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* تعديل إحصائية */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>تعديل الإحصائية</DialogTitle>
            <DialogDescription>
              قم بتعديل بيانات الإحصائية. اضغط حفظ عند الانتهاء.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-6">
              <FormField
                control={editForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>العنوان</FormLabel>
                    <FormControl>
                      <Input placeholder="مثال: عدد المنح" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>القيمة</FormLabel>
                    <FormControl>
                      <Input placeholder="مثال: 500+" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="icon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الأيقونة (اختياري)</FormLabel>
                    <FormControl>
                      <Input placeholder="مثال: scholarship" {...field} />
                    </FormControl>
                    <FormDescription>
                      اسم الأيقونة من Lucide React (اتركها فارغة إذا لم تكن متأكداً)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">نشط</FormLabel>
                      <FormDescription>
                        عرض هذه الإحصائية في الموقع
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? <Loader className="ml-2" size={16} /> : null}
                  حفظ التغييرات
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}