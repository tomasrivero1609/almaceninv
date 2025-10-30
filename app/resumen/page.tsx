"use client";

import { useEffect, useState } from 'react';
import { getEntries, getProducts, getSales } from '@/lib/storage';
import { Summary } from '@/types';
import { useToastContext } from '@/components/ToastProvider';

export default function ResumenPage() {
  const [summary, setSummary] = useState<Summary>({ totalInvested: 0, totalSold: 0, grossProfit: 0 });
  const [stats, setStats] = useState({ products: 0, withStock: 0, withoutStock: 0, entries: 0, sales: 0 });
  const [loading, setLoading] = useState(true);
  const [sellerStats, setSellerStats] = useState<Array<{ sellerId?: string; sellerName: string; today: number; week: number; month: number; total: number }>>([]);
  const toast = useToastContext();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
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
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfWeek = new Date(startOfDay);
        const weekday = (startOfWeek.getDay() + 6) % 7; // Monday as start of week
        startOfWeek.setDate(startOfWeek.getDate() - weekday);
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const transactions = new Map<string, { sellerId?: string; sellerName: string; date: Date }>();
        for (const sale of sales) {
          const key = sale.transactionId || sale.id;
          const saleDate = new Date(sale.date);
          const existing = transactions.get(key);
          const sellerName = sale.sellerName ?? existing?.sellerName ?? 'Sin asignar';
          const sellerId = sale.sellerId ?? existing?.sellerId;
          if (!existing) {
            transactions.set(key, { sellerId, sellerName, date: saleDate });
          } else {
            if (saleDate < existing.date) {
              existing.date = saleDate;
            }
            existing.sellerName = sellerName;
            if (sellerId) {
              existing.sellerId = sellerId;
            }
          }
        }

        const metrics = new Map<string, { sellerId?: string; sellerName: string; today: number; week: number; month: number; total: number }>();
        transactions.forEach(({ sellerId, sellerName, date }) => {
          const key = sellerId ?? sellerName;
          const record = metrics.get(key) ?? { sellerId, sellerName, today: 0, week: 0, month: 0, total: 0 };
          record.total += 1;
          if (date >= startOfDay) record.today += 1;
          if (date >= startOfWeek) record.week += 1;
          if (date >= startOfMonth) record.month += 1;
          metrics.set(key, record);
        });

        const ordered = Array.from(metrics.values()).sort((a, b) => {
          if (b.month !== a.month) return b.month - a.month;
          if (b.total !== a.total) return b.total - a.total;
          return a.sellerName.localeCompare(b.sellerName);
        });
        setSellerStats(ordered);
      } catch (error) {
        toast.error('Error al cargar el resumen');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [toast]);

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-8">Resumen Financiero</h1>

      {loading ? (
        <div className="rounded-xl shadow-sm p-12 text-center border border-zinc-200/20 bg-white/70 dark:bg-zinc-900/50">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
          <p className="mt-4 text-zinc-500 dark:text-zinc-400">Cargando resumen...</p>
        </div>
      ) : (
        <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="rounded-xl shadow-sm p-8 border border-zinc-200/30 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/50">
          <h3 className="text-lg font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Total Invertido</h3>
          <p className="text-4xl font-bold text-zinc-900 dark:text-zinc-100">${summary.totalInvested.toFixed(2)}</p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">Suma de todas las compras realizadas</p>
        </div>
        <div className="rounded-xl shadow-sm p-8 border border-zinc-200/30 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/50">
          <h3 className="text-lg font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Total Vendido</h3>
          <p className="text-4xl font-bold text-zinc-900 dark:text-zinc-100">${summary.totalSold.toFixed(2)}</p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">Suma de todas las ventas realizadas</p>
        </div>
        <div className="rounded-xl shadow-sm p-8 border border-zinc-200/30 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/50">
          <h3 className="text-lg font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Ganancia Bruta</h3>
          <p className={`text-4xl font-bold ${summary.grossProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>${summary.grossProfit.toFixed(2)}</p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">Diferencia entre ventas e inversión</p>
        </div>
      </div>

      <div className="rounded-xl shadow-sm p-8 border border-zinc-200/30 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/50">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">Estadísticas del Sistema</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-lg border border-zinc-200/30 dark:border-zinc-800 bg-white/50 dark:bg-zinc-950/30">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Productos</h3>
            <div className="space-y-3 text-zinc-700 dark:text-zinc-300">
              <div className="flex justify-between"><span>Total de productos:</span><span className="font-semibold">{stats.products}</span></div>
              <div className="flex justify-between"><span>Productos con stock:</span><span className="font-semibold text-green-600 dark:text-green-400">{stats.withStock}</span></div>
              <div className="flex justify-between"><span>Productos sin stock:</span><span className="font-semibold text-red-600 dark:text-red-400">{stats.withoutStock}</span></div>
            </div>
          </div>
          <div className="p-6 rounded-lg border border-zinc-200/30 dark:border-zinc-800 bg-white/50 dark:bg-zinc-950/30">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Movimientos</h3>
            <div className="space-y-3 text-zinc-700 dark:text-zinc-300">
              <div className="flex justify-between"><span>Total de compras:</span><span className="font-semibold">{stats.entries}</span></div>
              <div className="flex justify-between"><span>Total de ventas:</span><span className="font-semibold">{stats.sales}</span></div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 rounded-xl shadow-sm p-8 border border-zinc-200/30 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/50">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">Actividad por vendedor</h2>
        {sellerStats.length === 0 ? (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">No hay ventas registradas por ahora.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-zinc-200/40 dark:divide-zinc-800/50 text-sm">
              <thead className="bg-zinc-50/80 dark:bg-zinc-950/20">
                <tr className="text-left uppercase tracking-wide text-xs text-zinc-500 dark:text-zinc-400">
                  <th className="px-4 py-3 font-semibold">Vendedor</th>
                  <th className="px-4 py-3 font-semibold text-center">Hoy</th>
                  <th className="px-4 py-3 font-semibold text-center">Semana</th>
                  <th className="px-4 py-3 font-semibold text-center">Mes</th>
                  <th className="px-4 py-3 font-semibold text-center">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/40 dark:divide-zinc-800/50">
                {sellerStats.map((seller) => (
                  <tr key={seller.sellerId ?? seller.sellerName} className="bg-white/70 dark:bg-zinc-900/40">
                    <td className="px-4 py-3">
                      <div className="font-medium text-zinc-900 dark:text-zinc-100">{seller.sellerName}</div>
                      {seller.sellerId && (
                        <div className="text-xs text-zinc-500 dark:text-zinc-400">ID: {seller.sellerId}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center text-zinc-800 dark:text-zinc-200 font-semibold">{seller.today}</td>
                    <td className="px-4 py-3 text-center text-zinc-800 dark:text-zinc-200 font-semibold">{seller.week}</td>
                    <td className="px-4 py-3 text-center text-zinc-800 dark:text-zinc-200 font-semibold">{seller.month}</td>
                    <td className="px-4 py-3 text-center text-zinc-800 dark:text-zinc-200 font-semibold">{seller.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {summary.grossProfit < 0 && (
        <div className="mt-6 border border-red-200/40 dark:border-red-800/40 rounded-xl p-6 bg-red-50 dark:bg-red-900/20">
          <h3 className="text-lg font-semibold text-red-700 dark:text-red-300">Pérdida detectada</h3>
          <p className="text-red-700 dark:text-red-200 mt-2">El costo de tus compras supera tus ventas. Considera revisar tus precios o estrategia de ventas.</p>
        </div>
      )}
        </>
      )}
    </div>
  );
}
