import { Request, Response } from "express";
import { insertCountrySchema } from "@shared/schema";
import { CountriesService } from "../services/countries-service";

/**
 * وحدة تحكم للتعامل مع طلبات HTTP المتعلقة بالدول
 */
export class CountriesController {
  private service: CountriesService;

  /**
   * إنشاء كائن جديد من وحدة تحكم الدول
   */
  constructor() {
    this.service = new CountriesService();
  }

  /**
   * الحصول على قائمة بجميع الدول
   * @route GET /api/countries
   */
  async listCountries(req: Request, res: Response): Promise<void> {
    try {
      const countries = await this.service.listCountries();
      res.json(countries);
    } catch (error) {
      console.error("Error in listCountries controller:", error);
      res.status(500).json({ 
        message: "Failed to fetch countries",
        error: (error as Error).message
      });
    }
  }

  /**
   * الحصول على دولة محددة بواسطة المعرف
   * @route GET /api/countries/:id
   */
  async getCountryById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        res.status(400).json({ message: "Invalid country ID" });
        return;
      }

      const country = await this.service.getCountryById(id);
      
      if (!country) {
        res.status(404).json({ message: "Country not found" });
        return;
      }
      
      res.json(country);
    } catch (error) {
      console.error(`Error in getCountryById controller for id ${req.params.id}:`, error);
      res.status(500).json({ 
        message: "Failed to fetch country",
        error: (error as Error).message
      });
    }
  }

  /**
   * الحصول على دولة بواسطة الاسم المستعار (slug)
   * @route GET /api/countries/slug/:slug
   */
  async getCountryBySlug(req: Request, res: Response): Promise<void> {
    try {
      const slug = req.params.slug;
      
      if (!slug) {
        res.status(400).json({ message: "Invalid country slug" });
        return;
      }

      const country = await this.service.getCountryBySlug(slug);
      
      if (!country) {
        res.status(404).json({ message: "Country not found" });
        return;
      }
      
      res.json(country);
    } catch (error) {
      console.error(`Error in getCountryBySlug controller for slug ${req.params.slug}:`, error);
      res.status(500).json({ 
        message: "Failed to fetch country",
        error: (error as Error).message
      });
    }
  }

  /**
   * إنشاء دولة جديدة
   * @route POST /api/countries
   */
  async createCountry(req: Request, res: Response): Promise<void> {
    try {
      // التحقق من صحة البيانات
      const data = insertCountrySchema.parse(req.body);
      
      const country = await this.service.createCountry(data);
      res.status(201).json(country);
    } catch (error) {
      console.error("Error in createCountry controller:", error);
      
      // تحديد نوع الخطأ للرد المناسب
      if (error instanceof Error && error.message.includes("already exists")) {
        res.status(409).json({ message: error.message });
      } else {
        res.status(400).json({ 
          message: "Failed to create country",
          error: (error as Error).message
        });
      }
    }
  }

  /**
   * تحديث دولة موجودة
   * @route PUT /api/countries/:id
   */
  async updateCountry(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        res.status(400).json({ message: "Invalid country ID" });
        return;
      }

      // التحقق من صحة البيانات مع السماح بالتحديث الجزئي
      const data = insertCountrySchema.partial().parse(req.body);
      
      const country = await this.service.updateCountry(id, data);
      
      if (!country) {
        res.status(404).json({ message: "Country not found" });
        return;
      }
      
      res.json(country);
    } catch (error) {
      console.error(`Error in updateCountry controller for id ${req.params.id}:`, error);
      
      // تحديد نوع الخطأ للرد المناسب
      if (error instanceof Error && error.message.includes("already exists")) {
        res.status(409).json({ message: error.message });
      } else {
        res.status(400).json({ 
          message: "Failed to update country",
          error: (error as Error).message
        });
      }
    }
  }

  /**
   * حذف دولة
   * @route DELETE /api/countries/:id
   */
  async deleteCountry(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        res.status(400).json({ message: "Invalid country ID" });
        return;
      }

      const success = await this.service.deleteCountry(id);
      
      if (!success) {
        res.status(404).json({ message: "Country not found" });
        return;
      }
      
      res.json({ message: "Country deleted successfully" });
    } catch (error) {
      console.error(`Error in deleteCountry controller for id ${req.params.id}:`, error);
      res.status(500).json({ 
        message: "Failed to delete country",
        error: (error as Error).message
      });
    }
  }
}