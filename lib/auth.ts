import 'server-only';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import User from '@/models/User';
import { connectDB } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'gov-feedback-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';
const INVITE_TOKEN_EXPIRES = 48 * 60 * 60 * 1000;
const PASSWORD_RESET_EXPIRES = 60 * 60 * 1000;

// Encode secret for jose (Edge-compatible)
const secretKey = new TextEncoder().encode(JWT_SECRET);

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  assignedDistrict?: string;
  assignedTalukas?: string[];
}

export async function hashPassword(password: string): Promise<string> {
  const bcrypt = await import('bcryptjs');
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  const bcrypt = await import('bcryptjs');
  return bcrypt.compare(password, hashedPassword);
}

export async function generateToken(payload: JWTPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRES_IN)
    .sign(secretKey);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey, {
      algorithms: ['HS256'],
    });
    // Validate that the payload has required fields
    const p = payload as Record<string, unknown>;
    if (
      typeof p.userId === 'string' &&
      typeof p.email === 'string' &&
      typeof p.role === 'string'
    ) {
      return {
        userId: p.userId,
        email: p.email,
        role: p.role,
        assignedDistrict: p.assignedDistrict as string ,
        assignedTalukas: p.assignedTalukas as string[] | undefined,
      };
    }
    return null;
  } catch {
    return null;
  }
}

export async function generateInviteToken(): Promise<string> {
  return new SignJWT({ type: 'invite' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('48h')
    .sign(secretKey);
}

export async function generatePasswordResetToken(): Promise<string> {
  return new SignJWT({ type: 'reset' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(secretKey);
}

export async function verifyInviteToken(token: string): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, secretKey, {
      algorithms: ['HS256'],
    });
    return (payload as { type: string }).type === 'invite';
  } catch {
    return false;
  }
}

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60,
    path: '/',
  });
}

export async function getAuthCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get('auth-token')?.value || null;
}

export async function removeAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete('auth-token');
}

export async function getCurrentUser(): Promise<JWTPayload | null> {
  const token = await getAuthCookie();
  if (!token) return null;
  return verifyToken(token);
}

export async function requireAuth(requiredRole?: string): Promise<JWTPayload> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Unauthorized');
  }
  if (requiredRole && user.role !== requiredRole && user.role !== 'ADMIN') {
    throw new Error('Forbidden');
  }
  return user;
}

export async function getUserById(userId: string) {
  await connectDB();
  return User.findById(userId).select('-password');
}

export { INVITE_TOKEN_EXPIRES, PASSWORD_RESET_EXPIRES };
