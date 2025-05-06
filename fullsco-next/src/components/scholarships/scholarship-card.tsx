import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { CalendarDays, GraduationCap, MapPin, School } from 'lucide-react';
import { formatDate } from '@/lib/utils';

type ScholarshipProps = {
  scholarship: {
    id: number;
    title: string;
    excerpt?: string;
    slug: string;
    deadline: string;
    thumbnailUrl?: string;
    country?: string;
    university?: string;
    degree?: string;
    categoryName?: string;
    isFeatured?: boolean;
    isFullyFunded?: boolean;
  };
};

export function ScholarshipCard({ scholarship }: ScholarshipProps) {
  const {
    title,
    excerpt,
    slug,
    deadline,
    thumbnailUrl,
    country,
    university,
    degree,
    categoryName,
    isFullyFunded,
  } = scholarship;

  // Format deadline to display properly
  const formattedDeadline = formatDate(deadline);
  
  // Default image if none is provided
  const imageUrl = thumbnailUrl || '/images/placeholder-scholarship.jpg';

  return (
    <div className="bg-card rounded-lg border overflow-hidden transition-all hover:shadow-md">
      <div className="relative">
        <div className="aspect-video relative overflow-hidden">
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover transition-transform hover:scale-105"
          />
        </div>
        
        {isFullyFunded && (
          <Badge 
            className="absolute top-2 right-2 bg-green-600 hover:bg-green-700"
            variant="secondary"
          >
            تمويل كامل
          </Badge>
        )}
        
        {categoryName && (
          <Badge 
            className="absolute top-2 left-2"
            variant="secondary"
          >
            {categoryName}
          </Badge>
        )}
      </div>
      
      <div className="p-4">
        <div className="mb-4 space-y-2">
          <h3 className="text-xl font-semibold line-clamp-2 min-h-[3.5rem]">
            {title}
          </h3>
          
          {excerpt && (
            <p className="text-muted-foreground text-sm line-clamp-2">
              {excerpt}
            </p>
          )}
        </div>

        <div className="space-y-3 mb-4">
          {deadline && (
            <div className="flex items-center text-sm">
              <CalendarDays className="h-4 w-4 ml-2 text-muted-foreground" />
              <span>الموعد النهائي: {formattedDeadline}</span>
            </div>
          )}
          
          {country && (
            <div className="flex items-center text-sm">
              <MapPin className="h-4 w-4 ml-2 text-muted-foreground" />
              <span>{country}</span>
            </div>
          )}
          
          {university && (
            <div className="flex items-center text-sm">
              <School className="h-4 w-4 ml-2 text-muted-foreground" />
              <span>{university}</span>
            </div>
          )}
          
          {degree && (
            <div className="flex items-center text-sm">
              <GraduationCap className="h-4 w-4 ml-2 text-muted-foreground" />
              <span>{degree}</span>
            </div>
          )}
        </div>
        
        <div className="pt-3 border-t">
          <Link href={`/scholarships/${slug}`} passHref>
            <Button className="w-full">عرض التفاصيل</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
