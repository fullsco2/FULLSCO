import { db } from "../../db";
import { successStories, InsertSuccessStory, SuccessStory } from "../../shared/schema";
import { eq, desc } from "drizzle-orm";

export class SuccessStoriesRepository {
  /**
   * الحصول على قصة نجاح بواسطة المعرف
   */
  async getSuccessStoryById(id: number): Promise<SuccessStory | undefined> {
    try {
      const result = await db.query.successStories.findFirst({
        where: eq(successStories.id, id)
      });
      return result;
    } catch (error) {
      console.error("Error in getSuccessStoryById:", error);
      throw error;
    }
  }

  /**
   * الحصول على قصة نجاح بواسطة الاسم المستعار
   */
  async getSuccessStoryBySlug(slug: string): Promise<SuccessStory | undefined> {
    try {
      const result = await db.query.successStories.findFirst({
        where: eq(successStories.slug, slug)
      });
      return result;
    } catch (error) {
      console.error("Error in getSuccessStoryBySlug:", error);
      throw error;
    }
  }

  /**
   * إنشاء قصة نجاح جديدة
   */
  async createSuccessStory(storyData: InsertSuccessStory): Promise<SuccessStory> {
    try {
      const [result] = await db.insert(successStories)
        .values(storyData)
        .returning();
      return result;
    } catch (error) {
      console.error("Error in createSuccessStory:", error);
      throw error;
    }
  }

  /**
   * تحديث قصة نجاح
   */
  async updateSuccessStory(id: number, storyData: Partial<InsertSuccessStory>): Promise<SuccessStory | undefined> {
    try {
      const [result] = await db.update(successStories)
        .set(storyData)
        .where(eq(successStories.id, id))
        .returning();
      return result;
    } catch (error) {
      console.error("Error in updateSuccessStory:", error);
      throw error;
    }
  }

  /**
   * حذف قصة نجاح
   */
  async deleteSuccessStory(id: number): Promise<boolean> {
    try {
      const result = await db.delete(successStories)
        .where(eq(successStories.id, id));
      
      return result.rowCount! > 0;
    } catch (error) {
      console.error("Error in deleteSuccessStory:", error);
      throw error;
    }
  }

  /**
   * الحصول على قائمة قصص النجاح
   */
  async listSuccessStories(filters?: {
    isFeatured?: boolean,
    limit?: number
  }): Promise<SuccessStory[]> {
    try {
      let query = db.select().from(successStories);
      
      // إضافة شرط إذا كان هناك فلتر للقصص المميزة
      if (filters?.isFeatured !== undefined) {
        query = query.where(eq(successStories.isFeatured, filters.isFeatured));
      }
      
      // ترتيب النتائج حسب تاريخ الإنشاء، الأحدث أولاً
      query = query.orderBy(desc(successStories.createdAt));
      
      // تحديد عدد النتائج إذا كان هناك
      if (filters?.limit !== undefined && filters.limit > 0) {
        query = query.limit(filters.limit);
      }
      
      return await query;
    } catch (error) {
      console.error("Error in listSuccessStories:", error);
      throw error;
    }
  }
}