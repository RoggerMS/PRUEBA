'use client';

import { useSession } from 'next-auth/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, AlertCircle, Clock, University, User, Shield } from 'lucide-react';
import Link from 'next/link';
import { usePermissions } from '@/hooks/useUniversityVerification';

interface VerificationStatusProps {
  showCard?: boolean;
  showActions?: boolean;
  compact?: boolean;
}

export function VerificationStatus({ 
  showCard = false, 
  showActions = true, 
  compact = false 
}: VerificationStatusProps) {
  const { data: session } = useSession();
  const { isVerified, canCreateContent, user } = usePermissions();

  if (!session?.user) {
    return null;
  }

  const getVerificationBadge = () => {
    if (isVerified()) {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
          <CheckCircle className="w-3 h-3 mr-1" />
          Verificado
        </Badge>
      );
    }

    return (
      <Badge variant="destructive" className="bg-yellow-100 text-yellow-800 border-yellow-200">
        <AlertCircle className="w-3 h-3 mr-1" />
        Sin verificar
      </Badge>
    );
  };

  const getRoleBadge = () => {
    const roleConfig = {
      'ADMIN': { 
        icon: Shield, 
        label: 'Administrador', 
        className: 'bg-purple-100 text-purple-800 border-purple-200' 
      },
      'MODERATOR': { 
        icon: User, 
        label: 'Moderador', 
        className: 'bg-blue-100 text-blue-800 border-blue-200' 
      },
      'STUDENT': { 
        icon: University, 
        label: 'Estudiante', 
        className: 'bg-gray-100 text-gray-800 border-gray-200' 
      }
    };

    const role = user?.role as keyof typeof roleConfig;
    const config = roleConfig[role] || roleConfig['STUDENT'];
    const Icon = config.icon;

    return (
      <Badge variant="outline" className={config.className}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getStatusMessage = () => {
    if (isVerified()) {
      return {
        title: '¡Cuenta verificada!',
        description: `Tu email universitario ha sido verificado. Puedes acceder a todas las funcionalidades de CRUNEVO.`,
        icon: CheckCircle,
        iconColor: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200'
      };
    }

    return {
      title: 'Verificación pendiente',
      description: 'Verifica tu email universitario para acceder a todas las funcionalidades y conectarte con tu comunidad académica.',
      icon: Clock,
      iconColor: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200'
    };
  };

  if (compact) {
    return (
      <div className="flex items-center space-x-2">
        {getVerificationBadge()}
        {getRoleBadge()}
      </div>
    );
  }

  const status = getStatusMessage();
  const Icon = status.icon;

  const content = (
    <div className={`p-4 rounded-lg border ${status.bgColor} ${status.borderColor}`}>
      <div className="flex items-start space-x-3">
        <Icon className={`h-5 w-5 ${status.iconColor} mt-0.5`} />
        <div className="flex-1">
          <h3 className="font-medium text-gray-900">{status.title}</h3>
          <p className="text-sm text-gray-600 mt-1">{status.description}</p>
          
          {user?.university && (
            <div className="mt-2 text-sm text-gray-500">
              <span className="font-medium">Universidad:</span> {user.university}
              {user.career && (
                <span className="ml-3">
                  <span className="font-medium">Carrera:</span> {user.career}
                </span>
              )}
            </div>
          )}
          
          <div className="flex items-center space-x-2 mt-3">
            {getVerificationBadge()}
            {getRoleBadge()}
          </div>
          
          {showActions && !isVerified() && (
            <div className="mt-4">
              <Button asChild size="sm">
                <Link href="/auth/verify-university">
                  Verificar Email Universitario
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (showCard) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <University className="h-5 w-5" />
            <span>Estado de Verificación</span>
          </CardTitle>
          <CardDescription>
            Información sobre tu verificación universitaria y permisos
          </CardDescription>
        </CardHeader>
        <CardContent>
          {content}
        </CardContent>
      </Card>
    );
  }

  return content;
}

// Componente específico para mostrar solo el estado de verificación
export function VerificationBadge() {
  return <VerificationStatus compact={true} showActions={false} />;
}

// Componente para mostrar información detallada del usuario
export function UserVerificationCard() {
  return <VerificationStatus showCard={true} showActions={true} />;
}