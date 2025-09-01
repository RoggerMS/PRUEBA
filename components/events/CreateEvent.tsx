"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Image as ImageIcon,
  Plus,
  X,
  Upload,
  Eye,
  Save,
  Send,
  AlertCircle,
  CheckCircle,
  Star,
  Tag,
  DollarSign,
  Globe,
  Lock,
  Zap,
  Award,
  Target
} from "lucide-react";

interface CreateEventProps {
  onEventCreated?: (event: any) => void;
}

export function CreateEvent({ onEventCreated }: CreateEventProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    startDate: "",
    endDate: "",
    location: "",
    isOnline: false,
    maxAttendees: "",
    price: "",
    imageUrl: "",
    tags: [] as string[],
    requirements: [] as string[],
    prizes: [] as string[],
    speakers: [] as string[],
    agenda: [] as { time: string; title: string; description: string; speaker?: string }[],
    isPublic: true,
    allowRegistration: true,
    requireApproval: false,
    sendReminders: true,
    difficulty: "",
    duration: ""
  });

  const [currentTag, setCurrentTag] = useState("");
  const [currentRequirement, setCurrentRequirement] = useState("");
  const [currentPrize, setCurrentPrize] = useState("");
  const [currentSpeaker, setCurrentSpeaker] = useState("");
  const [currentAgendaItem, setCurrentAgendaItem] = useState({
    time: "",
    title: "",
    description: "",
    speaker: ""
  });
  const [activeStep, setActiveStep] = useState(1);
  const [isPreview, setIsPreview] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const categories = [
    { value: "TECHNOLOGY", label: "Tecnología" },
    { value: "ACADEMIC", label: "Académico" },
    { value: "CULTURAL", label: "Cultural" },
    { value: "SPORTS", label: "Deportivo" },
    { value: "WORKSHOP", label: "Taller" }
  ];

  const difficulties = [
    "Principiante",
    "Intermedio",
    "Avanzado",
    "Experto"
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const addRequirement = () => {
    if (currentRequirement.trim() && !formData.requirements.includes(currentRequirement.trim())) {
      setFormData(prev => ({
        ...prev,
        requirements: [...prev.requirements, currentRequirement.trim()]
      }));
      setCurrentRequirement("");
    }
  };

  const removeRequirement = (reqToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.filter(req => req !== reqToRemove)
    }));
  };

  const addPrize = () => {
    if (currentPrize.trim() && !formData.prizes.includes(currentPrize.trim())) {
      setFormData(prev => ({
        ...prev,
        prizes: [...prev.prizes, currentPrize.trim()]
      }));
      setCurrentPrize("");
    }
  };

  const removePrize = (prizeToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      prizes: prev.prizes.filter(prize => prize !== prizeToRemove)
    }));
  };

  const addSpeaker = () => {
    if (currentSpeaker.trim() && !formData.speakers.includes(currentSpeaker.trim())) {
      setFormData(prev => ({
        ...prev,
        speakers: [...prev.speakers, currentSpeaker.trim()]
      }));
      setCurrentSpeaker("");
    }
  };

  const removeSpeaker = (speakerToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      speakers: prev.speakers.filter(speaker => speaker !== speakerToRemove)
    }));
  };

  const addAgendaItem = () => {
    if (currentAgendaItem.time && currentAgendaItem.title && currentAgendaItem.description) {
      setFormData(prev => ({
        ...prev,
        agenda: [...prev.agenda, { ...currentAgendaItem }]
      }));
      setCurrentAgendaItem({ time: "", title: "", description: "", speaker: "" });
    }
  };

  const removeAgendaItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      agenda: prev.agenda.filter((_, i) => i !== index)
    }));
  };

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.title.trim()) newErrors.title = "El título es requerido";
      if (!formData.description.trim()) newErrors.description = "La descripción es requerida";
      if (!formData.category) newErrors.category = "La categoría es requerida";
    }

    if (step === 2) {
      if (!formData.startDate) newErrors.startDate = "La fecha de inicio es requerida";
      if (!formData.endDate) newErrors.endDate = "La fecha de fin es requerida";
      if (!formData.isOnline && !formData.location.trim()) newErrors.location = "La ubicación es requerida para eventos presenciales";
      if (!formData.maxAttendees || parseInt(formData.maxAttendees) <= 0) {
        newErrors.maxAttendees = "El número de participantes debe ser mayor a 0";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prev => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setActiveStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = () => {
    if (validateStep(activeStep)) {
      const newEvent = {
        id: Date.now().toString(),
        ...formData,
        currentAttendees: 0,
        status: 'UPCOMING',
        isRegistered: false,
        isFeatured: false,
        canEdit: true,
        organizer: {
          name: "Usuario Actual", // This would come from auth
          avatar: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20avatar%20portrait&image_size=square"
        },
        imageUrl: formData.imageUrl || "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20event%20banner%20design&image_size=landscape_16_9"
      };

      onEventCreated?.(newEvent);
      
      // Reset form
      setFormData({
        title: "",
        description: "",
        category: "",
        startDate: "",
        endDate: "",
        location: "",
        isOnline: false,
        maxAttendees: "",
        price: "",
        imageUrl: "",
        tags: [],
        requirements: [],
        prizes: [],
        speakers: [],
        agenda: [],
        isPublic: true,
        allowRegistration: true,
        requireApproval: false,
        sendReminders: true,
        difficulty: "",
        duration: ""
      });
      setActiveStep(1);
      setIsPreview(false);
    }
  };

  const steps = [
    { number: 1, title: "Información Básica", icon: <Star className="h-4 w-4" /> },
    { number: 2, title: "Fecha y Ubicación", icon: <Calendar className="h-4 w-4" /> },
    { number: 3, title: "Detalles Adicionales", icon: <Target className="h-4 w-4" /> },
    { number: 4, title: "Configuración", icon: <Zap className="h-4 w-4" /> }
  ];

  if (isPreview) {
    return (
      <div className="space-y-6">
        {/* Preview Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Vista Previa del Evento</h2>
            <p className="text-gray-600">Revisa cómo se verá tu evento antes de publicarlo</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsPreview(false)}>
              <X className="h-4 w-4 mr-2" />
              Editar
            </Button>
            <Button onClick={handleSubmit} className="bg-gradient-to-r from-purple-600 to-blue-600">
              <Send className="h-4 w-4 mr-2" />
              Publicar Evento
            </Button>
          </div>
        </div>

        {/* Preview Card */}
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg overflow-hidden">
          <div className="relative">
            <img 
              src={formData.imageUrl || "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20event%20banner%20design&image_size=landscape_16_9"} 
              alt={formData.title}
              className="w-full h-64 object-cover"
            />
            <div className="absolute top-4 left-4 flex gap-2">
              <Badge className="bg-purple-100 text-purple-800">
                {categories.find(cat => cat.value === formData.category)?.label || formData.category}
              </Badge>
              <Badge className="bg-blue-100 text-blue-800">
                {formData.isOnline ? "Virtual" : "Presencial"}
              </Badge>
            </div>
          </div>

          <CardHeader>
            <CardTitle className="text-2xl">{formData.title}</CardTitle>
            <p className="text-gray-600">{formData.description}</p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Event Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-gray-500" />
                <span>{new Date(formData.startDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-gray-500" />
                <span>{new Date(formData.startDate).toLocaleTimeString()} - {new Date(formData.endDate).toLocaleTimeString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-gray-500" />
                <span>{formData.isOnline ? "Evento Virtual" : formData.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-gray-500" />
                <span>Máximo {formData.maxAttendees} participantes</span>
              </div>
            </div>

            {/* Tags */}
            {formData.tags.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Etiquetas</h4>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">{tag}</Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Additional sections would be rendered here */}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Crear Nuevo Evento
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Organiza eventos académicos, talleres, conferencias y más para la comunidad estudiantil
        </p>
      </div>

      {/* Progress Steps */}
      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                  activeStep >= step.number 
                    ? 'bg-purple-600 border-purple-600 text-white' 
                    : 'border-gray-300 text-gray-500'
                }`}>
                  {activeStep > step.number ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    step.icon
                  )}
                </div>
                <div className="ml-3 hidden sm:block">
                  <p className={`text-sm font-medium ${
                    activeStep >= step.number ? 'text-purple-600' : 'text-gray-500'
                  }`}>
                    Paso {step.number}
                  </p>
                  <p className={`text-xs ${
                    activeStep >= step.number ? 'text-purple-600' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-12 h-0.5 ml-4 ${
                    activeStep > step.number ? 'bg-purple-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Form Content */}
      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {steps[activeStep - 1].icon}
            {steps[activeStep - 1].title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Basic Information */}
          {activeStep === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="title">Título del Evento *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Ej: Conferencia de Inteligencia Artificial"
                    className={errors.title ? 'border-red-500' : ''}
                  />
                  {errors.title && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.title}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="category">Categoría *</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                    <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.category}
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isOnline"
                    checked={formData.isOnline}
                    onChange={(e) => handleInputChange('isOnline', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="isOnline">Evento Virtual</Label>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Descripción *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe tu evento, objetivos, y qué pueden esperar los participantes..."
                  rows={4}
                  className={errors.description ? 'border-red-500' : ''}
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.description}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="imageUrl">URL de Imagen (Opcional)</Label>
                <Input
                  id="imageUrl"
                  value={formData.imageUrl}
                  onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Si no proporcionas una imagen, se generará una automáticamente
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Date and Location */}
          {activeStep === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Fecha y Hora de Inicio *</Label>
                  <Input
                    id="startDate"
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    className={errors.startDate ? 'border-red-500' : ''}
                  />
                  {errors.startDate && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.startDate}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="endDate">Fecha y Hora de Fin *</Label>
                  <Input
                    id="endDate"
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    className={errors.endDate ? 'border-red-500' : ''}
                  />
                  {errors.endDate && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.endDate}
                    </p>
                  )}
                </div>
              </div>

              {!formData.isOnline && (
                <div>
                  <Label htmlFor="location">Ubicación *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="Ej: Auditorio Principal, Aula 101, etc."
                    className={errors.location ? 'border-red-500' : ''}
                  />
                  {errors.location && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.location}
                    </p>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="maxAttendees">Máximo de Participantes *</Label>
                  <Input
                    id="maxAttendees"
                    type="number"
                    min="1"
                    value={formData.maxAttendees}
                    onChange={(e) => handleInputChange('maxAttendees', e.target.value)}
                    placeholder="50"
                    className={errors.maxAttendees ? 'border-red-500' : ''}
                  />
                  {errors.maxAttendees && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.maxAttendees}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="price">Precio (Opcional)</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    placeholder="0.00"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Deja en blanco si es gratuito
                  </p>
                </div>

                <div>
                  <Label htmlFor="duration">Duración (Opcional)</Label>
                  <Input
                    id="duration"
                    value={formData.duration}
                    onChange={(e) => handleInputChange('duration', e.target.value)}
                    placeholder="2 horas"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Additional Details */}
          {activeStep === 3 && (
            <div className="space-y-6">
              {/* Tags */}
              <div>
                <Label>Etiquetas</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    placeholder="Agregar etiqueta"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" onClick={addTag} variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Difficulty */}
              <div>
                <Label htmlFor="difficulty">Nivel de Dificultad (Opcional)</Label>
                <Select value={formData.difficulty} onValueChange={(value) => handleInputChange('difficulty', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el nivel" />
                  </SelectTrigger>
                  <SelectContent>
                    {difficulties.map(difficulty => (
                      <SelectItem key={difficulty} value={difficulty}>
                        {difficulty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Requirements */}
              <div>
                <Label>Requisitos (Opcional)</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={currentRequirement}
                    onChange={(e) => setCurrentRequirement(e.target.value)}
                    placeholder="Agregar requisito"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
                  />
                  <Button type="button" onClick={addRequirement} variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {formData.requirements.map((req, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      <span className="flex-1">{req}</span>
                      <X 
                        className="h-4 w-4 cursor-pointer text-gray-500 hover:text-red-500" 
                        onClick={() => removeRequirement(req)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Speakers */}
              <div>
                <Label>Ponentes (Opcional)</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={currentSpeaker}
                    onChange={(e) => setCurrentSpeaker(e.target.value)}
                    placeholder="Nombre del ponente"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSpeaker())}
                  />
                  <Button type="button" onClick={addSpeaker} variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.speakers.map((speaker, index) => (
                    <Badge key={index} variant="outline" className="flex items-center gap-1">
                      {speaker}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeSpeaker(speaker)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Prizes */}
              <div>
                <Label>Premios (Opcional)</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={currentPrize}
                    onChange={(e) => setCurrentPrize(e.target.value)}
                    placeholder="Descripción del premio"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPrize())}
                  />
                  <Button type="button" onClick={addPrize} variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {formData.prizes.map((prize, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-yellow-50 rounded border border-yellow-200">
                      <Award className="h-4 w-4 text-yellow-600" />
                      <span className="flex-1">{prize}</span>
                      <X 
                        className="h-4 w-4 cursor-pointer text-gray-500 hover:text-red-500" 
                        onClick={() => removePrize(prize)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Configuration */}
          {activeStep === 4 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Configuración de Visibilidad</h4>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label className="font-medium">Evento Público</Label>
                      <p className="text-sm text-gray-600">Visible para todos los usuarios</p>
                    </div>
                    <Switch
                      checked={formData.isPublic}
                      onCheckedChange={(checked) => handleInputChange('isPublic', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label className="font-medium">Permitir Registro</Label>
                      <p className="text-sm text-gray-600">Los usuarios pueden registrarse</p>
                    </div>
                    <Switch
                      checked={formData.allowRegistration}
                      onCheckedChange={(checked) => handleInputChange('allowRegistration', checked)}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Configuración de Registro</h4>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label className="font-medium">Requiere Aprobación</Label>
                      <p className="text-sm text-gray-600">Revisar registros manualmente</p>
                    </div>
                    <Switch
                      checked={formData.requireApproval}
                      onCheckedChange={(checked) => handleInputChange('requireApproval', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label className="font-medium">Enviar Recordatorios</Label>
                      <p className="text-sm text-gray-600">Notificar antes del evento</p>
                    </div>
                    <Switch
                      checked={formData.sendReminders}
                      onCheckedChange={(checked) => handleInputChange('sendReminders', checked)}
                    />
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="p-6 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-4">Resumen del Evento</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Título:</span> {formData.title || 'Sin título'}
                  </div>
                  <div>
                    <span className="font-medium">Categoría:</span> {formData.category || 'Sin categoría'}
                  </div>
                  <div>
                    <span className="font-medium">Fecha:</span> {formData.date || 'Sin fecha'}
                  </div>
                  <div>
                    <span className="font-medium">Ubicación:</span> {formData.location || 'Sin ubicación'}
                  </div>
                  <div>
                    <span className="font-medium">Participantes:</span> {formData.maxAttendees || '0'}
                  </div>
                  <div>
                    <span className="font-medium">Precio:</span> {formData.price ? `$${formData.price}` : 'Gratuito'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6 border-t">
            <Button 
              variant="outline" 
              onClick={prevStep}
              disabled={activeStep === 1}
            >
              Anterior
            </Button>
            
            <div className="flex gap-2">
              {activeStep === 4 && (
                <Button 
                  variant="outline" 
                  onClick={() => setIsPreview(true)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Vista Previa
                </Button>
              )}
              
              {activeStep < 4 ? (
                <Button onClick={nextStep}>
                  Siguiente
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit}
                  className="bg-gradient-to-r from-purple-600 to-blue-600"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Crear Evento
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}