import './globals.css';
import type { Metadata } from 'next';
import { Providers } from '@/components/providers';

export const metadata: Metadata = {
  title: 'FULLSCO - منصة المنح الدراسية',
  description: 'الوجهة الأولى للمنح الدراسية والموارد التعليمية للطلاب العرب حول العالم',
  keywords: 'منح دراسية, دراسة في الخارج, منح ماجستير, منح دكتوراه, تمويل الدراسة',
};

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
