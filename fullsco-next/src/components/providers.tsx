'use client';

import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'react-hot-toast';

// إنشاء موكل للاستعلامات (QueryClient)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 دقائق
      refetchOnWindowFocus: false,
    },
  },
});

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        {children}
        <Toaster 
          position="top-center"
          toastOptions={{
            duration: 5000,
            style: {
              background: 'var(--background)',
              color: 'var(--foreground)',
              fontFamily: 'var(--font-sans)',
            },
          }}
        />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
