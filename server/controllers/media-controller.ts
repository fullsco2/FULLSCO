import { Request, Response } from "express";
import { MediaService } from "../services/media-service";
import { z } from "zod";
import { insertMediaFileSchema } from "@shared/schema";
import multer from "multer";
import * as path from "path";
import * as fs from "fs";

// تكوين multer لرفع الملفات
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.join(process.cwd(), 'uploads');
    // التأكد من وجود مجلد التحميلات
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // إنشاء اسم فريد للملف باستخدام الطابع الزمني
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

// تصفية الملفات للتأكد من أنها ملفات صور أو أنواع أخرى مسموح بها
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', // صور
    'application/pdf', // PDF
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // Word
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // Excel
    'video/mp4', 'video/mpeg', 'video/webm' // فيديو
  ];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type: ${file.mimetype}. Only images, PDFs, documents, and videos are allowed.`));
  }
};

// تكوين multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10 ميجابايت كحد أقصى
  }
});

/**
 * وحدة التحكم بمكتبة الوسائط
 * تتعامل مع طلبات HTTP المتعلقة بملفات الوسائط
 */
export class MediaController {
  private service: MediaService;

  constructor() {
    this.service = new MediaService();
  }

  /**
   * الحصول على ملف وسائط بواسطة المعرف
   */
  async getMediaFile(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: "معرف الملف غير صالح" });
        return;
      }

      const mediaFile = await this.service.getMediaFile(id);
      if (!mediaFile) {
        res.status(404).json({ success: false, message: "الملف غير موجود" });
        return;
      }

      res.json({ success: true, data: mediaFile });
    } catch (error) {
      console.error("Error in getMediaFile controller:", error);
      res.status(500).json({ 
        success: false, 
        message: "حدث خطأ أثناء جلب الملف", 
        error: (error as Error).message 
      });
    }
  }

  /**
   * معالج middleware لرفع الملفات
   */
  uploadMiddleware() {
    return upload.single('file');
  }

  /**
   * رفع ملف وسائط جديد
   */
  async uploadMediaFile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ success: false, message: "لم يتم تحميل أي ملف" });
        return;
      }

      // إنشاء كائن البيانات للملف متوافقًا مع مخطط قاعدة البيانات
      const mediaFileData = {
        filename: req.file.filename,
        originalFilename: req.file.originalname,
        url: `/uploads/${req.file.filename}`,
        size: req.file.size,
        mimeType: req.file.mimetype,
        alt: req.body.alt || req.file.originalname,
        title: req.body.title || req.file.originalname
      };
      
      // إنشاء سجل الملف في قاعدة البيانات
      const mediaFile = await this.service.createMediaFile(mediaFileData);
      
      res.status(201).json({ success: true, message: "تم رفع الملف بنجاح", data: mediaFile });
    } catch (error) {
      console.error("Error in uploadMediaFile controller:", error);
      
      // التعامل مع أخطاء التحقق من صحة البيانات
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          success: false, 
          message: "بيانات الملف غير صالحة", 
          errors: error.errors 
        });
        return;
      }
      
      res.status(500).json({ 
        success: false, 
        message: "حدث خطأ أثناء رفع الملف", 
        error: (error as Error).message 
      });
    }
  }

  /**
   * تحديث بيانات ملف وسائط
   */
  async updateMediaFile(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: "معرف الملف غير صالح" });
        return;
      }

      // التحقق من صحة البيانات المرسلة
      const mediaFileData = {
        title: req.body.title,
        altText: req.body.altText,
        description: req.body.description
      };
      
      // تحديث الملف
      const mediaFile = await this.service.updateMediaFile(id, mediaFileData);
      
      res.json({ success: true, message: "تم تحديث بيانات الملف بنجاح", data: mediaFile });
    } catch (error) {
      console.error("Error in updateMediaFile controller:", error);
      
      // التعامل مع أخطاء التحقق من صحة البيانات
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          success: false, 
          message: "بيانات الملف غير صالحة", 
          errors: error.errors 
        });
        return;
      }
      
      // التعامل مع حالة عدم وجود الملف
      if ((error as Error).message.includes("not found")) {
        res.status(404).json({ success: false, message: "الملف غير موجود" });
        return;
      }
      
      res.status(500).json({ 
        success: false, 
        message: "حدث خطأ أثناء تحديث بيانات الملف", 
        error: (error as Error).message 
      });
    }
  }

  /**
   * حذف ملف وسائط
   */
  async deleteMediaFile(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: "معرف الملف غير صالح" });
        return;
      }

      // حذف الملف
      const success = await this.service.deleteMediaFile(id);
      
      if (success) {
        res.json({ success: true, message: "تم حذف الملف بنجاح" });
      } else {
        res.status(404).json({ success: false, message: "الملف غير موجود" });
      }
    } catch (error) {
      console.error("Error in deleteMediaFile controller:", error);
      
      // التعامل مع حالة عدم وجود الملف
      if ((error as Error).message.includes("not found")) {
        res.status(404).json({ success: false, message: "الملف غير موجود" });
        return;
      }
      
      res.status(500).json({ 
        success: false, 
        message: "حدث خطأ أثناء حذف الملف", 
        error: (error as Error).message 
      });
    }
  }

  /**
   * حذف مجموعة من ملفات الوسائط
   */
  async bulkDeleteMediaFiles(req: Request, res: Response): Promise<void> {
    try {
      const { ids } = req.body;
      
      if (!Array.isArray(ids) || ids.length === 0) {
        res.status(400).json({ success: false, message: "يجب توفير مصفوفة صالحة من معرفات الملفات" });
        return;
      }
      
      // تحويل المعرفات إلى أرقام
      const numericIds = ids.map(id => parseInt(id)).filter(id => !isNaN(id));
      
      if (numericIds.length === 0) {
        res.status(400).json({ success: false, message: "لم يتم توفير معرفات صالحة" });
        return;
      }

      // حذف الملفات
      const success = await this.service.bulkDeleteMediaFiles(numericIds);
      
      if (success) {
        res.json({ success: true, message: "تم حذف الملفات بنجاح" });
      } else {
        res.status(404).json({ success: false, message: "لم يتم العثور على الملفات المحددة" });
      }
    } catch (error) {
      console.error("Error in bulkDeleteMediaFiles controller:", error);
      res.status(500).json({ 
        success: false, 
        message: "حدث خطأ أثناء حذف الملفات", 
        error: (error as Error).message 
      });
    }
  }

  /**
   * الحصول على قائمة بكل ملفات الوسائط
   */
  async listMediaFiles(req: Request, res: Response): Promise<void> {
    try {
      // استخراج المعلمات من الاستعلام
      const mimeType = req.query.type as string | undefined;
      
      // جلب الملفات
      const mediaFiles = await this.service.listMediaFiles(
        mimeType ? { mimeType } : undefined
      );
      
      res.json({ success: true, data: mediaFiles });
    } catch (error) {
      console.error("Error in listMediaFiles controller:", error);
      res.status(500).json({ 
        success: false, 
        message: "حدث خطأ أثناء جلب الملفات", 
        error: (error as Error).message 
      });
    }
  }
}