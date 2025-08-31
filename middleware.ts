import { NextRequest, NextResponse } from 'next/server';
import { initializeApp } from './lib/app-initializer';
import { authMiddleware } from './middleware/auth';

// Variable para controlar si ya se inicializó
let isInitialized = false;

export async function middleware(request: NextRequest) {
  // Inicializar servicios solo una vez
  if (!isInitialized) {
    try {
      initializeApp();
      isInitialized = true;
      console.log('[Middleware] Application services initialized');
    } catch (error) {
      console.error('[Middleware] Failed to initialize services:', error);
    }
  }

  // Apply authentication middleware
  return await authMiddleware(request);
}

// Configurar el middleware para que se ejecute en todas las rutas
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Note: We include API routes for authentication middleware
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};