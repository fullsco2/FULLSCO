import { CategoriesRepository } from '../repositories/categories-repository';
import { type Category, type InsertCategory } from '@shared/schema';

/**
 * خدمة للتعامل مع منطق الأعمال الخاص بالفئات
 */
export class CategoriesService {
  private repository: CategoriesRepository;

  /**
   * إنشاء كائن جديد من خدمة الفئات
   */
  constructor() {
    this.repository = new CategoriesRepository();
  }

  /**
   * الحصول على قائمة بجميع الفئات
   * @returns قائمة الفئات
   */
  async listCategories(): Promise<Category[]> {
    return await this.repository.findAll();
  }

  /**
   * الحصول على فئة محددة بواسطة المعرف
   * @param id معرف الفئة
   * @returns بيانات الفئة أو null في حالة عدم وجودها
   */
  async getCategoryById(id: number): Promise<Category | null> {
    const category = await this.repository.findById(id);
    return category || null;
  }

  /**
   * الحصول على فئة بواسطة الاسم المستعار (slug)
   * @param slug الاسم المستعار للفئة
   * @returns بيانات الفئة أو null في حالة عدم وجودها
   */
  async getCategoryBySlug(slug: string): Promise<Category | null> {
    const category = await this.repository.findBySlug(slug);
    return category || null;
  }

  /**
   * إنشاء فئة جديدة
   * @param data بيانات الفئة
   * @returns الفئة التي تم إنشاؤها
   */
  async createCategory(data: InsertCategory): Promise<Category> {
    // التحقق من عدم وجود فئة بنفس الاسم المستعار
    if (data.slug) {
      const existing = await this.repository.findBySlug(data.slug);
      if (existing) {
        throw new Error(`Category with slug '${data.slug}' already exists`);
      }
    }
    
    return await this.repository.create(data);
  }

  /**
   * تحديث فئة موجودة
   * @param id معرف الفئة
   * @param data البيانات المراد تحديثها
   * @returns الفئة بعد التحديث أو null في حالة عدم وجودها
   */
  async updateCategory(id: number, data: Partial<InsertCategory>): Promise<Category | null> {
    // التحقق من عدم وجود فئة أخرى بنفس الاسم المستعار
    if (data.slug) {
      const existingWithSlug = await this.repository.findBySlug(data.slug);
      if (existingWithSlug && existingWithSlug.id !== id) {
        throw new Error(`Another category with slug '${data.slug}' already exists`);
      }
    }
    
    const category = await this.repository.update(id, data);
    return category || null;
  }

  /**
   * حذف فئة
   * @param id معرف الفئة
   * @returns true إذا تم الحذف بنجاح، false إذا لم يتم العثور على الفئة
   */
  async deleteCategory(id: number): Promise<boolean> {
    return await this.repository.delete(id);
  }
}