import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  LayoutDashboard, 
  GraduationCap, 
  FileText, 
  User, 
  Settings, 
  Search, 
  BarChart,
  Plus, 
  Edit,
  UserPlus,
  PieChart,
  Lock
} from 'lucide-react';

const AdminPreview = () => {
  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center mb-10">
          <h2 className="text-2xl font-bold sm:text-3xl mb-4">لوحة تحكم قوية</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">توفر لوحة التحكم الشاملة إدارة سهلة للمنح الدراسية، المحتوى، وتحسين محركات البحث.</p>
        </div>
        
        <div className="relative mx-auto max-w-4xl rounded-lg border border-border shadow-lg overflow-hidden">
          {/* معاينة لوحة التحكم */}
          <div className="h-[500px] bg-card/50 overflow-hidden">
            <div className="flex h-full">
              {/* السايدبار */}
              <div className="w-56 bg-gray-900 text-white p-4 hidden md:block">
                <div className="mb-6">
                  <span className="text-xl font-bold">FULL<span className="text-accent">SCO</span></span>
                  <span className="text-xs text-gray-400 mr-1">المدير</span>
                </div>
                
                <nav className="space-y-1">
                  <a href="#" className="flex items-center px-3 py-2 text-sm rounded-md bg-primary text-white font-medium">
                    <LayoutDashboard className="ml-2 h-4 w-4" /> لوحة التحكم
                  </a>
                  <a href="#" className="flex items-center px-3 py-2 text-sm rounded-md text-gray-300 hover:bg-gray-800">
                    <GraduationCap className="ml-2 h-4 w-4" /> المنح الدراسية
                  </a>
                  <a href="#" className="flex items-center px-3 py-2 text-sm rounded-md text-gray-300 hover:bg-gray-800">
                    <FileText className="ml-2 h-4 w-4" /> المقالات
                  </a>
                  <a href="#" className="flex items-center px-3 py-2 text-sm rounded-md text-gray-300 hover:bg-gray-800">
                    <User className="ml-2 h-4 w-4" /> المستخدمين
                  </a>
                  <a href="#" className="flex items-center px-3 py-2 text-sm rounded-md text-gray-300 hover:bg-gray-800">
                    <Settings className="ml-2 h-4 w-4" /> الإعدادات
                  </a>
                  <a href="#" className="flex items-center px-3 py-2 text-sm rounded-md text-gray-300 hover:bg-gray-800">
                    <Search className="ml-2 h-4 w-4" /> تحسين محركات البحث
                  </a>
                  <a href="#" className="flex items-center px-3 py-2 text-sm rounded-md text-gray-300 hover:bg-gray-800">
                    <BarChart className="ml-2 h-4 w-4" /> التحليلات
                  </a>
                </nav>
              </div>
              
              {/* المحتوى الرئيسي */}
              <div className="flex-1 p-6 overflow-auto">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold">نظرة عامة على لوحة التحكم</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">مرحبًا، المدير</span>
                    <img 
                      src="https://randomuser.me/api/portraits/men/1.jpg" 
                      alt="المدير"
                      className="h-8 w-8 rounded-full"
                    />
                  </div>
                </div>
                
                {/* شبكة الإحصائيات */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center">
                        <div className="p-3 rounded-full bg-primary/10 text-primary ml-4">
                          <GraduationCap className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">إجمالي المنح</p>
                          <p className="text-2xl font-semibold">1,250</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center">
                        <div className="p-3 rounded-full bg-accent/10 text-accent ml-4">
                          <User className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">المستخدمين المسجلين</p>
                          <p className="text-2xl font-semibold">8,540</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center">
                        <div className="p-3 rounded-full bg-primary/5 text-primary ml-4">
                          <BarChart className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">إجمالي المشاهدات</p>
                          <p className="text-2xl font-semibold">245,689</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* النشاط الحديث */}
                <Card className="mb-6">
                  <CardContent className="p-4">
                    <h4 className="text-md font-semibold mb-4">النشاط الحديث</h4>
                    <div className="space-y-3">
                      <div className="flex items-center p-2 rounded-md hover:bg-muted/50">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary ml-3">
                          <Plus className="h-4 w-4" />
                        </div>
                        <div className="flex-1 text-right">
                          <p className="text-sm">تمت إضافة منحة جديدة: <span className="font-medium">منحة جيتس كامبريدج</span></p>
                          <p className="text-xs text-muted-foreground">منذ ساعتين</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center p-2 rounded-md hover:bg-muted/50">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary ml-3">
                          <Edit className="h-4 w-4" />
                        </div>
                        <div className="flex-1 text-right">
                          <p className="text-sm">تم تحديث مقال: <span className="font-medium">نصائح لمقابلات المنح الدراسية</span></p>
                          <p className="text-xs text-muted-foreground">منذ 5 ساعات</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center p-2 rounded-md hover:bg-muted/50">
                        <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent ml-3">
                          <UserPlus className="h-4 w-4" />
                        </div>
                        <div className="flex-1 text-right">
                          <p className="text-sm">تسجيل مستخدم جديد: <span className="font-medium">أحمد محمود</span></p>
                          <p className="text-xs text-muted-foreground">أمس</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* الإجراءات السريعة */}
                <Card>
                  <CardContent className="p-4">
                    <h4 className="text-md font-semibold mb-4">إجراءات سريعة</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <button className="p-3 flex flex-col items-center justify-center rounded-md border border-border hover:bg-muted/50">
                        <Plus className="h-5 w-5 mb-1 text-primary" />
                        <span className="text-xs">إضافة منحة</span>
                      </button>
                      
                      <button className="p-3 flex flex-col items-center justify-center rounded-md border border-border hover:bg-muted/50">
                        <FileText className="h-5 w-5 mb-1 text-primary" />
                        <span className="text-xs">إنشاء مقال</span>
                      </button>
                      
                      <button className="p-3 flex flex-col items-center justify-center rounded-md border border-border hover:bg-muted/50">
                        <PieChart className="h-5 w-5 mb-1 text-primary" />
                        <span className="text-xs">عرض التقارير</span>
                      </button>
                      
                      <button className="p-3 flex flex-col items-center justify-center rounded-md border border-border hover:bg-muted/50">
                        <Settings className="h-5 w-5 mb-1 text-primary" />
                        <span className="text-xs">الإعدادات</span>
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
          
          {/* الطبقة العليا */}
          <div className="absolute inset-0 bg-gray-900 bg-opacity-70 flex items-center justify-center">
            <div className="text-center p-6">
              <span className="inline-block mb-4 p-3 rounded-full bg-white/10">
                <Lock className="h-8 w-8 text-white" />
              </span>
              <h3 className="text-xl font-bold text-white mb-2">لوحة تحكم المدير</h3>
              <p className="text-white/80 mb-4 max-w-md">قم بإدارة المنح الدراسية والمحتوى وإعدادات تحسين محركات البحث باستخدام أدوات إدارة قوية.</p>
              <Link href="/admin/login">
                <Button variant="accent">
                  اعرف المزيد
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdminPreview;
