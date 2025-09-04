'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Camera, X, Eye, Twitter, Linkedin, Github, User, Globe, Shield, Sparkles, MapPin, Instagram } from 'lucide-react';
import { toast } from 'sonner';

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

  const previewData = {
    ...user,
    ...formData,
    image: imagePreview || user.image
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            Editar Perfil
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
           {/* Editor Section */}
           <div className="overflow-y-auto pr-2">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="basic" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">Básico</span>
                </TabsTrigger>
                <TabsTrigger value="social" className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  <span className="hidden sm:inline">Social</span>
                </TabsTrigger>
                <TabsTrigger value="privacy" className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  <span className="hidden sm:inline">Privacidad</span>
                </TabsTrigger>
              </TabsList>

          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Foto de Perfil</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar className="w-20 h-20">
                      <AvatarImage src={imagePreview || user.image} alt={user.name} />
                      <AvatarFallback className="text-lg bg-gradient-to-br from-purple-500 to-pink-500 text-white">
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
                      <div className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
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
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Información Personal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre completo *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Tu nombre completo"
                      className="transition-all duration-200 focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Ubicación</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder="Ciudad, País"
                      className="transition-all duration-200 focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="university">Universidad</Label>
                    <Input
                      id="university"
                      value={formData.university}
                      onChange={(e) => handleInputChange('university', e.target.value)}
                      placeholder="Tu universidad"
                      className="transition-all duration-200 focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="major">Carrera</Label>
                    <Input
                      id="major"
                      value={formData.major}
                      onChange={(e) => handleInputChange('major', e.target.value)}
                      placeholder="Tu carrera o especialidad"
                      className="transition-all duration-200 focus:ring-2 focus:ring-purple-500"
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
                    className="transition-all duration-200 focus:ring-2 focus:ring-purple-500"
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
                    className="transition-all duration-200 focus:ring-2 focus:ring-purple-500 resize-none"
                  />
                  <div className="flex justify-between items-center">
                    <Progress value={(formData.bio.length / 500) * 100} className="flex-1 mr-2" />
                    <p className="text-xs text-gray-500">
                      {formData.bio.length}/500
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="social" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Redes Sociales
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="twitter" className="flex items-center gap-2">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                      Twitter
                    </Label>
                    <Input
                      id="twitter"
                      value={formData.socialLinks.twitter}
                      onChange={(e) => handleSocialLinkChange('twitter', e.target.value)}
                      placeholder="@tu_usuario"
                      className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="linkedin" className="flex items-center gap-2">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                      LinkedIn
                    </Label>
                    <Input
                      id="linkedin"
                      value={formData.socialLinks.linkedin}
                      onChange={(e) => handleSocialLinkChange('linkedin', e.target.value)}
                      placeholder="https://linkedin.com/in/tu-perfil"
                      className="transition-all duration-200 focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="github" className="flex items-center gap-2">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                      </svg>
                      GitHub
                    </Label>
                    <Input
                      id="github"
                      value={formData.socialLinks.github}
                      onChange={(e) => handleSocialLinkChange('github', e.target.value)}
                      placeholder="https://github.com/tu-usuario"
                      className="transition-all duration-200 focus:ring-2 focus:ring-gray-600"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="instagram" className="flex items-center gap-2">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                      Instagram
                    </Label>
                    <Input
                      id="instagram"
                      value={formData.socialLinks.instagram}
                      onChange={(e) => handleSocialLinkChange('instagram', e.target.value)}
                      placeholder="@tu_usuario"
                      className="transition-all duration-200 focus:ring-2 focus:ring-pink-500"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Configuración de Privacidad
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 rounded-lg border bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                    <div className="space-y-1">
                      <Label className="text-base font-medium">Mostrar email público</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Permite que otros usuarios vean tu dirección de email
                      </p>
                    </div>
                    <Switch
                      checked={formData.privacySettings.showEmail}
                      onCheckedChange={(checked) => handlePrivacyChange('showEmail', checked)}
                      className="data-[state=checked]:bg-green-500"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg border bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
                    <div className="space-y-1">
                      <Label className="text-base font-medium">Mostrar ubicación</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Permite que otros usuarios vean tu ubicación
                      </p>
                    </div>
                    <Switch
                      checked={formData.privacySettings.showLocation}
                      onCheckedChange={(checked) => handlePrivacyChange('showLocation', checked)}
                      className="data-[state=checked]:bg-blue-500"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg border bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
                    <div className="space-y-1">
                      <Label className="text-base font-medium">Permitir mensajes privados</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Permite que otros usuarios te envíen mensajes privados
                      </p>
                    </div>
                    <Switch
                      checked={formData.privacySettings.allowMessages}
                      onCheckedChange={(checked) => handlePrivacyChange('allowMessages', checked)}
                      className="data-[state=checked]:bg-purple-500"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg border bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20">
                    <div className="space-y-1">
                      <Label className="text-base font-medium">Mostrar actividad</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Permite que otros usuarios vean tu actividad reciente
                      </p>
                    </div>
                    <Switch
                      checked={formData.privacySettings.showActivity}
                      onCheckedChange={(checked) => handlePrivacyChange('showActivity', checked)}
                      className="data-[state=checked]:bg-orange-500"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Preview Section */}
      <div className="hidden lg:block overflow-y-auto pl-2">
        <Card className="sticky top-0">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Vista Previa
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Profile Preview */}
            <div className="text-center space-y-4">
              <div className="relative mx-auto w-24 h-24">
                <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
                  <AvatarImage src={previewData.image} />
                  <AvatarFallback className="text-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                    {previewData.name?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xl font-bold">{previewData.name || 'Nombre completo'}</h3>
                {previewData.location && (
                  <p className="text-sm text-gray-600 flex items-center justify-center gap-1">
                    {previewData.location}
                  </p>
                )}
                {previewData.university && (
                  <p className="text-sm text-gray-600">{previewData.university}</p>
                )}
                {previewData.major && (
                  <Badge variant="secondary">{previewData.major}</Badge>
                )}
              </div>
              
              {previewData.bio && (
                <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                  <p>{previewData.bio}</p>
                </div>
              )}
              
              {/* Social Links Preview */}
              <div className="flex justify-center gap-2 flex-wrap">
                {previewData.socialLinks.twitter && (
                  <Badge variant="outline" className="text-blue-500">
                    <Twitter className="w-3 h-3 mr-1" />
                    Twitter
                  </Badge>
                )}
                {previewData.socialLinks.linkedin && (
                  <Badge variant="outline" className="text-blue-700">
                    <Linkedin className="w-3 h-3 mr-1" />
                    LinkedIn
                  </Badge>
                )}
                {previewData.socialLinks.github && (
                  <Badge variant="outline" className="text-gray-800">
                    <Github className="w-3 h-3 mr-1" />
                    GitHub
                  </Badge>
                )}
              </div>
              
              {/* Privacy Settings Preview */}
              <div className="text-xs text-gray-500 space-y-1">
                <p>Configuración de privacidad:</p>
                <div className="flex flex-wrap gap-1 justify-center">
                  {previewData.privacySettings.showEmail && (
                    <Badge variant="outline" className="text-xs">Email visible</Badge>
                  )}
                  {previewData.privacySettings.showLocation && (
                    <Badge variant="outline" className="text-xs">Ubicación visible</Badge>
                  )}
                  {previewData.privacySettings.allowMessages && (
                    <Badge variant="outline" className="text-xs">Mensajes habilitados</Badge>
                  )}
                  {previewData.privacySettings.showActivity && (
                    <Badge variant="outline" className="text-xs">Actividad visible</Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>

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