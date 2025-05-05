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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, RefreshCw, PlusCircle, ExternalLink, Edit, Trash, Loader } from "lucide-react";
import AdminLayout from "@/components/admin/admin-layout";
import { useToast } from "@/hooks/use-toast";

export default function PartnersPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

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
      toast({
        title: "تم الحذف بنجاح",
        description: "تم حذف الشريك بنجاح",
      });
    },
    onError: (error) => {
      toast({
        title: "خطأ في الحذف",
        description: error instanceof Error ? error.message : "حدث خطأ أثناء محاولة حذف الشريك",
        variant: "destructive",
      });
    }
  });

  const handleEdit = (partner: any) => {
    navigate(`/admin/partners/edit/${partner.id}`);
  };

  const handleDelete = (partner: any) => {
    if (window.confirm(`هل أنت متأكد من رغبتك في حذف الشريك "${partner.name}"؟`)) {
      deleteMutation.mutate(partner.id);
    }
  };

  // تحديد أزرار الإجراءات
  const actions = (
    <>
      <Button variant="outline" onClick={() => window.location.reload()}>
        <RefreshCw className="ml-2 h-4 w-4" />
        تحديث
      </Button>
      <Button onClick={() => navigate('/admin/partners/create')}>
        <PlusCircle className="ml-2 h-4 w-4" />
        إضافة شريك جديد
      </Button>
    </>
  );

  return (
    <AdminLayout activeItem="partners" title="إدارة الشركاء" actions={actions}>
      <Card>
        <CardHeader>
          <CardTitle>الشركاء</CardTitle>
          <CardDescription>
            عرض وإدارة الشركاء والمؤسسات التي تظهر في الموقع
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
                  <TableHead>الاسم</TableHead>
                  <TableHead>الشعار</TableHead>
                  <TableHead>الموقع</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {partners.map((partner: any) => (
                  <TableRow key={partner.id}>
                    <TableCell className="font-medium">{partner.name}</TableCell>
                    <TableCell>
                      {partner.logoUrl ? (
                        <img 
                          src={partner.logoUrl} 
                          alt={partner.name} 
                          className="h-10 w-auto object-contain"
                        />
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {partner.websiteUrl ? (
                        <a 
                          href={partner.websiteUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center text-blue-600 hover:underline"
                        >
                          زيارة الموقع
                          <ExternalLink className="h-3.5 w-3.5 mr-1" />
                        </a>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {partner.isActive ? (
                        <Badge variant="success">نشط</Badge>
                      ) : (
                        <Badge variant="secondary">غير نشط</Badge>
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
    </AdminLayout>
  );
}