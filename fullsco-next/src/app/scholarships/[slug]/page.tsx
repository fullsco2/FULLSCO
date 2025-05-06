import { Metadata } from 'next';
import { ScholarshipDetail } from '@/components/scholarships/scholarship-detail';

type Props = {
  params: { slug: string }
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = params.slug;
  
  try {
    const scholarship = await getScholarship(slug);
    
    if (!scholarship) {
      return {
        title: '\u0645\u0646\u062d\u0629 \u063a\u064a\u0631 \u0645\u0648\u062c\u0648\u062f\u0629 | \u0645\u0646\u0635\u0629 \u0627\u0644\u0645\u0646\u062d \u0627\u0644\u062f\u0631\u0627\u0633\u064a\u0629',
        description: '\u0644\u0645 \u064a\u062a\u0645 \u0627\u0644\u0639\u062b\u0648\u0631 \u0639\u0644\u0649 \u0627\u0644\u0645\u0646\u062d\u0629 \u0627\u0644\u062f\u0631\u0627\u0633\u064a\u0629 \u0627\u0644\u0645\u0637\u0644\u0648\u0628\u0629',
      };
    }
    
    return {
      title: `${scholarship.title} | \u0645\u0646\u0635\u0629 \u0627\u0644\u0645\u0646\u062d \u0627\u0644\u062f\u0631\u0627\u0633\u064a\u0629`,
      description: scholarship.excerpt || scholarship.description?.slice(0, 160) || `\u0645\u0646\u062d\u0629 ${scholarship.title}`,
      openGraph: {
        title: scholarship.title,
        description: scholarship.excerpt || scholarship.description?.slice(0, 160) || '',
        type: 'article',
      },
    };
  } catch (error) {
    console.error('Error fetching scholarship for metadata:', error);
    return {
      title: '\u0645\u0646\u062d\u0629 \u062f\u0631\u0627\u0633\u064a\u0629 | \u0645\u0646\u0635\u0629 \u0627\u0644\u0645\u0646\u062d \u0627\u0644\u062f\u0631\u0627\u0633\u064a\u0629',
      description: '\u0645\u0646\u062d \u062f\u0631\u0627\u0633\u064a\u0629 \u0645\u062a\u0627\u062d\u0629 \u0641\u064a \u0645\u062e\u062a\u0644\u0641 \u0627\u0644\u062c\u0627\u0645\u0639\u0627\u062a \u0627\u0644\u0639\u0627\u0644\u0645\u064a\u0629',
    };
  }
}

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

export default function ScholarshipPage({ params }: Props) {
  const { slug } = params;
  
  return <ScholarshipDetail slug={slug} />;
}
