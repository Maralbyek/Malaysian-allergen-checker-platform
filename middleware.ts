import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { betterFetch } from '@better-fetch/fetch'

type Session = {
  user: {
    id: string
    email: string
    name: string | null
    role: 'ADMIN' | 'VENDOR' | 'CONSUMER'
  }
  session: {
    id: string
    userId: string
    token: string
    expiresAt: Date
  }
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Get session from Better Auth
  const { data: session } = await betterFetch<Session>(
    '/api/auth/get-session',
    {
      baseURL: request.nextUrl.origin,
      headers: {
        cookie: request.headers.get('cookie') || '',
      },
    }
  )

  // Public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/auth/login',
    '/auth/register',
    '/about',
    '/contact',
    '/how-it-works',
  ]

  // Check if the current path is public
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith('/api/auth'))

  // If not authenticated and trying to access protected route
  if (!session && !isPublicRoute) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // If authenticated and trying to access auth pages
  if (session && (pathname === '/auth/login' || pathname === '/auth/register')) {
    // Redirect to appropriate dashboard based on role
    const dashboardMap = {
      ADMIN: '/admin',
      VENDOR: '/vendor',
      CONSUMER: '/browse',
    }
    return NextResponse.redirect(new URL(dashboardMap[session.user.role], request.url))
  }

  // Role-based access control
  if (session) {
    const userRole = session.user.role

    // Admin routes
    if (pathname.startsWith('/admin') && userRole !== 'ADMIN') {
      return NextResponse.redirect(new URL('/browse', request.url))
    }

    // Vendor routes
    if (pathname.startsWith('/vendor') && userRole !== 'VENDOR') {
      return NextResponse.redirect(new URL('/browse', request.url))
    }

    // Browse routes are for authenticated users (any role can access)
    if (pathname.startsWith('/browse') && !session) {
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|api/auth).*)',
  ],
}
