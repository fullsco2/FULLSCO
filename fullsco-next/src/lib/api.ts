/**
 * ملف واجهة برمجة التطبيقات
 * يحتوي على دوال للتعامل مع API الحالي
 */

// تهيئة الرابط الأساسي لواجهة برمجة التطبيقات
const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

// التعامل مع الطلبات
async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  try {
    const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      // تعطيل revalidate للتعامل مع الخادم الحالي
      // سيتم تفعيله لاحقاً عند الانتقال الكامل لـ Next.js
      // next: { revalidate: 60 },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API fetch error for ${endpoint}:`, error);
    throw error;
  }
}

// جلب إعدادات الموقع
export async function getSiteSettings() {
  try {
    const response = await fetchAPI('/api/site-settings');
    return response.success ? response.data : response;
  } catch (error) {
    console.error('Error fetching site settings:', error);
    return null;
  }
}

// جلب إحصائيات الموقع
export async function getStatistics() {
  try {
    const response = await fetchAPI('/api/statistics');
    return response.success ? response.data : response;
  } catch (error) {
    console.error('Error fetching statistics:', error);
    return [];
  }
}

// جلب الشركاء
export async function getPartners() {
  try {
    const response = await fetchAPI('/api/partners');
    return response.success ? response.data : response;
  } catch (error) {
    console.error('Error fetching partners:', error);
    return [];
  }
}

// جلب المنح المميزة
export async function getFeaturedScholarships(limit = 6) {
  try {
    const response = await fetchAPI(`/api/scholarships/featured?limit=${limit}`);
    return Array.isArray(response) ? response : response.data || [];
  } catch (error) {
    console.error('Error fetching featured scholarships:', error);
    return [];
  }
}

// جلب المقالات الأخيرة
export async function getLatestArticles(limit = 3) {
  try {
    const response = await fetchAPI(`/api/posts?limit=${limit}`);
    return response.success ? response.data : Array.isArray(response) ? response : [];
  } catch (error) {
    console.error('Error fetching latest articles:', error);
    return [];
  }
}

// جلب قصص النجاح
export async function getSuccessStories(limit = 3) {
  try {
    const response = await fetchAPI(`/api/success-stories?limit=${limit}`);
    return response.success ? response.data : Array.isArray(response) ? response : [];
  } catch (error) {
    console.error('Error fetching success stories:', error);
    return [];
  }
}

// جلب فئات المنح
export async function getCategories() {
  try {
    const response = await fetchAPI('/api/categories');
    return Array.isArray(response) ? response : response.data || [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

// جلب الدول
export async function getCountries() {
  try {
    const response = await fetchAPI('/api/countries');
    return Array.isArray(response) ? response : response.data || [];
  } catch (error) {
    console.error('Error fetching countries:', error);
    return [];
  }
}

// جلب المستويات الدراسية
export async function getLevels() {
  try {
    const response = await fetchAPI('/api/levels');
    return Array.isArray(response) ? response : response.data || [];
  } catch (error) {
    console.error('Error fetching levels:', error);
    return [];
  }
}

// جلب هيكل القوائم
export async function getMenuStructure(location: 'header' | 'footer' | 'sidebar' | 'mobile') {
  try {
    const response = await fetchAPI(`/api/menu-structure/${location}`);
    return response.success ? response.data : response;
  } catch (error) {
    console.error(`Error fetching menu structure for ${location}:`, error);
    return null;
  }
}

// جلب صفحة بواسطة المعرف
export async function getPageById(id: number) {
  try {
    const response = await fetchAPI(`/api/pages/${id}`);
    return response.success ? response.data : response;
  } catch (error) {
    console.error(`Error fetching page with ID ${id}:`, error);
    return null;
  }
}

// جلب صفحة بواسطة الاسم المستعار
export async function getPageBySlug(slug: string) {
  try {
    const response = await fetchAPI(`/api/pages/by-slug/${slug}`);
    return response.success ? response.data : response;
  } catch (error) {
    console.error(`Error fetching page with slug ${slug}:`, error);
    return null;
  }
}
