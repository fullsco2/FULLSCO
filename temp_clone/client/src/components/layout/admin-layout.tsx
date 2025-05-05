import React, { useState, ReactNode } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useMobile } from "@/hooks/use-mobile";

// الصفحات الفرعية في القائمة الجانبية
const sidebarItems = [
  { id: "dashboard", label: "لوحة التحكم", href: "/admin/dashboard" },
  { id: "scholarships", label: "المنح الدراسية", href: "/admin/scholarships" },
  { id: "posts", label: "المقالات", href: "/admin/posts" },
  { id: "categories", label: "التصنيفات", href: "/admin/categories" },
  { id: "levels", label: "المستويات", href: "/admin/levels" },
  { id: "countries", label: "الدول", href: "/admin/countries" },
  { id: "success-stories", label: "قصص النجاح", href: "/admin/success-stories" },
  { id: "pages", label: "الصفحات", href: "/admin/pages" },
  { id: "statistics", label: "الإحصائيات", href: "/admin/statistics" },
  { id: "partners", label: "الشركاء", href: "/admin/partners" },
  { id: "subscribers", label: "المشتركين", href: "/admin/subscribers" },
  { id: "menus", label: "القوائم", href: "/admin/menus" },
  { id: "media", label: "الوسائط", href: "/admin/media" },
  { id: "users", label: "المستخدمين", href: "/admin/users" },
  // { id: "roles", label: "الصلاحيات", href: "/admin/roles" },
  { id: "site-settings", label: "إعدادات الموقع", href: "/admin/site-settings" },
  { id: "settings", label: "إعدادات متقدمة", href: "/admin/settings" },
  // قسم لصفحات إعدادات الصفحة الرئيسية
  { id: "home-sections", label: "أقسام الصفحة الرئيسية", href: "/admin/settings/home-sections" },
  { id: "seo", label: "تحسين محركات البحث", href: "/admin/seo" },
];

interface AdminLayoutProps {
  children: ReactNode;
  activeItem?: string;
  title?: string;
  actions?: ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  activeItem,
  title,
  actions,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isMobile } = useMobile();
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();

  const handleLogout = async () => {
    await logout();
    setLocation("/admin/login");
  };

  return (
    <div className="bg-background min-h-screen relative overflow-x-hidden">
      {/* القائمة الجانبية */}
      <div
        className={cn(
          "fixed top-0 right-0 h-full w-64 bg-gray-900 text-white shadow-lg transition-transform duration-300 transform z-40",
          isMobile
            ? sidebarOpen
              ? "translate-x-0"
              : "translate-x-full"
            : "translate-x-0"
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <Link href="/admin/dashboard" className="text-xl font-bold">
            لوحة التحكم
          </Link>
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(false)}
              className="text-white hover:bg-gray-800"
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>

        <div className="overflow-y-auto h-[calc(100vh-64px)]">
          <nav className="p-4">
            <ul className="space-y-1">
              {sidebarItems.map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className={cn(
                      "block py-2 px-4 rounded-md transition-colors",
                      activeItem === item.id
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-gray-800"
                    )}
                    onClick={() => isMobile && setSidebarOpen(false)}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      {/* محتوى الصفحة */}
      <div
        className={cn(
          "transition-all duration-300",
          isMobile ? "w-full" : "pr-64"
        )}
      >
        {/* رأس الصفحة */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b p-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center">
              {isMobile && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-2"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="h-5 w-5" />
                </Button>
              )}
              <h1 className="text-xl md:text-2xl font-bold">
                {title || "لوحة التحكم"}
              </h1>
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              {actions}
              
              <Link href="/" className="ml-2">
                <Button variant="outline" size="sm">
                  عرض الموقع
                </Button>
              </Link>

              <Button variant="ghost" size="sm" onClick={handleLogout}>
                تسجيل الخروج
              </Button>
            </div>
          </div>
        </header>

        {/* المحتوى الرئيسي */}
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;