import { db } from '../../db/index';
import { 
  countries,
  type Country, 
  type InsertCountry 
} from '@shared/schema';
import { eq } from 'drizzle-orm';

/**
 * مستودع البيانات للتعامل مع الدول في قاعدة البيانات
 */
export class CountriesRepository {
  /**
   * الحصول على قائمة بجميع الدول
   * @returns قائمة الدول
   */
  async findAll(): Promise<Country[]> {
    try {
      return await db.query.countries.findMany({
        orderBy: countries.name
      });
    } catch (error) {
      console.error("Error in findAll countries repository method:", error);
      throw error;
    }
  }

  /**
   * الحصول على دولة محددة بواسطة المعرف
   * @param id معرف الدولة
   * @returns بيانات الدولة أو undefined في حالة عدم وجودها
   */
  async findById(id: number): Promise<Country | undefined> {
    try {
      return await db.query.countries.findFirst({
        where: eq(countries.id, id)
      });
    } catch (error) {
      console.error(`Error in findById countries repository method for id ${id}:`, error);
      throw error;
    }
  }

  /**
   * الحصول على دولة بواسطة الاسم المستعار (slug)
   * @param slug الاسم المستعار للدولة
   * @returns بيانات الدولة أو undefined في حالة عدم وجودها
   */
  async findBySlug(slug: string): Promise<Country | undefined> {
    try {
      return await db.query.countries.findFirst({
        where: eq(countries.slug, slug)
      });
    } catch (error) {
      console.error(`Error in findBySlug countries repository method for slug ${slug}:`, error);
      throw error;
    }
  }

  /**
   * إنشاء دولة جديدة
   * @param data بيانات الدولة الجديدة
   * @returns الدولة التي تم إنشاؤها
   */
  async create(data: InsertCountry): Promise<Country> {
    try {
      const result = await db.insert(countries).values(data).returning();
      return result[0];
    } catch (error) {
      console.error("Error in create countries repository method:", error);
      throw error;
    }
  }

  /**
   * تحديث دولة موجودة
   * @param id معرف الدولة
   * @param data البيانات المراد تحديثها
   * @returns الدولة بعد التحديث أو undefined في حالة عدم وجودها
   */
  async update(id: number, data: Partial<InsertCountry>): Promise<Country | undefined> {
    try {
      // التحقق من وجود الدولة قبل التحديث
      const existing = await this.findById(id);
      if (!existing) {
        return undefined;
      }

      const result = await db.update(countries)
        .set(data)
        .where(eq(countries.id, id))
        .returning();
      
      return result[0];
    } catch (error) {
      console.error(`Error in update countries repository method for id ${id}:`, error);
      throw error;
    }
  }

  /**
   * حذف دولة
   * @param id معرف الدولة
   * @returns true إذا تم الحذف بنجاح، false إذا لم يتم العثور على الدولة
   */
  async delete(id: number): Promise<boolean> {
    try {
      // التحقق من وجود الدولة قبل الحذف
      const existing = await this.findById(id);
      if (!existing) {
        return false;
      }

      await db.delete(countries).where(eq(countries.id, id));
      return true;
    } catch (error) {
      console.error(`Error in delete countries repository method for id ${id}:`, error);
      throw error;
    }
  }
}