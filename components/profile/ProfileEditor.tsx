'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Camera, X, Plus, Save, User, MapPin, GraduationCap, Link as LinkIcon } from 'lucide-react'

interface ProfileEditorProps {
  user: {
    name: string
    username: string
    email: string
    avatar: string
    banner?: string
    bio?: string
    location?: string
    university?: string
    faculty?: string
    major?: string
    interests: string[]
    socialLinks?: {
      twitter?: string
      linkedin?: string
      github?: string
      website?: string
    }
  }
  onSave: (updatedUser: any) => void
}

const ProfileEditor: React.FC<ProfileEditorProps> = ({ user, onSave }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: user.name || '',
    bio: user.bio || '',
    location: user.location || '',
    university: user.university || '',
    faculty: user.faculty || '',
    major: user.major || '',
    interests: user.interests || [],
    socialLinks: {
      twitter: user.socialLinks?.twitter || '',
      linkedin: user.socialLinks?.linkedin || '',
      github: user.socialLinks?.github || '',
      website: user.socialLinks?.website || ''
    }
  })
  const [newInterest, setNewInterest] = useState('')

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSocialLinkChange = (platform: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: value
      }
    }))
  }

  const addInterest = () => {
    if (newInterest.trim() && !formData.interests.includes(newInterest.trim())) {
      setFormData(prev => ({
        ...prev,
        interests: [...prev.interests, newInterest.trim()]
      }))
      setNewInterest('')
    }
  }

  const removeInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.filter(i => i !== interest)
    }))
  }

  const handleSave = () => {
    const updatedUser = {
      ...user,
      ...formData
    }
    onSave(updatedUser)
    setIsOpen(false)
    toast.success('Perfil actualizado correctamente')
  }

  const faculties = [
    'Facultad de Ciencias',
    'Facultad de Tecnología',
    'Facultad de Pedagogía y Cultura Física',
    'Facultad de Ciencias Empresariales',
    'Facultad de Agropecuaria y Nutrición'
  ]

  const majors = {
    'Facultad de Ciencias': ['Matemática e Informática', 'Ciencias Naturales', 'Física', 'Química'],
    'Facultad de Tecnología': ['Electrónica e Informática', 'Mecánica Automotriz', 'Construcciones Metálicas'],
    'Facultad de Pedagogía y Cultura Física': ['Educación Física', 'Educación Inicial', 'Educación Primaria'],
    'Facultad de Ciencias Empresariales': ['Administración', 'Turismo y Hotelería'],
    'Facultad de Agropecuaria y Nutrición': ['Agropecuaria', 'Nutrición Humana']
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <User className="h-4 w-4 mr-2" />
          Editar Perfil
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Perfil</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Avatar y Banner */}
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <Button variant="outline" size="sm">
                  <Camera className="h-4 w-4 mr-2" />
                  Cambiar Avatar
                </Button>
                <Button variant="outline" size="sm">
                  <Camera className="h-4 w-4 mr-2" />
                  Cambiar Banner
                </Button>
              </div>
            </div>
          </div>

          {/* Información Personal */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información Personal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre Completo</Label>
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
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Biografía</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  placeholder="Cuéntanos sobre ti..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Información Académica */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información Académica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="university">Universidad</Label>
                <Input
                  id="university"
                  value={formData.university}
                  onChange={(e) => handleInputChange('university', e.target.value)}
                  placeholder="Universidad Nacional de Educación Enrique Guzmán y Valle"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="faculty">Facultad</Label>
                  <Select value={formData.faculty} onValueChange={(value) => handleInputChange('faculty', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona tu facultad" />
                    </SelectTrigger>
                    <SelectContent>
                      {faculties.map((faculty) => (
                        <SelectItem key={faculty} value={faculty}>
                          {faculty}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="major">Especialidad</Label>
                  <Select 
                    value={formData.major} 
                    onValueChange={(value) => handleInputChange('major', value)}
                    disabled={!formData.faculty}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona tu especialidad" />
                    </SelectTrigger>
                    <SelectContent>
                      {formData.faculty && majors[formData.faculty as keyof typeof majors]?.map((major) => (
                        <SelectItem key={major} value={major}>
                          {major}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Intereses */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Intereses</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {formData.interests.map((interest) => (
                  <Badge key={interest} variant="secondary" className="flex items-center gap-1">
                    {interest}
                    <button
                      onClick={() => removeInterest(interest)}
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
                  placeholder="Agregar nuevo interés"
                  onKeyPress={(e) => e.key === 'Enter' && addInterest()}
                />
                <Button onClick={addInterest} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Redes Sociales */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Redes Sociales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="twitter">Twitter</Label>
                  <Input
                    id="twitter"
                    value={formData.socialLinks.twitter}
                    onChange={(e) => handleSocialLinkChange('twitter', e.target.value)}
                    placeholder="https://twitter.com/usuario"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input
                    id="linkedin"
                    value={formData.socialLinks.linkedin}
                    onChange={(e) => handleSocialLinkChange('linkedin', e.target.value)}
                    placeholder="https://linkedin.com/in/usuario"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="github">GitHub</Label>
                  <Input
                    id="github"
                    value={formData.socialLinks.github}
                    onChange={(e) => handleSocialLinkChange('github', e.target.value)}
                    placeholder="https://github.com/usuario"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Sitio Web</Label>
                  <Input
                    id="website"
                    value={formData.socialLinks.website}
                    onChange={(e) => handleSocialLinkChange('website', e.target.value)}
                    placeholder="https://tusitio.com"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Botones de Acción */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Guardar Cambios
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ProfileEditor