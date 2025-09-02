'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Camera,
  Upload,
  X,
  Globe,
  Twitter,
  Linkedin,
  Github,
  Eye,
  EyeOff
} from 'lucide-react';

interface UserProfile {
  id: string;
  name: string;
  username: string;
  email?: string;
  image?: string;
  bio?: string;
  location?: string;
  university?: string;
  major?: string;
  website?: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
  privacySettings?: {
    showEmail: boolean;
    showLocation: boolean;
    allowMessages: boolean;
    showActivity: boolean;
  };
}

interface ProfileEditorProps {
  user: UserProfile;
  onSave: (data: Partial<UserProfile>) => void;
  onClose: () => void;
}

export function ProfileEditor({ user, onSave, onClose }: ProfileEditorProps) {
  const [formData, setFormData] = useState({
    name: user.name || '',
    bio: user.bio || '',
    location: user.location || '',
    university: user.university || '',
    major: user.major || '',
    website: user.website || '',
    socialLinks: {
      twitter: user.socialLinks?.twitter || '',
      linkedin: user.socialLinks?.linkedin || '',
      github: user.socialLinks?.github || ''
    },
    privacySettings: {
      showEmail: user.privacySettings?.showEmail ?? true,
      showLocation: user.privacySettings?.showLocation ?? true,
      allowMessages: user.privacySettings?.allowMessages ?? true,
      showActivity: user.privacySettings?.showActivity ?? true
    }
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
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

  const handlePrivacyChange = (setting: string, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      privacySettings: {
        ...prev.privacySettings,
        [setting]: value
      }
    }));
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('La imagen debe ser menor a 5MB');
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('El nombre es requerido');
      return false;
    }

    if (formData.bio.length > 500) {
      toast.error('La biografía no puede exceder 500 caracteres');
      return false;
    }

    // Validate URLs
    const urlFields = [
      { field: 'website', value: formData.website },
      { field: 'twitter', value: formData.socialLinks.twitter },
      { field: 'linkedin', value: formData.socialLinks.linkedin },
      { field: 'github', value: formData.socialLinks.github }
    ];

    for (const { field, value } of urlFields) {
      if (value && !isValidUrl(value)) {
        toast.error(`La URL de ${field} no es válida`);
        return false;
      }
    }

    return true;
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url.startsWith('http') ? url : `https://${url}`);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const submitData = new FormData();
      
      // Add form data
      Object.entries(formData).forEach(([key, value]) => {
        if (typeof value === 'object') {
          submitData.append(key, JSON.stringify(value));
        } else {
          submitData.append(key, value);
        }
      });

      // Add image if selected
      if (imageFile) {
        submitData.append('image', imageFile);
      }

      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        body: submitData
      });

      const data = await response.json();

      if (response.ok) {
        onSave(data.user);
        toast.success('Perfil actualizado exitosamente');
      } else {
        toast.error(data.error || 'Error al actualizar el perfil');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Error al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Perfil</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Información Básica</TabsTrigger>
            <TabsTrigger value="social">Redes Sociales</TabsTrigger>
            <TabsTrigger value="privacy">Privacidad</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            {/* Profile Image */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={imagePreview || user.image} alt={user.name} />
                  <AvatarFallback className="text-lg">
                    {user.name?.charAt(0)?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {imagePreview && (
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0"
                    onClick={removeImage}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="image-upload" className="cursor-pointer">
                  <div className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                    <Camera className="w-4 h-4" />
                    Cambiar foto
                  </div>
                </Label>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
                <p className="text-xs text-gray-500">JPG, PNG o GIF. Máximo 5MB.</p>
              </div>
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre completo *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Tu nombre completo"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Ubicación</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="Ciudad, País"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="university">Universidad</Label>
                <Input
                  id="university"
                  value={formData.university}
                  onChange={(e) => handleInputChange('university', e.target.value)}
                  placeholder="Tu universidad"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="major">Carrera</Label>
                <Input
                  id="major"
                  value={formData.major}
                  onChange={(e) => handleInputChange('major', e.target.value)}
                  placeholder="Tu carrera o especialidad"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Sitio web</Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                placeholder="https://tu-sitio-web.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Biografía</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder="Cuéntanos sobre ti..."
                rows={4}
                maxLength={500}
              />
              <p className="text-xs text-gray-500 text-right">
                {formData.bio.length}/500 caracteres
              </p>
            </div>
          </TabsContent>

          <TabsContent value="social" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="twitter" className="flex items-center gap-2">
                  <Twitter className="w-4 h-4 text-blue-500" />
                  Twitter
                </Label>
                <Input
                  id="twitter"
                  value={formData.socialLinks.twitter}
                  onChange={(e) => handleSocialLinkChange('twitter', e.target.value)}
                  placeholder="https://twitter.com/tu-usuario"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkedin" className="flex items-center gap-2">
                  <Linkedin className="w-4 h-4 text-blue-700" />
                  LinkedIn
                </Label>
                <Input
                  id="linkedin"
                  value={formData.socialLinks.linkedin}
                  onChange={(e) => handleSocialLinkChange('linkedin', e.target.value)}
                  placeholder="https://linkedin.com/in/tu-usuario"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="github" className="flex items-center gap-2">
                  <Github className="w-4 h-4 text-gray-800" />
                  GitHub
                </Label>
                <Input
                  id="github"
                  value={formData.socialLinks.github}
                  onChange={(e) => handleSocialLinkChange('github', e.target.value)}
                  placeholder="https://github.com/tu-usuario"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="privacy" className="space-y-4">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    Mostrar email público
                  </Label>
                  <p className="text-sm text-gray-500">
                    Permite que otros usuarios vean tu dirección de email
                  </p>
                </div>
                <Switch
                  checked={formData.privacySettings.showEmail}
                  onCheckedChange={(checked) => handlePrivacyChange('showEmail', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    Mostrar ubicación
                  </Label>
                  <p className="text-sm text-gray-500">
                    Permite que otros usuarios vean tu ubicación
                  </p>
                </div>
                <Switch
                  checked={formData.privacySettings.showLocation}
                  onCheckedChange={(checked) => handlePrivacyChange('showLocation', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    Permitir mensajes privados
                  </Label>
                  <p className="text-sm text-gray-500">
                    Permite que otros usuarios te envíen mensajes privados
                  </p>
                </div>
                <Switch
                  checked={formData.privacySettings.allowMessages}
                  onCheckedChange={(checked) => handlePrivacyChange('allowMessages', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    Mostrar actividad
                  </Label>
                  <p className="text-sm text-gray-500">
                    Permite que otros usuarios vean tu actividad reciente
                  </p>
                </div>
                <Switch
                  checked={formData.privacySettings.showActivity}
                  onCheckedChange={(checked) => handlePrivacyChange('showActivity', checked)}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}