import { useEffect } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { slugify } from "@/lib/utils";
import Sidebar from "@/components/admin/sidebar";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { SafeCheckbox } from "@/components/ui/safe-checkbox";
import { SafeInput } from "@/components/ui/safe-input";
import { SafeTextarea } from "@/components/ui/safe-textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { insertScholarshipSchema, Country, Level, Category } from "@shared/schema";

// Extend the schema to make the slug field optional (it will be auto-generated)
const createScholarshipSchema = insertScholarshipSchema
  .extend({
    slug: z.string().optional(),
  })
  .refine(
    (data) => {
      // If country, level, and category IDs are provided, ensure they are numbers
      if (data.countryId) return typeof data.countryId === "number";
      if (data.levelId) return typeof data.levelId === "number";
      if (data.categoryId) return typeof data.categoryId === "number";
      return true;
    },
    {
      message: "IDs must be numbers",
      path: ["countryId"],
    }
  );

type CreateScholarshipFormValues = z.infer<typeof createScholarshipSchema>;

const CreateScholarship = () => {
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/admin/login");
    }
  }, [authLoading, isAuthenticated, navigate]);

  // Fetch reference data
  const { data: countries } = useQuery<Country[]>({
    queryKey: ["/api/countries"],
    enabled: isAuthenticated,
  });

  const { data: levels } = useQuery<Level[]>({
    queryKey: ["/api/levels"],
    enabled: isAuthenticated,
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
    enabled: isAuthenticated,
  });

  // Set up form
  const form = useForm<CreateScholarshipFormValues>({
    resolver: zodResolver(createScholarshipSchema),
    defaultValues: {
      title: "",
      description: "",
      deadline: "",
      amount: "",
      isFeatured: false,
      isFullyFunded: false,
      requirements: "",
      applicationLink: "",
      imageUrl: "",
    },
  });

  // Create scholarship mutation
  const createMutation = useMutation({
    mutationFn: async (values: CreateScholarshipFormValues) => {
      // Generate slug if not provided
      if (!values.slug) {
        values.slug = slugify(values.title);
      }

      // Convert string IDs to numbers
      if (values.countryId) {
        if (typeof values.countryId === "string") {
          values.countryId = parseInt(values.countryId, 10);
        }
        // Ensure it's a valid number
        if (isNaN(values.countryId)) {
          delete values.countryId;
        }
      }
      
      if (values.levelId) {
        if (typeof values.levelId === "string") {
          values.levelId = parseInt(values.levelId, 10);
        }
        // Ensure it's a valid number
        if (isNaN(values.levelId)) {
          delete values.levelId;
        }
      }
      
      if (values.categoryId) {
        if (typeof values.categoryId === "string") {
          values.categoryId = parseInt(values.categoryId, 10);
        }
        // Ensure it's a valid number
        if (isNaN(values.categoryId)) {
          delete values.categoryId;
        }
      }

      const response = await apiRequest("POST", "/api/scholarships", values);
      return response.json();
    },
    onSuccess: (data) => {
      console.log("Scholarship created successfully:", data);
      toast({
        title: "تم إنشاء المنحة بنجاح",
        description: "تمت إضافة المنحة الدراسية بنجاح إلى قاعدة البيانات",
      });

      // إبطال جميع الاستعلامات المتعلقة بالمنح الدراسية
      queryClient.invalidateQueries();
      
      // تأخير قصير قبل التنقل للسماح للاستعلامات بإعادة التحميل
      setTimeout(() => {
        navigate("/admin/scholarships");
      }, 500);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create scholarship: ${error}`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: CreateScholarshipFormValues) => {
    createMutation.mutate(values);
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        Loading...
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen relative overflow-x-hidden">
      {/* السايدبار للجوال */}
      <Sidebar 
        isMobileOpen={false} 
        onClose={() => {}} 
      />
      
      {/* المحتوى الرئيسي */}
      <div className="w-full md:mr-64 transition-all duration-300">
        <main className="p-4 md:p-6">
          <div className="mb-6">
            <Button
              variant="outline"
              className="mb-4"
              onClick={() => navigate("/admin/scholarships")}
            >
              <ArrowLeft className="ml-2 h-4 w-4" /> العودة إلى المنح الدراسية
            </Button>
            <h1 className="text-xl md:text-2xl font-bold">
              إضافة منحة دراسية جديدة
            </h1>
          </div>

          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>معلومات المنحة الدراسية</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>عنوان المنحة</FormLabel>
                        <FormControl>
                          <SafeInput placeholder="أدخل عنوان المنحة الدراسية" {...field} />
                        </FormControl>
                        <FormDescription>
                          أدخل عنوانًا وصفيًا للمنحة الدراسية.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                      control={form.control}
                      name="countryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>الدولة</FormLabel>
                          <Select
                            onValueChange={(value) => field.onChange(parseInt(value, 10))}
                            defaultValue={field.value?.toString()}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="اختر الدولة" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {countries?.map((country) => (
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

                    <FormField
                      control={form.control}
                      name="levelId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>المستوى الدراسي</FormLabel>
                          <Select
                            onValueChange={(value) => field.onChange(parseInt(value, 10))}
                            defaultValue={field.value?.toString()}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="اختر المستوى" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {levels?.map((level) => (
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
                      name="categoryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>التصنيف</FormLabel>
                          <Select
                            onValueChange={(value) => field.onChange(parseInt(value, 10))}
                            defaultValue={field.value?.toString()}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="اختر التصنيف" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories?.map((category) => (
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
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الوصف</FormLabel>
                        <FormControl>
                          <SafeTextarea
                            placeholder="وصف تفصيلي للمنحة الدراسية"
                            className="min-h-32"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="deadline"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>الموعد النهائي</FormLabel>
                          <FormControl>
                            <SafeInput placeholder="أدخل الموعد النهائي للتقديم" {...field} />
                          </FormControl>
                          <FormDescription>
                            أدخل التاريخ أو الفترة المحددة للتقديم.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>قيمة المنحة</FormLabel>
                          <FormControl>
                            <SafeInput placeholder="مثال: $10,000 سنوياً" {...field} />
                          </FormControl>
                          <FormDescription>
                            أدخل المبلغ المقدم في المنحة، أو وصفاً لما تغطيه.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="isFeatured"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-x-reverse space-y-0 rounded-md border border-border p-4">
                        <FormControl>
                          <SafeCheckbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>منحة مميزة</FormLabel>
                          <FormDescription>
                            سيتم عرض هذه المنحة في قسم "المنح المميزة" على الصفحة الرئيسية.
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isFullyFunded"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-x-reverse space-y-0 rounded-md border border-border p-4">
                        <FormControl>
                          <SafeCheckbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>منحة ممولة بالكامل</FormLabel>
                          <FormDescription>
                            حدد هذا الخيار إذا كانت المنحة تغطي جميع التكاليف.
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="requirements"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>متطلبات المنحة</FormLabel>
                        <FormControl>
                          <SafeTextarea
                            placeholder="شروط الأهلية ومعايير التقديم"
                            className="min-h-24"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="applicationLink"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>رابط التقديم</FormLabel>
                        <FormControl>
                          <SafeInput placeholder="https://..." {...field} dir="ltr" />
                        </FormControl>
                        <FormDescription>
                          أدخل الرابط الرسمي للتقديم على المنحة.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>رابط الصورة</FormLabel>
                        <FormControl>
                          <SafeInput placeholder="https://..." {...field} />
                        </FormControl>
                        <FormDescription>
                          أدخل رابط لصورة تمثل هذه المنحة.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full md:w-auto"
                    disabled={createMutation.isPending}
                  >
                    {createMutation.isPending ? "جاري الإنشاء..." : "إنشاء المنحة"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default CreateScholarship;