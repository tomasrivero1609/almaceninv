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
    CREATE TABLE IF NOT EXISTS sales (
      id VARCHAR(64) PRIMARY KEY,
      product_id VARCHAR(64) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      quantity NUMERIC NOT NULL,
      unit_price NUMERIC NOT NULL,
      total_revenue NUMERIC NOT NULL,
      date TIMESTAMP NOT NULL
    );
  `;
}

export async function GET() {
  try {
    await ensureTables();
    const { rows } = await sql`
      SELECT
        s.id,
        s.product_id AS "productId",
        p.name AS "productName",
        p.code AS "productCode",
        s.quantity::float8 AS "quantity",
        s.unit_price::float8 AS "unitPrice",
        s.total_revenue::float8 AS "totalRevenue",
        s.date
      FROM sales s
      JOIN products p ON s.product_id = p.id
      ORDER BY s.date DESC
    `;
    return NextResponse.json(rows);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to load sales', details: String(err) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await ensureTables();
    const body = await request.json();
    const id = crypto.randomUUID();
    const { productId, quantity, unitPrice } = body;
    if (!productId || typeof quantity !== 'number' || typeof unitPrice !== 'number' || quantity <= 0 || unitPrice <= 0) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    // Check stock
    const { rows: prodRows } = await sql`SELECT current_stock, name, code FROM products WHERE id = ${productId}`;
    if (prodRows.length === 0) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    const currentStock = Number(prodRows[0].current_stock);
    if (currentStock < quantity) {
      return NextResponse.json({ error: 'Insufficient stock' }, { status: 400 });
    }

    const totalRevenue = quantity * unitPrice;
    const date = new Date();

    await sql`INSERT INTO sales (id, product_id, quantity, unit_price, total_revenue, date) VALUES (${id}, ${productId}, ${quantity}, ${unitPrice}, ${totalRevenue}, ${date.toISOString()})`;

    // Update product stock
    await sql`UPDATE products SET current_stock = current_stock - ${quantity} WHERE id = ${productId}`;

    return NextResponse.json({ id, productId, productName: prodRows[0].name, productCode: prodRows[0].code, quantity, unitPrice, totalRevenue, date: date.toISOString() }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to create sale', details: String(err) }, { status: 500 });
  }
}