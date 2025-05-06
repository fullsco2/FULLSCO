'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Building,
  Pencil,
  Calendar,
  Globe,
  GraduationCap,
  FileDown,
  DollarSign,
  Check,
  Link as LinkIcon,
  ListChecks,
  Award,
  AlertCircle,
  Loader2,
  ExternalLink,
  Trash,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
} from '@/components/ui/alert-dialog';

// نوع المنحة الدراسية
interface Scholarship {
  id: number;
  title: string;
  university: string;
  description: string;
  country: string;
  deadline: string;
  level: string;
  fundingType: 'full' | 'partial' | 'mixed';
  amount?: string;
  url: string;
  requirements: string;
  benefits: string;
  status: 'active' | 'closed' | 'coming_soon';
  featured: boolean;
  categories: string[];
  createdAt: string;
  updatedAt: string;
}

export function ScholarshipDetail({ scholarshipId }: { scholarshipId: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [scholarship, setScholarship] = useState<Scholarship | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  // جلب بيانات المنحة من API
  useEffect(() => {
    const fetchScholarship = async () => {
      setIsLoading(true);
      try {
        // التحقق من حالة المصادقة أولاً
        const authResponse = await fetch('/api/auth/me');
        
        if (!authResponse.ok) {
          throw new Error('يجب تسجيل الدخول لعرض تفاصيل المنحة');
        }
        
        // جلب بيانات المنحة من API
        const response = await fetch(`/api/scholarships/${scholarshipId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('المنحة الدراسية غير موجودة');
          }
          throw new Error(`خطأ في جلب بيانات المنحة: ${response.status}`);
        }
        
        // محاولة جلب بيانات مفصلة أولاً
        try {
          const data = await response.json();
          
          // التحقق من بنية البيانات المستلمة
          if (data && data.id) {
            // إذا كانت البيانات مباشرة في الرد
            setScholarship(data);
          } else if (data && data.data && data.data.id) {
            // إذا كانت البيانات مغلفة في حقل data
            setScholarship(data.data);
          } else if (data && Array.isArray(data)) {
            // إذا كان الرد عبارة عن مصفوفة
            const scholarshipItem = data.find(item => item.id === parseInt(scholarshipId));
            if (scholarshipItem) {
              setScholarship(scholarshipItem);
            } else {
              // إذا لم يتم العثور على المنحة في المصفوفة
              throw new Error('لم يتم العثور على المنحة الدراسية');
            }
          } else if (data && Array.isArray(data.data)) {
            // إذا كانت المصفوفة مغلفة في حقل data
            const scholarshipItem = data.data.find(item => item.id === parseInt(scholarshipId));
            if (scholarshipItem) {
              setScholarship(scholarshipItem);
            } else {
              throw new Error('لم يتم العثور على المنحة الدراسية');
            }
          } else {
            // إذا لم يتم العثور على بيانات صالحة
            throw new Error('بنية البيانات المستلمة غير متوقعة');
          }
        } catch (parseError) {
          // إذا فشل تحليل JSON، نحاول جلب قائمة كاملة والبحث عن المنحة
          console.error('Error parsing scholarship data:', parseError);
          
          // جلب قائمة المنح الدراسية
          const fallbackResponse = await fetch('/api/scholarships');
          if (!fallbackResponse.ok) {
            throw new Error('فشل في جلب قائمة المنح الدراسية');
          }
          
          const allData = await fallbackResponse.json();
          let scholarshipList = [];
          
          if (allData && Array.isArray(allData)) {
            scholarshipList = allData;
          } else if (allData && allData.data && Array.isArray(allData.data)) {
            scholarshipList = allData.data;
          } else if (allData && allData.success && allData.data && Array.isArray(allData.data)) {
            scholarshipList = allData.data;
          }
          
          // البحث عن المنحة المطلوبة
          const scholarshipItem = scholarshipList.find(item => item.id === parseInt(scholarshipId));
          if (scholarshipItem) {
            setScholarship(scholarshipItem);
          } else {
            throw new Error('لم يتم العثور على المنحة الدراسية');
          }
        }
      } catch (error) {
        console.error('Error fetching scholarship details:', error);
        toast({
          title: 'خطأ في جلب البيانات',
          description: 'حدث خطأ أثناء جلب تفاصيل المنحة الدراسية',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchScholarship();
  }, [scholarshipId, toast]);

  // حذف منحة دراسية عبر API
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      // التحقق من حالة المصادقة أولاً
      const authResponse = await fetch('/api/auth/me');
      
      if (!authResponse.ok) {
        throw new Error('يجب تسجيل الدخول لحذف المنحة');
      }

      // محاولة حذف المنحة عبر API
      const response = await fetch(`/api/scholarships/${scholarshipId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error('ليس لديك صلاحية حذف المنحة');
        }
        if (response.status === 404) {
          throw new Error('المنحة الدراسية غير موجودة');
        }
        throw new Error(`خطأ في حذف المنحة: ${response.status}`);
      }
      
      // تم الحذف بنجاح
      toast({
        title: 'تم حذف المنحة الدراسية',
        description: 'تم حذف المنحة الدراسية بنجاح',
      });
      
      // العودة إلى قائمة المنح
      router.push('/admin/scholarships');
    } catch (error) {
      console.error('Error deleting scholarship:', error);
      toast({
        title: 'خطأ في الحذف',
        description: error instanceof Error ? error.message : 'حدث خطأ أثناء محاولة حذف المنحة الدراسية',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // تنسيق التاريخ
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'PPP', { locale: ar });
    } catch (error) {
      return dateString;
    }
  };

  // عرض شارة الحالة
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-500 hover:bg-green-600">نشطة</Badge>;
      case 'closed':
        return <Badge variant="destructive">مغلقة</Badge>;
      case 'coming_soon':
        return <Badge variant="outline" className="border-amber-500 text-amber-500">قريباً</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // عرض نوع التمويل
  const renderFundingType = (type: string) => {
    switch (type) {
      case 'full':
        return 'تمويل كامل';
      case 'partial':
        return 'تمويل جزئي';
      case 'mixed':
        return 'تمويل مختلط';
      default:
        return type;
    }
  };

  // عرض شاشة التحميل
  if (isLoading) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="mr-2 text-lg font-medium">جاري تحميل تفاصيل المنحة الدراسية...</span>
      </div>
    );
  }

  // إذا لم يتم العثور على المنحة
  if (!scholarship) {
    return (
      <Card className="mx-auto max-w-2xl border-destructive">
        <CardHeader className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
          <CardTitle className="mt-2 text-xl">المنحة الدراسية غير موجودة</CardTitle>
          <CardDescription className="text-destructive">
            لم يتم العثور على المنحة الدراسية المطلوبة
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-center">
          <Button onClick={() => router.push('/admin/scholarships')}>
            <ArrowLeft className="ml-2 h-4 w-4" />
            العودة إلى قائمة المنح
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* عنوان الصفحة وأزرار الإجراءات */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold">تفاصيل المنحة الدراسية</h2>
          <p className="text-sm text-muted-foreground">عرض وإدارة تفاصيل المنحة الدراسية</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => router.push('/admin/scholarships')}>
            <ArrowLeft className="ml-2 h-4 w-4" />
            العودة
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => router.push(`/admin/scholarships/${scholarshipId}/edit`)}
          >
            <Pencil className="ml-2 h-4 w-4" />
            تحرير
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash className="ml-2 h-4 w-4" />
                حذف
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>هل أنت متأكد من حذف هذه المنحة؟</AlertDialogTitle>
                <AlertDialogDescription>
                  سيتم حذف هذه المنحة الدراسية بشكل نهائي. لا يمكن التراجع عن هذا الإجراء.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>إلغاء</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                      جاري الحذف...
                    </>
                  ) : (
                    'نعم، حذف المنحة'
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* بطاقة العنوان والمعلومات الأساسية */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-xl">{scholarship.title}</CardTitle>
              <CardDescription className="flex items-center gap-1">
                <Building className="h-4 w-4" />
                <span>{scholarship.university}</span>
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {renderStatusBadge(scholarship.status)}
              {scholarship.featured && (
                <Badge variant="outline" className="border-blue-500 text-blue-500">مميزة</Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          {/* المعلومات الأساسية */}
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-muted-foreground">البلد</span>
                <span className="flex items-center gap-1 font-medium">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  {scholarship.country}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-muted-foreground">المستوى الدراسي</span>
                <span className="flex items-center gap-1 font-medium">
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                  {scholarship.level}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-muted-foreground">الموعد النهائي</span>
                <span className="flex items-center gap-1 font-medium">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  {formatDate(scholarship.deadline)}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-muted-foreground">نوع التمويل</span>
                <span className="flex items-center gap-1 font-medium">
                  <FileDown className="h-4 w-4 text-muted-foreground" />
                  {renderFundingType(scholarship.fundingType)}
                </span>
              </div>
            </div>
            {scholarship.amount && (
              <div className="rounded-md bg-muted p-3">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  <span className="text-base font-semibold">
                    {scholarship.amount} دولار أمريكي
                  </span>
                </div>
              </div>
            )}
            <div>
              <h3 className="mb-2 text-sm font-medium text-muted-foreground">التصنيفات</h3>
              <div className="flex flex-wrap gap-2">
                {scholarship.categories.map((category, index) => (
                  <Badge key={index} variant="secondary">{category}</Badge>
                ))}
              </div>
            </div>
            <div>
              <h3 className="mb-2 text-sm font-medium text-muted-foreground">رابط التقديم</h3>
              <a 
                href={scholarship.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-blue-600 hover:underline"
              >
                {scholarship.url}
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
          
          {/* الوصف */}
          <div className="rounded-lg border p-4">
            <h3 className="mb-2 text-sm font-semibold">وصف المنحة</h3>
            <p className="text-sm text-muted-foreground">{scholarship.description}</p>
          </div>
        </CardContent>
      </Card>

      {/* عرض التفاصيل الأخرى بشكل علامات تبويب */}
      <Tabs defaultValue="requirements" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="requirements">المتطلبات والشروط</TabsTrigger>
          <TabsTrigger value="benefits">الفوائد والمميزات</TabsTrigger>
        </TabsList>
        <TabsContent value="requirements" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ListChecks className="h-5 w-5 text-primary" />
                متطلبات وشروط المنحة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="whitespace-pre-line rounded-md bg-muted p-4">
                {scholarship.requirements}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="benefits" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                فوائد ومميزات المنحة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="whitespace-pre-line rounded-md bg-muted p-4">
                {scholarship.benefits}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* معلومات الإنشاء والتحديث */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border p-4 text-sm text-muted-foreground">
        <div>
          <span className="ml-1 font-medium">تاريخ الإنشاء:</span>
          {formatDate(scholarship.createdAt)}
        </div>
        <div>
          <span className="ml-1 font-medium">آخر تحديث:</span>
          {formatDate(scholarship.updatedAt)}
        </div>
      </div>
    </div>
  );
}
