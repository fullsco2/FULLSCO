import { useQuery } from '@tanstack/react-query';
import { 
  FileText, 
  GraduationCap, 
  Users, 
  TrendingUp, 
  Activity,
  Settings,
  PlusCircle,
  Globe,
  BookOpen,
  Palette,
  Medal,
  BarChart4,
  Clock,
  ArrowUpRight
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import AdminLayout from '@/components/admin/admin-layout';
import { Link } from 'wouter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// احصائيات وهمية للعرض
const mockVisits = [
  { date: '1 مايو', visits: 250 },
  { date: '2 مايو', visits: 320 },
  { date: '3 مايو', visits: 280 },
  { date: '4 مايو', visits: 410 },
  { date: '5 مايو', visits: 390 },
  { date: '6 مايو', visits: 450 },
  { date: '7 مايو', visits: 520 },
];

const recentActivities = [
  { id: 1, action: 'تسجيل مستخدم جديد', time: 'منذ 5 دقائق', user: 'محمد أحمد' },
  { id: 2, action: 'إضافة منحة جديدة', time: 'منذ 2 ساعة', user: 'سارة علي' },
  { id: 3, action: 'تعديل مقال', time: 'منذ 4 ساعات', user: 'فاطمة محمد' },
  { id: 4, action: 'تعديل إعدادات الموقع', time: 'منذ 6 ساعات', user: 'خالد عمر' },
  { id: 5, action: 'اشتراك جديد بالنشرة البريدية', time: 'منذ 8 ساعات', user: 'أحمد محمود' },
];

const AdminDashboard = () => {
  const { user } = useAuth();
  
  // Fetch statistics
  const { data: scholarships } = useQuery({
    queryKey: ['/api/scholarships'],
  });

  const { data: posts } = useQuery({
    queryKey: ['/api/posts'],
  });

  const { data: users } = useQuery({
    queryKey: ['/api/users'],
  });

  const { data: subscribers } = useQuery({
    queryKey: ['/api/subscribers'],
  });

  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  return (
    <AdminLayout title="لوحة التحكم" actions={null}>
      {/* Welcome Panel */}
      <div className="bg-gradient-to-l from-blue-600 via-blue-500 to-blue-400 text-white p-8 rounded-xl shadow-lg mb-8 relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-3">مرحباً بك في لوحة إدارة FULLSCO</h2>
          <p className="text-blue-50 mb-6 max-w-3xl opacity-90">يمكنك إدارة محتوى الموقع، متابعة الإحصائيات، وتخصيص جميع الإعدادات من هنا. استخدم الخيارات أدناه للوصول السريع للأقسام المختلفة.</p>
          
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" asChild className="bg-white/20 hover:bg-white/30 text-white border-0">
              <Link href="/admin/scholarships/create">
                <PlusCircle className="h-4 w-4 ml-2" />
                إضافة منحة جديدة
              </Link>
            </Button>
            <Button variant="secondary" asChild className="bg-white/20 hover:bg-white/30 text-white border-0">
              <Link href="/admin/appearance">
                <Palette className="h-4 w-4 ml-2" />
                تخصيص المظهر
              </Link>
            </Button>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-5 left-5 w-40 h-40 rounded-full bg-white"></div>
          <div className="absolute bottom-5 right-20 w-60 h-60 rounded-full bg-white"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-8">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
            <TabsTrigger value="analytics">الإحصائيات</TabsTrigger>
            <TabsTrigger value="activity">آخر الأنشطة</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-none shadow-md bg-gradient-to-br from-blue-50 to-white">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="bg-blue-100 p-3 rounded-xl">
                      <GraduationCap className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex items-center text-xs text-blue-600">
                      <TrendingUp className="h-3 w-3 ml-1" />
                      <span>+15% هذا الشهر</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    <h3 className="text-3xl font-bold text-gray-800">
                      {Array.isArray(scholarships) ? formatNumber(scholarships.length) : 0}
                    </h3>
                    <p className="text-gray-500">إجمالي المنح</p>
                  </div>
                  <div className="mt-3">
                    <Progress value={65} className="h-1.5 bg-blue-100" />
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button variant="link" asChild className="p-0 h-auto text-blue-600 hover:text-blue-700">
                    <Link href="/admin/scholarships">
                      إدارة المنح
                      <ArrowUpRight className="h-3.5 w-3.5 mr-1" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>

              <Card className="border-none shadow-md bg-gradient-to-br from-green-50 to-white">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="bg-green-100 p-3 rounded-xl">
                      <Users className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="flex items-center text-xs text-green-600">
                      <TrendingUp className="h-3 w-3 ml-1" />
                      <span>+8% هذا الشهر</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    <h3 className="text-3xl font-bold text-gray-800">
                      {Array.isArray(users) ? formatNumber(users.length) : 0}
                    </h3>
                    <p className="text-gray-500">المستخدمين</p>
                  </div>
                  <div className="mt-3">
                    <Progress value={42} className="h-1.5 bg-green-100" />
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button variant="link" asChild className="p-0 h-auto text-green-600 hover:text-green-700">
                    <Link href="/admin/users">
                      إدارة المستخدمين
                      <ArrowUpRight className="h-3.5 w-3.5 mr-1" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>

              <Card className="border-none shadow-md bg-gradient-to-br from-purple-50 to-white">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="bg-purple-100 p-3 rounded-xl">
                      <FileText className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="flex items-center text-xs text-purple-600">
                      <TrendingUp className="h-3 w-3 ml-1" />
                      <span>+22% هذا الشهر</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    <h3 className="text-3xl font-bold text-gray-800">
                      {Array.isArray(posts) ? formatNumber(posts.length) : 0}
                    </h3>
                    <p className="text-gray-500">المقالات</p>
                  </div>
                  <div className="mt-3">
                    <Progress value={78} className="h-1.5 bg-purple-100" />
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button variant="link" asChild className="p-0 h-auto text-purple-600 hover:text-purple-700">
                    <Link href="/admin/posts">
                      إدارة المقالات
                      <ArrowUpRight className="h-3.5 w-3.5 mr-1" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>

              <Card className="border-none shadow-md bg-gradient-to-br from-amber-50 to-white">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="bg-amber-100 p-3 rounded-xl">
                      <Users className="h-6 w-6 text-amber-600" />
                    </div>
                    <div className="flex items-center text-xs text-amber-600">
                      <TrendingUp className="h-3 w-3 ml-1" />
                      <span>+33% هذا الشهر</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    <h3 className="text-3xl font-bold text-gray-800">
                      {Array.isArray(subscribers) ? formatNumber(subscribers.length) : 0}
                    </h3>
                    <p className="text-gray-500">المشتركين</p>
                  </div>
                  <div className="mt-3">
                    <Progress value={92} className="h-1.5 bg-amber-100" />
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button variant="link" asChild className="p-0 h-auto text-amber-600 hover:text-amber-700">
                    <Link href="/admin/subscribers">
                      إدارة المشتركين
                      <ArrowUpRight className="h-3.5 w-3.5 mr-1" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>

            {/* Quick Actions & System Status */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="ml-2 h-5 w-5 text-blue-500" />
                    الإجراءات السريعة
                  </CardTitle>
                  <CardDescription>
                    انتقل سريعاً للمهام الأكثر استخداماً
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <Button variant="outline" asChild className="h-auto py-6 px-4 flex flex-col items-center justify-center gap-3 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200">
                      <Link href="/admin/scholarships/create">
                        <GraduationCap className="h-8 w-8" />
                        <span>إضافة منحة</span>
                      </Link>
                    </Button>
                    
                    <Button variant="outline" asChild className="h-auto py-6 px-4 flex flex-col items-center justify-center gap-3 hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200">
                      <Link href="/admin/posts/create">
                        <BookOpen className="h-8 w-8" />
                        <span>إنشاء مقال</span>
                      </Link>
                    </Button>
                    
                    <Button variant="outline" asChild className="h-auto py-6 px-4 flex flex-col items-center justify-center gap-3 hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200">
                      <Link href="/admin/success-stories/create">
                        <Medal className="h-8 w-8" />
                        <span>قصة نجاح</span>
                      </Link>
                    </Button>
                    
                    <Button variant="outline" asChild className="h-auto py-6 px-4 flex flex-col items-center justify-center gap-3 hover:bg-green-50 hover:text-green-600 hover:border-green-200">
                      <Link href="/admin/categories">
                        <Globe className="h-8 w-8" />
                        <span>التصنيفات</span>
                      </Link>
                    </Button>
                    
                    <Button variant="outline" asChild className="h-auto py-6 px-4 flex flex-col items-center justify-center gap-3 hover:bg-sky-50 hover:text-sky-600 hover:border-sky-200">
                      <Link href="/admin/appearance">
                        <Palette className="h-8 w-8" />
                        <span>المظهر</span>
                      </Link>
                    </Button>
                    
                    <Button variant="outline" asChild className="h-auto py-6 px-4 flex flex-col items-center justify-center gap-3 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200">
                      <Link href="/admin/site-settings">
                        <Settings className="h-8 w-8" />
                        <span>الإعدادات</span>
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart4 className="ml-2 h-5 w-5 text-blue-500" />
                    حالة النظام
                  </CardTitle>
                  <CardDescription>
                    تقرير موجز عن حالة الموقع
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">استخدام المساحة</span>
                        <span className="text-sm text-gray-500">64%</span>
                      </div>
                      <Progress value={64} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">أداء الموقع</span>
                        <span className="text-sm text-gray-500">92%</span>
                      </div>
                      <Progress value={92} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">البحث في الموقع</span>
                        <span className="text-sm text-gray-500">85%</span>
                      </div>
                      <Progress value={85} className="h-2" />
                    </div>
                    
                    <div className="bg-green-50 border border-green-100 p-3 rounded-md flex items-center mt-4">
                      <div className="bg-green-500 rounded-full h-2 w-2 ml-2"></div>
                      <span className="text-green-700 text-sm">جميع الأنظمة تعمل بشكل طبيعي</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="analytics" className="space-y-6">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle>الزيارات (الأسبوع الحالي)</CardTitle>
                <CardDescription>معدل الزيارات اليومية للموقع</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px] w-full flex items-end">
                  {mockVisits.map((item, index) => (
                    <div key={index} className="flex-1 mx-1 flex flex-col items-center justify-end h-full">
                      <div 
                        className="bg-blue-500 hover:bg-blue-600 transition-all rounded-t-md w-full" 
                        style={{ 
                          height: `${(item.visits / 600) * 100}%`,
                          minHeight: '10%'
                        }}
                      ></div>
                      <div className="text-xs mt-2 text-gray-600">{item.date}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>المنح الأكثر مشاهدة</CardTitle>
                  <CardDescription>الأسبوع الحالي</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center pb-3 border-b">
                      <div className="font-medium">منحة جامعة هارفارد</div>
                      <div className="text-blue-600 font-semibold">1,245</div>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b">
                      <div className="font-medium">منحة MIT</div>
                      <div className="text-blue-600 font-semibold">987</div>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b">
                      <div className="font-medium">منحة جامعة أكسفورد</div>
                      <div className="text-blue-600 font-semibold">867</div>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b">
                      <div className="font-medium">منحة الهندسة اليابان</div>
                      <div className="text-blue-600 font-semibold">654</div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="font-medium">منحة الطب كندا</div>
                      <div className="text-blue-600 font-semibold">532</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>المقالات الأكثر قراءة</CardTitle>
                  <CardDescription>الأسبوع الحالي</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center pb-3 border-b">
                      <div className="font-medium">كيفية كتابة خطاب النية</div>
                      <div className="text-purple-600 font-semibold">986</div>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b">
                      <div className="font-medium">أفضل 10 منح دراسية</div>
                      <div className="text-purple-600 font-semibold">784</div>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b">
                      <div className="font-medium">نصائح لمقابلة القبول</div>
                      <div className="text-purple-600 font-semibold">652</div>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b">
                      <div className="font-medium">أخطاء شائعة في التقديم</div>
                      <div className="text-purple-600 font-semibold">543</div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="font-medium">تجربتي في الدراسة بألمانيا</div>
                      <div className="text-purple-600 font-semibold">432</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>مصادر الزيارات</CardTitle>
                  <CardDescription>الأسبوع الحالي</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center pb-3 border-b">
                      <div className="font-medium">محركات البحث</div>
                      <div className="text-gray-600 font-semibold">45%</div>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b">
                      <div className="font-medium">وسائل التواصل</div>
                      <div className="text-gray-600 font-semibold">32%</div>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b">
                      <div className="font-medium">روابط مباشرة</div>
                      <div className="text-gray-600 font-semibold">15%</div>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b">
                      <div className="font-medium">النشرة البريدية</div>
                      <div className="text-gray-600 font-semibold">5%</div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="font-medium">أخرى</div>
                      <div className="text-gray-600 font-semibold">3%</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="ml-2 h-5 w-5 text-blue-500" />
                  آخر الأنشطة
                </CardTitle>
                <CardDescription>
                  سجل بأحدث الأنشطة والتغييرات على الموقع
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start pb-6 border-b last:border-0 last:pb-0">
                      <Avatar className="h-9 w-9 ml-3 mt-1">
                        <AvatarFallback className="bg-blue-100 text-blue-700 text-xs border-0">
                          {activity.user.substring(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{activity.user}</p>
                            <p className="text-gray-500 mt-1">{activity.action}</p>
                          </div>
                          <p className="text-xs text-gray-400">{activity.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex justify-center">
                <Button variant="outline" className="w-full">
                  عرض جميع الأنشطة
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
