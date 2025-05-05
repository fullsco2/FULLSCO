import { db } from "../db";
import { eq, sql } from "drizzle-orm";
import { Page, InsertPage, pages } from "@shared/schema";

/**
 * فئة مستودع الصفحات
 * تتعامل مع عمليات قاعدة البيانات المتعلقة بالصفحات
 */
export class PagesRepository {
  /**
   * الحصول على صفحة بواسطة المعرف
   */
  async getPage(id: number): Promise<Page | undefined> {
    try {
      const result = await db.query.pages.findFirst({
        where: eq(pages.id, id)
      });
      return result;
    } catch (error) {
      console.error("Error in getPage:", error);
      throw error;
    }
  }

  /**
   * الحصول على صفحة بواسطة slug
   */
  async getPageBySlug(slug: string): Promise<Page | undefined> {
    try {
      const result = await db.query.pages.findFirst({
        where: eq(pages.slug, slug)
      });
      return result;
    } catch (error) {
      console.error("Error in getPageBySlug:", error);
      throw error;
    }
  }

  /**
   * إنشاء صفحة جديدة
   */
  async createPage(page: InsertPage): Promise<Page> {
    try {
      const [result] = await db.insert(pages)
        .values(page)
        .returning();
      return result;
    } catch (error) {
      console.error("Error in createPage:", error);
      throw error;
    }
  }

  /**
   * تحديث صفحة موجودة
   */
  async updatePage(id: number, page: Partial<InsertPage>): Promise<Page | undefined> {
    try {
      const [result] = await db.update(pages)
        .set(page)
        .where(eq(pages.id, id))
        .returning();
      return result;
    } catch (error) {
      console.error("Error in updatePage:", error);
      throw error;
    }
  }

  /**
   * حذف صفحة
   */
  async deletePage(id: number): Promise<boolean> {
    try {
      const result = await db.delete(pages)
        .where(eq(pages.id, id));
      
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      console.error("Error in deletePage:", error);
      throw error;
    }
  }

  /**
   * الحصول على قائمة بكل الصفحات
   * يمكن تحديد تصفية حسب حالة النشر والظهور في الهيدر والفوتر
   */
  async listPages(filters?: { isPublished?: boolean, showInHeader?: boolean, showInFooter?: boolean }): Promise<Page[]> {
    try {
      let query = db.select().from(pages);
      
      // إضافة الفلاتر إذا وجدت
      if (filters) {
        if (filters.isPublished !== undefined) {
          query = query.where(eq(pages.isPublished, filters.isPublished));
        }
        
        if (filters.showInHeader !== undefined) {
          query = query.where(eq(pages.showInHeader, filters.showInHeader));
        }
        
        if (filters.showInFooter !== undefined) {
          query = query.where(eq(pages.showInFooter, filters.showInFooter));
        }
      }
      
      // ترتيب الصفحات حسب تاريخ التحديث
      query = query.orderBy(sql`${pages.updatedAt} DESC`);
      
      const result = await query;
      return result;
    } catch (error) {
      console.error("Error in listPages:", error);
      throw error;
    }
  }
}