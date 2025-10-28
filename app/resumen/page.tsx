'use client';

import { useState, useEffect } from 'react';
import { getProducts, getEntries, getSales } from '@/lib/storage';
import { Summary } from '@/types';

export default function ResumenPage() {
  const [summary, setSummary] = useState<Summary>({
    totalInvested: 0,
    totalSold: 0,
    grossProfit: 0,
  });
  const [stats, setStats] = useState({
    products: 0,
    withStock: 0,
    withoutStock: 0,
    entries: 0,
    sales: 0,
  });

  useEffect(() => {
    const load = async () => {
      const [products, entries, sales] = await Promise.all([getProducts(), getEntries(), getSales()]);
      const totalInvested = entries.reduce((sum, entry) => sum + entry.totalCost, 0);
      const totalSold = sales.reduce((sum, sale) => sum + sale.totalRevenue, 0);
      const grossProfit = totalSold - totalInvested;

      setSummary({ totalInvested, totalSold, grossProfit });
      setStats({
        products: products.length,
        withStock: products.filter(p => p.currentStock > 0).length,
        withoutStock: products.filter(p => p.currentStock === 0).length,
        entries: entries.length,
        sales: sales.length,
      });
    };
    load();
  }, []);

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-8">
        Resumen Financiero
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-8 border border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-zinc-700 dark:text-zinc-300">
              Total Invertido
            </h3>
            <div className="text-4xl">💰</div>
          </div>
          <p className="text-4xl font-bold text-red-600 dark:text-red-400">
            ${summary.totalInvested.toFixed(2)}
          </p>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">
            Suma de todas las compras realizadas
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-8 border border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-zinc-700 dark:text-zinc-300">
              Total Vendido
            </h3>
            <div className="text-4xl">💵</div>
          </div>
          <p className="text-4xl font-bold text-green-600 dark:text-green-400">
            ${summary.totalSold.toFixed(2)}
          </p>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">
            Suma de todas las ventas realizadas
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-8 border border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-zinc-700 dark:text-zinc-300">
              Ganancia Bruta
            </h3>
            <div className="text-4xl">📈</div>
          </div>
          <p className={`text-4xl font-bold ${summary.grossProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            ${summary.grossProfit.toFixed(2)}
          </p>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">
            Diferencia entre ventas e inversión
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-8 border border-zinc-200 dark:border-zinc-800">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">
          Estadísticas
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-zinc-50 dark:bg-zinc-950 rounded-lg">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
              Productos
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-zinc-600 dark:text-zinc-400">Total de productos:</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {stats.products}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600 dark:text-zinc-400">Productos con stock:</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {stats.withStock}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600 dark:text-zinc-400">Productos sin stock:</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {stats.withoutStock}
                </span>
              </div>
            </div>
          </div>

          <div className="p-6 bg-zinc-50 dark:bg-zinc-950 rounded-lg">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
              Movimientos
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-zinc-600 dark:text-zinc-400">Total de compras:</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {stats.entries}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600 dark:text-zinc-400">Total de ventas:</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {stats.sales}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {summary.grossProfit < 0 && (
        <div className="mt-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚠️</span>
            <h3 className="text-lg font-semibold text-red-900 dark:text-red-100">
              Pérdida detectada
            </h3>
          </div>
          <p className="text-red-700 dark:text-red-300 mt-2">
            El costo de tus compras supera tus ventas. Considera revisar tus precios o estrategia de ventas.
          </p>
        </div>
      )}
    </div>
  );
}

