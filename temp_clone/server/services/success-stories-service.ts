import { SuccessStoriesRepository } from "../repositories/success-stories-repository";
import { InsertSuccessStory, SuccessStory } from "../../shared/schema";

export class SuccessStoriesService {
  private repository: SuccessStoriesRepository;

  constructor() {
    this.repository = new SuccessStoriesRepository();
  }

  /**
   * الحصول على قصة نجاح بواسطة المعرف
   */
  async getSuccessStoryById(id: number): Promise<SuccessStory | undefined> {
    return this.repository.getSuccessStoryById(id);
  }

  /**
   * الحصول على قصة نجاح بواسطة الاسم المستعار
   */
  async getSuccessStoryBySlug(slug: string): Promise<SuccessStory | undefined> {
    return this.repository.getSuccessStoryBySlug(slug);
  }

  /**
   * إنشاء قصة نجاح جديدة
   */
  async createSuccessStory(storyData: InsertSuccessStory): Promise<SuccessStory> {
    // يمكن إضافة منطق أعمال إضافي قبل إنشاء قصة النجاح
    // مثل التحقق من صحة البيانات، أو إنشاء اسم مستعار تلقائي إذا لم يتم توفيره

    // إنشاء اسم مستعار إذا لم يتم توفيره
    if (!storyData.slug && storyData.title) {
      storyData.slug = this.generateSlug(storyData.title);
    }

    return this.repository.createSuccessStory(storyData);
  }

  /**
   * تحديث قصة نجاح
   */
  async updateSuccessStory(id: number, storyData: Partial<InsertSuccessStory>): Promise<SuccessStory | undefined> {
    // التحقق من وجود قصة النجاح
    const existingStory = await this.repository.getSuccessStoryById(id);
    if (!existingStory) {
      return undefined;
    }

    // إنشاء اسم مستعار إذا تم تغيير العنوان ولم يتم توفير اسم مستعار جديد
    if (storyData.title && !storyData.slug) {
      storyData.slug = this.generateSlug(storyData.title);
    }

    return this.repository.updateSuccessStory(id, storyData);
  }

  /**
   * حذف قصة نجاح
   */
  async deleteSuccessStory(id: number): Promise<boolean> {
    // التحقق من وجود قصة النجاح
    const existingStory = await this.repository.getSuccessStoryById(id);
    if (!existingStory) {
      return false;
    }

    return this.repository.deleteSuccessStory(id);
  }

  /**
   * الحصول على قائمة قصص النجاح
   */
  async listSuccessStories(filters?: {
    isFeatured?: boolean,
    limit?: number
  }): Promise<SuccessStory[]> {
    return this.repository.listSuccessStories(filters);
  }

  /**
   * توليد اسم مستعار من العنوان
   * وظيفة مساعدة لإنشاء اسم مستعار من عنوان قصة النجاح
   */
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/\s+/g, '-')       // استبدال المسافات بشرطات
      .replace(/[^\u0621-\u064A\u0660-\u0669a-z0-9-]/g, '') // إزالة الأحرف غير العربية والإنجليزية والأرقام والشرطات
      .replace(/-+/g, '-')        // استبدال الشرطات المتعددة بشرطة واحدة
      .replace(/^-+/, '')         // إزالة الشرطات من بداية النص
      .replace(/-+$/, '');        // إزالة الشرطات من نهاية النص
  }
}