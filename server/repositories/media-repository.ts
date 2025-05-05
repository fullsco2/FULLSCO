import { db } from "../db";
import { eq, like, and, sql } from "drizzle-orm";
import { MediaFile, InsertMediaFile, mediaFiles } from "@shared/schema";

/**
 * فئة مستودع الوسائط
 * تتعامل مع عمليات قاعدة البيانات المتعلقة بملفات الوسائط
 */
export class MediaRepository {
  /**
   * الحصول على ملف وسائط بواسطة المعرف
   */
  async getMediaFile(id: number): Promise<MediaFile | undefined> {
    try {
      const result = await db.query.mediaFiles.findFirst({
        where: eq(mediaFiles.id, id)
      });
      return result;
    } catch (error) {
      console.error("Error in getMediaFile:", error);
      throw error;
    }
  }

  /**
   * إنشاء ملف وسائط جديد
   */
  async createMediaFile(mediaFile: InsertMediaFile): Promise<MediaFile> {
    try {
      const [result] = await db.insert(mediaFiles)
        .values(mediaFile)
        .returning();
      return result;
    } catch (error) {
      console.error("Error in createMediaFile:", error);
      throw error;
    }
  }

  /**
   * تحديث ملف وسائط موجود
   */
  async updateMediaFile(id: number, mediaFile: Partial<InsertMediaFile>): Promise<MediaFile | undefined> {
    try {
      const [result] = await db.update(mediaFiles)
        .set(mediaFile)
        .where(eq(mediaFiles.id, id))
        .returning();
      return result;
    } catch (error) {
      console.error("Error in updateMediaFile:", error);
      throw error;
    }
  }

  /**
   * حذف ملف وسائط
   */
  async deleteMediaFile(id: number): Promise<boolean> {
    try {
      const result = await db.delete(mediaFiles)
        .where(eq(mediaFiles.id, id));
      
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      console.error("Error in deleteMediaFile:", error);
      throw error;
    }
  }

  /**
   * حذف مجموعة من ملفات الوسائط
   */
  async bulkDeleteMediaFiles(ids: number[]): Promise<boolean> {
    try {
      if (!ids.length) {
        return false;
      }

      const result = await db.delete(mediaFiles)
        .where(sql`${mediaFiles.id} IN (${ids.join(',')})`);
      
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      console.error("Error in bulkDeleteMediaFiles:", error);
      throw error;
    }
  }

  /**
   * الحصول على قائمة بكل ملفات الوسائط
   * يمكن تصفية النتائج حسب نوع الملف
   */
  async listMediaFiles(filters?: { mimeType?: string }): Promise<MediaFile[]> {
    try {
      let query = db.select().from(mediaFiles);
      
      // إضافة الفلاتر إذا وجدت
      if (filters && filters.mimeType) {
        query = query.where(like(mediaFiles.mimeType, `${filters.mimeType}%`));
      }
      
      // ترتيب الملفات حسب تاريخ الإنشاء (الأحدث أولاً)
      query = query.orderBy(sql`${mediaFiles.createdAt} DESC`);
      
      const result = await query;
      return result;
    } catch (error) {
      console.error("Error in listMediaFiles:", error);
      throw error;
    }
  }
}