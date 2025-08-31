'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';
import { usePermissions } from '@/hooks/useUniversityVerification';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Lock, University, UserCheck } from 'lucide-react';
import Link from 'next/link';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
  requireVerification?: boolean;
  requiredRole?: 'STUDENT' | 'MODERATOR' | 'ADMIN';
  fallback?: ReactNode;
}

export function ProtectedRoute({
  children,
  requireAuth = true,
  requireVerification = false,
  requiredRole,
  fallback
}: ProtectedRouteProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { hasRole, isVerified, isAuthenticated } = usePermissions();

  // Mostrar loading mientras se carga la sesión
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Verificar autenticación
  if (requireAuth && !isAuthenticated) {
    if (fallback) return <>{fallback}</>;
    
    return (
      <div className="container mx-auto px-4 py-8 max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <Lock className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle>Acceso Restringido</CardTitle>
            <CardDescription>
              Necesitas iniciar sesión para acceder a esta página
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col space-y-2">
              <Button asChild>
                <Link href="/auth/login">Iniciar Sesión</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/auth/register">Crear Cuenta</Link>
              </Button>
            </div>
            <div className="text-center">
              <Button variant="ghost" onClick={() => router.back()}>
                Volver
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Verificar verificación universitaria
  if (requireVerification && !isVerified()) {
    if (fallback) return <>{fallback}</>;
    
    return (
      <div className="container mx-auto px-4 py-8 max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
              <University className="h-6 w-6 text-yellow-600" />
            </div>
            <CardTitle>Verificación Universitaria Requerida</CardTitle>
            <CardDescription>
              Necesitas verificar tu email universitario para acceder a esta funcionalidad
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-1">¿Por qué necesito verificar mi email?</p>
                  <p>La verificación universitaria nos ayuda a:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Mantener una comunidad académica segura</li>
                    <li>Conectarte con estudiantes de tu universidad</li>
                    <li>Personalizar el contenido según tu carrera</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col space-y-2">
              <Button asChild>
                <Link href="/auth/verify-university">Verificar Email Universitario</Link>
              </Button>
              <Button variant="outline" onClick={() => router.back()}>
                Volver
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Verificar rol requerido
  if (requiredRole && !hasRole(requiredRole)) {
    if (fallback) return <>{fallback}</>;
    
    const roleNames = {
      'STUDENT': 'Estudiante',
      'MODERATOR': 'Moderador',
      'ADMIN': 'Administrador'
    };
    
    return (
      <div className="container mx-auto px-4 py-8 max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <UserCheck className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle>Permisos Insuficientes</CardTitle>
            <CardDescription>
              Necesitas ser {roleNames[requiredRole]} para acceder a esta página
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="text-sm text-red-800">
                <p className="font-medium mb-1">Tu rol actual:</p>
                <p>{session?.user?.role ? roleNames[session.user.role as keyof typeof roleNames] || session.user.role : 'Sin rol asignado'}</p>
              </div>
            </div>
            
            <div className="flex flex-col space-y-2">
              <Button variant="outline" onClick={() => router.back()}>
                Volver
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/dashboard">Ir al Dashboard</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Si todas las verificaciones pasan, mostrar el contenido
  return <>{children}</>;
}

// Componente específico para rutas que requieren verificación universitaria
export function UniversityVerifiedRoute({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <ProtectedRoute
      requireAuth={true}
      requireVerification={true}
      fallback={fallback}
    >
      {children}
    </ProtectedRoute>
  );
}

// Componente específico para rutas de moderadores
export function ModeratorRoute({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <ProtectedRoute
      requireAuth={true}
      requireVerification={true}
      requiredRole="MODERATOR"
      fallback={fallback}
    >
      {children}
    </ProtectedRoute>
  );
}

// Componente específico para rutas de administradores
export function AdminRoute({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <ProtectedRoute
      requireAuth={true}
      requireVerification={true}
      requiredRole="ADMIN"
      fallback={fallback}
    >
      {children}
    </ProtectedRoute>
  );
}