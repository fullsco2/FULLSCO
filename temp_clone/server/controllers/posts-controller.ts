import { Request, Response } from 'express';
import { PostsService } from '../services/posts-service';
import { insertPostSchema } from '../../shared/schema';
import { handleException, successResponse } from '../utils/api-helper';
import { z } from 'zod';

export class PostsController {
  private service: PostsService;

  constructor() {
    this.service = new PostsService();
  }

  /**
   * الحصول على قائمة المقالات
   */
  async listPosts(req: Request, res: Response): Promise<void> {
    try {
      const { authorId, isFeatured, status, tag } = req.query;
      
      // تحويل المعلمات إلى الأنواع المناسبة
      const filters: any = {};
      
      if (authorId !== undefined && !isNaN(Number(authorId))) {
        filters.authorId = Number(authorId);
      }
      
      if (isFeatured !== undefined) {
        filters.isFeatured = isFeatured === 'true';
      }
      
      if (status !== undefined) {
        filters.status = status;
      }
      
      if (tag !== undefined) {
        filters.tag = tag;
      }
      
      const posts = await this.service.listPosts(filters);
      res.json(successResponse(posts));
    } catch (error) {
      handleException(res, error);
    }
  }

  /**
   * الحصول على مقال بواسطة المعرف
   */
  async getPostById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: 'معرف المقال يجب أن يكون رقماً'
        });
        return;
      }

      const post = await this.service.getPostById(id);
      if (!post) {
        res.status(404).json({
          success: false,
          message: 'المقال غير موجود'
        });
        return;
      }

      res.json(successResponse(post));
    } catch (error) {
      handleException(res, error);
    }
  }

  /**
   * الحصول على مقال بواسطة الاسم المستعار
   */
  async getPostBySlug(req: Request, res: Response): Promise<void> {
    try {
      const { slug } = req.params;
      if (!slug) {
        res.status(400).json({
          success: false,
          message: 'الاسم المستعار للمقال مطلوب'
        });
        return;
      }

      const post = await this.service.getPostBySlug(slug);
      if (!post) {
        res.status(404).json({
          success: false,
          message: 'المقال غير موجود'
        });
        return;
      }

      // زيادة عدد المشاهدات تلقائياً
      this.service.incrementPostViews(post.id);

      res.json(successResponse(post));
    } catch (error) {
      handleException(res, error);
    }
  }

  /**
   * إنشاء مقال جديد
   */
  async createPost(req: Request, res: Response): Promise<void> {
    try {
      // التحقق من صحة البيانات باستخدام Zod
      const validatedData = insertPostSchema.parse(req.body);
      const newPost = await this.service.createPost(validatedData);
      
      res.status(201).json(successResponse(
        newPost,
        'تم إنشاء المقال بنجاح'
      ));
    } catch (error) {
      // التعامل مع أخطاء التحقق من صحة البيانات
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          message: 'خطأ في بيانات المقال',
          errors: error.errors
        });
        return;
      }
      
      handleException(res, error);
    }
  }

  /**
   * تحديث مقال موجود
   */
  async updatePost(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: 'معرف المقال يجب أن يكون رقماً'
        });
        return;
      }

      // تحقق من وجود المقال
      const existingPost = await this.service.getPostById(id);
      if (!existingPost) {
        res.status(404).json({
          success: false,
          message: 'المقال غير موجود'
        });
        return;
      }

      // التحقق من صحة البيانات باستخدام Zod
      const validatedData = insertPostSchema.partial().parse(req.body);
      const updatedPost = await this.service.updatePost(id, validatedData);
      
      res.json(successResponse(
        updatedPost,
        'تم تحديث المقال بنجاح'
      ));
    } catch (error) {
      // التعامل مع أخطاء التحقق من صحة البيانات
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          message: 'خطأ في بيانات المقال',
          errors: error.errors
        });
        return;
      }
      
      handleException(res, error);
    }
  }

  /**
   * حذف مقال
   */
  async deletePost(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: 'معرف المقال يجب أن يكون رقماً'
        });
        return;
      }

      // تحقق من وجود المقال
      const existingPost = await this.service.getPostById(id);
      if (!existingPost) {
        res.status(404).json({
          success: false,
          message: 'المقال غير موجود'
        });
        return;
      }

      // حذف المقال
      const result = await this.service.deletePost(id);
      
      if (result) {
        res.json({
          success: true,
          message: 'تم حذف المقال بنجاح'
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'فشل في حذف المقال'
        });
      }
    } catch (error) {
      handleException(res, error);
    }
  }

  /**
   * الحصول على علامات مقال
   */
  async getPostTags(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: 'معرف المقال يجب أن يكون رقماً'
        });
        return;
      }

      // تحقق من وجود المقال
      const existingPost = await this.service.getPostById(id);
      if (!existingPost) {
        res.status(404).json({
          success: false,
          message: 'المقال غير موجود'
        });
        return;
      }

      const tags = await this.service.getPostTags(id);
      res.json(successResponse(tags));
    } catch (error) {
      handleException(res, error);
    }
  }

  /**
   * إضافة علامة إلى مقال
   */
  async addTagToPost(req: Request, res: Response): Promise<void> {
    try {
      const postId = parseInt(req.params.postId, 10);
      const tagId = parseInt(req.params.tagId, 10);
      
      if (isNaN(postId) || isNaN(tagId)) {
        res.status(400).json({
          success: false,
          message: 'معرف المقال والعلامة يجب أن يكونا أرقاماً'
        });
        return;
      }

      // تحقق من وجود المقال
      const existingPost = await this.service.getPostById(postId);
      if (!existingPost) {
        res.status(404).json({
          success: false,
          message: 'المقال غير موجود'
        });
        return;
      }

      const result = await this.service.addTagToPost(postId, tagId);
      res.json(successResponse(result, 'تمت إضافة العلامة بنجاح'));
    } catch (error) {
      handleException(res, error);
    }
  }

  /**
   * إزالة علامة من مقال
   */
  async removeTagFromPost(req: Request, res: Response): Promise<void> {
    try {
      const postId = parseInt(req.params.postId, 10);
      const tagId = parseInt(req.params.tagId, 10);
      
      if (isNaN(postId) || isNaN(tagId)) {
        res.status(400).json({
          success: false,
          message: 'معرف المقال والعلامة يجب أن يكونا أرقاماً'
        });
        return;
      }

      // تحقق من وجود المقال
      const existingPost = await this.service.getPostById(postId);
      if (!existingPost) {
        res.status(404).json({
          success: false,
          message: 'المقال غير موجود'
        });
        return;
      }

      const result = await this.service.removeTagFromPost(postId, tagId);
      
      if (result) {
        res.json({
          success: true,
          message: 'تمت إزالة العلامة بنجاح'
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'العلاقة بين المقال والعلامة غير موجودة'
        });
      }
    } catch (error) {
      handleException(res, error);
    }
  }

  /**
   * الحصول على المقالات حسب علامة
   */
  async getPostsByTag(req: Request, res: Response): Promise<void> {
    try {
      const { slug } = req.params;
      if (!slug) {
        res.status(400).json({
          success: false,
          message: 'الاسم المستعار للعلامة مطلوب'
        });
        return;
      }

      const posts = await this.service.getPostsByTag(slug);
      res.json(successResponse(posts));
    } catch (error) {
      handleException(res, error);
    }
  }
}