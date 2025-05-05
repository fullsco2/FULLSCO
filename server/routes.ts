import express, { type Express, type Request, type Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage-fixed";
import { 
  insertUserSchema, 
  insertScholarshipSchema,
  insertPostSchema,
  insertCategorySchema,
  insertLevelSchema,
  insertCountrySchema,
  insertTagSchema,
  insertSuccessStorySchema,
  insertSubscriberSchema,
  insertSeoSettingsSchema,
  insertSiteSettingsSchema,
  insertPageSchema,
  insertMenuSchema,
  insertMenuItemSchema,
  insertMediaFileSchema,
  insertStatisticSchema,
  insertPartnerSchema,
  User,
  menuLocationEnum
} from "@shared/schema";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import MemoryStore from "memorystore";
import multer from "multer";
import path from "path";
import fs from "fs";
import sizeOf from "image-size";

/**
 * وظيفة تسجيل المسارات الرئيسية
 * هذه الوظيفة تحافظ على التوافق مع النظام القديم أثناء عملية الانتقال إلى النظام الجديد
 */
export async function registerRoutes(app: Express): Promise<Server> {
  // قائمة الوحدات التي تم نقلها إلى النظام الجديد
  const migratedModules = [
    'auth',           // المصادقة
    'users',          // المستخدمين
    'site-settings',  // إعدادات الموقع
    'statistics',     // الإحصائيات
    'partners',       // الشركاء
    'scholarships',   // المنح الدراسية
    'posts',          // المقالات
    'success-stories', // قصص النجاح
    'categories',     // التصنيفات
    'levels',         // المستويات الدراسية
    'countries'       // الدول
  ];

  console.log('🚀 بدء تسجيل المسارات...');
  
  try {
    // محاولة تحميل وتسجيل المسارات الجديدة
    const routesModule = await import('./routes/index');
    if (typeof routesModule.registerApiRoutes === 'function') {
      console.log('✅ تسجيل المسارات الجديدة باستخدام النظام الجديد');
      routesModule.registerApiRoutes(app, '/api');
      console.log(`📋 الوحدات المنقولة: ${migratedModules.join(', ')}`);
    }
  } catch (error) {
    console.error('❌ خطأ في تسجيل المسارات الجديدة:', error);
  }
  
  // تسجيل المسارات القديمة للوحدات التي لم يتم نقلها بعد
  console.log('⚠️ تسجيل المسارات القديمة للوحدات المتبقية');
  registerLegacyRoutes(app, migratedModules);
  
  // إنشاء وإرجاع خادم HTTP
  const httpServer = createServer(app);
  return httpServer;
}

/**
 * وظيفة تسجيل المسارات القديمة المتبقية
 * @param app تطبيق Express
 * @param migratedModules قائمة الوحدات التي تم نقلها إلى النظام الجديد
 */
export function registerLegacyRoutes(app: Express, migratedModules: string[] = []): void {
  // Set up uploads directory
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  
  // Serve static files from uploads directory
  app.use('/uploads', express.static(uploadsDir));

  // Set up multer for file uploads
  const multerStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      cb(null, uniqueSuffix + ext);
    }
  });
  
  const upload = multer({ 
    storage: multerStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: function (req, file, cb) {
      // تحقق من أن الملف صورة صالحة
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('الملف المرفوع ليس صورة!') as any, false);
      }
    }
  });

  // Set up authentication
  const MemorySessionStore = MemoryStore(session);
  
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "fullsco-secret-key",
      resave: false,
      saveUninitialized: false,
      cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }, // 24 hours
      store: new MemorySessionStore({
        checkPeriod: 86400000, // prune expired entries every 24h
      }),
    })
  );
  
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure passport local strategy
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "Incorrect username" });
        }
        
        if (user.password !== password) {
          return done(null, false, { message: "Incorrect password" });
        }
        
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  // Auth middleware
  const isAuthenticated = (req: Request, res: Response, next: Function) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized" });
  };

  const isAdmin = (req: Request, res: Response, next: Function) => {
    if (req.isAuthenticated() && req.user && (req.user as any).role === "admin") {
      return next();
    }
    res.status(403).json({ message: "Forbidden: Admin access required" });
  };

  // تسجيل مسارات API استنادًا إلى الوحدات التي لم يتم نقلها بعد
  
  // === وحدة التصنيفات (Categories) ===
  if (!migratedModules.includes('categories')) {
    console.log('⚠️ تسجيل مسارات التصنيفات القديمة (categories)');
    
    app.post("/api/categories", isAdmin, async (req, res) => {
      try {
        const data = insertCategorySchema.parse(req.body);
        const category = await storage.createCategory(data);
        res.status(201).json(category);
      } catch (error) {
        res.status(400).json({ message: (error as Error).message });
      }
    });

    app.get("/api/categories", async (req, res) => {
      const categories = await storage.listCategories();
      res.json(categories);
    });

    app.get("/api/categories/:id", async (req, res) => {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }
      const category = await storage.getCategory(id);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json(category);
    });

    app.put("/api/categories/:id", isAdmin, async (req, res) => {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }
      try {
        const data = insertCategorySchema.partial().parse(req.body);
        const category = await storage.updateCategory(id, data);
        if (!category) {
          return res.status(404).json({ message: "Category not found" });
        }
        res.json(category);
      } catch (error) {
        res.status(400).json({ message: (error as Error).message });
      }
    });

    app.delete("/api/categories/:id", isAdmin, async (req, res) => {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }
      const success = await storage.deleteCategory(id);
      if (!success) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json({ message: "Category deleted successfully" });
    });
  }

  // === وحدة المستويات (Levels) ===
  if (!migratedModules.includes('levels')) {
    console.log('⚠️ تسجيل مسارات المستويات القديمة (levels)');
    
    app.post("/api/levels", isAdmin, async (req, res) => {
      try {
        const data = insertLevelSchema.parse(req.body);
        const level = await storage.createLevel(data);
        res.status(201).json(level);
      } catch (error) {
        res.status(400).json({ message: (error as Error).message });
      }
    });

    app.get("/api/levels", async (req, res) => {
      const levels = await storage.listLevels();
      res.json(levels);
    });
    
    // مسار الحصول على مستوى بواسطة الـ slug
    app.get("/api/levels/slug/:slug", async (req, res) => {
      try {
        const slug = req.params.slug;
        const level = await storage.getLevelBySlug(slug);
        if (!level) {
          return res.status(404).json({ message: "Level not found" });
        }
        res.json(level);
      } catch (error) {
        console.error("Error fetching level by slug:", error);
        res.status(500).json({ message: "Failed to fetch level", error: (error as Error).message });
      }
    });
    
    app.get("/api/levels/:id", async (req, res) => {
      try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
          return res.status(400).json({ message: "Invalid level ID" });
        }
        const level = await storage.getLevel(id);
        if (!level) {
          return res.status(404).json({ message: "Level not found" });
        }
        res.json(level);
      } catch (error) {
        res.status(500).json({ message: (error as Error).message });
      }
    });
    
    app.put("/api/levels/:id", isAdmin, async (req, res) => {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid level ID" });
      }
      try {
        const data = insertLevelSchema.partial().parse(req.body);
        const level = await storage.updateLevel(id, data);
        if (!level) {
          return res.status(404).json({ message: "Level not found" });
        }
        res.json(level);
      } catch (error) {
        res.status(400).json({ message: (error as Error).message });
      }
    });
    
    app.delete("/api/levels/:id", isAdmin, async (req, res) => {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid level ID" });
      }
      try {
        const success = await storage.deleteLevel(id);
        if (!success) {
          return res.status(404).json({ message: "Level not found" });
        }
        res.json({ message: "Level deleted successfully" });
      } catch (error) {
        res.status(500).json({ message: (error as Error).message });
      }
    });
  }

  // === وحدة الدول (Countries) ===
  if (!migratedModules.includes('countries')) {
    console.log('⚠️ تسجيل مسارات الدول القديمة (countries)');
    
    app.post("/api/countries", isAdmin, async (req, res) => {
      try {
        const data = insertCountrySchema.parse(req.body);
        const country = await storage.createCountry(data);
        res.status(201).json(country);
      } catch (error) {
        res.status(400).json({ message: (error as Error).message });
      }
    });

    app.get("/api/countries", async (req, res) => {
      const countries = await storage.listCountries();
      res.json(countries);
    });
    
    // مسار الحصول على دولة بواسطة الـ slug
    app.get("/api/countries/slug/:slug", async (req, res) => {
      try {
        const slug = req.params.slug;
        const country = await storage.getCountryBySlug(slug);
        if (!country) {
          return res.status(404).json({ message: "Country not found" });
        }
        res.json(country);
      } catch (error) {
        console.error("Error fetching country by slug:", error);
        res.status(500).json({ message: "Failed to fetch country", error: (error as Error).message });
      }
    });
    
    app.get("/api/countries/:id", async (req, res) => {
      try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
          return res.status(400).json({ message: "Invalid country ID" });
        }
        const country = await storage.getCountry(id);
        if (!country) {
          return res.status(404).json({ message: "Country not found" });
        }
        res.json(country);
      } catch (error) {
        res.status(500).json({ message: (error as Error).message });
      }
    });
    
    app.put("/api/countries/:id", isAdmin, async (req, res) => {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid country ID" });
      }
      try {
        const data = insertCountrySchema.partial().parse(req.body);
        const country = await storage.updateCountry(id, data);
        if (!country) {
          return res.status(404).json({ message: "Country not found" });
        }
        res.json(country);
      } catch (error) {
        res.status(400).json({ message: (error as Error).message });
      }
    });
    
    app.delete("/api/countries/:id", isAdmin, async (req, res) => {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid country ID" });
      }
      try {
        const success = await storage.deleteCountry(id);
        if (!success) {
          return res.status(404).json({ message: "Country not found" });
        }
        res.json({ message: "Country deleted successfully" });
      } catch (error) {
        res.status(500).json({ message: (error as Error).message });
      }
    });
  }

  // === وحدة المصادقة (Auth) ===
  if (!migratedModules.includes('auth')) {
    console.log('⚠️ تسجيل مسارات المصادقة القديمة (auth)');
    // Authentication routes
    app.post("/api/auth/login", (req, res, next) => {
      passport.authenticate("local", (err: any, user: any, info: any) => {
        if (err) {
          return next(err);
        }
        if (!user) {
          return res.status(401).json({ message: info.message });
        }
        req.login(user, (err) => {
          if (err) {
            return next(err);
          }
          
          // Remove password from response
          const userResponse = { ...user };
          delete userResponse.password;
          
          return res.json(userResponse);
        });
      })(req, res, next);
    });

    app.post("/api/auth/logout", (req, res) => {
      req.logout((err) => {
        if (err) {
          return res.status(500).json({ message: "Error logging out" });
        }
        res.json({ message: "Logged out successfully" });
      });
    });

    app.get("/api/auth/me", (req, res) => {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // Remove password from response
      const userResponse = { ...req.user as any };
      delete userResponse.password;
      
      res.json(userResponse);
    });
  }

  // === وحدة المستخدمين (Users) ===
  if (!migratedModules.includes('users')) {
    console.log('⚠️ تسجيل مسارات المستخدمين القديمة (users)');
    // User routes
    app.post("/api/users", isAdmin, async (req, res) => {
      try {
        const data = insertUserSchema.parse(req.body);
        const user = await storage.createUser(data);
        res.status(201).json(user);
      } catch (error) {
        res.status(400).json({ message: (error as Error).message });
      }
    });

    app.get("/api/users", isAdmin, async (req, res) => {
      const users = await storage.listUsers();
      // Remove passwords from response
      const safeUsers = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      res.json(safeUsers);
    });
  }

  // === وحدة المنح الدراسية (Scholarships) ===
  if (!migratedModules.includes('scholarships')) {
    console.log('⚠️ تسجيل مسارات المنح الدراسية القديمة (scholarships)');
    // Scholarship routes
    app.post("/api/scholarships", isAdmin, async (req, res) => {
      try {
        // معالجة التواريخ قبل التحقق من صحة البيانات
        const processedBody = {
          ...req.body,
          startDate: req.body.startDate ? new Date(req.body.startDate) : null,
          endDate: req.body.endDate ? new Date(req.body.endDate) : null
        };
        
        const data = insertScholarshipSchema.parse(processedBody);
        const scholarship = await storage.createScholarship(data);
        res.status(201).json(scholarship);
      } catch (error) {
        console.error("Error creating scholarship:", error);
        res.status(400).json({ message: (error as Error).message });
      }
    });

    app.get("/api/scholarships", async (req, res) => {
      const { featured, country, level, category } = req.query;
      const filters: any = {};
      
      if (featured !== undefined) {
        filters.isFeatured = featured === "true";
      }
      
      if (country) {
        const countryId = parseInt(country as string);
        if (!isNaN(countryId)) {
          filters.countryId = countryId;
        }
      }
      
      if (level) {
        const levelId = parseInt(level as string);
        if (!isNaN(levelId)) {
          filters.levelId = levelId;
        }
      }
      
      if (category) {
        const categoryId = parseInt(category as string);
        if (!isNaN(categoryId)) {
          filters.categoryId = categoryId;
        }
      }
      
      const scholarships = await storage.listScholarships(Object.keys(filters).length > 0 ? filters : undefined);
      res.json(scholarships);
    });

    // مسار الحصول على المنح المميزة
    app.get("/api/scholarships/featured", async (req, res) => {
      try {
        const scholarships = await storage.listScholarships({ isFeatured: true });
        res.json(scholarships);
      } catch (error) {
        console.error("Error fetching featured scholarships:", error);
        res.status(500).json({ message: "Failed to fetch featured scholarships", error: (error as Error).message });
      }
    });

    // مسار الحصول على المنحة بواسطة الـ slug
    app.get("/api/scholarships/slug/:slug", async (req, res) => {
      try {
        const slug = req.params.slug;
        const scholarship = await storage.getScholarshipBySlug(slug);
        if (!scholarship) {
          return res.status(404).json({ message: "Scholarship not found" });
        }
        res.json(scholarship);
      } catch (error) {
        console.error("Error fetching scholarship by slug:", error);
        res.status(500).json({ message: "Failed to fetch scholarship", error: (error as Error).message });
      }
    });
    
    // مسار الحصول على المنحة بواسطة المعرف (ID)
    // هذا المسار يجب أن يكون بعد المسارات المحددة مثل /featured و /slug
    app.get("/api/scholarships/:id", async (req, res) => {
      try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
          return res.status(400).json({ message: "Invalid scholarship ID" });
        }
        console.log(`Fetching scholarship with ID: ${id}`);
        const scholarship = await storage.getScholarship(id);
        if (!scholarship) {
          return res.status(404).json({ message: "Scholarship not found" });
        }
        // استخدام التنسيق الموحد للاستجابة
        res.json({ success: true, data: scholarship });
      } catch (error) {
        console.error(`Error fetching scholarship with ID ${req.params.id}:`, error);
        res.status(500).json({ success: false, message: "Failed to fetch scholarship", error: (error as Error).message });
      }
    });

    // تعامل مع كل من PUT و PATCH لتحديث المنح الدراسية
    app.put("/api/scholarships/:id", isAdmin, async (req, res) => {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid scholarship ID" });
      }
      try {
        console.log("Scholarship update request body:", JSON.stringify(req.body, null, 2));
        
        // معالجة التواريخ قبل التحقق من صحة البيانات
        const processedBody = {
          ...req.body,
          startDate: req.body.startDate ? new Date(req.body.startDate) : null,
          endDate: req.body.endDate ? new Date(req.body.endDate) : null
        };
        
        const data = insertScholarshipSchema.partial().parse(processedBody);
        console.log("Parsed scholarship data:", JSON.stringify(data, null, 2));
        
        const scholarship = await storage.updateScholarship(id, data);
        if (!scholarship) {
          return res.status(404).json({ message: "Scholarship not found" });
        }
        res.json(scholarship);
      } catch (error) {
        console.error("Error updating scholarship:", error);
        res.status(400).json({ message: (error as Error).message });
      }
    });

    app.patch("/api/scholarships/:id", isAdmin, async (req, res) => {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid scholarship ID" });
      }
      try {
        console.log("Scholarship update request body:", JSON.stringify(req.body, null, 2));
        
        // معالجة التواريخ قبل التحقق من صحة البيانات
        const processedBody = {
          ...req.body,
          startDate: req.body.startDate ? new Date(req.body.startDate) : null,
          endDate: req.body.endDate ? new Date(req.body.endDate) : null
        };
        
        const data = insertScholarshipSchema.partial().parse(processedBody);
        console.log("Parsed scholarship data:", JSON.stringify(data, null, 2));
        
        const scholarship = await storage.updateScholarship(id, data);
        if (!scholarship) {
          return res.status(404).json({ message: "Scholarship not found" });
        }
        res.json(scholarship);
      } catch (error) {
        console.error("Error updating scholarship:", error);
        res.status(400).json({ message: (error as Error).message });
      }
    });

    app.delete("/api/scholarships/:id", isAdmin, async (req, res) => {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid scholarship ID" });
      }
      const success = await storage.deleteScholarship(id);
      if (!success) {
        return res.status(404).json({ message: "Scholarship not found" });
      }
      res.json({ message: "Scholarship deleted successfully" });
    });
  }
}
