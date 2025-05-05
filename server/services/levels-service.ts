import { LevelsRepository } from '../repositories/levels-repository';
import { type Level, type InsertLevel } from '@shared/schema';

/**
 * خدمة للتعامل مع منطق الأعمال الخاص بالمستويات
 */
export class LevelsService {
  private repository: LevelsRepository;

  /**
   * إنشاء كائن جديد من خدمة المستويات
   */
  constructor() {
    this.repository = new LevelsRepository();
  }

  /**
   * الحصول على قائمة بجميع المستويات
   * @returns قائمة المستويات
   */
  async listLevels(): Promise<Level[]> {
    return await this.repository.findAll();
  }

  /**
   * الحصول على مستوى محدد بواسطة المعرف
   * @param id معرف المستوى
   * @returns بيانات المستوى أو null في حالة عدم وجوده
   */
  async getLevelById(id: number): Promise<Level | null> {
    const level = await this.repository.findById(id);
    return level || null;
  }

  /**
   * الحصول على مستوى بواسطة الاسم المستعار (slug)
   * @param slug الاسم المستعار للمستوى
   * @returns بيانات المستوى أو null في حالة عدم وجوده
   */
  async getLevelBySlug(slug: string): Promise<Level | null> {
    const level = await this.repository.findBySlug(slug);
    return level || null;
  }

  /**
   * إنشاء مستوى جديد
   * @param data بيانات المستوى
   * @returns المستوى الذي تم إنشاؤه
   */
  async createLevel(data: InsertLevel): Promise<Level> {
    // التحقق من عدم وجود مستوى بنفس الاسم المستعار
    if (data.slug) {
      const existing = await this.repository.findBySlug(data.slug);
      if (existing) {
        throw new Error(`Level with slug '${data.slug}' already exists`);
      }
    }
    
    return await this.repository.create(data);
  }

  /**
   * تحديث مستوى موجود
   * @param id معرف المستوى
   * @param data البيانات المراد تحديثها
   * @returns المستوى بعد التحديث أو null في حالة عدم وجوده
   */
  async updateLevel(id: number, data: Partial<InsertLevel>): Promise<Level | null> {
    // التحقق من عدم وجود مستوى آخر بنفس الاسم المستعار
    if (data.slug) {
      const existingWithSlug = await this.repository.findBySlug(data.slug);
      if (existingWithSlug && existingWithSlug.id !== id) {
        throw new Error(`Another level with slug '${data.slug}' already exists`);
      }
    }
    
    const level = await this.repository.update(id, data);
    return level || null;
  }

  /**
   * حذف مستوى
   * @param id معرف المستوى
   * @returns true إذا تم الحذف بنجاح، false إذا لم يتم العثور على المستوى
   */
  async deleteLevel(id: number): Promise<boolean> {
    return await this.repository.delete(id);
  }
}