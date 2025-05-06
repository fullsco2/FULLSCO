'use client';

import { useEffect, ReactNode } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  adminOnly?: boolean;
}

export function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // إذا لم يكن هناك مستخدم وانتهى التحميل
    if (!isLoading && !user) {
      router.push('/auth');
    } 
    
    // إذا كان المسار للمسؤولين فقط والمستخدم ليس مسؤولاً
    if (!isLoading && adminOnly && user?.role !== 'admin') {
      router.push('/');
    }
  }, [user, isLoading, router, adminOnly]);

  // إذا كان التحميل جارياً
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  // إذا لم يكن هناك مستخدم أو إذا كان المسار للمسؤولين فقط والمستخدم ليس مسؤولاً
  if (!user || (adminOnly && user?.role !== 'admin')) {
    return null;
  }

  // إذا كان هناك مستخدم وكان لديه الصلاحيات المناسبة
  return <>{children}</>;
}
