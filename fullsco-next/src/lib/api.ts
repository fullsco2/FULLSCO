import { getSession } from 'next-auth/react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export async function apiRequest(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  data?: any,
  requireAuth: boolean = true
) {
  try {
    const url = `${API_URL}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // إضافة توكن المصادقة إذا كان مطلوباً
    if (requireAuth) {
      const session = await getSession();
      if (session?.accessToken) {
        headers['Authorization'] = `Bearer ${session.accessToken}`;
      }
    }
    
    const options: RequestInit = {
      method,
      headers,
      credentials: 'include', // للحفاظ على ملفات تعريف الارتباط عبر الطلبات
    };
    
    if (data && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(data);
    }
    
    const response = await fetch(url, options);
    const responseData = await response.json();
    
    if (!response.ok) {
      throw new Error(responseData.message || 'حدث خطأ أثناء معالجة الطلب');
    }
    
    return responseData;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
}

// وظائف مساعدة لاستدعاءات API الشائعة
export const api = {
  get: (endpoint: string, requireAuth = true) => 
    apiRequest(endpoint, 'GET', undefined, requireAuth),
    
  post: (endpoint: string, data: any, requireAuth = true) => 
    apiRequest(endpoint, 'POST', data, requireAuth),
    
  put: (endpoint: string, data: any, requireAuth = true) => 
    apiRequest(endpoint, 'PUT', data, requireAuth),
    
  delete: (endpoint: string, requireAuth = true) => 
    apiRequest(endpoint, 'DELETE', undefined, requireAuth),
};
