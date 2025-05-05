import React from "react";
import { useActivePartners } from "@/hooks/use-partners";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { Skeleton } from "@/components/ui/skeleton";
import { PartnerData } from "@/hooks/use-partners";

export function Partners() {
  const { partners, isLoading } = useActivePartners();
  const { siteSettings } = useSiteSettings();

  if (!siteSettings?.showPartnersSection) {
    return null;
  }

  return (
    <section className="py-12 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-2">
            {siteSettings?.partnersSectionTitle || "شركاؤنا"}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {siteSettings?.partnersSectionDescription || "المؤسسات والجامعات التي نتعاون معها"}
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {Array(6).fill(0).map((_, index) => (
              <div key={index} className="flex flex-col items-center">
                <Skeleton className="w-20 h-20 rounded-md mb-3" />
                <Skeleton className="w-24 h-4 rounded-md" />
              </div>
            ))}
          </div>
        ) : partners.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400">
            لا يوجد شركاء لعرضهم حاليًا
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {partners.map((partner) => (
              <div 
                key={partner.id}
                className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow hover:shadow-md transition-shadow duration-300 flex flex-col items-center justify-center"
              >
                <div className="h-16 flex items-center justify-center mb-3">
                  {partner.logoUrl ? (
                    <img 
                      src={partner.logoUrl} 
                      alt={partner.name} 
                      className="max-h-16 max-w-full object-contain" 
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center">
                      <span className="text-gray-500 dark:text-gray-400 text-xs text-center">
                        بدون شعار
                      </span>
                    </div>
                  )}
                </div>
                
                <h3 className="text-sm font-medium text-center">
                  {partner.websiteUrl ? (
                    <a 
                      href={partner.websiteUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {partner.name}
                    </a>
                  ) : (
                    <span>{partner.name}</span>
                  )}
                </h3>
                
                {partner.description && (
                  <p className="mt-2 text-xs text-gray-600 dark:text-gray-400 text-center line-clamp-2">
                    {partner.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default Partners;