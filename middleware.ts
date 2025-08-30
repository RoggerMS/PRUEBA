import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

// Rutas públicas que no requieren autenticación
const publicRoutes = [
  '/',
  '/feed/public',
  '/about',
  '/contact',
  '/privacy',
  '/terms',
  '/cookies',
  '/help'
]

// Patrones de rutas públicas (usando regex)
const publicPatterns = [
  /^\/auth(\/.*)?$/, // /auth/*
  /^\/u\/[^/]+$/, // /u/[username]
  /^\/post\/[^/]+$/, // /post/[id]
  /^\/notes\/[^/]+$/ // /notes/[id]
]

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    
    // Verificar si la ruta es pública
    const isPublicRoute = publicRoutes.includes(pathname) || 
                         publicPatterns.some(pattern => pattern.test(pathname))
    
    // Si es una ruta pública, permitir acceso
    if (isPublicRoute) {
      return NextResponse.next()
    }
    
    // Para rutas protegidas, NextAuth ya maneja la redirección
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        
        // Verificar si la ruta es pública
        const isPublicRoute = publicRoutes.includes(pathname) || 
                             publicPatterns.some(pattern => pattern.test(pathname))
        
        // Si es ruta pública, siempre autorizar
        if (isPublicRoute) {
          return true
        }
        
        // Para rutas protegidas, verificar token
        return !!token
      },
    },
    pages: {
      signIn: "/auth/login",
    },
  }
)

// Configurar qué rutas debe procesar el middleware
export const config = {
  matcher: [
    /*
     * Coincidir con todas las rutas de solicitud excepto las que comienzan con:
     * - api/auth (rutas de autenticación de NextAuth)
     * - _next/static (archivos estáticos)
     * - _next/image (optimización de imágenes)
     * - favicon.ico (favicon)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
}