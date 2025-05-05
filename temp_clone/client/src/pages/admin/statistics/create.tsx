import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
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
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader, Save } from "lucide-react";
import AdminLayout from "@/components/admin/admin-layout";
import { useToast } from "@/hooks/use-toast";

// تعريف البيانات المطلوبة للنموذج
const statisticFormSchema = z.object({
  title: z.string().min(1, "يجب إدخال عنوان الإحصائية"),
  value: z.string().min(1, "يجب إدخال قيمة الإحصائية"),
  icon: z.string().optional(),
  isActive: z.boolean().default(true),
});

type StatisticFormValues = z.infer<typeof statisticFormSchema>;

export default function CreateStatisticPage() {
  const [, setLocation] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<StatisticFormValues>({
    resolver: zodResolver(statisticFormSchema),
    defaultValues: {
      title: "",
      value: "",
      icon: "",
      isActive: true,
    },
  });

  const onSubmit = async (values: StatisticFormValues) => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/statistics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
        credentials: 'include'
      });
      
      if (!res.ok) {
        throw new Error(`${res.status}: ${await res.text() || res.statusText}`);
      }
      
      await queryClient.invalidateQueries({ queryKey: ['/api/statistics'] });
      toast({
        title: "تم الإنشاء بنجاح",
        description: "تم إنشاء الإحصائية الجديدة بنجاح",
      });
      setLocation('/admin/statistics');
    } catch (error) {
      console.error('خطأ في إنشاء الإحصائية:', error);
      toast({
        title: "خطأ في الإنشاء",
        description: error instanceof Error ? error.message : "حدث خطأ أثناء إنشاء الإحصائية",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // تحديد أزرار الإجراءات
  const actions = (
    <>
      <Button variant="outline" onClick={() => setLocation('/admin/statistics')}>
        <ArrowLeft className="ml-2 h-4 w-4" />
        العودة
      </Button>
    </>
  );

  return (
    <AdminLayout activeItem="statistics" title="إضافة إحصائية جديدة" actions={actions}>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>إضافة إحصائية جديدة</CardTitle>
          <CardDescription>
            أدخل بيانات الإحصائية الجديدة. اضغط حفظ عند الانتهاء.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
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
                control={form.control}
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
                control={form.control}
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
                control={form.control}
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
              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                  {isSubmitting ? <Loader className="ml-2 h-4 w-4 animate-spin" /> : <Save className="ml-2 h-4 w-4" />}
                  حفظ
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}