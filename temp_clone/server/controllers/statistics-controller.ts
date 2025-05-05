import { Request, Response } from 'express';
import { StatisticsService } from '../services/statistics-service';
import { insertStatisticSchema } from '../../shared/schema';
import { ZodError } from 'zod';
import { successResponse, errorResponse, handleException } from '../utils/api-helper';

export class StatisticsController {
  private service: StatisticsService;

  constructor() {
    this.service = new StatisticsService();
  }

  /**
   * الحصول على إحصائية بواسطة المعرف
   */
  async getStatistic(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json(errorResponse('معرف الإحصائية غير صالح'));
        return;
      }

      const statistic = await this.service.getStatistic(id);
      if (!statistic) {
        res.status(404).json(errorResponse('الإحصائية غير موجودة'));
        return;
      }

      res.json(successResponse(statistic));
    } catch (error) {
      handleException(res, error);
    }
  }

  /**
   * إنشاء إحصائية جديدة
   */
  async createStatistic(req: Request, res: Response): Promise<void> {
    try {
      // التحقق من صحة البيانات المدخلة
      const validData = insertStatisticSchema.parse(req.body);
      
      const newStatistic = await this.service.createStatistic(validData);
      res.status(201).json(successResponse(newStatistic, 'تم إنشاء الإحصائية بنجاح'));
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json(errorResponse('خطأ في التحقق من صحة البيانات', error.errors));
        return;
      }
      
      handleException(res, error);
    }
  }

  /**
   * تحديث إحصائية موجودة
   */
  async updateStatistic(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json(errorResponse('معرف الإحصائية غير صالح'));
        return;
      }

      // التحقق من صحة البيانات المدخلة للتحديث
      const validData = insertStatisticSchema.partial().parse(req.body);
      
      const updatedStatistic = await this.service.updateStatistic(id, validData);
      res.json(successResponse(updatedStatistic, 'تم تحديث الإحصائية بنجاح'));
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json(errorResponse('خطأ في التحقق من صحة البيانات', error.errors));
        return;
      }
      
      handleException(res, error);
    }
  }

  /**
   * حذف إحصائية
   */
  async deleteStatistic(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json(errorResponse('معرف الإحصائية غير صالح'));
        return;
      }

      const success = await this.service.deleteStatistic(id);
      if (success) {
        res.json(successResponse(null, 'تم حذف الإحصائية بنجاح'));
      } else {
        res.status(500).json(errorResponse('فشل في حذف الإحصائية'));
      }
    } catch (error) {
      handleException(res, error);
    }
  }

  /**
   * الحصول على جميع الإحصائيات
   */
  async listStatistics(req: Request, res: Response): Promise<void> {
    try {
      const statistics = await this.service.listStatistics();
      res.json(successResponse(statistics));
    } catch (error) {
      handleException(res, error);
    }
  }

  /**
   * تغيير ترتيب الإحصائيات
   */
  async reorderStatistics(req: Request, res: Response): Promise<void> {
    try {
      // التحقق من وجود مصفوفة معرفات
      const { ids } = req.body;
      
      if (!Array.isArray(ids) || ids.length === 0) {
        res.status(400).json(errorResponse('مصفوفة معرفات الإحصائيات غير صالحة'));
        return;
      }
      
      // التحقق من أن جميع العناصر في المصفوفة هي أرقام صحيحة
      const statisticIds = ids.map(id => {
        const numId = parseInt(id);
        if (isNaN(numId)) {
          throw new Error('معرف الإحصائية غير صالح');
        }
        return numId;
      });
      
      const updatedStatistics = await this.service.reorderStatistics(statisticIds);
      res.json(successResponse(updatedStatistics, 'تم تحديث ترتيب الإحصائيات بنجاح'));
    } catch (error) {
      handleException(res, error);
    }
  }
}