import { db } from '../../db/index';
import { 
  levels,
  type Level, 
  type InsertLevel 
} from '@shared/schema';
import { eq } from 'drizzle-orm';

/**
 * مستودع البيانات للتعامل مع المستويات في قاعدة البيانات
 */
export class LevelsRepository {
  /**
   * الحصول على قائمة بجميع المستويات
   * @returns قائمة المستويات
   */
  async findAll(): Promise<Level[]> {
    try {
      return await db.query.levels.findMany({
        orderBy: levels.name
      });
    } catch (error) {
      console.error("Error in findAll levels repository method:", error);
      throw error;
    }
  }

  /**
   * الحصول على مستوى محدد بواسطة المعرف
   * @param id معرف المستوى
   * @returns بيانات المستوى أو undefined في حالة عدم وجوده
   */
  async findById(id: number): Promise<Level | undefined> {
    try {
      return await db.query.levels.findFirst({
        where: eq(levels.id, id)
      });
    } catch (error) {
      console.error(`Error in findById levels repository method for id ${id}:`, error);
      throw error;
    }
  }

  /**
   * الحصول على مستوى بواسطة الاسم المستعار (slug)
   * @param slug الاسم المستعار للمستوى
   * @returns بيانات المستوى أو undefined في حالة عدم وجوده
   */
  async findBySlug(slug: string): Promise<Level | undefined> {
    try {
      return await db.query.levels.findFirst({
        where: eq(levels.slug, slug)
      });
    } catch (error) {
      console.error(`Error in findBySlug levels repository method for slug ${slug}:`, error);
      throw error;
    }
  }

  /**
   * إنشاء مستوى جديد
   * @param data بيانات المستوى الجديد
   * @returns المستوى الذي تم إنشاؤه
   */
  async create(data: InsertLevel): Promise<Level> {
    try {
      const result = await db.insert(levels).values(data).returning();
      return result[0];
    } catch (error) {
      console.error("Error in create levels repository method:", error);
      throw error;
    }
  }

  /**
   * تحديث مستوى موجود
   * @param id معرف المستوى
   * @param data البيانات المراد تحديثها
   * @returns المستوى بعد التحديث أو undefined في حالة عدم وجوده
   */
  async update(id: number, data: Partial<InsertLevel>): Promise<Level | undefined> {
    try {
      // التحقق من وجود المستوى قبل التحديث
      const existing = await this.findById(id);
      if (!existing) {
        return undefined;
      }

      const result = await db.update(levels)
        .set(data)
        .where(eq(levels.id, id))
        .returning();
      
      return result[0];
    } catch (error) {
      console.error(`Error in update levels repository method for id ${id}:`, error);
      throw error;
    }
  }

  /**
   * حذف مستوى
   * @param id معرف المستوى
   * @returns true إذا تم الحذف بنجاح، false إذا لم يتم العثور على المستوى
   */
  async delete(id: number): Promise<boolean> {
    try {
      // التحقق من وجود المستوى قبل الحذف
      const existing = await this.findById(id);
      if (!existing) {
        return false;
      }

      await db.delete(levels).where(eq(levels.id, id));
      return true;
    } catch (error) {
      console.error(`Error in delete levels repository method for id ${id}:`, error);
      throw error;
    }
  }
}