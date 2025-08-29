"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Shield, Users, Gavel } from "lucide-react";
import Link from "next/link";

export default function TermsPage() {
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
            <div className="p-3 bg-purple-100 rounded-full">
              <FileText className="h-8 w-8 text-purple-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Términos y Condiciones
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Última actualización: Enero 2024
          </p>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Introducción */}
          <Card className="bg-white/80 backdrop-blur-sm border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-700">
                <Shield className="h-5 w-5" />
                1. Introducción
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700">
              <p>
                Bienvenido a CRUNEVO, la plataforma estudiantil universitaria que conecta a estudiantes peruanos 
                para compartir apuntes, participar en foros académicos y acceder a un marketplace de servicios estudiantiles.
              </p>
              <p>
                Al acceder y utilizar nuestros servicios, aceptas cumplir con estos términos y condiciones. 
                Si no estás de acuerdo con alguna parte de estos términos, no debes utilizar nuestra plataforma.
              </p>
            </CardContent>
          </Card>

          {/* Definiciones */}
          <Card className="bg-white/80 backdrop-blur-sm border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <FileText className="h-5 w-5" />
                2. Definiciones
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700">
              <div className="space-y-3">
                <div>
                  <strong>"CRUNEVO"</strong>: Se refiere a la plataforma estudiantil universitaria y todos sus servicios.
                </div>
                <div>
                  <strong>"Usuario"</strong>: Cualquier persona que acceda o utilice nuestros servicios.
                </div>
                <div>
                  <strong>"Estudiante"</strong>: Usuario registrado con email universitario verificado.
                </div>
                <div>
                  <strong>"Crolars"</strong>: Moneda virtual utilizada dentro de la plataforma para transacciones y recompensas.
                </div>
                <div>
                  <strong>"Contenido"</strong>: Incluye apuntes, posts del foro, comentarios, y cualquier material subido por usuarios.
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Registro y Cuenta */}
          <Card className="bg-white/80 backdrop-blur-sm border-indigo-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-indigo-700">
                <Users className="h-5 w-5" />
                3. Registro y Cuenta de Usuario
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700">
              <div className="space-y-3">
                <p><strong>3.1 Elegibilidad:</strong> Debes ser estudiante de La Cantuta o institución pedagógica en Perú con email institucional válido (@une.edu.pe o similar).</p>
                <p><strong>3.2 Verificación:</strong> Es obligatorio verificar tu identidad estudiantil para acceder a todas las funcionalidades.</p>
                <p><strong>3.3 Responsabilidad:</strong> Eres responsable de mantener la confidencialidad de tu cuenta y contraseña.</p>
                <p><strong>3.4 Información Veraz:</strong> Debes proporcionar información precisa y actualizada durante el registro.</p>
                <p><strong>3.5 Una Cuenta por Usuario:</strong> Cada usuario puede tener solo una cuenta activa.</p>
              </div>
            </CardContent>
          </Card>

          {/* Uso de la Plataforma */}
          <Card className="bg-white/80 backdrop-blur-sm border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <Gavel className="h-5 w-5" />
                4. Uso Aceptable de la Plataforma
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700">
              <div className="space-y-3">
                <p><strong>4.1 Contenido Académico:</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Solo puedes subir contenido académico original o con permisos apropiados</li>
                  <li>Respeta los derechos de autor y propiedad intelectual</li>
                  <li>No subas material protegido sin autorización</li>
                </ul>
                
                <p><strong>4.2 Comportamiento en Foros:</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Mantén un lenguaje respetuoso y académico</li>
                  <li>No publiques contenido ofensivo, discriminatorio o inapropiado</li>
                  <li>Evita el spam y la publicidad no autorizada</li>
                </ul>
                
                <p><strong>4.3 Marketplace Educativo:</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Solo ofrece servicios legales relacionados con la formación docente y educación</li>
                  <li>Cumple con todas las transacciones acordadas</li>
                  <li>No uses la plataforma para actividades fraudulentas</li>
                  <li>Prioriza materiales y servicios que fortalezcan la formación pedagógica</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Sistema de Crolars */}
          <Card className="bg-white/80 backdrop-blur-sm border-orange-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-700">
                <span className="text-lg">🪙</span>
                5. Sistema de Crolars
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700">
              <div className="space-y-3">
                <p><strong>5.1 Naturaleza:</strong> Los Crolars son una moneda virtual sin valor monetario real fuera de la plataforma.</p>
                <p><strong>5.2 Obtención:</strong> Se ganan a través de participación activa, subida de contenido y completar desafíos.</p>
                <p><strong>5.3 Uso:</strong> Pueden utilizarse para acceder a servicios premium y realizar transacciones en el marketplace.</p>
                <p><strong>5.4 No Transferibles:</strong> Los Crolars no pueden ser transferidos a dinero real ni a otras plataformas.</p>
                <p><strong>5.5 Caducidad:</strong> CRUNEVO se reserva el derecho de establecer políticas de caducidad para Crolars inactivos.</p>
              </div>
            </CardContent>
          </Card>

          {/* Propiedad Intelectual */}
          <Card className="bg-white/80 backdrop-blur-sm border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-700">
                <Shield className="h-5 w-5" />
                6. Propiedad Intelectual
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700">
              <div className="space-y-3">
                <p><strong>6.1 Contenido del Usuario:</strong> Mantienes los derechos sobre el contenido que subes, pero otorgas a CRUNEVO una licencia para mostrarlo y distribuirlo en la plataforma.</p>
                <p><strong>6.2 Contenido de CRUNEVO:</strong> Todos los elementos de diseño, código, y funcionalidades de la plataforma son propiedad de CRUNEVO.</p>
                <p><strong>6.3 Respeto a Derechos:</strong> Respetamos los derechos de propiedad intelectual y respondemos a notificaciones de infracción según la ley peruana.</p>
              </div>
            </CardContent>
          </Card>

          {/* Privacidad y Datos */}
          <Card className="bg-white/80 backdrop-blur-sm border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <Shield className="h-5 w-5" />
                7. Privacidad y Protección de Datos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700">
              <p>
                El tratamiento de tus datos personales se rige por nuestra Política de Privacidad, 
                que cumple con la Ley de Protección de Datos Personales del Perú (Ley N° 29733).
              </p>
              <Link href="/privacy" className="text-blue-600 hover:underline">
                Ver Política de Privacidad →
              </Link>
            </CardContent>
          </Card>

          {/* Terminación */}
          <Card className="bg-white/80 backdrop-blur-sm border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <Gavel className="h-5 w-5" />
                8. Terminación de Cuenta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700">
              <div className="space-y-3">
                <p><strong>8.1 Por el Usuario:</strong> Puedes cerrar tu cuenta en cualquier momento desde la configuración.</p>
                <p><strong>8.2 Por CRUNEVO:</strong> Podemos suspender o cerrar cuentas que violen estos términos.</p>
                <p><strong>8.3 Efectos:</strong> Al cerrar la cuenta, perderás acceso a todos los Crolars y contenido asociado.</p>
              </div>
            </CardContent>
          </Card>

          {/* Limitación de Responsabilidad */}
          <Card className="bg-white/80 backdrop-blur-sm border-yellow-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-700">
                <Shield className="h-5 w-5" />
                9. Limitación de Responsabilidad
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700">
              <div className="space-y-3">
                <p>CRUNEVO proporciona la plataforma "tal como está" y no garantiza:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Disponibilidad continua del servicio</li>
                  <li>Exactitud del contenido subido por usuarios</li>
                  <li>Resultados específicos del uso de la plataforma</li>
                </ul>
                <p>Nuestra responsabilidad se limita al marco legal aplicable en Perú.</p>
              </div>
            </CardContent>
          </Card>

          {/* Ley Aplicable */}
          <Card className="bg-white/80 backdrop-blur-sm border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-700">
                <Gavel className="h-5 w-5" />
                10. Ley Aplicable y Jurisdicción
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700">
              <p>
                Estos términos se rigen por las leyes de la República del Perú. 
                Cualquier disputa será resuelta en los tribunales competentes de Lima, Perú.
              </p>
            </CardContent>
          </Card>

          {/* Contacto */}
          <Card className="bg-white/80 backdrop-blur-sm border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <Users className="h-5 w-5" />
                11. Contacto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700">
              <p>Para consultas sobre estos términos, contáctanos:</p>
              <div className="space-y-2">
                <p><strong>Email:</strong> legal@crunevo.com</p>
                <p><strong>Dirección:</strong> Lima, Perú</p>
              </div>
              <Link href="/contact" className="text-green-600 hover:underline">
                Formulario de contacto →
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center py-8">
          <p className="text-gray-500 text-sm">
            Al continuar usando CRUNEVO, aceptas estos términos y condiciones.
          </p>
        </div>
      </div>
    </div>
  );
}