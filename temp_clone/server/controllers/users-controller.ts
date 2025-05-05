import { Request, Response } from 'express';
import { UsersService } from '../services/users-service';
import { insertUserSchema } from '../../shared/schema';
import { handleException, successResponse } from '../utils/api-helper';
import { z } from 'zod';

export class UsersController {
  private service: UsersService;

  constructor() {
    this.service = new UsersService();
  }

  /**
   * الحصول على قائمة المستخدمين
   */
  async listUsers(req: Request, res: Response): Promise<void> {
    try {
      const users = await this.service.listUsers();
      
      // حذف كلمات المرور من النتائج
      const usersWithoutPasswords = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      
      res.json(successResponse(usersWithoutPasswords));
    } catch (error) {
      handleException(res, error);
    }
  }

  /**
   * الحصول على مستخدم بواسطة المعرف
   */
  async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.id);
      
      if (isNaN(userId)) {
        res.status(400).json({
          success: false,
          message: 'معرف المستخدم غير صالح'
        });
        return;
      }
      
      const user = await this.service.getUserById(userId);
      
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'لم يتم العثور على المستخدم'
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
   * إنشاء مستخدم جديد
   */
  async createUser(req: Request, res: Response): Promise<void> {
    try {
      // التحقق من صحة البيانات باستخدام Zod
      const validatedData = insertUserSchema.parse(req.body);
      
      const newUser = await this.service.createUser(validatedData);
      
      // حذف كلمة المرور من النتيجة
      const { password, ...userWithoutPassword } = newUser;
      
      res.status(201).json(successResponse(
        userWithoutPassword,
        'تم إنشاء المستخدم بنجاح'
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

  /**
   * تحديث بيانات مستخدم
   */
  async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.id);
      
      if (isNaN(userId)) {
        res.status(400).json({
          success: false,
          message: 'معرف المستخدم غير صالح'
        });
        return;
      }
      
      // التحقق من وجود المستخدم
      const existingUser = await this.service.getUserById(userId);
      
      if (!existingUser) {
        res.status(404).json({
          success: false,
          message: 'لم يتم العثور على المستخدم'
        });
        return;
      }
      
      // التحقق من صحة البيانات باستخدام Zod (تسمح بالتحديث الجزئي)
      const validatedData = insertUserSchema.partial().parse(req.body);
      
      // إذا كان التحديث يتضمن تغيير في اسم المستخدم، نتأكد من عدم وجود مستخدم آخر بنفس الاسم
      if (validatedData.username && validatedData.username !== existingUser.username) {
        const userWithSameUsername = await this.service.getUserByUsername(validatedData.username);
        if (userWithSameUsername) {
          res.status(409).json({
            success: false,
            message: 'اسم المستخدم مستخدم بالفعل'
          });
          return;
        }
      }
      
      // إذا كان التحديث يتضمن تغيير في البريد الإلكتروني، نتأكد من عدم وجود مستخدم آخر بنفس البريد
      if (validatedData.email && validatedData.email !== existingUser.email) {
        const userWithSameEmail = await this.service.getUserByEmail(validatedData.email);
        if (userWithSameEmail) {
          res.status(409).json({
            success: false,
            message: 'البريد الإلكتروني مستخدم بالفعل'
          });
          return;
        }
      }
      
      // إذا كان التحديث يتضمن تغيير في كلمة المرور، نقوم بتشفيرها
      if (validatedData.password) {
        // تشفير كلمة المرور سيتم في طبقة الخدمة
      }
      
      const updatedUser = await this.service.updateUser(userId, validatedData);
      
      if (!updatedUser) {
        res.status(500).json({
          success: false,
          message: 'فشل تحديث المستخدم'
        });
        return;
      }
      
      // حذف كلمة المرور من النتيجة
      const { password, ...userWithoutPassword } = updatedUser;
      
      res.json(successResponse(
        userWithoutPassword,
        'تم تحديث المستخدم بنجاح'
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
      
      handleException(res, error);
    }
  }

  /**
   * حذف مستخدم
   */
  async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.id);
      
      if (isNaN(userId)) {
        res.status(400).json({
          success: false,
          message: 'معرف المستخدم غير صالح'
        });
        return;
      }
      
      // التحقق من عدم حذف المستخدم لنفسه
      if (req.session?.userId === userId) {
        res.status(403).json({
          success: false,
          message: 'لا يمكن حذف المستخدم الحالي'
        });
        return;
      }
      
      const deleted = await this.service.deleteUser(userId);
      
      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'لم يتم العثور على المستخدم'
        });
        return;
      }
      
      res.json(successResponse(
        null,
        'تم حذف المستخدم بنجاح'
      ));
    } catch (error) {
      handleException(res, error);
    }
  }
}