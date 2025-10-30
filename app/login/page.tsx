'use client';

import { FormEvent, Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { login } from '@/lib/storage';
import { useToastContext } from '@/components/ToastProvider';
import { useSession } from '@/components/SessionProvider';

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center">
          <span className="text-zinc-500 dark:text-zinc-400">Cargando...</span>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToastContext();
  const { setUser } = useSession();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    try {
      const user = await login(username, password);
      setUser(user);
      const destination = searchParams.get('from') || (user.role === 'admin' ? '/resumen' : '/salidas');
      router.push(destination);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Credenciales invalidas';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md rounded-xl border border-zinc-200/40 dark:border-zinc-800/60 bg-white/80 dark:bg-zinc-900/60 backdrop-blur p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 mb-6 text-center">Iniciar sesion</h1>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Usuario
            </label>
            <input
              id="username"
              name="username"
              autoComplete="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
              className="w-full rounded-lg border border-zinc-300/60 dark:border-zinc-700/60 bg-white/70 dark:bg-zinc-900/40 px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/30 transition-colors"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Contrasena
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className="w-full rounded-lg border border-zinc-300/60 dark:border-zinc-700/60 bg-white/70 dark:bg-zinc-900/40 px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/30 transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-violet-600 hover:bg-violet-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium py-2.5 transition-colors shadow-sm"
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
        <p className="mt-6 text-sm text-zinc-500 dark:text-zinc-400 text-center">
          Usa tus credenciales asignadas. El usuario administrador predeterminado es <span className="font-semibold">admin</span> / <span className="font-semibold">admin123</span>.
        </p>
      </div>
    </div>
  );
}




