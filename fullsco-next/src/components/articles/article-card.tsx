"use client";

import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import Image from 'next/image';
import { CalendarIcon, User } from 'lucide-react';

type ArticleProps = {
  article: {
    id: number;
    title: string;
    excerpt?: string;
    slug: string;
    thumbnailUrl?: string;
    createdAt: string;
    publishedAt?: string;
    categoryName?: string;
    authorName?: string;
  };
};

export function ArticleCard({ article }: ArticleProps) {
  const {
    title,
    excerpt,
    slug,
    thumbnailUrl,
    createdAt,
    publishedAt,
    categoryName,
    authorName,
  } = article;

  // Format date to display properly
  const publicationDate = publishedAt || createdAt;
  const formattedDate = formatDate(publicationDate);
  
  // Default image if none is provided
  const imageUrl = thumbnailUrl || '/images/placeholder-article.jpg';

  return (
    <div className="group bg-card rounded-lg overflow-hidden border transition-all hover:shadow-md">
      <Link href={`/articles/${slug}`} className="block">
        <div className="aspect-video relative overflow-hidden">
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
          
          {categoryName && (
            <Badge 
              className="absolute top-2 right-2"
              variant="secondary"
            >
              {categoryName}
            </Badge>
          )}
        </div>
        
        <div className="p-4 space-y-2">
          <h3 className="text-xl font-semibold line-clamp-2 min-h-[3.5rem]">
            {title}
          </h3>
          
          {excerpt && (
            <p className="text-muted-foreground text-sm line-clamp-2">
              {excerpt}
            </p>
          )}
          
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t mt-3">
            <div className="flex items-center gap-1">
              <CalendarIcon className="h-3.5 w-3.5 ml-1" />
              {formattedDate}
            </div>
            
            {authorName && (
              <div className="flex items-center gap-1">
                <User className="h-3.5 w-3.5 ml-1" />
                {authorName}
              </div>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
