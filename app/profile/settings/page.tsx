'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { UserVerificationCard } from '@/components/auth/VerificationStatus';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useUniversityVerification } from '@/hooks/useUniversityVerification';
import { 
  User, 
  Mail, 
  University, 
  GraduationCap, 
  Calendar,
  Settings,
  Shield,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function ProfileSettingsPage() {
  const { data: session, update } = useSession();
  const { verificationStatus, loading } = useUniversityVerification();
  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState({
    name: session?.user?.name || '',
    username: session?.user?.username || ''
  });

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success('Perfil actualizado correctamente');
        await update(); // Actualizar sesión
      } else {
        const error = await response.json();
        toast.error(error.message || 'Error al actualizar perfil');
      }
    } catch (error) {
      toast.error('Error de conexión');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <ProtectedRoute requireAuth={true}>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center space-x-2">
            <Settings className="h-8 w-8" />
            <span>Configuración del Perfil</span>
          </h1>
          <p className="text-muted-foreground mt-2">
            Gestiona tu información personal y configuración de cuenta
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Información Personal */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Información Personal</span>
              </CardTitle>
              <CardDescription>
                Actualiza tu información básica de perfil
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre completo</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Tu nombre completo"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="username">Nombre de usuario</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="Tu nombre de usuario"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Email actual</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      value={session?.user?.email || ''}
                      disabled
                      className="bg-gray-50"
                    />
                    <Mail className="h-4 w-4 text-gray-400" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Para cambiar tu email, contacta al soporte
                  </p>
                </div>

                <Button type="submit" disabled={isUpdating} className="w-full">
                  {isUpdating ? 'Actualizando...' : 'Actualizar Perfil'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Estado de Verificación */}
          <div className="space-y-6">
            <UserVerificationCard />
            
            {/* Información Universitaria */}
            {session?.user?.verified && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <University className="h-5 w-5" />
                    <span>Información Universitaria</span>
                  </CardTitle>
                  <CardDescription>
                    Detalles de tu verificación académica
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <University className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium">Universidad:</span>
                      </div>
                      <span className="text-sm">{session.user.university || 'No especificada'}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <GraduationCap className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium">Carrera:</span>
                      </div>
                      <span className="text-sm">{session.user.career || 'No especificada'}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Shield className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium">Rol:</span>
                      </div>
                      <Badge variant="outline">
                        {session.user.role === 'ADMIN' ? 'Administrador' :
                         session.user.role === 'MODERATOR' ? 'Moderador' : 'Estudiante'}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium">Estado:</span>
                      </div>
                      <Badge className="bg-green-100 text-green-800">
                        Verificado
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Acciones Adicionales */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Acciones de Cuenta</CardTitle>
              <CardDescription>
                Opciones adicionales para tu cuenta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                {!session?.user?.verified && (
                  <Button asChild>
                    <Link href="/auth/verify-university">
                      <University className="h-4 w-4 mr-2" />
                      Verificar Email Universitario
                    </Link>
                  </Button>
                )}
                
                <Button variant="outline" asChild>
                  <Link href={`/${session?.user?.username ?? ''}`}>
                    <User className="h-4 w-4 mr-2" />
                    Ver Perfil Público
                  </Link>
                </Button>
                
                <Button variant="outline" asChild>
                  <Link href="/dashboard">
                    <Settings className="h-4 w-4 mr-2" />
                    Ir al Dashboard
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Información de Seguridad */}
        <div className="mt-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Importante:</strong> Tu información universitaria es verificada y no puede ser modificada directamente. 
              Si necesitas actualizar estos datos, contacta al soporte técnico.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </ProtectedRoute>
  );
}