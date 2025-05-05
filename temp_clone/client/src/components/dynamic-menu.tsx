import { Link } from "wouter";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useMenuStructure, type MenuItem } from "@/hooks/use-menu";
import { usePages } from "@/hooks/use-pages";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DynamicMenuProps {
  location: 'header' | 'footer' | 'sidebar' | 'mobile';
  className?: string;
  itemClassName?: string;
  activeItemClassName?: string;
  dropdownClassName?: string;
  dropdownItemClassName?: string;
  parentIcon?: boolean;
  onItemClick?: () => void;
  renderItem?: (item: MenuItem, isActive: boolean) => React.ReactNode;
}

export const DynamicMenu = ({
  location,
  className = "",
  itemClassName = "",
  activeItemClassName = "",
  dropdownClassName = "",
  dropdownItemClassName = "",
  parentIcon = true,
  onItemClick,
  renderItem
}: DynamicMenuProps) => {
  // جميع hooks في بداية المكون وبترتيب ثابت
  const { data: menuStructure, isLoading, error } = useMenuStructure(location);
  const [location1] = useLocation();
  const { data: pages } = usePages();

  // تعريف نوع لهيكل القائمة مع index signature للسماح بالوصول الديناميكي
  type IndexableMenuStructure = {
    id: number;
    name: string;
    slug: string;
    location: string;
    items: MenuItem[];
    [key: string]: any; // إضافة index signature للسماح بالوصول باستخدام السلاسل النصية
  };

  // قيم افتراضية للبيانات لتجنب مشكلة التبديل بين uncontrolled/controlled
  const defaultMenuStructure: IndexableMenuStructure = {
    id: 0,
    name: location,
    slug: location,
    location: location,
    items: []
  };
  
  const isActive = (path: string) => location1 === path;
  const isPageActive = (slug: string) => {
    // فحص ما إذا كان المسار الحالي يطابق خيارات مختلفة من روابط الصفحة
    return (
      location1 === `/${slug}` || // المسار المباشر مثل /about-us
      location1 === `/page/${slug}` || // مسار /page/:slug 
      location1 === `/pages/${slug}` // مسار /pages/:id للتوافق مع الإصدارات القديمة
    );
  };
  
  // دالة للحصول على سلاق الصفحة من المعرف بشكل ديناميكي
  const getPageSlug = (pageId: number | null): string | null => {
    if (!pageId) return null;
    if (!pages || !Array.isArray(pages)) return null;
    
    // البحث عن الصفحة بواسطة المعرف
    const page = pages.find(p => p.id === pageId);
    if (page && page.slug) {
      return page.slug;
    }
    
    // إذا لم يتم العثور على سلاق مطابق، نعود إلى المسار بالمعرف
    return null;
  };
  
  if (isLoading) {
    return <div className={className}>جاري التحميل...</div>;
  }
  
  if (error) {
    console.error(`Error loading menu for ${location}:`, error);
    return <div className={className}>تعذر تحميل القائمة: خطأ في الاتصال</div>;
  }
  
  // استخدام هيكل القائمة إذا كان موجودًا، أو الهيكل الافتراضي إذا لم يكن موجودًا
  const finalMenuStructure = menuStructure || defaultMenuStructure;
  
  // سجل من أجل التشخيص
  if (!menuStructure) {
    console.error(`Menu structure for ${location} is undefined`);
  }

  // طباعة هيكل القائمة للتشخيص
  console.log(`Menu structure for ${location}:`, finalMenuStructure);
  
  // تحويل هيكل القائمة إلى النوع القابل للفهرسة لمنع أخطاء TypeScript
  const indexableMenu = finalMenuStructure as IndexableMenuStructure;

  // تحقق من هيكل البيانات المستلمة
  // هناك احتمالان: إما أن تكون العناصر مباشرة في indexableMenu.items
  // أو أن تكون تحت اسم الموقع مثل indexableMenu.header.items أو indexableMenu.footer.items
  let menuItems: MenuItem[] = [];
  
  if (indexableMenu.items) {
    menuItems = indexableMenu.items;
  } else if (indexableMenu[location] && indexableMenu[location].items) {
    menuItems = indexableMenu[location].items;
  } else {
    // محاولة البحث عن العناصر في المفاتيح الأخرى
    const firstKey = Object.keys(indexableMenu).find(key => 
      indexableMenu[key] && typeof indexableMenu[key] === 'object' && indexableMenu[key].items);
    
    if (firstKey && indexableMenu[firstKey].items) {
      console.log(`Found items in the key: ${firstKey}`);
      menuItems = indexableMenu[firstKey].items;
    } else {
      console.error(`Menu items for ${location} are undefined`);
      // نعود إلى مصفوفة فارغة بدلاً من إظهار خطأ للمستخدم
      menuItems = [];
    }
  }
  
  // تأكد من أن menuItems مصفوفة
  if (!Array.isArray(menuItems)) {
    console.error(`Menu items for ${location} is not an array:`, menuItems);
    // إذا كانت البيانات غير صالحة، نستخدم مصفوفة فارغة
    menuItems = [];
  }
  
  // تصفية العناصر لعرض العناصر المناسبة للموقع الحالي
  let filteredItems = menuItems;
  // تعيين معرفات القوائم المناسبة لكل موقع (header=1, footer=2, sidebar=3, mobile=4)
  const locationMenuId = location === 'header' ? 1 : 
                         location === 'footer' ? 2 : 
                         location === 'sidebar' ? 3 : 
                         location === 'mobile' ? 4 : null;
  
  if (locationMenuId) {
    // تصفية العناصر لتظهر فقط تلك التي تنتمي إلى القائمة المناسبة
    filteredItems = menuItems.filter(item => Number(item.menuId) === locationMenuId);
    console.log(`Filtered items for menu ID ${locationMenuId} (${location}): found ${filteredItems.length} items`);
  }

  const getItemUrl = (item: MenuItem): string => {
    switch (item.type) {
      case 'page':
        // استخدام رابط الصفحة الثابتة مع السلاق بدلاً من المعرف
        const slug = getPageSlug(item.pageId);
        // استخدام السلاق مباشرة إذا كان موجوداً، وإلا استخدام المسار بالمعرف
        return slug ? `/${slug}` : `/pages/${item.pageId}`;
      case 'category':
        // تأكد من تضمين معرف الفئة في معلمات URL
        return item.categoryId ? `/scholarships?category=${item.categoryId}` : '/scholarships';
      case 'level':
        // تأكد من تضمين معرف المستوى في معلمات URL
        return item.levelId ? `/scholarships?level=${item.levelId}` : '/scholarships';
      case 'country':
        // تأكد من تضمين معرف الدولة في معلمات URL
        return item.countryId ? `/scholarships?country=${item.countryId}` : '/scholarships';
      case 'scholarship':
        return `/scholarship/${item.scholarshipId}`;
      case 'post':
        return `/article/${item.postId}`;
      case 'link':
        return item.url || '#';
      default:
        return '#';
    }
  };

  const renderMenuItem = (item: MenuItem) => {
    const itemUrl = getItemUrl(item);
    const hasChildren = item.children && item.children.length > 0;
    
    // تحديد ما إذا كان العنصر نشطاً بناءً على المسار الحالي
    let isItemActive = isActive(itemUrl); // التحقق من التطابق المباشر
    
    // إذا كان نوع العنصر صفحة، نتحقق من السلاق
    if (item.type === 'page' && !isItemActive) {
      const slug = getPageSlug(item.pageId);
      if (slug) {
        isItemActive = isPageActive(slug);
      }
    }
    
    const activeClass = isItemActive ? activeItemClassName : '';
    
    if (hasChildren) {
      return (
        <DropdownMenu key={item.id}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className={`${itemClassName} ${activeClass} flex items-center gap-1`}>
              {item.title}
              {parentIcon && <ChevronDown className="h-4 w-4 opacity-70" />}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className={dropdownClassName}>
            {item.children?.map((child) => (
              <DropdownMenuItem key={child.id} asChild className={dropdownItemClassName}>
                {child.type === 'link' && child.targetBlank ? (
                  <a href={child.url || '#'} target="_blank" rel="noopener noreferrer" className="w-full">
                    {child.title}
                  </a>
                ) : (
                  <Link href={getItemUrl(child)} onClick={onItemClick}>
                    <div className="flex w-full items-center">
                      {child.title}
                    </div>
                  </Link>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }
    
    // للروابط الخارجية
    if (item.type === 'link' && item.targetBlank) {
      return (
        <a 
          key={item.id}
          href={item.url || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className={`${itemClassName} ${activeClass}`}
          onClick={onItemClick}
        >
          {item.title}
        </a>
      );
    }
    
    // للروابط الداخلية
    return (
      <Link key={item.id} href={itemUrl} onClick={onItemClick}>
        <span className={`${itemClassName} ${activeClass}`}>
          {renderItem ? renderItem(item, isItemActive) : item.title}
        </span>
      </Link>
    );
  };

  return (
    <div className={className}>
      {filteredItems.map(renderMenuItem)}
    </div>
  );
};

function useLocation() {
  return useState(window.location.pathname);
}