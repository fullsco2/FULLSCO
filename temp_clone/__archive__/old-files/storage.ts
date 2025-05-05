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
import { db } from "./db";
import { eq, and, count, sql } from "drizzle-orm";
import { DatabaseStorage } from "./db-storage";

// Storage interface
export interface IStorage {
  // Media operations
  getMediaFile(id: number): Promise<MediaFile | undefined>;
  createMediaFile(mediaFile: InsertMediaFile): Promise<MediaFile>;
  updateMediaFile(id: number, mediaFile: Partial<InsertMediaFile>): Promise<MediaFile | undefined>;
  deleteMediaFile(id: number): Promise<boolean>;
  listMediaFiles(filters?: { mimeType?: string }): Promise<MediaFile[]>;
  bulkDeleteMediaFiles(ids: number[]): Promise<boolean>;
  
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  listUsers(): Promise<User[]>;
  
  // Static Page operations
  getPage(id: number): Promise<Page | undefined>;
  getPageBySlug(slug: string): Promise<Page | undefined>;
  createPage(page: InsertPage): Promise<Page>;
  updatePage(id: number, page: Partial<InsertPage>): Promise<Page | undefined>;
  deletePage(id: number): Promise<boolean>;
  listPages(filters?: { isPublished?: boolean, showInHeader?: boolean, showInFooter?: boolean }): Promise<Page[]>;

  // Category operations
  getCategory(id: number): Promise<Category | undefined>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: number): Promise<boolean>;
  listCategories(): Promise<Category[]>;

  // Level operations
  getLevel(id: number): Promise<Level | undefined>;
  getLevelBySlug(slug: string): Promise<Level | undefined>;
  createLevel(level: InsertLevel): Promise<Level>;
  listLevels(): Promise<Level[]>;

  // Country operations
  getCountry(id: number): Promise<Country | undefined>;
  getCountryBySlug(slug: string): Promise<Country | undefined>;
  createCountry(country: InsertCountry): Promise<Country>;
  listCountries(): Promise<Country[]>;

  // Scholarship operations
  getScholarship(id: number): Promise<Scholarship | undefined>;
  getScholarshipBySlug(slug: string): Promise<Scholarship | undefined>;
  createScholarship(scholarship: InsertScholarship): Promise<Scholarship>;
  updateScholarship(id: number, scholarship: Partial<InsertScholarship>): Promise<Scholarship | undefined>;
  deleteScholarship(id: number): Promise<boolean>;
  listScholarships(filters?: { isFeatured?: boolean, countryId?: number, levelId?: number, categoryId?: number }): Promise<Scholarship[]>;

  // Post operations
  getPost(id: number): Promise<Post | undefined>;
  getPostBySlug(slug: string): Promise<Post | undefined>;
  createPost(post: InsertPost): Promise<Post>;
  updatePost(id: number, post: Partial<InsertPost>): Promise<Post | undefined>;
  deletePost(id: number): Promise<boolean>;
  incrementPostViews(id: number): Promise<boolean>;
  listPosts(filters?: { isFeatured?: boolean, authorId?: number }): Promise<Post[]>;

  // Tag operations
  getTag(id: number): Promise<Tag | undefined>;
  getTagBySlug(slug: string): Promise<Tag | undefined>;
  createTag(tag: InsertTag): Promise<Tag>;
  listTags(): Promise<Tag[]>;

  // Post-Tag operations
  getPostTags(postId: number): Promise<Tag[]>;
  getTagPosts(tagId: number): Promise<Post[]>;
  addTagToPost(postId: number, tagId: number): Promise<PostTag>;
  removeTagFromPost(postId: number, tagId: number): Promise<boolean>;

  // Success Story operations
  getSuccessStory(id: number): Promise<SuccessStory | undefined>;
  getSuccessStoryBySlug(slug: string): Promise<SuccessStory | undefined>;
  createSuccessStory(story: InsertSuccessStory): Promise<SuccessStory>;
  updateSuccessStory(id: number, story: Partial<InsertSuccessStory>): Promise<SuccessStory | undefined>;
  deleteSuccessStory(id: number): Promise<boolean>;
  listSuccessStories(): Promise<SuccessStory[]>;

  // Newsletter subscriber operations
  getSubscriber(id: number): Promise<Subscriber | undefined>;
  getSubscriberByEmail(email: string): Promise<Subscriber | undefined>;
  createSubscriber(subscriber: InsertSubscriber): Promise<Subscriber>;
  listSubscribers(): Promise<Subscriber[]>;

  // SEO settings operations
  getSeoSetting(id: number): Promise<SeoSetting | undefined>;
  getSeoSettingByPath(pagePath: string): Promise<SeoSetting | undefined>;
  createSeoSetting(seoSetting: InsertSeoSetting): Promise<SeoSetting>;
  updateSeoSetting(id: number, seoSetting: Partial<InsertSeoSetting>): Promise<SeoSetting | undefined>;
  listSeoSettings(): Promise<SeoSetting[]>;
  
  // Site settings operations
  getSiteSettings(): Promise<SiteSetting | undefined>;
  updateSiteSettings(settings: Partial<InsertSiteSetting>): Promise<SiteSetting>;

  // Analytics operations
  getVisitStats(period?: string): Promise<any>;
  getPostStats(): Promise<any>;
  getScholarshipStats(): Promise<any>;
  getTrafficSources(): Promise<any>;
  getTopContent(type?: string, limit?: number): Promise<any>;
  
  // Menu operations
  getMenu(id: number): Promise<Menu | undefined>;
  getMenuBySlug(slug: string): Promise<Menu | undefined>;
  getMenuByLocation(location: string): Promise<Menu | undefined>;
  createMenu(menu: InsertMenu): Promise<Menu>;
  updateMenu(id: number, menu: Partial<InsertMenu>): Promise<Menu | undefined>;
  deleteMenu(id: number): Promise<boolean>;
  listMenus(): Promise<Menu[]>;
  
  // Menu Item operations
  getMenuItem(id: number): Promise<MenuItem | undefined>;
  createMenuItem(item: InsertMenuItem): Promise<MenuItem>;
  updateMenuItem(id: number, item: Partial<InsertMenuItem>): Promise<MenuItem | undefined>;
  deleteMenuItem(id: number): Promise<boolean>;
  listMenuItems(menuId: number, parentId?: number | null): Promise<MenuItem[]>;
  getAllMenuItemsWithDetails(menuId: number): Promise<any[]>;
  getMenuStructure(location: string): Promise<any>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private categories: Map<number, Category>;
  private mediaFiles: Map<number, MediaFile>;
  private levels: Map<number, Level>;
  private countries: Map<number, Country>;
  private scholarships: Map<number, Scholarship>;
  private posts: Map<number, Post>;
  private tags: Map<number, Tag>;
  private postTags: Map<number, PostTag>;
  private successStories: Map<number, SuccessStory>;
  private subscribers: Map<number, Subscriber>;
  private seoSettings: Map<number, SeoSetting>;
  private siteSettings: SiteSetting | undefined;
  private pages: Map<number, Page>;
  private menus: Map<number, Menu>;
  private menuItems: Map<number, MenuItem>;
  private currentIds: {
    users: number;
    categories: number;
    levels: number;
    countries: number;
    scholarships: number;
    posts: number;
    tags: number;
    postTags: number;
    successStories: number;
    subscribers: number;
    seoSettings: number;
    siteSettings: number;
    pages: number;
    mediaFiles: number;
    menus: number;
    menuItems: number;
  };

  constructor() {
    // Initialize maps
    this.users = new Map();
    this.categories = new Map();
    this.levels = new Map();
    this.countries = new Map();
    this.scholarships = new Map();
    this.posts = new Map();
    this.tags = new Map();
    this.postTags = new Map();
    this.successStories = new Map();
    this.subscribers = new Map();
    this.seoSettings = new Map();
    this.pages = new Map();
    this.mediaFiles = new Map();
    this.menus = new Map();
    this.menuItems = new Map();

    // Initialize IDs
    this.currentIds = {
      users: 1,
      categories: 1,
      levels: 1,
      countries: 1,
      scholarships: 1,
      posts: 1,
      tags: 1,
      postTags: 1,
      successStories: 1,
      subscribers: 1,
      seoSettings: 1,
      siteSettings: 1,
      pages: 1,
      mediaFiles: 1,
      menus: 1,
      menuItems: 1
    };

    // Seed initial data
    this.seedInitialData();
  }

  // Media file operations
  async getMediaFile(id: number): Promise<MediaFile | undefined> {
    return this.mediaFiles.get(id);
  }

  async createMediaFile(data: InsertMediaFile): Promise<MediaFile> {
    const id = this.currentIds.mediaFiles++;
    const now = new Date();
    const mediaFile: MediaFile = {
      id,
      name: data.name,
      url: data.url,
      mimeType: data.mimeType,
      size: data.size,
      width: data.width || null,
      height: data.height || null,
      alt: data.alt || null,
      createdAt: now,
      updatedAt: now
    };
    this.mediaFiles.set(id, mediaFile);
    return mediaFile;
  }

  async updateMediaFile(id: number, data: Partial<InsertMediaFile>): Promise<MediaFile | undefined> {
    const mediaFile = this.mediaFiles.get(id);
    if (!mediaFile) {
      return undefined;
    }
    
    const updatedMediaFile: MediaFile = {
      ...mediaFile,
      ...data,
      updatedAt: new Date()
    };
    
    this.mediaFiles.set(id, updatedMediaFile);
    return updatedMediaFile;
  }

  async deleteMediaFile(id: number): Promise<boolean> {
    return this.mediaFiles.delete(id);
  }

  async listMediaFiles(filters?: { mimeType?: string }): Promise<MediaFile[]> {
    let mediaFiles = Array.from(this.mediaFiles.values());
    
    if (filters?.mimeType) {
      mediaFiles = mediaFiles.filter(file => file.mimeType === filters.mimeType);
    }
    
    return mediaFiles;
  }

  async bulkDeleteMediaFiles(ids: number[]): Promise<boolean> {
    for (const id of ids) {
      this.mediaFiles.delete(id);
    }
    return true;
  }

  private seedInitialData() {
    // Seed admin user
    this.createUser({
      username: "admin",
      password: "admin123",
      email: "admin@fullsco.com",
      fullName: "Admin User",
      role: "admin"
    });

    // Seed categories
    const categories = [
      { name: "Undergraduate", slug: "undergraduate", description: "Scholarships for undergraduate students" },
      { name: "Masters", slug: "masters", description: "Scholarships for master's degree students" },
      { name: "PhD", slug: "phd", description: "Scholarships for doctoral students" },
      { name: "Research", slug: "research", description: "Scholarships for research programs" }
    ];
    for (const category of categories) {
      this.createCategory(category);
    }

    // Seed levels
    const levels = [
      { name: "Bachelor", slug: "bachelor" },
      { name: "Masters", slug: "masters" },
      { name: "PhD", slug: "phd" }
    ];
    for (const level of levels) {
      this.createLevel(level);
    }

    // Seed countries
    const countries = [
      { name: "USA", slug: "usa" },
      { name: "UK", slug: "uk" },
      { name: "Germany", slug: "germany" },
      { name: "Canada", slug: "canada" },
      { name: "Australia", slug: "australia" }
    ];
    for (const country of countries) {
      this.createCountry(country);
    }

    // Seed scholarships
    const scholarships = [
      {
        title: "Fulbright Scholarship Program",
        slug: "fulbright-scholarship-program",
        description: "The Fulbright Program offers grants for U.S. citizens to study, research, or teach English abroad and for non-U.S. citizens to study in the United States.",
        deadline: "June 30, 2023",
        amount: "$40,000/year",
        isFeatured: true,
        isFullyFunded: true,
        countryId: 1, // USA
        levelId: 2, // Masters
        categoryId: 2, // Masters
        requirements: "Academic excellence, leadership qualities, research proposal",
        applicationLink: "https://foreign.fulbrightonline.org/",
        imageUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1"
      },
      {
        title: "Chevening Scholarships",
        slug: "chevening-scholarships",
        description: "Chevening is the UK government's international scholarships program funded by the Foreign, Commonwealth and Development Office and partner organizations.",
        deadline: "November 2, 2023",
        amount: "Full tuition + stipend",
        isFeatured: true,
        isFullyFunded: true,
        countryId: 2, // UK
        levelId: 2, // Masters
        categoryId: 2, // Masters
        requirements: "Leadership potential, minimum 2 years work experience",
        applicationLink: "https://www.chevening.org/",
        imageUrl: "https://images.unsplash.com/photo-1605007493699-af65834f8a00"
      },
      {
        title: "DAAD Scholarships",
        slug: "daad-scholarships",
        description: "The German Academic Exchange Service (DAAD) offers scholarships for international students to study at German universities across various academic levels.",
        deadline: "October 15, 2023",
        amount: "€850-1,200/month",
        isFeatured: true,
        isFullyFunded: true,
        countryId: 3, // Germany
        levelId: 3, // PhD
        categoryId: 3, // PhD
        requirements: "Academic excellence, research proposal",
        applicationLink: "https://www.daad.de/en/",
        imageUrl: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f"
      }
    ];
    for (const scholarship of scholarships) {
      this.createScholarship(scholarship);
    }

    // Seed articles/posts
    const posts = [
      {
        title: "How to Write a Winning Scholarship Essay",
        slug: "how-to-write-winning-scholarship-essay",
        content: "Learn the essential tips and strategies for crafting a compelling scholarship essay that will set you apart from other applicants and increase your chances of winning.",
        excerpt: "Learn the essential tips and strategies for crafting a compelling scholarship essay that will set you apart from other applicants and increase your chances of winning.",
        authorId: 1,
        imageUrl: "https://images.unsplash.com/photo-1517486808906-6ca8b3f8e1c1",
        isFeatured: true,
        metaTitle: "Writing Winning Scholarship Essays - Tips and Strategies",
        metaDescription: "Learn how to write compelling scholarship essays that stand out and increase your chances of success."
      },
      {
        title: "10 Common Scholarship Application Mistakes to Avoid",
        slug: "common-scholarship-application-mistakes",
        content: "Discover the most common pitfalls that scholarship applicants fall into and learn how to avoid them to maximize your chances of success.",
        excerpt: "Discover the most common pitfalls that scholarship applicants fall into and learn how to avoid them to maximize your chances of success.",
        authorId: 1,
        imageUrl: "https://images.unsplash.com/photo-1519452575417-564c1401ecc0",
        isFeatured: true,
        metaTitle: "Common Scholarship Application Mistakes to Avoid",
        metaDescription: "Learn about the most frequent mistakes applicants make and how to avoid them to improve your chances of winning scholarships."
      },
      {
        title: "How to Prepare for a Scholarship Interview",
        slug: "how-to-prepare-scholarship-interview",
        content: "Master the art of scholarship interviews with our comprehensive guide covering common questions, professional etiquette, and strategies to showcase your strengths.",
        excerpt: "Master the art of scholarship interviews with our comprehensive guide covering common questions, professional etiquette, and strategies to showcase your strengths.",
        authorId: 1,
        imageUrl: "https://images.unsplash.com/photo-1518107616985-bd48230d3b20",
        isFeatured: true,
        metaTitle: "Scholarship Interview Preparation Guide",
        metaDescription: "A comprehensive guide to preparing for scholarship interviews, with tips, common questions, and strategies for success."
      }
    ];
    for (const post of posts) {
      this.createPost(post);
    }

    // Seed success stories
    const successStories = [
      {
        name: "Ahmed Mahmoud",
        title: "PhD in Computer Science at MIT",
        slug: "ahmed-mahmoud-fulbright",
        content: "Securing the Fulbright scholarship changed my life completely. I'm now pursuing my PhD at MIT, researching artificial intelligence and its applications in healthcare. The application process was challenging, but the resources from FULLSCO helped me craft a compelling application.",
        scholarshipName: "Fulbright Scholar",
        imageUrl: "https://randomuser.me/api/portraits/men/75.jpg"
      },
      {
        name: "Maria Rodriguez",
        title: "Masters in International Relations at Oxford",
        slug: "maria-rodriguez-chevening",
        content: "As a first-generation college student from Colombia, studying at Oxford seemed impossible. The Chevening Scholarship made it a reality. The application guides on FULLSCO were invaluable in helping me structure my essays and prepare for interviews.",
        scholarshipName: "Chevening Scholar",
        imageUrl: "https://randomuser.me/api/portraits/women/32.jpg"
      }
    ];
    for (const story of successStories) {
      this.createSuccessStory(story);
    }

    // Seed SEO settings
    const seoSettings = [
      {
        pagePath: "/",
        metaTitle: "FULLSCO - Find Your Perfect Scholarship Opportunity",
        metaDescription: "Discover thousands of scholarships worldwide and get guidance on how to apply successfully.",
        keywords: "scholarships, education funding, international scholarships, study abroad"
      },
      {
        pagePath: "/scholarships",
        metaTitle: "Browse Scholarships - FULLSCO",
        metaDescription: "Find the perfect scholarship opportunity for your academic journey. Filter by country, level, and field of study.",
        keywords: "scholarship search, academic funding, graduate scholarships, undergraduate scholarships"
      }
    ];
    for (const setting of seoSettings) {
      this.createSeoSetting(setting);
    }
    
    // Seed sample media files
    const mediaFiles = [
      {
        name: "banner-image.jpg",
        url: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1",
        mimeType: "image/jpeg",
        size: 1024000,
        width: 1920,
        height: 1080,
        alt: "University campus with students"
      },
      {
        name: "scholarship-photo.jpg",
        url: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f",
        mimeType: "image/jpeg",
        size: 512000,
        width: 1200,
        height: 800,
        alt: "Student studying in library"
      },
      {
        name: "article-header.jpg",
        url: "https://images.unsplash.com/photo-1517486808906-6ca8b3f8e1c1",
        mimeType: "image/jpeg",
        size: 840000,
        width: 1600,
        height: 900,
        alt: "Student writing application essay"
      }
    ];
    
    for (const mediaFile of mediaFiles) {
      this.createMediaFile(mediaFile);
    }
    
    // Seed site settings
    this.updateSiteSettings({
      siteName: "FULLSCO",
      siteTagline: "Find Your Perfect Scholarship",
      siteDescription: "FULLSCO helps students find and apply for scholarships worldwide with expert guidance and resources.",
      email: "contact@fullsco.com",
      phone: "+1 (555) 123-4567",
      whatsapp: "+1 (555) 123-4567",
      address: "123 Education St, Knowledge City",
      facebook: "https://facebook.com/fullsco",
      twitter: "https://twitter.com/fullsco",
      instagram: "https://instagram.com/fullsco",
      linkedin: "https://linkedin.com/company/fullsco",
      primaryColor: "#3B82F6",
      secondaryColor: "#10B981",
      accentColor: "#F59E0B",
      enableDarkMode: true,
      rtlDirection: true,
      defaultLanguage: "ar",
      enableNewsletter: true,
      enableScholarshipSearch: true,
      footerText: "© 2023 FULLSCO. All rights reserved."
    });
    
    // Seed static pages
    const pages = [
      {
        title: "من نحن",
        slug: "about",
        content: "<h1>من نحن</h1><p>مرحبًا بك في منصة FULLSCO، المنصة الرائدة للمنح الدراسية حول العالم.</p><p>نسعى لتوفير أفضل الفرص التعليمية للطلاب من جميع أنحاء العالم.</p>",
        metaTitle: "من نحن | FULLSCO",
        metaDescription: "تعرف على منصة FULLSCO للمنح الدراسية وفريق العمل والرؤية والأهداف",
        isPublished: true,
        showInFooter: true,
        showInHeader: true
      },
      {
        title: "تواصل معنا",
        slug: "contact",
        content: "<h1>تواصل معنا</h1><p>يمكنك التواصل معنا عبر البريد الإلكتروني أو الهاتف أو وسائل التواصل الاجتماعي.</p>",
        metaTitle: "تواصل معنا | FULLSCO",
        metaDescription: "تواصل مع فريق FULLSCO للاستفسارات والدعم",
        isPublished: true,
        showInFooter: true,
        showInHeader: true
      },
      {
        title: "سياسة الخصوصية",
        slug: "privacy-policy",
        content: "<h1>سياسة الخصوصية</h1><p>تلتزم FULLSCO بحماية بياناتك الشخصية. تعرف على كيفية جمع واستخدام البيانات على منصتنا.</p>",
        metaTitle: "سياسة الخصوصية | FULLSCO",
        metaDescription: "سياسة الخصوصية وحماية البيانات الشخصية على منصة FULLSCO",
        isPublished: true,
        showInFooter: true,
        showInHeader: false
      },
      {
        title: "الأسئلة الشائعة",
        slug: "faq",
        content: "<h1>الأسئلة الشائعة</h1><p>تجد هنا إجابات على الأسئلة الشائعة حول منصة FULLSCO والمنح الدراسية.</p>",
        metaTitle: "الأسئلة الشائعة | FULLSCO",
        metaDescription: "إجابات على الأسئلة الشائعة حول المنح الدراسية ومنصة FULLSCO",
        isPublished: true,
        showInFooter: true,
        showInHeader: false
      }
    ];
    
    for (const page of pages) {
      this.createPage(page);
    }
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentIds.users++;
    const now = new Date();
    const user: User = { ...insertUser, id, createdAt: now };
    this.users.set(id, user);
    return user;
  }

  async listUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Category methods
  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    return Array.from(this.categories.values()).find(
      (category) => category.slug === slug
    );
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = this.currentIds.categories++;
    const category: Category = { ...insertCategory, id };
    this.categories.set(id, category);
    return category;
  }

  async updateCategory(id: number, updateCategory: Partial<InsertCategory>): Promise<Category | undefined> {
    const category = this.categories.get(id);
    if (!category) return undefined;

    const updatedCategory = { ...category, ...updateCategory };
    this.categories.set(id, updatedCategory);
    return updatedCategory;
  }

  async deleteCategory(id: number): Promise<boolean> {
    return this.categories.delete(id);
  }

  async listCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  // Level methods
  async getLevel(id: number): Promise<Level | undefined> {
    return this.levels.get(id);
  }

  async getLevelBySlug(slug: string): Promise<Level | undefined> {
    return Array.from(this.levels.values()).find(
      (level) => level.slug === slug
    );
  }

  async createLevel(insertLevel: InsertLevel): Promise<Level> {
    const id = this.currentIds.levels++;
    const level: Level = { ...insertLevel, id };
    this.levels.set(id, level);
    return level;
  }

  async listLevels(): Promise<Level[]> {
    return Array.from(this.levels.values());
  }

  // Country methods
  async getCountry(id: number): Promise<Country | undefined> {
    return this.countries.get(id);
  }

  async getCountryBySlug(slug: string): Promise<Country | undefined> {
    return Array.from(this.countries.values()).find(
      (country) => country.slug === slug
    );
  }

  async createCountry(insertCountry: InsertCountry): Promise<Country> {
    const id = this.currentIds.countries++;
    const country: Country = { ...insertCountry, id };
    this.countries.set(id, country);
    return country;
  }

  async listCountries(): Promise<Country[]> {
    return Array.from(this.countries.values());
  }

  // Scholarship methods
  async getScholarship(id: number): Promise<Scholarship | undefined> {
    return this.scholarships.get(id);
  }

  async getScholarshipBySlug(slug: string): Promise<Scholarship | undefined> {
    return Array.from(this.scholarships.values()).find(
      (scholarship) => scholarship.slug === slug
    );
  }

  async createScholarship(insertScholarship: InsertScholarship): Promise<Scholarship> {
    const id = this.currentIds.scholarships++;
    const now = new Date();
    const scholarship: Scholarship = { 
      ...insertScholarship, 
      id, 
      createdAt: now, 
      updatedAt: now 
    };
    this.scholarships.set(id, scholarship);
    return scholarship;
  }

  async updateScholarship(id: number, updateScholarship: Partial<InsertScholarship>): Promise<Scholarship | undefined> {
    const scholarship = this.scholarships.get(id);
    if (!scholarship) return undefined;

    const now = new Date();
    const updatedScholarship = { 
      ...scholarship, 
      ...updateScholarship,
      updatedAt: now 
    };
    this.scholarships.set(id, updatedScholarship);
    return updatedScholarship;
  }

  async deleteScholarship(id: number): Promise<boolean> {
    return this.scholarships.delete(id);
  }

  async listScholarships(filters?: { isFeatured?: boolean, countryId?: number, levelId?: number, categoryId?: number }): Promise<Scholarship[]> {
    let scholarships = Array.from(this.scholarships.values());
    
    if (filters) {
      if (filters.isFeatured !== undefined) {
        scholarships = scholarships.filter(s => s.isFeatured === filters.isFeatured);
      }
      
      if (filters.countryId !== undefined) {
        scholarships = scholarships.filter(s => s.countryId === filters.countryId);
      }
      
      if (filters.levelId !== undefined) {
        scholarships = scholarships.filter(s => s.levelId === filters.levelId);
      }
      
      if (filters.categoryId !== undefined) {
        scholarships = scholarships.filter(s => s.categoryId === filters.categoryId);
      }
    }
    
    return scholarships;
  }

  // Post methods
  async getPost(id: number): Promise<Post | undefined> {
    return this.posts.get(id);
  }

  async getPostBySlug(slug: string): Promise<Post | undefined> {
    return Array.from(this.posts.values()).find(
      (post) => post.slug === slug
    );
  }

  async createPost(insertPost: InsertPost): Promise<Post> {
    const id = this.currentIds.posts++;
    const now = new Date();
    const post: Post = { 
      ...insertPost, 
      id, 
      views: 0,
      createdAt: now, 
      updatedAt: now 
    };
    this.posts.set(id, post);
    return post;
  }

  async updatePost(id: number, updatePost: Partial<InsertPost>): Promise<Post | undefined> {
    const post = this.posts.get(id);
    if (!post) return undefined;

    const now = new Date();
    const updatedPost = { 
      ...post, 
      ...updatePost,
      updatedAt: now 
    };
    this.posts.set(id, updatedPost);
    return updatedPost;
  }

  async deletePost(id: number): Promise<boolean> {
    return this.posts.delete(id);
  }

  async incrementPostViews(id: number): Promise<boolean> {
    const post = this.posts.get(id);
    if (!post) return false;

    const updatedPost = { 
      ...post,
      views: (post.views || 0) + 1
    };
    this.posts.set(id, updatedPost);
    return true;
  }

  async listPosts(filters?: { isFeatured?: boolean, authorId?: number }): Promise<Post[]> {
    let posts = Array.from(this.posts.values());
    
    if (filters) {
      if (filters.isFeatured !== undefined) {
        posts = posts.filter(p => p.isFeatured === filters.isFeatured);
      }
      
      if (filters.authorId !== undefined) {
        posts = posts.filter(p => p.authorId === filters.authorId);
      }
    }
    
    return posts;
  }

  // Tag methods
  async getTag(id: number): Promise<Tag | undefined> {
    return this.tags.get(id);
  }

  async getTagBySlug(slug: string): Promise<Tag | undefined> {
    return Array.from(this.tags.values()).find(
      (tag) => tag.slug === slug
    );
  }

  async createTag(insertTag: InsertTag): Promise<Tag> {
    const id = this.currentIds.tags++;
    const tag: Tag = { ...insertTag, id };
    this.tags.set(id, tag);
    return tag;
  }

  async listTags(): Promise<Tag[]> {
    return Array.from(this.tags.values());
  }

  // Post-Tag methods
  async getPostTags(postId: number): Promise<Tag[]> {
    const postTagEntries = Array.from(this.postTags.values())
      .filter(pt => pt.postId === postId);
    
    const tags: Tag[] = [];
    for (const entry of postTagEntries) {
      const tag = this.tags.get(entry.tagId);
      if (tag) tags.push(tag);
    }
    
    return tags;
  }

  async getTagPosts(tagId: number): Promise<Post[]> {
    const postTagEntries = Array.from(this.postTags.values())
      .filter(pt => pt.tagId === tagId);
    
    const posts: Post[] = [];
    for (const entry of postTagEntries) {
      const post = this.posts.get(entry.postId);
      if (post) posts.push(post);
    }
    
    return posts;
  }

  async addTagToPost(postId: number, tagId: number): Promise<PostTag> {
    // Check if already exists
    const existing = Array.from(this.postTags.values())
      .find(pt => pt.postId === postId && pt.tagId === tagId);
    
    if (existing) return existing;
    
    const id = this.currentIds.postTags++;
    const postTag: PostTag = { id, postId, tagId };
    this.postTags.set(id, postTag);
    return postTag;
  }

  async removeTagFromPost(postId: number, tagId: number): Promise<boolean> {
    const entry = Array.from(this.postTags.values())
      .find(pt => pt.postId === postId && pt.tagId === tagId);
    
    if (!entry) return false;
    
    return this.postTags.delete(entry.id);
  }

  // Success Story methods
  async getSuccessStory(id: number): Promise<SuccessStory | undefined> {
    return this.successStories.get(id);
  }

  async getSuccessStoryBySlug(slug: string): Promise<SuccessStory | undefined> {
    return Array.from(this.successStories.values()).find(
      (story) => story.slug === slug
    );
  }

  async createSuccessStory(insertStory: InsertSuccessStory): Promise<SuccessStory> {
    const id = this.currentIds.successStories++;
    const now = new Date();
    const story: SuccessStory = { ...insertStory, id, createdAt: now };
    this.successStories.set(id, story);
    return story;
  }

  async updateSuccessStory(id: number, updateStory: Partial<InsertSuccessStory>): Promise<SuccessStory | undefined> {
    const story = this.successStories.get(id);
    if (!story) return undefined;

    const updatedStory = { ...story, ...updateStory };
    this.successStories.set(id, updatedStory);
    return updatedStory;
  }

  async deleteSuccessStory(id: number): Promise<boolean> {
    return this.successStories.delete(id);
  }

  async listSuccessStories(): Promise<SuccessStory[]> {
    return Array.from(this.successStories.values());
  }

  // Newsletter subscriber methods
  async getSubscriber(id: number): Promise<Subscriber | undefined> {
    return this.subscribers.get(id);
  }

  async getSubscriberByEmail(email: string): Promise<Subscriber | undefined> {
    return Array.from(this.subscribers.values()).find(
      (subscriber) => subscriber.email === email
    );
  }

  async createSubscriber(insertSubscriber: InsertSubscriber): Promise<Subscriber> {
    const id = this.currentIds.subscribers++;
    const now = new Date();
    const subscriber: Subscriber = { ...insertSubscriber, id, createdAt: now };
    this.subscribers.set(id, subscriber);
    return subscriber;
  }

  async listSubscribers(): Promise<Subscriber[]> {
    return Array.from(this.subscribers.values());
  }

  // SEO settings methods
  async getSeoSetting(id: number): Promise<SeoSetting | undefined> {
    return this.seoSettings.get(id);
  }

  async getSeoSettingByPath(pagePath: string): Promise<SeoSetting | undefined> {
    return Array.from(this.seoSettings.values()).find(
      (setting) => setting.pagePath === pagePath
    );
  }

  async createSeoSetting(insertSeoSetting: InsertSeoSetting): Promise<SeoSetting> {
    const id = this.currentIds.seoSettings++;
    const seoSetting: SeoSetting = { ...insertSeoSetting, id };
    this.seoSettings.set(id, seoSetting);
    return seoSetting;
  }

  async updateSeoSetting(id: number, updateSeoSetting: Partial<InsertSeoSetting>): Promise<SeoSetting | undefined> {
    const seoSetting = this.seoSettings.get(id);
    if (!seoSetting) return undefined;

    const updatedSeoSetting = { ...seoSetting, ...updateSeoSetting };
    this.seoSettings.set(id, updatedSeoSetting);
    return updatedSeoSetting;
  }

  async listSeoSettings(): Promise<SeoSetting[]> {
    return Array.from(this.seoSettings.values());
  }
  
  // Site Settings methods
  async getSiteSettings(): Promise<SiteSetting | undefined> {
    return this.siteSettings;
  }
  
  async updateSiteSettings(settings: Partial<InsertSiteSetting>): Promise<SiteSetting> {
    if (!this.siteSettings) {
      // Create new settings if none exist
      const id = this.currentIds.siteSettings++;
      this.siteSettings = {
        id,
        ...settings,
        siteName: settings.siteName || "FULLSCO",
        siteTagline: settings.siteTagline || "",
        siteDescription: settings.siteDescription || "",
        favicon: settings.favicon || null,
        logo: settings.logo || null,
        logoDark: settings.logoDark || null,
        email: settings.email || null,
        phone: settings.phone || null,
        whatsapp: settings.whatsapp || null,
        address: settings.address || null,
        facebook: settings.facebook || null,
        twitter: settings.twitter || null,
        instagram: settings.instagram || null,
        youtube: settings.youtube || null,
        linkedin: settings.linkedin || null,
        primaryColor: settings.primaryColor || "#3B82F6",
        secondaryColor: settings.secondaryColor || "#10B981",
        accentColor: settings.accentColor || "#F59E0B",
        enableDarkMode: settings.enableDarkMode !== undefined ? settings.enableDarkMode : true,
        rtlDirection: settings.rtlDirection !== undefined ? settings.rtlDirection : true,
        defaultLanguage: settings.defaultLanguage || "ar",
        enableNewsletter: settings.enableNewsletter !== undefined ? settings.enableNewsletter : true,
        enableScholarshipSearch: settings.enableScholarshipSearch !== undefined ? settings.enableScholarshipSearch : true,
        footerText: settings.footerText || null
      };
    } else {
      // Update existing settings
      this.siteSettings = {
        ...this.siteSettings,
        ...settings
      };
    }
    
    return this.siteSettings;
  }

  // Analytics methods
  async getVisitStats(period: string = 'monthly'): Promise<any> {
    // في تنفيذ حقيقي، ستكون هذه البيانات معتمدة على زيارات المستخدمين الحقيقية
    // من سجلات التطبيق أو تحليلات جوجل
    
    const periods: Record<string, any[]> = {
      daily: [
        { name: 'السبت', visits: 450, articles: 2, scholarships: 1 },
        { name: 'الأحد', visits: 480, articles: 0, scholarships: 2 },
        { name: 'الاثنين', visits: 520, articles: 1, scholarships: 0 },
        { name: 'الثلاثاء', visits: 550, articles: 0, scholarships: 1 },
        { name: 'الأربعاء', visits: 500, articles: 3, scholarships: 0 },
        { name: 'الخميس', visits: 480, articles: 1, scholarships: 1 },
        { name: 'الجمعة', visits: 470, articles: 0, scholarships: 0 },
      ],
      weekly: [
        { name: 'الأسبوع 1', visits: 3200, articles: 8, scholarships: 4 },
        { name: 'الأسبوع 2', visits: 3500, articles: 5, scholarships: 3 },
        { name: 'الأسبوع 3', visits: 3800, articles: 7, scholarships: 2 },
        { name: 'الأسبوع 4', visits: 4100, articles: 6, scholarships: 3 },
      ],
      monthly: [
        { name: 'يناير', visits: 15000, articles: 22, scholarships: 12 },
        { name: 'فبراير', visits: 16500, articles: 18, scholarships: 10 },
        { name: 'مارس', visits: 18000, articles: 24, scholarships: 15 },
        { name: 'أبريل', visits: 17500, articles: 20, scholarships: 18 },
        { name: 'مايو', visits: 19000, articles: 25, scholarships: 14 },
        { name: 'يونيو', visits: 21000, articles: 28, scholarships: 16 },
      ],
      yearly: [
        { name: '2023', visits: 180000, articles: 240, scholarships: 150 },
        { name: '2024', visits: 220000, articles: 320, scholarships: 180 },
        { name: '2025', visits: 120000, articles: 180, scholarships: 90 }, // جزء من السنة فقط
      ]
    };

    // إنشاء لوحة معلومات الإحصائيات بناءً على المقالات والمنح الحالية من قاعدة البيانات
    // بالإضافة إلى الزيارات المقدرة
    const postCount = this.posts.size;
    const scholarshipCount = this.scholarships.size;
    const subscriberCount = this.subscribers.size;

    const data = {
      stats: {
        postCount,
        scholarshipCount,
        subscriberCount,
        totalVisits: period === 'yearly' ? 520000 : (
          period === 'monthly' ? 107000 : (
            period === 'weekly' ? 14600 : 3450
          )
        ),
        // نسبة النمو مقارنة بالفترة السابقة
        growth: {
          visits: '+12%',
          posts: '+8%',
          scholarships: '+5%',
          subscribers: '+15%',
        }
      },
      // بيانات الزيارات حسب الفترة الزمنية
      visitData: periods[period] || periods.monthly,
    };

    return data;
  }

  async getPostStats(): Promise<any> {
    const posts = Array.from(this.posts.values());
    
    // حساب إجمالي المشاهدات
    const totalViews = posts.reduce((sum, post) => sum + (post.views || 0), 0);
    
    // متوسط المشاهدات لكل مقال
    const averageViews = posts.length > 0 ? totalViews / posts.length : 0;
    
    // المقالات المميزة
    const featuredCount = posts.filter(post => post.isFeatured).length;
    
    // المقالات حسب التاريخ
    const postsThisMonth = posts.filter(post => {
      const now = new Date();
      const postDate = new Date(post.createdAt);
      return postDate.getMonth() === now.getMonth() && 
             postDate.getFullYear() === now.getFullYear();
    }).length;

    return {
      totalPosts: posts.length,
      totalViews,
      averageViews: Math.round(averageViews),
      featuredCount,
      postsThisMonth,
    };
  }

  async getScholarshipStats(): Promise<any> {
    const scholarships = Array.from(this.scholarships.values());
    
    // المنح حسب مستوى الدراسة
    const scholarshipsByLevel = scholarships.reduce((acc, scholarship) => {
      const levelId = scholarship.levelId;
      if (levelId) {
        acc[levelId] = (acc[levelId] || 0) + 1;
      }
      return acc;
    }, {} as Record<number, number>);
    
    // المنح حسب البلد
    const scholarshipsByCountry = scholarships.reduce((acc, scholarship) => {
      const countryId = scholarship.countryId;
      if (countryId) {
        acc[countryId] = (acc[countryId] || 0) + 1;
      }
      return acc;
    }, {} as Record<number, number>);
    
    // المنح المميزة والممولة بالكامل
    const featuredCount = scholarships.filter(s => s.isFeatured).length;
    const fullyFundedCount = scholarships.filter(s => s.isFullyFunded).length;
    
    // المنح التي تنتهي قريباً
    const now = new Date();
    const upcomingDeadlines = scholarships.filter(s => {
      if (!s.deadline) return false;
      const deadlineDate = new Date(s.deadline);
      const diffTime = deadlineDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 30;
    }).length;

    return {
      totalScholarships: scholarships.length,
      scholarshipsByLevel,
      scholarshipsByCountry,
      featuredCount,
      fullyFundedCount,
      upcomingDeadlines,
    };
  }

  async getTrafficSources(): Promise<any> {
    // في تنفيذ حقيقي، ستأتي هذه البيانات من تحليلات الويب مثل Google Analytics
    return [
      { name: 'محركات البحث', value: 65 },
      { name: 'وسائل التواصل الاجتماعي', value: 20 },
      { name: 'روابط مباشرة', value: 10 },
      { name: 'أخرى', value: 5 },
    ];
  }

  async getTopContent(type: string = 'posts', limit: number = 5): Promise<any> {
    if (type === 'posts') {
      // المقالات الأكثر مشاهدة
      const posts = Array.from(this.posts.values())
        .sort((a, b) => (b.views || 0) - (a.views || 0))
        .slice(0, limit)
        .map(post => ({
          id: post.id,
          name: post.title,
          views: post.views || 0,
          slug: post.slug
        }));
      
      return posts;
    } else if (type === 'scholarships') {
      // المنح الأكثر زيارة (افتراضية حيث لا نتتبع مشاهدات المنح حاليًا)
      const scholarships = Array.from(this.scholarships.values())
        .slice(0, limit)
        .map(scholarship => ({
          id: scholarship.id,
          name: scholarship.title,
          views: Math.floor(Math.random() * 1000), // قيمة افتراضية للعرض فقط
          slug: scholarship.slug
        }));
      
      return scholarships;
    }
    
    return [];
  }

  // Page methods
  async getPage(id: number): Promise<Page | undefined> {
    return this.pages.get(id);
  }

  async getPageBySlug(slug: string): Promise<Page | undefined> {
    return Array.from(this.pages.values()).find(
      (page) => page.slug === slug
    );
  }

  async createPage(insertPage: InsertPage): Promise<Page> {
    const id = this.currentIds.pages++;
    const now = new Date();
    const page: Page = { 
      ...insertPage, 
      id, 
      createdAt: now,
      updatedAt: now
    };
    this.pages.set(id, page);
    return page;
  }

  async updatePage(id: number, updatePage: Partial<InsertPage>): Promise<Page | undefined> {
    const page = this.pages.get(id);
    if (!page) return undefined;

    const now = new Date();
    const updatedPage = { 
      ...page, 
      ...updatePage,
      updatedAt: now 
    };
    this.pages.set(id, updatedPage);
    return updatedPage;
  }

  async deletePage(id: number): Promise<boolean> {
    return this.pages.delete(id);
  }

  async listPages(filters?: { isPublished?: boolean, showInHeader?: boolean, showInFooter?: boolean }): Promise<Page[]> {
    let pages = Array.from(this.pages.values());
    
    if (filters) {
      if (filters.isPublished !== undefined) {
        pages = pages.filter(page => page.isPublished === filters.isPublished);
      }
      
      if (filters.showInHeader !== undefined) {
        pages = pages.filter(page => page.showInHeader === filters.showInHeader);
      }
      
      if (filters.showInFooter !== undefined) {
        pages = pages.filter(page => page.showInFooter === filters.showInFooter);
      }
    }
    
    return pages;
  }
}

// We're using the DatabaseStorage implementation from db-storage.ts

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
    return result.rowCount > 0;
  }

  async listPages(filters?: { isPublished?: boolean, showInHeader?: boolean, showInFooter?: boolean }): Promise<Page[]> {
    let query = db.select().from(pages);
    
    if (filters) {
      if (filters.isPublished !== undefined) {
        query = query.where(eq(pages.isPublished, filters.isPublished));
      }
      if (filters.showInHeader !== undefined) {
        query = query.where(eq(pages.showInHeader, filters.showInHeader));
      }
      if (filters.showInFooter !== undefined) {
        query = query.where(eq(pages.showInFooter, filters.showInFooter));
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
    const result = await db.delete(categories).where(eq(categories.id, id));
    return result.rowCount > 0;
  }
  
  async listCategories(): Promise<Category[]> {
    return await db.select().from(categories);
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
    const result = await db.delete(scholarships).where(eq(scholarships.id, id));
    return result.rowCount > 0;
  }
  
  async listScholarships(filters?: { isFeatured?: boolean, countryId?: number, levelId?: number, categoryId?: number }): Promise<Scholarship[]> {
    let query = db.select().from(scholarships);
    
    if (filters) {
      if (filters.isFeatured !== undefined) {
        query = query.where(eq(scholarships.isFeatured, filters.isFeatured));
      }
      if (filters.countryId !== undefined) {
        query = query.where(eq(scholarships.countryId, filters.countryId));
      }
      if (filters.levelId !== undefined) {
        query = query.where(eq(scholarships.levelId, filters.levelId));
      }
      if (filters.categoryId !== undefined) {
        query = query.where(eq(scholarships.categoryId, filters.categoryId));
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
    const result = await db.delete(posts).where(eq(posts.id, id));
    return result.rowCount > 0;
  }
  
  async incrementPostViews(id: number): Promise<boolean> {
    const [post] = await db.select().from(posts).where(eq(posts.id, id));
    if (!post) return false;
    
    await db.update(posts)
      .set({ views: post.views + 1 })
      .where(eq(posts.id, id));
    
    return true;
  }
  
  async listPosts(filters?: { isFeatured?: boolean, authorId?: number }): Promise<Post[]> {
    let query = db.select().from(posts);
    
    if (filters) {
      if (filters.authorId !== undefined) {
        query = query.where(eq(posts.authorId, filters.authorId));
      }
      // isFeatured is not in the actual table schema, so we skip this filter
    }
    
    return await query;
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
    const results = await db
      .select({
        tag: tags
      })
      .from(postTags)
      .innerJoin(tags, eq(postTags.tagId, tags.id))
      .where(eq(postTags.postId, postId));
    
    return results.map(r => r.tag);
  }
  
  async getTagPosts(tagId: number): Promise<Post[]> {
    const results = await db
      .select({
        post: posts
      })
      .from(postTags)
      .innerJoin(posts, eq(postTags.postId, posts.id))
      .where(eq(postTags.tagId, tagId));
    
    return results.map(r => r.post);
  }
  
  async addTagToPost(postId: number, tagId: number): Promise<PostTag> {
    const [postTag] = await db
      .insert(postTags)
      .values({ postId, tagId })
      .returning();
    
    return postTag;
  }
  
  async removeTagFromPost(postId: number, tagId: number): Promise<boolean> {
    const result = await db
      .delete(postTags)
      .where(and(eq(postTags.postId, postId), eq(postTags.tagId, tagId)));
    
    return result.rowCount > 0;
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
    const result = await db.delete(successStories).where(eq(successStories.id, id));
    return result.rowCount > 0;
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
    const [siteSetting] = await db.select().from(siteSettings);
    return siteSetting;
  }
  
  async updateSiteSettings(settings: Partial<InsertSiteSetting>): Promise<SiteSetting> {
    const existingSettings = await this.getSiteSettings();
    
    if (existingSettings) {
      const [updatedSettings] = await db
        .update(siteSettings)
        .set(settings)
        .where(eq(siteSettings.id, existingSettings.id))
        .returning();
      
      return updatedSettings;
    } else {
      const [newSettings] = await db
        .insert(siteSettings)
        .values(settings as InsertSiteSetting)
        .returning();
      
      return newSettings;
    }
  }

  // Analytics operations - these are more complex and would need to be implemented
  // based on your specific analytics requirements
  async getVisitStats(period?: string): Promise<any> {
    // Implementation would depend on how you're tracking visits
    return { visits: 0, uniqueVisitors: 0, period: period || 'all' };
  }
  
  async getPostStats(): Promise<any> {
    const totalPosts = await db.select({ count: count() }).from(posts);
    return { 
      total: totalPosts[0].count, 
      views: 0 // Would need a more complex query to sum all views
    };
  }
  
  async getScholarshipStats(): Promise<any> {
    const totalScholarships = await db.select({ count: count() }).from(scholarships);
    return { 
      total: totalScholarships[0].count,
      featured: 0 // Would need a query to count featured scholarships
    };
  }
  
  async getTrafficSources(): Promise<any> {
    // Implementation would depend on how you're tracking traffic sources
    return [
      { source: 'direct', count: 0 },
      { source: 'search', count: 0 },
      { source: 'social', count: 0 },
      { source: 'referral', count: 0 }
    ];
  }
  
  async getTopContent(type?: string, limit?: number): Promise<any> {
    // Implementation would depend on your content and how you measure "top"
    return [];
  }
}

export const storage = new DatabaseStorage();

// إضافة الدوال المطلوبة يدويًا للكائن المُصَدّر

// إضافة وظيفة listMenus
storage.listMenus = async (): Promise<Menu[]> => {
  try {
    const menusList = await db.select().from(menus);
    return menusList;
  } catch (error) {
    console.error("Error listing menus:", error);
    return [];
  }
};

// إضافة وظائف MenuItem

// إضافة وظيفة getMenuItem
storage.getMenuItem = async (id: number): Promise<MenuItem | undefined> => {
  try {
    const result = await db.select().from(menuItems).where(eq(menuItems.id, id)).limit(1);
    return result[0];
  } catch (error) {
    console.error("Error fetching menu item:", error);
    throw error;
  }
};

// إضافة وظيفة createMenuItem
storage.createMenuItem = async (item: InsertMenuItem): Promise<MenuItem> => {
  try {
    const [createdItem] = await db.insert(menuItems).values(item).returning();
    return createdItem;
  } catch (error) {
    console.error("Error creating menu item:", error);
    throw error;
  }
};

// إضافة وظيفة updateMenuItem
storage.updateMenuItem = async (id: number, item: Partial<InsertMenuItem>): Promise<MenuItem | undefined> => {
  try {
    const [updatedItem] = await db
      .update(menuItems)
      .set(item)
      .where(eq(menuItems.id, id))
      .returning();
    return updatedItem;
  } catch (error) {
    console.error("Error updating menu item:", error);
    throw error;
  }
};

// إضافة وظيفة deleteMenuItem
storage.deleteMenuItem = async (id: number): Promise<boolean> => {
  try {
    await db.delete(menuItems).where(eq(menuItems.id, id));
    return true;
  } catch (error) {
    console.error("Error deleting menu item:", error);
    throw error;
  }
};

// إضافة وظيفة getAllMenuItemsWithDetails
storage.getAllMenuItemsWithDetails = async (menuId: number): Promise<any[]> => {
  try {
    const items = await db.select().from(menuItems).where(eq(menuItems.menuId, menuId));
    return items;
  } catch (error) {
    console.error("Error fetching menu items with details:", error);
    throw error;
  }
};

// إضافة وظيفة listMenuItems
storage.listMenuItems = async (menuId: number, parentId?: number | null): Promise<MenuItem[]> => {
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
};

// إضافة وظيفة getMenuByLocation
storage.getMenuByLocation = async (location: string): Promise<Menu | undefined> => {
  try {
    const [menu] = await db.select().from(menus).where(eq(menus.location, location));
    return menu;
  } catch (error) {
    console.error("Error getting menu by location:", error);
    return undefined;
  }
};

// إضافة وظيفة getMenuStructure يدويًا للكائن المُصَدّر
storage.getMenuStructure = async (location: string): Promise<any> => {
  try {
    // الحصول على القائمة بواسطة الموقع
    const menu = await storage.getMenuByLocation(location);
    if (!menu) {
      return null;
    }
    
    // الحصول على العناصر الرئيسية (parentId هو null)
    const rootItems = await storage.listMenuItems(menu.id, null);
    
    // تحضير الهيكل
    const structure = {
      id: menu.id,
      name: menu.name,
      slug: menu.slug,
      location: menu.location,
      items: []
    };
    
    // لكل عنصر رئيسي، نحصل على العناصر الفرعية
    for (const rootItem of rootItems) {
      const item: any = { ...rootItem, children: [] };
      
      if (rootItem.id) {
        // الحصول على العناصر الفرعية لهذا العنصر الرئيسي
        const children = await storage.listMenuItems(menu.id, rootItem.id);
        item.children = children || [];
      }
      
      structure.items.push(item);
    }
    
    return structure;
  } catch (error) {
    console.error(`Error getting menu structure for ${location}:`, error);
    throw error; // رمي الخطأ لمعالجته في مسار API
  }
};
