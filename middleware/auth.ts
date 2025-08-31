import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Rutas que requieren autenticación
const PROTECTED_ROUTES = [
  '/dashboard',
  '/profile',
  '/notes',
  '/forum',
  '/marketplace',
  '/gamification',
  '/api/feed',
  '/api/notes',
  '/api/forum',
  '/api/marketplace',
  '/api/gamification',
  '/api/notifications'
];

// Rutas que requieren verificación universitaria
const UNIVERSITY_VERIFIED_ROUTES = [
  '/notes/create',
  '/notes/upload',
  '/forum/create',
  '/marketplace/sell',
  '/api/feed',
  '/api/notes',
  '/api/forum',
  '/api/marketplace'
];

// Rutas solo para moderadores
const MODERATOR_ROUTES = [
  '/admin',
  '/moderation',
  '/api/admin',
  '/api/moderation'
];

// Rutas públicas (no requieren autenticación)
const PUBLIC_ROUTES = [
  '/',
  '/auth/login',
  '/auth/signin',
  '/auth/register',
  '/auth/signup',
  '/auth/forgot-password',
  '/u/',
  '/post/',
  '/notes/',
  '/feed/public',
  '/about',
  '/contact',
  '/privacy',
  '/terms',
  '/cookies',
  '/help',
  '/api/auth',
  '/api/public'
];

export async function authMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Permitir rutas públicas
  if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Obtener token de sesión
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  });

  // Verificar si la ruta requiere autenticación
  const requiresAuth = PROTECTED_ROUTES.some(route => pathname.startsWith(route));
  
  if (requiresAuth && !token) {
    // Redirigir a login si no está autenticado
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Si está autenticado, verificar permisos adicionales
  if (token) {
    // Verificar si requiere verificación universitaria
    const requiresUniversityVerification = UNIVERSITY_VERIFIED_ROUTES.some(
      route => pathname.startsWith(route)
    );

    if (requiresUniversityVerification && !token.verified) {
      // Redirigir a página de verificación universitaria
      const verifyUrl = new URL('/auth/verify-university', request.url);
      verifyUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(verifyUrl);
    }

    // Verificar si requiere permisos de moderador
    const requiresModerator = MODERATOR_ROUTES.some(
      route => pathname.startsWith(route)
    );

    if (requiresModerator && token.role !== 'MODERATOR' && token.role !== 'ADMIN') {
      // Redirigir a página de acceso denegado
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  return NextResponse.next();
}

// Función helper para verificar permisos en componentes del servidor
export function hasPermission(
  userRole: string | undefined,
  requiredRole: 'STUDENT' | 'MODERATOR' | 'ADMIN'
): boolean {
  if (!userRole) return false;
  
  const roleHierarchy = {
    'STUDENT': 1,
    'MODERATOR': 2,
    'ADMIN': 3
  };
  
  const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0;
  const requiredLevel = roleHierarchy[requiredRole];
  
  return userLevel >= requiredLevel;
}

// Función helper para verificar si el usuario está verificado
export function isUniversityVerified(user: any): boolean {
  return !!(user?.verified && user?.emailVerified);
}

// Función helper para obtener información de permisos del usuario
export function getUserPermissions(user: any) {
  return {
    isAuthenticated: !!user,
    isVerified: isUniversityVerified(user),
    role: user?.role || 'STUDENT',
    canCreateContent: isUniversityVerified(user),
    canModerate: hasPermission(user?.role, 'MODERATOR'),
    canAdmin: hasPermission(user?.role, 'ADMIN'),
    university: user?.university,
    career: user?.career
  };
}