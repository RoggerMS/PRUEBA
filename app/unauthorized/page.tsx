'use client';

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ShieldX, ArrowLeft, Home, Mail } from 'lucide-react';
import Link from 'next/link';

export default function UnauthorizedPage() {
  const { data: session } = useSession();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <ShieldX className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-red-700 text-xl">
              Acceso No Autorizado
            </CardTitle>
            <CardDescription>
              No tienes permisos para acceder a esta página
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <Alert>
              <ShieldX className="h-4 w-4" />
              <AlertDescription>
                Esta página requiere permisos especiales de moderador o administrador. 
                Si crees que esto es un error, contacta al equipo de soporte.
              </AlertDescription>
            </Alert>

            {session?.user && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Tu información actual:</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <p><strong>Usuario:</strong> {session.user.name || session.user.email}</p>
                  <p><strong>Rol:</strong> {(session.user as any).role || 'STUDENT'}</p>
                  <p><strong>Verificado:</strong> {(session.user as any).verified ? 'Sí' : 'No'}</p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Button 
                onClick={() => router.back()} 
                variant="outline" 
                className="w-full"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
              
              <Link href="/dashboard" className="block">
                <Button className="w-full">
                  <Home className="w-4 h-4 mr-2" />
                  Ir al Dashboard
                </Button>
              </Link>
            </div>

            <div className="text-center pt-4 border-t">
              <p className="text-sm text-gray-600 mb-2">
                ¿Necesitas permisos especiales?
              </p>
              <Button variant="ghost" size="sm">
                <Mail className="w-4 h-4 mr-2" />
                Contactar Soporte
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}