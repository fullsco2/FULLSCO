'use client';

import Link from 'next/link';
import { Search, GraduationCap, Globe, LucideBriefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeroSectionProps {
  title?: string;
  subtitle?: string;
  description?: string;
}

export default function HeroSection({ 
  title = 'ابحث عن المنح الدراسية المناسبة لك', 
  subtitle = 'اكتشف الاف المنح الدراسية', 
  description = 'أكبر قاعدة بيانات للمنح الدراسية حول العالم',
}: HeroSectionProps) {
  return (
    <section className="relative bg-gradient-to-br from-primary/90 to-primary py-16 text-white md:py-24">
      {/* زخرفة الخلفية */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -bottom-8 -left-24 h-64 w-64 rounded-full bg-white opacity-10 md:h-96 md:w-96"></div>
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white opacity-10 md:h-[30rem] md:w-[30rem]"></div>
      </div>
      
      <div className="container relative z-10 mx-auto px-4 sm:px-6">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-4 text-3xl font-bold md:text-5xl">{title}</h1>
          <h2 className="mb-6 text-xl md:text-2xl">{subtitle}</h2>
          <p className="mb-8 text-lg opacity-90 md:text-xl">{description}</p>
          
          <div className="mb-12 flex flex-wrap justify-center gap-4">
            <Link href="/scholarships">
              <Button size="lg" className="gap-2 bg-white text-primary hover:bg-white/90">
                <Search className="h-5 w-5" />
                استكشف المنح
              </Button>
            </Link>
            <Link href="/scholarships?funded=true">
              <Button size="lg" variant="outline" className="gap-2 border-white text-white hover:bg-white/10">
                <GraduationCap className="h-5 w-5" />
                منح ممولة بالكامل
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3">
            <div className="rounded-lg bg-white/10 p-4 backdrop-blur-sm">
              <div className="mb-3 flex items-center justify-center rounded-full bg-white p-3 text-primary">
                <GraduationCap className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold">منح متنوعة</h3>
              <p className="text-sm opacity-90">آلاف المنح الدراسية لجميع التخصصات والمستويات</p>
            </div>
            
            <div className="rounded-lg bg-white/10 p-4 backdrop-blur-sm">
              <div className="mb-3 flex items-center justify-center rounded-full bg-white p-3 text-primary">
                <Globe className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold">حول العالم</h3>
              <p className="text-sm opacity-90">منح دراسية في جامعات مرموقة من مختلف دول العالم</p>
            </div>
            
            <div className="rounded-lg bg-white/10 p-4 backdrop-blur-sm sm:col-span-2 md:col-span-1">
              <div className="mb-3 flex items-center justify-center rounded-full bg-white p-3 text-primary">
                <LucideBriefcase className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold">فرص مهنية</h3>
              <p className="text-sm opacity-90">تواصل مع الخبراء واحصل على توجيه مهني بعد التخرج</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
