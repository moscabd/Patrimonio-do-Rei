import { NextRequest, NextResponse } from 'next/server';

const SESSION_TOKEN_NAME = 'auth_token';

// Rotas públicas que não precisam de autenticação
const publicRoutes = ['/login', '/api/auth/login'];

// Rotas que precisam de autenticação
const protectedRoutes = ['/assets', '/audit', '/movements', '/documents', '/companies', '/converter'];

export async function middleware(request: NextRequest) {
  const token = request.cookies.get(SESSION_TOKEN_NAME)?.value;
  const pathname = request.nextUrl.pathname;

  // Se está na rota de login, deixa passar
  if (pathname === '/login') {
    if (token) {
      // Se tem token, redireciona para /assets
      return NextResponse.redirect(new URL('/assets', request.url));
    }
    return NextResponse.next();
  }

  // Se é rota protegida e não tem token, redireciona para login
  if (protectedRoutes.some((route) => pathname.startsWith(route)) && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Se é rota da API de auth, deixa passar
  if (pathname.startsWith('/api/auth/')) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
