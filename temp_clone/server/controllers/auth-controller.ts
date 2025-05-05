import { Request, Response } from 'express';
import { AuthService } from '../services/auth-service';
import { insertUserSchema } from '../../shared/schema';
import { handleException, successResponse } from '../utils/api-helper';
import { z } from 'zod';

export class AuthController {
  private service: AuthService;

  constructor() {
    this.service = new AuthService();
  }

  /**
   * تسجيل الدخول
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        res.status(400).json({
          success: false,
          message: 'اسم المستخدم وكلمة المرور مطلوبان'
        });
        return;
      }
      
      const user = await this.service.login(username, password);
      
      if (!user) {
        res.status(401).json({
          success: false,
          message: 'اسم المستخدم أو كلمة المرور غير صحيحة'
        });
        return;
      }
      
      // تخزين معلومات المستخدم في الجلسة
      if (req.session) {
        req.session.userId = user.id;
        req.session.isAdmin = this.service.isAdmin(user);
      }
      
      // حذف كلمة المرور من النتيجة
      const { password: pwd, ...userWithoutPassword } = user;
      
      res.json(successResponse(
        userWithoutPassword,
        'تم تسجيل الدخول بنجاح'
      ));
    } catch (error) {
      handleException(res, error);
    }
  }

  /**
   * تسجيل الخروج
   */
  async logout(req: Request, res: Response): Promise<void> {
    try {
      if (req.session) {
        req.session.destroy((err) => {
          if (err) {
            console.error('Error destroying session:', err);
            res.status(500).json({
              success: false,
              message: 'حدث خطأ أثناء تسجيل الخروج'
            });
          } else {
            res.json({
              success: true,
              message: 'تم تسجيل الخروج بنجاح'
            });
          }
        });
      } else {
        res.json({
          success: true,
          message: 'تم تسجيل الخروج بنجاح'
        });
      }
    } catch (error) {
      handleException(res, error);
    }
  }

  /**
   * الحصول على معلومات المستخدم الحالي
   */
  async getCurrentUser(req: Request, res: Response): Promise<void> {
    try {
      // التحقق من وجود جلسة مستخدم نشطة
      if (!req.session?.userId) {
        res.status(401).json({
          success: false,
          message: 'غير مصرح به'
        });
        return;
      }
      
      const userId = req.session.userId;
      const user = await this.service.getUserById(userId);
      
      if (!user) {
        // حذف الجلسة إذا لم يتم العثور على المستخدم
        if (req.session) {
          req.session.destroy((err) => {
            if (err) {
              console.error('Error destroying session:', err);
            }
          });
        }
        
        res.status(401).json({
          success: false,
          message: 'غير مصرح به'
        });
        return;
      }
      
      // حذف كلمة المرور من النتيجة
      const { password, ...userWithoutPassword } = user;
      
      res.json(successResponse(userWithoutPassword));
    } catch (error) {
      handleException(res, error);
    }
  }

  /**
   * التسجيل (إنشاء حساب جديد)
   */
  async register(req: Request, res: Response): Promise<void> {
    try {
      // التحقق من صحة البيانات باستخدام Zod
      const validatedData = insertUserSchema.parse(req.body);
      
      const newUser = await this.service.createUser(validatedData);
      
      // تخزين معلومات المستخدم في الجلسة
      if (req.session) {
        req.session.userId = newUser.id;
        req.session.isAdmin = this.service.isAdmin(newUser);
      }
      
      // حذف كلمة المرور من النتيجة
      const { password, ...userWithoutPassword } = newUser;
      
      res.status(201).json(successResponse(
        userWithoutPassword,
        'تم إنشاء الحساب بنجاح'
      ));
    } catch (error) {
      // التعامل مع أخطاء التحقق من صحة البيانات
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          message: 'خطأ في بيانات المستخدم',
          errors: error.errors
        });
        return;
      }
      
      // التعامل مع أخطاء اسم المستخدم أو البريد الإلكتروني المكرر
      if (error instanceof Error && (
        error.message === 'اسم المستخدم مستخدم بالفعل' || 
        error.message === 'البريد الإلكتروني مستخدم بالفعل'
      )) {
        res.status(409).json({
          success: false,
          message: error.message
        });
        return;
      }
      
      handleException(res, error);
    }
  }
}