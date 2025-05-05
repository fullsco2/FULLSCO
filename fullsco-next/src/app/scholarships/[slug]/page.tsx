import { Metadata } from 'next';
import ScholarshipDetail from '@/components/scholarships/scholarship-detail';
import SiteLayout from '@/components/layouts/site-layout';

interface ScholarshipDetailPageProps {
  params: {
    slug: string;
  };
}

// توليد بيانات التعريف (ميتاداتا) الديناميكية
export async function generateMetadata({ params }: ScholarshipDetailPageProps): Promise<Metadata> {
  try {
    // جلب بيانات المنحة من API الحالي
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/scholarships/${params.slug}`);
    if (!response.ok) {
      return {
        title: 'منحة دراسية | FULLSCO',
        description: 'تفاصيل المنحة الدراسية',
      };
    }
    
    const scholarship = await response.json();
    const data = scholarship.data || scholarship;
    
    return {
      title: `${data.title} | FULLSCO`,
      description: data.description?.slice(0, 160) || 'تفاصيل المنحة الدراسية',
      keywords: data.keywords || `منح دراسية, ${data.level?.name || ''}, ${data.category?.name || ''}, ${data.country?.name || ''}`.trim(),
      openGraph: {
        title: data.title,
        description: data.description?.slice(0, 160) || 'تفاصيل المنحة الدراسية',
        images: data.thumbnail ? [{ url: data.thumbnail }] : [],
      },
    };
  } catch (error) {
    console.error('Error fetching scholarship metadata:', error);
    return {
      title: 'منحة دراسية | FULLSCO',
      description: 'تفاصيل المنحة الدراسية',
    };
  }
}

export default function ScholarshipDetailPage({ params }: ScholarshipDetailPageProps) {
  return (
    <SiteLayout>
      <ScholarshipDetail slug={params.slug} />
    </SiteLayout>
  );
}
