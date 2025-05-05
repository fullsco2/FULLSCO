import { StatisticsRepository } from '../repositories/statistics-repository';
import { InsertStatistic, Statistic } from '../../shared/schema';

export class StatisticsService {
  private repository: StatisticsRepository;

  constructor() {
    this.repository = new StatisticsRepository();
  }

  /**
   * الحصول على إحصائية بواسطة المعرف
   */
  async getStatistic(id: number): Promise<Statistic | undefined> {
    return this.repository.getStatistic(id);
  }

  /**
   * إنشاء إحصائية جديدة
   */
  async createStatistic(data: InsertStatistic): Promise<Statistic> {
    // التأكد من وجود قيمة للترتيب
    if (data.order === undefined) {
      // إذا لم يتم تحديد الترتيب، نضعه في النهاية
      const statistics = await this.repository.listStatistics();
      data.order = statistics.length > 0 ? Math.max(...statistics.map(s => s.order || 0)) + 1 : 1;
    }
    
    return this.repository.createStatistic(data);
  }

  /**
   * تحديث إحصائية موجودة
   */
  async updateStatistic(id: number, data: Partial<InsertStatistic>): Promise<Statistic | undefined> {
    const existingStatistic = await this.repository.getStatistic(id);
    
    if (!existingStatistic) {
      throw new Error('الإحصائية غير موجودة');
    }
    
    return this.repository.updateStatistic(id, data);
  }

  /**
   * حذف إحصائية
   */
  async deleteStatistic(id: number): Promise<boolean> {
    const existingStatistic = await this.repository.getStatistic(id);
    
    if (!existingStatistic) {
      throw new Error('الإحصائية غير موجودة');
    }
    
    return this.repository.deleteStatistic(id);
  }

  /**
   * الحصول على جميع الإحصائيات
   */
  async listStatistics(): Promise<Statistic[]> {
    return this.repository.listStatistics();
  }
  
  /**
   * تغيير ترتيب الإحصائيات
   */
  async reorderStatistics(statisticIds: number[]): Promise<Statistic[]> {
    // تحديث ترتيب كل إحصائية حسب موقعها في المصفوفة
    const updatedStatistics: Statistic[] = [];
    
    for (let i = 0; i < statisticIds.length; i++) {
      const id = statisticIds[i];
      const updatedStatistic = await this.repository.updateStatistic(id, { order: i + 1 });
      
      if (updatedStatistic) {
        updatedStatistics.push(updatedStatistic);
      }
    }
    
    // إعادة الإحصائيات بالترتيب الجديد
    return this.repository.listStatistics();
  }
}