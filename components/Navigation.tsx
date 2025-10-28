import Link from 'next/link';

export default function Navigation() {
  return (
    <nav className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex items-center px-2 py-2 text-xl font-bold text-zinc-900 dark:text-zinc-100">
              📦 Inventario
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link href="/productos" className="border-transparent text-zinc-900 dark:text-zinc-100 hover:border-zinc-300 hover:text-zinc-700 dark:hover:text-zinc-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                Productos
              </Link>
              <Link href="/entradas" className="border-transparent text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 hover:text-zinc-700 dark:hover:text-zinc-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                Entradas
              </Link>
              <Link href="/salidas" className="border-transparent text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 hover:text-zinc-700 dark:hover:text-zinc-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                Salidas
              </Link>
              <Link href="/resumen" className="border-transparent text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 hover:text-zinc-700 dark:hover:text-zinc-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                Resumen
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

