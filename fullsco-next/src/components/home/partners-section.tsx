'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useSiteSettings } from '@/hooks/use-site-settings';
import { Loader2 } from 'lucide-react';

type Partner = {
  id: number;
  name: string;
  logo: string;
  url?: string;
  description?: string;
};

export function PartnersSection() {
  const { siteSettings } = useSiteSettings();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/partners');
        
        if (!response.ok) {
          throw new Error(`Error fetching partners: ${response.status}`);
        }
        
        const data = await response.json();
        setPartners(data?.data || []);
      } catch (error) {
        console.error('Error fetching partners:', error);
        setPartners([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (siteSettings?.showPartnersSection) {
      fetchPartners();
    }
  }, [siteSettings]);

  if (!siteSettings || !siteSettings.showPartnersSection || (partners.length === 0 && !isLoading)) return null;

  return (
    <section className="py-12 md:py-16">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
            {siteSettings.partnersSectionTitle || 'شركاؤنا'}
          </h2>
          <p className="mt-2 text-muted-foreground">
            {siteSettings.partnersSectionDescription || 'المؤسسات والجامعات التي نتعاون معها'}
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="mr-2">جاري تحميل الشركاء...</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {partners.map((partner) => (
              <PartnerCard key={partner.id} partner={partner} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function PartnerCard({ partner }: { partner: Partner }) {
  return (
    <Card className="overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardContent className="p-4 flex items-center justify-center h-[120px]">
        {partner.logo ? (
          <a 
            href={partner.url || '#'} 
            target={partner.url ? '_blank' : '_self'}
            rel="noopener noreferrer"
            className="w-full h-full flex items-center justify-center"
          >
            <img 
              src={partner.logo} 
              alt={partner.name} 
              className="max-h-[90px] max-w-full object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement!.innerHTML = `<div class="text-center p-2 w-full">${partner.name}</div>`;
              }}
            />
          </a>
        ) : (
          <div className="text-center p-2 w-full">{partner.name}</div>
        )}
      </CardContent>
    </Card>
  );
}
