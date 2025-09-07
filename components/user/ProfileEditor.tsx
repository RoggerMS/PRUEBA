"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Combobox } from "@/components/ui/combobox";
import { toast } from "sonner";
import {
  Twitter,
  Linkedin,
  Github,
  Instagram,
  Upload,
  X,
  Camera,
  Image as ImageIcon,
  User,
  Globe,
  Shield,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface UserProfile {
  id?: string;
  name?: string;
  username?: string;
  email?: string;
  avatar?: string;
  coverImage?: string;
  bio?: string;
  location?: string;
  website?: string;
  university?: string;
  career?: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
    instagram?: string;
  };
  privacySettings?: {
    showEmail?: boolean;
    showActivity?: boolean;
    allowMessages?: boolean;
  };
  stats?: any;
  joinDate?: string;
  phone?: string;
  semester?: number;
  isFollowing?: boolean;
  isOwnProfile?: boolean;
}

interface ProfileEditorProps {
  user: UserProfile;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSave: (data: Partial<UserProfile>) => void;
}

const BIO_LIMIT = 500;

const universities = [
  {
    value: "pucp",
    label: "Pontificia Universidad Católica del Perú",
    careers: ["Ingeniería Industrial", "Derecho", "Diseño Gráfico"],
  },
  {
    value: "uni",
    label: "Universidad Nacional de Ingeniería",
    careers: ["Ingeniería Civil", "Ingeniería de Sistemas", "Arquitectura"],
  },
  {
    value: "san-marcos",
    label: "Universidad Nacional Mayor de San Marcos",
    careers: ["Medicina", "Economía", "Historia"],
  },
];

const locationOptions = [
  { value: "lima", label: "Lima, Perú" },
  { value: "arequipa", label: "Arequipa, Perú" },
  { value: "cusco", label: "Cusco, Perú" },
  { value: "trujillo", label: "Trujillo, Perú" },
  { value: "chiclayo", label: "Chiclayo, Perú" },
  { value: "piura", label: "Piura, Perú" },
  { value: "iquitos", label: "Iquitos, Perú" },
  { value: "huancayo", label: "Huancayo, Perú" },
  { value: "tacna", label: "Tacna, Perú" },
  { value: "ica", label: "Ica, Perú" },
];

export function ProfileEditor({ user, open, onOpenChange, onSave }: ProfileEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    avatar: user.avatar || "",
    avatarFile: null as File | null,
    coverImage: user.coverImage || "",
    coverImageFile: null as File | null,
    name: user.name || "",
    bio: user.bio || "",
    location: user.location || "",
    website: user.website || "",
    university: user.university || "",
    career: user.career || "",
    twitter: user.socialLinks?.twitter || "",
    linkedin: user.socialLinks?.linkedin || "",
    github: user.socialLinks?.github || "",
    instagram: user.socialLinks?.instagram || "",
    showEmail: user.privacySettings?.showEmail ?? true,
    showActivity: user.privacySettings?.showActivity ?? true,
    allowMessages: user.privacySettings?.allowMessages ?? true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dragActive, setDragActive] = useState({ avatar: false, cover: false });
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    if (open) {
      setForm({
        avatar: user.avatar || "",
        avatarFile: null,
        coverImage: user.coverImage || "",
        coverImageFile: null,
        name: user.name || "",
        bio: user.bio || "",
        location: user.location || "",
        website: user.website || "",
        university: user.university || "",
        career: user.career || "",
        twitter: user.socialLinks?.twitter || "",
        linkedin: user.socialLinks?.linkedin || "",
        github: user.socialLinks?.github || "",
        instagram: user.socialLinks?.instagram || "",
        showEmail: user.privacySettings?.showEmail ?? true,
        showActivity: user.privacySettings?.showActivity ?? true,
        allowMessages: user.privacySettings?.allowMessages ?? true,
      });
      setIsDirty(false);
      setErrors({});
      setUploadProgress(0);
    }
  }, [open, user]);

  // Validación en tiempo real
  const validateField = useCallback((field: string, value: any) => {
    const newErrors = { ...errors };
    
    switch (field) {
      case 'name':
        if (!value.trim()) {
          newErrors.name = 'El nombre es requerido';
        } else if (value.length < 2) {
          newErrors.name = 'El nombre debe tener al menos 2 caracteres';
        } else {
          delete newErrors.name;
        }
        break;
      case 'website':
        if (value && value.trim()) {
          try {
            new URL(value);
            delete newErrors.website;
          } catch {
            newErrors.website = 'URL inválida';
          }
        } else {
          delete newErrors.website;
        }
        break;
      case 'bio':
        if (value.length > BIO_LIMIT) {
          newErrors.bio = `La biografía no puede exceder ${BIO_LIMIT} caracteres`;
        } else {
          delete newErrors.bio;
        }
        break;
    }
    
    setErrors(newErrors);
  }, [errors]);

  const handleChange = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
    validateField(field, value);
  };

  // Validar archivo de imagen
  const validateImageFile = (file: File): string | null => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    
    if (!allowedTypes.includes(file.type)) {
      return 'Solo se permiten archivos JPG, PNG o WebP';
    }
    if (file.size > maxSize) {
      return 'El archivo no puede ser mayor a 5MB';
    }
    return null;
  };

  const handleImageUpload = (file: File, type: 'avatar' | 'cover') => {
    const error = validateImageFile(file);
    if (error) {
      toast.error(error);
      return;
    }

    const url = URL.createObjectURL(file);
    if (type === 'avatar') {
      handleChange('avatarFile', file);
      handleChange('avatar', url);
    } else {
      handleChange('coverImageFile', file);
      handleChange('coverImage', url);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file, 'avatar');
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file, 'cover');
    }
  };

  // Drag & Drop handlers
  const handleDragOver = (e: React.DragEvent, type: 'avatar' | 'cover') => {
    e.preventDefault();
    setDragActive(prev => ({ ...prev, [type]: true }));
  };

  const handleDragLeave = (e: React.DragEvent, type: 'avatar' | 'cover') => {
    e.preventDefault();
    setDragActive(prev => ({ ...prev, [type]: false }));
  };

  const handleDrop = (e: React.DragEvent, type: 'avatar' | 'cover') => {
    e.preventDefault();
    setDragActive(prev => ({ ...prev, [type]: false }));
    
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      handleImageUpload(imageFile, type);
    }
  };

  const removeImage = (type: 'avatar' | 'cover') => {
    if (type === 'avatar') {
      handleChange('avatar', '');
      handleChange('avatarFile', null);
    } else {
      handleChange('coverImage', '');
      handleChange('coverImageFile', null);
    }
  };

  const selectedUniversity = universities.find((u) => u.value === form.university);
  const careerOptions = selectedUniversity
    ? selectedUniversity.careers.map((c) => ({ value: c, label: c }))
    : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = new FormData();
      payload.append("name", form.name);
      payload.append("bio", form.bio);
      payload.append("location", form.location);
      payload.append("website", form.website);
      payload.append("university", form.university);
      payload.append("career", form.career);
      payload.append("socialLinks[twitter]", form.twitter);
      payload.append("socialLinks[linkedin]", form.linkedin);
      payload.append("socialLinks[github]", form.github);
      payload.append("socialLinks[instagram]", form.instagram);
      payload.append("privacySettings[showEmail]", String(form.showEmail));
      payload.append("privacySettings[showActivity]", String(form.showActivity));
      payload.append("privacySettings[allowMessages]", String(form.allowMessages));
      if (form.avatarFile) {
        payload.append("avatar", form.avatarFile);
      }
      if (form.coverImageFile) {
        payload.append("coverImage", form.coverImageFile);
      }

      const response = await fetch("/api/profile", {
        method: "PUT",
        body: payload,
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.message || `Error ${response.status}`);
      }
      const updatedProfile: Partial<UserProfile> = {
        ...user,
        name: form.name,
        bio: form.bio,
        location: form.location,
        website: form.website,
        university: form.university,
        career: form.career,
        avatar: form.avatar || user.avatar,
        coverImage: form.coverImage || user.coverImage,
        socialLinks: {
          twitter: form.twitter,
          linkedin: form.linkedin,
          github: form.github,
          instagram: form.instagram,
        },
        privacySettings: {
          showEmail: form.showEmail,
          showActivity: form.showActivity,
          allowMessages: form.allowMessages,
        },
      };
      onSave(data?.user || updatedProfile);
      toast.success("Perfil actualizado");
      onOpenChange(false);
      setIsDirty(false);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-5xl max-h-[95vh] overflow-hidden p-0 bg-gradient-to-br from-white/95 to-gray-50/95 backdrop-blur-xl border border-white/20 shadow-2xl" aria-describedby="profile-editor-desc">
      <div 
        className={cn(
          "relative h-52 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 overflow-hidden transition-all duration-300",
          dragActive.cover && "ring-4 ring-blue-400 ring-opacity-50"
        )}
        onDragOver={(e) => handleDragOver(e, 'cover')}
        onDragLeave={(e) => handleDragLeave(e, 'cover')}
        onDrop={(e) => handleDrop(e, 'cover')}
      >
        {form.coverImage && (
          <img
            src={form.coverImage}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        
        {/* Cover Upload Controls */}
        <div className="absolute top-4 right-4 flex gap-2">
          {form.coverImage && (
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => removeImage('cover')}
              className="bg-red-500/80 hover:bg-red-600/80 text-white border-0 backdrop-blur-sm"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          <input
            ref={bannerInputRef}
            type="file"
            accept="image/*"
            onChange={handleCoverChange}
            className="hidden"
            id="cover-upload"
          />
          <label
            htmlFor="cover-upload"
            className="inline-flex items-center gap-2 px-4 py-2 bg-black/50 hover:bg-black/60 text-white rounded-lg cursor-pointer transition-all duration-200 backdrop-blur-sm border border-white/20"
          >
            <Upload className="h-4 w-4" />
            {form.coverImage ? 'Cambiar' : 'Subir'} portada
          </label>
        </div>
        
        {/* Drag & Drop Overlay */}
        {dragActive.cover && (
          <div className="absolute inset-0 bg-blue-500/20 backdrop-blur-sm flex items-center justify-center">
            <div className="text-white text-center">
              <Upload className="h-12 w-12 mx-auto mb-2" />
              <p className="text-lg font-medium">Suelta la imagen aquí</p>
            </div>
          </div>
        )}
      </div>
      <DialogHeader className="px-6 pt-6 pb-4">
        <div className="flex items-center gap-6">
          <div className="relative group">
            <div 
              className={cn(
                "relative transition-all duration-300",
                dragActive.avatar && "ring-4 ring-blue-400 ring-opacity-50 rounded-full"
              )}
              onDragOver={(e) => handleDragOver(e, 'avatar')}
              onDragLeave={(e) => handleDragLeave(e, 'avatar')}
              onDrop={(e) => handleDrop(e, 'avatar')}
            >
              <Avatar className="h-24 w-24 border-4 border-white shadow-xl">
                <AvatarImage src={form.avatar} className="object-cover" />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xl font-bold">
                  {form.name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              
              {/* Avatar Upload Controls */}
              <div className="absolute -bottom-1 -right-1 flex gap-1">
                {form.avatar && (
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => removeImage('avatar')}
                    className="h-8 w-8 rounded-full p-0 bg-red-500 hover:bg-red-600 text-white border-2 border-white shadow-lg"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => document.getElementById('avatar-upload')?.click()}
                  className="h-8 w-8 rounded-full p-0 bg-blue-500 hover:bg-blue-600 text-white border-2 border-white shadow-lg"
                >
                  <Camera className="h-3 w-3" />
                </Button>
                  </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
                id="avatar-upload"
              />
              
              {/* Drag & Drop Overlay */}
              {dragActive.avatar && (
                <div className="absolute inset-0 bg-blue-500/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <Upload className="h-8 w-8 text-white" />
                </div>
              )}
            </div>
          </div>
          
          <div className="flex-1">
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Editar Perfil
            </DialogTitle>
            <DialogDescription id="profile-editor-desc" className="text-gray-600 mt-1">
              Actualiza tu información personal y configuración de privacidad
            </DialogDescription>
            
            {/* Progress Bar */}
            {uploadProgress > 0 && (
              <div className="mt-3">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                  <Sparkles className="h-4 w-4" />
                  Guardando cambios... {uploadProgress}%
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}
          </div>
        </div>
      </DialogHeader>
      <div className="px-6 pb-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-white/50 backdrop-blur-sm border border-white/20 shadow-lg">
              <TabsTrigger 
                value="basic" 
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white transition-all duration-200"
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Información</span>
                <span className="sm:hidden">Info</span>
              </TabsTrigger>
              <TabsTrigger 
                value="social" 
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white transition-all duration-200"
              >
                <Globe className="h-4 w-4" />
                Social
              </TabsTrigger>
              <TabsTrigger 
                value="privacy" 
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white transition-all duration-200"
              >
                <Shield className="h-4 w-4" />
                Privacidad
              </TabsTrigger>
            </TabsList>
              <TabsContent value="basic" className="space-y-6 mt-6">
                <Card className="p-6 bg-white/60 backdrop-blur-sm border border-white/30 shadow-lg">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <User className="h-5 w-5 text-blue-600" />
                      <h3 className="text-lg font-semibold text-gray-800">Información Personal</h3>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium text-gray-700">Nombre Completo *</Label>
                      <Input
                        id="name"
                        value={form.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        placeholder="Tu nombre completo"
                        className={cn(
                          "bg-white/70 border-white/30 focus:bg-white/90 transition-all duration-200",
                          errors.name && "border-red-300 focus:border-red-500"
                        )}
                      />
                      {errors.name && (
                        <p className="text-xs text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.name}
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="bio" className="text-sm font-medium text-gray-700">Biografía</Label>
                      <Textarea
                        id="bio"
                        value={form.bio}
                        onChange={(e) => handleChange("bio", e.target.value)}
                        placeholder="Cuéntanos sobre ti..."
                        maxLength={BIO_LIMIT}
                        className={cn(
                          "min-h-[100px] bg-white/70 border-white/30 focus:bg-white/90 transition-all duration-200 resize-none",
                          errors.bio && "border-red-300 focus:border-red-500"
                        )}
                      />
                      <div className="flex justify-between items-center">
                        {errors.bio && (
                          <p className="text-xs text-red-500 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {errors.bio}
                          </p>
                        )}
                        <p className={cn(
                          "text-xs ml-auto",
                          form.bio.length > BIO_LIMIT * 0.9 ? "text-red-500" : "text-gray-500"
                        )}>
                          {form.bio.length}/{BIO_LIMIT} caracteres
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="location" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-green-500" />
                          Ubicación
                        </Label>
                        <Combobox
                          options={locationOptions}
                          value={form.location}
                          onValueChange={(value) => handleChange("location", value as string)}
                          placeholder="Selecciona tu ubicación"
                          searchPlaceholder="Buscar ubicación..."
                          clearable
                          aria-label="Seleccionar ubicación"
                          className={cn(
                            errors.location && "border-red-300 focus:border-red-500"
                          )}
                        />
                        {errors.location && (
                          <div className="flex items-center gap-1 text-red-600 text-sm">
                            <AlertCircle className="h-4 w-4" />
                            <span>{errors.location}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="website" className="text-sm font-medium text-gray-700">Sitio Web</Label>
                        <Input
                          id="website"
                          value={form.website}
                          onChange={(e) => handleChange("website", e.target.value)}
                          placeholder="https://tusitio.com"
                          className={cn(
                            "bg-white/70 border-white/30 focus:bg-white/90 transition-all duration-200",
                            errors.website && "border-red-300 focus:border-red-500"
                          )}
                        />
                        {errors.website && (
                          <p className="text-xs text-red-500 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {errors.website}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                          <User className="h-4 w-4 text-blue-500" />
                          Universidad
                        </Label>
                        <Combobox
                          value={form.university}
                          onValueChange={(v) => handleChange("university", v as string)}
                          options={universities.map((u) => ({ value: u.value, label: u.label }))}
                          placeholder="Selecciona tu universidad"
                          searchPlaceholder="Buscar universidad..."
                          clearable
                          aria-label="Seleccionar universidad"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-purple-500" />
                          Carrera
                        </Label>
                        <Combobox
                          value={form.career}
                          onValueChange={(v) => handleChange("career", v as string)}
                          options={careerOptions}
                          placeholder={
                            selectedUniversity
                              ? "Selecciona tu carrera"
                              : "Selecciona una universidad primero"
                          }
                          searchPlaceholder="Buscar carrera..."
                          disabled={!selectedUniversity}
                          clearable
                          aria-label="Seleccionar carrera"
                        />
                      </div>
                    </div>
                    </div>
                  </Card>
                </TabsContent>
                <TabsContent value="social" className="space-y-6 mt-6">
                  <Card className="p-6 bg-white/60 backdrop-blur-sm border border-white/30 shadow-lg">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-4">
                      <Globe className="h-5 w-5 text-blue-600" />
                      <h3 className="text-lg font-semibold text-gray-800">Redes Sociales</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="twitter" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                          <Twitter className="h-4 w-4 text-blue-400" />
                          Twitter
                        </Label>
                        <Input
                          id="twitter"
                          value={form.twitter}
                          onChange={(e) => handleChange("twitter", e.target.value)}
                          placeholder="@usuario"
                          className="bg-white/70 border-white/30 focus:bg-white/90 transition-all duration-200"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="linkedin" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                          <Linkedin className="h-4 w-4 text-blue-600" />
                          LinkedIn
                        </Label>
                        <Input
                          id="linkedin"
                          value={form.linkedin}
                          onChange={(e) => handleChange("linkedin", e.target.value)}
                          placeholder="linkedin.com/in/usuario"
                          className="bg-white/70 border-white/30 focus:bg-white/90 transition-all duration-200"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="github" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                          <Github className="h-4 w-4 text-gray-800" />
                          GitHub
                        </Label>
                        <Input
                          id="github"
                          value={form.github}
                          onChange={(e) => handleChange("github", e.target.value)}
                          placeholder="github.com/usuario"
                          className="bg-white/70 border-white/30 focus:bg-white/90 transition-all duration-200"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="instagram" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                          <Instagram className="h-4 w-4 text-pink-500" />
                          Instagram
                        </Label>
                        <Input
                          id="instagram"
                          value={form.instagram}
                          onChange={(e) => handleChange("instagram", e.target.value)}
                          placeholder="@usuario"
                          className="bg-white/70 border-white/30 focus:bg-white/90 transition-all duration-200"
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              </TabsContent>
              <TabsContent value="privacy" className="space-y-6 mt-6">
                <Card className="p-6 bg-white/60 backdrop-blur-sm border border-white/30 shadow-lg">
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Shield className="h-5 w-5 text-green-600" />
                      <h3 className="text-lg font-semibold text-gray-800">Configuración de Privacidad</h3>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="flex items-center justify-between p-4 bg-white/40 rounded-lg border border-white/20">
                        <div className="space-y-1">
                          <Label htmlFor="showEmail" className="text-sm font-medium text-gray-800">Mostrar email en el perfil público</Label>
                          <p className="text-sm text-gray-600">
                            Permite que otros usuarios vean tu email.
                          </p>
                        </div>
                        <Switch
                          id="showEmail"
                          checked={form.showEmail}
                          onCheckedChange={(v) => handleChange("showEmail", v)}
                          className="data-[state=checked]:bg-blue-500"
                        />
                      </div>
                      
                      <div className="flex items-center justify-between p-4 bg-white/40 rounded-lg border border-white/20">
                        <div className="space-y-1">
                          <Label htmlFor="showActivity" className="text-sm font-medium text-gray-800">Mostrar mi actividad reciente</Label>
                          <p className="text-sm text-gray-600">
                            Muestra tus acciones recientes en tu perfil.
                          </p>
                        </div>
                        <Switch
                          id="showActivity"
                          checked={form.showActivity}
                          onCheckedChange={(v) => handleChange("showActivity", v)}
                          className="data-[state=checked]:bg-purple-500"
                        />
                      </div>
                      
                      <div className="flex items-center justify-between p-4 bg-white/40 rounded-lg border border-white/20">
                        <div className="space-y-1">
                          <Label htmlFor="allowMessages" className="text-sm font-medium text-gray-800">
                            Permitir que otros usuarios me envíen mensajes directos
                          </Label>
                          <p className="text-sm text-gray-600">
                            Otros podrán contactarte mediante mensajes.
                          </p>
                        </div>
                        <Switch
                          id="allowMessages"
                          checked={form.allowMessages}
                          onCheckedChange={(v) => handleChange("allowMessages", v)}
                          className="data-[state=checked]:bg-green-500"
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
        <DialogFooter className="bg-white/40 backdrop-blur-sm border-t border-white/30 p-6">
            <div className="flex gap-3 w-full justify-end">
              <Button 
                variant="outline" 
                type="button"
                onClick={() => onOpenChange(false)}
                className="bg-white/60 border-white/40 hover:bg-white/80 text-gray-700 font-medium px-6 py-2 transition-all duration-200"
              >
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={!isDirty || isSubmitting}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium px-6 py-2 shadow-lg transition-all duration-200 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Guardando...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Guardar cambios
                  </>
                )}
              </Button>
            </div>
            
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="w-full mt-4">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                  <span>Subiendo imagen...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}
            </DialogFooter>
          </form>
        </div>
        </DialogContent>
      </Dialog>
    );
  }

export default ProfileEditor;