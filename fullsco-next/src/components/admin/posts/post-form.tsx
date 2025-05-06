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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  title: z.string().min(5, {
    message: "عنوان المقال يجب أن يكون على الأقل 5 أحرف",
  }),
  slug: z.string().min(3, {
    message: "الرابط يجب أن يكون على الأقل 3 أحرف",
  }),
  excerpt: z.string().min(10, {
    message: "الملخص يجب أن يكون على الأقل 10 أحرف",
  }),
  content: z.string().min(30, {
    message: "محتوى المقال يجب أن يكون على الأقل 30 حرفًا",
  }),
  categoryId: z.string({
    required_error: "يجب اختيار تصنيف",
  }),
  authorId: z.string().optional(),
  published: z.boolean().default(false),
  featuredImage: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  seoKeywords: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface PostFormProps {
  postId?: string;
}

export default function PostForm({ postId }: PostFormProps = {}) {
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

  // جلب المستخدمين (المؤلفين)
  const { data: users } = useQuery({
    queryKey: ["/api/users"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/users");
        if (!response.ok) {
          return []; // العودة بمصفوفة فارغة إذا كان المستخدم غير مصرح له
        }
        return response.json();
      } catch (error) {
        console.error("Error fetching users:", error);
        return [];
      }
    },
  });

  // إنشاء نموذج للتحقق والإرسال
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      categoryId: "",
      authorId: "", // سيتم تعيينه للمستخدم الحالي على الخادم
      published: false,
      featuredImage: "",
      seoTitle: "",
      seoDescription: "",
      seoKeywords: "",
    },
  });

  // جلب بيانات المقال في حالة التحرير
  useEffect(() => {
    const fetchPost = async () => {
      if (!postId) return;

      setIsFetching(true);
      try {
        const response = await fetch(`/api/posts/${postId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch post");
        }

        const post = await response.json();

        // تعيين القيم الافتراضية للنموذج
        form.reset({
          title: post.title || "",
          slug: post.slug || "",
          excerpt: post.excerpt || "",
          content: post.content || "",
          categoryId: post.categoryId?.toString() || "",
          authorId: post.authorId?.toString() || "",
          published: post.published || false,
          featuredImage: post.featuredImage || "",
          seoTitle: post.seoTitle || "",
          seoDescription: post.seoDescription || "",
          seoKeywords: post.seoKeywords || "",
        });
      } catch (error) {
        console.error("Error fetching post:", error);
        toast({
          title: "خطأ في جلب بيانات المقال",
          variant: "destructive",
        });
      } finally {
        setIsFetching(false);
      }
    };

    fetchPost();
  }, [postId, form, toast]);

  // جلب بيانات المستخدم الحالي
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch("/api/auth/me");
        if (response.ok) {
          const userData = await response.json();
          if (userData && userData.id && !postId) {
            form.setValue("authorId", userData.id.toString());
          }
        }
      } catch (error) {
        console.error("Error fetching current user:", error);
      }
    };

    fetchCurrentUser();
  }, [form, postId]);

  // إنشاء مقال جديد
  const createPost = useMutation({
    mutationFn: async (data: FormValues) => {
      // تحويل القيم إلى الأنواع المناسبة
      const formattedData = {
        ...data,
        categoryId: data.categoryId ? parseInt(data.categoryId) : null,
        authorId: data.authorId ? parseInt(data.authorId) : null,
      };

      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error creating post");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "تمت إضافة المقال بنجاح",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      router.push("/admin/posts");
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ في إضافة المقال",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // تحديث مقال موجود
  const updatePost = useMutation({
    mutationFn: async (data: FormValues) => {
      if (!postId) throw new Error("Post ID is required");

      // تحويل القيم إلى الأنواع المناسبة
      const formattedData = {
        ...data,
        categoryId: data.categoryId ? parseInt(data.categoryId) : null,
        authorId: data.authorId ? parseInt(data.authorId) : null,
      };

      const response = await fetch(`/api/posts/${postId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error updating post");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "تم تحديث المقال بنجاح",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      router.push("/admin/posts");
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ في تحديث المقال",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // تقديم النموذج
  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    try {
      if (postId) {
        await updatePost.mutateAsync(data);
      } else {
        await createPost.mutateAsync(data);
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
          {postId ? "تحرير مقال" : "إضافة مقال جديد"}
        </h1>
        <Button
          variant="outline"
          onClick={() => router.push("/admin/posts")}
        >
          <ArrowRight className="ml-2 h-4 w-4" />
          العودة للمقالات
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
                  المعلومات الأساسية للمقال والتفاصيل المتعلقة به
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>عنوان المقال</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="أدخل عنوان المقال"
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
                            placeholder="رابط-نظيف-للمقال"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          سيكون عنوان URL للمقال{" "}
                          <code className="text-primary">
                            /articles/{field.value || "slug-example"}
                          </code>
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="excerpt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ملخص المقال</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="أدخل ملخص مختصر للمقال"
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        ملخص قصير للمقال يظهر في صفحة المقالات ونتائج البحث
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
                      <FormLabel>محتوى المقال</FormLabel>
                      <FormControl>
                        <Editor
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="اكتب محتوى المقال هنا..."
                        />
                      </FormControl>
                      <FormDescription>
                        المحتوى الرئيسي للمقال
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>تصنيف ونشر</CardTitle>
                <CardDescription>
                  تصنيف المقال وخيارات النشر
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                  {users && users.length > 0 && (
                    <FormField
                      control={form.control}
                      name="authorId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>المؤلف</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="اختر مؤلفاً" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {users.map((user: any) => (
                                <SelectItem
                                  key={user.id}
                                  value={user.id.toString()}
                                >
                                  {user.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>

                <FormField
                  control={form.control}
                  name="featuredImage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الصورة الرئيسية</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="رابط الصورة الرئيسية"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        رابط الصورة الرئيسية للمقال (يمكن تركه فارغاً)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="published"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">حالة النشر</FormLabel>
                        <FormDescription>
                          تفعيل هذا الخيار سيجعل المقال منشوراً للزوار
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
                  البيانات الوصفية لصفحة المقال لتحسين محركات البحث
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
                onClick={() => router.push("/admin/posts")}
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
                  <>حفظ المقال</>
                )}
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
}
