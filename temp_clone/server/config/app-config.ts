/**
 * تكوين التطبيق
 * يحتوي على الإعدادات العامة للتطبيق
 */
export const AppConfig = {
  server: {
    port: process.env.PORT || 5000,
    apiPrefix: '/api',
    sessionSecret: process.env.SESSION_SECRET || 'fullsco-secret-key',
    uploadsDir: './uploads',
    jwtSecret: process.env.JWT_SECRET || 'fullsco-jwt-secret',
    jwtExpiration: '24h'
  },
  database: {
    url: process.env.DATABASE_URL,
    host: process.env.PGHOST,
    port: process.env.PGPORT,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE
  },
  mail: {
    from: process.env.MAIL_FROM || 'noreply@fullsco.com',
    smtp: {
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    }
  },
  development: {
    enableFakeAuth: process.env.NODE_ENV === 'development',
    logLevel: process.env.NODE_ENV === 'production' ? 'error' : 'debug'
  }
};