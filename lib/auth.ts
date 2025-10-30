import { sql } from '@vercel/postgres';
import crypto from 'crypto';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export type UserRole = 'admin' | 'seller';

export interface AuthUser {
  id: string;
  username: string;
  role: UserRole;
}

const HASH_ITERATIONS = 120_000;
const HASH_KEYLEN = 64;
const HASH_DIGEST = 'sha512';

export async function ensureAuthTables() {
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(64) PRIMARY KEY,
      username VARCHAR(64) UNIQUE NOT NULL,
      password_hash VARCHAR(256) NOT NULL,
      role VARCHAR(16) NOT NULL CHECK (role IN ('admin', 'seller')),
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS sessions (
      token VARCHAR(128) PRIMARY KEY,
      user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at TIMESTAMP NOT NULL
    );
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS sessions_expires_idx ON sessions (expires_at);
  `;

  // Ensure sales.seller_id column exists and references users
  await sql`
    ALTER TABLE IF EXISTS sales
    ADD COLUMN IF NOT EXISTS seller_id VARCHAR(64) REFERENCES users(id)
  `;
}

export async function ensureDefaultAdmin() {
  await ensureAuthTables();
  const { rows } = await sql`SELECT id FROM users WHERE role = 'admin' LIMIT 1`;
  if (rows.length > 0) {
    await ensureDefaultSeller();
    return;
  }

  const username = process.env.DEFAULT_ADMIN_USER ?? 'admin';
  const password = process.env.DEFAULT_ADMIN_PASSWORD ?? 'admin123';
  const id = crypto.randomUUID();
  const passwordHash = hashPassword(password);

  await sql`
    INSERT INTO users (id, username, password_hash, role)
    VALUES (${id}, ${username}, ${passwordHash}, 'admin')
    ON CONFLICT (username) DO NOTHING
  `;
  await ensureDefaultSeller();
}

async function ensureDefaultSeller() {
  const { rows } = await sql`SELECT id FROM users WHERE role = 'seller' LIMIT 1`;
  if (rows.length > 0) return;
  const username = process.env.DEFAULT_SELLER_USER ?? 'seller';
  const password = process.env.DEFAULT_SELLER_PASSWORD ?? 'seller123';
  const id = crypto.randomUUID();
  const passwordHash = hashPassword(password);
  await sql`
    INSERT INTO users (id, username, password_hash, role)
    VALUES (${id}, ${username}, ${passwordHash}, 'seller')
    ON CONFLICT (username) DO NOTHING
  `;
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16);
  const hash = crypto.pbkdf2Sync(password, salt, HASH_ITERATIONS, HASH_KEYLEN, HASH_DIGEST);
  return `${HASH_ITERATIONS}:${salt.toString('hex')}:${hash.toString('hex')}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [iterationStr, saltHex, hashHex] = stored.split(':');
  const iterations = Number(iterationStr);
  if (!iterations || !saltHex || !hashHex) {
    return false;
  }
  const salt = Buffer.from(saltHex, 'hex');
  const hash = crypto.pbkdf2Sync(password, salt, iterations, HASH_KEYLEN, HASH_DIGEST);
  return crypto.timingSafeEqual(hash, Buffer.from(hashHex, 'hex'));
}

export async function createSession(userId: string, ttlHours = 12) {
  await cleanupExpiredSessions();
  const token = crypto.randomUUID().replace(/-/g, '') + crypto.randomBytes(12).toString('hex');
  const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000);
  await sql`
    INSERT INTO sessions (token, user_id, expires_at)
    VALUES (${token}, ${userId}, ${expiresAt.toISOString()})
  `;
  return { token, expiresAt };
}

export async function invalidateSession(token: string) {
  await sql`DELETE FROM sessions WHERE token = ${token}`;
}

export async function cleanupExpiredSessions() {
  await sql`DELETE FROM sessions WHERE expires_at < NOW()`;
}

export async function getUserBySessionToken(token: string): Promise<AuthUser | null> {
  if (!token) return null;
  const { rows } = await sql`
    SELECT u.id, u.username, u.role
    FROM sessions s
    JOIN users u ON u.id = s.user_id
    WHERE s.token = ${token} AND s.expires_at > NOW()
  `;
  if (rows.length === 0) return null;
  return rows[0] as AuthUser;
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;
  if (!token) return null;
  return getUserBySessionToken(token);
}

export function setSessionCookie(response: NextResponse, token: string, expiresAt: Date) {
  response.cookies.set({
    name: 'session',
    value: token,
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    expires: expiresAt,
  });
  return response;
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set({
    name: 'session',
    value: '',
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 0,
  });
  return response;
}

