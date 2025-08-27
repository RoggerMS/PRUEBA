'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { 
  User, 
  Camera, 
  Save, 
  X, 
  Mail, 
  MapPin, 
  BookOpen, 
  Target,
  Plus,
  Trash2,
  Eye,
  Edit
} from 'lucide-react'
import { toast } from 'sonner'
import { gamificationService } from '@/services/gamificationService'
import PublicProfileView from './PublicProfileView'

interface UserProfile {
  id: string
  name: string
  email: string
  avatar: string
  bio: string
  location: string
  university: string
  major: string
  interests: string[]
  socialLinks: {
    linkedin?: string
    github?: string
    twitter?: string
  }
}

interface ProfileEditorProps {
  profile: UserProfile
  onSave: (profile: UserProfile) => void
  onCancel: () => void
}

export default function ProfileEditor({ profile, onSave, onCancel }: ProfileEditorProps) {
  const [formData, setFormData] = useState<UserProfile>(profile)
  const [newInterest, setNewInterest] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [isPublicView, setIsPublicView] = useState(false)

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSocialLinkChange = (platform: keyof UserProfile['socialLinks'], value: string) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: value
      }
    }))
  }

  const handleAddInterest = () => {
    if (newInterest.trim() && !formData.interests.includes(newInterest.trim())) {
      setFormData(prev => ({
        ...prev,
        interests: [...prev.interests, newInterest.trim()]
      }))
      setNewInterest('')
    }
  }

  const handleRemoveInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.filter(i => i !== interest)
    }))
  }

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('La imagen debe ser menor a 5MB')
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setAvatarPreview(result)
        setFormData(prev => ({
          ...prev,
          avatar: result
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      // Validaciones básicas
      if (!formData.name.trim()) {
        toast.error('El nombre es requerido')
        return
      }
      if (!formData.email.trim()) {
        toast.error('El email es requerido')
        return
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        toast.error('El email no es válido')
        return
      }

      // Simular guardado
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Otorgar XP por actualizar perfil
      await gamificationService.grantXP("user-id", 10, "achievement", "profile-update", 'Actualizar perfil')
      
      onSave(formData)
      toast.success('Perfil actualizado correctamente')
    } catch (error) {
      toast.error('Error al guardar el perfil')
    } finally {
      setIsLoading(false)
    }
  }

  // Convertir el perfil al formato requerido por PublicProfileView
  const getPublicProfileData = () => {
    return {
      ...formData,
      joinDate: 'Enero 2024',
      level: 5,
      xp: 1250,
      nextLevelXP: 2000,
      achievements: [
        {
          id: '1',
          title: 'Primer Paso',
          description: 'Completaste tu primer desafío',
          icon: 'Trophy',
          unlockedAt: '15 Ene 2024',
          rarity: 'common' as const
        },
        {
          id: '2',
          title: 'Estudiante Dedicado',
          description: 'Completaste 10 lecciones',
          icon: 'Star',
          unlockedAt: '20 Ene 2024',
          rarity: 'rare' as const
        }
      ],
      stats: [
        { label: 'Desafíos Completados', value: '23', icon: 'Target' },
        { label: 'Días Activo', value: '45', icon: 'Calendar' },
        { label: 'Puntos Totales', value: '1,250', icon: 'Zap' }
      ]
    }
  }

  const toggleView = () => {
    setIsPublicView(!isPublicView)
  }

  // Si está en vista pública, mostrar el componente PublicProfileView
  if (isPublicView) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Vista Pública del Perfil</h2>
          <Button onClick={toggleView} variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Volver a Editar
          </Button>
        </div>
        <PublicProfileView user={getPublicProfileData()} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Editar Perfil
            </div>
            <Button onClick={toggleView} variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              Ver como Público
            </Button>
          </CardTitle>
          <CardDescription>
            Actualiza tu información personal y preferencias
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Avatar className="h-20 w-20">
                <AvatarImage 
                  src={avatarPreview || formData.avatar} 
                  alt={formData.name} 
                />
                <AvatarFallback className="text-lg">
                  {formData.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <label className="absolute -bottom-2 -right-2 cursor-pointer">
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-8 w-8 rounded-full p-0"
                  type="button"
                >
                  <Camera className="h-4 w-4" />
                </Button>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-medium">Foto de Perfil</h4>
              <p className="text-xs text-gray-600">
                Sube una imagen de hasta 5MB en formato JPG, PNG o GIF
              </p>
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre Completo *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Tu nombre completo"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="tu@email.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Ubicación</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="Ciudad, País"
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="university">Universidad</Label>
              <div className="relative">
                <BookOpen className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="university"
                  value={formData.university}
                  onChange={(e) => handleInputChange('university', e.target.value)}
                  placeholder="Nombre de tu universidad"
                  className="pl-10"
                />
              </div>
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="major">Carrera</Label>
              <div className="relative">
                <Target className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="major"
                  value={formData.major}
                  onChange={(e) => handleInputChange('major', e.target.value)}
                  placeholder="Tu carrera o área de estudio"
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Biography */}
          <div className="space-y-2">
            <Label htmlFor="bio">Biografía</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              placeholder="Cuéntanos un poco sobre ti..."
              rows={4}
              maxLength={500}
            />
            <div className="text-xs text-gray-500 text-right">
              {formData.bio.length}/500 caracteres
            </div>
          </div>

          {/* Interests */}
          <div className="space-y-3">
            <Label>Intereses</Label>
            <div className="flex flex-wrap gap-2">
              {formData.interests.map((interest, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {interest}
                  <button
                    onClick={() => handleRemoveInterest(interest)}
                    className="ml-1 hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                placeholder="Agregar interés"
                onKeyPress={(e) => e.key === 'Enter' && handleAddInterest()}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddInterest}
                disabled={!newInterest.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Social Links */}
          <div className="space-y-3">
            <Label>Enlaces Sociales</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="linkedin" className="text-sm">LinkedIn</Label>
                <Input
                  id="linkedin"
                  value={formData.socialLinks.linkedin || ''}
                  onChange={(e) => handleSocialLinkChange('linkedin', e.target.value)}
                  placeholder="https://linkedin.com/in/tu-perfil"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="github" className="text-sm">GitHub</Label>
                <Input
                  id="github"
                  value={formData.socialLinks.github || ''}
                  onChange={(e) => handleSocialLinkChange('github', e.target.value)}
                  placeholder="https://github.com/tu-usuario"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="twitter" className="text-sm">Twitter</Label>
                <Input
                  id="twitter"
                  value={formData.socialLinks.twitter || ''}
                  onChange={(e) => handleSocialLinkChange('twitter', e.target.value)}
                  placeholder="https://twitter.com/tu-usuario"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={isLoading}
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
