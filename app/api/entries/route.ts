import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function ensureTables() {
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
  await sql`
    CREATE TABLE IF NOT EXISTS entries (
      id VARCHAR(64) PRIMARY KEY,
      product_id VARCHAR(64) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      quantity NUMERIC NOT NULL,
      unit_cost NUMERIC NOT NULL,
      total_cost NUMERIC NOT NULL,
      date TIMESTAMP NOT NULL
    );
  `;
}

export async function GET() {
  try {
    await ensureTables();
    const { rows } = await sql`SELECT id, product_id AS "productId", quantity::float8 AS "quantity", unit_cost::float8 AS "unitCost", total_cost::float8 AS "totalCost", date FROM entries ORDER BY date DESC`;
    return NextResponse.json(rows);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to load entries', details: String(err) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await ensureTables();
    const body = await request.json();
    const id = crypto.randomUUID();
    const { productId, quantity, unitCost } = body;
    if (!productId || typeof quantity !== 'number' || typeof unitCost !== 'number' || quantity <= 0 || unitCost <= 0) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }
    const totalCost = quantity * unitCost;
    const date = new Date();

    await sql`INSERT INTO entries (id, product_id, quantity, unit_cost, total_cost, date) VALUES (${id}, ${productId}, ${quantity}, ${unitCost}, ${totalCost}, ${date.toISOString()})`;

    // Update product stock and invested amount
    await sql`UPDATE products SET current_stock = current_stock + ${quantity}, total_invested = total_invested + ${totalCost} WHERE id = ${productId}`;

    return NextResponse.json({ id, productId, quantity, unitCost, totalCost, date: date.toISOString() }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to create entry', details: String(err) }, { status: 500 });
  }
}