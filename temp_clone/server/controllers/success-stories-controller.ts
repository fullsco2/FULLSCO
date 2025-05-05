import { Request, Response } from 'express';
import { SuccessStoriesService } from '../services/success-stories-service';
import { insertSuccessStorySchema } from '../../shared/schema';
import { handleException, successResponse } from '../utils/api-helper';
import { z } from 'zod';

export class SuccessStoriesController {
  private service: SuccessStoriesService;

  constructor() {
    this.service = new SuccessStoriesService();
  }

  /**
   * الحصول على قائمة قصص النجاح
   */
  async listSuccessStories(req: Request, res: Response): Promise<void> {
    try {
      const { isFeatured, limit } = req.query;
      
      // تحويل المعلمات إلى الأنواع المناسبة
      const filters: any = {};
      
      if (isFeatured !== undefined) {
        filters.isFeatured = isFeatured === 'true';
      }
      
      if (limit !== undefined && !isNaN(Number(limit))) {
        filters.limit = Number(limit);
      }
      
      const stories = await this.service.listSuccessStories(filters);
      res.json(successResponse(stories));
    } catch (error) {
      handleException(res, error);
    }
  }

  /**
   * الحصول على قصة نجاح بواسطة المعرف
   */
  async getSuccessStoryById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: 'معرف قصة النجاح يجب أن يكون رقماً'
        });
        return;
      }

      const story = await this.service.getSuccessStoryById(id);
      if (!story) {
        res.status(404).json({
          success: false,
          message: 'قصة النجاح غير موجودة'
        });
        return;
      }

      res.json(successResponse(story));
    } catch (error) {
      handleException(res, error);
    }
  }

  /**
   * الحصول على قصة نجاح بواسطة الاسم المستعار
   */
  async getSuccessStoryBySlug(req: Request, res: Response): Promise<void> {
    try {
      const { slug } = req.params;
      if (!slug) {
        res.status(400).json({
          success: false,
          message: 'الاسم المستعار لقصة النجاح مطلوب'
        });
        return;
      }

      const story = await this.service.getSuccessStoryBySlug(slug);
      if (!story) {
        res.status(404).json({
          success: false,
          message: 'قصة النجاح غير موجودة'
        });
        return;
      }

      res.json(successResponse(story));
    } catch (error) {
      handleException(res, error);
    }
  }

  /**
   * إنشاء قصة نجاح جديدة
   */
  async createSuccessStory(req: Request, res: Response): Promise<void> {
    try {
      // التحقق من صحة البيانات باستخدام Zod
      const validatedData = insertSuccessStorySchema.parse(req.body);
      const newStory = await this.service.createSuccessStory(validatedData);
      
      res.status(201).json(successResponse(
        newStory,
        'تم إنشاء قصة النجاح بنجاح'
      ));
    } catch (error) {
      // التعامل مع أخطاء التحقق من صحة البيانات
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          message: 'خطأ في بيانات قصة النجاح',
          errors: error.errors
        });
        return;
      }
      
      handleException(res, error);
    }
  }

  /**
   * تحديث قصة نجاح موجودة
   */
  async updateSuccessStory(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: 'معرف قصة النجاح يجب أن يكون رقماً'
        });
        return;
      }

      // تحقق من وجود قصة النجاح
      const existingStory = await this.service.getSuccessStoryById(id);
      if (!existingStory) {
        res.status(404).json({
          success: false,
          message: 'قصة النجاح غير موجودة'
        });
        return;
      }

      // التحقق من صحة البيانات باستخدام Zod
      const validatedData = insertSuccessStorySchema.partial().parse(req.body);
      const updatedStory = await this.service.updateSuccessStory(id, validatedData);
      
      res.json(successResponse(
        updatedStory,
        'تم تحديث قصة النجاح بنجاح'
      ));
    } catch (error) {
      // التعامل مع أخطاء التحقق من صحة البيانات
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          message: 'خطأ في بيانات قصة النجاح',
          errors: error.errors
        });
        return;
      }
      
      handleException(res, error);
    }
  }

  /**
   * حذف قصة نجاح
   */
  async deleteSuccessStory(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: 'معرف قصة النجاح يجب أن يكون رقماً'
        });
        return;
      }

      // تحقق من وجود قصة النجاح
      const existingStory = await this.service.getSuccessStoryById(id);
      if (!existingStory) {
        res.status(404).json({
          success: false,
          message: 'قصة النجاح غير موجودة'
        });
        return;
      }

      // حذف قصة النجاح
      const result = await this.service.deleteSuccessStory(id);
      
      if (result) {
        res.json({
          success: true,
          message: 'تم حذف قصة النجاح بنجاح'
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'فشل في حذف قصة النجاح'
        });
      }
    } catch (error) {
      handleException(res, error);
    }
  }
}