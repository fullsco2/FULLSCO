'use client';

import { useState, useEffect } from 'react';
import { getPartners } from '@/lib/api';

interface PartnersSectionProps {
  title?: string;
  description?: string;
}

export default function PartnersSection({
  title = 'شركاؤنا',
  description = 'المؤسسات والجامعات التي نتعاون معها',
}: PartnersSectionProps) {
  const [partners, setPartners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPartners() {
      try {
        // طلب مباشر للتأكد من التعامل مع الخادم الحالي
        const response = await fetch('/api/partners');
        if (!response.ok) {
          throw new Error(`فشل الطلب: ${response.status}`);
        }
        
        const data = await response.json();
        
        // التعامل مع هيكل البيانات من API الحالي
        if (data.success && data.data) {
          setPartners(data.data);
        } else if (Array.isArray(data)) {
          setPartners(data);
        } else {
          setPartners([]);
        }
      } catch (error) {
        console.error('Error loading partners:', error);
      } finally {
        setLoading(false);
      }
    }

    loadPartners();
  }, []);

  return (
    <section className="bg-gray-50 py-14 dark:bg-gray-900/50 md:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h2 className="mb-3 text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">{title}</h2>
          <p className="mx-auto max-w-2xl text-gray-600 dark:text-gray-300">{description}</p>
        </div>

        {loading ? (
          <div className="flex flex-wrap items-center justify-center gap-8">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="h-20 w-32 bg-gray-200 dark:bg-gray-800 rounded-md"></div>
              </div>
            ))}
          </div>
        ) : partners.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-gray-500 dark:text-gray-400">لا يوجد شركاء متاحين حالياً.</p>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            {partners.map((partner) => (
              <div 
                key={partner.id} 
                className="group grayscale transition-all duration-300 hover:grayscale-0"
              >
                {partner.logo ? (
                  <img 
                    src={partner.logo} 
                    alt={partner.name} 
                    className="max-h-16 w-auto md:max-h-20"
                  />
                ) : (
                  <div className="flex h-16 items-center justify-center rounded-md bg-gray-100 px-4 dark:bg-gray-800 md:h-20">
                    <span className="text-lg font-bold text-gray-700 dark:text-gray-300">{partner.name}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
