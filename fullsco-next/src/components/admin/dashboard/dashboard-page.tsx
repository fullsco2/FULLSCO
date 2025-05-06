"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  CalendarDays,
  FileText,
  GraduationCap,
  Users,
  Award,
} from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ElementType;
  loading?: boolean;
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  loading = false,
}: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-6 w-3/4 animate-pulse rounded bg-muted"></div>
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState({
    scholarships: 0,
    articles: 0,
    users: 0,
    successStories: 0,
  });
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // جلب عدد المنح الدراسية
        const scholarshipsRes = await fetch("/api/scholarships/count");
        const scholarships = await scholarshipsRes.json();
        
        // جلب عدد المقالات
        const articlesRes = await fetch("/api/posts/count");
        const articles = await articlesRes.json();
        
        // جلب عدد المستخدمين
        const usersRes = await fetch("/api/users/count");
        const users = await usersRes.json();
        
        // جلب عدد قصص النجاح
        const successStoriesRes = await fetch("/api/success-stories/count");
        const successStories = await successStoriesRes.json();
        
        setStats({
          scholarships: scholarships.count || 0,
          articles: articles.count || 0,
          users: users.count || 0,
          successStories: successStories.count || 0,
        });
      } catch (error) {
        console.error("خطأ في جلب الإحصائيات:", error);
        // تعيين قيم افتراضية في حالة الخطأ
        setStats({
          scholarships: 0,
          articles: 0,
          users: 0,
          successStories: 0,
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">لوحة القيادة</h1>
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString("ar-SA", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="المنح الدراسية"
          value={stats.scholarships}
          icon={GraduationCap}
          loading={loading}
        />
        <StatCard
          title="المقالات"
          value={stats.articles}
          icon={FileText}
          loading={loading}
        />
        <StatCard
          title="المستخدمون"
          value={stats.users}
          icon={Users}
          loading={loading}
        />
        <StatCard
          title="قصص النجاح"
          value={stats.successStories}
          icon={Award}
          loading={loading}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>النشاط الأخير</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6 text-muted-foreground">
              ستتوفر رسوم بيانية إحصائية للنشاط قريبًا.
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>المنح حسب الدولة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6 text-muted-foreground">
              <BarChart className="h-16 w-16 mx-auto text-muted-foreground/50" />
              ستتوفر رسوم بيانية للمنح الدراسية حسب الدولة قريبًا.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
