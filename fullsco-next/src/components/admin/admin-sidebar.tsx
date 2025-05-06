'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  FileText,
  Bookmark,
  GraduationCap,
  Globe,
  Users,
  Settings,
  Mail,
  Menu,
  X,
  PenTool,
  Award,
  Image,
  BookOpen,
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';

interface SidebarLink {
  href: string;
  label: string;
  icon: React.ReactNode;
  admin?: boolean; // إذا كان ترو سيكون متاحًا فقط للمسؤولين
}

const sidebarLinks: SidebarLink[] = [
  {
    href: '/admin/dashboard',
    label: 'لوحة القيادة',
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    href: '/admin/scholarships',
    label: 'المنح الدراسية',
    icon: <Bookmark className="h-5 w-5" />,
  },
  {
    href: '/admin/articles',
    label: 'المقالات',
    icon: <FileText className="h-5 w-5" />,
  },
  {
    href: '/admin/categories',
    label: 'التصنيفات',
    icon: <BookOpen className="h-5 w-5" />,
  },
  {
    href: '/admin/levels',
    label: 'المستويات الدراسية',
    icon: <GraduationCap className="h-5 w-5" />,
  },
  {
    href: '/admin/countries',
    label: 'الدول',
    icon: <Globe className="h-5 w-5" />,
  },
  {
    href: '/admin/success-stories',
    label: 'قصص النجاح',
    icon: <Award className="h-5 w-5" />,
  },
  {
    href: '/admin/users',
    label: 'المستخدمين',
    icon: <Users className="h-5 w-5" />,
    admin: true,
  },
  {
    href: '/admin/media',
    label: 'مكتبة الوسائط',
    icon: <Image className="h-5 w-5" />,
  },
  {
    href: '/admin/pages',
    label: 'الصفحات',
    icon: <PenTool className="h-5 w-5" />,
    admin: true,
  },
  {
    href: '/admin/subscribers',
    label: 'المشتركين',
    icon: <Mail className="h-5 w-5" />,
    admin: true,
  },
  {
    href: '/admin/settings',
    label: 'الإعدادات',
    icon: <Settings className="h-5 w-5" />,
    admin: true,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // تحديد ما إذا كان الجهاز جوالًا أم لا
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);

    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);

  // تصفية الروابط بناءً على دور المستخدم
  const filteredLinks = sidebarLinks.filter(link => {
    if (link.admin) {
      return user?.role === 'admin';
    }
    return true;
  });

  const SidebarContent = () => (
    <div className="flex h-full flex-col border-l border-border bg-card">
      <div className="flex h-14 items-center border-b border-border px-4">
        <Link 
          href="/admin/dashboard" 
          className="flex items-center gap-2 font-medium hover:opacity-80"
          onClick={() => isMobile && setOpen(false)}
        >
          <LayoutDashboard className="h-5 w-5 text-primary" />
          <span className="text-lg font-semibold">لوحة التحكم</span>
        </Link>
      </div>
      <ScrollArea className="flex-1 py-2">
        <nav className="grid gap-1 px-2">
          {filteredLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => isMobile && setOpen(false)}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                pathname === link.href
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
        </nav>
      </ScrollArea>
    </div>
  );

  // عرض الشريط الجانبي اعتمادًا على حجم الشاشة
  if (isMobile) {
    return (
      <>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="fixed bottom-4 left-4 z-40 h-10 w-10 rounded-full bg-primary text-white shadow-lg hover:bg-primary/90 lg:hidden"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[280px] p-0">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </>
    );
  }

  return <SidebarContent />;
}
