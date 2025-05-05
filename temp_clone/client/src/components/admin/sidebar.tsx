import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { 
  LayoutDashboard, 
  GraduationCap, 
  FileText, 
  Users, 
  Settings, 
  Search, 
  BarChart, 
  LogOut,
  Menu,
  X,
  Home,
  FolderTree,
  School,
  Globe,
  MapPin,
  Palette,
  FileEdit,
  ListTree,
  ImageIcon,
  ShieldCheck,
  Database,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Newspaper,
  Trophy,
  Bell,
  Mail,
  MessageSquare,
  Sparkles,
  Award,
  PanelLeft,
  MoveHorizontal,
  LayoutGrid,
  Pin,
  PinOff,
  Bookmark,
  Star,
  Building2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { NotificationBell } from '@/components/notifications/notification-provider';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Input } from '@/components/ui/input';

type NavItem = {
  href?: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  items?: NavItem[];
  badge?: string;
  badgeColor?: string;
};

// تجميع العناصر في مجموعات منطقية
const navItems: NavItem[] = [
  { href: '/admin/dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
  
  { 
    label: 'إدارة المنح',
    icon: GraduationCap,
    items: [
      { href: '/admin/scholarships', label: 'المنح الدراسية', icon: GraduationCap, badge: '24', badgeColor: 'bg-blue-500' },
      { href: '/admin/scholarships/create', label: 'إضافة منحة جديدة', icon: FileEdit },
      { href: '/admin/categories', label: 'التصنيفات', icon: FolderTree },
      { href: '/admin/levels', label: 'المستويات الدراسية', icon: School },
      { href: '/admin/countries', label: 'الدول', icon: Globe, badge: 'جديد', badgeColor: 'bg-green-500' },
    ]
  },
  
  { 
    label: 'المحتوى', 
    icon: FileText,
    items: [
      { href: '/admin/posts', label: 'المقالات', icon: Newspaper, badge: '18', badgeColor: 'bg-blue-500' },
      { href: '/admin/posts/create', label: 'إضافة مقال جديد', icon: FileEdit },
      { href: '/admin/pages', label: 'الصفحات الثابتة', icon: BookOpen },
      { href: '/admin/menus', label: 'القوائم والروابط', icon: ListTree },
      { href: '/admin/media', label: 'مكتبة الوسائط', icon: ImageIcon },
      { href: '/admin/success-stories', label: 'قصص النجاح', icon: Trophy, badge: 'جديد', badgeColor: 'bg-green-500' },
    ]
  },
  
  { 
    label: 'إدارة المستخدمين',
    icon: Users,
    items: [
      { href: '/admin/users', label: 'المستخدمين', icon: Users, badge: '240+', badgeColor: 'bg-blue-500' },
      { href: '/admin/roles', label: 'الأدوار والتصاريح', icon: ShieldCheck },
      { href: '/admin/subscribers', label: 'المشتركين', icon: Mail, badge: '12', badgeColor: 'bg-orange-500' },
      { href: '/admin/messages', label: 'الرسائل', icon: MessageSquare, badge: '5', badgeColor: 'bg-red-500' },
    ]
  },
  
  { 
    label: 'إعدادات الموقع',
    icon: Settings,
    items: [
      { href: '/admin/settings/general', label: 'الإعدادات العامة', icon: Settings },
      { href: '/admin/settings/appearance', label: 'المظهر والألوان', icon: Palette },
      { href: '/admin/settings/home-sections', label: 'أقسام الصفحة الرئيسية', icon: LayoutGrid },
      { href: '/admin/settings/contact', label: 'معلومات الاتصال', icon: MessageSquare },
      { href: '/admin/settings/social', label: 'الشبكات الاجتماعية', icon: Globe },
    ]
  },
  
  { 
    label: 'تحليلات وإعدادات',
    icon: BarChart,
    items: [
      { href: '/admin/analytics', label: 'تحليلات الزيارات', icon: BarChart },
      { href: '/admin/statistics', label: 'الإحصائيات', icon: Award, badge: 'جديد', badgeColor: 'bg-green-500' },
      { href: '/admin/partners', label: 'الشركاء', icon: Building2, badge: 'جديد', badgeColor: 'bg-green-500' },
      { href: '/admin/seo', label: 'تحسين محركات البحث', icon: Search },
      { href: '/admin/backups', label: 'النسخ الاحتياطي', icon: Database },
    ]
  },
];

// العناصر المثبتة / المفضلة (الوصول السريع)
const pinnedItems: NavItem[] = [
  { href: '/admin/scholarships/create', label: 'إضافة منحة', icon: GraduationCap },
  { href: '/admin/posts/create', label: 'إضافة مقال', icon: FileText },
  { href: '/admin/settings/general', label: 'الإعدادات', icon: Settings },
];

interface SidebarProps {
  isMobileOpen: boolean;
  onClose: () => void;
  activeItem?: string;  // العنصر النشط في السايدبار
}

const Sidebar = ({ isMobileOpen, onClose, activeItem }: SidebarProps) => {
  const [location] = useLocation();
  const { logout, user } = useAuth();
  const isMobile = useIsMobile();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(() => {
    // إعداد قيم افتراضية للمجموعات (مغلقة بشكل افتراضي)
    const initialState: Record<string, boolean> = {};
    navItems.forEach((_, index) => {
      initialState[`group-${index}`] = false;
    });
    return initialState;
  });
  const [navSearchTerm, setNavSearchTerm] = useState("");
  const [isCompact, setIsCompact] = useState(false);
  
  // محاولة استعادة حالة السايدبار المضغوط من التخزين المحلي
  useEffect(() => {
    const savedCompactState = localStorage.getItem('sidebar-compact') === 'true';
    if (!isMobile) {
      setIsCompact(savedCompactState);
    }
  }, [isMobile]);

  // تبديل حالة وضع السايدبار المضغوط
  const toggleCompactMode = () => {
    const newState = !isCompact;
    setIsCompact(newState);
    localStorage.setItem('sidebar-compact', String(newState));
  };
  
  // للكشف عن المجموعة النشطة تلقائيًا
  // إعداد حالة توسيع المجموعات عند أول تحميل للمكون وعند تغيير المسار
  useEffect(() => {
    // استخدام وظيفة updater للحفاظ على تزامن الحالة
    setExpandedGroups(prevState => {
      const newState = { ...prevState };
      
      // تحديث حالة المجموعات بناءً على المسار الحالي
      navItems.forEach((item, index) => {
        const groupKey = `group-${index}`;
        
        // إذا كانت المجموعة تحتوي على عناصر فرعية
        if (item.items) {
          // تحقق مما إذا كان أي عنصر فرعي نشطًا
          const hasActiveItem = item.items.some(subItem => {
            // استخدم دالة isActive الجديدة للتحقق
            if (activeItem && subItem.href && subItem.href.includes(activeItem)) {
              return true;
            }
            return subItem.href === location;
          });
          
          // توسيع المجموعة فقط إذا كان بها عنصر نشط
          if (hasActiveItem) {
            newState[groupKey] = true;
          }
        }
      });
      
      return newState;
    });
  }, [location, activeItem, navItems]);
  
  // إزالة تعليق overflow من الجسم عند تنظيف المكون
  useEffect(() => {
    // إعادة تمكين التمرير عند تفكيك المكون
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // معالجة فتح وإغلاق السايدبار
  useEffect(() => {
    if (isMobile) {
      if (isMobileOpen) {
        // فتح السايدبار في وضع الموبايل
        document.body.style.overflow = 'hidden'; // منع التمرير في الخلفية
      } else {
        // إغلاق السايدبار في وضع الموبايل
        document.body.style.overflow = ''; // إعادة تمكين التمرير
      }
    } else {
      // تأكد من إعادة تمكين التمرير دائمًا في وضع سطح المكتب
      document.body.style.overflow = '';
    }
  }, [isMobileOpen, isMobile]);

  const handleLogout = () => {
    // إعادة تمكين التمرير قبل تسجيل الخروج
    document.body.style.overflow = '';
    logout();
  };

  const isActive = (path: string) => {
    if (activeItem && path.includes(activeItem)) {
      return true;
    }
    return location === path;
  };
  
  const toggleGroup = (groupKey: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupKey]: !prev[groupKey],
    }));
  };

  // تصفية عناصر القائمة بناءً على كلمة البحث
  const getFilteredNavItems = () => {
    if (!navSearchTerm) return navItems;
    
    return navItems.map(category => {
      // البحث في العناصر الرئيسية
      if (!category.items) {
        if (category.label.toLowerCase().includes(navSearchTerm.toLowerCase())) {
          return category;
        }
        return null;
      }
      
      // البحث في العناصر الفرعية
      const filteredItems = category.items.filter(item => 
        item.label.toLowerCase().includes(navSearchTerm.toLowerCase())
      );
      
      if (filteredItems.length > 0) {
        return {
          ...category,
          items: filteredItems
        };
      }
      
      // البحث في اسم الفئة نفسها
      if (category.label.toLowerCase().includes(navSearchTerm.toLowerCase())) {
        return category;
      }
      
      return null;
    }).filter(Boolean) as NavItem[];
  };
  
  const filteredNavItems = getFilteredNavItems();
  
  return (
    <>
      {/* طبقة التظليل خلف السايدبار عند فتحه في الموبايل */}
      {isMobile && isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* السايدبار */}
      <aside 
        ref={sidebarRef}
        className={cn(
          "bg-background dark:bg-gray-900 flex flex-col border-r dark:border-gray-800 shadow-lg z-50 transition-all duration-300 ease-in-out",
          isMobile 
            ? "fixed inset-y-0 right-0 w-full max-w-[300px] transform" 
            : isCompact 
              ? "w-[66px]" 
              : "w-64 h-screen sticky top-0"
        )}
        style={{
          transform: isMobile 
            ? isMobileOpen ? 'translateX(0)' : 'translateX(100%)' 
            : 'none'
        }}
        aria-hidden={isMobile && !isMobileOpen}
      >
        {/* زر الإغلاق - تم تغيير الموضع ليناسب الاتجاه العربي RTL */}
        {isMobile && isMobileOpen && (
          <button 
            className="absolute -left-10 top-4 bg-primary text-primary-foreground p-2 rounded-l-md shadow-lg" 
            onClick={onClose}
            aria-label="إغلاق القائمة"
          >
            <X className="h-5 w-5" />
          </button>
        )}

        {/* رأس السايدبار */}
        <div className={cn(
          "p-4 flex items-center border-b dark:border-gray-800",
          isCompact ? "justify-center py-3" : "justify-between"
        )}>
          {isCompact ? (
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/admin" className="flex items-center justify-center">
                    <div className="bg-primary/10 dark:bg-primary/20 p-2 rounded-full">
                      <Sparkles className="h-5 w-5 text-primary" />
                    </div>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p className="text-xs">FULLSCO - لوحة الإدارة</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <Link href="/admin" className="flex items-center">
              <div className="bg-primary/10 dark:bg-primary/20 p-2 rounded-md mr-2">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="text-xl font-bold flex items-center">
                  FULL<span className="text-primary">SCO</span>
                </div>
                <span className="text-xs text-muted-foreground">لوحة الإدارة</span>
              </div>
            </Link>
          )}

          {/* زر تبديل وضع السايدبار المضغوط - ليس للموبايل */}
          {!isMobile && !isCompact && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleCompactMode}
              className="h-7 w-7"
              title="تصغير القائمة"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}

          {/* زر توسيع السايدبار المضغوط */}
          {!isMobile && isCompact && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleCompactMode}
              className="h-7 w-7 absolute left-2 top-3"
              title="توسيع القائمة"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        {/* قائمة التنقل */}
        <ScrollArea className="flex-1 overflow-x-hidden">
          <div className={cn(
            "py-3",
            isCompact ? "px-1.5" : "px-3"
          )}>
            {/* بحث وتصفية القائمة - إذا لم تكن مضغوطة */}
            {!isCompact && (
              <div className="relative mb-3">
                <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="بحث في القائمة..."
                  className="pr-9 h-9 text-sm bg-muted/40"
                  value={navSearchTerm}
                  onChange={(e) => setNavSearchTerm(e.target.value)}
                />
              </div>
            )}

            {/* زر العودة للموقع الرئيسي */}
            {!isCompact ? (
              <Link href="/">
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-between px-3 py-2 h-auto text-sm rounded-md mb-2",
                  )}
                >
                  <div className="flex items-center">
                    <Home className="ml-2 h-4 w-4" />
                    العودة للموقع
                  </div>
                  <MoveHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              </Link>
            ) : (
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link href="/">
                      <Button
                        variant="outline"
                        size="icon"
                        className="w-full h-9 mb-2"
                      >
                        <Home className="h-4 w-4" />
                      </Button>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="left">
                    <p className="text-xs">العودة للموقع</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            
            {/* العناصر المثبتة (المفضلة) في الوضع المضغوط فقط */}
            {isCompact && (
              <>
                <div className="border-b border-border/40 pt-1 pb-3 mb-2">
                  {pinnedItems.map((item) => (
                    <TooltipProvider key={item.href} delayDuration={300}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Link href={item.href || '#'}>
                            <Button
                              variant={isActive(item.href || '') ? "default" : "ghost"}
                              size="icon"
                              className={cn(
                                "w-full h-9 my-1",
                                isActive(item.href || '') && "bg-primary text-primary-foreground"
                              )}
                            >
                              <item.icon className="h-4 w-4" />
                            </Button>
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent side="left">
                          <p className="text-xs">{item.label}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                </div>
              </>
            )}

            {/* العناصر الرئيسية */}
            <div className="space-y-1">
              {filteredNavItems.map((item, index) => {
                // إذا كان العنصر بدون قائمة فرعية
                if (!item.items && item.href) {
                  return isCompact ? (
                    <TooltipProvider key={item.href} delayDuration={300}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Link href={item.href}>
                            <Button
                              variant={isActive(item.href) ? "default" : "ghost"}
                              size="icon"
                              className={cn(
                                "w-full h-9 my-1",
                                isActive(item.href) && "bg-primary text-primary-foreground"
                              )}
                            >
                              <item.icon className="h-4 w-4" />
                              {item.badge && (
                                <span className={cn(
                                  "absolute top-0 right-0 text-[0.6rem] font-medium rounded-full w-3.5 h-3.5 flex items-center justify-center", 
                                  item.badgeColor || "bg-primary"
                                )}>
                                  •
                                </span>
                              )}
                            </Button>
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent side="left">
                          <p className="text-xs">{item.label}</p>
                          {item.badge && (
                            <Badge className={cn("mr-1 text-white text-[0.6rem] px-1 py-0 h-3.5 ml-1", item.badgeColor || "bg-primary")}>
                              {item.badge}
                            </Badge>
                          )}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : (
                    <Link key={item.href} href={item.href}>
                      <Button
                        variant={isActive(item.href) ? "default" : "ghost"}
                        className={cn(
                          "w-full justify-between px-3 py-2 h-auto text-sm rounded-md my-1",
                          isActive(item.href) && "bg-primary text-primary-foreground"
                        )}
                      >
                        <div className="flex items-center">
                          <item.icon className="ml-2 h-4 w-4" />
                          {item.label}
                        </div>
                        {item.badge && (
                          <Badge className={cn("mr-1 text-white", item.badgeColor || "bg-primary")}>
                            {item.badge}
                          </Badge>
                        )}
                      </Button>
                    </Link>
                  );
                }
                
                // إذا كان العنصر مع قائمة فرعية ونحن في الوضع المضغوط
                if (item.items && isCompact) {
                  // عرض قائمة منسدلة للقائمة المضغوطة
                  return (
                    <TooltipProvider key={`compact-group-${index}`} delayDuration={300}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                              "w-full h-9 my-1 relative",
                              item.items.some(subItem => subItem.href && isActive(subItem.href)) && 
                              "text-primary border-r-2 border-primary"
                            )}
                          >
                            <item.icon className="h-4 w-4" />
                            {/* إذا كان هناك شارات عرض مؤشر */}
                            {item.items.some(subItem => subItem.badge) && (
                              <span className="absolute top-0 right-0 text-[0.6rem] font-medium rounded-full w-3.5 h-3.5 flex items-center justify-center bg-blue-500">
                                •
                              </span>
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="left" align="start" className="p-0 w-48">
                          <div className="py-1 px-0">
                            <div className="text-xs font-medium px-2 py-1.5 text-muted-foreground">
                              {item.label}
                            </div>
                            <Separator className="mb-1" />
                            {item.items.map((subItem) => (
                              <Link 
                                key={subItem.href} 
                                href={subItem.href || '#'}
                                className={cn(
                                  "block px-2 py-1.5 text-xs hover:bg-muted",
                                  isActive(subItem.href || '') && "bg-primary/10 text-primary font-medium"
                                )}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center">
                                    <subItem.icon className="ml-1.5 h-3.5 w-3.5" />
                                    {subItem.label}
                                  </div>
                                  {subItem.badge && (
                                    <Badge className={cn("text-white text-[0.6rem] px-1 py-0 h-3.5", subItem.badgeColor || "bg-primary")}>
                                      {subItem.badge}
                                    </Badge>
                                  )}
                                </div>
                              </Link>
                            ))}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  );
                }
                
                // إذا كان العنصر مع قائمة فرعية ونحن في الوضع العادي
                if (item.items && !isCompact) {
                  const groupKey = `group-${index}`;
                  const isExpanded = expandedGroups[groupKey];
                  
                  // التحقق من وجود عنصر نشط في المجموعة
                  const hasActiveChild = item.items.some(subItem => 
                    subItem.href && isActive(subItem.href)
                  );
                  
                  // عدد العناصر التي تحتوي على شارات
                  const badgeCount = item.items.filter(subItem => subItem.badge).length;
                  
                  return (
                    <Collapsible
                      key={groupKey}
                      open={isExpanded}
                      onOpenChange={() => toggleGroup(groupKey)}
                      className="w-full"
                    >
                      <CollapsibleTrigger asChild>
                        <Button
                          variant="ghost"
                          className={cn(
                            "w-full justify-between px-3 py-2 h-auto text-sm rounded-md my-1",
                            hasActiveChild && "bg-primary/10",
                            hasActiveChild && "text-primary font-medium"
                          )}
                        >
                          <div className="flex items-center">
                            <item.icon className="ml-2 h-4.5 w-4.5" />
                            {item.label}
                          </div>
                          <div className="flex items-center">
                            {badgeCount > 0 && (
                              <Badge variant="secondary" className="ml-2">
                                {badgeCount}
                              </Badge>
                            )}
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4 mr-1" />
                            ) : (
                              <ChevronLeft className="h-4 w-4 mr-1" />
                            )}
                          </div>
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="pr-3 py-1 mr-2 border-r dark:border-gray-700 space-y-1">
                          {item.items.map((subItem) => (
                            <Link key={subItem.href} href={subItem.href || '#'}>
                              <Button
                                variant={isActive(subItem.href || '') ? "default" : "ghost"}
                                className={cn(
                                  "w-full justify-between px-3 py-2 h-auto text-sm rounded-md",
                                  isActive(subItem.href || '') && "bg-primary text-primary-foreground",
                                )}
                              >
                                <div className="flex items-center">
                                  <subItem.icon className="ml-2 h-4 w-4" />
                                  {subItem.label}
                                </div>
                                {subItem.badge && (
                                  <Badge className={cn("mr-1 text-white", subItem.badgeColor || "bg-primary")}>
                                    {subItem.badge}
                                  </Badge>
                                )}
                              </Button>
                            </Link>
                          ))}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  );
                }
                
                return null;
              })}

              {/* إذا كانت نتائج البحث فارغة */}
              {navSearchTerm && filteredNavItems.length === 0 && (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  <Search className="h-5 w-5 mx-auto mb-2 opacity-40" />
                  لا توجد نتائج لـ "{navSearchTerm}"
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
        
        {/* ذيل السايدبار */}
        {!isCompact ? (
          <div className="p-4 border-t dark:border-gray-800 mt-auto">
            <div className="flex flex-col space-y-3">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center">
                  <Award className="h-4 w-4 text-primary ml-2" />
                  <span className="text-xs text-muted-foreground">حالة النظام: نشط</span>
                </div>
                <Badge variant="outline" className="text-xs px-1.5 py-0 h-5">بريميوم</Badge>
              </div>
              
              <Button 
                variant="destructive" 
                className="w-full justify-start"
                onClick={handleLogout}
              >
                <LogOut className="ml-2 h-4 w-4" />
                تسجيل الخروج
              </Button>
            </div>
          </div>
        ) : (
          <div className="py-3 border-t dark:border-gray-800 mt-auto">
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="destructive" 
                    size="icon"
                    className="w-full h-9 rounded-md mx-auto mb-1"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p className="text-xs">تسجيل الخروج</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;
