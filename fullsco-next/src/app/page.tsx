import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FULLSCO - منصة المنح الدراسية',
  description: 'الوجهة الأولى للمنح الدراسية والموارد التعليمية للطلاب العرب حول العالم',
};

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between text-sm lg:flex">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-6xl">
            FULLSCO
          </h1>
          <p className="mt-6 text-lg text-gray-600 dark:text-gray-300">
            منصة المنح الدراسية - مشروع قيد التطوير باستخدام Next.js
          </p>
        </div>
      </div>
    </main>
  );
}
