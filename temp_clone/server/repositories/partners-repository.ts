import { db } from '../../db';
import { partners } from '../../shared/schema';
import { InsertPartner, Partner } from '../../shared/schema';
import { eq } from 'drizzle-orm';

export class PartnersRepository {
  /**
   * الحصول على شريك بواسطة المعرف
   * @param id معرف الشريك
   * @returns بيانات الشريك أو null إذا لم يكن موجوداً
   */
  async getPartnerById(id: number): Promise<Partner | null> {
    try {
      const result = await db.select().from(partners).where(eq(partners.id, id)).limit(1);
      return result[0] || null;
    } catch (error) {
      console.error('Error in PartnersRepository.getPartnerById:', error);
      throw error;
    }
  }

  /**
   * إنشاء شريك جديد
   * @param data بيانات الشريك
   * @returns الشريك الذي تم إنشاؤه
   */
  async createPartner(data: InsertPartner): Promise<Partner> {
    try {
      const result = await db.insert(partners).values(data).returning();
      return result[0];
    } catch (error) {
      console.error('Error in PartnersRepository.createPartner:', error);
      throw error;
    }
  }

  /**
   * تحديث شريك موجود
   * @param id معرف الشريك
   * @param data البيانات المراد تحديثها
   * @returns الشريك المحدث أو null إذا لم يتم العثور عليه
   */
  async updatePartner(id: number, data: Partial<InsertPartner>): Promise<Partner | null> {
    try {
      const result = await db
        .update(partners)
        .set({
          ...data,
          updatedAt: new Date()
        })
        .where(eq(partners.id, id))
        .returning();
      
      return result[0] || null;
    } catch (error) {
      console.error('Error in PartnersRepository.updatePartner:', error);
      throw error;
    }
  }

  /**
   * حذف شريك
   * @param id معرف الشريك
   * @returns هل تمت عملية الحذف بنجاح
   */
  async deletePartner(id: number): Promise<boolean> {
    try {
      const result = await db.delete(partners).where(eq(partners.id, id)).returning();
      return result.length > 0;
    } catch (error) {
      console.error('Error in PartnersRepository.deletePartner:', error);
      throw error;
    }
  }

  /**
   * الحصول على قائمة الشركاء
   * @param filters فلاتر البحث (اختياري)
   * @returns قائمة الشركاء
   */
  async listPartners(filters?: { isActive?: boolean }): Promise<Partner[]> {
    try {
      let query = db.select().from(partners);
      
      if (filters?.isActive !== undefined) {
        query = query.where(eq(partners.isActive, filters.isActive));
      }
      
      return await query;
    } catch (error) {
      console.error('Error in PartnersRepository.listPartners:', error);
      throw error;
    }
  }
}