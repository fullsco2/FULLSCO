import { Request, Response } from 'express';
import { ScholarshipsService } from '../services/scholarships-service';
import { insertScholarshipSchema } from '../../shared/schema';
import { handleException, successResponse } from '../utils/api-helper';
import { z } from 'zod';

export class ScholarshipsController {
  private service: ScholarshipsService;

  constructor() {
    this.service = new ScholarshipsService();
  }

  /**
   * الحصول على قائمة المنح الدراسية
   */
  async listScholarships(req: Request, res: Response): Promise<void> {
    try {
      const { isFeatured, countryId, levelId, categoryId, isPublished } = req.query;
      
      // تحويل المعلمات إلى الأنواع المناسبة
      const filters: any = {};
      
      if (isFeatured !== undefined) {
        filters.isFeatured = isFeatured === 'true';
      }
      
      if (countryId !== undefined && !isNaN(Number(countryId))) {
        filters.countryId = Number(countryId);
      }
      
      if (levelId !== undefined && !isNaN(Number(levelId))) {
        filters.levelId = Number(levelId);
      }
      
      if (categoryId !== undefined && !isNaN(Number(categoryId))) {
        filters.categoryId = Number(categoryId);
      }

      if (isPublished !== undefined) {
        filters.isPublished = isPublished === 'true';
      }
      
      const scholarships = await this.service.listScholarships(filters);
      res.json(successResponse(scholarships));
    } catch (error) {
      handleException(res, error);
    }
  }

  /**
   * الحصول على المنح الدراسية المميزة
   */
  async getFeaturedScholarships(req: Request, res: Response): Promise<void> {
    try {
      const scholarships = await this.service.getFeaturedScholarships();
      res.json(scholarships);
    } catch (error) {
      handleException(res, error);
    }
  }

  /**
   * الحصول على منحة دراسية بواسطة المعرف
   */
  async getScholarshipById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: 'معرف المنحة الدراسية يجب أن يكون رقماً'
        });
        return;
      }

      const scholarship = await this.service.getScholarshipById(id);
      if (!scholarship) {
        res.status(404).json({
          success: false,
          message: 'المنحة الدراسية غير موجودة'
        });
        return;
      }

      res.json(successResponse(scholarship));
    } catch (error) {
      handleException(res, error);
    }
  }

  /**
   * الحصول على منحة دراسية بواسطة الاسم المستعار
   */
  async getScholarshipBySlug(req: Request, res: Response): Promise<void> {
    try {
      const { slug } = req.params;
      if (!slug) {
        res.status(400).json({
          success: false,
          message: 'الاسم المستعار للمنحة الدراسية مطلوب'
        });
        return;
      }

      const scholarship = await this.service.getScholarshipBySlug(slug);
      if (!scholarship) {
        res.status(404).json({
          success: false,
          message: 'المنحة الدراسية غير موجودة'
        });
        return;
      }

      // زيادة عدد المشاهدات تلقائياً
      this.service.incrementScholarshipViews(scholarship.id);

      res.json(scholarship);
    } catch (error) {
      handleException(res, error);
    }
  }

  /**
   * إنشاء منحة دراسية جديدة
   */
  async createScholarship(req: Request, res: Response): Promise<void> {
    try {
      // معالجة حقول التاريخ قبل التحقق من صحة البيانات 
      const scholarshipData = {...req.body};
      
      // تحويل النصوص إلى كائنات تاريخ إذا كانت موجودة
      if (scholarshipData.startDate && typeof scholarshipData.startDate === 'string') {
        try {
          scholarshipData.startDate = new Date(scholarshipData.startDate);
        } catch (e) {
          scholarshipData.startDate = null;
        }
      }
      
      if (scholarshipData.endDate && typeof scholarshipData.endDate === 'string') {
        try {
          scholarshipData.endDate = new Date(scholarshipData.endDate);
        } catch (e) {
          scholarshipData.endDate = null;
        }
      }
      
      // التحقق من صحة البيانات باستخدام Zod
      const validatedData = insertScholarshipSchema.parse(scholarshipData);
      const newScholarship = await this.service.createScholarship(validatedData);
      
      res.status(201).json(successResponse(
        newScholarship,
        'تم إنشاء المنحة الدراسية بنجاح'
      ));
    } catch (error) {
      // التعامل مع أخطاء التحقق من صحة البيانات
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          message: 'خطأ في بيانات المنحة الدراسية',
          errors: error.errors
        });
        return;
      }
      
      handleException(res, error);
    }
  }

  /**
   * تحديث منحة دراسية موجودة
   */
  async updateScholarship(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: 'معرف المنحة الدراسية يجب أن يكون رقماً'
        });
        return;
      }

      // تحقق من وجود المنحة الدراسية
      const existingScholarship = await this.service.getScholarshipById(id);
      if (!existingScholarship) {
        res.status(404).json({
          success: false,
          message: 'المنحة الدراسية غير موجودة'
        });
        return;
      }

      // معالجة حقول التاريخ قبل التحقق من صحة البيانات 
      const scholarshipData = {...req.body};
      
      // تحويل النصوص إلى كائنات تاريخ إذا كانت موجودة
      if (scholarshipData.startDate && typeof scholarshipData.startDate === 'string') {
        try {
          scholarshipData.startDate = new Date(scholarshipData.startDate);
        } catch (e) {
          scholarshipData.startDate = null;
        }
      }
      
      if (scholarshipData.endDate && typeof scholarshipData.endDate === 'string') {
        try {
          scholarshipData.endDate = new Date(scholarshipData.endDate);
        } catch (e) {
          scholarshipData.endDate = null;
        }
      }
      
      // التحقق من صحة البيانات باستخدام Zod
      const validatedData = insertScholarshipSchema.partial().parse(scholarshipData);
      const updatedScholarship = await this.service.updateScholarship(id, validatedData);
      
      res.json(successResponse(
        updatedScholarship,
        'تم تحديث المنحة الدراسية بنجاح'
      ));
    } catch (error) {
      // التعامل مع أخطاء التحقق من صحة البيانات
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          message: 'خطأ في بيانات المنحة الدراسية',
          errors: error.errors
        });
        return;
      }
      
      handleException(res, error);
    }
  }

  /**
   * حذف منحة دراسية
   */
  async deleteScholarship(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: 'معرف المنحة الدراسية يجب أن يكون رقماً'
        });
        return;
      }

      // تحقق من وجود المنحة الدراسية
      const existingScholarship = await this.service.getScholarshipById(id);
      if (!existingScholarship) {
        res.status(404).json({
          success: false,
          message: 'المنحة الدراسية غير موجودة'
        });
        return;
      }

      // حذف المنحة الدراسية
      const result = await this.service.deleteScholarship(id);
      
      if (result) {
        res.json({
          success: true,
          message: 'تم حذف المنحة الدراسية بنجاح'
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'فشل في حذف المنحة الدراسية'
        });
      }
    } catch (error) {
      handleException(res, error);
    }
  }
}