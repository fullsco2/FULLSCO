'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/ui/pagination';
import { Loader2, AlertCircle } from 'lucide-react';

type SuccessStory = {
  id: number;
  name: string;
  title: string;
  content: string;
  excerpt?: string;
  slug: string;
  university?: string;
  country?: string;
  profileImage?: string;
  thumbnailUrl?: string;
  year?: number;
  createdAt: string;
  updatedAt: string;
};

export function SuccessStoriesPage() {
  const [stories, setStories] = useState<SuccessStory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchSuccessStories = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const queryParams = new URLSearchParams();
        queryParams.append('page', currentPage.toString());
        queryParams.append('limit', '9');

        const response = await fetch(`/api/success-stories?${queryParams.toString()}`);
        if (!response.ok) {
          throw new Error(`Error fetching success stories: ${response.status}`);
        }

        const data = await response.json();
        setStories(data?.data || []);
        setTotalPages(data?.meta?.totalPages || 1);
      } catch (error) {
        console.error('Error fetching success stories:', error);
        setError('\u0641\u0634\u0644 \u0641\u064a \u062a\u062d\u0645\u064a\u0644 \u0642\u0635\u0635 \u0627\u0644\u0646\u062c\u0627\u062d. \u064a\u0631\u062c\u0649 \u0627\u0644\u0645\u062d\u0627\u0648\u0644\u0629 \u0645\u0631\u0629 \u0623\u062e\u0631\u0649.');
        setStories([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuccessStories();
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="bg-background min-h-screen py-8 md:py-12">
      <div className="container px-4 md:px-6">
        {/* Page Header */}
        <div className="mb-12 text-center">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">\u0642\u0635\u0635 \u0646\u062c\u0627\u062d</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">\u062a\u062c\u0627\u0631\u0628 \u062d\u0642\u064a\u0642\u064a\u0629 \u0644\u0644\u0637\u0644\u0627\u0628 \u0627\u0644\u0630\u064a\u0646 \u062d\u0635\u0644\u0648\u0627 \u0639\u0644\u0649 \u0645\u0646\u062d \u062f\u0631\u0627\u0633\u064a\u0629 \u0648\u062a\u062d\u0642\u064a\u0642 \u0623\u062d\u0644\u0627\u0645\u0647\u0645</p>
        </div>

        {/* Content Area */}
        <div>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center min-h-[300px]">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p>\u062c\u0627\u0631\u064a \u062a\u062d\u0645\u064a\u0644 \u0642\u0635\u0635 \u0627\u0644\u0646\u062c\u0627\u062d...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center min-h-[300px] text-center">
              <AlertCircle className="h-12 w-12 text-destructive mb-4" />
              <h3 className="text-xl font-semibold">\u062d\u062f\u062b \u062e\u0637\u0623</h3>
              <p className="text-muted-foreground mt-2">{error}</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => window.location.reload()}
              >
                \u0625\u0639\u0627\u062f\u0629 \u0627\u0644\u0645\u062d\u0627\u0648\u0644\u0629
              </Button>
            </div>
          ) : stories.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[300px] text-center">
              <h3 className="text-xl font-semibold">\u0644\u0627 \u062a\u0648\u062c\u062f \u0642\u0635\u0635 \u0646\u062c\u0627\u062d</h3>
              <p className="text-muted-foreground mt-2">\u0644\u0645 \u064a\u062a\u0645 \u0627\u0644\u0639\u062b\u0648\u0631 \u0639\u0644\u0649 \u0642\u0635\u0635 \u0646\u062c\u0627\u062d \u062d\u0627\u0644\u064a\u0627\u064b</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {stories.map((story) => (
                  <SuccessStoryCard key={story.id} story={story} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-12 flex justify-center">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

type SuccessStoryCardProps = {
  story: SuccessStory;
};

function SuccessStoryCard({ story }: SuccessStoryCardProps) {
  const {
    name,
    title,
    excerpt,
    slug,
    university,
    country,
    profileImage,
    thumbnailUrl,
  } = story;

  // Default image if none is provided
  const imageUrl = profileImage || thumbnailUrl || '/images/placeholder-profile.jpg';

  return (
    <div className="bg-card rounded-lg border overflow-hidden transition-all hover:shadow-md">
      <div className="p-4 md:p-6">
        <div className="flex items-center mb-4">
          <div className="relative w-16 h-16 rounded-full overflow-hidden border">
            <Image
              src={imageUrl}
              alt={name}
              fill
              className="object-cover"
            />
          </div>
          
          <div className="ms-4">
            <h3 className="font-medium text-lg">{name}</h3>
            {university && country && (
              <p className="text-sm text-muted-foreground">{university}, {country}</p>
            )}
          </div>
        </div>
        
        <h4 className="text-xl font-semibold mb-2">{title}</h4>
        
        {excerpt && (
          <p className="text-muted-foreground mb-4 line-clamp-3">
            {excerpt}
          </p>
        )}
        
        <div className="mt-4">
          <Link href={`/success-stories/${slug}`} passHref>
            <Button variant="outline" className="w-full">\u0642\u0631\u0627\u0621\u0629 \u0627\u0644\u0645\u0632\u064a\u062f</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
