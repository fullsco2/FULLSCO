import { Request, Response } from "express";
import { insertCategorySchema } from "@shared/schema";
import { CategoriesService } from "../services/categories-service";

/**
 * وحدة تحكم للتعامل مع طلبات HTTP المتعلقة بالفئات
 */
export class CategoriesController {
  private service: CategoriesService;

  /**
   * إنشاء كائن جديد من وحدة تحكم الفئات
   */
  constructor() {
    this.service = new CategoriesService();
  }

  /**
   * الحصول على قائمة بجميع الفئات
   * @route GET /api/categories
   */
  async listCategories(req: Request, res: Response): Promise<void> {
    try {
      const categories = await this.service.listCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error in listCategories controller:", error);
      res.status(500).json({ 
        message: "Failed to fetch categories",
        error: (error as Error).message
      });
    }
  }

  /**
   * الحصول على فئة محددة بواسطة المعرف
   * @route GET /api/categories/:id
   */
  async getCategoryById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        res.status(400).json({ message: "Invalid category ID" });
        return;
      }

      const category = await this.service.getCategoryById(id);
      
      if (!category) {
        res.status(404).json({ message: "Category not found" });
        return;
      }
      
      res.json(category);
    } catch (error) {
      console.error(`Error in getCategoryById controller for id ${req.params.id}:`, error);
      res.status(500).json({ 
        message: "Failed to fetch category",
        error: (error as Error).message
      });
    }
  }

  /**
   * الحصول على فئة بواسطة الاسم المستعار (slug)
   * @route GET /api/categories/slug/:slug
   */
  async getCategoryBySlug(req: Request, res: Response): Promise<void> {
    try {
      const slug = req.params.slug;
      
      if (!slug) {
        res.status(400).json({ message: "Invalid category slug" });
        return;
      }

      const category = await this.service.getCategoryBySlug(slug);
      
      if (!category) {
        res.status(404).json({ message: "Category not found" });
        return;
      }
      
      res.json(category);
    } catch (error) {
      console.error(`Error in getCategoryBySlug controller for slug ${req.params.slug}:`, error);
      res.status(500).json({ 
        message: "Failed to fetch category",
        error: (error as Error).message
      });
    }
  }

  /**
   * إنشاء فئة جديدة
   * @route POST /api/categories
   */
  async createCategory(req: Request, res: Response): Promise<void> {
    try {
      // التحقق من صحة البيانات
      const data = insertCategorySchema.parse(req.body);
      
      const category = await this.service.createCategory(data);
      res.status(201).json(category);
    } catch (error) {
      console.error("Error in createCategory controller:", error);
      
      // تحديد نوع الخطأ للرد المناسب
      if (error instanceof Error && error.message.includes("already exists")) {
        res.status(409).json({ message: error.message });
      } else {
        res.status(400).json({ 
          message: "Failed to create category",
          error: (error as Error).message
        });
      }
    }
  }

  /**
   * تحديث فئة موجودة
   * @route PUT /api/categories/:id
   */
  async updateCategory(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        res.status(400).json({ message: "Invalid category ID" });
        return;
      }

      // التحقق من صحة البيانات مع السماح بالتحديث الجزئي
      const data = insertCategorySchema.partial().parse(req.body);
      
      const category = await this.service.updateCategory(id, data);
      
      if (!category) {
        res.status(404).json({ message: "Category not found" });
        return;
      }
      
      res.json(category);
    } catch (error) {
      console.error(`Error in updateCategory controller for id ${req.params.id}:`, error);
      
      // تحديد نوع الخطأ للرد المناسب
      if (error instanceof Error && error.message.includes("already exists")) {
        res.status(409).json({ message: error.message });
      } else {
        res.status(400).json({ 
          message: "Failed to update category",
          error: (error as Error).message
        });
      }
    }
  }

  /**
   * حذف فئة
   * @route DELETE /api/categories/:id
   */
  async deleteCategory(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        res.status(400).json({ message: "Invalid category ID" });
        return;
      }

      const success = await this.service.deleteCategory(id);
      
      if (!success) {
        res.status(404).json({ message: "Category not found" });
        return;
      }
      
      res.json({ message: "Category deleted successfully" });
    } catch (error) {
      console.error(`Error in deleteCategory controller for id ${req.params.id}:`, error);
      res.status(500).json({ 
        message: "Failed to delete category",
        error: (error as Error).message
      });
    }
  }
}