'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import UniversityVerification from '@/components/auth/UniversityVerification';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, University, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function VerifyUniversityPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [callbackUrl, setCallbackUrl] = useState('/dashboard');
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cb = params.get('callbackUrl');
    if (cb) setCallbackUrl(cb);
  }, []);

  useEffect(() => {
    // Redirigir si no está autenticado
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  const handleVerificationComplete = () => {
    setIsVerified(true);
    // Redirigir después de un breve delay para mostrar el mensaje de éxito
    setTimeout(() => {
      router.push(callbackUrl);
    }, 2000);
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null; // El useEffect se encargará de la redirección
  }

  if (isVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-green-700 text-xl">¡Verificación Exitosa!</CardTitle>
            <CardDescription>
              Tu cuenta universitaria ha sido verificada. Serás redirigido automáticamente...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => router.push(callbackUrl)} 
              className="w-full"
            >
              Continuar a la aplicación
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al Dashboard
            </Button>
          </Link>
          
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <University className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Verificación Universitaria
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Para acceder a todas las funcionalidades de CRUNEVO, necesitas verificar 
              tu cuenta universitaria. Este proceso garantiza que solo estudiantes 
              universitarios peruanos puedan crear y compartir contenido académico.
            </p>
          </div>
        </div>

        {/* Información sobre la verificación */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">¿Por qué verificar?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Acceso completo</p>
                  <p className="text-sm text-gray-600">Crear y compartir apuntes, participar en foros</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Comunidad confiable</p>
                  <p className="text-sm text-gray-600">Solo estudiantes universitarios verificados</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Bonus de bienvenida</p>
                  <p className="text-sm text-gray-600">500 Crolars + 100 XP por verificar</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Proceso de verificación</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-blue-600">1</span>
                </div>
                <div>
                  <p className="font-medium">Información universitaria</p>
                  <p className="text-sm text-gray-600">Ingresa tu universidad, carrera y email institucional</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-blue-600">2</span>
                </div>
                <div>
                  <p className="font-medium">Código de verificación</p>
                  <p className="text-sm text-gray-600">Recibirás un código en tu email universitario</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-blue-600">3</span>
                </div>
                <div>
                  <p className="font-medium">Confirmación</p>
                  <p className="text-sm text-gray-600">Ingresa el código para completar la verificación</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alerta informativa */}
        <Alert className="mb-8">
          <University className="h-4 w-4" />
          <AlertDescription>
            <strong>Importante:</strong> Solo se aceptan emails de universidades peruanas reconocidas. 
            El proceso de verificación es gratuito y seguro. Tu información personal está protegida.
          </AlertDescription>
        </Alert>

        {/* Componente de verificación */}
        <div className="flex justify-center">
          <UniversityVerification onVerificationComplete={handleVerificationComplete} />
        </div>
      </div>
    </div>
  );
}