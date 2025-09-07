'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  User, 
  Save, 
  X, 
  Mail, 
  MapPin, 
  BookOpen, 
  Target,
  Plus,
  Trash2,
  Eye,
  GraduationCap
} from 'lucide-react'
import { toast } from 'sonner'
import { gamificationService } from '@/services/gamificationService'
import { CANTUTA_FACULTIES, PERU_CITIES, getProgramsByFaculty, getFacultyByProgram, isValidFacultyProgramCombination } from '@/data/cantuta-data'
import { ProfileHeader } from './ProfileHeader'

interface UserProfile {
  id: string
  name: string
  email: string
  avatar: string
  banner?: string
  bio: string
  location: string
  university: string
  faculty?: string
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
  const router = useRouter()
  // Initialize socialLinks to an empty object to avoid undefined errors when editing
  const [formData, setFormData] = useState<UserProfile & { faculty?: string }>({
    ...profile,
    faculty: profile.faculty || '',
    socialLinks: profile.socialLinks || {}
  })
  const [newInterest, setNewInterest] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [bannerPreview, setBannerPreview] = useState<string | null>(null)

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
        ...(prev.socialLinks || {}),
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

  const handleBannerChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('La imagen del banner debe ser menor a 10MB')
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setBannerPreview(result)
        setFormData(prev => ({
          ...prev,
          banner: result
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

      // Validación de combinación facultad-programa
      if (formData.faculty && formData.major) {
        if (!isValidFacultyProgramCombination(formData.faculty, formData.major)) {
          toast.error('La combinación de facultad y programa seleccionada no es válida para La Cantuta')
          return
        }
      }

      // Validación de email institucional
      if (formData.email && !formData.email.endsWith('@une.edu.pe')) {
        toast.error('Debes usar tu correo institucional de La Cantuta (@une.edu.pe)')
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

  const handleViewPublic = () => {
    // Extract username from email or use a default
    const username = formData.email?.split('@')[0] || 'usuario'
    router.push(`/@${username}`)
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <ProfileHeader 
        user={{
          name: formData.name,
          username: formData.email?.split('@')[0] || 'usuario',
          avatar: avatarPreview || formData.avatar,
          banner: bannerPreview || formData.banner,
          bio: formData.bio,
          location: formData.location,
          university: formData.university,
          major: formData.major,
          joinDate: 'Enero 2024', // Mock data
          level: 1, // Mock data
          xp: 0, // Mock data
          maxXp: 100, // Mock data
          interests: formData.interests,
          followers: 0, // Mock data
          following: 0, // Mock data
          posts: 0 // Mock data
        }}
        mode="edit"
        onViewPublic={handleViewPublic}
        onBannerChange={(newBanner) => {
          setBannerPreview(newBanner)
          setFormData(prev => ({ ...prev, banner: newBanner }))
        }}
        onAvatarChange={(newAvatar) => {
          setAvatarPreview(newAvatar)
          setFormData(prev => ({ ...prev, avatar: newAvatar }))
        }}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Editar Perfil
          </CardTitle>
          <CardDescription>
            Actualiza tu información personal y preferencias
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">

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
                <Select value={formData.location} onValueChange={(value) => handleInputChange('location', value)}>
                  <SelectTrigger className="pl-10">
                    <SelectValue placeholder="Selecciona tu ciudad" />
                  </SelectTrigger>
                  <SelectContent>
                    {PERU_CITIES.map((city) => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="university">Universidad</Label>
              <div className="relative">
                <BookOpen className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="university"
                  value="Universidad Nacional de Educación Enrique Guzmán y Valle (La Cantuta)"
                  disabled
                  className="pl-10 bg-gray-50"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="faculty">Facultad</Label>
              <div className="relative">
                <GraduationCap className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Select value={formData.faculty} onValueChange={(value) => {
                  handleInputChange('faculty', value)
                  // Reset major when faculty changes
                  handleInputChange('major', '')
                }}>
                  <SelectTrigger className="pl-10">
                    <SelectValue placeholder="Selecciona tu facultad" />
                  </SelectTrigger>
                  <SelectContent>
                    {CANTUTA_FACULTIES.map((faculty) => (
                      <SelectItem key={faculty.id} value={faculty.name}>{faculty.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="major">Programa de Pregrado</Label>
              <div className="relative">
                <Target className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Select 
                  value={formData.major} 
                  onValueChange={(value) => handleInputChange('major', value)}
                  disabled={!formData.faculty}
                >
                  <SelectTrigger className="pl-10">
                    <SelectValue placeholder={formData.faculty ? "Selecciona tu programa" : "Primero selecciona una facultad"} />
                  </SelectTrigger>
                  <SelectContent>
                    {formData.faculty && getProgramsByFaculty(formData.faculty).map((program) => (
                      <SelectItem key={program.id} value={program.name}>{program.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                    aria-label="Eliminar interés"
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
