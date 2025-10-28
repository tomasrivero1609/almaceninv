'use client';

import Link from 'next/link';
import { getProducts, getEntries, getSales } from '@/lib/storage';
import { useEffect, useState } from 'react';

export default function Home() {
  const [counts, setCounts] = useState({ products: 0, entries: 0, sales: 0 });

  useEffect(() => {
    const load = async () => {
      const [products, entries, sales] = await Promise.all([
        getProducts(),
        getEntries(),
        getSales(),
      ]);
      setCounts({
        products: products.length,
        entries: entries.length,
        sales: sales.length,
      });
    };
    load();
  }, []);

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
          Sistema de Inventario
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          Gestión completa de productos, entradas y salidas
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <Link href="/productos" className="group">
          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6 hover:shadow-lg transition-shadow border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Productos</p>
                <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">{counts.products}</p>
              </div>
              <div className="text-4xl">📦</div>
            </div>
          </div>
        </Link>

        <Link href="/entradas" className="group">
          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6 hover:shadow-lg transition-shadow border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Entradas</p>
                <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">{counts.entries}</p>
              </div>
              <div className="text-4xl">⬇️</div>
            </div>
          </div>
        </Link>

        <Link href="/salidas" className="group">
          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6 hover:shadow-lg transition-shadow border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Salidas</p>
                <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">{counts.sales}</p>
              </div>
              <div className="text-4xl">⬆️</div>
            </div>
          </div>
        </Link>

        <Link href="/resumen" className="group">
          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6 hover:shadow-lg transition-shadow border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Resumen</p>
                <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">📊</p>
              </div>
              <div className="text-4xl">💰</div>
            </div>
          </div>
        </Link>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-8 border border-zinc-200 dark:border-zinc-800">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">¿Cómo funciona?</h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2 flex items-center gap-2">
              📦 Productos
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400">
              Administra tus productos con nombre, código, costo unitario, precio de venta y stock actual.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2 flex items-center gap-2">
              ⬇️ Entradas (Compras)
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400">
              Registra compras que aumentan el stock y calculan el costo total invertido.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2 flex items-center gap-2">
              ⬆️ Salidas (Ventas)
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400">
              Registra ventas que disminuyen el stock y calculan los ingresos totales.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2 flex items-center gap-2">
              💰 Resumen Financiero
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400">
              Visualiza el total invertido, vendido y la ganancia bruta de tu negocio.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
