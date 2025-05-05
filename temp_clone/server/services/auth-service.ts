import { UsersService } from './users-service';
import { User, InsertUser } from '../../shared/schema';

export class AuthService {
  private usersService: UsersService;

  constructor() {
    this.usersService = new UsersService();
  }

  /**
   * تسجيل الدخول
   */
  async login(username: string, password: string): Promise<User | null> {
    return this.usersService.login(username, password);
  }

  /**
   * التسجيل (إنشاء حساب جديد)
   */
  async createUser(userData: InsertUser): Promise<User> {
    return this.usersService.createUser(userData);
  }

  /**
   * الحصول على مستخدم بواسطة المعرف
   */
  async getUserById(id: number): Promise<User | undefined> {
    return this.usersService.getUserById(id);
  }

  /**
   * التحقق مما إذا كان المستخدم مسؤولاً
   */
  isAdmin(user: User): boolean {
    return this.usersService.isAdmin(user);
  }

  /**
   * البحث عن مستخدم بواسطة اسم المستخدم
   */
  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.usersService.getUserByUsername(username);
  }

  /**
   * البحث عن مستخدم بواسطة البريد الإلكتروني
   */
  async getUserByEmail(email: string): Promise<User | undefined> {
    return this.usersService.getUserByEmail(email);
  }
}