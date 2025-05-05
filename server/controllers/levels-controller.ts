import { Request, Response } from "express";
import { insertLevelSchema } from "@shared/schema";
import { LevelsService } from "../services/levels-service";

/**
 * وحدة تحكم للتعامل مع طلبات HTTP المتعلقة بالمستويات الدراسية
 */
export class LevelsController {
  private service: LevelsService;

  /**
   * إنشاء كائن جديد من وحدة تحكم المستويات
   */
  constructor() {
    this.service = new LevelsService();
  }

  /**
   * الحصول على قائمة بجميع المستويات
   * @route GET /api/levels
   */
  async listLevels(req: Request, res: Response): Promise<void> {
    try {
      const levels = await this.service.listLevels();
      res.json(levels);
    } catch (error) {
      console.error("Error in listLevels controller:", error);
      res.status(500).json({ 
        message: "Failed to fetch levels",
        error: (error as Error).message
      });
    }
  }

  /**
   * الحصول على مستوى محدد بواسطة المعرف
   * @route GET /api/levels/:id
   */
  async getLevelById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        res.status(400).json({ message: "Invalid level ID" });
        return;
      }

      const level = await this.service.getLevelById(id);
      
      if (!level) {
        res.status(404).json({ message: "Level not found" });
        return;
      }
      
      res.json(level);
    } catch (error) {
      console.error(`Error in getLevelById controller for id ${req.params.id}:`, error);
      res.status(500).json({ 
        message: "Failed to fetch level",
        error: (error as Error).message
      });
    }
  }

  /**
   * الحصول على مستوى بواسطة الاسم المستعار (slug)
   * @route GET /api/levels/slug/:slug
   */
  async getLevelBySlug(req: Request, res: Response): Promise<void> {
    try {
      const slug = req.params.slug;
      
      if (!slug) {
        res.status(400).json({ message: "Invalid level slug" });
        return;
      }

      const level = await this.service.getLevelBySlug(slug);
      
      if (!level) {
        res.status(404).json({ message: "Level not found" });
        return;
      }
      
      res.json(level);
    } catch (error) {
      console.error(`Error in getLevelBySlug controller for slug ${req.params.slug}:`, error);
      res.status(500).json({ 
        message: "Failed to fetch level",
        error: (error as Error).message
      });
    }
  }

  /**
   * إنشاء مستوى جديد
   * @route POST /api/levels
   */
  async createLevel(req: Request, res: Response): Promise<void> {
    try {
      // التحقق من صحة البيانات
      const data = insertLevelSchema.parse(req.body);
      
      const level = await this.service.createLevel(data);
      res.status(201).json(level);
    } catch (error) {
      console.error("Error in createLevel controller:", error);
      
      // تحديد نوع الخطأ للرد المناسب
      if (error instanceof Error && error.message.includes("already exists")) {
        res.status(409).json({ message: error.message });
      } else {
        res.status(400).json({ 
          message: "Failed to create level",
          error: (error as Error).message
        });
      }
    }
  }

  /**
   * تحديث مستوى موجود
   * @route PUT /api/levels/:id
   */
  async updateLevel(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        res.status(400).json({ message: "Invalid level ID" });
        return;
      }

      // التحقق من صحة البيانات مع السماح بالتحديث الجزئي
      const data = insertLevelSchema.partial().parse(req.body);
      
      const level = await this.service.updateLevel(id, data);
      
      if (!level) {
        res.status(404).json({ message: "Level not found" });
        return;
      }
      
      res.json(level);
    } catch (error) {
      console.error(`Error in updateLevel controller for id ${req.params.id}:`, error);
      
      // تحديد نوع الخطأ للرد المناسب
      if (error instanceof Error && error.message.includes("already exists")) {
        res.status(409).json({ message: error.message });
      } else {
        res.status(400).json({ 
          message: "Failed to update level",
          error: (error as Error).message
        });
      }
    }
  }

  /**
   * حذف مستوى
   * @route DELETE /api/levels/:id
   */
  async deleteLevel(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        res.status(400).json({ message: "Invalid level ID" });
        return;
      }

      const success = await this.service.deleteLevel(id);
      
      if (!success) {
        res.status(404).json({ message: "Level not found" });
        return;
      }
      
      res.json({ message: "Level deleted successfully" });
    } catch (error) {
      console.error(`Error in deleteLevel controller for id ${req.params.id}:`, error);
      res.status(500).json({ 
        message: "Failed to delete level",
        error: (error as Error).message
      });
    }
  }
}