import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * تنسيق التاريخ بشكل مناسب للعرض بالعربية
 */
export function formatDate(dateString: string): string {
  if (!dateString) return "";
  
  const date = new Date(dateString);
  
  try {
    return new Intl.DateTimeFormat('ar', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }).format(date);
  } catch (error) {
    console.error('Error formatting date:', error);
    // تنسيق بديل في حالة حدوث خطأ
    return date.toLocaleDateString('ar');
  }
}
