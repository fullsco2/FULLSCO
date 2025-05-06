'use client';

import { ReactNode, useState, useEffect } from 'react';
import Header from '@/components/header';
import Footer from '@/components/footer';

interface SiteSettings {
  siteName?: string;
  siteTagline?: string;
  siteDescription?: string;
  logo?: string;
  footerText?: string;
  email?: string;
  phone?: string;
  address?: string;
  facebook?: string;
  twitter?: string;
  instagram?: string;
  linkedin?: string;
  youtube?: string;
}

interface SiteLayoutProps {
  children: ReactNode;
  showFooter?: boolean;
}

export default function SiteLayout({ children, showFooter = true }: SiteLayoutProps) {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // جلب إعدادات الموقع
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/site-settings');
        if (!response.ok) throw new Error('فشل في جلب إعدادات الموقع');
        const data = await response.json();
        setSettings(data.data || {});
      } catch (error) {
        console.error('Error fetching site settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <Header settings={settings || {}} />
      <main className="flex-grow">
        {children}
      </main>
      {showFooter && <Footer settings={settings || {}} />}
    </div>
  );
}
