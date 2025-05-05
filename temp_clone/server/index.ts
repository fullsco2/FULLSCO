import express, { type Request, Response, NextFunction } from "express";
import { setupVite, serveStatic, log } from "./vite";
import { AppConfig } from "./config/app-config";
import path from "path";

// استيراد مسارات واجهة برمجة التطبيق
import { registerRoutes } from "./routes";
import { setupSessionMiddleware } from "./middlewares/session-middleware";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// إعداد جلسات المستخدم والمصادقة
setupSessionMiddleware(app);

// تخديم مجلد التحميلات كمجلد ساكن
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// وسيط تسجيل طلبات واجهة برمجة التطبيق للتصحيح
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // تسجيل جميع مسارات واجهة برمجة التطبيق
  // استخدام السجل القديم، الذي سيستدعي بدوره السجل الجديد
  const server = await registerRoutes(app);

  // وسيط معالجة الأخطاء العامة
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // إعداد Vite في بيئة التطوير فقط
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // تشغيل الخادم على المنفذ المحدد
  const port = AppConfig.server.port;
  
  server.listen(port, () => {
    log(`serving on port ${port}`);
  });
})();
