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
  const [inflationProbe, setInflationProbe] = useState('');
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
      <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-200 to-violet-200 bg-clip-text text-transparent mb-8">
        📊 Resumen Financiero IA
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-gradient-to-br from-purple-900/30 to-violet-900/30 backdrop-blur-sm rounded-xl shadow-xl p-8 border border-purple-500/30 ai-glow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-purple-300">
              Total Invertido
            </h3>
            <div className="text-4xl">💰</div>
          </div>
          <p className="text-4xl font-bold text-red-400">
            ${summary.totalInvested.toFixed(2)}
          </p>
          <p className="text-sm text-purple-300 mt-2">
            Suma de todas las compras realizadas
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-900/30 to-violet-900/30 backdrop-blur-sm rounded-xl shadow-xl p-8 border border-purple-500/30 ai-glow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-purple-300">
              Total Vendido
            </h3>
            <div className="text-4xl">💵</div>
          </div>
          <p className="text-4xl font-bold text-green-400">
            ${summary.totalSold.toFixed(2)}
          </p>
          <p className="text-sm text-purple-300 mt-2">
            Suma de todas las ventas realizadas
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-900/30 to-violet-900/30 backdrop-blur-sm rounded-xl shadow-xl p-8 border border-purple-500/30 ai-glow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-purple-300">
              Ganancia Bruta
            </h3>
            <div className="text-4xl">📈</div>
          </div>
          <p className={`text-4xl font-bold ${summary.grossProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            ${summary.grossProfit.toFixed(2)}
          </p>
          <p className="text-sm text-purple-300 mt-2">
            Diferencia entre ventas e inversión
          </p>
        </div>
      </div>

      <div className="bg-gradient-to-br from-purple-900/30 to-violet-900/30 backdrop-blur-sm rounded-xl shadow-xl p-8 border border-purple-500/30 ai-glow">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-200 to-violet-200 bg-clip-text text-transparent mb-6">
          📈 Estadísticas del Sistema IA
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-purple-800/30 rounded-lg border border-purple-500/20">
            <h3 className="text-lg font-semibold text-purple-100 mb-4">
              🎯 Productos
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-purple-300">Total de productos:</span>
                <span className="font-semibold text-purple-100">
                  {stats.products}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-300">Productos con stock:</span>
                <span className="font-semibold text-green-400">
                  {stats.withStock}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-300">Productos sin stock:</span>
                <span className="font-semibold text-red-400">
                  {stats.withoutStock}
                </span>
              </div>
            </div>
          </div>

          <div className="p-6 bg-purple-800/30 rounded-lg border border-purple-500/20">
            <h3 className="text-lg font-semibold text-purple-100 mb-4">
              🔄 Movimientos
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-purple-300">Total de compras:</span>
                <span className="font-semibold text-blue-400">
                  {stats.entries}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-300">Total de ventas:</span>
                <span className="font-semibold text-green-400">
                  {stats.sales}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {summary.grossProfit < 0 && (
        <div className="mt-6 bg-gradient-to-r from-red-900/30 to-red-800/30 backdrop-blur-sm border border-red-500/30 rounded-xl p-6 ai-glow">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚠️</span>
            <h3 className="text-lg font-semibold text-red-300">
              Pérdida detectada por IA
            </h3>
          </div>
          <p className="text-red-200 mt-2">
            El sistema IA detectó que el costo de tus compras supera tus ventas. Considera revisar tus precios o estrategia de ventas.
          </p>
        </div>
      )}

      {/* Laboratorio de precios (Investigación) */}
      <div className="mt-8 bg-gradient-to-br from-purple-900/30 to-violet-900/30 backdrop-blur-sm rounded-xl shadow-xl p-8 border border-purple-500/30 ai-glow">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-200 to-violet-200 bg-clip-text text-transparent mb-6">
          🔬 Laboratorio de precios (Investigación)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-purple-300 mb-1">Porcentaje hipotético (%)</label>
            <input
              type="number"
              step="0.1"
              value={inflationProbe}
              onChange={(e) => setInflationProbe(e.target.value)}
              className="w-full px-3 py-2 border border-purple-500/30 rounded-lg bg-purple-900/30 backdrop-blur-sm text-purple-100 placeholder-purple-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all"
              placeholder="Ej: 12"
            />
            {inflationProbe && (
              <p className="mt-2 text-sm text-purple-300">
                Factor simulado:{' '}
                <span className="font-semibold text-green-400">
                  {(1 + (parseFloat(inflationProbe) || 0) / 100).toFixed(4)}x
                </span>
              </p>
            )}
          </div>
          <div className="p-4 bg-purple-800/30 rounded-lg border border-purple-500/20">
            <p className="text-sm text-purple-300 mb-2">Impacto en métricas de precios:</p>
            <ul className="text-sm text-purple-100 space-y-1">
              <li>
                Media precios actual:{' '}
                <span className="font-semibold">
                  ${{/* simple local calc */}}
                  {(() => {
                    const avg = (stats.products === 0) ? 0 : (/* no products list here, provide hint */ 0);
                    return avg.toFixed ? avg.toFixed(2) : '0.00';
                  })()}
                </span>
              </li>
              <li>
                Media precios simulada:{' '}
                <span className="font-semibold">
                  {inflationProbe
                    ? (() => {
                        const factor = 1 + (parseFloat(inflationProbe) || 0) / 100;
                        const avg = (stats.products === 0) ? 0 : 0;
                        const val = avg * factor;
                        return `$${val.toFixed ? val.toFixed(2) : '0.00'}`;
                      })()
                    : '$0.00'}
                </span>
              </li>
              <li className="text-purple-300">Para valores reales, consulta la página de Productos.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

