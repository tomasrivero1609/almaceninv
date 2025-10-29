'use client';

import Link from 'next/link';
import { getProducts, getEntries, getSales } from '@/lib/storage';
import { useEffect, useState } from 'react';

export default function Home() {
  const [counts, setCounts] = useState({ products: 0, entries: 0, sales: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
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
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
          Sistema de Inventario
        </h1>
        <p className="text-lg sm:text-xl text-zinc-600 dark:text-zinc-400">
          Gestión inteligente de productos, entradas y salidas
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12">
        <Link href="/productos" className="group">
          <div className="bg-white/70 dark:bg-zinc-900/50 backdrop-blur-sm rounded-xl shadow-sm p-6 hover:shadow-md transition-all border border-zinc-200/30 dark:border-zinc-800 hover:border-violet-400/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">Productos</p>
                {loading ? (
                  <div className="h-8 w-16 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
                ) : (
                  <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">{counts.products}</p>
                )}
              </div>
              <div className="text-3xl opacity-70 group-hover:opacity-100 transition-opacity">📦</div>
            </div>
          </div>
        </Link>

        <Link href="/entradas" className="group">
          <div className="bg-white/70 dark:bg-zinc-900/50 backdrop-blur-sm rounded-xl shadow-sm p-6 hover:shadow-md transition-all border border-zinc-200/30 dark:border-zinc-800 hover:border-violet-400/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">Entradas</p>
                {loading ? (
                  <div className="h-8 w-16 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
                ) : (
                  <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">{counts.entries}</p>
                )}
              </div>
              <div className="text-3xl opacity-70 group-hover:opacity-100 transition-opacity">📥</div>
            </div>
          </div>
        </Link>

        <Link href="/salidas" className="group">
          <div className="bg-white/70 dark:bg-zinc-900/50 backdrop-blur-sm rounded-xl shadow-sm p-6 hover:shadow-md transition-all border border-zinc-200/30 dark:border-zinc-800 hover:border-violet-400/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">Salidas</p>
                {loading ? (
                  <div className="h-8 w-16 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
                ) : (
                  <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">{counts.sales}</p>
                )}
              </div>
              <div className="text-3xl opacity-70 group-hover:opacity-100 transition-opacity">📤</div>
            </div>
          </div>
        </Link>

        <Link href="/resumen" className="group">
          <div className="bg-white/70 dark:bg-zinc-900/50 backdrop-blur-sm rounded-xl shadow-sm p-6 hover:shadow-md transition-all border border-zinc-200/30 dark:border-zinc-800 hover:border-violet-400/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">Resumen</p>
                <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">📊</p>
              </div>
              <div className="text-3xl opacity-70 group-hover:opacity-100 transition-opacity">💎</div>
            </div>
          </div>
        </Link>
      </div>

      <div className="bg-white/70 dark:bg-zinc-900/50 backdrop-blur-sm rounded-xl shadow-sm p-6 sm:p-8 border border-zinc-200/30 dark:border-zinc-800">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-6 sm:mb-8">
          Funcionalidades del Sistema
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="p-4 rounded-lg border border-zinc-200/30 dark:border-zinc-800 bg-white/50 dark:bg-zinc-950/30">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                Productos Inteligentes
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Gestión automática de costos promedio. El sistema actualiza inteligentemente el costo unitario basado en las compras reales.
              </p>
            </div>

            <div className="p-4 rounded-lg border border-zinc-200/30 dark:border-zinc-800 bg-white/50 dark:bg-zinc-950/30">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                Entradas Automatizadas
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Cada compra actualiza automáticamente el stock, inversión total y recalcula el costo promedio en tiempo real.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-lg border border-zinc-200/30 dark:border-zinc-800 bg-white/50 dark:bg-zinc-950/30">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                Salidas Optimizadas
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Control inteligente de stock con validación automática y cálculo preciso de ingresos por ventas.
              </p>
            </div>

            <div className="p-4 rounded-lg border border-zinc-200/30 dark:border-zinc-800 bg-white/50 dark:bg-zinc-950/30">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                Analytics Avanzados
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Dashboard inteligente con métricas en tiempo real: inversión total, ventas y ganancias brutas calculadas automáticamente.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
