import { db } from "../../db";
import { posts, InsertPost, Post, postTags, tags } from "../../shared/schema";
import { eq, and, desc, or } from "drizzle-orm";

export class PostsRepository {
  /**
   * الحصول على مقال بواسطة المعرف
   */
  async getPostById(id: number): Promise<Post | undefined> {
    try {
      const result = await db.query.posts.findFirst({
        where: eq(posts.id, id)
      });
      return result;
    } catch (error) {
      console.error("Error in getPostById:", error);
      throw error;
    }
  }

  /**
   * الحصول على مقال بواسطة الاسم المستعار
   */
  async getPostBySlug(slug: string): Promise<Post | undefined> {
    try {
      const result = await db.query.posts.findFirst({
        where: eq(posts.slug, slug)
      });
      return result;
    } catch (error) {
      console.error("Error in getPostBySlug:", error);
      throw error;
    }
  }

  /**
   * إنشاء مقال جديد
   */
  async createPost(postData: InsertPost): Promise<Post> {
    try {
      const [result] = await db.insert(posts)
        .values(postData)
        .returning();
      return result;
    } catch (error) {
      console.error("Error in createPost:", error);
      throw error;
    }
  }

  /**
   * تحديث مقال
   */
  async updatePost(id: number, postData: Partial<InsertPost>): Promise<Post | undefined> {
    try {
      const [result] = await db.update(posts)
        .set(postData)
        .where(eq(posts.id, id))
        .returning();
      return result;
    } catch (error) {
      console.error("Error in updatePost:", error);
      throw error;
    }
  }

  /**
   * حذف مقال
   */
  async deletePost(id: number): Promise<boolean> {
    try {
      // حذف العلاقات مع العلامات أولاً
      await db.delete(postTags)
        .where(eq(postTags.postId, id));
      
      // ثم حذف المقال نفسه
      const result = await db.delete(posts)
        .where(eq(posts.id, id));
      
      return result.rowCount > 0;
    } catch (error) {
      console.error("Error in deletePost:", error);
      throw error;
    }
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
    try {
      const conditions = [];
      
      if (filters?.authorId !== undefined) {
        conditions.push(eq(posts.authorId, filters.authorId));
      }
      
      if (filters?.isFeatured !== undefined) {
        conditions.push(eq(posts.isFeatured, filters.isFeatured));
      }
      
      if (filters?.status !== undefined) {
        conditions.push(eq(posts.status, filters.status));
      }
      
      let query = db.select().from(posts);
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
      
      // ترتيب النتائج حسب تاريخ الإنشاء، الأحدث أولاً
      query = query.orderBy(desc(posts.createdAt));
      
      const result = await query;
      
      // إذا كان هناك تصفية حسب العلامة، نقوم بمعالجتها بشكل منفصل
      if (filters?.tag) {
        const tagPosts = await this.getPostsByTagSlug(filters.tag);
        const tagPostIds = tagPosts.map(post => post.id);
        return result.filter(post => tagPostIds.includes(post.id));
      }
      
      return result;
    } catch (error) {
      console.error("Error in listPosts:", error);
      throw error;
    }
  }

  /**
   * زيادة عدد مشاهدات مقال
   */
  async incrementPostViews(id: number): Promise<boolean> {
    try {
      const post = await this.getPostById(id);
      if (!post) {
        return false;
      }

      const currentViews = post.views || 0;
      const [updated] = await db.update(posts)
        .set({ views: currentViews + 1 })
        .where(eq(posts.id, id))
        .returning();
      
      return !!updated;
    } catch (error) {
      console.error("Error in incrementPostViews:", error);
      throw error;
    }
  }

  /**
   * الحصول على مقالات حسب علامة
   */
  async getPostsByTagSlug(tagSlug: string): Promise<Post[]> {
    try {
      // أولاً، نحصل على العلامة بواسطة الاسم المستعار
      const tag = await db.query.tags.findFirst({
        where: eq(tags.slug, tagSlug)
      });
      
      if (!tag) {
        return [];
      }
      
      // ثم نحصل على جميع علاقات المقالات بهذه العلامة
      const relationships = await db.select()
        .from(postTags)
        .where(eq(postTags.tagId, tag.id));
      
      // أخيراً، نحصل على المقالات المرتبطة
      const postIds = relationships.map(rel => rel.postId);
      
      if (postIds.length === 0) {
        return [];
      }
      
      const result = await db.select()
        .from(posts)
        .where(
          postIds.map(id => eq(posts.id, id)).reduce((a, b) => or(a, b))
        )
        .orderBy(desc(posts.createdAt));
      
      return result;
    } catch (error) {
      console.error("Error in getPostsByTagSlug:", error);
      throw error;
    }
  }

  /**
   * إضافة علامة إلى مقال
   */
  async addTagToPost(postId: number, tagId: number): Promise<any> {
    try {
      // التحقق من عدم وجود العلاقة مسبقاً
      const existing = await db.select()
        .from(postTags)
        .where(
          and(
            eq(postTags.postId, postId),
            eq(postTags.tagId, tagId)
          )
        );
      
      if (existing.length > 0) {
        return existing[0];
      }
      
      // إنشاء العلاقة
      const [result] = await db.insert(postTags)
        .values({ postId, tagId })
        .returning();
      
      return result;
    } catch (error) {
      console.error("Error in addTagToPost:", error);
      throw error;
    }
  }

  /**
   * إزالة علامة من مقال
   */
  async removeTagFromPost(postId: number, tagId: number): Promise<boolean> {
    try {
      const result = await db.delete(postTags)
        .where(
          and(
            eq(postTags.postId, postId),
            eq(postTags.tagId, tagId)
          )
        );
      
      return result.rowCount > 0;
    } catch (error) {
      console.error("Error in removeTagFromPost:", error);
      throw error;
    }
  }

  /**
   * الحصول على علامات مقال
   */
  async getPostTags(postId: number): Promise<any[]> {
    try {
      const relationships = await db.select()
        .from(postTags)
        .where(eq(postTags.postId, postId));
      
      if (relationships.length === 0) {
        return [];
      }
      
      const tagIds = relationships.map(rel => rel.tagId);
      
      const result = await db.select()
        .from(tags)
        .where(
          tagIds.map(id => eq(tags.id, id)).reduce((a, b) => or(a, b))
        );
      
      return result;
    } catch (error) {
      console.error("Error in getPostTags:", error);
      throw error;
    }
  }
}