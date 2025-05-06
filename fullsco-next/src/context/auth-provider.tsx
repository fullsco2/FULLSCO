'use client';

import { AuthProvider } from '@/hooks/use-auth';
import { Toaster } from '@/components/ui/toaster';

interface AuthContextProviderProps {
  children: React.ReactNode;
}

export function AuthContextProvider({ children }: AuthContextProviderProps) {
  return (
    <AuthProvider>
      {children}
      <Toaster />
    </AuthProvider>
  );
}
