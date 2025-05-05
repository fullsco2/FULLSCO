import { db } from '../../db';
import { User, InsertUser, users } from '../../shared/schema';
import { eq } from 'drizzle-orm';

export class UsersRepository {
  /**
   * الحصول على مستخدم بواسطة المعرف
   */
  async getUserById(id: number): Promise<User | undefined> {
    return db.query.users.findFirst({
      where: eq(users.id, id)
    });
  }

  /**
   * البحث عن مستخدم بواسطة اسم المستخدم
   */
  async getUserByUsername(username: string): Promise<User | undefined> {
    return db.query.users.findFirst({
      where: eq(users.username, username)
    });
  }

  /**
   * البحث عن مستخدم بواسطة البريد الإلكتروني
   */
  async getUserByEmail(email: string): Promise<User | undefined> {
    return db.query.users.findFirst({
      where: eq(users.email, email)
    });
  }

  /**
   * إنشاء مستخدم جديد
   */
  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  /**
   * تحديث بيانات مستخدم
   */
  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db.update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    
    return user;
  }

  /**
   * حذف مستخدم
   */
  async deleteUser(id: number): Promise<boolean> {
    const result = await db.delete(users)
      .where(eq(users.id, id));
    
    return result.rowCount > 0;
  }

  /**
   * الحصول على قائمة المستخدمين
   */
  async listUsers(): Promise<User[]> {
    return db.query.users.findMany();
  }
}