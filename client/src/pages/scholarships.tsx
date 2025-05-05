import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useLocation } from 'wouter';
import { ArrowRight, Filter, DollarSign, Globe, GraduationCap, BarChart, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import SearchBar from '@/components/search-bar';
import { Scholarship, Level, Country, Category } from '@shared/schema';
import { Helmet } from 'react-helmet';

const Scholarships = () => {
  const [location, setLocation] = useLocation();
  
  // دالة لتحديث URL بناءً على الفلاتر
  const updateURL = (newFilters: {country: string, level: string, category: string, funded: string}) => {
    // إنشاء كائن URLSearchParams جديد
    const params = new URLSearchParams();
    
    // إضافة معلمات الفلاتر إذا كانت موجودة وليست 'all'
    if (newFilters.country && newFilters.country !== 'all') {
      params.append('country', newFilters.country);
    }
    
    if (newFilters.level && newFilters.level !== 'all') {
      params.append('level', newFilters.level);
    }
    
    if (newFilters.category && newFilters.category !== 'all') {
      params.append('category', newFilters.category);
    }
    
    if (newFilters.funded && newFilters.funded !== 'all') {
      params.append('funded', newFilters.funded);
    }
    
    // تحديث URL
    const newUrl = `/scholarships${params.toString() ? `?${params.toString()}` : ''}`;
    console.log('تحديث URL إلى:', newUrl);
    setLocation(newUrl, { replace: true });
  };
  const [filters, setFilters] = useState({
    country: '',
    level: '',
    category: '',
    funded: ''
  });

  // معالجة معلمات البحث في URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.split('?')[1]);
    const countryParam = searchParams.get('country');
    const levelParam = searchParams.get('level');
    const categoryParam = searchParams.get('category');
    const fundedParam = searchParams.get('funded');
    
    // تحديث الفلاتر فقط إذا كانت القيم الجديدة مختلفة عن القيم الحالية
    const newFilters = {
      country: countryParam || '',
      level: levelParam || '',
      category: categoryParam || '',
      funded: fundedParam || ''
    };
    
    // تحديث حالة الفلاتر إذا تغيرت معلمات URL
    if (JSON.stringify(newFilters) !== JSON.stringify(filters)) {
      console.log('تحديث الفلاتر من URL:', newFilters);
      setFilters(newFilters);
    }
  }, [location]);

  // جلب المنح الدراسية مع الفلترة
  const { data, isLoading: isLoadingScholarships } = useQuery({
    queryKey: ['/api/scholarships', filters],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (filters.country) queryParams.append('country', filters.country);
      if (filters.level) queryParams.append('level', filters.level);
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.funded === 'true') queryParams.append('funded', 'true');
      
      const response = await fetch(`/api/scholarships?${queryParams.toString()}`);
      if (!response.ok) throw new Error('فشل في جلب المنح الدراسية');
      const result = await response.json();
      return result;
    }
  });
  
  // استخراج قائمة المنح من الاستجابة
  const scholarships = data?.success ? data.data : [];

  // جلب خيارات الفلاتر
  const { data: countries } = useQuery<Country[]>({
    queryKey: ['/api/countries']
  });

  const { data: levels } = useQuery<Level[]>({
    queryKey: ['/api/levels']
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ['/api/categories']
  });

  const getCountryName = (countryId: number | null) => {
    if (countryId === null || !countries) return '';
    const country = countries.find(c => c.id === countryId);
    return country?.name || '';
  };

  const getLevelName = (levelId: number | null) => {
    if (levelId === null || !levels) return '';
    const level = levels.find(l => l.id === levelId);
    return level?.name || '';
  };

  return (
    <>
      <Helmet>
        <title>استكشف المنح الدراسية في جميع أنحاء العالم | FULLSCO</title>
        <meta name="description" content="تصفح مجموعتنا الواسعة من المنح الدراسية من جميع أنحاء العالم. استخدم الفلاتر للعثور على الفرص التي تناسب ملفك الشخصي وطموحاتك الأكاديمية." />
        <meta name="keywords" content="منح دراسية, منح تمويل كامل, منح جامعية, منح للطلاب, دراسة في الخارج, FULLSCO" />
        <meta property="og:title" content="استكشف المنح الدراسية في جميع أنحاء العالم | FULLSCO" />
        <meta property="og:description" content="تصفح مجموعتنا الواسعة من المنح الدراسية من جميع أنحاء العالم. استخدم الفلاتر للعثور على الفرص التي تناسب ملفك الشخصي وطموحاتك الأكاديمية." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://fullsco.com/scholarships" />
        <link rel="canonical" href="https://fullsco.com/scholarships" />
      </Helmet>
      
      <main className="bg-gradient-to-br from-white to-gray-50 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative mb-12 rounded-2xl bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 p-8 shadow-lg overflow-hidden">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/10 blur-3xl"></div>
            <div className="absolute -bottom-8 -left-8 h-40 w-40 rounded-full bg-accent/20 blur-3xl"></div>
            <div className="relative">
              <div className="mb-2 inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                <GraduationCap className="mr-1 h-3 w-3" /> منح دراسية عالمية
              </div>
              <h1 className="mb-4 text-4xl font-bold text-gray-900">المنح الدراسية</h1>
              <p className="mb-0 max-w-3xl text-gray-600">
                تصفح مجموعتنا الواسعة من المنح الدراسية من جميع أنحاء العالم. استخدم الفلاتر للعثور على الفرص التي تناسب ملفك الشخصي وطموحاتك الأكاديمية.
              </p>
            </div>
          </div>

          {/* البحث والفلاتر */}
          <div className="bg-white p-6 rounded-lg shadow-sm mb-8 border border-gray-200">
            <div className="mb-6">
              <SearchBar placeholder="ابحث عن منح دراسية بالكلمات المفتاحية..." fullWidth buttonText="بحث" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الدولة</label>
                <Select 
                  value={filters.country} 
                  onValueChange={(value) => {
                    // تحديث الفلاتر أولاً
                    const newFilters = {...filters, country: value};
                    setFilters(newFilters);
                    
                    // تحديث URL بناءً على الفلاتر الجديدة
                    updateURL(newFilters);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="جميع الدول" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الدول</SelectItem>
                    {countries?.map(country => (
                      <SelectItem key={country.id} value={country.id.toString()}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">المستوى الدراسي</label>
                <Select 
                  value={filters.level} 
                  onValueChange={(value) => {
                    // تحديث الفلاتر أولاً
                    const newFilters = {...filters, level: value};
                    setFilters(newFilters);
                    
                    // تحديث URL بناءً على الفلاتر الجديدة
                    updateURL(newFilters);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="جميع المستويات" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع المستويات</SelectItem>
                    {levels?.map(level => (
                      <SelectItem key={level.id} value={level.id.toString()}>
                        {level.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الفئة</label>
                <Select 
                  value={filters.category} 
                  onValueChange={(value) => {
                    // تحديث الفلاتر أولاً
                    const newFilters = {...filters, category: value};
                    setFilters(newFilters);
                    
                    // تحديث URL بناءً على الفلاتر الجديدة
                    updateURL(newFilters);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="جميع الفئات" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الفئات</SelectItem>
                    {categories?.map(category => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">التمويل</label>
                <Select 
                  value={filters.funded} 
                  onValueChange={(value) => {
                    // تحديث الفلاتر أولاً
                    const newFilters = {...filters, funded: value};
                    setFilters(newFilters);
                    
                    // تحديث URL بناءً على الفلاتر الجديدة
                    updateURL(newFilters);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="أي تمويل" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">أي تمويل</SelectItem>
                    <SelectItem value="true">ممولة بالكامل فقط</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="mt-4 flex justify-end">
              <Button variant="outline" className="ml-2" onClick={() => {
                const newFilters = { country: '', level: '', category: '', funded: '' };
                setFilters(newFilters);
                updateURL(newFilters);
              }}>
                إعادة ضبط
              </Button>
              <Button className="flex items-center">
                <Filter className="ml-2 h-4 w-4" /> تطبيق الفلاتر
              </Button>
            </div>
          </div>

          {/* إحصائيات مختصرة */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
            <Card className="bg-white hover:bg-primary/5 transition-colors duration-300 border-primary/20">
              <CardContent className="p-4 flex items-center">
                <div className="rounded-full bg-primary/10 p-3 ml-3">
                  <Globe className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">الدول</p>
                  <p className="text-lg font-bold">{countries?.length || 0}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white hover:bg-primary/5 transition-colors duration-300 border-primary/20">
              <CardContent className="p-4 flex items-center">
                <div className="rounded-full bg-primary/10 p-3 ml-3">
                  <GraduationCap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">المستويات الدراسية</p>
                  <p className="text-lg font-bold">{levels?.length || 0}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white hover:bg-primary/5 transition-colors duration-300 border-primary/20">
              <CardContent className="p-4 flex items-center">
                <div className="rounded-full bg-primary/10 p-3 ml-3">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">المنح النشطة</p>
                  <p className="text-lg font-bold">{scholarships?.length || 0}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white hover:bg-primary/5 transition-colors duration-300 border-primary/20">
              <CardContent className="p-4 flex items-center">
                <div className="rounded-full bg-primary/10 p-3 ml-3">
                  <BarChart className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">ممولة بالكامل</p>
                  <p className="text-lg font-bold">
                    {Array.isArray(scholarships) ? scholarships.filter(s => s.isFullyFunded).length : 0}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* شبكة المنح الدراسية */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {isLoadingScholarships ? 'جاري تحميل المنح الدراسية...' : `تم العثور على ${scholarships?.length || 0} منحة دراسية`}
            </h2>
            
            {isLoadingScholarships ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="h-48 bg-gray-200"></div>
                    <CardContent className="p-5">
                      <div className="h-4 w-20 bg-gray-200 mb-2 rounded"></div>
                      <div className="h-6 w-3/4 bg-gray-200 mb-2 rounded"></div>
                      <div className="h-20 bg-gray-200 mb-4 rounded"></div>
                      <div className="flex justify-between">
                        <div className="h-4 w-24 bg-gray-200 rounded"></div>
                        <div className="h-4 w-24 bg-gray-200 rounded"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : scholarships && scholarships.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {scholarships.map((scholarship) => (
                  <Card key={scholarship.id} className="group overflow-hidden border-none transition-all duration-300 hover:-translate-y-1 hover:shadow-xl shadow-lg">
                    <div className="relative overflow-hidden">
                      <img 
                        src={scholarship.imageUrl || "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3"}
                        alt={scholarship.title}
                        className="h-52 w-full object-cover transition-transform duration-700 group-hover:scale-110"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-70 group-hover:opacity-60 transition-opacity"></div>
                      
                      {/* Badges positioned on image */}
                      <div className="absolute bottom-3 right-3 flex flex-wrap gap-2">
                        <span className="rounded-full bg-white/20 backdrop-blur-md px-3 py-1 text-xs font-medium text-white shadow-md border border-white/10">
                          الموعد النهائي: {scholarship.deadline || 'مستمر'}
                        </span>
                      </div>
                      
                      {scholarship.isFullyFunded && (
                        <div className="absolute left-0 top-5 bg-gradient-to-r from-green-500 to-green-600 text-white py-1 pr-2 pl-5 text-xs font-bold shadow-md before:absolute before:content-[''] before:left-[-8px] before:top-0 before:border-t-[12px] before:border-r-[8px] before:border-b-[12px] before:border-t-green-500 before:border-r-green-500 before:border-b-transparent before:border-l-transparent">
                          تمويل كامل
                        </div>
                      )}
                    </div>
                    
                    <CardContent className="p-6 bg-white">
                      <div className="mb-3 flex items-center flex-wrap gap-2">
                        <Badge variant="secondary" className="rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                          <Globe className="ml-1 h-3 w-3" /> {getCountryName(scholarship.countryId)}
                        </Badge>
                        <Badge variant="outline" className="rounded-full border-accent/20 text-accent hover:bg-accent/5 transition-colors">
                          <GraduationCap className="ml-1 h-3 w-3" /> {getLevelName(scholarship.levelId)}
                        </Badge>
                      </div>
                      
                      <h3 className="mb-3 text-xl font-bold text-gray-900 group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                        <span onClick={() => setLocation(`/scholarships/${scholarship.slug}`)} className="cursor-pointer">
                          {scholarship.title}
                        </span>
                      </h3>
                      
                      <p className="mb-5 text-sm text-gray-600 line-clamp-3 leading-relaxed">
                        {scholarship.description}
                      </p>
                      
                      <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center text-sm font-medium text-green-600">
                          <DollarSign className="ml-1 h-4 w-4" /> 
                          <span>{scholarship.amount || 'متغير'}</span>
                        </div>
                        
                        <Link href={`/scholarships/${scholarship.slug}`}>
                          <Button variant="outline" size="sm" className="group rounded-full bg-primary/5 text-primary border-primary/20 hover:bg-primary/10 hover:border-primary/30">
                            التفاصيل <ArrowRight className="mr-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-2">لم يتم العثور على منح دراسية</h3>
                <p className="text-gray-600 mb-6">حاول ضبط الفلاتر أو معايير البحث الخاصة بك.</p>
                <Button onClick={() => {
                  const newFilters = { country: '', level: '', category: '', funded: '' };
                  setFilters(newFilters);
                  updateURL(newFilters);
                }}>
                  إعادة ضبط جميع الفلاتر
                </Button>
              </div>
            )}
          </div>

          {/* نصائح للتقديم */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">نصائح للتقديم على المنح الدراسية</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 border border-gray-100 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors">
                <h3 className="font-medium text-lg mb-2">ابحث عن المؤهلات المطلوبة</h3>
                <p className="text-gray-600 text-sm">تأكد من أنك تستوفي جميع متطلبات الأهلية قبل التقديم، بما في ذلك متطلبات الجنسية والمعدل الأكاديمي.</p>
              </div>
              <div className="p-4 border border-gray-100 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors">
                <h3 className="font-medium text-lg mb-2">إعداد وثائق قوية</h3>
                <p className="text-gray-600 text-sm">قم بإعداد وثائق تقديمك بعناية، بما في ذلك خطاب النية ورسائل التوصية والسيرة الذاتية.</p>
              </div>
              <div className="p-4 border border-gray-100 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors">
                <h3 className="font-medium text-lg mb-2">التقديم قبل الموعد النهائي</h3>
                <p className="text-gray-600 text-sm">قدم طلبك قبل الموعد النهائي بوقت كافٍ لتجنب المشكلات التقنية وتأخير الإرسال.</p>
              </div>
            </div>
          </div>

          {/* أرقام الصفحات (إذا لزم الأمر) */}
          {scholarships && scholarships.length > 9 && (
            <div className="flex justify-center mt-8">
              <Button variant="outline" className="mx-1">السابق</Button>
              <Button variant="outline" className="mx-1 bg-primary text-white">1</Button>
              <Button variant="outline" className="mx-1">2</Button>
              <Button variant="outline" className="mx-1">3</Button>
              <Button variant="outline" className="mx-1">التالي</Button>
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default Scholarships;
