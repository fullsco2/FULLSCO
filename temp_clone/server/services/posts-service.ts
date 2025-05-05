import { PostsRepository } from "../repositories/posts-repository";
import { InsertPost, Post } from "../../shared/schema";

export class PostsService {
  private repository: PostsRepository;

  constructor() {
    this.repository = new PostsRepository();
  }

  /**
   * الحصول على مقال بواسطة المعرف
   */
  async getPostById(id: number): Promise<Post | undefined> {
    return this.repository.getPostById(id);
  }

  /**
   * الحصول على مقال بواسطة الاسم المستعار
   */
  async getPostBySlug(slug: string): Promise<Post | undefined> {
    return this.repository.getPostBySlug(slug);
  }

  /**
   * إنشاء مقال جديد
   */
  async createPost(postData: InsertPost): Promise<Post> {
    // يمكن إضافة منطق أعمال إضافي قبل إنشاء المقال
    // مثل التحقق من صحة البيانات، أو إنشاء اسم مستعار تلقائي إذا لم يتم توفيره

    // إنشاء اسم مستعار إذا لم يتم توفيره
    if (!postData.slug && postData.title) {
      postData.slug = this.generateSlug(postData.title);
    }

    return this.repository.createPost(postData);
  }

  /**
   * تحديث مقال
   */
  async updatePost(id: number, postData: Partial<InsertPost>): Promise<Post | undefined> {
    // التحقق من وجود المقال
    const existingPost = await this.repository.getPostById(id);
    if (!existingPost) {
      return undefined;
    }

    // إنشاء اسم مستعار إذا تم تغيير العنوان ولم يتم توفير اسم مستعار جديد
    if (postData.title && !postData.slug) {
      postData.slug = this.generateSlug(postData.title);
    }

    return this.repository.updatePost(id, postData);
  }

  /**
   * حذف مقال
   */
  async deletePost(id: number): Promise<boolean> {
    // التحقق من وجود المقال
    const existingPost = await this.repository.getPostById(id);
    if (!existingPost) {
      return false;
    }

    return this.repository.deletePost(id);
  }

  /**
   * الحصول على قائمة المقالات
   * يمكن تصفية النتائج حسب المعايير المقدمة
   */
  async listPosts(filters?: {
    authorId?: number,
    isFeatured?: boolean,
    status?: string,
    tag?: string
  }): Promise<Post[]> {
    return this.repository.listPosts(filters);
  }

  /**
   * زيادة عدد مشاهدات مقال
   */
  async incrementPostViews(id: number): Promise<boolean> {
    return this.repository.incrementPostViews(id);
  }

  /**
   * الحصول على مقالات حسب علامة
   */
  async getPostsByTag(tagSlug: string): Promise<Post[]> {
    return this.repository.getPostsByTagSlug(tagSlug);
  }

  /**
   * إضافة علامة إلى مقال
   */
  async addTagToPost(postId: number, tagId: number): Promise<any> {
    return this.repository.addTagToPost(postId, tagId);
  }

  /**
   * إزالة علامة من مقال
   */
  async removeTagFromPost(postId: number, tagId: number): Promise<boolean> {
    return this.repository.removeTagFromPost(postId, tagId);
  }

  /**
   * الحصول على علامات مقال
   */
  async getPostTags(postId: number): Promise<any[]> {
    return this.repository.getPostTags(postId);
  }

  /**
   * توليد اسم مستعار من العنوان
   * وظيفة مساعدة لإنشاء اسم مستعار من عنوان المقال
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