import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader, Save } from "lucide-react";
import AdminLayout from "@/components/admin/admin-layout";
import { useToast } from "@/hooks/use-toast";

// تعريف البيانات المطلوبة للنموذج
const partnerFormSchema = z.object({
  name: z.string().min(1, "يجب إدخال اسم الشريك"),
  logoUrl: z.string().min(1, "يجب إدخال رابط الشعار"),
  websiteUrl: z.string().url("يرجى إدخال رابط صحيح").optional().or(z.literal("")),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

type PartnerFormValues = z.infer<typeof partnerFormSchema>;

export default function EditPartnerPage() {
  const [, params] = useRoute("/admin/partners/edit/:id");
  const id = params?.id ? parseInt(params.id) : null;
  const [, setLocation] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<PartnerFormValues>({
    resolver: zodResolver(partnerFormSchema),
    defaultValues: {
      name: "",
      logoUrl: "",
      websiteUrl: "",
      description: "",
      isActive: true,
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setIsLoading(true);
      setError(null);
      
      try {
        const res = await fetch(`/api/partners/${id}`, {
          credentials: 'include'
        });
        
        if (!res.ok) {
          throw new Error(`${res.status}: ${await res.text() || res.statusText}`);
        }
        
        const data = await res.json();
        form.reset({
          name: data.name,
          logoUrl: data.logoUrl,
          websiteUrl: data.websiteUrl || "",
          description: data.description || "",
          isActive: data.isActive,
        });
      } catch (error) {
        console.error('خطأ في جلب بيانات الشريك:', error);
        setError(error instanceof Error ? error.message : "حدث خطأ أثناء جلب بيانات الشريك");
        toast({
          title: "خطأ في جلب البيانات",
          description: error instanceof Error ? error.message : "حدث خطأ أثناء جلب بيانات الشريك",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, form, toast]);

  const onSubmit = async (values: PartnerFormValues) => {
    if (!id) return;
    
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/partners/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
        credentials: 'include'
      });
      
      if (!res.ok) {
        throw new Error(`${res.status}: ${await res.text() || res.statusText}`);
      }
      
      await queryClient.invalidateQueries({ queryKey: ['/api/partners'] });
      toast({
        title: "تم التحديث بنجاح",
        description: "تم تحديث بيانات الشريك بنجاح",
      });
      setLocation('/admin/partners');
    } catch (error) {
      console.error('خطأ في تحديث الشريك:', error);
      toast({
        title: "خطأ في التحديث",
        description: error instanceof Error ? error.message : "حدث خطأ أثناء تحديث الشريك",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // تحديد أزرار الإجراءات
  const actions = (
    <>
      <Button variant="outline" onClick={() => setLocation('/admin/partners')}>
        <ArrowLeft className="ml-2 h-4 w-4" />
        العودة
      </Button>
    </>
  );

  return (
    <AdminLayout activeItem="partners" title="تعديل الشريك" actions={actions}>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>تعديل الشريك</CardTitle>
          <CardDescription>
            قم بتعديل بيانات الشريك. اضغط حفظ عند الانتهاء.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center p-8">
              <Loader className="h-8 w-8 animate-spin" />
              <span className="mr-3">جاري تحميل البيانات...</span>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-500">
              <p>{error}</p>
              <Button 
                variant="outline" 
                onClick={() => setLocation('/admin/partners')}
                className="mt-4"
              >
                العودة للقائمة
              </Button>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
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
                  control={form.control}
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
                  control={form.control}
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
                  control={form.control}
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
                  control={form.control}
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
                <div className="flex justify-end">
                  <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                    {isSubmitting ? <Loader className="ml-2 h-4 w-4 animate-spin" /> : <Save className="ml-2 h-4 w-4" />}
                    حفظ
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
}