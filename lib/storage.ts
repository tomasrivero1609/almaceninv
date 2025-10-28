import { Product, Entry, Sale } from '@/types';

// Products (API-backed)
export const getProducts = async (): Promise<Product[]> => {
  const res = await fetch('/api/products', { cache: 'no-store' });
  if (!res.ok) throw new Error('Error al cargar productos');
  return res.json();
};

export const addProduct = async (product: Omit<Product, 'id' | 'currentStock' | 'totalInvested'>): Promise<Product> => {
  const res = await fetch('/api/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product),
  });
  if (!res.ok) throw new Error('Error al crear producto');
  return res.json();
};

export const updateProduct = async (id: string, updates: Partial<Product>): Promise<void> => {
  const res = await fetch('/api/products', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, ...updates }),
  });
  if (!res.ok) throw new Error('Error al actualizar producto');
};

export const deleteProduct = async (id: string): Promise<void> => {
  const res = await fetch(`/api/products?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Error al eliminar producto');
};

// Entries
export const getEntries = async (): Promise<Entry[]> => {
  const res = await fetch('/api/entries', { cache: 'no-store' });
  if (!res.ok) throw new Error('Error al cargar entradas');
  return res.json();
};

export const addEntry = async (entry: Omit<Entry, 'id' | 'date' | 'totalCost'> & { totalCost: number }): Promise<Entry> => {
  const res = await fetch('/api/entries', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entry),
  });
  if (!res.ok) throw new Error('Error al registrar entrada');
  return res.json();
};

// Sales
export const getSales = async (): Promise<Sale[]> => {
  const res = await fetch('/api/sales', { cache: 'no-store' });
  if (!res.ok) throw new Error('Error al cargar ventas');
  return res.json();
};

export const addSale = async (sale: Omit<Sale, 'id' | 'date' | 'totalRevenue'> & { totalRevenue: number }): Promise<Sale> => {
  const res = await fetch('/api/sales', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sale),
  });
  if (!res.ok) throw new Error('Error al registrar venta');
  return res.json();
};

