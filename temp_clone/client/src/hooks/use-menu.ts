import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";

export interface MenuItem {
  id: number;
  menuId: number;
  parentId: number | null;
  title: string;
  type: 'page' | 'category' | 'level' | 'country' | 'link' | 'scholarship' | 'post';
  url: string | null;
  targetBlank: boolean;
  pageId: number | null;
  categoryId: number | null;
  levelId: number | null;
  countryId: number | null;
  scholarshipId: number | null;
  postId: number | null;
  order: number;
  createdAt: string;
  updatedAt: string;
  children?: MenuItem[];
}

export interface Menu {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  location: 'header' | 'footer' | 'sidebar' | 'mobile';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MenuStructure {
  id: number;
  name: string;
  slug: string;
  location: 'header' | 'footer' | 'sidebar' | 'mobile';
  items?: MenuItem[];
  // هيكل مرن للتعامل مع الاستجابات المتنوعة من API
  [key: string]: any;
}

export function useMenus() {
  return useQuery({
    queryKey: ['/api/menus'],
    refetchOnWindowFocus: false
  });
}

export function useMenu(id: number) {
  return useQuery({
    queryKey: ['/api/menus', id],
    enabled: !!id,
    refetchOnWindowFocus: false
  });
}

export function useMenuByLocation(location: 'header' | 'footer' | 'sidebar' | 'mobile') {
  return useQuery({
    queryKey: ['/api/menus/location', location],
    refetchOnWindowFocus: false
  });
}

// استجابة API لهيكل القائمة
interface MenuStructureResponse {
  success: boolean;
  data: {
    menu: {
      id: number;
      name: string;
      slug: string;
      location: 'header' | 'footer' | 'sidebar' | 'mobile';
      isActive: boolean;
      description: string | null;
      createdAt: string;
      updatedAt: string;
    };
    items: MenuItem[];
  };
  message?: string;
}

export function useMenuStructure(location: 'header' | 'footer' | 'sidebar' | 'mobile') {
  // استخدام تخزين مؤقت لمنع إعادة التحميل غير الضرورية
  return useQuery<MenuStructure>({
    queryKey: ['/api/menu-structure', location],
    queryFn: async () => {
      // استخدام نقطة نهاية محددة لكل موقع
      console.log(`Fetching menu structure for ${location}`);
      
      // استخدام النقطة النهائية المخصصة لكل موقع حيث location هي معلمة مسار
      const response = await fetch(`/api/menu-structure/${location}`);
      if (!response.ok) {
        throw new Error(`Error fetching menu structure for ${location}`);
      }
      
      const responseData = await response.json() as MenuStructureResponse;
      console.log(`Menu structure for ${location}:`, responseData);
      
      // التحقق من وجود البيانات
      if (responseData.success && responseData.data) {
        // تحويل هيكل البيانات إلى الشكل المتوقع
        const menuStructure: MenuStructure = {
          id: responseData.data.menu.id,
          name: responseData.data.menu.name,
          slug: responseData.data.menu.slug,
          location: responseData.data.menu.location,
          items: responseData.data.items
        };
        
        return menuStructure;
      } else {
        throw new Error(`Invalid response data for menu structure ${location}`);
      }
    },
    refetchOnWindowFocus: false, // تجنب إعادة التحميل عند التركيز
    staleTime: 300000, // البيانات تبقى صالحة لمدة 5 دقائق (300000 مللي ثانية)
    retry: 3, // محاولة إعادة الطلب 3 مرات في حالة الفشل
    // إزالة إعادة التحميل الدوري لمنع مشكلة التبديل بين uncontrolled/controlled
  });
}

export function useMenuItems(menuId: number, parentId?: number | null) {
  let queryUrl = `/api/menu-items/menu/${menuId}`;
  if (parentId !== undefined) {
    queryUrl += `?parentId=${parentId === null ? 'null' : parentId}`;
  }
  
  return useQuery<MenuItem[]>({
    queryKey: ['/api/menu-items/menu', menuId, parentId],
    queryFn: () => fetch(queryUrl).then(res => res.json()),
    enabled: !!menuId,
    refetchOnWindowFocus: false
  });
}

export function useMenuItemsWithDetails(menuId: number) {
  const queryUrl = `/api/menu-items-with-details/menu/${menuId}`;
  
  return useQuery({
    queryKey: [queryUrl],
    enabled: !!menuId,
    refetchOnWindowFocus: false
  });
}