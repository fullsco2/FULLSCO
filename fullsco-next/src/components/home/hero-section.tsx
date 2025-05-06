'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, GraduationCap } from 'lucide-react';
import { useSiteSettings } from '@/hooks/use-site-settings';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function HeroSection() {
  const { siteSettings } = useSiteSettings();
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/scholarships?query=${encodeURIComponent(searchQuery)}`);
    }
  };

  if (!siteSettings || !siteSettings.showHeroSection) return null;

  return (
    <section className="bg-gradient-to-br from-primary/10 to-primary/5 py-12 md:py-20">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 md:grid-cols-2 md:gap-10 lg:gap-16 items-center">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                {siteSettings.heroTitle || 'ابحث عن المنح الدراسية المناسبة لك'}
              </h1>
              <p className="text-muted-foreground md:text-xl">
                {siteSettings.heroDescription || 'أكبر قاعدة بيانات للمنح الدراسية حول العالم'}
              </p>
            </div>
            <form onSubmit={handleSearch} className="flex max-w-md space-x-2 rtl:space-x-reverse">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="ابحث عن منحة دراسية"
                  className="pl-10 pr-3"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button type="submit" className="shrink-0">
                بحث
              </Button>
            </form>
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Link href="/scholarships" passHref>
                <Button size="lg">
                  <GraduationCap className="ml-2 h-5 w-5" />
                  تصفح جميع المنح
                </Button>
              </Link>
              <Link href="/articles" passHref>
                <Button variant="outline" size="lg">
                  أحدث المقالات
                </Button>
              </Link>
            </div>
          </div>
          <div className="flex justify-center">
            <div className="relative h-[350px] w-[350px] md:h-[400px] md:w-[400px] lg:h-[500px] lg:w-[500px] bg-gradient-to-br from-primary/20 to-primary rounded-full flex items-center justify-center overflow-hidden">
              <div className="absolute inset-4 bg-background rounded-full flex items-center justify-center">
                <GraduationCap className="h-24 w-24 md:h-32 md:w-32 text-primary" />
              </div>
              <div className="absolute top-[15%] left-[10%] h-16 w-16 bg-primary/20 rounded-full" />
              <div className="absolute bottom-[20%] right-[15%] h-12 w-12 bg-primary/30 rounded-full" />
              <div className="absolute top-[40%] right-[10%] h-8 w-8 bg-primary/40 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
