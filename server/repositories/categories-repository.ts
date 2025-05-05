import { eq } from "drizzle-orm";
import { db } from "../db";
import { categories, Category, InsertCategory } from "@shared/schema";

/**
 * مستودع للتعامل مع عمليات الفئات في قاعدة البيانات
 */
export class CategoriesRepository {
  /**
   * الحصول على قائمة بجميع الفئات
   * @returns قائمة الفئات
   */
  async listCategories(): Promise<Category[]> {
    try {
      return await db.query.categories.findMany({
        orderBy: (categories, { asc }) => [asc(categories.name)]
      });
    } catch (error) {
      console.error("Error in listCategories repository:", error);
      throw error;
    }
  }

  /**
   * الحصول على فئة محددة بواسطة المعرف
   * @param id معرف الفئة
   * @returns بيانات الفئة أو null في حالة عدم وجودها
   */
  async getCategoryById(id: number): Promise<Category | null> {
    try {
      const result = await db.query.categories.findFirst({
        where: eq(categories.id, id)
      });
      return result || null;
    } catch (error) {
      console.error(`Error in getCategoryById repository for id ${id}:`, error);
      throw error;
    }
  }

  /**
   * الحصول على فئة بواسطة الاسم المستعار (slug)
   * @param slug الاسم المستعار للفئة
   * @returns بيانات الفئة أو null في حالة عدم وجودها
   */
  async getCategoryBySlug(slug: string): Promise<Category | null> {
    try {
      const result = await db.query.categories.findFirst({
        where: eq(categories.slug, slug)
      });
      return result || null;
    } catch (error) {
      console.error(`Error in getCategoryBySlug repository for slug ${slug}:`, error);
      throw error;
    }
  }

  /**
   * إنشاء فئة جديدة
   * @param data بيانات الفئة
   * @returns الفئة التي تم إنشاؤها
   */
  async createCategory(data: InsertCategory): Promise<Category> {
    try {
      const [category] = await db.insert(categories).values(data).returning();
      return category;
    } catch (error) {
      console.error("Error in createCategory repository:", error);
      throw error;
    }
  }

  /**
   * تحديث فئة موجودة
   * @param id معرف الفئة
   * @param data البيانات المراد تحديثها
   * @returns الفئة بعد التحديث أو null في حالة عدم وجودها
   */
  async updateCategory(id: number, data: Partial<InsertCategory>): Promise<Category | null> {
    try {
      const [category] = await db.update(categories)
        .set(data)
        .where(eq(categories.id, id))
        .returning();
      return category || null;
    } catch (error) {
      console.error(`Error in updateCategory repository for id ${id}:`, error);
      throw error;
    }
  }

  /**
   * حذف فئة
   * @param id معرف الفئة
   * @returns true إذا تم الحذف بنجاح، false إذا لم يتم العثور على الفئة
   */
  async deleteCategory(id: number): Promise<boolean> {
    try {
      const result = await db.delete(categories)
        .where(eq(categories.id, id))
        .returning({ id: categories.id });
      return result.length > 0;
    } catch (error) {
      console.error(`Error in deleteCategory repository for id ${id}:`, error);
      throw error;
    }
  }
}