'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getFeaturedScholarships } from '@/lib/api';
import ScholarshipCard from '../scholarships/scholarship-card';

interface FeaturedScholarshipsProps {
  title?: string;
  description?: string;
}

export default function FeaturedScholarships({
  title = 'منح دراسية مميزة',
  description = 'أبرز المنح الدراسية المتاحة حالياً',
}: FeaturedScholarshipsProps) {
  const [scholarships, setScholarships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFeaturedScholarships() {
      try {
        // طلب مباشر للتأكد من التعامل مع الخادم الحالي
        const response = await fetch('/api/scholarships/featured?limit=6');
        if (!response.ok) {
          throw new Error(`فشل الطلب: ${response.status}`);
        }
        
        const data = await response.json();
        // التعامل مع هيكل البيانات من API الحالي
        // قد يكون مصفوفة مباشرة أو رداً success/data
        if (data.success && data.data) {
          setScholarships(data.data);
        } else if (Array.isArray(data)) {
          setScholarships(data);
        } else {
          setScholarships([]);
        }
      } catch (error) {
        console.error('Error loading featured scholarships:', error);
      } finally {
        setLoading(false);
      }
    }

    loadFeaturedScholarships();
  }, []);

  return (
    <section className="bg-gray-50 py-14 dark:bg-gray-900/50 md:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h2 className="mb-3 text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">{title}</h2>
          <p className="mx-auto max-w-2xl text-gray-600 dark:text-gray-300">{description}</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="animate-pulse rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                <div className="h-48 bg-gray-200 dark:bg-gray-800"></div>
                <div className="p-4 space-y-3">
                  <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2"></div>
                  <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : scholarships.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-gray-500 dark:text-gray-400">لا توجد منح مميزة حالياً.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {scholarships.map((scholarship) => (
              <ScholarshipCard key={scholarship.id} scholarship={scholarship} featured={true} />
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <Link href="/scholarships">
            <Button variant="outline" size="lg" className="gap-2">
              عرض جميع المنح
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
