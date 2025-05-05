import { db } from "../db";
import { eq, sql, isNull } from "drizzle-orm";
import { 
  menus, 
  menuItems,
  InsertMenu,
  InsertMenuItem,
  Menu,
  MenuItem
} from "@shared/schema";

/**
 * فئة مستودع القوائم
 * تتعامل مع عمليات قاعدة البيانات المتعلقة بالقوائم وعناصر القائمة
 */
export class MenusRepository {
  /**
   * الحصول على قائمة بواسطة المعرف
   */
  async getMenu(id: number): Promise<Menu | undefined> {
    try {
      const result = await db.query.menus.findFirst({
        where: eq(menus.id, id)
      });
      return result;
    } catch (error) {
      console.error("Error in getMenu:", error);
      throw error;
    }
  }

  /**
   * الحصول على قائمة بواسطة slug
   */
  async getMenuBySlug(slug: string): Promise<Menu | undefined> {
    try {
      const result = await db.query.menus.findFirst({
        where: eq(menus.slug, slug)
      });
      return result;
    } catch (error) {
      console.error("Error in getMenuBySlug:", error);
      throw error;
    }
  }

  /**
   * الحصول على قائمة بواسطة الموقع
   */
  async getMenuByLocation(location: string): Promise<Menu | undefined> {
    try {
      // استعلام مباشر نظراً لأن menus.location هو نوع enum
      const [result] = await db.select().from(menus)
        .where(sql`${menus.location} = ${location}`)
        .limit(1);
      return result;
    } catch (error) {
      console.error("Error in getMenuByLocation:", error);
      throw error;
    }
  }

  /**
   * إنشاء قائمة جديدة
   */
  async createMenu(menu: InsertMenu): Promise<Menu> {
    try {
      const [result] = await db.insert(menus)
        .values(menu)
        .returning();
      return result;
    } catch (error) {
      console.error("Error in createMenu:", error);
      throw error;
    }
  }

  /**
   * تحديث قائمة موجودة
   */
  async updateMenu(id: number, menu: Partial<InsertMenu>): Promise<Menu | undefined> {
    try {
      const [result] = await db.update(menus)
        .set(menu)
        .where(eq(menus.id, id))
        .returning();
      return result;
    } catch (error) {
      console.error("Error in updateMenu:", error);
      throw error;
    }
  }

  /**
   * حذف قائمة
   */
  async deleteMenu(id: number): Promise<boolean> {
    try {
      // أولاً نقوم بحذف عناصر القائمة المرتبطة بهذه القائمة
      await db.delete(menuItems)
        .where(eq(menuItems.menuId, id));
      
      // ثم نحذف القائمة نفسها
      const result = await db.delete(menus)
        .where(eq(menus.id, id));
      
      return result.rowCount > 0;
    } catch (error) {
      console.error("Error in deleteMenu:", error);
      throw error;
    }
  }

  /**
   * الحصول على قائمة بكل القوائم
   */
  async listMenus(): Promise<Menu[]> {
    try {
      const result = await db.query.menus.findMany();
      return result;
    } catch (error) {
      console.error("Error in listMenus:", error);
      throw error;
    }
  }

  /**
   * الحصول على عنصر قائمة بواسطة المعرف
   */
  async getMenuItem(id: number): Promise<MenuItem | undefined> {
    try {
      const result = await db.query.menuItems.findFirst({
        where: eq(menuItems.id, id)
      });
      return result;
    } catch (error) {
      console.error("Error in getMenuItem:", error);
      throw error;
    }
  }

  /**
   * إنشاء عنصر قائمة جديد
   */
  async createMenuItem(item: InsertMenuItem): Promise<MenuItem> {
    try {
      const [result] = await db.insert(menuItems)
        .values(item)
        .returning();
      return result;
    } catch (error) {
      console.error("Error in createMenuItem:", error);
      throw error;
    }
  }

  /**
   * تحديث عنصر قائمة موجود
   */
  async updateMenuItem(id: number, item: Partial<InsertMenuItem>): Promise<MenuItem | undefined> {
    try {
      const [result] = await db.update(menuItems)
        .set(item)
        .where(eq(menuItems.id, id))
        .returning();
      return result;
    } catch (error) {
      console.error("Error in updateMenuItem:", error);
      throw error;
    }
  }

  /**
   * حذف عنصر قائمة
   */
  async deleteMenuItem(id: number): Promise<boolean> {
    try {
      const result = await db.delete(menuItems)
        .where(eq(menuItems.id, id));
      return result.rowCount > 0;
    } catch (error) {
      console.error("Error in deleteMenuItem:", error);
      throw error;
    }
  }

  /**
   * الحصول على قائمة بعناصر القائمة التي تنتمي إلى قائمة معينة
   * يمكن تحديد parentId للحصول على عناصر القائمة الفرعية
   */
  async listMenuItems(menuId: number, parentId?: number | null): Promise<MenuItem[]> {
    try {
      let query = db.select().from(menuItems)
        .where(eq(menuItems.menuId, menuId));
      
      if (parentId === null) {
        // عناصر القائمة الرئيسية (parent_id is NULL)
        query = query.where(sql`${menuItems.parentId} IS NULL`);
      } else if (parentId !== undefined) {
        // عناصر القائمة الفرعية لـ parent_id محدد
        query = query.where(eq(menuItems.parentId, parentId));
      }

      // ترتيب العناصر حسب الترتيب
      query = query.orderBy(menuItems.order);
      
      const result = await query;
      return result;
    } catch (error) {
      console.error("Error in listMenuItems:", error);
      throw error;
    }
  }

  /**
   * الحصول على جميع عناصر القائمة مع تفاصيلها بشكل متداخل
   * هذه الطريقة تعيد هيكل مناسب لعرض القائمة متعددة المستويات
   */
  async getAllMenuItemsWithDetails(menuId: number): Promise<any[]> {
    try {
      // استرداد كل عناصر القائمة
      const allItems = await db.select().from(menuItems)
        .where(eq(menuItems.menuId, menuId))
        .orderBy(menuItems.order);

      // بناء شجرة العناصر بشكل تكراري
      const buildTree = (parentId: number | null = null): any[] => {
        return allItems
          .filter(item => item.parentId === parentId)
          .map(item => ({
            ...item,
            children: buildTree(item.id)
          }));
      };

      // إرجاع الشجرة المبنية من العناصر الجذرية (parent_id = null)
      return buildTree(null);
    } catch (error) {
      console.error("Error in getAllMenuItemsWithDetails:", error);
      throw error;
    }
  }

  /**
   * الحصول على هيكل القائمة الكامل بناءً على الموقع
   */
  async getMenuStructure(location: string): Promise<any> {
    try {
      // البحث عن القائمة بالموقع المحدد
      const menu = await this.getMenuByLocation(location);
      if (!menu) {
        return null;
      }

      // الحصول على هيكل العناصر
      const items = await this.getAllMenuItemsWithDetails(menu.id);
      
      return {
        menu,
        items
      };
    } catch (error) {
      console.error("Error in getMenuStructure:", error);
      throw error;
    }
  }
}