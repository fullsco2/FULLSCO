import { ScholarshipsRepository } from "../repositories/scholarships-repository";
import { InsertScholarship, Scholarship } from "../../shared/schema";

export class ScholarshipsService {
  private repository: ScholarshipsRepository;

  constructor() {
    this.repository = new ScholarshipsRepository();
  }

  /**
   * الحصول على منحة دراسية بواسطة المعرف
   */
  async getScholarshipById(id: number): Promise<Scholarship | undefined> {
    return this.repository.getScholarshipById(id);
  }

  /**
   * الحصول على منحة دراسية بواسطة الاسم المستعار
   */
  async getScholarshipBySlug(slug: string): Promise<Scholarship | undefined> {
    return this.repository.getScholarshipBySlug(slug);
  }

  /**
   * إنشاء منحة دراسية جديدة
   */
  async createScholarship(scholarshipData: InsertScholarship): Promise<Scholarship> {
    // هنا يمكن إضافة منطق أعمال إضافي قبل إنشاء المنحة
    // مثل التحقق من صحة البيانات، أو إنشاء اسم مستعار تلقائي إذا لم يتم توفيره

    // إنشاء اسم مستعار إذا لم يتم توفيره
    if (!scholarshipData.slug && scholarshipData.title) {
      scholarshipData.slug = this.generateSlug(scholarshipData.title);
    }

    // نقبل التواريخ بأي صيغة كانت
    // التحويل يتم في قاعدة البيانات
    
    // تسجيل بيانات المنحة للتصحيح
    console.log('Creating scholarship with data:', JSON.stringify(scholarshipData, null, 2));

    return this.repository.createScholarship(scholarshipData);
  }

  /**
   * تحديث منحة دراسية
   */
  async updateScholarship(id: number, scholarshipData: Partial<InsertScholarship>): Promise<Scholarship | undefined> {
    // التحقق من وجود المنحة الدراسية
    const existingScholarship = await this.repository.getScholarshipById(id);
    if (!existingScholarship) {
      return undefined;
    }

    // إنشاء اسم مستعار إذا تم تغيير العنوان ولم يتم توفير اسم مستعار جديد
    if (scholarshipData.title && !scholarshipData.slug) {
      scholarshipData.slug = this.generateSlug(scholarshipData.title);
    }

    // نقبل التواريخ بأي صيغة كانت
    // التحويل يتم في قاعدة البيانات
    
    // تسجيل بيانات المنحة للتصحيح
    console.log('Updating scholarship with data:', JSON.stringify(scholarshipData, null, 2));

    return this.repository.updateScholarship(id, scholarshipData);
  }

  /**
   * حذف منحة دراسية
   */
  async deleteScholarship(id: number): Promise<boolean> {
    // التحقق من وجود المنحة الدراسية
    const existingScholarship = await this.repository.getScholarshipById(id);
    if (!existingScholarship) {
      return false;
    }

    return this.repository.deleteScholarship(id);
  }

  /**
   * الحصول على قائمة المنح الدراسية
   */
  async listScholarships(filters?: {
    isFeatured?: boolean,
    countryId?: number,
    levelId?: number,
    categoryId?: number,
    isPublished?: boolean
  }): Promise<Scholarship[]> {
    return this.repository.listScholarships(filters);
  }

  /**
   * الحصول على المنح الدراسية المميزة
   */
  async getFeaturedScholarships(): Promise<Scholarship[]> {
    return this.repository.getFeaturedScholarships();
  }

  /**
   * زيادة عدد مشاهدات منحة دراسية
   */
  async incrementScholarshipViews(id: number): Promise<boolean> {
    return this.repository.incrementScholarshipViews(id);
  }

  /**
   * توليد اسم مستعار من العنوان
   * وظيفة مساعدة لإنشاء اسم مستعار من عنوان المنحة الدراسية
   */
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/\s+/g, '-')       // استبدال المسافات بشرطات
      .replace(/[^\u0621-\u064A\u0660-\u0669a-z0-9-]/g, '') // إزالة الأحرف غير العربية والإنجليزية والأرقام والشرطات
      .replace(/-+/g, '-')        // استبدال الشرطات المتعددة بشرطة واحدة
      .replace(/^-+/, '')         // إزالة الشرطات من بداية النص
      .replace(/-+$/, '');        // إزالة الشرطات من نهاية النص
  }
}