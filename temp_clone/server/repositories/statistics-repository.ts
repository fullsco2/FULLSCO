import { db } from "../../db";
import { statistics, InsertStatistic, Statistic } from "../../shared/schema";
import { eq } from "drizzle-orm";

export class StatisticsRepository {
  /**
   * الحصول على إحصائية بواسطة المعرف
   */
  async getStatistic(id: number): Promise<Statistic | undefined> {
    try {
      const statistic = await db.query.statistics.findFirst({
        where: eq(statistics.id, id)
      });
      return statistic;
    } catch (error) {
      console.error("خطأ في الحصول على الإحصائية:", error);
      throw error;
    }
  }

  /**
   * إنشاء إحصائية جديدة
   */
  async createStatistic(data: InsertStatistic): Promise<Statistic> {
    try {
      const [newStatistic] = await db.insert(statistics)
        .values(data)
        .returning();
      
      return newStatistic;
    } catch (error) {
      console.error("خطأ في إنشاء إحصائية جديدة:", error);
      throw error;
    }
  }

  /**
   * تحديث إحصائية موجودة
   */
  async updateStatistic(id: number, data: Partial<InsertStatistic>): Promise<Statistic | undefined> {
    try {
      const [updatedStatistic] = await db.update(statistics)
        .set(data)
        .where(eq(statistics.id, id))
        .returning();
      
      return updatedStatistic;
    } catch (error) {
      console.error("خطأ في تحديث الإحصائية:", error);
      throw error;
    }
  }

  /**
   * حذف إحصائية
   */
  async deleteStatistic(id: number): Promise<boolean> {
    try {
      const result = await db.delete(statistics)
        .where(eq(statistics.id, id));
      
      return result.rowCount ? result.rowCount > 0 : false;
    } catch (error) {
      console.error("خطأ في حذف الإحصائية:", error);
      throw error;
    }
  }

  /**
   * الحصول على جميع الإحصائيات
   */
  async listStatistics(): Promise<Statistic[]> {
    try {
      const allStatistics = await db.query.statistics.findMany({
        orderBy: statistics.order
      });
      
      return allStatistics;
    } catch (error) {
      console.error("خطأ في جلب قائمة الإحصائيات:", error);
      throw error;
    }
  }
}