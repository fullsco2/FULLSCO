import { Request, Response } from 'express';
import { PartnersService } from '../services/partners-service';
import { insertPartnerSchema } from '@shared/schema';
import { handleException, successResponse } from '../utils/api-helper';

export class PartnersController {
  private service: PartnersService;

  constructor() {
    this.service = new PartnersService();
  }

  /**
   * الحصول على قائمة الشركاء
   */
  async listPartners(req: Request, res: Response): Promise<void> {
    try {
      const { isActive } = req.query;
      const activeFilter = isActive !== undefined ? isActive === 'true' : undefined;
      
      const partners = await this.service.listPartners(activeFilter);
      res.json(successResponse(partners));
    } catch (error) {
      handleException(res, error);
    }
  }

  /**
   * الحصول على شريك بواسطة المعرف
   */
  async getPartnerById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: 'معرف الشريك يجب أن يكون رقماً'
        });
        return;
      }

      const partner = await this.service.getPartnerById(id);
      if (!partner) {
        res.status(404).json({
          success: false,
          message: 'الشريك غير موجود'
        });
        return;
      }

      res.json(successResponse(partner));
    } catch (error) {
      handleException(res, error);
    }
  }

  /**
   * إنشاء شريك جديد
   */
  async createPartner(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = insertPartnerSchema.parse(req.body);
      const newPartner = await this.service.createPartner(validatedData);
      
      res.status(201).json(successResponse(
        newPartner,
        'تم إنشاء الشريك بنجاح'
      ));
    } catch (error) {
      handleException(res, error);
    }
  }

  /**
   * تحديث شريك موجود
   */
  async updatePartner(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: 'معرف الشريك يجب أن يكون رقماً'
        });
        return;
      }

      // تحقق من وجود الشريك
      const existingPartner = await this.service.getPartnerById(id);
      if (!existingPartner) {
        res.status(404).json({
          success: false,
          message: 'الشريك غير موجود'
        });
        return;
      }

      // تحديث الشريك
      const validatedData = insertPartnerSchema.partial().parse(req.body);
      const updatedPartner = await this.service.updatePartner(id, validatedData);
      
      res.json(successResponse(
        updatedPartner,
        'تم تحديث الشريك بنجاح'
      ));
    } catch (error) {
      handleException(res, error);
    }
  }

  /**
   * حذف شريك
   */
  async deletePartner(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: 'معرف الشريك يجب أن يكون رقماً'
        });
        return;
      }

      // تحقق من وجود الشريك
      const existingPartner = await this.service.getPartnerById(id);
      if (!existingPartner) {
        res.status(404).json({
          success: false,
          message: 'الشريك غير موجود'
        });
        return;
      }

      // حذف الشريك
      const result = await this.service.deletePartner(id);
      
      if (result) {
        res.json({
          success: true,
          message: 'تم حذف الشريك بنجاح'
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'فشل في حذف الشريك'
        });
      }
    } catch (error) {
      handleException(res, error);
    }
  }
}