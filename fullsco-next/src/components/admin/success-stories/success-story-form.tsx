"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
import { ArrowRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Editor } from "@/components/editor";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

// تعريف مخطط التحقق للنموذج
const formSchema = z.object({
  name: z.string().min(3, {
    message: "اسم الشخص يجب أن يكون على الأقل 3 أحرف",
  }),
  slug: z.string().min(3, {
    message: "الرابط يجب أن يكون على الأقل 3 أحرف",
  }),
  description: z.string().min(10, {
    message: "الوصف المختصر يجب أن يكون على الأقل 10 أحرف",
  }),
  content: z.string().min(30, {
    message: "محتوى القصة يجب أن يكون على الأقل 30 حرفًا",
  }),
  image: z.string().optional(),
  video: z.string().optional(),
  quote: z.string().optional(),
  published: z.boolean().default(false),
  major: z.string().optional(),
  university: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  seoKeywords: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface SuccessStoryFormProps {
  storyId?: string;
}

export default function SuccessStoryForm({ storyId }: SuccessStoryFormProps = {}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  // إنشاء نموذج للتحقق والإرسال
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      content: "",
      image: "",
      video: "",
      quote: "",
      published: true,
      major: "",
      university: "",
      seoTitle: "",
      seoDescription: "",
      seoKeywords: "",
    },
  });

  // جلب بيانات قصة النجاح في حالة التحرير
  useEffect(() => {
    const fetchSuccessStory = async () => {
      if (!storyId) return;

      setIsFetching(true);
      try {
        const response = await fetch(`/api/success-stories/${storyId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch success story");
        }

        const story = await response.json();

        // تعيين القيم الافتراضية للنموذج
        form.reset({
          name: story.name || "",
          slug: story.slug || "",
          description: story.description || "",
          content: story.content || "",
          image: story.image || "",
          video: story.video || "",
          quote: story.quote || "",
          published: story.published || true,
          major: story.major || "",
          university: story.university || "",
          seoTitle: story.seoTitle || "",
          seoDescription: story.seoDescription || "",
          seoKeywords: story.seoKeywords || "",
        });
      } catch (error) {
        console.error("Error fetching success story:", error);
        toast({
          title: "خطأ في جلب بيانات قصة النجاح",
          variant: "destructive",
        });
      } finally {
        setIsFetching(false);
      }
    };

    fetchSuccessStory();
  }, [storyId, form, toast]);

  // إنشاء قصة نجاح جديدة
  const createSuccessStory = useMutation({
    mutationFn: async (data: FormValues) => {
      const response = await fetch("/api/success-stories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error creating success story");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "تمت إضافة قصة النجاح بنجاح",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/success-stories"] });
      router.push("/admin/success-stories");
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ في إضافة قصة النجاح",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // تحديث قصة نجاح موجودة
  const updateSuccessStory = useMutation({
    mutationFn: async (data: FormValues) => {
      if (!storyId) throw new Error("Success story ID is required");

      const response = await fetch(`/api/success-stories/${storyId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error updating success story");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "تم تحديث قصة النجاح بنجاح",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/success-stories"] });
      router.push("/admin/success-stories");
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ في تحديث قصة النجاح",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // تقديم النموذج
  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    try {
      if (storyId) {
        await updateSuccessStory.mutateAsync(data);
      } else {
        await createSuccessStory.mutateAsync(data);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // توليد الرابط النظيف من الاسم
  const generateSlug = (name: string) => {
    const slug = name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w\u0621-\u064A\-]/g, "")
      .replace(/\-\-+/g, "-")
      .replace(/^-+/, "")
      .replace(/-+$/, "");
    form.setValue("slug", slug);
  };

  // تحديث العنوان المخصص لمحركات البحث
  const updateSeoTitle = (name: string) => {
    if (!form.getValues("seoTitle")) {
      form.setValue("seoTitle", name);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold tracking-tight">
          {storyId ? "تحرير قصة نجاح" : "إضافة قصة نجاح جديدة"}
        </h1>
        <Button
          variant="outline"
          onClick={() => router.push("/admin/success-stories")}
        >
          <ArrowRight className="ml-2 h-4 w-4" />
          العودة لقصص النجاح
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
                  المعلومات الأساسية لقصة النجاح والتفاصيل المتعلقة بها
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>اسم صاحب القصة</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="أدخل اسم صاحب قصة النجاح"
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
                            placeholder="رابط-نظيف-للقصة"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          سيكون عنوان URL للقصة{" "}
                          <code className="text-primary">
                            /success-stories/{field.value || "slug-example"}
                          </code>
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>وصف مختصر</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="أدخل وصف مختصر لقصة النجاح"
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        وصف مختصر يلخص قصة النجاح في جملة أو جملتين
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
                      <FormLabel>محتوى القصة</FormLabel>
                      <FormControl>
                        <Editor
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="اكتب محتوى قصة النجاح هنا..."
                        />
                      </FormControl>
                      <FormDescription>
                        المحتوى الرئيسي لقصة النجاح
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>تفاصيل إضافية</CardTitle>
                <CardDescription>
                  معلومات إضافية ووسائط لقصة النجاح
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="major"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>التخصص</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="التخصص الدراسي"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="university"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الجامعة</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="اسم الجامعة"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="quote"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>اقتباس</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="اقتباس مميز من صاحب القصة"
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        اقتباس من صاحب القصة يعكس تجربته
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="image"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>صورة صاحب القصة</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="رابط الصورة"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          رابط لصورة صاحب قصة النجاح
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="video"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>فيديو القصة</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="رابط الفيديو (يوتيوب أو غيره)"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          رابط فيديو لقصة النجاح (اختياري)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="published"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">حالة النشر</FormLabel>
                        <FormDescription>
                          تفعيل هذا الخيار سيجعل قصة النجاح منشورة للزوار
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
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>بيانات SEO</CardTitle>
                <CardDescription>
                  البيانات الوصفية لصفحة قصة النجاح لتحسين محركات البحث
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
                          الكلمات المفتاحية مفصولة بفواصل (مثل: قصة نجاح, منحة دراسية, طالب)
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
                onClick={() => router.push("/admin/success-stories")}
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
                  <>حفظ قصة النجاح</>
                )}
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
}
