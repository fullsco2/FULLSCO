import { db } from '../../db';
import { users } from '../../shared/schema';
import { User } from '../../shared/schema';
import { eq } from 'drizzle-orm';

export class AuthRepository {
  /**
   * الحصول على المستخدم بواسطة معرفه
   * @param id معرف المستخدم
   * @returns بيانات المستخدم أو null إذا لم يكن موجوداً
   */
  async getUserById(id: number): Promise<User | null> {
    try {
      const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
      return result[0] || null;
    } catch (error) {
      console.error('Error in AuthRepository.getUserById:', error);
      throw error;
    }
  }

  /**
   * الحصول على المستخدم بواسطة اسم المستخدم
   * @param username اسم المستخدم
   * @returns بيانات المستخدم أو null إذا لم يكن موجوداً
   */
  async getUserByUsername(username: string): Promise<User | null> {
    try {
      const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
      return result[0] || null;
    } catch (error) {
      console.error('Error in AuthRepository.getUserByUsername:', error);
      throw error;
    }
  }

  /**
   * الحصول على المستخدم بواسطة البريد الإلكتروني
   * @param email البريد الإلكتروني
   * @returns بيانات المستخدم أو null إذا لم يكن موجوداً
   */
  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
      return result[0] || null;
    } catch (error) {
      console.error('Error in AuthRepository.getUserByEmail:', error);
      throw error;
    }
  }

  /**
   * الحصول على قائمة المستخدمين
   * @returns قائمة المستخدمين
   */
  async getAllUsers(): Promise<User[]> {
    try {
      return await db.select().from(users);
    } catch (error) {
      console.error('Error in AuthRepository.getAllUsers:', error);
      throw error;
    }
  }
}