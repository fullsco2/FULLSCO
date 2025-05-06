'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
  PlusCircle,
  RefreshCw,
  Search,
  Filter,
  FileText,
  Trash,
  Pencil,
  Eye,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// نوع المنحة الدراسية
interface Scholarship {
  id: number;
  title: string;
  university: string;
  country: string;
  deadline: string;
  level: string;
  status: 'active' | 'closed' | 'coming_soon';
}

// نموذج بيانات لأغراض العرض
const scholarshipsData: Scholarship[] = [
  {
    id: 1,
    title: 'منحة جامعة هارفارد للطلاب الدوليين',
    university: 'جامعة هارفارد',
    country: 'الولايات المتحدة',
    deadline: '2025-12-15',
    level: 'بكالوريوس',
    status: 'active',
  },
  {
    id: 2,
    title: 'منحة جامعة أكسفورد للدراسات العليا',
    university: 'جامعة أكسفورد',
    country: 'المملكة المتحدة',
    deadline: '2025-10-30',
    level: 'ماجستير',
    status: 'active',
  },
  {
    id: 3,
    title: 'منحة جامعة طوكيو للبحث العلمي',
    university: 'جامعة طوكيو',
    country: 'اليابان',
    deadline: '2024-12-01',
    level: 'دكتوراه',
    status: 'closed',
  },
  {
    id: 4,
    title: 'منحة جامعة السوربون للطلاب الدوليين',
    university: 'جامعة السوربون',
    country: 'فرنسا',
    deadline: '2026-01-15',
    level: 'بكالوريوس',
    status: 'coming_soon',
  },
  {
    id: 5,
    title: 'منحة جامعة برلين التقنية',
    university: 'جامعة برلين التقنية',
    country: 'ألمانيا',
    deadline: '2025-09-30',
    level: 'ماجستير',
    status: 'active',
  },
];

export function ScholarshipsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [scholarships, setScholarships] = useState<Scholarship[]>(scholarshipsData);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  
  const itemsPerPage = 10;
  
  // تصفية المنح الدراسية بناءً على البحث والفلاتر
  const filteredScholarships = scholarships.filter((scholarship) => {
    // تصفية البحث
    const matchesSearch = (
      scholarship.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scholarship.university.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scholarship.country.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // تصفية الحالة
    const matchesStatus = statusFilter === 'all' || scholarship.status === statusFilter;
    
    // تصفية المستوى
    const matchesLevel = levelFilter === 'all' || scholarship.level === levelFilter;
    
    return matchesSearch && matchesStatus && matchesLevel;
  });
  
  // تقسيم الصفحات
  const totalPages = Math.ceil(filteredScholarships.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedScholarships = filteredScholarships.slice(startIndex, startIndex + itemsPerPage);

  // محاكاة جلب البيانات
  const fetchScholarships = () => {
    setIsLoading(true);
    // في التطبيق الحقيقي، سيتم استدعاء API هنا
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };

  // تنسيق التاريخ
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy');
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

  // الانتقال إلى صفحة إضافة منحة جديدة
  const handleAddScholarship = () => {
    router.push('/admin/scholarships/create');
  };

  // عرض شكل التحميل
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">إدارة المنح الدراسية</h2>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-[100px]" />
            <Skeleton className="h-9 w-[100px]" />
          </div>
        </div>
        <div className="rounded-md border">
          <div className="p-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <Skeleton className="h-9 w-[250px]" />
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Skeleton className="h-9 w-[120px]" />
                <Skeleton className="h-9 w-[120px]" />
              </div>
            </div>
          </div>
          <div className="relative w-full overflow-auto">
            <div className="p-4">
              {Array(5).fill(0).map((_, i) => (
                <div key={i} className="mb-4 flex flex-col gap-2">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <h2 className="text-2xl font-bold">إدارة المنح الدراسية</h2>
        <div className="flex w-full gap-2 md:w-auto">
          <Button variant="outline" size="sm" onClick={fetchScholarships}>
            <RefreshCw className="ml-2 h-4 w-4" />
            تحديث
          </Button>
          <Button size="sm" onClick={handleAddScholarship}>
            <PlusCircle className="ml-2 h-4 w-4" />
            إضافة منحة
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <div className="border-b p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:w-auto">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="بحث عن منحة دراسية..."
                className="pl-8 md:w-[300px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">تصفية:</span>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-8 w-[150px]">
                  <SelectValue placeholder="الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="active">نشطة</SelectItem>
                  <SelectItem value="closed">مغلقة</SelectItem>
                  <SelectItem value="coming_soon">قريباً</SelectItem>
                </SelectContent>
              </Select>
              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger className="h-8 w-[150px]">
                  <SelectValue placeholder="المستوى" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع المستويات</SelectItem>
                  <SelectItem value="بكالوريوس">بكالوريوس</SelectItem>
                  <SelectItem value="ماجستير">ماجستير</SelectItem>
                  <SelectItem value="دكتوراه">دكتوراه</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <div className="relative w-full overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px] text-center">#</TableHead>
                <TableHead>عنوان المنحة</TableHead>
                <TableHead className="hidden md:table-cell">الجامعة</TableHead>
                <TableHead className="hidden md:table-cell">البلد</TableHead>
                <TableHead className="hidden md:table-cell">الموعد النهائي</TableHead>
                <TableHead className="hidden md:table-cell">المستوى</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead className="text-left">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedScholarships.length > 0 ? (
                paginatedScholarships.map((scholarship) => (
                  <TableRow key={scholarship.id}>
                    <TableCell className="text-center font-medium">{scholarship.id}</TableCell>
                    <TableCell className="font-medium">{scholarship.title}</TableCell>
                    <TableCell className="hidden md:table-cell">{scholarship.university}</TableCell>
                    <TableCell className="hidden md:table-cell">{scholarship.country}</TableCell>
                    <TableCell className="hidden md:table-cell">{formatDate(scholarship.deadline)}</TableCell>
                    <TableCell className="hidden md:table-cell">{scholarship.level}</TableCell>
                    <TableCell>{renderStatusBadge(scholarship.status)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">فتح قائمة</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>الإجراءات</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => router.push(`/admin/scholarships/${scholarship.id}`)}>
                            <Eye className="ml-2 h-4 w-4" />
                            عرض
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => router.push(`/admin/scholarships/${scholarship.id}/edit`)}>
                            <Pencil className="ml-2 h-4 w-4" />
                            تعديل
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-600"
                            onClick={() => {
                              // تنفيذ حذف المنحة الدراسية
                              if (window.confirm('هل أنت متأكد من حذف هذه المنحة الدراسية؟')) {
                                // في التطبيق الحقيقي، سيتم استدعاء API هنا لحذف المنحة
                                console.log(`Deleting scholarship with ID: ${scholarship.id}`);
                              }
                            }}
                          >
                            <Trash className="ml-2 h-4 w-4" />
                            حذف
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <FileText className="h-8 w-8 text-muted-foreground/50" />
                      <p className="mt-2">لا توجد منح دراسية متاحة حالياً</p>
                      <p className="text-sm">يمكنك إضافة منحة جديدة من الزر أعلاه</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        {filteredScholarships.length > 0 && (
          <div className="flex items-center justify-between border-t px-4 py-2">
            <div className="text-sm text-muted-foreground">
              عرض {Math.min(startIndex + 1, filteredScholarships.length)} إلى {Math.min(startIndex + itemsPerPage, filteredScholarships.length)} من {filteredScholarships.length} منحة
            </div>
            <div className="flex items-center space-x-2 space-x-reverse">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              >
                <span className="sr-only">الصفحة الأولى</span>
                <ChevronsRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <span className="sr-only">الصفحة السابقة</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <span className="flex items-center gap-1 text-sm font-medium">
                الصفحة
                <span className="mx-1 text-muted-foreground">{currentPage}</span>
                من
                <span className="mx-1 text-muted-foreground">{totalPages || 1}</span>
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <span className="sr-only">الصفحة التالية</span>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                <span className="sr-only">الصفحة الأخيرة</span>
                <ChevronsLeft className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
