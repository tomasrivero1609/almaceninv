import { NextResponse, type NextRequest } from 'next/server';

const PUBLIC_PATHS = [
  '/login',
  '/api/auth/login',
  '/api/auth/logout',
  '/api/auth/session',
];

const SELLER_ALLOWED_APP_PATHS = ['/salidas'];
const SELLER_ALLOWED_API_PREFIXES = ['/api/sales', '/api/products', '/api/auth/logout', '/api/auth/session'];

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

function isStaticAsset(pathname: string) {
  return (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/assets') ||
    pathname.startsWith('/public')
  );
}

async function fetchSession(request: NextRequest) {
  const cookie = request.headers.get('cookie') ?? '';
  if (!cookie.includes('session=')) {
    return null;
  }
  try {
    const res = await fetch(new URL('/api/auth/session', request.url), {
      headers: { cookie },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data?.authenticated && data?.user) {
      return data.user as { id: string; username: string; role: 'admin' | 'seller' };
    }
    return null;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isStaticAsset(pathname) || isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const user = await fetchSession(request);

  if (!user) {
    if (pathname.startsWith('/api')) {
      return new NextResponse(JSON.stringify({ error: 'No autenticado' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    if (pathname !== '/') {
      loginUrl.searchParams.set('from', pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  if (pathname === '/login') {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = user.role === 'admin' ? '/resumen' : '/salidas';
    return NextResponse.redirect(redirectUrl);
  }

  if (user.role === 'seller') {
    if (pathname === '/') {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/salidas';
      return NextResponse.redirect(redirectUrl);
    }
    if (SELLER_ALLOWED_APP_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
      return NextResponse.next();
    }
    if (pathname.startsWith('/api')) {
      if (SELLER_ALLOWED_API_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
        return NextResponse.next();
      }
      return new NextResponse(JSON.stringify({ error: 'No autorizado' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/salidas';
    redirectUrl.searchParams.set('denied', '1');
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
