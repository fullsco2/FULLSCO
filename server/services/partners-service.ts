import { PartnersRepository } from '../repositories/partners-repository';
import { Partner, InsertPartner } from '@shared/schema';

export class PartnersService {
  private repository: PartnersRepository;

  constructor() {
    this.repository = new PartnersRepository();
  }

  /**
   * الحصول على شريك بواسطة المعرف
   * @param id معرف الشريك
   * @returns بيانات الشريك أو null إذا لم يكن موجوداً
   */
  async getPartnerById(id: number): Promise<Partner | null> {
    try {
      return await this.repository.getPartnerById(id);
    } catch (error) {
      console.error('Error in PartnersService.getPartnerById:', error);
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
      return await this.repository.createPartner(data);
    } catch (error) {
      console.error('Error in PartnersService.createPartner:', error);
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
      return await this.repository.updatePartner(id, data);
    } catch (error) {
      console.error('Error in PartnersService.updatePartner:', error);
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
      return await this.repository.deletePartner(id);
    } catch (error) {
      console.error('Error in PartnersService.deletePartner:', error);
      throw error;
    }
  }

  /**
   * الحصول على قائمة الشركاء
   * @param isActive فلتر النشاط (اختياري)
   * @returns قائمة الشركاء
   */
  async listPartners(isActive?: boolean): Promise<Partner[]> {
    try {
      const filters = isActive !== undefined ? { isActive } : undefined;
      return await this.repository.listPartners(filters);
    } catch (error) {
      console.error('Error in PartnersService.listPartners:', error);
      throw error;
    }
  }
}