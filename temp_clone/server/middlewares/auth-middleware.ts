import { Request, Response, NextFunction } from 'express';

/**
 * وسيطة للتحقق من أن المستخدم مسجل الدخول
 */
export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "غير مصرح به: يجب تسجيل الدخول" });
};

/**
 * وسيطة للتحقق من أن المستخدم مسؤول
 */
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated() && req.user && (req.user as any).role === "admin") {
    return next();
  }
  res.status(403).json({ message: "محظور: مطلوب صلاحيات المسؤول" });
};

/**
 * وسيطة للتحقق من أن المستخدم هو المؤلف أو مسؤول
 */
export const isAuthorOrAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "غير مصرح به: يجب تسجيل الدخول" });
  }

  const userId = (req.user as any).id;
  const authorId = parseInt(req.params.authorId || req.body.authorId);

  if ((req.user as any).role === "admin" || (userId === authorId)) {
    return next();
  }
  
  res.status(403).json({ message: "محظور: غير مصرح لك بهذه العملية" });
};