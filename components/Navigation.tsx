"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => (typeof window !== 'undefined' && (localStorage.getItem('theme') as 'light' | 'dark')) || 'dark');
  const pathname = usePathname();

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
    }
  }, [theme]);

  return (
    <nav className="sticky top-0 z-40 border-b border-zinc-200/40 dark:border-zinc-800/60 bg-white/70 dark:bg-zinc-900/50 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-zinc-900/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14 items-center">
          <Link href="/" className="flex items-center px-2 py-2 text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            Inventario
          </Link>
          <div className="hidden sm:flex items-center gap-2">
            {[
              { href: '/productos', label: 'Productos' },
              { href: '/entradas', label: 'Entradas' },
              { href: '/salidas', label: 'Salidas' },
              { href: '/resumen', label: 'Resumen' },
            ].map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors border ${
                    active
                      ? 'text-zinc-900 dark:text-zinc-100 border-zinc-300/60 dark:border-zinc-700 bg-white/60 dark:bg-zinc-900/40'
                      : 'text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 border-transparent hover:border-zinc-300/40 dark:hover:border-zinc-700/50'
                  }`}
                  aria-current={active ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="px-3 py-1.5 rounded-md border border-zinc-300/60 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              aria-label="Cambiar tema"
            >
              {theme === 'dark' ? 'Claro' : 'Oscuro'}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

