import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { AppConfig } from '../config/app-config';

// التأكد من وجود مجلد التحميل
const uploadPath = AppConfig.upload.path;
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// تكوين تخزين الملفات
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // إنشاء اسم فريد للملف
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + extension);
  }
});

// التحقق من نوع الملف
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = AppConfig.upload.allowedTypes;
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`نوع الملف غير مدعوم. الأنواع المدعومة: ${allowedTypes.join(', ')}`));
  }
};

// إنشاء مثيل multer
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: AppConfig.upload.maxSize
  }
});