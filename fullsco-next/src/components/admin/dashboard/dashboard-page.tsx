'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bookmark, FileText, Users, Award, TrendingUp, Activity, ArrowUpRight } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  trend?: number;
  trendLabel?: string;
}

function StatCard({ title, value, description, icon, trend, trendLabel }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-8 w-8 rounded-full bg-primary/10 p-1.5 text-primary">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
        {trend !== undefined && (
          <div className="mt-3 flex items-center gap-1 text-xs">
            <div
              className={`flex items-center gap-0.5 ${
                trend >= 0 ? 'text-emerald-500' : 'text-red-500'
              }`}
            >
              {trend >= 0 ? <TrendingUp className="h-3 w-3" /> : <Activity className="h-3 w-3" />}
              <span>{Math.abs(trend)}%</span>
            </div>
            <span className="text-muted-foreground">{trendLabel}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function DashboardPage() {
  const { user } = useAuth();
  const [statistics, setStatistics] = useState({
    totalScholarships: 0,
    totalArticles: 0,
    totalUsers: 0,
    totalSuccessStories: 0,
  });

  // محاكاة جلب البيانات من API
  useEffect(() => {
    // في التطبيق الحقيقي، سيتم جلب هذه البيانات من API
    const fetchDashboardData = async () => {
      try {
        // مثال على كيفية جلب البيانات في التطبيق الحقيقي
        // const response = await fetch('/api/admin/dashboard-stats');
        // const data = await response.json();
        // setStatistics(data);

        // للتجربة فقط، نستخدم بيانات عينة
        // في التطبيق الحقيقي، سيتم استبدال هذا بطلب API حقيقي
        setStatistics({
          totalScholarships: 48,
          totalArticles: 24,
          totalUsers: 215,
          totalSuccessStories: 12,
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">مرحباً، {user?.name || user?.username}!</h2>
          <p className="text-muted-foreground">إليك لوحة قيادة منصة فولسكو للمنح الدراسية.</p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="analytics">إحصائيات</TabsTrigger>
          <TabsTrigger value="reports">التقارير</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="إجمالي المنح الدراسية"
              value={statistics.totalScholarships}
              description="منح دراسية نشطة في المنصة"
              icon={<Bookmark className="h-5 w-5" />}
              trend={8.2}
              trendLabel="منذ الشهر الماضي"
            />
            <StatCard
              title="إجمالي المقالات"
              value={statistics.totalArticles}
              description="مقالات منشورة على المنصة"
              icon={<FileText className="h-5 w-5" />}
              trend={12.5}
              trendLabel="منذ الشهر الماضي"
            />
            <StatCard
              title="إجمالي المستخدمين"
              value={statistics.totalUsers}
              description="مستخدم مسجل في المنصة"
              icon={<Users className="h-5 w-5" />}
              trend={5.3}
              trendLabel="منذ الشهر الماضي"
            />
            <StatCard
              title="قصص النجاح"
              value={statistics.totalSuccessStories}
              description="قصة نجاح منشورة"
              icon={<Award className="h-5 w-5" />}
              trend={-2.5}
              trendLabel="منذ الشهر الماضي"
            />
          </div>
        </TabsContent>
        <TabsContent value="analytics" className="h-[400px] w-full rounded-md border p-8">
          <div className="flex h-full items-center justify-center">
            <p className="text-center text-muted-foreground">سيتم إضافة معلومات التحليلات هنا</p>
          </div>
        </TabsContent>
        <TabsContent value="reports" className="h-[400px] w-full rounded-md border p-8">
          <div className="flex h-full items-center justify-center">
            <p className="text-center text-muted-foreground">سيتم إضافة التقارير هنا</p>
          </div>
        </TabsContent>
      </Tabs>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>آخر المنح الدراسية</CardTitle>
            <CardDescription>منح دراسية تمت إضافتها مؤخراً</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <div className="flex h-[200px] items-center justify-center p-4">
                <p className="text-sm text-muted-foreground">سيتم عرض آخر المنح الدراسية هنا</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>آخر المقالات</CardTitle>
            <CardDescription>مقالات تمت إضافتها مؤخراً</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <div className="flex h-[200px] items-center justify-center p-4">
                <p className="text-sm text-muted-foreground">سيتم عرض آخر المقالات هنا</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
