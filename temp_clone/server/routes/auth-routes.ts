import { Router, Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { z } from 'zod';
import { AuthService } from '../services/auth-service';
import { insertUserSchema } from '../../shared/schema';
import { handleException, successResponse } from '../utils/api-helper';

const router = Router();
const authService = new AuthService();

// تسجيل الدخول
router.post('/login', (req: Request, res: Response, next: NextFunction) => {
  try {
    // التحقق من صحة البيانات المرسلة
    const loginSchema = z.object({
      username: z.string().min(1, 'اسم المستخدم مطلوب'),
      password: z.string().min(1, 'كلمة المرور مطلوبة')
    });
    
    const validatedData = loginSchema.parse(req.body);
    
    // استخدام passport للمصادقة
    passport.authenticate('local', (err: any, user: any, info: any) => {
      if (err) {
        return next(err);
      }
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: info?.message || 'اسم المستخدم أو كلمة المرور غير صحيحة'
        });
      }
      
      req.login(user, (loginErr) => {
        if (loginErr) {
          return next(loginErr);
        }
        
        // إعداد معلومات الجلسة
        if (req.session) {
          req.session.userId = user.id;
          req.session.isAdmin = user.role === 'admin';
        }
        
        // حذف كلمة المرور من الاستجابة
        const { password, ...userWithoutPassword } = user;
        
        return res.json(successResponse(
          userWithoutPassword,
          'تم تسجيل الدخول بنجاح'
        ));
      });
    })(req, res, next);
  } catch (error) {
    // التعامل مع أخطاء التحقق من صحة البيانات
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: 'خطأ في بيانات تسجيل الدخول',
        errors: error.errors
      });
      return;
    }
    
    handleException(res, error);
  }
});

// تسجيل الخروج
router.post('/logout', (req: Request, res: Response) => {
  try {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'حدث خطأ أثناء تسجيل الخروج'
        });
      }
      
      // إلغاء معلومات الجلسة
      if (req.session) {
        req.session.userId = undefined;
        req.session.isAdmin = undefined;
      }
      
      res.json(successResponse(
        null,
        'تم تسجيل الخروج بنجاح'
      ));
    });
  } catch (error) {
    handleException(res, error);
  }
});

// الحصول على معلومات المستخدم الحالي
router.get('/me', (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({
      success: false,
      message: 'غير مصادق عليه'
    });
  }
  
  // حذف كلمة المرور من معلومات المستخدم
  const user = req.user as any;
  const { password, ...userWithoutPassword } = user;
  
  res.json(successResponse(userWithoutPassword));
});

// إنشاء حساب جديد (التسجيل)
router.post('/register', async (req: Request, res: Response) => {
  try {
    // التحقق من صحة البيانات باستخدام Zod
    const validatedData = insertUserSchema.parse(req.body);
    
    // إنشاء المستخدم في قاعدة البيانات
    const newUser = await authService.createUser(validatedData);
    
    // تسجيل الدخول تلقائياً بعد التسجيل الناجح
    req.login(newUser, (err) => {
      if (err) {
        return handleException(res, err);
      }
      
      // إعداد معلومات الجلسة
      if (req.session) {
        req.session.userId = newUser.id;
        req.session.isAdmin = newUser.role === 'admin';
      }
      
      // حذف كلمة المرور من الاستجابة
      const { password, ...userWithoutPassword } = newUser;
      
      res.status(201).json(successResponse(
        userWithoutPassword,
        'تم إنشاء الحساب بنجاح'
      ));
    });
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
});

export default router;