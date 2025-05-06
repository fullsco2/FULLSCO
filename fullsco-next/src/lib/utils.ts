import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * دمج أنماط Tailwind CSS وترتيبها بشكل صحيح
 * تجمع بين clsx وtwMerge لتحقيق نتائج أفضل
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * تنسيق التاريخ بتنسيق محلي
 * يعمل مع التواريخ كـ string أو Date objects
 * @param date التاريخ المراد تنسيقه
 * @param locale اللغة المستخدمة للتنسيق (الافتراضي: ar-EG للعربية)
 */
export function formatDate(date: string | Date, locale = 'ar-EG') {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  try {
    return dateObj.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
}

/**
 * تنسيق الرقم بتنسيق محلي
 * @param num الرقم المراد تنسيقه
 * @param locale اللغة المستخدمة للتنسيق (الافتراضي: ar-EG للعربية)
 */
export function formatNumber(num: number, locale = 'ar-EG') {
  try {
    return new Intl.NumberFormat(locale).format(num);
  } catch (error) {
    console.error('Error formatting number:', error);
    return num.toString();
  }
}

/**
 * تقصير النص إلى طول محدد
 * @param text النص المراد تقصيره 
 * @param maxLength الحد الأقصى للطول
 * @param suffix اللاحقة المضافة في حال تم تقصير النص (افتراضي: "...")
 */
export function truncateText(text: string, maxLength: number, suffix = '...') {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + suffix;
}

/**
 * تحويل نص HTML إلى نص عادي
 * مفيد لإزالة الوسوم من المحتوى الغني
 * @param html نص HTML المراد تحويله إلى نص عادي
 */
export function htmlToPlainText(html: string) {
  if (!html) return '';
  return html.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ');
}

/**
 * إنشاء عنوان URL متوافق
 * @param text النص المراد تحويله إلى slug
 */
export function slugify(text: string) {
  if (!text) return '';
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}
