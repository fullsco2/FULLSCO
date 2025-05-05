import { ReactNode, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { TooltipProvider } from '@/components/ui/tooltip';
import Sidebar from '@/components/admin/sidebar';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { ThemeProvider } from '@/lib/theme-provider';
import { NotificationProvider } from '@/components/notifications/notification-provider';

interface AdminLayoutProps {
  children: ReactNode;
  title?: string;  // عنوان الصفحة
  actions?: ReactNode;  // أزرار الإجراءات
  activeItem?: string;  // العنصر النشط في السايدبار
  breadcrumbs?: ReactNode; // فتات الخبز للتنقل
}

export default function AdminLayout({ 
  children,
  title,
  actions,
  activeItem,
  breadcrumbs
}: AdminLayoutProps) {
  const [location, setLocation] = useLocation();
  const { user, isLoading } = useAuth();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // إعادة التوجيه إلى صفحة تسجيل الدخول إذا لم يكن المستخدم مسجل الدخول
  useEffect(() => {
    if (!isLoading && !user) {
      setLocation('/login');
    }
  }, [user, isLoading, setLocation]);

  // إغلاق السايدبار عند النقر خارجه على الجوال
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (isMobile && sidebarOpen) {
        const sidebar = document.getElementById('admin-sidebar');
        if (sidebar && !sidebar.contains(e.target as Node)) {
          setSidebarOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isMobile, sidebarOpen]);

  // إغلاق السايدبار عند تغيير الصفحة (على الجوال فقط)
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location, isMobile]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) {
    return null; // سيتم إعادة التوجيه بواسطة useEffect
  }

  return (
    <TooltipProvider>
      <NotificationProvider>
        <div className="flex min-h-screen bg-background">
          <Sidebar 
            isMobileOpen={sidebarOpen} 
            onClose={() => setSidebarOpen(false)}
            activeItem={activeItem}
          />
          
          <div className={`flex-1 transition-all duration-300 ${isMobile ? "mr-0" : "mr-64"}`}>
            <div className="p-4 md:p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <div className="flex items-center">
                  {isMobile && (
                    <Button variant="ghost" size="icon" className="ml-2" onClick={() => setSidebarOpen(true)}>
                      <Menu className="h-5 w-5" />
                    </Button>
                  )}
                  {title && <h1 className="text-xl md:text-2xl font-bold">{title}</h1>}
                </div>
                {actions && (
                  <div className="flex gap-2">
                    {actions}
                  </div>
                )}
              </div>
              
              {/* عرض فتات الخبز إذا كانت موجودة */}
              {breadcrumbs && (
                <div className="mb-4">
                  {breadcrumbs}
                </div>
              )}
              
              {children}
            </div>
          </div>
        </div>
      </NotificationProvider>
    </TooltipProvider>
  );
}
