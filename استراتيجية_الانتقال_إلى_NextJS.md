# استراتيجية الانتقال من التطبيق الحالي إلى Next.js

## مقدمة

يُعد الانتقال من تطبيق React الحالي (المبني على Vite) إلى Next.js خطوة استراتيجية مهمة لتحسين أداء وقدرات منصة فلسكو للمنح الدراسية. يوفر Next.js مجموعة من المزايا التي ستفيد المنصة، منها:

- توجيه (Routing) مدمج ومتقدم وأكثر كفاءة
- تحسين محركات البحث (SEO) من خلال العرض من جانب الخادم (SSR)
- توليد المحتوى الثابت (SSG) لتسريع تحميل الصفحات
- تحسين أداء التطبيق بشكل عام
- دعم أفضل للتطبيقات متعددة اللغات
- تكامل أفضل مع TypeScript

نقدم في هذا المستند استراتيجية تفصيلية للانتقال التدريجي من التطبيق الحالي إلى Next.js بأقل قدر من التعطيل وبأعلى درجة من الكفاءة.

## المراحل الرئيسية للانتقال

### المرحلة 1: التخطيط والتحضير

#### 1.1 تقييم المشروع الحالي

قبل البدء بالانتقال، من المهم فهم وتوثيق:

- **بنية التطبيق الحالية**:
  - تحديد جميع المكونات والصفحات
  - تحديد المسارات وآلية التوجيه المستخدمة
  - فهم بنية إدارة الحالة (state management)

- **الاعتماديات والمكتبات**:
  - جرد كامل للمكتبات المستخدمة (React Query، Tailwind، shadcn/ui، الخ)
  - تحديد المكتبات التي قد تحتاج إلى بدائل أو تكييف مع Next.js

- **التكامل مع الخادم الخلفي**:
  - حصر جميع نقاط النهاية API المستخدمة
  - فهم آلية المصادقة وإدارة الجلسات الحالية

#### 1.2 إنشاء مشروع Next.js جديد

```bash
# استخدام أحدث إصدار من Next.js مع TypeScript و Tailwind CSS
npx create-next-app@latest fullsco-next --typescript --tailwind --app

# الانتقال إلى المجلد الجديد
cd fullsco-next

# تثبيت الاعتماديات الحالية
npm install @hookform/resolvers zod @tanstack/react-query lucide-react date-fns ... إلخ
```

#### 1.3 نقل الإعدادات والتكوينات

- **إعدادات Tailwind CSS**:
  ```js
  // tailwind.config.js
  const config = {
    darkMode: ["class"],
    content: [
      './pages/**/*.{ts,tsx}',
      './components/**/*.{ts,tsx}',
      './app/**/*.{ts,tsx}',
    ],
    theme: {
      extend: {
        // نقل التخصيصات الحالية
        colors: {
          primary: '#3b82f6',
          secondary: '#f59e0b',
          accent: '#a855f7',
          // ... المزيد من الألوان
        },
        fontFamily: {
          // ... الخطوط المستخدمة
        }
      }
    },
    plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
  }
  ```

- **إعدادات TypeScript**:
  ```json
  // tsconfig.json
  {
    "compilerOptions": {
      "target": "es5",
      "lib": ["dom", "dom.iterable", "esnext"],
      "allowJs": true,
      "skipLibCheck": true,
      "strict": true,
      "forceConsistentCasingInFileNames": true,
      "noEmit": true,
      "esModuleInterop": true,
      "module": "esnext",
      "moduleResolution": "node",
      "resolveJsonModule": true,
      "isolatedModules": true,
      "jsx": "preserve",
      "incremental": true,
      "plugins": [
        {
          "name": "next"
        }
      ],
      "paths": {
        "@/*": ["./*"],
        "@components/*": ["./components/*"],
        "@lib/*": ["./lib/*"],
        "@hooks/*": ["./hooks/*"],
        "@types/*": ["./types/*"]
      }
    },
    "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
    "exclude": ["node_modules"]
  }
  ```

### المرحلة 2: هيكلة المشروع وفق معايير Next.js

#### 2.1 بنية المجلدات المقترحة (باستخدام App Router)

```
fullsco-next/
├── app/
│   ├── (auth)/                     # مجموعة مسارات المصادقة
│   │   ├── login/
│   │   │   └── page.tsx            # صفحة تسجيل الدخول
│   │   └── layout.tsx              # تخطيط مشترك لصفحات المصادقة
│   │
│   ├── (admin)/                    # مجموعة مسارات لوحة التحكم
│   │   ├── admin/
│   │   │   ├── scholarships/
│   │   │   │   ├── page.tsx        # /admin/scholarships
│   │   │   │   ├── [id]/
│   │   │   │   │   └── page.tsx    # /admin/scholarships/123
│   │   │   │   └── create/
│   │   │   │       └── page.tsx    # /admin/scholarships/create
│   │   │   ├── media/
│   │   │   │   └── page.tsx        # /admin/media
│   │   │   ├── users/
│   │   │   │   └── page.tsx        # /admin/users
│   │   │   ├── settings/
│   │   │   │   └── page.tsx        # /admin/settings
│   │   │   └── dashboard/
│   │   │       └── page.tsx        # /admin/dashboard
│   │   └── layout.tsx              # تخطيط مشترك للوحة التحكم
│   │
│   ├── scholarships/               # صفحات المنح الدراسية العامة
│   │   ├── page.tsx                # /scholarships
│   │   └── [slug]/
│   │       └── page.tsx            # /scholarships/[slug]
│   │
│   ├── articles/                   # صفحات المقالات
│   │   ├── page.tsx                # /articles
│   │   └── [slug]/
│   │       └── page.tsx            # /articles/[slug]
│   │
│   ├── success-stories/            # قصص النجاح
│   │   ├── page.tsx                # /success-stories
│   │   └── [slug]/
│   │       └── page.tsx            # /success-stories/[slug]
│   │
│   ├── api/                        # واجهات API المدمجة
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts        # مصادقة مع NextAuth.js
│   │   └── [...catchAll]/
│   │       └── route.ts            # تمرير باقي الطلبات إلى خادم Express
│   │
│   ├── layout.tsx                  # التخطيط الرئيسي للتطبيق
│   └── page.tsx                    # الصفحة الرئيسية
│
├── components/                     # المكونات القابلة لإعادة الاستخدام
│   ├── common/                     # مكونات عامة
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── ... 
│   ├── scholarships/               # مكونات خاصة بالمنح الدراسية
│   │   ├── ScholarshipCard.tsx
│   │   ├── ScholarshipFilter.tsx
│   │   └── ...
│   ├── admin/                      # مكونات خاصة بلوحة التحكم
│   │   ├── Sidebar.tsx
│   │   ├── AdminHeader.tsx
│   │   └── ...
│   └── ui/                         # مكونات واجهة المستخدم الأساسية (من shadcn)
│       ├── button.tsx
│       ├── input.tsx
│       └── ...
│
├── hooks/                          # Custom hooks
│   ├── useAuth.ts
│   ├── useScholarships.ts
│   └── ...
│
├── lib/                            # أدوات وخدمات مساعدة
│   ├── api.ts                      # وظائف التعامل مع API
│   ├── utils.ts                    # وظائف مساعدة عامة
│   └── theme.ts                    # إدارة السمة (theme)
│
├── types/                          # تعريفات الأنواع
│   ├── scholarship.ts
│   ├── user.ts
│   └── ...
│
├── public/                         # الملفات الثابتة
│   ├── images/
│   ├── fonts/
│   └── ...
│
├── styles/                         # أنماط CSS العامة
│   └── globals.css                 # الأنماط العالمية والمتغيرات
│
├── middleware.ts                   # وسيط Next.js للتحقق من المصادقة والتوجيه
├── next.config.js                  # إعدادات Next.js
├── package.json
└── tsconfig.json
```

#### 2.2 إعداد المصادقة مع NextAuth.js

```typescript
// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "اسم المستخدم", type: "text" },
        password: { label: "كلمة المرور", type: "password" }
      },
      async authorize(credentials) {
        try {
          // استدعاء API الخاص بنا للتحقق من بيانات الاعتماد
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(credentials)
          });
          
          const data = await res.json();
          
          if (res.ok && data.success) {
            // إرجاع بيانات المستخدم ستضاف إلى جلسة المستخدم
            return {
              id: data.data.id,
              username: data.data.username,
              email: data.data.email,
              role: data.data.role,
              name: data.data.name || data.data.username
            };
          }
          
          // إذا كانت البيانات غير صحيحة أو حدث خطأ في الاستجابة
          return null;
        } catch (error) {
          console.error("Error during authentication:", error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      // إضافة بيانات المستخدم إلى JWT token
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      // إضافة بيانات المستخدم إلى جلسة المستخدم
      if (token) {
        session.user.id = token.id;
        session.user.username = token.username;
        session.user.role = token.role;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
    error: '/error',
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 يوم
  },
  secret: process.env.NEXTAUTH_SECRET
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

#### 2.3 إعداد واجهة API للتواصل مع خادم Express الخلفي

```typescript
// lib/api.ts
import { getSession } from "next-auth/react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export async function apiRequest(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  data?: any,
  requireAuth: boolean = true
) {
  try {
    const url = `${API_URL}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // إضافة توكن المصادقة إذا كان مطلوباً
    if (requireAuth) {
      const session = await getSession();
      if (session?.accessToken) {
        headers['Authorization'] = `Bearer ${session.accessToken}`;
      }
    }
    
    const options: RequestInit = {
      method,
      headers,
      credentials: 'include', // للحفاظ على ملفات تعريف الارتباط عبر الطلبات
    };
    
    if (data && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(data);
    }
    
    const response = await fetch(url, options);
    const responseData = await response.json();
    
    if (!response.ok) {
      throw new Error(responseData.message || 'حدث خطأ أثناء معالجة الطلب');
    }
    
    return responseData;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
}

// وظائف مساعدة لاستدعاءات API الشائعة
export const api = {
  get: (endpoint: string, requireAuth = true) => 
    apiRequest(endpoint, 'GET', undefined, requireAuth),
    
  post: (endpoint: string, data: any, requireAuth = true) => 
    apiRequest(endpoint, 'POST', data, requireAuth),
    
  put: (endpoint: string, data: any, requireAuth = true) => 
    apiRequest(endpoint, 'PUT', data, requireAuth),
    
  delete: (endpoint: string, requireAuth = true) => 
    apiRequest(endpoint, 'DELETE', undefined, requireAuth),
};
```

#### 2.4 إعداد وسيط (Middleware) للتحقق من المصادقة

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // الصفحات التي يمكن الوصول إليها بدون مصادقة
  const publicPaths = ['/login', '/register', '/', '/scholarships', '/articles', '/success-stories'];
  const isPublicPath = publicPaths.some(publicPath => 
    path === publicPath || path.startsWith(`${publicPath}/`)
  );
  
  // التحقق مما إذا كان المسار هو مسار لوحة التحكم
  const isAdminPath = path.startsWith('/admin');
  
  // الحصول على توكن المصادقة
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET
  });
  
  // إعادة توجيه المستخدم غير المصادق من صفحات لوحة التحكم إلى صفحة تسجيل الدخول
  if (isAdminPath && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // التحقق من دور المستخدم للوصول إلى لوحة التحكم
  if (isAdminPath && token && token.role !== 'admin') {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  // إعادة توجيه المستخدم المصادق من صفحة تسجيل الدخول إلى لوحة التحكم
  if (path === '/login' && token) {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }
  
  return NextResponse.next();
}

// تكوين المسارات التي سيتم تطبيق الوسيط عليها
export const config = {
  matcher: [
    '/admin/:path*',
    '/login',
    '/register'
  ],
};
```

### المرحلة 3: نقل المكونات والصفحات

#### 3.1 نقل المكونات الأساسية

بدءاً بالمكونات الأساسية مثل Header و Footer و Layout:

```tsx
// components/common/Header.tsx
"use client"; // استخدام "use client" للمكونات التي تستخدم حالة أو تفاعل

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Menu, X, User, LogOut } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();
  
  // كود مماثل للكود الحالي مع التعديلات اللازمة
  
  return (
    <header className="bg-white shadow-sm dark:bg-gray-900">
      {/* نفس المحتوى مع استخدام Link من Next.js */}
      <nav className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-primary">
          منصة فلسكو
        </Link>
        
        {/* القائمة الرئيسية */}
        <div className="hidden md:flex items-center space-x-4 space-x-reverse">
          <Link 
            href="/scholarships"
            className={`px-3 py-2 rounded-md ${
              pathname.startsWith('/scholarships') 
                ? 'text-primary font-bold' 
                : 'text-gray-700 dark:text-gray-300'
            }`}
          >
            المنح الدراسية
          </Link>
          {/* باقي روابط القائمة */}
        </div>
        
        {/* قائمة المستخدم */}
        {session ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative rounded-full">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Link href="/admin/dashboard" className="w-full">
                  لوحة التحكم
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => signOut()}>
                <LogOut className="ml-2 h-4 w-4" />
                تسجيل الخروج
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link href="/login">
            <Button variant="default">تسجيل الدخول</Button>
          </Link>
        )}
        
        {/* زر القائمة للجوال */}
        <button 
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </nav>
      
      {/* قائمة الجوال */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 py-2">
          {/* محتوى قائمة الجوال */}
        </div>
      )}
    </header>
  );
}
```

#### 3.2 إنشاء الصفحات الأساسية

##### 3.2.1 الصفحة الرئيسية

```tsx
// app/page.tsx
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import { api } from '@/lib/api';
import ScholarshipCard from '@/components/scholarships/ScholarshipCard';
import CategoryCard from '@/components/categories/CategoryCard';
import Hero from '@/components/common/Hero';

// تعريف البيانات الوصفية للصفحة
export const metadata: Metadata = {
  title: 'منصة فلسكو - المنح الدراسية',
  description: 'منصة متخصصة في المنح الدراسية للطلاب العرب حول العالم',
};

// استخدام async/await للحصول على البيانات من الخادم بشكل مباشر
async function getHomePageData() {
  try {
    const featuredScholarships = await api.get('/api/scholarships/featured', false);
    const categories = await api.get('/api/categories', false);
    const statistics = await api.get('/api/statistics', false);
    const settings = await api.get('/api/site-settings', false);
    
    return {
      featuredScholarships: featuredScholarships.data || [],
      categories: categories || [],
      statistics: statistics.data || [],
      settings: settings.data || {}
    };
  } catch (error) {
    console.error('Error fetching home page data:', error);
    return {
      featuredScholarships: [],
      categories: [],
      statistics: [],
      settings: {}
    };
  }
}

export default async function HomePage() {
  const { featuredScholarships, categories, statistics, settings } = await getHomePageData();
  
  return (
    <main>
      {/* قسم الترحيب */}
      <Hero 
        title={settings.heroTitle || 'ابحث عن المنح الدراسية المناسبة لك'} 
        subtitle={settings.heroSubtitle || 'اكتشف الاف المنح الدراسية'}
        description={settings.heroDescription || 'أكبر قاعدة بيانات للمنح الدراسية حول العالم'}
      />
      
      {/* قسم المنح المميزة */}
      {settings.showFeaturedScholarships && (
        <section className="py-12 bg-gray-50 dark:bg-gray-800">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              {settings.featuredScholarshipsTitle || 'منح دراسية مميزة'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredScholarships.map((scholarship) => (
                <ScholarshipCard key={scholarship.id} scholarship={scholarship} />
              ))}
            </div>
            <div className="text-center mt-8">
              <Link href="/scholarships">
                <button className="btn btn-primary">عرض جميع المنح</button>
              </Link>
            </div>
          </div>
        </section>
      )}
      
      {/* باقي أقسام الصفحة الرئيسية */}
    </main>
  );
}
```

##### 3.2.2 صفحة لوحة التحكم

```tsx
// app/(admin)/admin/dashboard/page.tsx
import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Overview } from '@/components/admin/dashboard/Overview';
import { RecentActivity } from '@/components/admin/dashboard/RecentActivity';
import { api } from '@/lib/api';

export const metadata: Metadata = {
  title: 'لوحة التحكم - منصة فلسكو',
  description: 'لوحة تحكم المسؤولين في منصة فلسكو للمنح الدراسية',
};

async function getDashboardData() {
  try {
    const statistics = await api.get('/api/statistics');
    const recentScholarships = await api.get('/api/scholarships?limit=5');
    const recentPosts = await api.get('/api/posts?limit=5');
    
    return {
      statistics: statistics.data || [],
      recentScholarships: recentScholarships.data || [],
      recentPosts: recentPosts.data || []
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return {
      statistics: [],
      recentScholarships: [],
      recentPosts: []
    };
  }
}

export default async function DashboardPage() {
  const { statistics, recentScholarships, recentPosts } = await getDashboardData();
  
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">لوحة التحكم</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statistics.slice(0, 4).map((stat) => (
          <Card key={stat.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              {/* أيقونة مناسبة */}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="analytics">التحليلات</TabsTrigger>
          <TabsTrigger value="reports">التقارير</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <Overview />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>أحدث المنح الدراسية</CardTitle>
              </CardHeader>
              <CardContent>
                {/* عرض أحدث المنح */}
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>النشاطات الأخيرة</CardTitle>
              </CardHeader>
              <CardContent>
                <RecentActivity />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        {/* محتوى التبويبات الأخرى */}
      </Tabs>
    </div>
  );
}
```

#### 3.3 استخدام React Query للتعامل مع API

```tsx
// hooks/api/useScholarships.ts
"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Scholarship, ScholarshipFilters } from '@/types/scholarship';
import { useToast } from '@/components/ui/use-toast';

export function useScholarships(filters?: ScholarshipFilters) {
  const { toast } = useToast();
  
  return useQuery({
    queryKey: ['scholarships', filters],
    queryFn: async () => {
      const response = await api.get('/api/scholarships', true);
      return response.data || [];
    },
    onError: (error: Error) => {
      toast({
        title: 'خطأ في جلب المنح الدراسية',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
}

export function useScholarship(id: number | string | undefined) {
  return useQuery({
    queryKey: ['scholarship', id],
    queryFn: async () => {
      if (!id) return null;
      const response = await api.get(`/api/scholarships/${id}`);
      return response.data;
    },
    enabled: !!id, // سيتم تفعيل الاستعلام فقط إذا كان id متوفراً
  });
}

export function useCreateScholarship() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (data: Omit<Scholarship, 'id'>) => {
      const response = await api.post('/api/scholarships', data);
      return response.data;
    },
    onSuccess: () => {
      // تحديث ذاكرة التخزين المؤقت بعد الإنشاء الناجح
      queryClient.invalidateQueries({ queryKey: ['scholarships'] });
      
      toast({
        title: 'تم إنشاء المنحة بنجاح',
        description: 'تمت إضافة المنحة الدراسية الجديدة بنجاح',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'خطأ في إنشاء المنحة',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
}

// المزيد من الوظائف مثل التحديث والحذف
```

### المرحلة 4: إعداد الواجهة الأمامية متعددة اللغات

#### 4.1 إعداد next-i18next للترجمة متعددة اللغات

```bash
npm install next-i18next
```

أولاً: إنشاء ملفات الترجمة:

```
public/locales/
├── ar/
│   ├── common.json
│   ├── scholarships.json
│   └── admin.json
└── en/
    ├── common.json
    ├── scholarships.json
    └── admin.json
```

مثال لملف `ar/common.json`:

```json
{
  "site_name": "منصة فلسكو",
  "menu": {
    "home": "الرئيسية",
    "scholarships": "المنح الدراسية",
    "articles": "المقالات",
    "success_stories": "قصص النجاح",
    "about": "من نحن",
    "contact": "اتصل بنا"
  },
  "buttons": {
    "login": "تسجيل الدخول",
    "logout": "تسجيل الخروج",
    "search": "بحث",
    "apply": "تقديم",
    "more": "المزيد"
  }
}
```

مثال لملف `en/common.json`:

```json
{
  "site_name": "FULLSCO Platform",
  "menu": {
    "home": "Home",
    "scholarships": "Scholarships",
    "articles": "Articles",
    "success_stories": "Success Stories",
    "about": "About Us",
    "contact": "Contact"
  },
  "buttons": {
    "login": "Login",
    "logout": "Logout",
    "search": "Search",
    "apply": "Apply",
    "more": "More"
  }
}
```

ثم، إعداد next-i18next:

```js
// next-i18next.config.js
module.exports = {
  i18n: {
    defaultLocale: 'ar',
    locales: ['ar', 'en'],
    localeDetection: true,
  },
  trailingSlash: true,
};
```

وإعداد next.config.js:

```js
// next.config.js
/** @type {import('next').NextConfig} */
const { i18n } = require('./next-i18next.config');

const nextConfig = {
  i18n,
  reactStrictMode: true,
  images: {
    domains: ['localhost', 'fullsco.com'], // أضف النطاقات المسموح بها للصور
  },
  async redirects() {
    return [
      {
        source: '/dashboard',
        destination: '/admin/dashboard',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
```

#### 4.2 إنشاء مكون لتغيير اللغة

```tsx
// components/common/LanguageSwitcher.tsx
"use client";

import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'next-i18next';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const { i18n } = useTranslation();
  
  const changeLanguage = (locale: string) => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
    
    const newPath = pathname.replace(/^\/[a-z]{2}/, `/${locale}`);
    router.push(newPath);
  };
  
  return (
    <div className="flex items-center gap-2">
      <Globe className="h-4 w-4" />
      <div className="flex gap-1">
        <Button
          variant={i18n.language === 'ar' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => changeLanguage('ar')}
          className="px-2 h-7"
        >
          العربية
        </Button>
        <Button
          variant={i18n.language === 'en' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => changeLanguage('en')}
          className="px-2 h-7"
        >
          English
        </Button>
      </div>
    </div>
  );
}
```

### المرحلة 5: التكامل مع خادم Express الحالي

#### 5.1 إعداد التمرير للواجهات البرمجية

```typescript
// app/api/[...slug]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// تحديد عنوان خادم API
const API_URL = process.env.API_URL || 'http://localhost:5000';

// وظيفة مساعدة لتمرير طلبات API
async function proxyApiRequest(
  request: NextRequest,
  { params }: { params: { slug: string[] } }
) {
  try {
    const slug = params.slug.join('/');
    const url = new URL(request.url);
    const apiUrl = `${API_URL}/api/${slug}${url.search}`;
    
    // تجهيز الهيدرز
    const headers = new Headers();
    headers.set('Content-Type', 'application/json');
    
    // نقل ملفات تعريف الارتباط من الطلب
    const cookie = request.headers.get('cookie');
    if (cookie) {
      headers.set('Cookie', cookie);
    }
    
    // إضافة توكن المصادقة إذا كان متاحاً
    const token = await getToken({ req: request as any });
    if (token) {
      headers.set('Authorization', `Bearer ${token.accessToken}`);
    }
    
    // تكوين خيارات الطلب
    const requestOptions: RequestInit = {
      method: request.method,
      headers,
      redirect: 'follow',
    };
    
    // إضافة جسم الطلب في حالة POST/PUT
    if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
      const contentType = request.headers.get('content-type') || '';
      
      if (contentType.includes('application/json')) {
        requestOptions.body = JSON.stringify(await request.json());
      } else if (contentType.includes('multipart/form-data')) {
        // تعامل خاص مع طلبات تحميل الملفات
        const formData = await request.formData();
        requestOptions.body = formData as any;
        
        // إزالة Content-Type لكي يضبط fetch حدود الطلب تلقائياً
        headers.delete('Content-Type');
      }
    }
    
    // إرسال الطلب إلى خادم API
    const response = await fetch(apiUrl, requestOptions);
    
    // بناء استجابة NextResponse
    const responseData = await response.json();
    
    return NextResponse.json(
      responseData,
      {
        status: response.status,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error(`Error proxying API request to /${params.slug.join('/')}:`, error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'حدث خطأ أثناء معالجة الطلب' 
      },
      { status: 500 }
    );
  }
}

// وظائف للتعامل مع مختلف طرق الطلب
export async function GET(request: NextRequest, context: { params: { slug: string[] } }) {
  return proxyApiRequest(request, context);
}

export async function POST(request: NextRequest, context: { params: { slug: string[] } }) {
  return proxyApiRequest(request, context);
}

export async function PUT(request: NextRequest, context: { params: { slug: string[] } }) {
  return proxyApiRequest(request, context);
}

export async function DELETE(request: NextRequest, context: { params: { slug: string[] } }) {
  return proxyApiRequest(request, context);
}
```

### المرحلة 6: النشر والاختبار

#### 6.1 إعداد ملف تكوين Vercel

إنشاء ملف `vercel.json` في الجذر:

```json
{
  "rewrites": [
    { 
      "source": "/api/:path*", 
      "destination": "https://api.fullsco.com/api/:path*" 
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ],
  "env": {
    "NEXT_PUBLIC_API_URL": "https://api.fullsco.com"
  }
}
```

#### 6.2 استراتيجية الاختبار

1. **اختبار الوحدات**:
   - اختبار المكونات الفردية للتأكد من عملها بشكل صحيح

2. **اختبار التكامل**:
   - اختبار تفاعل المكونات مع بعضها البعض
   - اختبار التواصل مع API

3. **اختبار E2E**:
   - اختبار تدفقات المستخدم الكاملة
   - التحقق من المصادقة والتوجيه

4. **اختبار الأداء**:
   - قياس سرعة تحميل الصفحة
   - اختبار تجربة المستخدم على أجهزة مختلفة

#### 6.3 استراتيجية النشر

1. **النشر المرحلي**:
   - البدء بصفحات محددة على Next.js
   - استخدام عنوان فرعي مختلف (مثل `new.fullsco.com`)
   - الاختبار المكثف قبل نقل حركة المرور الفعلية

2. **النشر التدريجي**:
   - نقل نسبة صغيرة من حركة المرور إلى الإصدار الجديد
   - زيادة النسبة تدريجياً بعد التأكد من الاستقرار

3. **النشر الكامل**:
   - توجيه جميع حركة المرور إلى النسخة الجديدة
   - الاحتفاظ بالنسخة القديمة كنسخة احتياطية لفترة

## الخاتمة

توفر هذه الاستراتيجية خطة شاملة للانتقال من التطبيق الحالي المبني على React + Vite إلى تطبيق Next.js أكثر قوة وقابلية للتطوير. من خلال اتباع نهج تدريجي، يمكن إجراء الانتقال بسلاسة وبأقل قدر من التعطيل للمستخدمين.

المزايا الرئيسية التي سيحققها هذا الانتقال تشمل:

1. **تحسين SEO** من خلال العرض من جانب الخادم
2. **تحسين الأداء** باستخدام توليد المحتوى الثابتي والهجين
3. **تبسيط التطوير** مع بنية أكثر تنظيماً
4. **توسيع الميزات** مثل دعم متعدد اللغات والتوجيه المتقدم
5. **تحسين تجربة المستخدم** من خلال تحميل أسرع وانتقالات سلسة

بعد إكمال الانتقال، سيكون النظام جاهزاً للنمو والتوسع المستقبلي مع الحفاظ على الأداء والاستقرار.