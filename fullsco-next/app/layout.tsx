import { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../styles/globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'FULLSCO - منصة المنح الدراسية',
  description: 'أكبر منصة للمنح الدراسية للطلاب العرب تتضمن منح دراسية و فرص متنوعة',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
