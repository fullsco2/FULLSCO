/**
 * وظائف مساعدة لتنسيق البيانات في جانب العميل
 */

/**
 * تنسيق التاريخ إلى الصيغة المحلية
 */
export function formatDate(date: Date | string | null | undefined, locale: string = 'ar-EG'): string {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (dateObj instanceof Date && !isNaN(dateObj.getTime())) {
      return dateObj.toLocaleDateString(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
    
    return '';
  } catch {
    return '';
  }
}

/**
 * تنسيق تاريخ مع الوقت
 */
export function formatDateTime(date: Date | string | null | undefined, locale: string = 'ar-EG'): string {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (dateObj instanceof Date && !isNaN(dateObj.getTime())) {
      return dateObj.toLocaleDateString(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    
    return '';
  } catch {
    return '';
  }
}

/**
 * تنسيق الرقم كعملة
 */
export function formatCurrency(amount: number | string | null | undefined, currency: string = 'USD', locale: string = 'ar-EG'): string {
  if (amount === null || amount === undefined) return '';
  
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numericAmount)) return '';
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0
  }).format(numericAmount);
}

/**
 * اختصار النص إلى طول محدد
 */
export function truncateText(text: string | null | undefined, maxLength: number = 100): string {
  if (!text) return '';
  
  if (text.length <= maxLength) return text;
  
  return text.slice(0, maxLength) + '...';
}

/**
 * إزالة HTML من النص
 */
export function stripHtml(html: string | null | undefined): string {
  if (!html) return '';
  
  return html.replace(/<[^>]*>/g, '');
}

/**
 * تحويل النص إلى slug (لاستخدامه في URLs)
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\u0621-\u064A\u0660-\u0669a-z0-9 -]/g, '') // الاحتفاظ بالحروف العربية والإنجليزية والأرقام والمسافات والواصلات
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}