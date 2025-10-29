"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Navigation() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => (typeof window !== 'undefined' && (localStorage.getItem('theme') as 'light' | 'dark')) || 'dark');

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
    }
  }, [theme]);

  return (
    <nav className="border-b border-zinc-200/40 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14 items-center">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center px-2 py-2 text-xl font-bold text-zinc-900 dark:text-zinc-100">
              Inventario
            </Link>
            <div className="hidden sm:flex sm:space-x-6">
              <Link href="/productos" className="text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 text-sm font-medium transition-colors">
                Productos
              </Link>
              <Link href="/entradas" className="text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 text-sm font-medium transition-colors">
                Entradas
              </Link>
              <Link href="/salidas" className="text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 text-sm font-medium transition-colors">
                Salidas
              </Link>
              <Link href="/resumen" className="text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 text-sm font-medium transition-colors">
                Resumen
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="px-3 py-1.5 rounded-md border border-zinc-300/60 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              aria-label="Cambiar tema"
            >
              {theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

