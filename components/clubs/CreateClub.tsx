'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Plus, 
  X, 
  Upload, 
  Users, 
  MapPin, 
  Calendar, 
  Tag,
  Globe,
  Lock,
  Eye,
  Camera,
  FileText,
  Target,
  Clock
} from 'lucide-react';

interface CreateClubFormData {
  name: string;
  description: string;
  category: string;
  visibility: 'public' | 'private' | 'university';
  maxMembers: number;
  location: string;
  meetingSchedule: string;
  tags: string[];
  requirements: string;
  contactEmail: string;
  socialLinks: {
    website?: string;
    instagram?: string;
    facebook?: string;
    twitter?: string;
  };
  image?: File;
  requiresApproval: boolean;
  allowInvitations: boolean;
}

interface CreateClubProps {
  onSubmit?: (data: CreateClubFormData) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

export default function CreateClub({ onSubmit, onCancel, isLoading = false }: CreateClubProps) {
  const [formData, setFormData] = useState<CreateClubFormData>({
    name: '',
    description: '',
    category: '',
    visibility: 'public',
    maxMembers: 50,
    location: '',
    meetingSchedule: '',
    tags: [],
    requirements: '',
    contactEmail: '',
    socialLinks: {},
    requiresApproval: false,
    allowInvitations: true
  });

  const [currentTag, setCurrentTag] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<CreateClubFormData>>({});

  const categories = [
    'Académico',
    'Deportes',
    'Arte',
    'Tecnología',
    'Voluntariado',
    'Música',
    'Literatura',
    'Ciencias',
    'Idiomas',
    'Emprendimiento',
    'Fotografía',
    'Teatro',
    'Debate',
    'Medio Ambiente'
  ];

  const handleInputChange = (field: keyof CreateClubFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSocialLinkChange = (platform: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: value
      }
    }));
  };

  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<CreateClubFormData> = {};

    if (!formData.name.trim()) newErrors.name = 'El nombre es requerido';
    if (!formData.description.trim()) newErrors.description = 'La descripción es requerida';
    if (!formData.category) newErrors.category = 'La categoría es requerida';
    if (!formData.contactEmail.trim()) newErrors.contactEmail = 'El email de contacto es requerido';
    if (formData.maxMembers < 5) newErrors.maxMembers = 'Mínimo 5 miembros';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit?.(formData);
    }
  };

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'public': return <Globe className="h-4 w-4" />;
      case 'private': return <Lock className="h-4 w-4" />;
      case 'university': return <Eye className="h-4 w-4" />;
      default: return <Globe className="h-4 w-4" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Crear Nuevo Club</h2>
        <p className="text-gray-600">Completa la información para crear tu club estudiantil</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información Básica */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Información Básica
            </CardTitle>
            <CardDescription>
              Información principal del club
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Imagen del club */}
            <div>
              <Label>Imagen del Club</Label>
              <div className="flex items-center gap-4 mt-2">
                <div className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="h-8 w-8 text-gray-400" />
                  )}
                </div>
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="club-image"
                  />
                  <Label htmlFor="club-image" className="cursor-pointer">
                    <Button type="button" variant="outline" size="sm" asChild>
                      <span>
                        <Upload className="h-4 w-4 mr-2" />
                        Subir Imagen
                      </span>
                    </Button>
                  </Label>
                  <p className="text-xs text-gray-500 mt-1">JPG, PNG hasta 5MB</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nombre del Club *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Ej: Club de Programación"
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
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
                {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
              </div>
            </div>

            <div>
              <Label htmlFor="description">Descripción *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe el propósito y actividades del club..."
                rows={4}
                className={errors.description ? 'border-red-500' : ''}
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
            </div>
          </CardContent>
        </Card>

        {/* Configuración */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Configuración
            </CardTitle>
            <CardDescription>
              Configuración de membresía y privacidad
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="visibility">Visibilidad</Label>
                <Select value={formData.visibility} onValueChange={(value: any) => handleInputChange('visibility', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        Público - Visible para todos
                      </div>
                    </SelectItem>
                    <SelectItem value="university">
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        Universidad - Solo estudiantes
                      </div>
                    </SelectItem>
                    <SelectItem value="private">
                      <div className="flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        Privado - Solo por invitación
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="maxMembers">Máximo de Miembros</Label>
                <Input
                  id="maxMembers"
                  type="number"
                  min="5"
                  max="500"
                  value={formData.maxMembers}
                  onChange={(e) => handleInputChange('maxMembers', parseInt(e.target.value))}
                  className={errors.maxMembers ? 'border-red-500' : ''}
                />
                {errors.maxMembers && <p className="text-red-500 text-sm mt-1">{errors.maxMembers}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="location">Ubicación</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="Ej: Aula 301, Edificio A"
                />
              </div>

              <div>
                <Label htmlFor="meetingSchedule">Horario de Reuniones</Label>
                <Input
                  id="meetingSchedule"
                  value={formData.meetingSchedule}
                  onChange={(e) => handleInputChange('meetingSchedule', e.target.value)}
                  placeholder="Ej: Viernes 4:00 PM"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Requiere Aprobación</Label>
                  <p className="text-sm text-gray-500">Los nuevos miembros necesitan aprobación</p>
                </div>
                <Switch
                  checked={formData.requiresApproval}
                  onCheckedChange={(checked) => handleInputChange('requiresApproval', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Permitir Invitaciones</Label>
                  <p className="text-sm text-gray-500">Los miembros pueden invitar a otros</p>
                </div>
                <Switch
                  checked={formData.allowInvitations}
                  onCheckedChange={(checked) => handleInputChange('allowInvitations', checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Información Adicional */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Información Adicional
            </CardTitle>
            <CardDescription>
              Tags, requisitos y contacto
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Tags */}
            <div>
              <Label>Tags</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  placeholder="Agregar tag..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button type="button" onClick={addTag} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="requirements">Requisitos</Label>
              <Textarea
                id="requirements"
                value={formData.requirements}
                onChange={(e) => handleInputChange('requirements', e.target.value)}
                placeholder="Describe los requisitos para unirse al club..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="contactEmail">Email de Contacto *</Label>
              <Input
                id="contactEmail"
                type="email"
                value={formData.contactEmail}
                onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                placeholder="contacto@club.com"
                className={errors.contactEmail ? 'border-red-500' : ''}
              />
              {errors.contactEmail && <p className="text-red-500 text-sm mt-1">{errors.contactEmail}</p>}
            </div>

            {/* Redes Sociales */}
            <div>
              <Label>Redes Sociales (Opcional)</Label>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <Input
                  placeholder="Sitio web"
                  value={formData.socialLinks.website || ''}
                  onChange={(e) => handleSocialLinkChange('website', e.target.value)}
                />
                <Input
                  placeholder="Instagram"
                  value={formData.socialLinks.instagram || ''}
                  onChange={(e) => handleSocialLinkChange('instagram', e.target.value)}
                />
                <Input
                  placeholder="Facebook"
                  value={formData.socialLinks.facebook || ''}
                  onChange={(e) => handleSocialLinkChange('facebook', e.target.value)}
                />
                <Input
                  placeholder="Twitter"
                  value={formData.socialLinks.twitter || ''}
                  onChange={(e) => handleSocialLinkChange('twitter', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botones de acción */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Creando...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Crear Club
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}