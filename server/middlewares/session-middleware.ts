import { Express } from 'express';
import session from 'express-session';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import MemoryStore from 'memorystore';
import { db } from '../../db/index';
import { users } from '@shared/schema';

/**
 * إعداد جلسات المستخدم والمصادقة باستخدام Passport
 * @param app تطبيق Express
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
  
  // تكوين استراتيجية Passport المحلية
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        // البحث عن المستخدم في قاعدة البيانات
        const user = await db.query.users.findFirst({
          where: (users, { eq }) => eq(users.username, username)
        });
        
        if (!user) {
          return done(null, false, { message: "اسم المستخدم غير صحيح" });
        }
        
        // التحقق من كلمة المرور (يجب استخدام طريقة تشفير آمنة في الإنتاج)
        if (user.password !== password) {
          return done(null, false, { message: "كلمة المرور غير صحيحة" });
        }
        
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );
  
  // وظائف تسلسل وإلغاء تسلسل المستخدم
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });
  
  passport.deserializeUser(async (id: number, done) => {
    try {
      // البحث عن المستخدم بواسطة المعرف
      const user = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.id, id)
      });
      
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
}