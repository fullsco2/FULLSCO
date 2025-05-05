import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { formatDate, cn } from "@/lib/utils";
import AdminLayout from "@/components/admin/admin-layout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  PlusCircle,
  Plus,
  Search,
  Edit,
  Trash2,
  ExternalLink,
  XCircle,
  Filter,
  ChevronDown,
  MoreHorizontal,
  ArrowUpDown,
  CalendarIcon,
  GraduationCap,
  MapPin,
  Clock,
  Award,
  Globe,
  Bookmark,
  Check,
  BookOpen,
  Star,
  LayoutGrid
} from "lucide-react";
import { Scholarship, Country, Level, Category } from "@shared/schema";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const AdminScholarships = () => {
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const isMobile = useIsMobile();
  const [viewMode, setViewMode] = useState<"table" | "card">("table");
  const [activeFilters, setActiveFilters] = useState<{
    country?: number;
    level?: number;
    featured?: boolean;
  }>({});
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  }>({
    key: "title",
    direction: "asc"
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/admin/login");
    }
  }, [authLoading, isAuthenticated, navigate]);

  // تذكر وضع العرض المفضل
  useEffect(() => {
    const savedViewMode = localStorage.getItem("scholarship-view-mode") as "table" | "card";
    if (savedViewMode) {
      setViewMode(savedViewMode);
    } else if (isMobile) {
      // استخدام بطاقات في وضع الجوال افتراضيًا
      setViewMode("card");
    }
  }, [isMobile]);

  const handleViewModeChange = (mode: "table" | "card") => {
    setViewMode(mode);
    localStorage.setItem("scholarship-view-mode", mode);
  };

  // Fetch scholarships
  const {
    data: scholarshipsResponse,
    isLoading,
    error,
  } = useQuery<{ success: boolean; data: Scholarship[] }>({
    queryKey: ["/api/scholarships"],
    enabled: isAuthenticated,
  });

  // استخراج المنح الدراسية من البيانات المستجابة
  const scholarships = scholarshipsResponse?.data || [];

  // Fetch related data
  const { data: countriesResponse } = useQuery<{ success?: boolean, data?: Country[] } | Country[]>({
    queryKey: ["/api/countries"],
    enabled: isAuthenticated,
  });
  
  // استخراج الدول من البيانات المستجابة
  const countries = Array.isArray(countriesResponse)
    ? countriesResponse
    : countriesResponse?.data || [];

  const { data: levelsResponse } = useQuery<{ success?: boolean, data?: Level[] } | Level[]>({
    queryKey: ["/api/levels"],
    enabled: isAuthenticated,
  });
  
  // استخراج المستويات الدراسية من البيانات المستجابة
  const levels = Array.isArray(levelsResponse)
    ? levelsResponse
    : levelsResponse?.data || [];

  const { data: categoriesResponse } = useQuery<{ success?: boolean, data?: Category[] } | Category[]>({
    queryKey: ["/api/categories"],
    enabled: isAuthenticated,
  });
  
  // استخراج التصنيفات من البيانات المستجابة
  const categories = Array.isArray(categoriesResponse)
    ? categoriesResponse
    : categoriesResponse?.data || [];

  // Delete scholarship mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/scholarships/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "تم حذف المنحة",
        description: "تم حذف المنحة الدراسية بنجاح.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/scholarships"] });
      setShowDeleteDialog(false);
    },
    onError: (error) => {
      toast({
        title: "خطأ",
        description: `فشل في حذف المنحة: ${error}`,
        variant: "destructive",
      });
    },
  });

  const handleDeleteClick = (id: number) => {
    setDeleteId(id);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (deleteId !== null) {
      deleteMutation.mutate(deleteId);
    }
  };

  const getCountryName = (countryId?: number | null) => {
    if (!countryId || !countries) return "";
    const country = countries.find((c) => c.id === countryId);
    return country?.name || "";
  };

  const getLevelName = (levelId?: number | null) => {
    if (!levelId || !levels) return "";
    const level = levels.find((l) => l.id === levelId);
    return level?.name || "";
  };

  const getCategoryName = (categoryId?: number | null) => {
    if (!categoryId || !categories) return "";
    const category = categories.find((c) => c.id === categoryId);
    return category?.name || "";
  };

  // فلترة المنح بناءً على المعايير المحددة
  const getFilteredScholarships = () => {
    if (!scholarships) return [];

    // أولاً، فلترة بناءً على مصطلح البحث
    let filtered = scholarships.filter((scholarship) => {
      if (!searchTerm) return true;
      const search = searchTerm.toLowerCase();
      
      // التأكد من وجود النص قبل استخدام toLowerCase
      const title = scholarship.title?.toLowerCase() || '';
      const description = scholarship.description?.toLowerCase() || '';
      const countryName = getCountryName(scholarship.countryId).toLowerCase();
      const levelName = getLevelName(scholarship.levelId).toLowerCase();
      
      return (
        title.includes(search) ||
        description.includes(search) ||
        countryName.includes(search) ||
        levelName.includes(search)
      );
    });

    // ثم فلترة بناءً على المرشحات النشطة
    if (activeFilters.country) {
      filtered = filtered.filter(
        (scholarship) => scholarship.countryId === activeFilters.country
      );
    }

    if (activeFilters.level) {
      filtered = filtered.filter(
        (scholarship) => scholarship.levelId === activeFilters.level
      );
    }

    if (activeFilters.featured !== undefined) {
      filtered = filtered.filter(
        (scholarship) => scholarship.isFeatured === activeFilters.featured
      );
    }

    // ترتيب النتائج
    filtered.sort((a, b) => {
      const direction = sortConfig.direction === "asc" ? 1 : -1;
      if (sortConfig.key === "title") {
        return (a.title || "").localeCompare(b.title || "") * direction;
      }
      if (sortConfig.key === "country") {
        return getCountryName(a.countryId).localeCompare(getCountryName(b.countryId)) * direction;
      }
      if (sortConfig.key === "level") {
        return getLevelName(a.levelId).localeCompare(getLevelName(b.levelId)) * direction;
      }
      if (sortConfig.key === "deadline") {
        const dateA = a.deadline ? new Date(a.deadline).getTime() : 0;
        const dateB = b.deadline ? new Date(b.deadline).getTime() : 0;
        return (dateA - dateB) * direction;
      }
      return 0;
    });

    return filtered;
  };

  const toggleSort = (key: string) => {
    if (sortConfig.key === key) {
      setSortConfig({
        key,
        direction: sortConfig.direction === "asc" ? "desc" : "asc",
      });
    } else {
      setSortConfig({
        key,
        direction: "asc",
      });
    }
  };
  
  const filteredScholarships = getFilteredScholarships();
  
  const activeFilterCount = Object.keys(activeFilters).filter(
    (key) => activeFilters[key as keyof typeof activeFilters] !== undefined
  ).length;

  const clearFilters = () => {
    setActiveFilters({});
  };

  const getTableActions = (scholarship: Scholarship) => (
    <div className="flex justify-start gap-2">
      <Link
        href={`/scholarships/${scholarship.slug}`}
        target="_blank"
      >
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          title="عرض المنحة"
        >
          <ExternalLink className="h-4 w-4" />
        </Button>
      </Link>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => navigate(`/admin/scholarships/edit/${scholarship.id}`)}
        title="تعديل المنحة"
      >
        <Edit className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
        onClick={() => handleDeleteClick(scholarship.id)}
        title="حذف المنحة"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="p-4 rounded-full bg-primary/10 mb-4">
          <Award className="h-10 w-10 animate-pulse text-primary" />
        </div>
        <p className="text-muted-foreground animate-pulse font-medium">جاري التحميل...</p>
      </div>
    );
  }

  // العناصر التي ستظهر في شريط الإجراءات
  const actionItems = (
    <div className="flex gap-2">
      {/* زر تغيير وضع العرض */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-9 gap-1">
            <span className="hidden md:inline-block">عرض</span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem 
            className={viewMode === "table" ? "bg-muted" : ""}
            onClick={() => handleViewModeChange("table")}
          >
            <BookOpen className="ml-2 h-4 w-4" />
            جدول
          </DropdownMenuItem>
          <DropdownMenuItem 
            className={viewMode === "card" ? "bg-muted" : ""}
            onClick={() => handleViewModeChange("card")}
          >
            <LayoutGrid className="ml-2 h-4 w-4" />
            بطاقات
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      {/* زر المرشحات */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-9 gap-1" title="فلترة المنح">
            <Filter className="h-4 w-4" />
            <span className="hidden md:inline-block">فلترة</span>
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>فلترة المنح</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {/* فلترة حسب الدولة */}
          <div className="px-2 py-1.5">
            <span className="text-xs font-medium mb-1 block">الدولة</span>
            <Select
              value={activeFilters.country?.toString() || ""}
              onValueChange={(value) => setActiveFilters({
                ...activeFilters,
                country: value ? parseInt(value) : undefined
              })}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="جميع الدول" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">جميع الدول</SelectItem>
                {countries?.map((country) => (
                  <SelectItem key={country.id} value={country.id.toString()}>
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* فلترة حسب المستوى */}
          <div className="px-2 py-1.5">
            <span className="text-xs font-medium mb-1 block">المستوى الدراسي</span>
            <Select
              value={activeFilters.level?.toString() || ""}
              onValueChange={(value) => setActiveFilters({
                ...activeFilters,
                level: value ? parseInt(value) : undefined
              })}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="جميع المستويات" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">جميع المستويات</SelectItem>
                {levels?.map((level) => (
                  <SelectItem key={level.id} value={level.id.toString()}>
                    {level.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* فلترة حسب الحالة المميزة */}
          <div className="px-2 py-1.5">
            <span className="text-xs font-medium mb-1 block">الحالة</span>
            <Select
              value={
                activeFilters.featured === undefined 
                  ? "" 
                  : activeFilters.featured 
                    ? "featured" 
                    : "regular"
              }
              onValueChange={(value) => setActiveFilters({
                ...activeFilters,
                featured: value === "" 
                  ? undefined 
                  : value === "featured"
              })}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="جميع المنح" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">جميع المنح</SelectItem>
                <SelectItem value="featured">منح مميزة</SelectItem>
                <SelectItem value="regular">منح عادية</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <DropdownMenuSeparator />
          <div className="px-2 py-1.5">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs h-8"
              onClick={clearFilters}
              disabled={activeFilterCount === 0}
            >
              إعادة تعيين المرشحات
            </Button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );

  return (
    <AdminLayout title="المنح الدراسية" actions={actionItems} breadcrumbs={
      <div className="text-sm flex items-center">
        <Link href="/admin" className="hover:text-foreground">
          لوحة التحكم
        </Link>
        <span className="mx-2">/</span>
        <span>المنح الدراسية</span>
      </div>
    }>
      <div className="w-full mx-auto">
        {/* نظرة عامة عن المنح الدراسية والإحصائيات */}
        <div className="grid grid-cols-2 gap-2 mb-5">
          <div className="flex flex-col items-center justify-center bg-muted/30 rounded-md py-2">
            <div className="flex items-center justify-center mb-1">
              <Award className="h-4 w-4 text-primary ml-1.5" />
              <span className="text-sm">إجمالي المنح</span>
            </div>
            {isLoading ? (
              <Skeleton className="h-5 w-10" />
            ) : (
              <div className="text-lg font-bold">{scholarships?.length || 0}</div>
            )}
          </div>

          <div className="flex flex-col items-center justify-center bg-amber-50 rounded-md py-2">
            <div className="flex items-center justify-center mb-1">
              <Star className="h-4 w-4 text-amber-500 ml-1.5" />
              <span className="text-sm">المنح المميزة</span>
            </div>
            {isLoading ? (
              <Skeleton className="h-5 w-10" />
            ) : (
              <div className="text-lg font-bold">
                {scholarships?.filter(s => s.isFeatured).length || 0}
              </div>
            )}
          </div>

          <div className="flex flex-col items-center justify-center bg-blue-50 rounded-md py-2">
            <div className="flex items-center justify-center mb-1">
              <Globe className="h-4 w-4 text-blue-500 ml-1.5" />
              <span className="text-sm">الدول</span>
            </div>
            {isLoading ? (
              <Skeleton className="h-5 w-10" />
            ) : (
              <div className="text-lg font-bold">
                {countries?.length || 0}
              </div>
            )}
          </div>

          <div className="flex flex-col items-center justify-center bg-green-50 rounded-md py-2">
            <div className="flex items-center justify-center mb-1">
              <GraduationCap className="h-4 w-4 text-green-600 ml-1.5" />
              <span className="text-sm">المستويات</span>
            </div>
            {isLoading ? (
              <Skeleton className="h-5 w-10" />
            ) : (
              <div className="text-lg font-bold">
                {levels?.length || 0}
              </div>
            )}
          </div>
        </div>

        {/* قسم البحث وضوابط الصفحة */}
        <div className="mb-5 flex flex-col md:flex-row gap-2">
          <div className="w-full md:w-1/2">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ابحث عن المنح..."
                className="pr-8 h-9 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2 md:mr-auto">
            {/* زر التبديل بين طرق العرض */}
            <Button 
              variant="outline"
              size="sm"
              className="h-9 gap-1"
              onClick={() => handleViewModeChange(viewMode === "table" ? "card" : "table")}
            >
              {viewMode === "table" ? <LayoutGrid className="h-4 w-4 ml-1" /> : <BookOpen className="h-4 w-4 ml-1" />}
              {viewMode === "table" ? "بطاقات" : "جدول"}
            </Button>
            
            {/* زر إضافة منحة جديدة */}
            <Button 
              size="sm" 
              className="h-9"
              onClick={() => navigate('/admin/scholarships/create')}
            >
              <Plus className="h-4 w-4 ml-1" />
              منحة جديدة
            </Button>
          </div>
        </div>

        {/* عرض المنح */}
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-5 w-24" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6 mt-2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12 border rounded-lg bg-card">
            <XCircle className="h-12 w-12 text-destructive mx-auto mb-2" />
            <h3 className="text-lg font-medium mb-1">
              خطأ في تحميل المنح الدراسية
            </h3>
            <p className="text-muted-foreground">يرجى المحاولة مرة أخرى لاحقًا.</p>
          </div>
        ) : filteredScholarships.length > 0 ? (
          isMobile ? (
            // عرض البطاقات على الجوال دائماً
            <div className="grid grid-cols-1 gap-2">
              {filteredScholarships.map((scholarship) => (
                <div key={scholarship.id} className="border rounded-md bg-card overflow-hidden">
                  <div className="p-3 relative">
                    <h3 className="font-medium text-sm mb-2 pr-6 truncate">
                      {scholarship.title}
                    </h3>
                    
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {scholarship.isFeatured && (
                        <div className="inline-flex items-center text-xs text-amber-700 bg-amber-50 py-1 px-2 rounded">
                          <Star className="h-3.5 w-3.5 ml-1 fill-amber-500 text-amber-500" />
                          مميز
                        </div>
                      )}
                      <div className="inline-flex items-center text-xs text-muted-foreground bg-muted/40 py-1 px-2 rounded">
                        <MapPin className="h-3.5 w-3.5 ml-1" />
                        {getCountryName(scholarship.countryId)}
                      </div>
                      <div className="inline-flex items-center text-xs text-muted-foreground bg-muted/40 py-1 px-2 rounded">
                        <GraduationCap className="h-3.5 w-3.5 ml-1" />
                        {getLevelName(scholarship.levelId)}
                      </div>
                    </div>
                    
                    <div className="text-xs text-muted-foreground flex items-center">
                      <Clock className="h-3.5 w-3.5 flex-shrink-0 ml-1" />
                      <span className="truncate">
                        {scholarship.deadline ? 
                          `آخر موعد: ${scholarship.deadline}` : 
                          "مستمر التقديم"
                        }
                      </span>
                    </div>
                    
                    <div className="absolute top-2 left-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 w-7 p-0"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            onClick={() => navigate(`/admin/scholarships/edit/${scholarship.id}`)}
                          >
                            <Edit className="ml-2 h-4 w-4" />
                            تعديل
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => window.open(`/scholarships/${scholarship.slug}`, '_blank')}
                          >
                            <ExternalLink className="ml-2 h-4 w-4" />
                            عرض
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleDeleteClick(scholarship.id)}
                          >
                            <Trash2 className="ml-2 h-4 w-4" />
                            حذف
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  
                  <div className="flex border-t py-1.5 px-3 bg-muted/30 justify-between">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="h-8 px-2 text-xs"
                      onClick={() => window.open(`/scholarships/${scholarship.slug}`, '_blank')}
                    >
                      <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                      عرض
                    </Button>
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="destructive" 
                        size="sm"
                        className="h-8 px-2 text-xs"
                        onClick={() => handleDeleteClick(scholarship.id)}
                      >
                        <Trash2 className="ml-1.5 h-3.5 w-3.5" />
                        حذف
                      </Button>
                      <Button 
                        variant="secondary" 
                        size="sm"
                        className="h-8 px-2 text-xs"
                        onClick={() => navigate(`/admin/scholarships/edit/${scholarship.id}`)}
                      >
                        <Edit className="ml-1.5 h-3.5 w-3.5" />
                        تعديل
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : viewMode === "table" ? (
            <div className="bg-card border rounded-md overflow-hidden">
              <div className="overflow-x-auto -mx-3 sm:mx-0">
                <Table className="min-w-full sm:min-w-0">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="cursor-pointer whitespace-nowrap px-2 md:px-4" onClick={() => toggleSort("title")}>
                        <div className="flex items-center">
                          العنوان
                          {sortConfig.key === "title" && (
                            <ChevronDown 
                              className={cn(
                                "h-4 w-4 ml-1", 
                                sortConfig.direction === "desc" && "rotate-180"
                              )} 
                            />
                          )}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="hidden md:table-cell cursor-pointer whitespace-nowrap px-2 md:px-4" 
                        onClick={() => toggleSort("country")}
                      >
                        <div className="flex items-center">
                          الدولة
                          {sortConfig.key === "country" && (
                            <ChevronDown 
                              className={cn(
                                "h-4 w-4 ml-1", 
                                sortConfig.direction === "desc" && "rotate-180"
                              )} 
                            />
                          )}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="hidden md:table-cell cursor-pointer whitespace-nowrap px-2 md:px-4" 
                        onClick={() => toggleSort("level")}
                      >
                        <div className="flex items-center">
                          المستوى
                          {sortConfig.key === "level" && (
                            <ChevronDown 
                              className={cn(
                                "h-4 w-4 ml-1", 
                                sortConfig.direction === "desc" && "rotate-180"
                              )} 
                            />
                          )}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="hidden lg:table-cell cursor-pointer whitespace-nowrap px-2 md:px-4" 
                        onClick={() => toggleSort("deadline")}
                      >
                        <div className="flex items-center">
                          الموعد النهائي
                          {sortConfig.key === "deadline" && (
                            <ChevronDown 
                              className={cn(
                                "h-4 w-4 ml-1", 
                                sortConfig.direction === "desc" && "rotate-180"
                              )} 
                            />
                          )}
                        </div>
                      </TableHead>
                      <TableHead className="whitespace-nowrap px-2 md:px-4">الحالة</TableHead>
                      <TableHead className="text-left whitespace-nowrap px-2 md:px-4">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredScholarships.map((scholarship) => (
                      <TableRow key={scholarship.id}>
                        <TableCell className="font-medium px-2 md:px-4">
                          <div className="max-w-[180px] md:max-w-[220px] truncate">
                            {scholarship.title}
                          </div>
                          <div className="md:hidden text-xs text-muted-foreground mt-1">
                            {getCountryName(scholarship.countryId)} • {getLevelName(scholarship.levelId)}
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell px-2 md:px-4">
                          {getCountryName(scholarship.countryId)}
                        </TableCell>
                        <TableCell className="hidden md:table-cell px-2 md:px-4">
                          {getLevelName(scholarship.levelId)}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell px-2 md:px-4">
                          {scholarship.deadline || "مستمر"}
                        </TableCell>
                        <TableCell className="px-2 md:px-4">
                          {scholarship.isFeatured ? (
                            <Badge className="bg-amber-500/10 border-amber-200 text-amber-700 hover:bg-amber-500/20">
                              <Star className="h-3 w-3 ml-1 fill-amber-500 text-amber-500" />
                              <span className="hidden sm:inline">مميز</span>
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              <span className="hidden sm:inline">عادي</span>
                              <span className="inline sm:hidden">-</span>
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="px-2 md:px-4">
                          {getTableActions(scholarship)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : (
            // عرض البطاقات
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {filteredScholarships.map((scholarship) => (
                <Card key={scholarship.id} className="overflow-hidden border rounded-md">
                  <CardHeader className="pb-2 px-3 py-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-sm md:text-base line-clamp-1">
                        {scholarship.title}
                      </CardTitle>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 -mt-1 -mr-1">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            onClick={() => navigate(`/admin/scholarships/edit/${scholarship.id}`)}
                          >
                            <Edit className="ml-2 h-4 w-4" />
                            تعديل
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => window.open(`/scholarships/${scholarship.slug}`, '_blank')}
                          >
                            <ExternalLink className="ml-2 h-4 w-4" />
                            عرض
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleDeleteClick(scholarship.id)}
                          >
                            <Trash2 className="ml-2 h-4 w-4" />
                            حذف
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <CardDescription className="line-clamp-1 text-xs">
                      {scholarship.description || "بدون وصف"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-3 py-2">
                    <div className="flex flex-wrap gap-1 mb-2">
                      {scholarship.isFeatured && (
                        <Badge className="bg-amber-500/10 border-amber-200 text-amber-700 text-[10px] md:text-xs">
                          <Star className="h-3 w-3 ml-1 fill-amber-500 text-amber-500" />
                          مميز
                        </Badge>
                      )}
                      <Badge variant="outline" className="gap-1 text-muted-foreground text-[10px] md:text-xs">
                        <MapPin className="h-3 w-3" />
                        {getCountryName(scholarship.countryId)}
                      </Badge>
                      <Badge variant="outline" className="gap-1 text-muted-foreground text-[10px] md:text-xs">
                        <GraduationCap className="h-3 w-3" />
                        {getLevelName(scholarship.levelId)}
                      </Badge>
                    </div>
                    <div className="text-[10px] md:text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">
                        {scholarship.deadline ? 
                          `آخر موعد: ${scholarship.deadline}` : 
                          "مستمر التقديم"
                        }
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0 flex justify-between px-3 py-2 border-t bg-muted/30">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-[10px] md:text-xs text-muted-foreground h-7 px-2"
                      onClick={() => navigate(`/admin/scholarships/edit/${scholarship.id}`)}
                    >
                      <Edit className="ml-1 h-3 w-3" />
                      تعديل
                    </Button>
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-[10px] md:text-xs text-destructive h-7 px-2"
                        onClick={() => handleDeleteClick(scholarship.id)}
                      >
                        <Trash2 className="ml-1 h-3 w-3" />
                        حذف
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-[10px] md:text-xs text-muted-foreground h-7 px-2"
                        asChild
                      >
                        <Link href={`/scholarships/${scholarship.slug}`} target="_blank">
                          <ExternalLink className="ml-1 h-3 w-3" />
                          عرض
                        </Link>
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )
        ) : (
          <div className="text-center py-12 border rounded-lg bg-card">
            {searchTerm || activeFilterCount > 0 ? (
              <>
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-2 opacity-50" />
                <h3 className="text-lg font-medium mb-1">
                  لم يتم العثور على منح مطابقة
                </h3>
                <p className="text-muted-foreground mb-4">
                  حاول تغيير معايير البحث أو المرشحات للعثور على نتائج
                </p>
                <Button variant="outline" onClick={clearFilters}>
                  إعادة تعيين المرشحات
                </Button>
              </>
            ) : (
              <>
                <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-2 opacity-50" />
                <h3 className="text-lg font-medium mb-1">
                  لا توجد منح دراسية حتى الآن
                </h3>
                <p className="text-muted-foreground mb-4">
                  قم بإنشاء أول منحة باستخدام زر "إضافة منحة جديدة".
                </p>
                <Button asChild>
                  <Link href="/admin/scholarships/create">
                    <PlusCircle className="ml-2 h-4 w-4" />
                    إضافة منحة جديدة
                  </Link>
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      {/* نافذة تأكيد الحذف */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>حذف المنحة الدراسية</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من رغبتك في حذف هذه المنحة؟ لا يمكن التراجع عن هذا الإجراء.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              إلغاء
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "جاري الحذف..." : "حذف"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminScholarships;
