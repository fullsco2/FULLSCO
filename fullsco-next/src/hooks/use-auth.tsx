'use client';

import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useQuery, useMutation, UseMutationResult } from '@tanstack/react-query';
import { User } from '@/types/user';
import { useToast } from '@/hooks/use-toast';

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<User, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<User, Error, RegisterData>;
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
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
  } = useQuery<User>(
    ['user'],
    async () => {
      const res = await fetch('/api/user');
      if (!res.ok) {
        if (res.status === 401) {
          return null;
        }
        throw new Error(`خطأ في جلب بيانات المستخدم: ${res.status}`);
      }
      return res.json();
    },
    {
      enabled: mounted, // فقط قم بالاستعلام إذا كان مثبتًا (على جانب العميل)
      retry: false, // لا تعيد المحاولة لأن 401 هو وضع صحيح لعدم وجود مستخدم مسجل دخوله
      refetchOnWindowFocus: false, // لا تقم بإعادة الاستعلام عند التركيز على النافذة
    }
  );

  const loginMutation = useMutation<User, Error, LoginData>(
    async (credentials) => {
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

      return res.json();
    },
    {
      onSuccess: () => {
        toast({
          title: 'تم تسجيل الدخول بنجاح',
          description: 'مرحباً بك مرة أخرى!',
          variant: 'default',
        });
        refetch(); // إعادة جلب بيانات المستخدم
      },
      onError: (error) => {
        toast({
          title: 'خطأ في تسجيل الدخول',
          description: error.message,
          variant: 'destructive',
        });
      },
    }
  );

  const registerMutation = useMutation<User, Error, RegisterData>(
    async (userData) => {
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

      return res.json();
    },
    {
      onSuccess: () => {
        toast({
          title: 'تم إنشاء الحساب بنجاح',
          description: 'مرحباً بك في منصة فولسكو!',
          variant: 'default',
        });
        refetch(); // إعادة جلب بيانات المستخدم
      },
      onError: (error) => {
        toast({
          title: 'خطأ في إنشاء الحساب',
          description: error.message,
          variant: 'destructive',
        });
      },
    }
  );

  const logoutMutation = useMutation<void, Error, void>(
    async () => {
      const res = await fetch('/api/logout', {
        method: 'POST',
      });

      if (!res.ok) {
        throw new Error('خطأ في تسجيل الخروج');
      }
    },
    {
      onSuccess: () => {
        toast({
          title: 'تم تسجيل الخروج بنجاح',
          description: 'نراك قريباً!',
          variant: 'default',
        });
        refetch(); // إعادة جلب بيانات المستخدم (سيعود null)
      },
      onError: (error) => {
        toast({
          title: 'خطأ في تسجيل الخروج',
          description: error.message,
          variant: 'destructive',
        });
      },
    }
  );

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
