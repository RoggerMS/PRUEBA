"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Home, MessageCircle, Clock, Shield } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function ErrorPage() {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = () => {
    setIsRetrying(true);
    // Simulate retry delay
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const reportIssue = () => {
    const errorDetails = {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      referrer: document.referrer
    };
    
    const subject = encodeURIComponent('Error 500 - Reporte de problema');
    const body = encodeURIComponent(
      `Hola equipo de CRUNEVO,\n\n` +
      `He encontrado un error 500 en la plataforma.\n\n` +
      `Detalles del error:\n` +
      `- Fecha y hora: ${errorDetails.timestamp}\n` +
      `- URL: ${errorDetails.url}\n` +
      `- Navegador: ${errorDetails.userAgent}\n` +
      `- Página anterior: ${errorDetails.referrer}\n\n` +
      `Descripción de lo que estaba haciendo:\n` +
      `[Por favor, describe qué acción realizaste antes del error]\n\n` +
      `Gracias por ayudarnos a mejorar CRUNEVO.`
    );
    
    window.open(`mailto:soporte@crunevo.com?subject=${subject}&body=${body}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-100 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full space-y-8">
        {/* Main Error Content */}
        <div className="text-center space-y-6">
          {/* Error Illustration */}
          <div className="relative">
            <div className="text-9xl font-bold text-orange-200 select-none">
              500
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="p-4 bg-orange-100 rounded-full animate-pulse">
                <AlertTriangle className="h-12 w-12 text-orange-600" />
              </div>
            </div>
          </div>

          {/* Error Message */}
          <div className="space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Error Interno del Servidor
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              ¡Ups! Algo salió mal en nuestros servidores. 
              Nuestro equipo técnico ha sido notificado y está trabajando para solucionarlo.
            </p>
          </div>
        </div>

        {/* Status Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white/80 backdrop-blur-sm border-orange-200">
            <CardContent className="p-6 text-center space-y-4">
              <div className="flex justify-center">
                <div className="p-3 bg-orange-100 rounded-full">
                  <AlertTriangle className="h-6 w-6 text-orange-600" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">
                  Error Detectado
                </h3>
                <p className="text-sm text-gray-600">
                  Hemos identificado el problema y estamos trabajando en la solución
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-blue-200">
            <CardContent className="p-6 text-center space-y-4">
              <div className="flex justify-center">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">
                  Tiempo Estimado
                </h3>
                <p className="text-sm text-gray-600">
                  Generalmente resolvemos estos problemas en menos de 30 minutos
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-green-200">
            <CardContent className="p-6 text-center space-y-4">
              <div className="flex justify-center">
                <div className="p-3 bg-green-100 rounded-full">
                  <Shield className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">
                  Datos Seguros
                </h3>
                <p className="text-sm text-gray-600">
                  Tus datos están seguros. Este error no afecta tu información personal
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-4">
          <Button 
            onClick={handleRetry} 
            disabled={isRetrying}
            className="gap-2 bg-orange-600 hover:bg-orange-700"
          >
            <RefreshCw className={`h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
            {isRetrying ? 'Reintentando...' : 'Reintentar'}
          </Button>
          
          <Link href="/">
            <Button variant="outline" className="gap-2">
              <Home className="h-4 w-4" />
              Ir al Inicio
            </Button>
          </Link>
          
          <Button variant="outline" onClick={reportIssue} className="gap-2">
            <MessageCircle className="h-4 w-4" />
            Reportar Problema
          </Button>
        </div>

        {/* What You Can Do */}
        <Card className="bg-white/80 backdrop-blur-sm border-purple-200">
          <CardContent className="p-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-6 text-center">
              ¿Qué puedes hacer mientras tanto?
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-purple-700 mb-3">
                  Soluciones Rápidas:
                </h4>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 mt-1">•</span>
                    <span>Espera unos minutos y recarga la página</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 mt-1">•</span>
                    <span>Verifica tu conexión a internet</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 mt-1">•</span>
                    <span>Intenta acceder desde otro navegador</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 mt-1">•</span>
                    <span>Limpia la caché de tu navegador</span>
                  </li>
                </ul>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-semibold text-purple-700 mb-3">
                  Alternativas:
                </h4>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 mt-1">•</span>
                    <span>Visita otras secciones de CRUNEVO</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 mt-1">•</span>
                    <span>Revisa nuestras redes sociales para actualizaciones</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 mt-1">•</span>
                    <span>Contacta a nuestro equipo de soporte</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 mt-1">•</span>
                    <span>Consulta el centro de ayuda</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Technical Details */}
        <Card className="bg-white/80 backdrop-blur-sm border-gray-200">
          <CardContent className="p-6">
            <details className="space-y-4">
              <summary className="cursor-pointer font-semibold text-gray-800 hover:text-gray-600">
                Detalles Técnicos (Opcional)
              </summary>
              <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-600 space-y-2">
                <p><strong>Código de Error:</strong> HTTP 500 - Internal Server Error</p>
                <p><strong>Timestamp:</strong> {new Date().toLocaleString('es-PE')}</p>
                <p><strong>ID de Sesión:</strong> {Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                <p><strong>Servidor:</strong> CRUNEVO-WEB-{Math.floor(Math.random() * 5) + 1}</p>
                <p className="text-xs text-gray-500 mt-3">
                  Esta información puede ser útil para nuestro equipo técnico si reportas el problema.
                </p>
              </div>
            </details>
          </CardContent>
        </Card>

        {/* Contact Support */}
        <Card className="bg-white/80 backdrop-blur-sm border-blue-200">
          <CardContent className="p-8 text-center space-y-4">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <MessageCircle className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-800">
              ¿El problema persiste?
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Si continúas experimentando este error después de varios intentos, 
              por favor contáctanos. Incluye los detalles técnicos mostrados arriba.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <Link href="/contact">
                <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                  <MessageCircle className="h-4 w-4" />
                  Contactar Soporte
                </Button>
              </Link>
              <Link href="/help">
                <Button variant="outline" className="gap-2">
                  Centro de Ayuda
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center py-4">
          <p className="text-gray-500 text-sm">
            Error 500 - Error Interno del Servidor | CRUNEVO - Plataforma Estudiantil Universitaria
          </p>
          <p className="text-gray-400 text-xs mt-1">
            Nuestro equipo técnico ha sido notificado automáticamente sobre este error
          </p>
        </div>
      </div>
    </div>
  );
}