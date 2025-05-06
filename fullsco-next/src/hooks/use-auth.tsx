'use client';

import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { User } from '@/types/user';
import { useToast } from '@/hooks/use-toast';

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: ReturnType<typeof useLoginMutation>;
  logoutMutation: ReturnType<typeof useLogoutMutation>;
  registerMutation: ReturnType<typeof useRegisterMutation>;
};

type LoginData = {
  username: string;
  password: string;
};

type RegisterData = {
  username: string;
  email: string;
  password: string;
};

const AuthContext = createContext<AuthContextType | null>(null);

// Custom hook for login mutation
function useLoginMutation() {
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'خطأ في تسجيل الدخول');
      }

      return res.json() as Promise<User>;
    },
    onSuccess: (data) => {
      toast({
        title: 'تم تسجيل الدخول بنجاح',
        description: 'مرحباً بك مرة أخرى!',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'خطأ في تسجيل الدخول',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

// Custom hook for registration mutation
function useRegisterMutation() {
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (userData: RegisterData) => {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'خطأ في إنشاء الحساب');
      }

      return res.json() as Promise<User>;
    },
    onSuccess: (data) => {
      toast({
        title: 'تم إنشاء الحساب بنجاح',
        description: 'مرحباً بك في منصة فولسكو!',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'خطأ في إنشاء الحساب',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

// Custom hook for logout mutation
function useLogoutMutation() {
  const { toast } = useToast();
  return useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/logout', {
        method: 'POST',
      });

      if (!res.ok) {
        throw new Error('خطأ في تسجيل الخروج');
      }
    },
    onSuccess: () => {
      toast({
        title: 'تم تسجيل الخروج بنجاح',
        description: 'نراك قريباً!',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'خطأ في تسجيل الخروج',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  
  // التأكد من أن الكود ينفذ فقط على جانب العميل
  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    data: user,
    error,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const res = await fetch('/api/user');
      if (!res.ok) {
        if (res.status === 401) {
          return null;
        }
        throw new Error(`خطأ في جلب بيانات المستخدم: ${res.status}`);
      }
      return res.json() as Promise<User>;
    },
    enabled: mounted, // فقط قم بالاستعلام إذا كان مثبتًا (على جانب العميل)
    retry: false, // لا تعيد المحاولة لأن 401 هو وضع صحيح لعدم وجود مستخدم مسجل دخوله
    refetchOnWindowFocus: false, // لا تقم بإعادة الاستعلام عند التركيز على النافذة
  });

  const loginMutation = useLoginMutation();
  const registerMutation = useRegisterMutation();
  const logoutMutation = useLogoutMutation();

  // تحديث بيانات المستخدم بعد العمليات
  useEffect(() => {
    // إعادة جلب بيانات المستخدم بعد العمليات الناجحة
    if (loginMutation.isSuccess || registerMutation.isSuccess || logoutMutation.isSuccess) {
      refetch();
    }
  }, [loginMutation.isSuccess, registerMutation.isSuccess, logoutMutation.isSuccess, refetch]);

  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        isLoading,
        error: error || null,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth يجب أن يستخدم داخل AuthProvider');
  }
  return context;
}
