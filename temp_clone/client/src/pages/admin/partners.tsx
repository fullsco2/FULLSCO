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
import { Textarea } from "@/components/ui/textarea";
import { RefreshCw, PlusCircle, Edit, Trash, ExternalLink } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useQuery, useMutation } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/admin-layout";
import Loader from "@/components/ui/loader";
import { useLocation } from "wouter";

const partnerFormSchema = z.object({
  name: z.string().min(1, "يجب إدخال اسم الشريك"),
  logoUrl: z.string().min(1, "يجب إدخال رابط الشعار"),
  websiteUrl: z.string().url("يرجى إدخال رابط صحيح").optional().or(z.literal("")),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

type PartnerFormValues = z.infer<typeof partnerFormSchema>;

export default function PartnersPage() {
  const [, setLocation] = useLocation();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentPartner, setCurrentPartner] = useState<any>(null);

  const { data: partners = [], isLoading } = useQuery({
    queryKey: ['/api/partners'],
    queryFn: async () => {
      const res = await fetch('/api/partners', {
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error(`${res.status}: ${await res.text() || res.statusText}`);
      }
      return res.json();
    },
  });

  const createForm = useForm<PartnerFormValues>({
    resolver: zodResolver(partnerFormSchema),
    defaultValues: {
      name: "",
      logoUrl: "",
      websiteUrl: "",
      description: "",
      isActive: true,
    },
  });

  const editForm = useForm<PartnerFormValues>({
    resolver: zodResolver(partnerFormSchema),
    defaultValues: {
      name: "",
      logoUrl: "",
      websiteUrl: "",
      description: "",
      isActive: true,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: PartnerFormValues) => {
      const res = await fetch('/api/partners', {
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
      queryClient.invalidateQueries({ queryKey: ['/api/partners'] });
      setIsCreateDialogOpen(false);
      createForm.reset();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { id: number; values: PartnerFormValues }) => {
      const res = await fetch(`/api/partners/${data.id}`, {
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
      queryClient.invalidateQueries({ queryKey: ['/api/partners'] });
      setIsEditDialogOpen(false);
      setCurrentPartner(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/partners/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!res.ok) {
        throw new Error(`${res.status}: ${await res.text() || res.statusText}`);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/partners'] });
    },
  });

  const handleEdit = (partner: any) => {
    setCurrentPartner(partner);
    editForm.reset({
      name: partner.name,
      logoUrl: partner.logoUrl,
      websiteUrl: partner.websiteUrl || "",
      description: partner.description || "",
      isActive: partner.isActive,
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (partner: any) => {
    if (window.confirm(`هل أنت متأكد من رغبتك في حذف شريك "${partner.name}"؟`)) {
      deleteMutation.mutate(partner.id);
    }
  };

  const onCreateSubmit = (values: PartnerFormValues) => {
    createMutation.mutate(values);
  };

  const onEditSubmit = (values: PartnerFormValues) => {
    if (currentPartner) {
      updateMutation.mutate({
        id: currentPartner.id,
        values,
      });
    }
  };

  return (
    <AdminLayout activeItem="partners" title="إدارة الشركاء" actions={
      <>
        <Button variant="outline" onClick={() => window.location.reload()}>
          <RefreshCw className="ml-2 h-4 w-4" />
          تحديث
        </Button>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <PlusCircle className="ml-2 h-4 w-4" />
          إضافة شريك جديد
        </Button>
      </>
    }>
      <Card>
        <CardHeader>
          <CardTitle>الشركاء</CardTitle>
          <CardDescription>
            عرض وإدارة الشركاء الذين يظهرون في الموقع
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader size={32} />
            </div>
          ) : partners.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              لا يوجد شركاء حالياً. أضف شريك جديد لعرضه هنا.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الشعار</TableHead>
                  <TableHead>الاسم</TableHead>
                  <TableHead>الوصف</TableHead>
                  <TableHead>الموقع الإلكتروني</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {partners.map((partner: any) => (
                  <TableRow key={partner.id}>
                    <TableCell>
                      {partner.logoUrl ? (
                        <img 
                          src={partner.logoUrl} 
                          alt={partner.name}
                          className="w-12 h-12 object-contain"
                        />
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{partner.name}</TableCell>
                    <TableCell>
                      {partner.description ? 
                        partner.description.length > 50 
                          ? `${partner.description.substring(0, 50)}...` 
                          : partner.description 
                        : "—"}
                    </TableCell>
                    <TableCell>
                      {partner.websiteUrl ? (
                        <a 
                          href={partner.websiteUrl}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center text-blue-600 hover:underline"
                        >
                          زيارة <ExternalLink className="mr-1 h-3 w-3" />
                        </a>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>
                      {partner.isActive ? (
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
                          onClick={() => handleEdit(partner)}
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
                                سيتم حذف هذا الشريك نهائياً ولن تتمكن من استعادته.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>إلغاء</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-red-500 hover:bg-red-600"
                                onClick={() => handleDelete(partner)}
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

      {/* إضافة شريك جديد */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>إضافة شريك جديد</DialogTitle>
            <DialogDescription>
              أدخل بيانات الشريك الجديد. اضغط حفظ عند الانتهاء.
            </DialogDescription>
          </DialogHeader>
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-6">
              <FormField
                control={createForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>اسم الشريك</FormLabel>
                    <FormControl>
                      <Input placeholder="مثال: جامعة الملك سعود" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="logoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رابط الشعار</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/logo.png" {...field} />
                    </FormControl>
                    <FormDescription>
                      رابط صورة شعار الشريك. يمكنك رفع الصورة في قسم الوسائط أولاً.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="websiteUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رابط الموقع (اختياري)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>وصف مختصر (اختياري)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="وصف مختصر عن الشريك"
                        className="resize-none"
                        {...field} 
                      />
                    </FormControl>
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
                        عرض هذا الشريك في الموقع
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

      {/* تعديل شريك */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>تعديل الشريك</DialogTitle>
            <DialogDescription>
              قم بتعديل بيانات الشريك. اضغط حفظ عند الانتهاء.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-6">
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>اسم الشريك</FormLabel>
                    <FormControl>
                      <Input placeholder="مثال: جامعة الملك سعود" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="logoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رابط الشعار</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/logo.png" {...field} />
                    </FormControl>
                    <FormDescription>
                      رابط صورة شعار الشريك. يمكنك رفع الصورة في قسم الوسائط أولاً.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="websiteUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رابط الموقع (اختياري)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>وصف مختصر (اختياري)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="وصف مختصر عن الشريك"
                        className="resize-none"
                        {...field} 
                      />
                    </FormControl>
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
                        عرض هذا الشريك في الموقع
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