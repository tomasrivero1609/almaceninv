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
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }
    const { rows } = await sql`
      SELECT
        e.id,
        e.product_id AS "productId",
        p.name AS "productName",
        p.code AS "productCode",
        e.quantity::float8 AS "quantity",
        e.unit_cost::float8 AS "unitCost",
        e.total_cost::float8 AS "totalCost",
        e.date
      FROM entries e
      JOIN products p ON e.product_id = p.id
      ORDER BY e.date DESC
    `;
    return NextResponse.json(rows);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to load entries', details: String(err) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await ensureTables();
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }
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

    // Update product unit_cost to the new average cost
    await sql`UPDATE products SET unit_cost = total_invested / current_stock WHERE id = ${productId} AND current_stock > 0`;

    // Fetch product code/name for immediate UI consistency
    const { rows: prodRows } = await sql`SELECT name, code FROM products WHERE id = ${productId}`;
    const productName = prodRows[0]?.name ?? '';
    const productCode = prodRows[0]?.code ?? '';

    return NextResponse.json({ id, productId, productName, productCode, quantity, unitCost, totalCost, date: date.toISOString() }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to create entry', details: String(err) }, { status: 500 });
  }
}
