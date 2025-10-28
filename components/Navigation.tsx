import Link from 'next/link';

export default function Navigation() {
  return (
    <nav className="bg-gradient-to-r from-purple-900/90 to-violet-900/90 backdrop-blur-sm border-b border-purple-500/30 ai-glow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex items-center px-2 py-2 text-xl font-bold text-purple-100 hover:text-white transition-colors">
              🤖 Inventario IA
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link href="/productos" className="border-transparent text-purple-200 hover:border-purple-300 hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-all ai-glow-hover">
                📦 Productos
              </Link>
              <Link href="/entradas" className="border-transparent text-purple-300 hover:border-purple-300 hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-all ai-glow-hover">
                📥 Entradas
              </Link>
              <Link href="/salidas" className="border-transparent text-purple-300 hover:border-purple-300 hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-all ai-glow-hover">
                📤 Salidas
              </Link>
              <Link href="/resumen" className="border-transparent text-purple-300 hover:border-purple-300 hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-all ai-glow-hover">
                📊 Resumen
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

