import { db, pool } from "./db";
import { eq, and, desc, sql, inArray, like } from "drizzle-orm";
import {
  users, User, InsertUser,
  categories, Category, InsertCategory,
  levels, Level, InsertLevel,
  countries, Country, InsertCountry,
  scholarships, Scholarship, InsertScholarship,
  posts, Post, InsertPost,
  tags, Tag, InsertTag,
  postTags, PostTag, InsertPostTag,
  successStories, SuccessStory, InsertSuccessStory,
  subscribers, Subscriber, InsertSubscriber,
  seoSettings, SeoSetting, InsertSeoSetting,
  siteSettings, SiteSetting, InsertSiteSetting,
  pages, Page, InsertPage,
  menus, Menu, InsertMenu,
  menuItems, MenuItem, InsertMenuItem,
  mediaFiles, MediaFile, InsertMediaFile
} from "@shared/schema";
import { IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
  // Media operations
  async getMediaFile(id: number): Promise<MediaFile | undefined> {
    try {
      const [mediaFile] = await db.select().from(mediaFiles).where(eq(mediaFiles.id, id));
      return mediaFile;
    } catch (error) {
      console.error("Error getting media file:", error);
      return undefined;
    }
  }

  async createMediaFile(mediaFile: InsertMediaFile): Promise<MediaFile> {
    try {
      // Add current timestamp for created and updated
      const now = new Date();
      const fileData = {
        ...mediaFile,
        createdAt: now,
        updatedAt: now
      };
      
      const [createdFile] = await db.insert(mediaFiles).values(fileData).returning();
      return createdFile;
    } catch (error) {
      console.error("Error creating media file:", error);
      throw error;
    }
  }

  async updateMediaFile(id: number, mediaFile: Partial<InsertMediaFile>): Promise<MediaFile | undefined> {
    try {
      // Update the timestamp
      const data = {
        ...mediaFile,
        updatedAt: new Date()
      };
      
      const [updatedFile] = await db
        .update(mediaFiles)
        .set(data)
        .where(eq(mediaFiles.id, id))
        .returning();
      
      return updatedFile;
    } catch (error) {
      console.error("Error updating media file:", error);
      return undefined;
    }
  }

  async deleteMediaFile(id: number): Promise<boolean> {
    try {
      const result = await db.delete(mediaFiles).where(eq(mediaFiles.id, id));
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      console.error("Error deleting media file:", error);
      return false;
    }
  }

  async listMediaFiles(filters?: { mimeType?: string }): Promise<MediaFile[]> {
    try {
      let query = db.select().from(mediaFiles);
      
      if (filters) {
        if (filters.mimeType) {
          query = query.where(like(mediaFiles.mimeType, `${filters.mimeType}%`));
        }
      }
      
      const mediaFilesList = await query.orderBy(desc(mediaFiles.createdAt));
      return mediaFilesList;
    } catch (error) {
      console.error("Error listing media files:", error);
      return [];
    }
  }

  async bulkDeleteMediaFiles(ids: number[]): Promise<boolean> {
    try {
      const result = await db.delete(mediaFiles).where(inArray(mediaFiles.id, ids));
      return true;
    } catch (error) {
      console.error("Error bulk deleting media files:", error);
      return false;
    }
  }
  
  // Menu operations
  async getMenu(id: number): Promise<Menu | undefined> {
    try {
      const [menu] = await db.select().from(menus).where(eq(menus.id, id));
      return menu;
    } catch (error) {
      console.error("Error getting menu:", error);
      return undefined;
    }
  }

  async getMenuBySlug(slug: string): Promise<Menu | undefined> {
    try {
      const [menu] = await db.select().from(menus).where(eq(menus.slug, slug));
      return menu;
    } catch (error) {
      console.error("Error getting menu by slug:", error);
      return undefined;
    }
  }

  async getMenuByLocation(location: string): Promise<Menu | undefined> {
    try {
      const [menu] = await db.select().from(menus).where(eq(menus.location, location));
      return menu;
    } catch (error) {
      console.error("Error getting menu by location:", error);
      return undefined;
    }
  }

  async createMenu(menu: InsertMenu): Promise<Menu> {
    try {
      const [createdMenu] = await db.insert(menus).values(menu).returning();
      return createdMenu;
    } catch (error) {
      console.error("Error creating menu:", error);
      throw error;
    }
  }

  async updateMenu(id: number, menu: Partial<InsertMenu>): Promise<Menu | undefined> {
    try {
      const [updatedMenu] = await db
        .update(menus)
        .set(menu)
        .where(eq(menus.id, id))
        .returning();
      return updatedMenu;
    } catch (error) {
      console.error("Error updating menu:", error);
      return undefined;
    }
  }

  async deleteMenu(id: number): Promise<boolean> {
    try {
      // Delete all menu items associated with this menu first
      await db.delete(menuItems).where(eq(menuItems.menuId, id));
      
      // Then delete the menu
      const result = await db.delete(menus).where(eq(menus.id, id));
      return result.rowCount > 0;
    } catch (error) {
      console.error("Error deleting menu:", error);
      return false;
    }
  }

  async listMenus(): Promise<Menu[]> {
    try {
      const menusList = await db.select().from(menus);
      return menusList;
    } catch (error) {
      console.error("Error listing menus:", error);
      return [];
    }
  }

  // Menu Item operations
  async getMenuItem(id: number): Promise<MenuItem | undefined> {
    try {
      const [menuItem] = await db.select().from(menuItems).where(eq(menuItems.id, id));
      return menuItem;
    } catch (error) {
      console.error("Error getting menu item:", error);
      return undefined;
    }
  }

  async createMenuItem(item: InsertMenuItem): Promise<MenuItem> {
    try {
      const [createdItem] = await db.insert(menuItems).values(item).returning();
      return createdItem;
    } catch (error) {
      console.error("Error creating menu item:", error);
      throw error;
    }
  }

  async updateMenuItem(id: number, item: Partial<InsertMenuItem>): Promise<MenuItem | undefined> {
    try {
      const [updatedItem] = await db
        .update(menuItems)
        .set(item)
        .where(eq(menuItems.id, id))
        .returning();
      return updatedItem;
    } catch (error) {
      console.error("Error updating menu item:", error);
      return undefined;
    }
  }

  async deleteMenuItem(id: number): Promise<boolean> {
    try {
      // First, delete all child items
      await db.delete(menuItems).where(eq(menuItems.parentId, id));
      
      // Then delete the item itself
      const result = await db.delete(menuItems).where(eq(menuItems.id, id));
      return result.rowCount > 0;
    } catch (error) {
      console.error("Error deleting menu item:", error);
      return false;
    }
  }

  async listMenuItems(menuId: number, parentId?: number | null): Promise<MenuItem[]> {
    try {
      let query = db.select().from(menuItems).where(eq(menuItems.menuId, menuId));
      
      if (parentId !== undefined) {
        if (parentId === null) {
          query = query.where(sql`${menuItems.parentId} IS NULL`);
        } else {
          query = query.where(eq(menuItems.parentId, parentId));
        }
      }
      
      return await query.orderBy(menuItems.order);
    } catch (error) {
      console.error("Error listing menu items:", error);
      return [];
    }
  }

  async getAllMenuItemsWithDetails(menuId: number): Promise<any[]> {
    try {
      return await db
        .select()
        .from(menuItems)
        .where(eq(menuItems.menuId, menuId))
        .orderBy(menuItems.order);
    } catch (error) {
      console.error("Error getting menu items with details:", error);
      return [];
    }
  }

  async getMenuStructure(location: string): Promise<any> {
    try {
      // First get the menu by location
      const menu = await this.getMenuByLocation(location);
      if (!menu) {
        return null;
      }
      
      // Get root level menu items (parentId is null)
      const rootItems = await this.listMenuItems(menu.id, null);
      
      // Prepare the structure
      const structure = {
        id: menu.id,
        name: menu.name,
        slug: menu.slug,
        location: menu.location,
        items: []
      };
      
      // For each root item, get its children
      for (const rootItem of rootItems) {
        const item: any = { ...rootItem, children: [] };
        
        if (rootItem.id) {
          // Get child items for this root item
          const children = await this.listMenuItems(menu.id, rootItem.id);
          item.children = children || [];
        }
        
        structure.items.push(item);
      }
      
      return structure;
    } catch (error) {
      console.error(`Error getting menu structure for ${location}:`, error);
      throw error; // رمي الخطأ ليتم التقاطه في routes.ts
    }
  }
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    // Use raw query since the schema differs from actual table
    const result = await db.execute(sql`
      SELECT id, username, password, display_name as "fullName", email, role, created_at as "createdAt"
      FROM users 
      WHERE id = ${id}
    `);
    
    // @ts-ignore - PostgreSQL driver returns rows as an array
    if (result.rows && result.rows.length === 0) return undefined;
    
    // Convert the first row to User type
    // @ts-ignore - PostgreSQL driver returns rows as an array
    return result.rows[0] as User;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    // Use raw query since the schema differs from actual table
    const result = await db.execute(sql`
      SELECT id, username, password, display_name as "fullName", email, role, created_at as "createdAt"
      FROM users 
      WHERE username = ${username}
    `);
    
    // @ts-ignore - PostgreSQL driver returns rows as an array
    if (result.rows && result.rows.length === 0) return undefined;
    
    // Convert the first row to User type
    // @ts-ignore - PostgreSQL driver returns rows as an array
    return result.rows[0] as User;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    // Use raw query since the schema differs from actual table
    const result = await db.execute(sql`
      SELECT id, username, password, display_name as "fullName", email, role, created_at as "createdAt"
      FROM users 
      WHERE email = ${email}
    `);
    
    // @ts-ignore - PostgreSQL driver returns rows as an array
    if (result.rows && result.rows.length === 0) return undefined;
    
    // Convert the first row to User type
    // @ts-ignore - PostgreSQL driver returns rows as an array
    return result.rows[0] as User;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async listUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  // Static Page operations
  async getPage(id: number): Promise<Page | undefined> {
    const [page] = await db.select().from(pages).where(eq(pages.id, id));
    return page;
  }

  async getPageBySlug(slug: string): Promise<Page | undefined> {
    const [page] = await db.select().from(pages).where(eq(pages.slug, slug));
    return page;
  }

  async createPage(page: InsertPage): Promise<Page> {
    const [newPage] = await db.insert(pages).values(page).returning();
    return newPage;
  }

  async updatePage(id: number, page: Partial<InsertPage>): Promise<Page | undefined> {
    const [updatedPage] = await db.update(pages).set(page).where(eq(pages.id, id)).returning();
    return updatedPage;
  }

  async deletePage(id: number): Promise<boolean> {
    const result = await db.delete(pages).where(eq(pages.id, id));
    return true; // In PostgreSQL, the result doesn't contain affected rows count directly
  }

  async listPages(filters?: { isPublished?: boolean, showInHeader?: boolean, showInFooter?: boolean }): Promise<Page[]> {
    let query = db.select().from(pages);
    
    if (filters) {
      const conditions = [];
      if (filters.isPublished !== undefined) {
        conditions.push(eq(pages.isPublished, filters.isPublished));
      }
      if (filters.showInHeader !== undefined) {
        conditions.push(eq(pages.showInHeader, filters.showInHeader));
      }
      if (filters.showInFooter !== undefined) {
        conditions.push(eq(pages.showInFooter, filters.showInFooter));
      }
      
      if (conditions.length > 0) {
        for (const condition of conditions) {
          query = query.where(condition);
        }
      }
    }
    
    return await query;
  }

  // Category operations
  async getCategory(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category;
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.slug, slug));
    return category;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }

  async updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined> {
    const [updatedCategory] = await db.update(categories).set(category).where(eq(categories.id, id)).returning();
    return updatedCategory;
  }

  async deleteCategory(id: number): Promise<boolean> {
    await db.delete(categories).where(eq(categories.id, id));
    return true;
  }

  async listCategories(): Promise<Category[]> {
    try {
      // استخدم أمر SQL خام لتجنب مشكلة الحقول غير الموجودة
      // نتأكد من عدم طلب أعمدة غير موجودة
      const result = await db.execute(sql`SELECT id, name, description FROM categories`);
      
      // @ts-ignore - PostgreSQL driver returns rows as an array
      const categoriesList = (result.rows || []).map((category: any) => ({
        id: category.id,
        name: category.name,
        slug: category.name?.toLowerCase().replace(/\s+/g, '-') || '', // إنشاء slug من الاسم
        description: category.description,
        createdAt: new Date() // نستخدم التاريخ الحالي حيث أن عمود created_at غير موجود
      }));
      
      return categoriesList;
    } catch (error) {
      console.error('Error listing categories:', error);
      return [];
    }
  }

  // Level operations
  async getLevel(id: number): Promise<Level | undefined> {
    const [level] = await db.select().from(levels).where(eq(levels.id, id));
    return level;
  }

  async getLevelBySlug(slug: string): Promise<Level | undefined> {
    const [level] = await db.select().from(levels).where(eq(levels.slug, slug));
    return level;
  }

  async createLevel(level: InsertLevel): Promise<Level> {
    const [newLevel] = await db.insert(levels).values(level).returning();
    return newLevel;
  }

  async listLevels(): Promise<Level[]> {
    return await db.select().from(levels);
  }

  // Country operations
  async getCountry(id: number): Promise<Country | undefined> {
    const [country] = await db.select().from(countries).where(eq(countries.id, id));
    return country;
  }

  async getCountryBySlug(slug: string): Promise<Country | undefined> {
    const [country] = await db.select().from(countries).where(eq(countries.slug, slug));
    return country;
  }

  async createCountry(country: InsertCountry): Promise<Country> {
    const [newCountry] = await db.insert(countries).values(country).returning();
    return newCountry;
  }

  async listCountries(): Promise<Country[]> {
    return await db.select().from(countries);
  }

  // Scholarship operations
  async getScholarship(id: number): Promise<Scholarship | undefined> {
    const [scholarship] = await db.select().from(scholarships).where(eq(scholarships.id, id));
    return scholarship;
  }

  async getScholarshipBySlug(slug: string): Promise<Scholarship | undefined> {
    const [scholarship] = await db.select().from(scholarships).where(eq(scholarships.slug, slug));
    return scholarship;
  }

  async createScholarship(scholarship: InsertScholarship): Promise<Scholarship> {
    const [newScholarship] = await db.insert(scholarships).values(scholarship).returning();
    return newScholarship;
  }

  async updateScholarship(id: number, scholarship: Partial<InsertScholarship>): Promise<Scholarship | undefined> {
    const [updatedScholarship] = await db.update(scholarships).set(scholarship).where(eq(scholarships.id, id)).returning();
    return updatedScholarship;
  }

  async deleteScholarship(id: number): Promise<boolean> {
    await db.delete(scholarships).where(eq(scholarships.id, id));
    return true;
  }

  async listScholarships(filters?: { isFeatured?: boolean, countryId?: number, levelId?: number, categoryId?: number }): Promise<Scholarship[]> {
    let query = db.select().from(scholarships);
    
    if (filters) {
      const conditions = [];
      if (filters.isFeatured !== undefined) {
        conditions.push(eq(scholarships.isFeatured, filters.isFeatured));
      }
      if (filters.countryId !== undefined) {
        conditions.push(eq(scholarships.countryId, filters.countryId));
      }
      if (filters.levelId !== undefined) {
        conditions.push(eq(scholarships.levelId, filters.levelId));
      }
      if (filters.categoryId !== undefined) {
        conditions.push(eq(scholarships.categoryId, filters.categoryId));
      }
      
      if (conditions.length > 0) {
        for (const condition of conditions) {
          query = query.where(condition);
        }
      }
    }
    
    return await query;
  }

  // Post operations
  async getPost(id: number): Promise<Post | undefined> {
    const [post] = await db.select().from(posts).where(eq(posts.id, id));
    return post;
  }

  async getPostBySlug(slug: string): Promise<Post | undefined> {
    const [post] = await db.select().from(posts).where(eq(posts.slug, slug));
    return post;
  }

  async createPost(post: InsertPost): Promise<Post> {
    const [newPost] = await db.insert(posts).values(post).returning();
    return newPost;
  }

  async updatePost(id: number, post: Partial<InsertPost>): Promise<Post | undefined> {
    const [updatedPost] = await db.update(posts).set(post).where(eq(posts.id, id)).returning();
    return updatedPost;
  }

  async deletePost(id: number): Promise<boolean> {
    await db.delete(posts).where(eq(posts.id, id));
    return true;
  }

  async incrementPostViews(id: number): Promise<boolean> {
    // Note: views column doesn't exist in the actual table
    // This is a placeholder implementation since we can't track views in the DB
    const post = await this.getPost(id);
    if (!post) return false;
    
    // No actual increment is performed since the column doesn't exist
    return true;
  }

  async listPosts(filters?: { authorId?: number }): Promise<Post[]> {
    let query = db.select().from(posts);
    
    if (filters && filters.authorId !== undefined) {
      query = query.where(eq(posts.authorId, filters.authorId));
    }
    
    return await query.orderBy(desc(posts.createdAt));
  }

  // Tag operations
  async getTag(id: number): Promise<Tag | undefined> {
    const [tag] = await db.select().from(tags).where(eq(tags.id, id));
    return tag;
  }

  async getTagBySlug(slug: string): Promise<Tag | undefined> {
    const [tag] = await db.select().from(tags).where(eq(tags.slug, slug));
    return tag;
  }

  async createTag(tag: InsertTag): Promise<Tag> {
    const [newTag] = await db.insert(tags).values(tag).returning();
    return newTag;
  }

  async listTags(): Promise<Tag[]> {
    return await db.select().from(tags);
  }

  // Post-Tag operations
  async getPostTags(postId: number): Promise<Tag[]> {
    const result = await db.select({ tag: tags })
      .from(postTags)
      .leftJoin(tags, eq(postTags.tagId, tags.id))
      .where(eq(postTags.postId, postId));
    
    return result.map(r => r.tag);
  }

  async getTagPosts(tagId: number): Promise<Post[]> {
    const result = await db.select({ post: posts })
      .from(postTags)
      .leftJoin(posts, eq(postTags.postId, posts.id))
      .where(eq(postTags.tagId, tagId));
    
    return result.map(r => r.post);
  }

  async addTagToPost(postId: number, tagId: number): Promise<PostTag> {
    const [result] = await db.insert(postTags)
      .values({ postId, tagId })
      .returning();
    
    return result;
  }

  async removeTagFromPost(postId: number, tagId: number): Promise<boolean> {
    await db.delete(postTags)
      .where(and(eq(postTags.postId, postId), eq(postTags.tagId, tagId)));
    
    return true;
  }

  // Success Story operations
  async getSuccessStory(id: number): Promise<SuccessStory | undefined> {
    const [story] = await db.select().from(successStories).where(eq(successStories.id, id));
    return story;
  }

  async getSuccessStoryBySlug(slug: string): Promise<SuccessStory | undefined> {
    const [story] = await db.select().from(successStories).where(eq(successStories.slug, slug));
    return story;
  }

  async createSuccessStory(story: InsertSuccessStory): Promise<SuccessStory> {
    const [newStory] = await db.insert(successStories).values(story).returning();
    return newStory;
  }

  async updateSuccessStory(id: number, story: Partial<InsertSuccessStory>): Promise<SuccessStory | undefined> {
    const [updatedStory] = await db.update(successStories).set(story).where(eq(successStories.id, id)).returning();
    return updatedStory;
  }

  async deleteSuccessStory(id: number): Promise<boolean> {
    await db.delete(successStories).where(eq(successStories.id, id));
    return true;
  }

  async listSuccessStories(): Promise<SuccessStory[]> {
    return await db.select().from(successStories);
  }

  // Newsletter subscriber operations
  async getSubscriber(id: number): Promise<Subscriber | undefined> {
    const [subscriber] = await db.select().from(subscribers).where(eq(subscribers.id, id));
    return subscriber;
  }

  async getSubscriberByEmail(email: string): Promise<Subscriber | undefined> {
    const [subscriber] = await db.select().from(subscribers).where(eq(subscribers.email, email));
    return subscriber;
  }

  async createSubscriber(subscriber: InsertSubscriber): Promise<Subscriber> {
    const [newSubscriber] = await db.insert(subscribers).values(subscriber).returning();
    return newSubscriber;
  }

  async listSubscribers(): Promise<Subscriber[]> {
    return await db.select().from(subscribers);
  }

  // SEO settings operations
  async getSeoSetting(id: number): Promise<SeoSetting | undefined> {
    const [seoSetting] = await db.select().from(seoSettings).where(eq(seoSettings.id, id));
    return seoSetting;
  }

  async getSeoSettingByPath(pagePath: string): Promise<SeoSetting | undefined> {
    const [seoSetting] = await db.select().from(seoSettings).where(eq(seoSettings.pagePath, pagePath));
    return seoSetting;
  }

  async createSeoSetting(seoSetting: InsertSeoSetting): Promise<SeoSetting> {
    const [newSeoSetting] = await db.insert(seoSettings).values(seoSetting).returning();
    return newSeoSetting;
  }

  async updateSeoSetting(id: number, seoSetting: Partial<InsertSeoSetting>): Promise<SeoSetting | undefined> {
    const [updatedSeoSetting] = await db.update(seoSettings).set(seoSetting).where(eq(seoSettings.id, id)).returning();
    return updatedSeoSetting;
  }

  async listSeoSettings(): Promise<SeoSetting[]> {
    return await db.select().from(seoSettings);
  }

  // Site settings operations
  async getSiteSettings(): Promise<SiteSetting | undefined> {
    try {
      // Use raw query to get the site settings, since schema and actual table structure might differ
      const result = await db.execute(sql`SELECT * FROM site_settings LIMIT 1`);
      // @ts-ignore - PostgreSQL driver returns rows as an array
      if (result.rows && result.rows.length === 0) return undefined;
      
      // Map DB fields to our schema
      // @ts-ignore - PostgreSQL driver returns rows as an array
      const dbSettings = result.rows[0];
      
      console.log('DB settings raw from PostgreSQL:', dbSettings);
      
      // تحويل قيم البوليان من PostgreSQL ('t'/'f') إلى قيم JavaScript (true/false)
      // تحسين دالة تحويل القيم البوليانية من PostgreSQL إلى جافاسكربت
      const convertPostgresBooleanToJs = (value: any): boolean | null => {
        // سجل القيمة المستلمة ونوعها للتشخيص
        console.log(`Converting boolean value: ${value}, type: ${typeof value}`);
        
        // التحقق من القيم النصية الممثلة للبوليان
        if (value === 't' || value === 'true' || value === true || value === 1 || value === '1') {
          console.log(`  -> converted to TRUE`);
          return true;
        }
        
        if (value === 'f' || value === 'false' || value === false || value === 0 || value === '0') {
          console.log(`  -> converted to FALSE`);
          return false;
        }
        
        // إذا كانت القيمة ليست محددة أو null
        console.log(`  -> no match, returning null`);
        return null;
      };
      
      // Create a settings object with required fields from the schema
      // Adding null/default values for missing columns
      const settings: any = {
        id: dbSettings.id,
        siteName: dbSettings.site_name,
        siteTagline: dbSettings.site_tagline || null,
        siteDescription: dbSettings.site_description || null,
        favicon: dbSettings.favicon || null,
        logo: dbSettings.logo || null,
        logoDark: dbSettings.logo_dark || null,
        email: dbSettings.email || null,
        phone: dbSettings.phone || null,
        whatsapp: dbSettings.whatsapp || null,
        address: dbSettings.address || null,
        facebook: dbSettings.facebook || null,
        twitter: dbSettings.twitter || null,
        instagram: dbSettings.instagram || null,
        youtube: dbSettings.youtube || null,
        linkedin: dbSettings.linkedin || null,
        primaryColor: dbSettings.primary_color || null,
        secondaryColor: dbSettings.secondary_color || null,
        accentColor: dbSettings.accent_color || null,
        enableDarkMode: convertPostgresBooleanToJs(dbSettings.enable_dark_mode),
        rtlDirection: convertPostgresBooleanToJs(dbSettings.rtl_direction),
        defaultLanguage: dbSettings.default_language || null,
        enableNewsletter: convertPostgresBooleanToJs(dbSettings.enable_newsletter),
        enableScholarshipSearch: convertPostgresBooleanToJs(dbSettings.enable_scholarship_search),
        footerText: dbSettings.footer_text || null,
        
        // إضافة جميع حقول إظهار/إخفاء الأقسام مع تحويل قيمها البوليانية
        showHeroSection: convertPostgresBooleanToJs(dbSettings.show_hero_section),
        showFeaturedScholarships: convertPostgresBooleanToJs(dbSettings.show_featured_scholarships),
        showSearchSection: convertPostgresBooleanToJs(dbSettings.show_search_section),
        showCategoriesSection: convertPostgresBooleanToJs(dbSettings.show_categories_section),
        showCountriesSection: convertPostgresBooleanToJs(dbSettings.show_countries_section),
        showLatestArticles: convertPostgresBooleanToJs(dbSettings.show_latest_articles),
        showSuccessStories: convertPostgresBooleanToJs(dbSettings.show_success_stories),
        showNewsletterSection: convertPostgresBooleanToJs(dbSettings.show_newsletter_section),
        showStatisticsSection: convertPostgresBooleanToJs(dbSettings.show_statistics_section),
        showPartnersSection: convertPostgresBooleanToJs(dbSettings.show_partners_section),
        
        // عناوين وأوصاف الأقسام
        heroTitle: dbSettings.hero_title || null,
        heroSubtitle: dbSettings.hero_subtitle || null,
        heroDescription: dbSettings.hero_description || null,
        featuredScholarshipsTitle: dbSettings.featured_scholarships_title || null,
        featuredScholarshipsDescription: dbSettings.featured_scholarships_description || null,
        categoriesSectionTitle: dbSettings.categories_section_title || null,
        categoriesSectionDescription: dbSettings.categories_section_description || null,
        countriesSectionTitle: dbSettings.countries_section_title || null,
        countriesSectionDescription: dbSettings.countries_section_description || null,
        latestArticlesTitle: dbSettings.latest_articles_title || null,
        latestArticlesDescription: dbSettings.latest_articles_description || null,
        successStoriesTitle: dbSettings.success_stories_title || null,
        successStoriesDescription: dbSettings.success_stories_description || null,
        newsletterSectionTitle: dbSettings.newsletter_section_title || null,
        newsletterSectionDescription: dbSettings.newsletter_section_description || null,
        statisticsSectionTitle: dbSettings.statistics_section_title || null,
        statisticsSectionDescription: dbSettings.statistics_section_description || null,
        partnersSectionTitle: dbSettings.partners_section_title || null,
        partnersSectionDescription: dbSettings.partners_section_description || null,
        
        // تخطيط الصفحات
        homePageLayout: dbSettings.home_page_layout || 'default',
        scholarshipPageLayout: dbSettings.scholarship_page_layout || 'default',
        articlePageLayout: dbSettings.article_page_layout || 'default',
        
        // حقول أخرى
        customCss: dbSettings.custom_css || null
      };
      
      console.log('Processed site settings:', settings);
      
      return settings as SiteSetting;
    } catch (error) {
      console.error('Error getting site settings, table might not exist:', error);
      return undefined;
    }
    
    // تحويل قيم البوليان من PostgreSQL ('t'/'f') إلى قيم JavaScript (true/false)
    // تحسين دالة تحويل القيم البوليانية من PostgreSQL إلى جافاسكربت
    const convertPostgresBooleanToJs = (value: any): boolean | null => {
      // سجل القيمة المستلمة ونوعها للتشخيص
      console.log(`Converting boolean value: ${value}, type: ${typeof value}`);
      
      // التحقق من القيم النصية الممثلة للبوليان
      if (value === 't' || value === 'true' || value === true || value === 1 || value === '1') {
        console.log(`  -> converted to TRUE`);
        return true;
      }
      
      if (value === 'f' || value === 'false' || value === false || value === 0 || value === '0') {
        console.log(`  -> converted to FALSE`);
        return false;
      }
      
      // إذا كانت القيمة ليست محددة أو null
      console.log(`  -> no match, returning null`);
      return null;
    };
  }

  async updateSiteSettings(settings: Partial<InsertSiteSetting>): Promise<SiteSetting> {
    console.log("DB storage: updating site settings:", JSON.stringify(settings, null, 2));
    
    // Check if there's any site settings record
    const existingSettings = await this.getSiteSettings();
    console.log("DB storage: existing settings:", existingSettings ? JSON.stringify(existingSettings, null, 2) : "None");
    
    try {
      // معالجة البيانات بتنظيفها للتأكد من تناسبها مع هيكل قاعدة البيانات
      const cleanedSettings: any = { ...settings };
      
      // تحويل القيم الفارغة (سلاسل فارغة) إلى null لأن قاعدة البيانات تتوقع ذلك
      Object.keys(cleanedSettings).forEach(key => {
        if (cleanedSettings[key] === '') {
          cleanedSettings[key] = null;
        }
      });
      
      // تحويل القيم البوليانية من قيم جافاسكربت إلى صيغ PostgreSQL
      // حيث أن أي مفتاح يبدأ بـ "show" أو "enable" هو في الأغلب قيمة بوليانية
      Object.keys(cleanedSettings).forEach(key => {
        // صيغة البيانات النموذجية للقيم البوليانية
        if (key.startsWith('show') || key.startsWith('enable')) {
          console.log(`Checking boolean field ${key}: ${cleanedSettings[key]}, type: ${typeof cleanedSettings[key]}`);

          // التأكد من أن القيمة بوليانية (true/false) وليست نصية ('true'/'false')
          // تحويل صريح لضمان الاتساق
          if (typeof cleanedSettings[key] === 'string') {
            // تحويل النص إلى بوليان
            const stringValue = cleanedSettings[key] as string;
            cleanedSettings[key] = stringValue === 'true' || stringValue === 't' || stringValue === '1';
            console.log(`Converted string to boolean for ${key}: ${stringValue} -> ${cleanedSettings[key]}`);
          }
          
          // للتدقيق: طباعة القيمة النهائية
          console.log(`Final boolean value for ${key}: ${cleanedSettings[key]}, type: ${typeof cleanedSettings[key]}`);
        }
      });

      // طباعة قيمة حقل showFeaturedScholarships للتحقق منه تحديداً
      if ('showFeaturedScholarships' in cleanedSettings) {
        console.log(`Special check for showFeaturedScholarships: ${cleanedSettings.showFeaturedScholarships}, type: ${typeof cleanedSettings.showFeaturedScholarships}`);
      }
      
      console.log("DB storage: cleaned settings:", JSON.stringify(cleanedSettings, null, 2));
      
      // تحويل أسماء الحقول من نمط camelCase إلى نمط snake_case المستخدم في قاعدة البيانات
      const dbSettings: any = {};
      Object.keys(cleanedSettings).forEach(key => {
        // تحويل كل حرف كبير في السلسلة إلى "_" متبوعًا بالحرف نفسه بحروف صغيرة
        const dbKey = key.replace(/([A-Z])/g, "_$1").toLowerCase();
        dbSettings[dbKey] = cleanedSettings[key];
      });
      
      console.log("DB storage: settings converted to snake_case:", JSON.stringify(dbSettings, null, 2));
      
      try {
        if (existingSettings) {
          console.log("DB storage: updating existing settings with ID:", existingSettings.id);
          // استخدام طريقة تحديث أكثر وضوحاً مع drizzle
          // نظيف إشارة SQL بشكل صريح لمنع اختلافات أسماء الأعمدة
          // ونستخدم درزل بشكل أكثر صراحة في التعامل مع القيم البوليانية
          
          // إنشاء جزء SET من استعلام التحديث بشكل ديناميكي وأكثر وضوحاً
          // عدم استخدام .set بالكامل لأن هناك احتمال أن تكون بعض الحقول غير موجودة في الجدول
          console.log("DB storage: cleaning up dbSettings before update");
          
          // حذف الخصائص التي ليست جزءًا من الجدول لتجنب أخطاء SQL
          const knownColumns = [
            // الحقول الأساسية
            'site_name', 'site_tagline', 'site_description', 'favicon', 'logo', 'logo_dark',
            'email', 'phone', 'whatsapp', 'address', 'facebook', 'twitter', 'instagram',
            'youtube', 'linkedin', 'primary_color', 'secondary_color', 'accent_color',
            'enable_dark_mode', 'rtl_direction', 'default_language', 'enable_newsletter',
            'enable_scholarship_search', 'footer_text',
            
            // حقول إظهار/إخفاء الأقسام
            'show_hero_section',
            'show_featured_scholarships', 'show_search_section', 'show_categories_section',
            'show_countries_section', 'show_latest_articles', 'show_success_stories',
            'show_newsletter_section', 'show_statistics_section', 'show_partners_section',
            
            // عناوين وأوصاف الأقسام
            'hero_title', 'hero_subtitle', 'hero_description',
            'featured_scholarships_title', 'featured_scholarships_description',
            'categories_section_title', 'categories_section_description',
            'countries_section_title', 'countries_section_description',
            'latest_articles_title', 'latest_articles_description',
            'success_stories_title', 'success_stories_description',
            'newsletter_section_title', 'newsletter_section_description',
            'statistics_section_title', 'statistics_section_description',
            'partners_section_title', 'partners_section_description',
            
            // تخطيط الصفحات
            'home_page_layout', 'scholarship_page_layout', 'article_page_layout',
            
            // أخرى
            'custom_css'
          ];
          
          const validDbSettings: Record<string, any> = {};
          for (const key of Object.keys(dbSettings)) {
            if (knownColumns.includes(key)) {
              // طباعة قيمة كل حقل بوليان للتأكد من تحويله بشكل صحيح
              if (key === 'show_featured_scholarships') {
                console.log(`Final DB value for ${key} before SQL: ${dbSettings[key]}, type: ${typeof dbSettings[key]}`);
              }
              validDbSettings[key] = dbSettings[key];
            }
          }
          
          // إضافة سجل خاص لقيمة showFeaturedScholarships الناتجة
          console.log(`show_featured_scholarships in validDbSettings: ${validDbSettings['show_featured_scholarships']}, type: ${typeof validDbSettings['show_featured_scholarships']}`);
          
          // طباعة استعلام SQL للتدقيق
          const settingsObj = JSON.stringify(validDbSettings, null, 2);
          console.log(`Updating settings with: ${settingsObj}`);
          
          // استخدام أسلوب تحديث صريح
          // السبب في المشكلة: يجب استخدام الطريقة الصحيحة للتحديث في drizzle
          // استخدام طريقة drizzle للتحديث بدلاً من SQL المخصص
          console.log("Using raw SQL instead of drizzle");
          
          // بناء قائمة الأعمدة والقيم للتحديث
          const columns = Object.keys(validDbSettings);
          const values = columns.map(col => validDbSettings[col]);
          
          // تحويل القيم البوليانية إلى نصوص 'TRUE' أو 'FALSE' للتوافق مع SQL
          const formattedValues = values.map(value => {
            if (typeof value === 'boolean') {
              console.log(`Converting boolean value: ${value}, type: ${typeof value}`);
              return value ? 'TRUE' : 'FALSE';
            }
            if (value === null) {
              return 'NULL';
            }
            if (typeof value === 'string') {
              // تهريب الاقتباسات المزدوجة داخل السلاسل النصية
              return `'${value.replace(/'/g, "''")}'`;
            }
            return value;
          });
          
          // بناء جزء الـ SET من استعلام SQL
          const setParts = columns.map((col, index) => 
            `${col} = ${formattedValues[index]}`
          );
          
          // بناء الاستعلام الكامل
          const sqlQuery = `
            UPDATE site_settings 
            SET ${setParts.join(', ')} 
            WHERE id = ${existingSettings.id} 
            RETURNING *
          `;
          
          console.log("SQL Query:", sqlQuery);
          
          // تنفيذ الاستعلام المخصص
          const result = await db.execute(sql.raw(sqlQuery));
          console.log("Update complete");
          
          console.log("DB storage: site settings updated successfully");
        } else {
          console.log("DB storage: inserting new settings");
          // Use drizzle's insert method
          await db.insert(siteSettings).values(dbSettings);
          console.log("DB storage: site settings inserted successfully");
        }
      } catch (error) {
        console.error("DB storage: error in SQL operation:", error);
        throw error;
      }
      
      // Fetch the updated settings
      const updatedSettings = await this.getSiteSettings();
      console.log("DB storage: settings after update:", JSON.stringify(updatedSettings, null, 2));
      
      return updatedSettings as SiteSetting;
    } catch (error) {
      console.error("DB storage: error updating site settings:", error);
      throw error;
    }
  }

  // Analytics operations - simplified implementations
  async getVisitStats(period?: string): Promise<any> {
    // This would typically involve querying analytics data from a dedicated table
    // For now returning mock data
    return {
      visits: 1000,
      uniqueVisitors: 800,
      pageViews: 2500,
      period: period || 'month'
    };
  }

  async getPostStats(): Promise<any> {
    const totalPosts = await db.select({ count: sql<number>`count(*)` }).from(posts);
    return {
      total: totalPosts[0].count,
      popular: await db.select().from(posts).orderBy(desc(posts.createdAt)).limit(5)
    };
  }

  async getScholarshipStats(): Promise<any> {
    const totalScholarships = await db.select({ count: sql<number>`count(*)` }).from(scholarships);
    const featuredCount = await db.select({ count: sql<number>`count(*)` })
      .from(scholarships)
      .where(eq(scholarships.isFeatured, true));
    
    return {
      total: totalScholarships[0].count,
      featured: featuredCount[0].count
    };
  }

  async getTrafficSources(): Promise<any> {
    // Mock data for traffic sources
    return [
      { source: 'Direct', percentage: 40 },
      { source: 'Social Media', percentage: 25 },
      { source: 'Search Engines', percentage: 20 },
      { source: 'Referrals', percentage: 15 }
    ];
  }

  async getTopContent(type: string = 'all', limit: number = 5): Promise<any> {
    if (type === 'posts' || type === 'all') {
      const topPosts = await db.select().from(posts).orderBy(desc(posts.createdAt)).limit(limit);
      return { posts: topPosts };
    } else if (type === 'scholarships') {
      const topScholarships = await db.select().from(scholarships).limit(limit);
      return { scholarships: topScholarships };
    }
    
    return {};
  }

  // Menu operations
  async getMenu(id: number): Promise<Menu | undefined> {
    const [menu] = await db.select().from(menus).where(eq(menus.id, id));
    return menu;
  }

  async getMenuBySlug(slug: string): Promise<Menu | undefined> {
    const [menu] = await db.select().from(menus).where(eq(menus.slug, slug));
    return menu;
  }

  async getMenuByLocation(location: string): Promise<Menu | undefined> {
    const [menu] = await db.select().from(menus)
      .where(and(
        eq(menus.location, location as any),
        eq(menus.isActive, true)
      ));
    return menu;
  }

  async createMenu(menu: InsertMenu): Promise<Menu> {
    const [newMenu] = await db.insert(menus).values(menu).returning();
    return newMenu;
  }

  async updateMenu(id: number, menu: Partial<InsertMenu>): Promise<Menu | undefined> {
    const [updatedMenu] = await db.update(menus).set(menu).where(eq(menus.id, id)).returning();
    return updatedMenu;
  }

  async deleteMenu(id: number): Promise<boolean> {
    await db.delete(menus).where(eq(menus.id, id));
    return true;
  }

  async listMenus(): Promise<Menu[]> {
    return await db.select().from(menus);
  }

  // Menu Item operations
  async getMenuItem(id: number): Promise<MenuItem | undefined> {
    const [menuItem] = await db.select().from(menuItems).where(eq(menuItems.id, id));
    return menuItem;
  }

  async createMenuItem(item: InsertMenuItem): Promise<MenuItem> {
    const [newItem] = await db.insert(menuItems).values(item).returning();
    return newItem;
  }

  async updateMenuItem(id: number, item: Partial<InsertMenuItem>): Promise<MenuItem | undefined> {
    const [updatedItem] = await db.update(menuItems).set(item).where(eq(menuItems.id, id)).returning();
    return updatedItem;
  }

  async deleteMenuItem(id: number): Promise<boolean> {
    await db.delete(menuItems).where(eq(menuItems.id, id));
    return true;
  }

  async listMenuItems(menuId: number, parentId?: number | null): Promise<MenuItem[]> {
    let query = db.select().from(menuItems)
      .where(eq(menuItems.menuId, menuId))
      .orderBy(menuItems.order);
    
    if (parentId !== undefined) {
      if (parentId === null) {
        query = query.where(sql`${menuItems.parentId} IS NULL`);
      } else {
        query = query.where(eq(menuItems.parentId, parentId));
      }
    }
    
    return await query;
  }

  async getAllMenuItemsWithDetails(menuId: number): Promise<any[]> {
    // Get basic menu items
    const items = await this.listMenuItems(menuId);
    const enrichedItems = [];
    
    // Enrich each menu item with its related entity details
    for (const item of items) {
      const enrichedItem = { ...item, entity: null };
      
      switch (item.type) {
        case 'page':
          if (item.pageId) {
            enrichedItem.entity = await this.getPage(item.pageId);
          }
          break;
        case 'category':
          if (item.categoryId) {
            enrichedItem.entity = await this.getCategory(item.categoryId);
          }
          break;
        case 'level':
          if (item.levelId) {
            enrichedItem.entity = await this.getLevel(item.levelId);
          }
          break;
        case 'country':
          if (item.countryId) {
            enrichedItem.entity = await this.getCountry(item.countryId);
          }
          break;
        case 'scholarship':
          if (item.scholarshipId) {
            enrichedItem.entity = await this.getScholarship(item.scholarshipId);
          }
          break;
        case 'post':
          if (item.postId) {
            enrichedItem.entity = await this.getPost(item.postId);
          }
          break;
      }
      
      // If this item has children, get them recursively
      if (item.id) {
        const children = await this.listMenuItems(menuId, item.id);
        if (children.length > 0) {
          enrichedItem.children = children;
        }
      }
      
      enrichedItems.push(enrichedItem);
    }
    
    return enrichedItems;
  }

  // Removed duplicated getMenuStructure method - using the one defined earlier
}