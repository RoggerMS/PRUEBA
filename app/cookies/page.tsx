"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Cookie, Settings, BarChart3, Shield, Eye, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function CookiesPage() {
  const [cookiePreferences, setCookiePreferences] = useState({
    essential: true, // Always true, cannot be disabled
    functional: true,
    analytics: true,
    marketing: false
  });

  const handlePreferenceChange = (type: keyof typeof cookiePreferences) => {
    if (type === 'essential') return; // Essential cookies cannot be disabled
    
    setCookiePreferences(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const savePreferences = () => {
    // Here you would typically save to localStorage or send to server
    localStorage.setItem('cookiePreferences', JSON.stringify(cookiePreferences));
    alert('Preferencias guardadas exitosamente');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-amber-100 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Volver al inicio
            </Button>
          </Link>
        </div>

        <div className="text-center space-y-4 mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-orange-100 rounded-full">
              <Cookie className="h-8 w-8 text-orange-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
            Política de Cookies
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Última actualización: Enero 2024 | Información sobre cookies y tecnologías similares
          </p>
        </div>

        {/* Cookie Preferences Panel */}
        <Card className="bg-white/90 backdrop-blur-sm border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <Settings className="h-5 w-5" />
              Configurar Preferencias de Cookies
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              {/* Essential Cookies */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-800">Cookies Esenciales</h4>
                    <Badge variant="secondary">Requeridas</Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    Necesarias para el funcionamiento básico de la plataforma
                  </p>
                </div>
                <div className="flex items-center">
                  <div className="w-12 h-6 bg-green-500 rounded-full flex items-center justify-end px-1">
                    <div className="w-4 h-4 bg-white rounded-full"></div>
                  </div>
                </div>
              </div>

              {/* Functional Cookies */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-800">Cookies Funcionales</h4>
                    <Badge variant="outline">Opcional</Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    Mejoran la funcionalidad y personalización de tu experiencia
                  </p>
                </div>
                <button 
                  onClick={() => handlePreferenceChange('functional')}
                  className="flex items-center"
                >
                  <div className={`w-12 h-6 rounded-full flex items-center px-1 transition-colors ${
                    cookiePreferences.functional ? 'bg-green-500 justify-end' : 'bg-gray-300 justify-start'
                  }`}>
                    <div className="w-4 h-4 bg-white rounded-full"></div>
                  </div>
                </button>
              </div>

              {/* Analytics Cookies */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-800">Cookies de Análisis</h4>
                    <Badge variant="outline">Opcional</Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    Nos ayudan a entender cómo usas la plataforma para mejorarla
                  </p>
                </div>
                <button 
                  onClick={() => handlePreferenceChange('analytics')}
                  className="flex items-center"
                >
                  <div className={`w-12 h-6 rounded-full flex items-center px-1 transition-colors ${
                    cookiePreferences.analytics ? 'bg-green-500 justify-end' : 'bg-gray-300 justify-start'
                  }`}>
                    <div className="w-4 h-4 bg-white rounded-full"></div>
                  </div>
                </button>
              </div>

              {/* Marketing Cookies */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-800">Cookies de Marketing</h4>
                    <Badge variant="outline">Opcional</Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    Para mostrarte contenido y anuncios relevantes
                  </p>
                </div>
                <button 
                  onClick={() => handlePreferenceChange('marketing')}
                  className="flex items-center"
                >
                  <div className={`w-12 h-6 rounded-full flex items-center px-1 transition-colors ${
                    cookiePreferences.marketing ? 'bg-green-500 justify-end' : 'bg-gray-300 justify-start'
                  }`}>
                    <div className="w-4 h-4 bg-white rounded-full"></div>
                  </div>
                </button>
              </div>
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button onClick={savePreferences} className="bg-orange-600 hover:bg-orange-700">
                Guardar Preferencias
              </Button>
              <Button variant="outline" onClick={() => {
                setCookiePreferences({ essential: true, functional: false, analytics: false, marketing: false });
              }}>
                Rechazar Opcionales
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Content */}
        <div className="space-y-6">
          {/* ¿Qué son las cookies? */}
          <Card className="bg-white/80 backdrop-blur-sm border-orange-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-700">
                <Cookie className="h-5 w-5" />
                1. ¿Qué son las Cookies?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700">
              <p>
                Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo cuando 
                visitas un sitio web. Nos permiten recordar tus preferencias, mejorar tu experiencia 
                y entender cómo interactúas with nuestra plataforma CRUNEVO.
              </p>
              <p>
                También utilizamos tecnologías similares como web beacons, píxeles de seguimiento 
                y almacenamiento local para propósitos similares.
              </p>
            </CardContent>
          </Card>

          {/* Tipos de Cookies */}
          <Card className="bg-white/80 backdrop-blur-sm border-amber-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-700">
                <BarChart3 className="h-5 w-5" />
                2. Tipos de Cookies que Utilizamos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-gray-700">
              {/* Essential Cookies */}
              <div className="border-l-4 border-green-500 pl-4">
                <h4 className="font-semibold text-green-700 mb-2 flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  2.1 Cookies Esenciales (Siempre Activas)
                </h4>
                <p className="mb-3">
                  Son absolutamente necesarias para que la plataforma funcione correctamente. 
                  No pueden ser desactivadas.
                </p>
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="font-medium mb-2">Ejemplos:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li><strong>session_token:</strong> Mantiene tu sesión activa</li>
                    <li><strong>csrf_token:</strong> Protege contra ataques de seguridad</li>
                    <li><strong>user_preferences:</strong> Guarda configuraciones básicas</li>
                    <li><strong>language:</strong> Recuerda tu idioma preferido</li>
                  </ul>
                  <p className="text-xs text-green-600 mt-2">Duración: Sesión o hasta 30 días</p>
                </div>
              </div>

              {/* Functional Cookies */}
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-semibold text-blue-700 mb-2 flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  2.2 Cookies Funcionales
                </h4>
                <p className="mb-3">
                  Mejoran la funcionalidad de la plataforma y tu experiencia personalizada.
                </p>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="font-medium mb-2">Ejemplos:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li><strong>theme_preference:</strong> Modo claro/oscuro</li>
                    <li><strong>sidebar_collapsed:</strong> Estado de la barra lateral</li>
                    <li><strong>notification_settings:</strong> Preferencias de notificaciones</li>
                    <li><strong>recent_searches:</strong> Búsquedas recientes</li>
                    <li><strong>course_filters:</strong> Filtros aplicados en cursos</li>
                  </ul>
                  <p className="text-xs text-blue-600 mt-2">Duración: Hasta 1 año</p>
                </div>
              </div>

              {/* Analytics Cookies */}
              <div className="border-l-4 border-purple-500 pl-4">
                <h4 className="font-semibold text-purple-700 mb-2 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  2.3 Cookies de Análisis
                </h4>
                <p className="mb-3">
                  Nos ayudan a entender cómo los estudiantes usan CRUNEVO para mejorar la plataforma.
                </p>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <p className="font-medium mb-2">Ejemplos:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li><strong>_ga:</strong> Google Analytics - identifica usuarios únicos</li>
                    <li><strong>_gid:</strong> Google Analytics - identifica sesiones</li>
                    <li><strong>page_views:</strong> Páginas más visitadas</li>
                    <li><strong>time_on_site:</strong> Tiempo de permanencia</li>
                    <li><strong>feature_usage:</strong> Funciones más utilizadas</li>
                  </ul>
                  <p className="text-xs text-purple-600 mt-2">Duración: Hasta 2 años</p>
                </div>
              </div>

              {/* Marketing Cookies */}
              <div className="border-l-4 border-orange-500 pl-4">
                <h4 className="font-semibold text-orange-700 mb-2 flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  2.4 Cookies de Marketing
                </h4>
                <p className="mb-3">
                  Para mostrarte contenido relevante y medir la efectividad de nuestras campañas.
                </p>
                <div className="bg-orange-50 p-3 rounded-lg">
                  <p className="font-medium mb-2">Ejemplos:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li><strong>fb_pixel:</strong> Facebook Pixel para anuncios</li>
                    <li><strong>google_ads:</strong> Google Ads para remarketing</li>
                    <li><strong>campaign_source:</strong> Origen de tráfico</li>
                    <li><strong>content_preferences:</strong> Intereses del usuario</li>
                  </ul>
                  <p className="text-xs text-orange-600 mt-2">Duración: Hasta 1 año</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cookies de Terceros */}
          <Card className="bg-white/80 backdrop-blur-sm border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <Shield className="h-5 w-5" />
                3. Cookies de Terceros
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700">
              <p>
                Algunos servicios externos que utilizamos pueden establecer sus propias cookies:
              </p>
              
              <div className="grid gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Google Analytics</h4>
                  <p className="text-sm mb-2">Análisis de tráfico y comportamiento de usuarios</p>
                  <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" 
                     className="text-blue-600 hover:underline text-sm">
                    Ver política de privacidad de Google →
                  </a>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Cloudflare</h4>
                  <p className="text-sm mb-2">Seguridad y optimización de rendimiento</p>
                  <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener noreferrer" 
                     className="text-blue-600 hover:underline text-sm">
                    Ver política de privacidad de Cloudflare →
                  </a>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Stripe</h4>
                  <p className="text-sm mb-2">Procesamiento seguro de pagos</p>
                  <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" 
                     className="text-blue-600 hover:underline text-sm">
                    Ver política de privacidad de Stripe →
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Gestión de Cookies */}
          <Card className="bg-white/80 backdrop-blur-sm border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <Settings className="h-5 w-5" />
                4. Cómo Gestionar las Cookies
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-green-600 mb-2">4.1 En CRUNEVO:</h4>
                  <p>Utiliza el panel de preferencias en la parte superior de esta página para configurar qué tipos de cookies aceptas.</p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-green-600 mb-2">4.2 En tu Navegador:</h4>
                  <div className="grid gap-3">
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="font-medium mb-1">Chrome:</p>
                      <p className="text-sm">Configuración → Privacidad y seguridad → Cookies y otros datos de sitios</p>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="font-medium mb-1">Firefox:</p>
                      <p className="text-sm">Opciones → Privacidad y seguridad → Cookies y datos del sitio</p>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="font-medium mb-1">Safari:</p>
                      <p className="text-sm">Preferencias → Privacidad → Gestionar datos de sitios web</p>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="font-medium mb-1">Edge:</p>
                      <p className="text-sm">Configuración → Privacidad, búsqueda y servicios → Cookies</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <p className="text-yellow-800">
                    <strong>Nota:</strong> Deshabilitar cookies esenciales puede afectar el funcionamiento 
                    de CRUNEVO y algunas funciones podrían no estar disponibles.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Eliminar Cookies */}
          <Card className="bg-white/80 backdrop-blur-sm border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <Trash2 className="h-5 w-5" />
                5. Eliminar Cookies Existentes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700">
              <p>
                Puedes eliminar las cookies que ya están almacenadas en tu dispositivo:
              </p>
              
              <div className="space-y-3">
                <div className="bg-red-50 p-3 rounded-lg">
                  <p className="font-medium mb-1">Eliminar todas las cookies:</p>
                  <p className="text-sm">Ve a la configuración de tu navegador y selecciona "Eliminar datos de navegación" o "Borrar historial".</p>
                </div>
                
                <div className="bg-red-50 p-3 rounded-lg">
                  <p className="font-medium mb-1">Eliminar cookies de CRUNEVO únicamente:</p>
                  <p className="text-sm">En la configuración de cookies de tu navegador, busca "crunevo.com" y elimina las cookies específicas de nuestro sitio.</p>
                </div>
              </div>
              
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <p className="text-orange-800">
                  <strong>Importante:</strong> Al eliminar cookies, perderás tus preferencias guardadas 
                  y tendrás que iniciar sesión nuevamente.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Actualizaciones */}
          <Card className="bg-white/80 backdrop-blur-sm border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <Eye className="h-5 w-5" />
                6. Actualizaciones de esta Política
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700">
              <p>
                Podemos actualizar esta política de cookies ocasionalmente para reflejar cambios 
                en nuestras prácticas o por razones legales. Te notificaremos sobre cambios 
                significativos mediante:
              </p>
              
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Un banner de notificación en la plataforma</li>
                <li>Email a tu dirección registrada</li>
                <li>Actualización de la fecha en esta página</li>
              </ul>
            </CardContent>
          </Card>

          {/* Contacto */}
          <Card className="bg-white/80 backdrop-blur-sm border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-700">
                <Settings className="h-5 w-5" />
                7. Contacto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700">
              <p>Si tienes preguntas sobre nuestra política de cookies:</p>
              <div className="space-y-2">
                <p><strong>Email:</strong> cookies@crunevo.com</p>
                <p><strong>Asunto:</strong> "Consulta sobre Cookies"</p>
              </div>
              <Link href="/contact" className="text-purple-600 hover:underline">
                Formulario de contacto →
              </Link>
              <br />
              <Link href="/privacy" className="text-purple-600 hover:underline">
                Ver Política de Privacidad →
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center py-8">
          <p className="text-gray-500 text-sm">
            Esta política de cookies es parte de nuestra Política de Privacidad y Términos de Servicio
          </p>
        </div>
      </div>
    </div>
  );
}