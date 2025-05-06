"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  BookOpen,
  Users,
  Settings,
  Award,
  Image,
  Menu,
  X,
  Globe,
  GraduationCap,
  Tags,
  Mail,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

type NavItem = {
  title: string;
  href: string;
  icon: React.ElementType;
  submenu?: NavItem[];
};

const navItems: NavItem[] = [
  {
    title: "لوحة القيادة",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "المنح الدراسية",
    href: "/admin/scholarships",
    icon: GraduationCap,
  },
  {
    title: "المقالات",
    href: "/admin/articles",
    icon: FileText,
  },
  {
    title: "قصص النجاح",
    href: "/admin/success-stories",
    icon: Award,
  },
  {
    title: "التصنيفات",
    href: "/admin/categories",
    icon: Tags,
  },
  {
    title: "المستخدمون",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "مكتبة الوسائط",
    href: "/admin/media",
    icon: Image,
  },
  {
    title: "صفحات الموقع",
    href: "/admin/pages",
    icon: BookOpen,
  },
  {
    title: "الإعدادات",
    href: "/admin/settings",
    icon: Settings,
    submenu: [
      {
        title: "إعدادات الموقع",
        href: "/admin/settings/site",
        icon: Globe,
      },
      {
        title: "إعدادات الرسائل",
        href: "/admin/settings/email",
        icon: Mail,
      },
    ],
  },
];

const MobileNav = () => {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // إغلاق القائمة عند تغيير المسار
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild className="lg:hidden">
        <button
          className="inline-flex items-center justify-center rounded-md p-2 text-primary hover:bg-accent hover:text-primary-foreground focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
          aria-label="فتح القائمة"
        >
          <Menu className="h-6 w-6" />
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[270px] p-0">
        <div className="flex h-14 items-center border-b px-4">
          <button
            type="button"
            className="mr-4 rounded-md p-1 text-primary hover:bg-accent hover:text-primary-foreground"
            onClick={() => setOpen(false)}
            aria-label="إغلاق القائمة"
          >
            <X className="h-5 w-5" />
          </button>
          <Link
            href="/admin/dashboard"
            className="flex items-center font-semibold text-lg"
          >
            لوحة الإدارة
          </Link>
        </div>
        <ScrollArea className="h-[calc(100vh-3.5rem)] py-2">
          <AdminNav mobile />
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

const AdminNav = ({ mobile = false }: { mobile?: boolean }) => {
  const pathname = usePathname();
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  // عند تغيير المسار، نفتح القائمة التي تحتوي على المسار الحالي
  useEffect(() => {
    navItems.forEach((item) => {
      if (item.submenu?.some((subitem) => pathname.startsWith(subitem.href))) {
        setOpenSubmenu(item.href);
      }
    });
  }, [pathname]);

  const toggleSubmenu = (href: string) => {
    setOpenSubmenu(openSubmenu === href ? null : href);
  };

  return (
    <div
      className={cn(
        "pb-12",
        mobile ? "px-4" : "hidden lg:block lg:w-64 lg:border-l"
      )}
    >
      {!mobile && (
        <div className="py-4 flex items-center justify-center">
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center gap-2 text-xl font-semibold"
          >
            لوحة الإدارة
          </Link>
        </div>
      )}
      <nav className="mt-4 lg:mt-8 space-y-1.5 px-3">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const hasSubmenu = !!item.submenu?.length;
          const isSubmenuOpen = openSubmenu === item.href;

          return (
            <div key={item.href} className="relative">
              {hasSubmenu ? (
                <button
                  onClick={() => toggleSubmenu(item.href)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  <span className="truncate">{item.title}</span>
                </button>
              ) : (
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  <span className="truncate">{item.title}</span>
                </Link>
              )}

              {hasSubmenu && isSubmenuOpen && (
                <div className="mt-1 mr-2 space-y-1 border-r pr-2">
                  {item.submenu?.map((subitem) => {
                    const isSubActive = pathname.startsWith(subitem.href);
                    return (
                      <Link
                        key={subitem.href}
                        href={subitem.href}
                        className={cn(
                          "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                          isSubActive
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-muted"
                        )}
                      >
                        <subitem.icon className="h-4 w-4 shrink-0" />
                        <span className="truncate">{subitem.title}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
};

export default function AdminSidebar() {
  return (
    <>
      <MobileNav />
      <AdminNav />
    </>
  );
}
