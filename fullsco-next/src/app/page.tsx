import { Metadata } from 'next';
import SiteLayout from '@/components/layouts/site-layout';
import HomePage from '@/components/home/home-page';
import { getSiteSettings } from '@/lib/api';

// ميتاداتا الصفحة الرئيسية
export async function generateMetadata(): Promise<Metadata> {
  try {
    const siteSettings = await getSiteSettings();
    
    return {
      title: siteSettings?.siteName || 'FULLSCO - منصة المنح الدراسية',
      description: siteSettings?.siteDescription || 'المنصة العربية الأولى للمنح الدراسية وفرص الدراسة في الخارج',
      keywords: siteSettings?.siteKeywords || 'منح دراسية, دراسة في الخارج, بكالوريوس, ماجستير, دكتوراه',
    };
  } catch (error) {
    console.error('Error fetching site settings for metadata:', error);
    
    return {
      title: 'FULLSCO - منصة المنح الدراسية',
      description: 'المنصة العربية الأولى للمنح الدراسية وفرص الدراسة في الخارج',
    };
  }
}

export default function Home() {
  return (
    <SiteLayout showFooter={true}>
      <HomePage />
    </SiteLayout>
  );
}
