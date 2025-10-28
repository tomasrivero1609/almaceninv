import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

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
}

export async function GET() {
  try {
    await ensureTables();
    const { rows } = await sql`SELECT id, code, name, unit_cost AS "unitCost", sale_price AS "salePrice", current_stock AS "currentStock", total_invested AS "totalInvested" FROM products ORDER BY name ASC`;
    return NextResponse.json(rows);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to load products', details: String(err) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await ensureTables();
    const body = await request.json();
    const id = crypto.randomUUID();
    const { name, code, unitCost, salePrice } = body;
    if (!name || !code || typeof unitCost !== 'number' || typeof salePrice !== 'number') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }
    await sql`
      INSERT INTO products (id, code, name, unit_cost, sale_price, current_stock, total_invested)
      VALUES (${id}, ${code}, ${name}, ${unitCost}, ${salePrice}, 0, 0)
    `;
    return NextResponse.json({ id, name, code, unitCost, salePrice, currentStock: 0, totalInvested: 0 }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to create product', details: String(err) }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await ensureTables();
    const body = await request.json();
    const { id, name, code, unitCost, salePrice } = body;
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    // Update only provided fields
    const fields: string[] = [];
    const values: any[] = [];
    if (name !== undefined) { fields.push(`name = $${fields.length + 1}`); values.push(name); }
    if (code !== undefined) { fields.push(`code = $${fields.length + 1}`); values.push(code); }
    if (unitCost !== undefined) { fields.push(`unit_cost = $${fields.length + 1}`); values.push(unitCost); }
    if (salePrice !== undefined) { fields.push(`sale_price = $${fields.length + 1}`); values.push(salePrice); }

    if (fields.length === 0) return NextResponse.json({ ok: true });

    const query = `UPDATE products SET ${fields.join(', ')} WHERE id = $${fields.length + 1}`;
    await sql.query(query, [...values, id]);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update product', details: String(err) }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await ensureTables();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    await sql`DELETE FROM products WHERE id = ${id}`;
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to delete product', details: String(err) }, { status: 500 });
  }
}