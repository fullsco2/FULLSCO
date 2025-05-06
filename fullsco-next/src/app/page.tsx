import { Metadata } from 'next';
import { HeroSection } from '@/components/home/hero-section';
import { FeaturedScholarships } from '@/components/home/featured-scholarships';
import { CategoriesSection } from '@/components/home/categories-section';
import { CountriesSection } from '@/components/home/countries-section';
import { LatestArticlesSection } from '@/components/home/latest-articles-section';
import { SuccessStoriesSection } from '@/components/home/success-stories-section';
import { StatisticsSection } from '@/components/home/statistics-section';
import { NewsletterSection } from '@/components/home/newsletter-section';
import { PartnersSection } from '@/components/home/partners-section';

export const metadata: Metadata = {
  title: 'الصفحة الرئيسية | منصة المنح الدراسية',
  description: 'ابحث عن المنح الدراسية المناسبة لك واكتشف الفرص التعليمية حول العالم',
};

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <FeaturedScholarships />
      <CategoriesSection />
      <CountriesSection />
      <StatisticsSection />
      <LatestArticlesSection />
      <SuccessStoriesSection />
      <NewsletterSection />
      <PartnersSection />
    </main>
  );
}
