import React, { createContext, useContext, ReactNode } from "react";
import { apiRequest, queryClient } from "../lib/queryClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "../hooks/use-toast";

type User = {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: string;
};

type LoginCredentials = {
  username: string;
  password: string;
};

type RegisterData = {
  username: string;
  email: string;
  password: string;
  fullName: string;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isError: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (credentials: LoginCredentials) => void;
  register: (data: RegisterData) => void;
  logout: () => void;
  loginStatus: {
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
  };
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Get current authenticated user
  const { data: user, isLoading, isError } = useQuery<User | null, Error>({
    queryKey: ['/api/auth/me'],
    retry: false,
    refetchOnWindowFocus: true,
    staleTime: 300000, // 5 minutes
    gcTime: 600000, // 10 minutes
  });

  // Login mutation
  const login = useMutation<User, Error, LoginCredentials>({
    mutationFn: async (credentials) => {
      const res = await apiRequest('POST', '/api/auth/login', credentials);
      return await res.json();
    },
    onSuccess: (userData) => {
      queryClient.setQueryData(['/api/auth/me'], userData);
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      toast({
        title: "تم تسجيل الدخول بنجاح",
        description: "مرحباً بعودتك إلى منصة فلسكو",
      });
    },
    onError: () => {
      toast({
        title: "خطأ في تسجيل الدخول",
        description: "اسم المستخدم أو كلمة المرور غير صحيحة",
        variant: "destructive"
      });
    }
  });

  // Register mutation
  const register = useMutation({
    mutationFn: async (userData: RegisterData) => {
      const res = await apiRequest('POST', '/api/auth/register', userData);
      return await res.json();
    },
    onSuccess: (userData: User) => {
      queryClient.setQueryData(['/api/auth/me'], userData);
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      toast({
        title: "تم إنشاء الحساب بنجاح",
        description: "مرحباً بك في منصة فلسكو",
      });
    },
    onError: () => {
      toast({
        title: "خطأ في إنشاء الحساب",
        description: "يرجى التحقق من البيانات المدخلة والمحاولة مرة أخرى",
        variant: "destructive"
      });
    }
  });

  // Logout mutation
  const logout = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/auth/logout', {});
      return await res.json();
    },
    onSuccess: () => {
      queryClient.setQueryData(['/api/auth/me'], null);
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      toast({
        title: "تم تسجيل الخروج",
        description: "نراك قريباً",
      });
    },
    onError: () => {
      toast({
        title: "خطأ في تسجيل الخروج",
        description: "حدث خطأ أثناء تسجيل الخروج",
        variant: "destructive"
      });
    }
  });

  const authValue: AuthContextType = {
    user: user || null,
    isLoading,
    isError,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    login: login.mutate,
    register: register.mutate,
    logout: logout.mutate,
    loginStatus: {
      isLoading: login.isPending,
      isError: login.isError,
      error: login.error
    }
  };

  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
