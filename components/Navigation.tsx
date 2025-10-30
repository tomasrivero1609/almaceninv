"use client";

import Link from 'next/link';
import type { UserRole } from '@/types';
import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { logout } from '@/lib/storage';
import { useSession } from '@/components/SessionProvider';
import { useToastContext } from './ToastProvider';

const LINKS: Array<{ href: string; label: string; roles: UserRole[] }> = [
  { href: '/productos', label: 'Productos', roles: ['admin'] },
  { href: '/entradas', label: 'Entradas', roles: ['admin'] },
  { href: '/salidas', label: 'Salidas', roles: ['admin', 'seller'] },
  { href: '/resumen', label: 'Resumen', roles: ['admin'] },
];

export default function Navigation() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => (typeof window !== 'undefined' && (localStorage.getItem('theme') as 'light' | 'dark')) || 'dark');
  const [loggingOut, setLoggingOut] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const toast = useToastContext();
  const { user, loading, setUser, refresh } = useSession();

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
    }
  }, [theme]);

  const visibleLinks = useMemo(() => {
    if (!user) return [];
    return LINKS.filter((link) => link.roles.includes(user.role));
  }, [user]);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await logout();
      setUser(null);
      await refresh();
      router.push('/login');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No fue posible cerrar sesion';
      toast.error(message);
    } finally {
      setLoggingOut(false);
    }
  };

  const brandHref = user?.role === 'seller' ? '/salidas' : '/';

  return (
    <nav className="sticky top-0 z-40 border-b border-zinc-200/40 dark:border-zinc-800/60 bg-white/70 dark:bg-zinc-900/50 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-zinc-900/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14 items-center">
          <Link
            href={brandHref}
            className="flex items-center px-2 py-2 text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100"
          >
            Inventario
          </Link>
          <div className="hidden sm:flex items-center gap-2">
            {visibleLinks.map((item) => {
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
            {user ? (
              <>
                <div className="hidden sm:flex flex-col text-right leading-tight">
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">{user.username}</span>
                  <span className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{user.role === 'admin' ? 'Administrador' : 'Vendedor'}</span>
                </div>
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="px-3 py-1.5 rounded-md border border-zinc-300/60 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-60"
                >
                  {loggingOut ? 'Saliendo...' : 'Salir'}
                </button>
              </>
            ) : !loading ? (
              <Link
                href="/login"
                className="px-3 py-1.5 rounded-md border border-violet-500/60 text-violet-600 dark:text-violet-300 text-sm hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors"
              >
                Ingresar
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </nav>
  );
}

