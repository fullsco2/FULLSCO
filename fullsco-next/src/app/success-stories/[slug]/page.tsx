import { Metadata } from 'next';
import { SuccessStoryDetail } from '@/components/success-stories/success-story-detail';

type Props = {
  params: { slug: string }
};

// هذه الدالة تجلب بيانات قصة النجاح بناءً على الـ slug
// وتستخدم لإنشاء العناوين الوصفية للصفحة
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = params.slug;
  
  try {
    const story = await getSuccessStory(slug);
    
    if (!story) {
      return {
        title: 'قصة نجاح غير موجودة | منصة المنح الدراسية',
        description: 'لم يتم العثور على قصة النجاح المطلوبة',
      };
    }
    
    return {
      title: `${story.name}: ${story.title} | منصة المنح الدراسية`,
      description: story.excerpt || `قصة نجاح ${story.name}: ${story.title}`,
      openGraph: {
        title: `${story.name}: ${story.title}`,
        description: story.excerpt || '',
        images: story.profileImage ? [{ url: story.profileImage }] : [],
        type: 'article',
      },
    };
  } catch (error) {
    console.error('Error fetching success story for metadata:', error);
    return {
      title: 'قصة نجاح | منصة المنح الدراسية',
      description: 'قصص نجاح الطلاب الذين حصلوا على منح دراسية وتجاربهم التعليمية',
    };
  }
}

// دالة مساعدة لجلب بيانات قصة النجاح
async function getSuccessStory(slug: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/success-stories/${slug}`, { 
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch success story: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching success story:', error);
    return null;
  }
}

export default function SuccessStoryPage({ params }: Props) {
  const { slug } = params;
  
  return <SuccessStoryDetail slug={slug} />;
}
