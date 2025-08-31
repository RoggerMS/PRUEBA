'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Users, Globe, Lock, Loader2 } from 'lucide-react';
import { z } from 'zod';

const createClubSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(100, 'El nombre no puede exceder 100 caracteres'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres').max(500, 'La descripción no puede exceder 500 caracteres'),
  category: z.string().min(1, 'Selecciona una categoría'),
  subject: z.string().optional(),
  level: z.string().optional(),
  location: z.string().optional(),
  rules: z.string().optional(),
  visibility: z.enum(['PUBLIC', 'PRIVATE']),
  maxMembers: z.number().min(2, 'Mínimo 2 miembros').max(1000, 'Máximo 1000 miembros').optional(),
});

type CreateClubForm = z.infer<typeof createClubSchema>;

const categories = [
  'Académico',
  'Deportes',
  'Arte y Cultura',
  'Tecnología',
  'Ciencias',
  'Idiomas',
  'Música',
  'Literatura',
  'Debate',
  'Voluntariado',
  'Emprendimiento',
  'Fotografía',
  'Teatro',
  'Danza',
  'Otros'
];

const subjects = [
  'Matemáticas',
  'Física',
  'Química',
  'Biología',
  'Historia',
  'Geografía',
  'Literatura',
  'Filosofía',
  'Inglés',
  'Francés',
  'Alemán',
  'Informática',
  'Economía',
  'Psicología',
  'Arte',
  'Música',
  'Educación Física'
];

const levels = [
  'Principiante',
  'Intermedio',
  'Avanzado',
  'Todos los niveles'
];

export default function CreateClubPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState<CreateClubForm>({
    name: '',
    description: '',
    category: '',
    subject: '',
    level: '',
    location: '',
    rules: '',
    visibility: 'PUBLIC',
    maxMembers: undefined,
  });

  const handleInputChange = (field: keyof CreateClubForm, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    try {
      createClubSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session) {
      toast.error('Debes iniciar sesión para crear un club');
      return;
    }

    if (!validateForm()) {
      toast.error('Por favor corrige los errores en el formulario');
      return;
    }

    try {
      setLoading(true);
      
      const response = await fetch('/api/clubs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al crear el club');
      }

      const { club } = await response.json();
      
      toast.success('Club creado exitosamente');
      router.push(`/clubs/${club.id}`);
    } catch (error: any) {
      console.error('Error creating club:', error);
      toast.error(error.message || 'Error al crear el club');
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-6">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-600 mb-2">Acceso Requerido</h2>
              <p className="text-gray-500 mb-6">Debes iniciar sesión para crear un club.</p>
              <Button onClick={() => router.push('/auth/signin')}>
                Iniciar Sesión
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/clubs')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a Clubes
          </Button>
        </div>

        {/* Form */}
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Users className="h-6 w-6" />
              Crear Nuevo Club
            </CardTitle>
            <p className="text-gray-600">
              Completa la información para crear tu club estudiantil
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Información Básica</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre del Club *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Ej: Club de Programación"
                      className={errors.name ? 'border-red-500' : ''}
                    />
                    {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Categoría *</Label>
                    <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                      <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Selecciona una categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.category && <p className="text-sm text-red-500">{errors.category}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descripción *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe el propósito y actividades de tu club..."
                    rows={4}
                    className={errors.description ? 'border-red-500' : ''}
                  />
                  {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
                  <p className="text-sm text-gray-500">
                    {formData.description.length}/500 caracteres
                  </p>
                </div>
              </div>

              {/* Additional Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Detalles Adicionales</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="subject">Materia (Opcional)</Label>
                    <Select value={formData.subject} onValueChange={(value) => handleInputChange('subject', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una materia" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Ninguna</SelectItem>
                        {subjects.map((subject) => (
                          <SelectItem key={subject} value={subject}>
                            {subject}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="level">Nivel (Opcional)</Label>
                    <Select value={formData.level} onValueChange={(value) => handleInputChange('level', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un nivel" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Ninguno</SelectItem>
                        {levels.map((level) => (
                          <SelectItem key={level} value={level}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Ubicación (Opcional)</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder="Ej: Aula 205, Biblioteca"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rules">Reglas del Club (Opcional)</Label>
                  <Textarea
                    id="rules"
                    value={formData.rules}
                    onChange={(e) => handleInputChange('rules', e.target.value)}
                    placeholder="Establece las reglas y normas de comportamiento del club..."
                    rows={3}
                  />
                </div>
              </div>

              {/* Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Configuración</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {formData.visibility === 'PUBLIC' ? (
                            <Globe className="h-4 w-4 text-green-500" />
                          ) : (
                            <Lock className="h-4 w-4 text-orange-500" />
                          )}
                          <Label>Visibilidad</Label>
                        </div>
                        <p className="text-sm text-gray-500">
                          {formData.visibility === 'PUBLIC' 
                            ? 'Cualquiera puede ver y unirse al club'
                            : 'Solo miembros invitados pueden ver el club'
                          }
                        </p>
                      </div>
                      <Switch
                        checked={formData.visibility === 'PUBLIC'}
                        onCheckedChange={(checked) => 
                          handleInputChange('visibility', checked ? 'PUBLIC' : 'PRIVATE')
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxMembers">Límite de Miembros (Opcional)</Label>
                    <Input
                      id="maxMembers"
                      type="number"
                      min="2"
                      max="1000"
                      value={formData.maxMembers || ''}
                      onChange={(e) => handleInputChange('maxMembers', e.target.value ? parseInt(e.target.value) : undefined)}
                      placeholder="Ej: 50"
                    />
                    <p className="text-sm text-gray-500">
                      Deja vacío para sin límite
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/clubs')}
                  disabled={loading}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 flex items-center gap-2"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {loading ? 'Creando...' : 'Crear Club'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}