import { Metadata } from 'next';
import SiteLayout from '@/components/layouts/site-layout';

export const metadata: Metadata = {
  title: 'FULLSCO - منصة المنح الدراسية',
  description: 'الوجهة الأولى للمنح الدراسية والموارد التعليمية للطلاب العرب حول العالم',
};

export default function Home() {
  return (
    <SiteLayout>
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-6xl">
            FULLSCO
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 dark:text-gray-300">
            منصة المنح الدراسية - الوجهة الأولى للمنح الدراسية والموارد التعليمية للطلاب العرب حول العالم
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <a
              href="/scholarships"
              className="rounded-md bg-primary px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              استكشف المنح الدراسية
            </a>
            <a
              href="/articles"
              className="text-sm font-semibold leading-6 text-gray-600 dark:text-gray-300"
            >
              موارد تعليمية <span aria-hidden="true">←</span>
            </a>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
