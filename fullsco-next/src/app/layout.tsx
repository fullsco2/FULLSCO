import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FULLSCO - منصة المنح الدراسية',
  description: 'الوجهة الأولى للمنح الدراسية والموارد التعليمية للطلاب العرب حول العالم',
};

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="ar" dir="rtl">
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
