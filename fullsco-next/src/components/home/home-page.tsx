'use client';

import { useEffect, useState } from 'react';
import HeroSection from './hero-section';
import SearchSection from './search-section';
import FeaturedScholarships from './featured-scholarships';
import CategoriesSection from './categories-section';
import CountriesSection from './countries-section';
import LatestArticlesSection from './latest-articles-section';
import SuccessStoriesSection from './success-stories-section';
import StatisticsSection from './statistics-section';
import PartnersSection from './partners-section';
import NewsletterSection from './newsletter-section';

interface SiteSettings {
  showHeroSection?: boolean;
  showFeaturedScholarships?: boolean;
  showSearchSection?: boolean;
  showCategoriesSection?: boolean;
  showCountriesSection?: boolean;
  showLatestArticles?: boolean;
  showSuccessStories?: boolean;
  showNewsletterSection?: boolean;
  showStatisticsSection?: boolean;
  showPartnersSection?: boolean;
  
  heroTitle?: string;
  heroSubtitle?: string;
  heroDescription?: string;
  
  featuredScholarshipsTitle?: string;
  featuredScholarshipsDescription?: string;
  
  categoriesSectionTitle?: string;
  categoriesSectionDescription?: string;
  
  countriesSectionTitle?: string;
  countriesSectionDescription?: string;
  
  latestArticlesTitle?: string;
  latestArticlesDescription?: string;
  
  successStoriesTitle?: string;
  successStoriesDescription?: string;
  
  newsletterSectionTitle?: string;
  newsletterSectionDescription?: string;
  
  statisticsSectionTitle?: string;
  statisticsSectionDescription?: string;
  
  partnersSectionTitle?: string;
  partnersSectionDescription?: string;
}

export default function HomePage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/site-settings');
        if (!response.ok) throw new Error('فشل في جلب إعدادات الموقع');
        
        const data = await response.json();
        setSettings(data.data || {});
      } catch (error) {
        console.error('Error fetching site settings:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSettings();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-8">
          <div className="h-64 w-full bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
          <div className="h-40 w-full bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
          <div className="h-80 w-full bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="home-page">
      {settings?.showHeroSection && (
        <HeroSection 
          title={settings.heroTitle} 
          subtitle={settings.heroSubtitle} 
          description={settings.heroDescription} 
        />
      )}
      
      {settings?.showSearchSection && (
        <SearchSection />
      )}
      
      {settings?.showFeaturedScholarships && (
        <FeaturedScholarships 
          title={settings.featuredScholarshipsTitle} 
          description={settings.featuredScholarshipsDescription} 
        />
      )}
      
      {settings?.showCategoriesSection && (
        <CategoriesSection 
          title={settings.categoriesSectionTitle} 
          description={settings.categoriesSectionDescription} 
        />
      )}
      
      {settings?.showCountriesSection && (
        <CountriesSection 
          title={settings.countriesSectionTitle} 
          description={settings.countriesSectionDescription} 
        />
      )}
      
      {settings?.showLatestArticles && (
        <LatestArticlesSection 
          title={settings.latestArticlesTitle} 
          description={settings.latestArticlesDescription} 
        />
      )}
      
      {settings?.showSuccessStories && (
        <SuccessStoriesSection 
          title={settings.successStoriesTitle} 
          description={settings.successStoriesDescription} 
        />
      )}
      
      {settings?.showStatisticsSection && (
        <StatisticsSection 
          title={settings.statisticsSectionTitle} 
          description={settings.statisticsSectionDescription} 
        />
      )}
      
      {settings?.showPartnersSection && (
        <PartnersSection 
          title={settings.partnersSectionTitle} 
          description={settings.partnersSectionDescription} 
        />
      )}
      
      {settings?.showNewsletterSection && (
        <NewsletterSection 
          title={settings.newsletterSectionTitle} 
          description={settings.newsletterSectionDescription} 
        />
      )}
    </div>
  );
}
