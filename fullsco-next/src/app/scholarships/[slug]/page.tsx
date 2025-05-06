import { Metadata } from 'next';
import { ScholarshipDetail } from '@/components/scholarships/scholarship-detail';

type Props = {
  params: { slug: string }
};

// هذه الدالة تجلب بيانات المنحة الدراسية بناءً على الـ slug
// وتستخدم لإنشاء العناوين الوصفية للصفحة
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = params.slug;
  
  try {
    const scholarship = await getScholarship(slug);
    
    if (!scholarship) {
      return {
        title: 'منحة غير موجودة | منصة المنح الدراسية',
        description: 'لم يتم العثور على المنحة الدراسية المطلوبة',
      };
    }
    
    return {
      title: `${scholarship.title} | منصة المنح الدراسية`,
      description: scholarship.excerpt || scholarship.title,
    };
  } catch (error) {
    console.error('Error fetching scholarship for metadata:', error);
    return {
      title: 'تفاصيل المنحة | منصة المنح الدراسية',
      description: 'تفاصيل المنحة الدراسية ومتطلبات التقديم',
    };
  }
}

// دالة مساعدة لجلب بيانات المنحة الدراسية
async function getScholarship(slug: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/scholarships/${slug}`, { 
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch scholarship: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching scholarship:', error);
    return null;
  }
}

export default function ScholarshipDetailPage({ params }: Props) {
  const { slug } = params;
  
  return <ScholarshipDetail slug={slug} />;
}
