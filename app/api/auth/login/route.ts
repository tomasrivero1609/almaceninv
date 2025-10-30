import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import {
  ensureDefaultAdmin,
  verifyPassword,
  createSession,
  setSessionCookie,
} from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    await ensureDefaultAdmin();
    const body = await request.json();
    const username = String(body?.username ?? '').trim();
    const password = String(body?.password ?? '');

    if (!username || !password) {
      return NextResponse.json({ error: 'Credenciales incompletas' }, { status: 400 });
    }

    const { rows } = await sql`
      SELECT id, username, role, password_hash
      FROM users
      WHERE username = ${username}
    `;

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Usuario o contrasena incorrectos' }, { status: 401 });
    }

    const user = rows[0];
    const valid = verifyPassword(password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ error: 'Usuario o contrasena incorrectos' }, { status: 401 });
    }

    const { token, expiresAt } = await createSession(user.id);
    const response = NextResponse.json({ id: user.id, username: user.username, role: user.role });
    setSessionCookie(response, token, expiresAt);
    return response;
  } catch (error) {
    return NextResponse.json({ error: 'No fue posible iniciar sesion', details: String(error) }, { status: 500 });
  }
}



