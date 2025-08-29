"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield, Eye, Lock, Database, UserCheck, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-6">
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
            <div className="p-3 bg-blue-100 rounded-full">
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Política de Privacidad
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Última actualización: Enero 2024 | Cumple con la Ley N° 29733 del Perú
          </p>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Introducción */}
          <Card className="bg-white/80 backdrop-blur-sm border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <Shield className="h-5 w-5" />
                1. Introducción
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700">
              <p>
                En CRUNEVO, respetamos y protegemos la privacidad de nuestros usuarios. Esta política explica 
                cómo recopilamos, utilizamos, almacenamos y protegemos tu información personal de acuerdo con 
                la Ley de Protección de Datos Personales del Perú (Ley N° 29733) y su reglamento.
              </p>
              <p>
                Al utilizar nuestra plataforma, aceptas las prácticas descritas en esta política de privacidad.
              </p>
            </CardContent>
          </Card>

          {/* Responsable del Tratamiento */}
          <Card className="bg-white/80 backdrop-blur-sm border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-700">
                <UserCheck className="h-5 w-5" />
                2. Responsable del Tratamiento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700">
              <div className="space-y-3">
                <p><strong>Razón Social:</strong> CRUNEVO S.A.C.</p>
                <p><strong>Domicilio:</strong> Lima, Perú</p>
                <p><strong>Email de contacto:</strong> privacidad@crunevo.com</p>
                <p><strong>Registro en ARPDP:</strong> [Número de registro cuando aplique]</p>
              </div>
            </CardContent>
          </Card>

          {/* Información que Recopilamos */}
          <Card className="bg-white/80 backdrop-blur-sm border-indigo-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-indigo-700">
                <Database className="h-5 w-5" />
                3. Información que Recopilamos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-indigo-600 mb-2">3.1 Información de Registro:</h4>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Nombre completo</li>
                    <li>Email universitario</li>
                    <li>Universidad y carrera</li>
                    <li>Año de estudios</li>
                    <li>Contraseña (encriptada)</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-indigo-600 mb-2">3.2 Información de Perfil:</h4>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Foto de perfil (opcional)</li>
                    <li>Biografía y descripción</li>
                    <li>Cursos de interés</li>
                    <li>Preferencias de notificación</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-indigo-600 mb-2">3.3 Información de Actividad:</h4>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Apuntes subidos y descargados</li>
                    <li>Participación en foros</li>
                    <li>Transacciones en marketplace</li>
                    <li>Historial de Crolars</li>
                    <li>Logros y badges obtenidos</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-indigo-600 mb-2">3.4 Información Técnica:</h4>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Dirección IP</li>
                    <li>Tipo de navegador y dispositivo</li>
                    <li>Páginas visitadas y tiempo de permanencia</li>
                    <li>Cookies y tecnologías similares</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Finalidades del Tratamiento */}
          <Card className="bg-white/80 backdrop-blur-sm border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <Eye className="h-5 w-5" />
                4. Finalidades del Tratamiento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700">
              <div className="space-y-3">
                <p><strong>4.1 Prestación del Servicio:</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Crear y gestionar tu cuenta de usuario</li>
                  <li>Facilitar el intercambio de apuntes académicos</li>
                  <li>Habilitar la participación en foros estudiantiles</li>
                  <li>Procesar transacciones en el marketplace</li>
                  <li>Gestionar el sistema de gamificación y Crolars</li>
                </ul>
                
                <p><strong>4.2 Comunicación:</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Enviar notificaciones sobre actividad en la plataforma</li>
                  <li>Comunicar actualizaciones y nuevas funcionalidades</li>
                  <li>Responder a consultas y brindar soporte técnico</li>
                </ul>
                
                <p><strong>4.3 Mejora del Servicio:</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Analizar el uso de la plataforma para mejoras</li>
                  <li>Personalizar la experiencia del usuario</li>
                  <li>Desarrollar nuevas funcionalidades</li>
                </ul>
                
                <p><strong>4.4 Seguridad y Cumplimiento:</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Prevenir fraudes y actividades maliciosas</li>
                  <li>Cumplir con obligaciones legales</li>
                  <li>Proteger los derechos de usuarios y terceros</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Base Legal */}
          <Card className="bg-white/80 backdrop-blur-sm border-orange-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-700">
                <Lock className="h-5 w-5" />
                5. Base Legal del Tratamiento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700">
              <div className="space-y-3">
                <p><strong>5.1 Consentimiento:</strong> Para el registro y uso de servicios opcionales.</p>
                <p><strong>5.2 Ejecución Contractual:</strong> Para cumplir con los términos de servicio aceptados.</p>
                <p><strong>5.3 Interés Legítimo:</strong> Para mejorar nuestros servicios y garantizar la seguridad.</p>
                <p><strong>5.4 Cumplimiento Legal:</strong> Para cumplir con obligaciones legales aplicables.</p>
              </div>
            </CardContent>
          </Card>

          {/* Compartir Información */}
          <Card className="bg-white/80 backdrop-blur-sm border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="h-5 w-5" />
                6. Compartir tu Información
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700">
              <div className="space-y-3">
                <p><strong>6.1 Dentro de la Plataforma:</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Tu perfil público es visible para otros estudiantes</li>
                  <li>Tus contribuciones en foros son públicas</li>
                  <li>Los apuntes que compartes incluyen tu autoría</li>
                </ul>
                
                <p><strong>6.2 Proveedores de Servicios:</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Servicios de hosting y almacenamiento en la nube</li>
                  <li>Procesadores de pagos para transacciones</li>
                  <li>Servicios de email y notificaciones</li>
                  <li>Herramientas de análisis y métricas</li>
                </ul>
                
                <p><strong>6.3 Requerimientos Legales:</strong></p>
                <p>Podemos compartir información cuando sea requerido por ley o autoridades competentes.</p>
                
                <p><strong>6.4 NO Vendemos Datos:</strong></p>
                <p>Nunca vendemos, alquilamos o comercializamos tu información personal a terceros.</p>
              </div>
            </CardContent>
          </Card>

          {/* Seguridad */}
          <Card className="bg-white/80 backdrop-blur-sm border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <Lock className="h-5 w-5" />
                7. Seguridad de la Información
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700">
              <div className="space-y-3">
                <p><strong>7.1 Medidas Técnicas:</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Encriptación de datos sensibles</li>
                  <li>Conexiones seguras HTTPS</li>
                  <li>Firewalls y sistemas de detección de intrusos</li>
                  <li>Respaldos regulares y seguros</li>
                </ul>
                
                <p><strong>7.2 Medidas Organizacionales:</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Acceso limitado a datos personales</li>
                  <li>Capacitación del personal en protección de datos</li>
                  <li>Políticas internas de seguridad</li>
                  <li>Auditorías regulares de seguridad</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Retención de Datos */}
          <Card className="bg-white/80 backdrop-blur-sm border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-700">
                <Database className="h-5 w-5" />
                8. Retención de Datos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700">
              <div className="space-y-3">
                <p><strong>8.1 Cuenta Activa:</strong> Mantenemos tus datos mientras tu cuenta esté activa.</p>
                <p><strong>8.2 Cuenta Cerrada:</strong> Después del cierre, conservamos datos por:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Datos de transacciones: 10 años (requerimiento fiscal)</li>
                  <li>Datos de comunicaciones: 2 años</li>
                  <li>Logs de seguridad: 1 año</li>
                  <li>Otros datos personales: 30 días</li>
                </ul>
                <p><strong>8.3 Eliminación:</strong> Transcurridos los plazos, eliminamos permanentemente los datos.</p>
              </div>
            </CardContent>
          </Card>

          {/* Derechos del Usuario */}
          <Card className="bg-white/80 backdrop-blur-sm border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <UserCheck className="h-5 w-5" />
                9. Tus Derechos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700">
              <div className="space-y-3">
                <p>Según la Ley N° 29733, tienes derecho a:</p>
                
                <p><strong>9.1 Acceso:</strong> Conocer qué datos personales tenemos sobre ti.</p>
                <p><strong>9.2 Rectificación:</strong> Corregir datos inexactos o incompletos.</p>
                <p><strong>9.3 Cancelación:</strong> Solicitar la eliminación de tus datos.</p>
                <p><strong>9.4 Oposición:</strong> Oponerte al tratamiento de tus datos.</p>
                <p><strong>9.5 Portabilidad:</strong> Recibir tus datos en formato estructurado.</p>
                
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <p><strong>¿Cómo ejercer tus derechos?</strong></p>
                  <p>Envía un email a: <strong>privacidad@crunevo.com</strong></p>
                  <p>Incluye: nombre completo, email registrado y derecho que deseas ejercer.</p>
                  <p>Responderemos en un plazo máximo de 10 días hábiles.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cookies */}
          <Card className="bg-white/80 backdrop-blur-sm border-yellow-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-700">
                <span className="text-lg">🍪</span>
                10. Cookies y Tecnologías Similares
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700">
              <p>
                Utilizamos cookies y tecnologías similares para mejorar tu experiencia, 
                recordar tus preferencias y analizar el uso de nuestra plataforma.
              </p>
              <Link href="/cookies" className="text-yellow-600 hover:underline">
                Ver Política de Cookies completa →
              </Link>
            </CardContent>
          </Card>

          {/* Transferencias Internacionales */}
          <Card className="bg-white/80 backdrop-blur-sm border-indigo-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-indigo-700">
                <Database className="h-5 w-5" />
                11. Transferencias Internacionales
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700">
              <p>
                Algunos de nuestros proveedores de servicios pueden estar ubicados fuera del Perú. 
                En estos casos, garantizamos que se mantengan niveles adecuados de protección 
                mediante contratos específicos y medidas de seguridad apropiadas.
              </p>
            </CardContent>
          </Card>

          {/* Menores de Edad */}
          <Card className="bg-white/80 backdrop-blur-sm border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="h-5 w-5" />
                12. Menores de Edad
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700">
              <p>
                Nuestra plataforma está dirigida a estudiantes universitarios mayores de 18 años. 
                Si eres menor de edad, necesitas autorización de tus padres o tutores para usar nuestros servicios.
              </p>
            </CardContent>
          </Card>

          {/* Cambios en la Política */}
          <Card className="bg-white/80 backdrop-blur-sm border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-700">
                <Eye className="h-5 w-5" />
                13. Cambios en esta Política
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700">
              <p>
                Podemos actualizar esta política ocasionalmente. Te notificaremos sobre cambios 
                significativos por email o mediante avisos en la plataforma. La fecha de última 
                actualización siempre aparece al inicio de este documento.
              </p>
            </CardContent>
          </Card>

          {/* Contacto */}
          <Card className="bg-white/80 backdrop-blur-sm border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <UserCheck className="h-5 w-5" />
                14. Contacto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700">
              <p>Para consultas sobre privacidad y protección de datos:</p>
              <div className="space-y-2">
                <p><strong>Email:</strong> privacidad@crunevo.com</p>
                <p><strong>Asunto:</strong> "Consulta sobre Privacidad"</p>
                <p><strong>Dirección:</strong> Lima, Perú</p>
              </div>
              <Link href="/contact" className="text-blue-600 hover:underline">
                Formulario de contacto →
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center py-8">
          <p className="text-gray-500 text-sm">
            Esta política cumple con la Ley de Protección de Datos Personales del Perú (Ley N° 29733)
          </p>
        </div>
      </div>
    </div>
  );
}