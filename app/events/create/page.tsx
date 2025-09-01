'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  DollarSign,
  ArrowLeft,
  Plus,
  X,
  Upload,
  Eye
} from 'lucide-react'
import { Event } from '@/types/events'
import { eventSchema } from '@/lib/validations/events'
import { z } from 'zod'

type EventFormData = z.infer<typeof eventSchema>

const categories = [
  'Tecnología',
  'Negocios',
  'Educación',
  'Salud',
  'Arte',
  'Deportes',
  'Música',
  'Gastronomía',
  'Ciencia',
  'Entretenimiento'
]

const eventTypes = [
  'Conferencia',
  'Taller',
  'Seminario',
  'Networking',
  'Webinar',
  'Competencia',
  'Exposición',
  'Festival',
  'Curso',
  'Meetup'
]

const difficultyLevels = [
  'Principiante',
  'Intermedio',
  'Avanzado',
  'Experto'
]

export default function CreateEventPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState('')
  
  const [formData, setFormData] = useState<Partial<EventFormData>>({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    category: '',
    type: '',
    difficulty: '',
    maxAttendees: 50,
    price: 0,
    organizer: '',
    isOnline: false,
    requiresApproval: false,
    allowWaitlist: true,
    tags: []
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  const handleInputChange = (field: keyof EventFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }
  
  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      const updatedTags = [...tags, newTag.trim()]
      setTags(updatedTags)
      setFormData(prev => ({ ...prev, tags: updatedTags }))
      setNewTag('')
    }
  }
  
  const removeTag = (tagToRemove: string) => {
    const updatedTags = tags.filter(tag => tag !== tagToRemove)
    setTags(updatedTags)
    setFormData(prev => ({ ...prev, tags: updatedTags }))
  }
  
  const validateForm = () => {
    try {
      eventSchema.parse(formData)
      setErrors({})
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {}
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message
          }
        })
        setErrors(newErrors)
      }
      return false
    }
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error('Por favor corrige los errores en el formulario')
      return
    }
    
    setLoading(true)
    
    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          tags,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
      })
      
      if (response.ok) {
        const newEvent = await response.json()
        toast.success('¡Evento creado exitosamente!')
        router.push(`/events/${newEvent.id}`)
      } else {
        const errorData = await response.json()
        toast.error(errorData.message || 'Error al crear el evento')
      }
    } catch (error) {
      console.error('Error creating event:', error)
      toast.error('Error al crear el evento')
    } finally {
      setLoading(false)
    }
  }
  
  const handleSaveDraft = () => {
    localStorage.setItem('eventDraft', JSON.stringify({ ...formData, tags }))
    toast.success('Borrador guardado')
  }
  
  const loadDraft = () => {
    const draft = localStorage.getItem('eventDraft')
    if (draft) {
      const draftData = JSON.parse(draft)
      setFormData(draftData)
      setTags(draftData.tags || [])
      toast.success('Borrador cargado')
    }
  }
  
  if (previewMode) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            onClick={() => setPreviewMode(false)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al Editor
          </Button>
          <h1 className="text-2xl font-bold">Vista Previa del Evento</h1>
        </div>
        
        <Card>
          <CardHeader>
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge variant="secondary">{formData.category}</Badge>
              <Badge variant="outline">{formData.type}</Badge>
              {formData.difficulty && (
                <Badge variant="outline">{formData.difficulty}</Badge>
              )}
              {formData.price === 0 && <Badge className="bg-green-500">Gratis</Badge>}
              {formData.isOnline && <Badge variant="outline">Online</Badge>}
            </div>
            
            <CardTitle className="text-2xl">{formData.title || 'Título del Evento'}</CardTitle>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {formData.date ? new Date(formData.date).toLocaleDateString('es-ES') : 'Fecha no especificada'}
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                {formData.time || 'Hora no especificada'}
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {formData.location || 'Ubicación no especificada'}
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                Máximo {formData.maxAttendees} asistentes
              </div>
              
              {formData.price && formData.price > 0 && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                  ${formData.price}
                </div>
              )}
            </div>
          </CardHeader>
          
          <CardContent>
            <p className="text-muted-foreground mb-4">
              {formData.description || 'Descripción no especificada'}
            </p>
            
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="outline">{tag}</Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
          <h1 className="text-2xl font-bold">Crear Nuevo Evento</h1>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={loadDraft}
            size="sm"
          >
            Cargar Borrador
          </Button>
          
          <Button
            variant="outline"
            onClick={handleSaveDraft}
            size="sm"
          >
            Guardar Borrador
          </Button>
          
          <Button
            variant="outline"
            onClick={() => setPreviewMode(true)}
            size="sm"
            className="flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            Vista Previa
          </Button>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Información Básica</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Título del Evento *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Ej: Conferencia de Tecnología 2024"
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title}</p>}
            </div>
            
            <div>
              <Label htmlFor="description">Descripción *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe tu evento, qué aprenderán los asistentes, agenda, etc."
                className={`min-h-[120px] ${errors.description ? 'border-red-500' : ''}`}
              />
              {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description}</p>}
            </div>
            
            <div>
              <Label htmlFor="organizer">Organizador *</Label>
              <Input
                id="organizer"
                value={formData.organizer}
                onChange={(e) => handleInputChange('organizer', e.target.value)}
                placeholder="Nombre del organizador o empresa"
                className={errors.organizer ? 'border-red-500' : ''}
              />
              {errors.organizer && <p className="text-sm text-red-500 mt-1">{errors.organizer}</p>}
            </div>
          </CardContent>
        </Card>
        
        {/* Date and Location */}
        <Card>
          <CardHeader>
            <CardTitle>Fecha y Ubicación</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Fecha *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  className={errors.date ? 'border-red-500' : ''}
                />
                {errors.date && <p className="text-sm text-red-500 mt-1">{errors.date}</p>}
              </div>
              
              <div>
                <Label htmlFor="time">Hora *</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => handleInputChange('time', e.target.value)}
                  className={errors.time ? 'border-red-500' : ''}
                />
                {errors.time && <p className="text-sm text-red-500 mt-1">{errors.time}</p>}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="isOnline"
                checked={formData.isOnline}
                onCheckedChange={(checked) => handleInputChange('isOnline', checked)}
              />
              <Label htmlFor="isOnline">Evento en línea</Label>
            </div>
            
            <div>
              <Label htmlFor="location">Ubicación *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder={formData.isOnline ? "Enlace de la reunión virtual" : "Dirección del evento"}
                className={errors.location ? 'border-red-500' : ''}
              />
              {errors.location && <p className="text-sm text-red-500 mt-1">{errors.location}</p>}
            </div>
          </CardContent>
        </Card>
        
        {/* Category and Type */}
        <Card>
          <CardHeader>
            <CardTitle>Categorización</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="category">Categoría *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleInputChange('category', value)}
                >
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
                {errors.category && <p className="text-sm text-red-500 mt-1">{errors.category}</p>}
              </div>
              
              <div>
                <Label htmlFor="type">Tipo de Evento *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => handleInputChange('type', value)}
                >
                  <SelectTrigger className={errors.type ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Selecciona un tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {eventTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.type && <p className="text-sm text-red-500 mt-1">{errors.type}</p>}
              </div>
              
              <div>
                <Label htmlFor="difficulty">Nivel de Dificultad</Label>
                <Select
                  value={formData.difficulty}
                  onValueChange={(value) => handleInputChange('difficulty', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un nivel" />
                  </SelectTrigger>
                  <SelectContent>
                    {difficultyLevels.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Tags */}
            <div>
              <Label>Etiquetas</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Agregar etiqueta"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={addTag}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Agregar
                </Button>
              </div>
              
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
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
          </CardContent>
        </Card>
        
        {/* Capacity and Pricing */}
        <Card>
          <CardHeader>
            <CardTitle>Capacidad y Precio</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="maxAttendees">Máximo de Asistentes *</Label>
                <Input
                  id="maxAttendees"
                  type="number"
                  min="1"
                  value={formData.maxAttendees}
                  onChange={(e) => handleInputChange('maxAttendees', parseInt(e.target.value))}
                  className={errors.maxAttendees ? 'border-red-500' : ''}
                />
                {errors.maxAttendees && <p className="text-sm text-red-500 mt-1">{errors.maxAttendees}</p>}
              </div>
              
              <div>
                <Label htmlFor="price">Precio (USD)</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                  placeholder="0 para evento gratuito"
                />
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Switch
                  id="requiresApproval"
                  checked={formData.requiresApproval}
                  onCheckedChange={(checked) => handleInputChange('requiresApproval', checked)}
                />
                <Label htmlFor="requiresApproval">Requiere aprobación para registrarse</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="allowWaitlist"
                  checked={formData.allowWaitlist}
                  onCheckedChange={(checked) => handleInputChange('allowWaitlist', checked)}
                />
                <Label htmlFor="allowWaitlist">Permitir lista de espera cuando esté lleno</Label>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Submit Buttons */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancelar
          </Button>
          
          <Button
            type="submit"
            disabled={loading}
            className="min-w-[120px]"
          >
            {loading ? 'Creando...' : 'Crear Evento'}
          </Button>
        </div>
      </form>
    </div>
  )
}