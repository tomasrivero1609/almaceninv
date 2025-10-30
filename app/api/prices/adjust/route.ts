import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { ensureAuthTables, getCurrentUser } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function ensureTables() {
  await ensureAuthTables();
  await sql`
    CREATE TABLE IF NOT EXISTS products (
      id VARCHAR(64) PRIMARY KEY,
      code VARCHAR(128) UNIQUE NOT NULL,
      name VARCHAR(256) NOT NULL,
      unit_cost NUMERIC NOT NULL,
      sale_price NUMERIC NOT NULL,
      current_stock NUMERIC NOT NULL DEFAULT 0,
      total_invested NUMERIC NOT NULL DEFAULT 0
    );
  `;
}

export async function POST(request: Request) {
  try {
    await ensureTables();
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }
    const body = await request.json();
    const { percent } = body as { percent?: number };
    if (typeof percent !== 'number' || !isFinite(percent)) {
      return NextResponse.json({ error: 'Invalid percent' }, { status: 400 });
    }
    const factor = 1 + percent / 100;
    if (factor <= 0) {
      return NextResponse.json({ error: 'Percent results in non-positive factor' }, { status: 400 });
    }

    // Adjust prices
    await sql`UPDATE products SET sale_price = sale_price * ${factor}`;

    return NextResponse.json({ ok: true, factor });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to adjust prices', details: String(err) }, { status: 500 });
  }
}
