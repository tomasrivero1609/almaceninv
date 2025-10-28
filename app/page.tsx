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
        <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-200 to-violet-200 bg-clip-text text-transparent mb-4">
          🤖 Sistema de Inventario IA
        </h1>
        <p className="text-xl text-purple-300">
          Gestión inteligente de productos, entradas y salidas con tecnología avanzada
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <Link href="/productos" className="group">
          <div className="bg-gradient-to-br from-purple-900/50 to-violet-900/50 backdrop-blur-sm rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all border border-purple-500/30 ai-glow-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-300">Productos</p>
                <p className="text-3xl font-bold text-purple-100">{counts.products}</p>
              </div>
              <div className="text-4xl">📦</div>
            </div>
          </div>
        </Link>

        <Link href="/entradas" className="group">
          <div className="bg-gradient-to-br from-purple-900/50 to-violet-900/50 backdrop-blur-sm rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all border border-purple-500/30 ai-glow-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-300">Entradas</p>
                <p className="text-3xl font-bold text-purple-100">{counts.entries}</p>
              </div>
              <div className="text-4xl">📥</div>
            </div>
          </div>
        </Link>

        <Link href="/salidas" className="group">
          <div className="bg-gradient-to-br from-purple-900/50 to-violet-900/50 backdrop-blur-sm rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all border border-purple-500/30 ai-glow-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-300">Salidas</p>
                <p className="text-3xl font-bold text-purple-100">{counts.sales}</p>
              </div>
              <div className="text-4xl">📤</div>
            </div>
          </div>
        </Link>

        <Link href="/resumen" className="group">
          <div className="bg-gradient-to-br from-purple-900/50 to-violet-900/50 backdrop-blur-sm rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all border border-purple-500/30 ai-glow-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-300">Resumen</p>
                <p className="text-3xl font-bold text-purple-100">📊</p>
              </div>
              <div className="text-4xl">💎</div>
            </div>
          </div>
        </Link>
      </div>

      <div className="bg-gradient-to-br from-purple-900/30 to-violet-900/30 backdrop-blur-sm rounded-xl shadow-xl p-8 border border-purple-500/30 ai-glow">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-200 to-violet-200 bg-clip-text text-transparent mb-8">
          ⚡ Cómo funciona la IA
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-purple-800/20 rounded-lg p-4 border border-purple-500/20">
              <h3 className="text-xl font-semibold text-purple-200 mb-2 flex items-center gap-2">
                📦 Productos Inteligentes
              </h3>
              <p className="text-purple-300">
                Gestión automática de costos promedio. El sistema actualiza inteligentemente el costo unitario basado en las compras reales.
              </p>
            </div>

            <div className="bg-purple-800/20 rounded-lg p-4 border border-purple-500/20">
              <h3 className="text-xl font-semibold text-purple-200 mb-2 flex items-center gap-2">
                📥 Entradas Automatizadas
              </h3>
              <p className="text-purple-300">
                Cada compra actualiza automáticamente el stock, inversión total y recalcula el costo promedio en tiempo real.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-purple-800/20 rounded-lg p-4 border border-purple-500/20">
              <h3 className="text-xl font-semibold text-purple-200 mb-2 flex items-center gap-2">
                📤 Salidas Optimizadas
              </h3>
              <p className="text-purple-300">
                Control inteligente de stock con validación automática y cálculo preciso de ingresos por ventas.
              </p>
            </div>

            <div className="bg-purple-800/20 rounded-lg p-4 border border-purple-500/20">
              <h3 className="text-xl font-semibold text-purple-200 mb-2 flex items-center gap-2">
                💎 Analytics Avanzados
              </h3>
              <p className="text-purple-300">
                Dashboard inteligente con métricas en tiempo real: inversión total, ventas y ganancias brutas calculadas automáticamente.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
