import { z } from "zod";
import { MediaRepository } from "../repositories/media-repository";
import { MediaFile, InsertMediaFile, insertMediaFileSchema } from "@shared/schema";
import * as fs from "fs";
import * as path from "path";
import * as util from "util";

// تحويل الدوال غير المتزامنة إلى متزامنة
const unlink = util.promisify(fs.unlink);

/**
 * خدمة مكتبة الوسائط
 * تحتوي على المنطق الأساسي للتعامل مع ملفات الوسائط
 */
export class MediaService {
  private repository: MediaRepository;
  private uploadsDir: string;

  constructor() {
    this.repository = new MediaRepository();
    this.uploadsDir = path.join(process.cwd(), 'uploads');
    
    // التأكد من وجود مجلد التحميلات
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  /**
   * الحصول على ملف وسائط بواسطة المعرف
   */
  async getMediaFile(id: number): Promise<MediaFile | undefined> {
    return this.repository.getMediaFile(id);
  }

  /**
   * إنشاء ملف وسائط جديد
   */
  async createMediaFile(mediaFileData: z.infer<typeof insertMediaFileSchema>, fileBuffer?: Buffer): Promise<MediaFile> {
    // التحقق من صحة البيانات
    const validatedData = insertMediaFileSchema.parse(mediaFileData);
    
    // إذا تم توفير الملف، حفظه في المجلد
    if (fileBuffer && validatedData.url) {
      // التأكد من أن مسار الملف يبدأ من مجلد التحميلات
      const fullPath = path.join(this.uploadsDir, path.basename(validatedData.url));
      
      // كتابة الملف
      fs.writeFileSync(fullPath, fileBuffer);
      
      // تحديث المسار ليكون مسارًا نسبيًا من مجلد التحميلات
      validatedData.url = `/uploads/${path.basename(validatedData.url)}`;
    }
    
    // إنشاء سجل الملف في قاعدة البيانات
    return this.repository.createMediaFile(validatedData);
  }

  /**
   * تحديث ملف وسائط موجود
   */
  async updateMediaFile(id: number, mediaFileData: Partial<z.infer<typeof insertMediaFileSchema>>): Promise<MediaFile | undefined> {
    // التحقق من وجود ملف الوسائط
    const existingFile = await this.repository.getMediaFile(id);
    if (!existingFile) {
      throw new Error(`Media file with ID ${id} not found`);
    }

    // التحقق من صحة البيانات
    const validatedData = insertMediaFileSchema.partial().parse(mediaFileData);
    
    // تحديث ملف الوسائط
    return this.repository.updateMediaFile(id, validatedData);
  }

  /**
   * حذف ملف وسائط
   */
  async deleteMediaFile(id: number): Promise<boolean> {
    // التحقق من وجود ملف الوسائط
    const existingFile = await this.repository.getMediaFile(id);
    if (!existingFile) {
      throw new Error(`Media file with ID ${id} not found`);
    }

    // حذف الملف الفعلي من نظام الملفات إذا كان موجودًا
    if (existingFile.url) {
      try {
        const fullPath = path.join(process.cwd(), existingFile.url);
        if (fs.existsSync(fullPath)) {
          await unlink(fullPath);
        }
      } catch (error) {
        console.error(`Error deleting file at ${existingFile.url}:`, error);
        // استمر في العملية حتى لو فشل حذف الملف من نظام الملفات
      }
    }

    // حذف سجل الملف من قاعدة البيانات
    return this.repository.deleteMediaFile(id);
  }

  /**
   * حذف مجموعة من ملفات الوسائط
   */
  async bulkDeleteMediaFiles(ids: number[]): Promise<boolean> {
    // التحقق من وجود ملفات الوسائط
    const mediaFiles = await Promise.all(
      ids.map(id => this.repository.getMediaFile(id))
    );
    
    // حذف الملفات الفعلية من نظام الملفات
    for (const file of mediaFiles) {
      if (file && file.url) {
        try {
          const fullPath = path.join(process.cwd(), file.url);
          if (fs.existsSync(fullPath)) {
            await unlink(fullPath);
          }
        } catch (error) {
          console.error(`Error deleting file at ${file.url}:`, error);
          // استمر في العملية حتى لو فشل حذف بعض الملفات
        }
      }
    }

    // حذف سجلات الملفات من قاعدة البيانات
    return this.repository.bulkDeleteMediaFiles(ids);
  }

  /**
   * الحصول على قائمة بكل ملفات الوسائط
   */
  async listMediaFiles(filters?: { mimeType?: string }): Promise<MediaFile[]> {
    return this.repository.listMediaFiles(filters);
  }
}