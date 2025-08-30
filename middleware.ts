import { NextRequest } from 'next/server';
import { authMiddleware } from './middleware/auth';

export async function middleware(request: NextRequest) {
  return await authMiddleware(request);
}

// Configurar qué rutas debe procesar el middleware
export const config = {
  matcher: [
    /*
     * Coincidir con todas las rutas de solicitud excepto las que comienzan con:
     * - api/auth (rutas de autenticación de NextAuth)
     * - _next/static (archivos estáticos)
     * - _next/image (optimización de imágenes)
     * - favicon.ico (favicon)
     * - public (archivos públicos)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)',
  ],
};