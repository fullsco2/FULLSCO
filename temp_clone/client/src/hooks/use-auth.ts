import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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

export function useAuth() {
  const queryClient = useQueryClient();
  
  // Get current authenticated user
  const { data: user, isLoading, isError } = useQuery<User | null>({
    queryKey: ['/api/auth/me'],
    onError: () => null,
    refetchOnWindowFocus: true,
    retry: false
  });

  // Login mutation
  const login = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const res = await apiRequest('POST', '/api/auth/login', credentials);
      return res.json();
    },
    onSuccess: (userData) => {
      queryClient.setQueryData(['/api/auth/me'], userData);
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
    }
  });

  // Logout mutation
  const logout = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/auth/logout', {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.setQueryData(['/api/auth/me'], null);
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
    }
  });

  return {
    user,
    isLoading,
    isError,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    login: login.mutate,
    logout: logout.mutate,
    loginStatus: {
      isLoading: login.isPending,
      isError: login.isError,
      error: login.error
    }
  };
}
