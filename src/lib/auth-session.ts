import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '@/lib/db';

export const SESSION_COOKIE_NAME = 'audit_session';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

export interface AuthenticatedUser {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  roleId: string;
}

export function createSessionToken(): string {
  return uuidv4();
}

export function buildSessionExpiresAt(): string {
  return new Date(Date.now() + SESSION_TTL_SECONDS * 1000).toISOString();
}

export async function storeSession(token: string, userId: string): Promise<void> {
  const db = await getDb();
  await db.run(
    'INSERT INTO sessions (token, userId, createdAt, expiresAt) VALUES (?, ?, ?, ?)',
    [token, userId, new Date().toISOString(), buildSessionExpiresAt()]
  );
}

export async function deleteSession(token: string): Promise<void> {
  const db = await getDb();
  await db.run('DELETE FROM sessions WHERE token = ?', [token]);
}

export async function getAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return null;
  }

  const db = await getDb();
  const session = await db.get<{ userId: string }>(
    `SELECT userId
     FROM sessions
     WHERE token = ?
       AND datetime(expiresAt) > datetime('now')`,
    [token]
  );

  if (!session) {
    return null;
  }

  const user = await db.get<AuthenticatedUser>(
    'SELECT id, nombre, apellido, email, roleId FROM users WHERE id = ?',
    [session.userId]
  );

  return user ?? null;
}

export async function getSessionTokenFromCookies(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null;
}
