'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Eye, EyeOff, Mail, Lock, User, Calendar, ArrowRight, Check } from 'lucide-react';

interface RegisterForm {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  birthDate: string;
  gender: string;
  acceptTerms: boolean;
}

export default function RegisterPage() {
  const [form, setForm] = useState<RegisterForm>({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    birthDate: '',
    gender: '',
    acceptTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleInputChange = (field: keyof RegisterForm, value: string | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!form.firstName.trim()) {
      toast.error('El nombre es requerido');
      return false;
    }
    if (!form.lastName.trim()) {
      toast.error('Los apellidos son requeridos');
      return false;
    }
    if (!form.username.trim()) {
      toast.error('El nombre de usuario es requerido');
      return false;
    }
    if (form.username.length < 3) {
      toast.error('El nombre de usuario debe tener al menos 3 caracteres');
      return false;
    }
    if (!form.email.trim()) {
      toast.error('El correo electrónico es requerido');
      return false;
    }
    if (!form.password) {
      toast.error('La contraseña es requerida');
      return false;
    }
    if (form.password.length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres');
      return false;
    }
    if (form.password !== form.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return false;
    }
    if (!form.birthDate) {
      toast.error('La fecha de nacimiento es requerida');
      return false;
    }
    if (!form.gender) {
      toast.error('El género es requerido');
      return false;
    }
    if (!form.acceptTerms) {
      toast.error('Debes aceptar los términos y condiciones');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: `${form.firstName} ${form.lastName}`.trim(),
          username: form.username,
          email: form.email,
          password: form.password,
          birthDate: form.birthDate,
          gender: form.gender
        })
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error('Error en el registro', {
          description: data.message || 'Ocurrió un error inesperado'
        });
        return;
      }

      toast.success('¡Registro exitoso!', {
        description: 'Revisa tu correo para verificar tu cuenta'
      });
      
      router.push('/auth/login?message=registered');
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
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl mb-4">
            <span className="text-2xl font-bold text-white">C</span>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            CRUNEVO
          </h1>
          <p className="text-gray-600 mt-2">Únete a la comunidad educativa</p>
        </div>

        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-bold text-gray-900">
              Crear Cuenta
            </CardTitle>
            <CardDescription className="text-gray-600">
              Completa tus datos para registrarte
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                    Nombre *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="Juan"
                      value={form.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className="pl-10 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                    Apellidos *
                  </label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Pérez García"
                    value={form.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className="border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                    required
                  />
                </div>
              </div>

              {/* Username */}
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium text-gray-700">
                  Nombre de usuario *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">@</span>
                  <Input
                    id="username"
                    type="text"
                    placeholder="juanperez"
                    value={form.username}
                    onChange={(e) => handleInputChange('username', e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    className="pl-8 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Correo electrónico *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="juan@email.com"
                    value={form.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="pl-10 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                    required
                  />
                </div>
              </div>

              {/* Password Fields */}
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Contraseña *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Mínimo 8 caracteres"
                      value={form.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="pl-10 pr-12 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <span className="text-lg">
                        {showPassword ? '🙈' : '🙉'}
                      </span>
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                    Confirmar contraseña *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Repite tu contraseña"
                      value={form.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className="pl-10 pr-12 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <span className="text-lg">
                        {showConfirmPassword ? '🙈' : '🙉'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Birth Date and Gender */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="birthDate" className="text-sm font-medium text-gray-700">
                    Fecha de nacimiento *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="birthDate"
                      type="date"
                      value={form.birthDate}
                      onChange={(e) => handleInputChange('birthDate', e.target.value)}
                      className="pl-10 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="gender" className="text-sm font-medium text-gray-700">
                    Género *
                  </label>
                  <select
                    id="gender"
                    value={form.gender}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-md focus:border-purple-500 focus:ring-purple-500 bg-white"
                    required
                  >
                    <option value="">Seleccionar</option>
                    <option value="male">Masculino</option>
                    <option value="female">Femenino</option>
                    <option value="other">Otro</option>
                    <option value="prefer_not_to_say">Prefiero no decir</option>
                  </select>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-start space-x-3">
                <button
                  type="button"
                  onClick={() => handleInputChange('acceptTerms', !form.acceptTerms)}
                  className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                    form.acceptTerms
                      ? 'bg-purple-600 border-purple-600 text-white'
                      : 'border-gray-300 hover:border-purple-500'
                  }`}
                >
                  {form.acceptTerms && <Check className="h-3 w-3" />}
                </button>
                <label className="text-sm text-gray-600 leading-5">
                  Acepto los{' '}
                  <Link href="/legal/terms" className="text-purple-600 hover:text-purple-700 underline">
                    Términos y Condiciones
                  </Link>
                  {' '}y la{' '}
                  <Link href="/legal/privacy" className="text-purple-600 hover:text-purple-700 underline">
                    Política de Privacidad
                  </Link>
                  {' '}de CRUNEVO *
                </label>
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
                    <span>Creando cuenta...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span>Crear Cuenta</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                )}
              </Button>

              <div className="text-center text-sm text-gray-600">
                ¿Ya tienes una cuenta?{' '}
                <Link 
                  href="/auth/login" 
                  className="text-purple-600 hover:text-purple-700 font-medium transition-colors"
                >
                  Inicia sesión aquí
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>© 2025 CRUNEVO — Construyendo el Futuro Educativo</p>
        </div>
      </div>
    </div>
  );
}