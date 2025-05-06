import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat("ar-SA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("ar-SA", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
  }).format(date);
}

export function formatNumber(num: number) {
  return new Intl.NumberFormat("ar-SA").format(num);
}

// حساب مدة القراءة لمحتوى نصي
export function calculateReadingTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  const readingTime = Math.ceil(words / 200); // متوسط 200 كلمة في الدقيقة
  return readingTime <= 1 ? 1 : readingTime;
}

// تحويل الرابط الكامل إلى مسار نسبي
export function toRelativeUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.pathname + urlObj.search + urlObj.hash;
  } catch (e) {
    // إذا لم يكن رابط كامل، افترض أنه مسار نسبي بالفعل
    return url;
  }
}

// تحقق من صحة البريد الإلكتروني
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// تقصير النص مع إضافة "..."
export function truncateText(text: string, maxLength: number = 100): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}
