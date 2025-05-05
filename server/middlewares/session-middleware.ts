import { Express } from 'express';
import session from 'express-session';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import MemoryStore from 'memorystore';

/**
 * إعداد جلسات المستخدم والمصادقة باستخدام Passport
 */
export function setupSessionMiddleware(app: Express): void {
  // إنشاء مخزن للجلسات في الذاكرة
  const MemorySessionStore = MemoryStore(session);
  
  // إعداد middleware الجلسة
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "fullsco-secret-key",
      resave: false,
      saveUninitialized: false,
      cookie: { 
        secure: process.env.NODE_ENV === 'production', // استخدام HTTPS في الإنتاج فقط
        maxAge: 24 * 60 * 60 * 1000 // 24 ساعة
      },
      store: new MemorySessionStore({
        checkPeriod: 86400000 // تنظيف الجلسات منتهية الصلاحية كل 24 ساعة
      })
    })
  );
  
  // إعداد Passport للمصادقة
  app.use(passport.initialize());
  app.use(passport.session());
  
  // وظائف تسلسل وإلغاء تسلسل المستخدم
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });
}