import { useQuery } from '@tanstack/react-query';

export interface Page {
  id: number;
  title: string;
  slug: string;
  content: string;
  metaTitle: string | null;
  metaDescription: string | null;
  isPublished: boolean;
  showInFooter: boolean;
  showInHeader: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UsePagesOptions {
  showInHeader?: boolean;
  showInFooter?: boolean;
  enabled?: boolean;
}

// استجابة API للصفحات
interface PagesResponse {
  success: boolean;
  data: Page[];
  message?: string;
}

export function usePages(options: UsePagesOptions = {}) {
  const { showInHeader, showInFooter, enabled = true } = options;
  
  // بناء عنوان URL مع معلمات الإستعلام
  let apiUrl = '/api/pages';
  const params = new URLSearchParams();
  
  if (showInHeader !== undefined) {
    params.append('header', showInHeader.toString());
  }
  
  if (showInFooter !== undefined) {
    params.append('footer', showInFooter.toString());
  }
  
  const queryString = params.toString();
  if (queryString) {
    apiUrl += `?${queryString}`;
  }
  
  return useQuery<Page[]>({
    queryKey: [apiUrl],
    queryFn: async () => {
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'فشل في جلب الصفحات');
      }
      
      const responseData = await response.json() as PagesResponse;
      
      // التأكد من أن البيانات الراجعة صحيحة ومصفوفة
      if (responseData.success && Array.isArray(responseData.data)) {
        return responseData.data;
      } else {
        // إذا لم تكن البيانات في الشكل المتوقع، نرجع مصفوفة فارغة
        console.error('استجابة API للصفحات ليست بالشكل المتوقع:', responseData);
        return [];
      }
    },
    enabled
  });
}

// استجابة API للصفحة الواحدة
interface PageResponse {
  success: boolean;
  data: Page;
  message?: string;
}

export function usePage(slug: string, enabled = true) {
  return useQuery<Page>({
    queryKey: [`/api/pages/slug/${slug}`],
    queryFn: async () => {
      const response = await fetch(`/api/pages/slug/${slug}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('الصفحة غير موجودة');
        }
        
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'فشل في جلب الصفحة');
      }
      
      const responseData = await response.json() as PageResponse;
      
      // التحقق من وجود البيانات
      if (responseData.success && responseData.data) {
        return responseData.data;
      } else {
        throw new Error('بيانات الصفحة غير موجودة أو غير صالحة');
      }
    },
    enabled: enabled && !!slug
  });
}

// جلب الصفحة بواسطة المعرف (ID)
export function usePageById(id: number | string | null | undefined, enabled = true) {
  const pageId = id ? Number(id) : null;
  
  return useQuery<Page>({
    queryKey: [`/api/pages/${pageId}`],
    queryFn: async () => {
      const response = await fetch(`/api/pages/${pageId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('الصفحة غير موجودة');
        }
        
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'فشل في جلب الصفحة');
      }
      
      const responseData = await response.json() as PageResponse;
      
      // التحقق من وجود البيانات
      if (responseData.success && responseData.data) {
        return responseData.data;
      } else {
        throw new Error('بيانات الصفحة غير موجودة أو غير صالحة');
      }
    },
    enabled: enabled && pageId !== null && !isNaN(pageId)
  });
}