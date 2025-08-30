'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, Mail, University, GraduationCap } from 'lucide-react';
import { toast } from 'sonner';

interface VerificationStatus {
  isVerified: boolean;
  emailVerified: boolean;
  university?: string;
  career?: string;
  graduationYear?: number;
  email: string;
  hasPendingVerification: boolean;
  isUniversityEmail: boolean;
}

interface UniversityVerificationProps {
  onVerificationComplete?: () => void;
}

const UNIVERSITIES = [
  { value: 'Universidad Nacional Mayor de San Marcos', domain: 'unmsm.edu.pe' },
  { value: 'Universidad Nacional de Ingeniería', domain: 'uni.edu.pe' },
  { value: 'Pontificia Universidad Católica del Perú', domain: 'pucp.edu.pe' },
  { value: 'Universidad de Lima', domain: 'ulima.edu.pe' },
  { value: 'Universidad Peruana de Ciencias Aplicadas', domain: 'upc.edu.pe' },
  { value: 'Universidad San Ignacio de Loyola', domain: 'usil.edu.pe' },
  { value: 'Universidad Tecnológica del Perú', domain: 'utp.edu.pe' },
  { value: 'Universidad Privada del Norte', domain: 'upn.edu.pe' },
  { value: 'Universidad de San Martín de Porres', domain: 'usmp.edu.pe' },
  { value: 'Universidad Nacional Federico Villarreal', domain: 'unfv.edu.pe' }
];

const CAREERS = [
  'Ingeniería de Sistemas',
  'Ingeniería de Software',
  'Ciencias de la Computación',
  'Ingeniería Informática',
  'Ingeniería Industrial',
  'Administración',
  'Contabilidad',
  'Economía',
  'Derecho',
  'Medicina',
  'Psicología',
  'Arquitectura',
  'Ingeniería Civil',
  'Marketing',
  'Comunicaciones'
];

export default function UniversityVerification({ onVerificationComplete }: UniversityVerificationProps) {
  const { data: session } = useSession();
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'info' | 'verify'>('info');
  
  // Form data
  const [formData, setFormData] = useState({
    universityEmail: '',
    university: '',
    career: '',
    studentId: '',
    graduationYear: new Date().getFullYear()
  });
  
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');

  // Cargar estado de verificación al montar el componente
  useState(() => {
    if (session?.user) {
      loadVerificationStatus();
    }
  });

  const loadVerificationStatus = async () => {
    try {
      const response = await fetch('/api/auth/verify-university');
      if (response.ok) {
        const data = await response.json();
        setVerificationStatus(data);
        
        // Si ya está verificado, mostrar estado
        if (data.isVerified) {
          setStep('info');
        }
      }
    } catch (error) {
      console.error('Error cargando estado de verificación:', error);
    }
  };

  const handleSubmitInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/verify-university', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Código de verificación enviado a tu email universitario');
        setStep('verify');
        // En desarrollo, mostrar el código
        if (data.verificationCode) {
          toast.info(`Código de verificación: ${data.verificationCode}`);
        }
      } else {
        setError(data.error || 'Error al enviar verificación');
      }
    } catch (error) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/verify-university', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verificationCode,
          universityEmail: formData.universityEmail
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('¡Verificación universitaria completada!');
        toast.success(`¡Ganaste ${data.bonusAwarded.crolars} Crolars y ${data.bonusAwarded.xp} XP!`);
        await loadVerificationStatus();
        onVerificationComplete?.();
      } else {
        setError(data.error || 'Código de verificación inválido');
      }
    } catch (error) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const getSelectedUniversityDomain = () => {
    const university = UNIVERSITIES.find(u => u.value === formData.university);
    return university?.domain || '';
  };

  // Si ya está verificado, mostrar estado
  if (verificationStatus?.isVerified) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <CardTitle className="text-green-700">Verificación Completada</CardTitle>
          <CardDescription>
            Tu cuenta universitaria ha sido verificada exitosamente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-500" />
              <span className="text-sm">{verificationStatus.email}</span>
              <Badge variant="secondary" className="text-xs">Verificado</Badge>
            </div>
            {verificationStatus.university && (
              <div className="flex items-center gap-2">
                <University className="w-4 h-4 text-gray-500" />
                <span className="text-sm">{verificationStatus.university}</span>
              </div>
            )}
            {verificationStatus.career && (
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-gray-500" />
                <span className="text-sm">{verificationStatus.career}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <University className="w-5 h-5" />
          Verificación Universitaria
        </CardTitle>
        <CardDescription>
          {step === 'info' 
            ? 'Ingresa tu información universitaria para verificar tu cuenta'
            : 'Ingresa el código enviado a tu email universitario'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert className="mb-4" variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {step === 'info' ? (
          <form onSubmit={handleSubmitInfo} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="university">Universidad</Label>
              <Select 
                value={formData.university} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, university: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona tu universidad" />
                </SelectTrigger>
                <SelectContent>
                  {UNIVERSITIES.map((uni) => (
                    <SelectItem key={uni.value} value={uni.value}>
                      {uni.value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="career">Carrera</Label>
              <Select 
                value={formData.career} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, career: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona tu carrera" />
                </SelectTrigger>
                <SelectContent>
                  {CAREERS.map((career) => (
                    <SelectItem key={career} value={career}>
                      {career}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="universityEmail">Email Universitario</Label>
              <Input
                id="universityEmail"
                type="email"
                placeholder={`ejemplo@${getSelectedUniversityDomain()}`}
                value={formData.universityEmail}
                onChange={(e) => setFormData(prev => ({ ...prev, universityEmail: e.target.value }))}
                required
              />
              {getSelectedUniversityDomain() && (
                <p className="text-xs text-gray-500">
                  Debe terminar en @{getSelectedUniversityDomain()}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="studentId">Código de Estudiante (Opcional)</Label>
              <Input
                id="studentId"
                placeholder="Ej: 20201234"
                value={formData.studentId}
                onChange={(e) => setFormData(prev => ({ ...prev, studentId: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="graduationYear">Año de Graduación Estimado</Label>
              <Select 
                value={formData.graduationYear.toString()} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, graduationYear: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 11 }, (_, i) => {
                    const year = new Date().getFullYear() + i;
                    return (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar Código de Verificación'}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="verificationCode">Código de Verificación</Label>
              <Input
                id="verificationCode"
                placeholder="Ingresa el código de 6 dígitos"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.toUpperCase())}
                maxLength={6}
                required
              />
              <p className="text-xs text-gray-500">
                Revisa tu email universitario: {formData.universityEmail}
              </p>
            </div>

            <div className="flex gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setStep('info')}
                className="flex-1"
              >
                Volver
              </Button>
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? 'Verificando...' : 'Verificar'}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}