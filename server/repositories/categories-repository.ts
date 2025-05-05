import { db } from '../../db/index';
import { 
  categories,
  type Category, 
  type InsertCategory 
} from '@shared/schema';
import { eq } from 'drizzle-orm';

/**
 * مستودع البيانات للتعامل مع الفئات في قاعدة البيانات
 */
export class CategoriesRepository {
  /**
   * الحصول على قائمة بجميع الفئات
   * @returns قائمة الفئات
   */
  async findAll(): Promise<Category[]> {
    try {
      return await db.query.categories.findMany({
        orderBy: categories.name
      });
    } catch (error) {
      console.error("Error in findAll categories repository method:", error);
      throw error;
    }
  }

  /**
   * الحصول على فئة محددة بواسطة المعرف
   * @param id معرف الفئة
   * @returns بيانات الفئة أو undefined في حالة عدم وجودها
   */
  async findById(id: number): Promise<Category | undefined> {
    try {
      return await db.query.categories.findFirst({
        where: eq(categories.id, id)
      });
    } catch (error) {
      console.error(`Error in findById categories repository method for id ${id}:`, error);
      throw error;
    }
  }

  /**
   * الحصول على فئة بواسطة الاسم المستعار (slug)
   * @param slug الاسم المستعار للفئة
   * @returns بيانات الفئة أو undefined في حالة عدم وجودها
   */
  async findBySlug(slug: string): Promise<Category | undefined> {
    try {
      return await db.query.categories.findFirst({
        where: eq(categories.slug, slug)
      });
    } catch (error) {
      console.error(`Error in findBySlug categories repository method for slug ${slug}:`, error);
      throw error;
    }
  }

  /**
   * إنشاء فئة جديدة
   * @param data بيانات الفئة الجديدة
   * @returns الفئة التي تم إنشاؤها
   */
  async create(data: InsertCategory): Promise<Category> {
    try {
      const result = await db.insert(categories).values(data).returning();
      return result[0];
    } catch (error) {
      console.error("Error in create categories repository method:", error);
      throw error;
    }
  }

  /**
   * تحديث فئة موجودة
   * @param id معرف الفئة
   * @param data البيانات المراد تحديثها
   * @returns الفئة بعد التحديث أو undefined في حالة عدم وجودها
   */
  async update(id: number, data: Partial<InsertCategory>): Promise<Category | undefined> {
    try {
      // التحقق من وجود الفئة قبل التحديث
      const existing = await this.findById(id);
      if (!existing) {
        return undefined;
      }

      const result = await db.update(categories)
        .set(data)
        .where(eq(categories.id, id))
        .returning();
      
      return result[0];
    } catch (error) {
      console.error(`Error in update categories repository method for id ${id}:`, error);
      throw error;
    }
  }

  /**
   * حذف فئة
   * @param id معرف الفئة
   * @returns true إذا تم الحذف بنجاح، false إذا لم يتم العثور على الفئة
   */
  async delete(id: number): Promise<boolean> {
    try {
      // التحقق من وجود الفئة قبل الحذف
      const existing = await this.findById(id);
      if (!existing) {
        return false;
      }

      await db.delete(categories).where(eq(categories.id, id));
      return true;
    } catch (error) {
      console.error(`Error in delete categories repository method for id ${id}:`, error);
      throw error;
    }
  }
}