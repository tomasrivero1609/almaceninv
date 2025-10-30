import { NextResponse, type NextRequest } from 'next/server';
import { invalidateSession, clearSessionCookie } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('session')?.value;
    if (token) {
      await invalidateSession(token);
    }
    const response = NextResponse.json({ ok: true });
    clearSessionCookie(response);
    return response;
  } catch (error) {
    return NextResponse.json({ error: 'No fue posible cerrar sesion', details: String(error) }, { status: 500 });
  }
}


