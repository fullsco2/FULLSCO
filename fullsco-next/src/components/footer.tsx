'use client';

import Link from "next/link";
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, Youtube } from "lucide-react";

interface FooterProps {
  settings?: {
    siteName?: string;
    siteDescription?: string;
    footerText?: string;
    email?: string;
    phone?: string;
    address?: string;
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    youtube?: string;
  };
}

const Footer = ({ settings }: FooterProps) => {
  return (
    <footer className="bg-gray-900 text-white pt-12 pb-6">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <div>
            <Link href="/" className="flex items-center mb-4">
              <span className="text-2xl font-bold">
                {settings?.siteName || 'FULLSCO'}
              </span>
            </Link>
            <p className="text-gray-400 mb-4">
              {settings?.siteDescription || 'دليلك الشامل لفرص المنح الدراسية في جميع أنحاء العالم. نساعد الطلاب في العثور على المنح الدراسية والتقديم عليها لتحقيق أحلامهم الأكاديمية.'}
            </p>
            <div className="flex space-x-4 rtl:space-x-reverse">
              {settings?.facebook && (
                <a href={settings.facebook} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary">
                  <Facebook className="h-5 w-5" />
                </a>
              )}
              {settings?.twitter && (
                <a href={settings.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary">
                  <Twitter className="h-5 w-5" />
                </a>
              )}
              {settings?.instagram && (
                <a href={settings.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary">
                  <Instagram className="h-5 w-5" />
                </a>
              )}
              {settings?.linkedin && (
                <a href={settings.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary">
                  <Linkedin className="h-5 w-5" />
                </a>
              )}
              {settings?.youtube && (
                <a href={settings.youtube} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary">
                  <Youtube className="h-5 w-5" />
                </a>
              )}
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">روابط سريعة</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-white block">الرئيسية</Link>
              </li>
              <li>
                <Link href="/scholarships" className="text-gray-400 hover:text-white block">المنح الدراسية</Link>
              </li>
              <li>
                <Link href="/articles" className="text-gray-400 hover:text-white block">المدونة</Link>
              </li>
              <li>
                <Link href="/success-stories" className="text-gray-400 hover:text-white block">قصص النجاح</Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">المنح الدراسية</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/scholarships?level=bachelor" className="text-gray-400 hover:text-white block">البكالوريوس</Link>
              </li>
              <li>
                <Link href="/scholarships?level=masters" className="text-gray-400 hover:text-white block">الماجستير</Link>
              </li>
              <li>
                <Link href="/scholarships?level=phd" className="text-gray-400 hover:text-white block">الدكتوراه</Link>
              </li>
              <li>
                <Link href="/scholarships?funded=true" className="text-gray-400 hover:text-white block">تمويل كامل</Link>
              </li>
              <li>
                <Link href="/scholarships" className="text-gray-400 hover:text-white block">حسب الدولة</Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">اتصل بنا</h3>
            <ul className="space-y-2">
              {settings?.email && (
                <li className="flex items-start">
                  <Mail className="ml-2 mt-1 h-4 w-4 text-primary" />
                  <span className="text-gray-400">{settings.email}</span>
                </li>
              )}
              {settings?.phone && (
                <li className="flex items-start">
                  <Phone className="ml-2 mt-1 h-4 w-4 text-primary" />
                  <span className="text-gray-400">{settings.phone}</span>
                </li>
              )}
              {settings?.address && (
                <li className="flex items-start">
                  <MapPin className="ml-2 mt-1 h-4 w-4 text-primary" />
                  <span className="text-gray-400">{settings.address}</span>
                </li>
              )}
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-6">
          <div className="flex flex-col md:flex-row md:justify-between items-center">
            <p className="text-sm text-gray-400">
              {settings?.footerText || `© ${new Date().getFullYear()} ${settings?.siteName || 'FULLSCO'}. جميع الحقوق محفوظة.`}
            </p>
            <div className="flex space-x-4 rtl:space-x-reverse mt-4 md:mt-0">
              <Link href="/page/privacy-policy" className="text-sm text-gray-400 hover:text-white mr-4">
                سياسة الخصوصية
              </Link>
              <Link href="/page/terms" className="text-sm text-gray-400 hover:text-white mr-4">
                شروط الاستخدام
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
