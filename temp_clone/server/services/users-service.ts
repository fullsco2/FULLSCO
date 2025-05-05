import { UsersRepository } from '../repositories/users-repository';
import { User, InsertUser } from '../../shared/schema';
import bcrypt from 'bcrypt';

export class UsersService {
  private repository: UsersRepository;

  constructor() {
    this.repository = new UsersRepository();
  }

  /**
   * الحصول على مستخدم بواسطة المعرف
   */
  async getUserById(id: number): Promise<User | undefined> {
    return this.repository.getUserById(id);
  }

  /**
   * البحث عن مستخدم بواسطة اسم المستخدم
   */
  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.repository.getUserByUsername(username);
  }

  /**
   * البحث عن مستخدم بواسطة البريد الإلكتروني
   */
  async getUserByEmail(email: string): Promise<User | undefined> {
    return this.repository.getUserByEmail(email);
  }

  /**
   * تسجيل الدخول
   */
  async login(username: string, password: string): Promise<User | null> {
    // البحث عن المستخدم بواسطة اسم المستخدم
    const user = await this.getUserByUsername(username);
    
    if (!user) {
      return null;
    }
    
    // التحقق من كلمة المرور
    const passwordMatch = await bcrypt.compare(password, user.password);
    
    if (!passwordMatch) {
      return null;
    }
    
    return user;
  }

  /**
   * إنشاء مستخدم جديد
   */
  async createUser(userData: InsertUser): Promise<User> {
    // التحقق من عدم وجود مستخدم بنفس اسم المستخدم
    const existingUsername = await this.getUserByUsername(userData.username);
    if (existingUsername) {
      throw new Error('اسم المستخدم مستخدم بالفعل');
    }
    
    // التحقق من عدم وجود مستخدم بنفس البريد الإلكتروني
    const existingEmail = await this.getUserByEmail(userData.email);
    if (existingEmail) {
      throw new Error('البريد الإلكتروني مستخدم بالفعل');
    }
    
    // تشفير كلمة المرور
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
    
    // إنشاء المستخدم مع كلمة المرور المشفرة
    return this.repository.createUser({
      ...userData,
      password: hashedPassword,
      role: userData.role || 'user'
    });
  }

  /**
   * الحصول على قائمة المستخدمين
   */
  async listUsers(): Promise<User[]> {
    return this.repository.listUsers();
  }

  /**
   * التحقق مما إذا كان المستخدم مسؤولاً
   */
  isAdmin(user: User): boolean {
    return user.role === 'admin';
  }
}