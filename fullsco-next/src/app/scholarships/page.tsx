import { Metadata } from 'next';
import SiteLayout from '@/components/layouts/site-layout';
import ScholarshipsPage from '@/components/scholarships/scholarships-page';

export const metadata: Metadata = {
  title: 'المنح الدراسية | FULLSCO',
  description: 'استكشف مجموعة واسعة من المنح الدراسية من جميع أنحاء العالم واعثر على منحة تناسب احتياجاتك وأهدافك التعليمية',
  keywords: 'منح دراسية, بكالوريوس, ماجستير, دكتوراه, تمويل كامل, دراسة في الخارج',
};

type ScholarshipsPageProps = {
  searchParams?: {
    country?: string;
    level?: string;
    category?: string;
    funded?: string;
    search?: string;
    page?: string;
  };
};

export default function Scholarships({ searchParams }: ScholarshipsPageProps) {
  return (
    <SiteLayout>
      <ScholarshipsPage searchParams={searchParams} />
    </SiteLayout>
  );
}
