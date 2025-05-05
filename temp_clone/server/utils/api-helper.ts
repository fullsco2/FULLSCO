import { Response } from 'express';
import { ZodError } from 'zod';

/**
 * نمط استجابة موحد للـ API
 */
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any;
}

/**
 * إنشاء استجابة نجاح موحدة
 * @param data البيانات التي سيتم إرجاعها في الاستجابة
 * @param message رسالة اختيارية للمستخدم
 */
export function successResponse<T>(data: T, message?: string): ApiResponse<T> {
  return {
    success: true,
    message,
    data
  };
}

/**
 * إنشاء استجابة خطأ موحدة
 * @param message رسالة الخطأ
 * @param errors تفاصيل الأخطاء (اختياري)
 */
export function errorResponse(message: string, errors?: any): ApiResponse<null> {
  return {
    success: false,
    message,
    errors
  };
}

/**
 * معالجة الاستثناءات وإرسال استجابة خطأ موحدة
 * @param res كائن الاستجابة
 * @param error الخطأ الذي حدث
 */
export function handleException(res: Response, error: unknown): void {
  console.error('حدث خطأ:', error);
  
  // التعامل مع أخطاء زود (Zod)
  if (error instanceof ZodError) {
    res.status(400).json(errorResponse('خطأ في التحقق من صحة البيانات', error.errors));
    return;
  }
  
  // التعامل مع أخطاء معروفة
  if (error instanceof Error) {
    // حالات الخطأ المختلفة
    if (error.message.includes('الوصول مرفوض') || error.message.includes('غير مصرح')) {
      res.status(403).json(errorResponse(error.message));
      return;
    }
    
    if (error.message.includes('غير موجود') || error.message.includes('لم يتم العثور')) {
      res.status(404).json(errorResponse(error.message));
      return;
    }
    
    // حالة افتراضية للأخطاء المعروفة
    res.status(400).json(errorResponse(error.message));
    return;
  }
  
  // الخطأ غير معروف، إرجاع خطأ عام
  res.status(500).json(errorResponse('حدث خطأ في الخادم'));
}