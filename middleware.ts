import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Добавляем заголовки кэширования для статических ресурсов
  if (request.nextUrl.pathname.startsWith('/images/') ||
      request.nextUrl.pathname.startsWith('/_next/static/') ||
      request.nextUrl.pathname.startsWith('/favicon')) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
  }

  // Добавляем заголовки кэширования для API данных
  if (request.nextUrl.pathname.startsWith('/api/firestore')) {
    response.headers.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=60')
    response.headers.set('Vary', 'Accept-Encoding')
  }

  // Добавляем заголовки для страниц
  if (!request.nextUrl.pathname.startsWith('/api/') &&
      !request.nextUrl.pathname.startsWith('/_next/') &&
      !request.nextUrl.pathname.startsWith('/adminbel')) {
    response.headers.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=3600')
    response.headers.set('Vary', 'Accept-Encoding')
  }

  return response
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
    '/api/firestore/:path*'
  ],
}
