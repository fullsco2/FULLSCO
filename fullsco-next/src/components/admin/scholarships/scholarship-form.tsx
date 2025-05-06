"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { format, parseISO } from "date-fns";
import { ar } from "date-fns/locale";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Editor } from "@/components/editor";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// تعريف مخطط التحقق للنموذج
const formSchema = z.object({
  title: z.string().min(5, {
    message: "عنوان المنحة يجب أن يكون على الأقل 5 أحرف",
  }),
  slug: z.string().min(3, {
    message: "الرابط يجب أن يكون على الأقل 3 أحرف",
  }),
  description: z.string().min(10, {
    message: "الوصف المختصر يجب أن يكون على الأقل 10 أحرف",
  }),
  content: z.string().min(30, {
    message: "محتوى المنحة يجب أن يكون على الأقل 30 حرفًا",
  }),
  categoryId: z.string({
    required_error: "يجب اختيار تصنيف",
  }),
  levelId: z.string({
    required_error: "يجب اختيار مستوى",
  }),
  countryId: z.string({
    required_error: "يجب اختيار دولة",
  }),
  applyUrl: z.string().url({
    message: "يجب أن يكون رابط التقديم URL صحيح",
  }),
  organization: z.string().min(2, {
    message: "اسم المنظمة يجب أن يكون على الأقل حرفين",
  }),
  deadline: z.date({
    required_error: "يجب تحديد الموعد النهائي",
  }),
  amount: z.string().optional(),
  duration: z.string().optional(),
  fullyFunded: z.boolean().default(false),
  featured: z.boolean().default(false),
  thumbnail: z.string().optional(),
  additionalLinks: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  seoKeywords: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ScholarshipFormProps {
  scholarshipId?: string;
}

export default function ScholarshipForm({ scholarshipId }: ScholarshipFormProps = {}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

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

  // جلب الدول
  const { data: countries } = useQuery({
    queryKey: ["/api/countries"],
    queryFn: async () => {
      const response = await fetch("/api/countries");
      if (!response.ok) {
        throw new Error("Failed to fetch countries");
      }
      return response.json();
    },
  });

  // إنشاء نموذج للتحقق والإرسال
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      slug: "",
      description: "",
      content: "",
      categoryId: "",
      levelId: "",
      countryId: "",
      applyUrl: "",
      organization: "",
      amount: "",
      duration: "",
      fullyFunded: false,
      featured: false,
      thumbnail: "",
      additionalLinks: "",
      seoTitle: "",
      seoDescription: "",
      seoKeywords: "",
    },
  });

  // جلب بيانات المنحة في حالة التحرير
  useEffect(() => {
    const fetchScholarship = async () => {
      if (!scholarshipId) return;

      setIsFetching(true);
      try {
        const response = await fetch(`/api/scholarships/${scholarshipId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch scholarship");
        }

        const scholarship = await response.json();

        // تعيين القيم الافتراضية للنموذج
        form.reset({
          title: scholarship.title || "",
          slug: scholarship.slug || "",
          description: scholarship.description || "",
          content: scholarship.content || "",
          categoryId: scholarship.categoryId?.toString() || "",
          levelId: scholarship.levelId?.toString() || "",
          countryId: scholarship.countryId?.toString() || "",
          applyUrl: scholarship.applyUrl || "",
          organization: scholarship.organization || "",
          deadline: scholarship.deadline
            ? new Date(scholarship.deadline)
            : new Date(),
          amount: scholarship.amount || "",
          duration: scholarship.duration || "",
          fullyFunded: scholarship.fullyFunded || false,
          featured: scholarship.featured || false,
          thumbnail: scholarship.thumbnail || "",
          additionalLinks: scholarship.additionalLinks || "",
          seoTitle: scholarship.seoTitle || "",
          seoDescription: scholarship.seoDescription || "",
          seoKeywords: scholarship.seoKeywords || "",
        });
      } catch (error) {
        console.error("Error fetching scholarship:", error);
        toast({
          title: "خطأ في جلب بيانات المنحة",
          variant: "destructive",
        });
      } finally {
        setIsFetching(false);
      }
    };

    fetchScholarship();
  }, [scholarshipId, form, toast]);

  // إنشاء منحة دراسية جديدة
  const createScholarship = useMutation({
    mutationFn: async (data: FormValues) => {
      // تحويل القيم إلى الأنواع المناسبة
      const formattedData = {
        ...data,
        categoryId: data.categoryId ? parseInt(data.categoryId) : null,
        levelId: data.levelId ? parseInt(data.levelId) : null,
        countryId: data.countryId ? parseInt(data.countryId) : null,
        deadline: data.deadline.toISOString(),
      };

      const response = await fetch("/api/scholarships", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error creating scholarship");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "تمت إضافة المنحة الدراسية بنجاح",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/scholarships"] });
      router.push("/admin/scholarships");
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ في إضافة المنحة الدراسية",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // تحديث منحة دراسية موجودة
  const updateScholarship = useMutation({
    mutationFn: async (data: FormValues) => {
      if (!scholarshipId) throw new Error("Scholarship ID is required");

      // تحويل القيم إلى الأنواع المناسبة
      const formattedData = {
        ...data,
        categoryId: data.categoryId ? parseInt(data.categoryId) : null,
        levelId: data.levelId ? parseInt(data.levelId) : null,
        countryId: data.countryId ? parseInt(data.countryId) : null,
        deadline: data.deadline.toISOString(),
      };

      const response = await fetch(`/api/scholarships/${scholarshipId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error updating scholarship");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "تم تحديث المنحة الدراسية بنجاح",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/scholarships"] });
      router.push("/admin/scholarships");
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ في تحديث المنحة الدراسية",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // تقديم النموذج
  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    try {
      if (scholarshipId) {
        await updateScholarship.mutateAsync(data);
      } else {
        await createScholarship.mutateAsync(data);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // توليد الرابط النظيف من العنوان
  const generateSlug = (title: string) => {
    const slug = title
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w\u0621-\u064A\-]/g, "")
      .replace(/\-\-+/g, "-")
      .replace(/^-+/, "")
      .replace(/-+$/, "");
    form.setValue("slug", slug);
  };

  // تحديث العنوان المخصص لمحركات البحث
  const updateSeoTitle = (title: string) => {
    if (!form.getValues("seoTitle")) {
      form.setValue("seoTitle", title);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold tracking-tight">
          {scholarshipId ? "تحرير منحة دراسية" : "إضافة منحة دراسية جديدة"}
        </h1>
        <Button
          variant="outline"
          onClick={() => router.push("/admin/scholarships")}
        >
          <ArrowRight className="ml-2 h-4 w-4" />
          العودة للمنح
        </Button>
      </div>

      {isFetching ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8 pb-10"
          >
            <Card>
              <CardHeader>
                <CardTitle>المعلومات الأساسية</CardTitle>
                <CardDescription>
                  المعلومات الأساسية للمنحة الدراسية والتفاصيل المتعلقة بها
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>عنوان المنحة</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="أدخل عنوان المنحة الدراسية"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              generateSlug(e.target.value);
                              updateSeoTitle(e.target.value);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الرابط النظيف</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="رابط-نظيف-للمنحة"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          سيكون عنوان URL للمنحة{" "}
                          <code className="text-primary">
                            /scholarships/{field.value || "slug-example"}
                          </code>
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>وصف مختصر</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="أدخل وصف مختصر للمنحة الدراسية"
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          وصف مختصر يلخص المنحة الدراسية في جملة أو جملتين
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>محتوى المنحة</FormLabel>
                        <FormControl>
                          <Editor
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="أدخل محتوى المنحة الدراسية بالتفصيل..."
                          />
                        </FormControl>
                        <FormDescription>
                          الوصف التفصيلي للمنحة ومتطلباتها وكيفية التقديم
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>تفاصيل المنحة</CardTitle>
                <CardDescription>
                  المعلومات التفصيلية والتصنيفات الخاصة بالمنحة
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>التصنيف</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="اختر تصنيفاً" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories?.map((category: any) => (
                              <SelectItem
                                key={category.id}
                                value={category.id.toString()}
                              >
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="levelId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>المستوى</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="اختر مستوى" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {levels?.map((level: any) => (
                              <SelectItem
                                key={level.id}
                                value={level.id.toString()}
                              >
                                {level.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="countryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الدولة</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="اختر دولة" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {countries?.map((country: any) => (
                              <SelectItem
                                key={country.id}
                                value={country.id.toString()}
                              >
                                {country.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="organization"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>المنظمة / الجامعة</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="اسم المنظمة أو الجامعة المقدمة للمنحة"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="deadline"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>الموعد النهائي للتقديم</FormLabel>
                        <FormControl>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant={"outline"}
                                className={
                                  !field.value ? "text-muted-foreground" : ""
                                }
                              >
                                <CalendarIcon className="ml-2 h-4 w-4" />
                                {field.value ? (
                                  format(field.value, "yyyy-MM-dd", {
                                    locale: ar,
                                  })
                                ) : (
                                  <span>اختر تاريخاً</span>
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange as any}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>قيمة المنحة</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="مثل: $10,000 سنوياً"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          قيمة المنحة الدراسية إن وجدت
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>مدة المنحة</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="مثل: سنتان دراسيتان"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          مدة المنحة الدراسية إن وجدت
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="applyUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>رابط التقديم</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="أدخل رابط صفحة التقديم للمنحة"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          رابط الصفحة التي سيتم توجيه الطلاب إليها للتقديم
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="additionalLinks"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>روابط إضافية</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="روابط إضافية متعلقة بالمنحة"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          يمكنك إضافة عدة روابط بفصلها بسطر جديد
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="fullyFunded"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-x-reverse space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>منحة بتمويل كامل</FormLabel>
                          <FormDescription>
                            حدد هذا الخيار إذا كانت المنحة توفر تمويلاً كاملاً
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="featured"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-x-reverse space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>منحة مميزة</FormLabel>
                          <FormDescription>
                            حدد هذا الخيار لإظهار المنحة في قسم المنح المميزة
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>بيانات SEO</CardTitle>
                <CardDescription>
                  البيانات الوصفية لصفحة المنحة لتحسين محركات البحث
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <FormField
                    control={form.control}
                    name="seoTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>عنوان SEO</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="عنوان الصفحة لمحركات البحث"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          سيظهر هذا العنوان في نتائج البحث
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="seoDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>وصف SEO</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="وصف الصفحة لمحركات البحث"
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          سيظهر هذا الوصف في نتائج البحث
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="seoKeywords"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>كلمات مفتاحية SEO</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="كلمات مفتاحية مفصولة بفواصل"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          الكلمات المفتاحية مفصولة بفواصل (مثل: منحة, دراسة, تمويل)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/admin/scholarships")}
              >
                إلغاء
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  <>حفظ المنحة</>
                )}
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
}
