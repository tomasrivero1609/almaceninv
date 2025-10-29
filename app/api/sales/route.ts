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
      date TIMESTAMP NOT NULL,
      transaction_id VARCHAR(64)
    );
  `;
  // Backfill column for existing deployments if missing
  await sql`ALTER TABLE IF EXISTS sales ADD COLUMN IF NOT EXISTS transaction_id VARCHAR(64)`;
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
        s.date,
        s.transaction_id AS "transactionId"
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

    // Batch payload: { items: [{ productId, quantity }] }
    if (Array.isArray(body?.items)) {
      const items = body.items as Array<{ productId?: string; quantity?: number }>;
      if (items.length === 0) {
        return NextResponse.json({ error: 'No items provided' }, { status: 400 });
      }

      // Basic validation
      for (const it of items) {
        const q = Number(it?.quantity);
        if (!it?.productId || !Number.isFinite(q) || q <= 0) {
          return NextResponse.json({ error: 'Invalid item payload' }, { status: 400 });
        }
      }

      const transactionId = crypto.randomUUID();
      const date = new Date();

      // Run atomically using explicit BEGIN/COMMIT
      const resultItems: any[] = [];
      await sql`BEGIN`;
      try {
        for (const it of items) {
          const productId = String(it.productId);
          const quantity = Number(it.quantity);
          // Lock product row to avoid race conditions
          const { rows: prodRows } = await sql`SELECT id, name, code, sale_price::float8 AS sale_price, current_stock::float8 AS current_stock FROM products WHERE id = ${productId} FOR UPDATE`;
          if (prodRows.length === 0) {
            throw new Error('Product not found');
          }
          const product = prodRows[0];
          const currentStock = Number(product.current_stock);
          if (currentStock < quantity) {
            throw new Error(`Insufficient stock for product ${product.code}`);
          }

          const unitPrice = Number(product.sale_price);
          if (!(unitPrice > 0)) {
            throw new Error(`Invalid sale price for product ${product.code}`);
          }
          const totalRevenue = quantity * unitPrice;
          const id = crypto.randomUUID();

          await sql`INSERT INTO sales (id, product_id, quantity, unit_price, total_revenue, date, transaction_id) VALUES (${id}, ${productId}, ${quantity}, ${unitPrice}, ${totalRevenue}, ${date.toISOString()}, ${transactionId})`;
          await sql`UPDATE products SET current_stock = current_stock - ${quantity} WHERE id = ${productId}`;

          resultItems.push({ id, productId, productName: product.name, productCode: product.code, quantity, unitPrice, totalRevenue, date: date.toISOString(), transactionId });
        }
        await sql`COMMIT`;
      } catch (e) {
        await sql`ROLLBACK`;
        throw e;
      }

      const total = resultItems.reduce((s, it) => s + Number(it.totalRevenue), 0);
      return NextResponse.json({ transactionId, date: date.toISOString(), totalRevenue: total, items: resultItems }, { status: 201 });
    }

    // Backwards compatible: single item payload
    const id = crypto.randomUUID();
    const { productId, quantity, unitPrice } = body;
    if (!productId || typeof quantity !== 'number' || typeof unitPrice !== 'number' || quantity <= 0 || unitPrice <= 0) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const { rows: prodRows } = await sql`SELECT current_stock, name, code FROM products WHERE id = ${productId}`;
    if (prodRows.length === 0) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    const currentStock = Number(prodRows[0].current_stock);
    if (currentStock < quantity) {
      return NextResponse.json({ error: 'Insufficient stock' }, { status: 400 });
    }

    const totalRevenue = quantity * unitPrice;
    const date = new Date();

    await sql`INSERT INTO sales (id, product_id, quantity, unit_price, total_revenue, date) VALUES (${id}, ${productId}, ${quantity}, ${unitPrice}, ${totalRevenue}, ${date.toISOString()})`;
    await sql`UPDATE products SET current_stock = current_stock - ${quantity} WHERE id = ${productId}`;

    return NextResponse.json({ id, productId, productName: prodRows[0].name, productCode: prodRows[0].code, quantity, unitPrice, totalRevenue, date: date.toISOString() }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to create sale', details: String(err) }, { status: 500 });
  }
}
