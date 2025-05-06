// src/lib/auth.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import { db } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { users } from '@/shared/schema';
import { User } from '@/types/user';

const scryptAsync = promisify(scrypt);

type SessionUser = {
  id: number;
  username: string;
  email: string;
  role: string;
  name?: string;
  avatar?: string;
};

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString('hex')}.${salt}`;
}

export async function verifyPassword(suppliedPassword: string, storedPassword: string): Promise<boolean> {
  const [hashedPassword, salt] = storedPassword.split('.');
  const hashedPasswordBuf = Buffer.from(hashedPassword, 'hex');
  const suppliedPasswordBuf = (await scryptAsync(suppliedPassword, salt, 64)) as Buffer;
  return timingSafeEqual(hashedPasswordBuf, suppliedPasswordBuf);
}

export async function getUserByUsername(username: string) {
  const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getUserById(id: number) {
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export function createSessionCookie(user: SessionUser) {
  // تخزين معلومات المستخدم في الجلسة بدون كلمة المرور
  const sessionData = JSON.stringify({
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    name: user.name,
    avatar: user.avatar,
  });
  
  // تحويل البيانات إلى Base64 للتخزين في الكوكيز
  const encodedSessionData = Buffer.from(sessionData).toString('base64');
  
  // إنشاء كوكي آمن مع خيارات مناسبة
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // أسبوع واحد
    path: '/',
  };
  
  return { name: 'session', value: encodedSessionData, options: cookieOptions };
}

export function getUserFromSession(req: NextRequest): User | null {
  const sessionCookie = req.cookies.get('session');
  
  if (!sessionCookie?.value) {
    return null;
  }
  
  try {
    // فك تشفير البيانات من Base64
    const decodedSessionData = Buffer.from(sessionCookie.value, 'base64').toString();
    return JSON.parse(decodedSessionData) as User;
  } catch (error) {
    console.error('Error parsing session cookie:', error);
    return null;
  }
}

export function getUserFromSessionServer(): User | null {
  const sessionCookie = cookies().get('session');
  
  if (!sessionCookie?.value) {
    return null;
  }
  
  try {
    // فك تشفير البيانات من Base64
    const decodedSessionData = Buffer.from(sessionCookie.value, 'base64').toString();
    return JSON.parse(decodedSessionData) as User;
  } catch (error) {
    console.error('Error parsing session cookie:', error);
    return null;
  }
}

export function removeSessionCookie() {
  // إزالة الكوكي عن طريق تعيين قيمة فارغة وتاريخ انتهاء في الماضي
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 0,
    path: '/',
  };
  
  return { name: 'session', value: '', options: cookieOptions };
}
