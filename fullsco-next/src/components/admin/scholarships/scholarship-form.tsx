'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  Save,
  Loader2,
  Link as LinkIcon,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

// مخطط Zod للتحقق من صحة بيانات نموذج المنحة
const scholarshipFormSchema = z.object({
  title: z.string().min(5, { message: 'العنوان يجب أن يكون 5 أحرف على الأقل' }),
  university: z.string().min(2, { message: 'اسم الجامعة مطلوب' }),
  description: z.string().min(20, { message: 'الوصف يجب أن يكون 20 حرفاً على الأقل' }),
  countryId: z.string({ required_error: 'الرجاء اختيار البلد' }),
  levelId: z.string({ required_error: 'الرجاء اختيار المستوى الدراسي' }),
  categories: z.array(z.string()).min(1, { message: 'الرجاء اختيار تصنيف واحد على الأقل' }),
  deadline: z.date({ required_error: 'الرجاء اختيار تاريخ الموعد النهائي' }),
  fundingType: z.enum(['full', 'partial', 'mixed'], { required_error: 'الرجاء اختيار نوع التمويل' }),
  amount: z.string().optional(),
  url: z.string().url({ message: 'الرجاء إدخال رابط صحيح' }),
  requirements: z.string().min(10, { message: 'متطلبات المنحة يجب أن تكون 10 أحرف على الأقل' }),
  benefits: z.string().min(10, { message: 'فوائد المنحة يجب أن تكون 10 أحرف على الأقل' }),
  status: z.enum(['active', 'closed', 'coming_soon'], { required_error: 'الرجاء اختيار حالة المنحة' }),
  featured: z.boolean().default(false),
});

// نوع بيانات نموذج المنحة
type ScholarshipFormValues = z.infer<typeof scholarshipFormSchema>;

// نوع التصنيف
interface Category {
  id: string;
  name: string;
}

// نوع البلد
interface Country {
  id: string;
  name: string;
}

// نوع المستوى الدراسي
interface Level {
  id: string;
  name: string;
}

// مكون نموذج المنحة الدراسية
export function ScholarshipForm({ scholarshipId }: { scholarshipId?: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // عينات بيانات للتصنيفات
  const [categories, setCategories] = useState<Category[]>([
    { id: '1', name: 'هندسة' },
    { id: '2', name: 'طب' },
    { id: '3', name: 'علوم حاسوب' },
    { id: '4', name: 'إدارة أعمال' },
    { id: '5', name: 'فنون' },
    { id: '6', name: 'علوم اجتماعية' },
  ]);

  // عينات بيانات للدول
  const [countries, setCountries] = useState<Country[]>([
    { id: '1', name: 'الولايات المتحدة' },
    { id: '2', name: 'المملكة المتحدة' },
    { id: '3', name: 'كندا' },
    { id: '4', name: 'أستراليا' },
    { id: '5', name: 'ألمانيا' },
    { id: '6', name: 'فرنسا' },
    { id: '7', name: 'اليابان' },
    { id: '8', name: 'سنغافورة' },
  ]);

  // عينات بيانات للمستويات الدراسية
  const [levels, setLevels] = useState<Level[]>([
    { id: '1', name: 'بكالوريوس' },
    { id: '2', name: 'ماجستير' },
    { id: '3', name: 'دكتوراه' },
    { id: '4', name: 'زمالة بحثية' },
    { id: '5', name: 'دبلوم' },
  ]);

  // إعداد نموذج React Hook Form
  const form = useForm<ScholarshipFormValues>({
    resolver: zodResolver(scholarshipFormSchema),
    defaultValues: {
      title: '',
      university: '',
      description: '',
      countryId: '',
      levelId: '',
      categories: [],
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // بعد 30 يوم من اليوم
      fundingType: 'full',
      amount: '',
      url: '',
      requirements: '',
      benefits: '',
      status: 'active',
      featured: false,
    },
  });

  // تحميل بيانات المنحة للتحرير
  useEffect(() => {
    if (scholarshipId) {
      setIsEditMode(true);
      setIsLoading(true);
      
      // في التطبيق الحقيقي، سيتم جلب بيانات المنحة من API
      // هنا نقوم بمحاكاة التحميل
      setTimeout(() => {
        // بيانات عينة للتحرير
        form.reset({
          title: 'منحة جامعة هارفارد للطلاب الدوليين',
          university: 'جامعة هارفارد',
          description: 'تقدم جامعة هارفارد منحاً دراسية للطلاب الدوليين المتميزين الذين يرغبون في متابعة دراستهم في إحدى أعرق الجامعات في العالم.',
          countryId: '1',
          levelId: '1',
          categories: ['3', '6'],
          deadline: new Date('2025-12-15'),
          fundingType: 'full',
          amount: '50000',
          url: 'https://example.com/scholarship',
          requirements: '- معدل تراكمي لا يقل عن 3.5\n- إجادة اللغة الإنجليزية\n- خطابات توصية\n- السيرة الذاتية',
          benefits: '- تغطية كاملة للرسوم الدراسية\n- راتب شهري\n- تأمين صحي\n- تذكرة سفر سنوية',
          status: 'active',
          featured: true,
        });
        setIsLoading(false);
      }, 800);
    } else {
      // في التطبيق الحقيقي، سيتم جلب التصنيفات والدول والمستويات من API
      // هنا نحن نستخدم البيانات المحددة مسبقًا
    }
  }, [scholarshipId, form]);

  // إرسال نموذج المنحة
  const onSubmit = async (data: ScholarshipFormValues) => {
    setIsLoading(true);
    try {
      // طباعة البيانات للتجربة
      console.log('Scholarship Data:', data);
      
      // محاكاة الاتصال بالخادم
      // في التطبيق الحقيقي، سيتم إرسال البيانات إلى API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: isEditMode ? 'تم تحديث المنحة الدراسية بنجاح' : 'تمت إضافة المنحة الدراسية بنجاح',
        description: isEditMode ? 'تم تحديث المنحة الدراسية وحفظ التغييرات بنجاح' : 'تمت إضافة المنحة الدراسية الجديدة بنجاح',
      });
      
      // العودة إلى صفحة قائمة المنح الدراسية
      router.push('/admin/scholarships');
    } catch (error) {
      console.error('Error submitting scholarship:', error);
      toast({
        title: 'حدث خطأ',
        description: 'لم نتمكن من حفظ المنحة الدراسية. الرجاء المحاولة مرة أخرى.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && isEditMode) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="mr-2 text-lg font-medium">جاري تحميل بيانات المنحة الدراسية...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          {isEditMode ? 'تحرير منحة دراسية' : 'إضافة منحة دراسية جديدة'}
        </h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => router.push('/admin/scholarships')}>
            <ArrowLeft className="ml-2 h-4 w-4" />
            العودة إلى القائمة
          </Button>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">المعلومات الأساسية</TabsTrigger>
              <TabsTrigger value="details">التفاصيل</TabsTrigger>
              <TabsTrigger value="options">الخيارات</TabsTrigger>
            </TabsList>

            {/* قسم المعلومات الأساسية */}
            <TabsContent value="basic" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>المعلومات الأساسية</CardTitle>
                  <CardDescription>المعلومات الرئيسية للمنحة الدراسية</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>عنوان المنحة</FormLabel>
                        <FormControl>
                          <Input placeholder="منحة جامعة هارفارد للطلاب الدوليين" {...field} />
                        </FormControl>
                        <FormDescription>عنوان مميز وواضح للمنحة الدراسية</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="university"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>اسم الجامعة / المؤسسة</FormLabel>
                        <FormControl>
                          <Input placeholder="جامعة هارفارد" {...field} />
                        </FormControl>
                        <FormDescription>اسم الجامعة أو المؤسسة التي تقدم المنحة</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>وصف المنحة</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="وصف تفصيلي للمنحة الدراسية"
                            className="min-h-[120px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>وصف كامل للمنحة الدراسية والبرنامج الأكاديمي</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="countryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>البلد</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="اختر البلد" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {countries.map(country => (
                                <SelectItem key={country.id} value={country.id}>
                                  {country.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>البلد الذي توجد فيه المنحة الدراسية</FormDescription>
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
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="اختر المستوى الدراسي" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {levels.map(level => (
                                <SelectItem key={level.id} value={level.id}>
                                  {level.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>المستوى الأكاديمي للمنحة الدراسية</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="categories"
                    render={() => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel>التصنيفات</FormLabel>
                          <FormDescription>اختر التصنيفات المناسبة للمنحة الدراسية</FormDescription>
                        </div>
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                          {categories.map((category) => (
                            <FormField
                              key={category.id}
                              control={form.control}
                              name="categories"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={category.id}
                                    className="flex flex-row items-start space-x-3 space-x-reverse rounded-md border p-4"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(category.id)}
                                        onCheckedChange={(checked) => {
                                          const current = field.value || [];
                                          return checked
                                            ? field.onChange([...current, category.id])
                                            : field.onChange(
                                                current.filter((value) => value !== category.id)
                                              );
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal">{category.name}</FormLabel>
                                  </FormItem>
                                );
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* قسم التفاصيل */}
            <TabsContent value="details" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>تفاصيل المنحة</CardTitle>
                  <CardDescription>التفاصيل المتعلقة بالتمويل والموعد النهائي</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="deadline"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>الموعد النهائي للتقديم</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={"w-full justify-between pl-3 text-left font-normal"}
                                >
                                  {field.value ? (
                                    format(field.value, 'PPP', { locale: ar })
                                  ) : (
                                    <span>اختر التاريخ</span>
                                  )}
                                  <CalendarIcon className="ml-2 h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormDescription>الموعد النهائي لتقديم طلبات المنحة</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="fundingType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>نوع التمويل</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="اختر نوع التمويل" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="full">تمويل كامل</SelectItem>
                              <SelectItem value="partial">تمويل جزئي</SelectItem>
                              <SelectItem value="mixed">تمويل مختلط</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>نوع التمويل المقدم من المنحة</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>قيمة المنحة (بالدولار)</FormLabel>
                        <FormControl>
                          <Input placeholder="25000" {...field} />
                        </FormControl>
                        <FormDescription>قيمة المنحة بالدولار الأمريكي. اتركه فارغًا إذا كانت القيمة غير محددة</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>رابط المنحة</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <LinkIcon className="absolute left-2 top-2 h-4 w-4 text-muted-foreground" />
                            <Input className="pl-8" placeholder="https://example.com/scholarship" {...field} />
                          </div>
                        </FormControl>
                        <FormDescription>رابط صفحة المنحة الرسمية للتقديم</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="requirements"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>متطلبات وشروط المنحة</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="متطلبات وشروط التقديم للمنحة الدراسية"
                            className="min-h-[150px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>قائمة بالمتطلبات والشروط للتقديم للمنحة</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="benefits"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>فوائد ومميزات المنحة</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="فوائد ومميزات المنحة الدراسية"
                            className="min-h-[150px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>قائمة بالفوائد والمميزات التي تقدمها المنحة</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* قسم الخيارات */}
            <TabsContent value="options" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>خيارات المنحة</CardTitle>
                  <CardDescription>الحالة والخيارات الإضافية للمنحة الدراسية</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>حالة المنحة</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="اختر حالة المنحة" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="active">نشطة</SelectItem>
                            <SelectItem value="closed">مغلقة</SelectItem>
                            <SelectItem value="coming_soon">قريباً</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>حالة المنحة الدراسية الحالية</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="featured"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-x-reverse rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>منحة مميزة</FormLabel>
                          <FormDescription>
                            عرض هذه المنحة في قسم المنح المميزة على الصفحة الرئيسية
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end space-x-2 space-x-reverse">
            <Button
              type="submit"
              disabled={isLoading}
              className="min-w-[120px]"
            >
              {isLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              {isLoading
                ? isEditMode
                  ? 'جاري التحديث...'
                  : 'جاري الحفظ...'
                : isEditMode
                ? 'تحديث المنحة'
                : <><Save className="ml-2 h-4 w-4" /> حفظ المنحة</>}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/admin/scholarships')}
              disabled={isLoading}
            >
              إلغاء
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
