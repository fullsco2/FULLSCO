import { z } from "zod";
import { PagesRepository } from "../repositories/pages-repository";
import { Page, InsertPage, insertPageSchema } from "@shared/schema";

/**
 * خدمة الصفحات
 * تحتوي على المنطق الأساسي للتعامل مع الصفحات
 */
export class PagesService {
  private repository: PagesRepository;

  constructor() {
    this.repository = new PagesRepository();
  }

  /**
   * الحصول على صفحة بواسطة المعرف
   */
  async getPage(id: number): Promise<Page | undefined> {
    return this.repository.getPage(id);
  }

  /**
   * الحصول على صفحة بواسطة slug
   */
  async getPageBySlug(slug: string): Promise<Page | undefined> {
    return this.repository.getPageBySlug(slug);
  }

  /**
   * إنشاء صفحة جديدة
   */
  async createPage(pageData: z.infer<typeof insertPageSchema>): Promise<Page> {
    // التحقق من صحة البيانات
    const validatedData = insertPageSchema.parse(pageData);
    
    // إنشاء الصفحة
    return this.repository.createPage(validatedData);
  }

  /**
   * تحديث صفحة موجودة
   */
  async updatePage(id: number, pageData: Partial<z.infer<typeof insertPageSchema>>): Promise<Page | undefined> {
    // التحقق من وجود الصفحة
    const existingPage = await this.repository.getPage(id);
    if (!existingPage) {
      throw new Error(`Page with ID ${id} not found`);
    }

    // التحقق من صحة البيانات
    const validatedData = insertPageSchema.partial().parse(pageData);
    
    // تحديث الصفحة
    return this.repository.updatePage(id, validatedData);
  }

  /**
   * حذف صفحة
   */
  async deletePage(id: number): Promise<boolean> {
    // التحقق من وجود الصفحة
    const existingPage = await this.repository.getPage(id);
    if (!existingPage) {
      throw new Error(`Page with ID ${id} not found`);
    }

    // حذف الصفحة
    return this.repository.deletePage(id);
  }

  /**
   * الحصول على قائمة بكل الصفحات
   * يمكن تحديد تصفية حسب حالة النشر والظهور في الهيدر والفوتر
   */
  async listPages(filters?: { isPublished?: boolean, showInHeader?: boolean, showInFooter?: boolean }): Promise<Page[]> {
    return this.repository.listPages(filters);
  }
}