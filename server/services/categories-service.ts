import { Category, InsertCategory } from "@shared/schema";
import { CategoriesRepository } from "../repositories/categories-repository";

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
    try {
      return await this.repository.listCategories();
    } catch (error) {
      console.error("Error in listCategories service:", error);
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
      // التحقق من صحة المعرف
      if (!id || isNaN(id) || id <= 0) {
        throw new Error("Invalid category ID");
      }

      return await this.repository.getCategoryById(id);
    } catch (error) {
      console.error(`Error in getCategoryById service for id ${id}:`, error);
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
      // التحقق من صحة الاسم المستعار
      if (!slug || slug.trim() === "") {
        throw new Error("Invalid category slug");
      }

      return await this.repository.getCategoryBySlug(slug);
    } catch (error) {
      console.error(`Error in getCategoryBySlug service for slug ${slug}:`, error);
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
      // التحقق من عدم تكرار الاسم المستعار (slug)
      if (data.slug) {
        const existingCategory = await this.repository.getCategoryBySlug(data.slug);
        if (existingCategory) {
          throw new Error(`Category with slug "${data.slug}" already exists`);
        }
      }

      return await this.repository.createCategory(data);
    } catch (error) {
      console.error("Error in createCategory service:", error);
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
      // التحقق من صحة المعرف
      if (!id || isNaN(id) || id <= 0) {
        throw new Error("Invalid category ID");
      }

      // التحقق من وجود الفئة
      const existingCategory = await this.repository.getCategoryById(id);
      if (!existingCategory) {
        return null;
      }

      // التحقق من عدم تكرار الاسم المستعار (slug) إذا تم تغييره
      if (data.slug && data.slug !== existingCategory.slug) {
        const categoryWithSlug = await this.repository.getCategoryBySlug(data.slug);
        if (categoryWithSlug && categoryWithSlug.id !== id) {
          throw new Error(`Category with slug "${data.slug}" already exists`);
        }
      }

      return await this.repository.updateCategory(id, data);
    } catch (error) {
      console.error(`Error in updateCategory service for id ${id}:`, error);
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
      // التحقق من صحة المعرف
      if (!id || isNaN(id) || id <= 0) {
        throw new Error("Invalid category ID");
      }

      // يمكن إضافة منطق إضافي هنا مثل التحقق من عدم وجود عناصر مرتبطة بهذه الفئة قبل حذفها

      return await this.repository.deleteCategory(id);
    } catch (error) {
      console.error(`Error in deleteCategory service for id ${id}:`, error);
      throw error;
    }
  }
}