'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Mail, ArrowLeft, Send } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error('Error', {
          description: data.message || 'Ocurrió un error inesperado'
        });
        return;
      }

      setEmailSent(true);
      toast.success('Correo enviado', {
        description: 'Revisa tu bandeja de entrada para restablecer tu contraseña'
      });
    } catch (error) {
      toast.error('Error', {
        description: 'Ocurrió un error inesperado'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl mb-4">
            <span className="text-2xl font-bold text-white">C</span>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            CRUNEVO
          </h1>
          <p className="text-gray-600 mt-2">Recuperar contraseña</p>
        </div>

        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-bold text-gray-900">
              {emailSent ? '¡Correo enviado!' : 'Recuperar contraseña'}
            </CardTitle>
            <CardDescription className="text-gray-600">
              {emailSent 
                ? 'Revisa tu correo electrónico para continuar'
                : 'Ingresa tu correo para recibir un enlace de recuperación'
              }
            </CardDescription>
          </CardHeader>

          {!emailSent ? (
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Correo electrónico
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                      required
                    />
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col space-y-4">
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-2.5 transition-all duration-200"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Enviando...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Send className="h-4 w-4" />
                      <span>Enviar enlace</span>
                    </div>
                  )}
                </Button>

                <Link 
                  href="/auth/login" 
                  className="flex items-center justify-center space-x-2 text-sm text-purple-600 hover:text-purple-700 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Volver al inicio de sesión</span>
                </Link>
              </CardFooter>
            </form>
          ) : (
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <Mail className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-gray-600 mb-6">
                  Hemos enviado un enlace de recuperación a <strong>{email}</strong>
                </p>
                <p className="text-sm text-gray-500 mb-6">
                  Si no recibes el correo en unos minutos, revisa tu carpeta de spam.
                </p>
              </div>

              <div className="flex flex-col space-y-3">
                <Button
                  onClick={() => {
                    setEmailSent(false);
                    setEmail('');
                  }}
                  variant="outline"
                  className="w-full border-purple-200 text-purple-600 hover:bg-purple-50"
                >
                  Enviar a otro correo
                </Button>
                
                <Link 
                  href="/auth/login" 
                  className="flex items-center justify-center space-x-2 text-sm text-purple-600 hover:text-purple-700 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Volver al inicio de sesión</span>
                </Link>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>© 2025 CRUNEVO — Construyendo el Futuro Educativo</p>
        </div>
      </div>
    </div>
  );
}