"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import { Badge } from "@/src/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  DollarSign,
  Upload,
  X,
  Plus,
  Save,
  Eye,
  AlertCircle,
  CheckCircle,
  Image as ImageIcon,
  Tag,
  Award,
  FileText,
  Mic
} from "lucide-react";

interface CreateEventProps {
  onCancel: () => void;
  onSubmit: (eventData: any) => void;
}

const categories = [
  { value: "academico", label: "Académico" },
  { value: "tecnologia", label: "Tecnología" },
  { value: "deportes", label: "Deportes" },
  { value: "arte", label: "Arte y Cultura" },
  { value: "ciencia", label: "Ciencia" },
  { value: "extracurricular", label: "Extracurricular" },
  { value: "social", label: "Social" },
  { value: "voluntariado", label: "Voluntariado" }
];

const eventTypes = [
  { value: "conferencia", label: "Conferencia" },
  { value: "taller", label: "Taller" },
  { value: "seminario", label: "Seminario" },
  { value: "competencia", label: "Competencia" },
  { value: "networking", label: "Networking" },
  { value: "exposicion", label: "Exposición" },
  { value: "festival", label: "Festival" },
  { value: "curso", label: "Curso" }
];

const difficultyLevels = [
  { value: "principiante", label: "Principiante" },
  { value: "intermedio", label: "Intermedio" },
  { value: "avanzado", label: "Avanzado" },
  { value: "experto", label: "Experto" }
];

const privacyOptions = [
  { value: "public", label: "Público", description: "Visible para todos los usuarios" },
  { value: "private", label: "Privado", description: "Solo por invitación" },
  { value: "restricted", label: "Restringido", description: "Solo miembros de clubs específicos" }
];

export function CreateEvent({ onCancel, onSubmit }: CreateEventProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    type: "",
    date: "",
    time: "",
    endTime: "",
    location: "",
    maxAttendees: "",
    price: "",
    difficulty: "",
    privacy: "public",
    requirements: "",
    agenda: "",
    facilities: "",
    contactInfo: ""
  });

  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [prizes, setPrizes] = useState<string[]>([]);
  const [newPrize, setNewPrize] = useState("");
  const [speakers, setSpeakers] = useState<string[]>([]);
  const [newSpeaker, setNewSpeaker] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(1);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim()) && tags.length < 10) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const addPrize = () => {
    if (newPrize.trim() && !prizes.includes(newPrize.trim()) && prizes.length < 5) {
      setPrizes([...prizes, newPrize.trim()]);
      setNewPrize("");
    }
  };

  const removePrize = (prizeToRemove: string) => {
    setPrizes(prizes.filter(prize => prize !== prizeToRemove));
  };

  const addSpeaker = () => {
    if (newSpeaker.trim() && !speakers.includes(newSpeaker.trim()) && speakers.length < 10) {
      setSpeakers([...speakers, newSpeaker.trim()]);
      setNewSpeaker("");
    }
  };

  const removeSpeaker = (speakerToRemove: string) => {
    setSpeakers(speakers.filter(speaker => speaker !== speakerToRemove));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = "El título es requerido";
    if (!formData.description.trim()) newErrors.description = "La descripción es requerida";
    if (!formData.category) newErrors.category = "La categoría es requerida";
    if (!formData.type) newErrors.type = "El tipo de evento es requerido";
    if (!formData.date) newErrors.date = "La fecha es requerida";
    if (!formData.time) newErrors.time = "La hora de inicio es requerida";
    if (!formData.location.trim()) newErrors.location = "La ubicación es requerida";
    if (!formData.maxAttendees || parseInt(formData.maxAttendees) < 1) {
      newErrors.maxAttendees = "El número máximo de asistentes debe ser mayor a 0";
    }
    if (formData.price && parseFloat(formData.price) < 0) {
      newErrors.price = "El precio no puede ser negativo";
    }

    // Validate date is not in the past
    const eventDate = new Date(`${formData.date}T${formData.time}`);
    if (eventDate <= new Date()) {
      newErrors.date = "La fecha del evento debe ser futura";
    }

    // Validate end time is after start time
    if (formData.endTime) {
      const startTime = new Date(`${formData.date}T${formData.time}`);
      const endTime = new Date(`${formData.date}T${formData.endTime}`);
      if (endTime <= startTime) {
        newErrors.endTime = "La hora de fin debe ser posterior a la hora de inicio";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const eventData = {
        ...formData,
        tags,
        prizes,
        speakers,
        image: imagePreview || `https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(formData.title + ' ' + formData.category + ' event')}&image_size=landscape_4_3`,
        maxAttendees: parseInt(formData.maxAttendees),
        price: parseFloat(formData.price) || 0,
        organizer: "Usuario Actual", // This would come from auth context
        organizerAvatar: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=user%20avatar%20profile&image_size=square",
        attendees: 0,
        status: "upcoming",
        isRegistered: false,
        isFeatured: false,
        createdAt: new Date().toISOString()
      };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      onSubmit(eventData);
    } catch (error) {
      console.error("Error creating event:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Título del Evento *</label>
          <Input
            placeholder="Ej: Hackathon de Inteligencia Artificial"
            value={formData.title}
            onChange={(e) => handleInputChange("title", e.target.value)}
            className={errors.title ? "border-red-500" : ""}
          />
          {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Categoría *</label>
          <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
            <SelectTrigger className={errors.category ? "border-red-500" : ""}>
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
          {errors.category && <p className="text-sm text-red-500">{errors.category}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Descripción *</label>
        <Textarea
          placeholder="Describe tu evento, objetivos, qué aprenderán los participantes..."
          value={formData.description}
          onChange={(e) => handleInputChange("description", e.target.value)}
          rows={4}
          className={errors.description ? "border-red-500" : ""}
        />
        {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Tipo de Evento *</label>
          <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
            <SelectTrigger className={errors.type ? "border-red-500" : ""}>
              <SelectValue placeholder="Selecciona el tipo" />
            </SelectTrigger>
            <SelectContent>
              {eventTypes.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.type && <p className="text-sm text-red-500">{errors.type}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Nivel de Dificultad</label>
          <Select value={formData.difficulty} onValueChange={(value) => handleInputChange("difficulty", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona el nivel" />
            </SelectTrigger>
            <SelectContent>
              {difficultyLevels.map(level => (
                <SelectItem key={level.value} value={level.value}>
                  {level.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Fecha *</label>
          <Input
            type="date"
            value={formData.date}
            onChange={(e) => handleInputChange("date", e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className={errors.date ? "border-red-500" : ""}
          />
          {errors.date && <p className="text-sm text-red-500">{errors.date}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Hora de Inicio *</label>
          <Input
            type="time"
            value={formData.time}
            onChange={(e) => handleInputChange("time", e.target.value)}
            className={errors.time ? "border-red-500" : ""}
          />
          {errors.time && <p className="text-sm text-red-500">{errors.time}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Hora de Fin</label>
          <Input
            type="time"
            value={formData.endTime}
            onChange={(e) => handleInputChange("endTime", e.target.value)}
            className={errors.endTime ? "border-red-500" : ""}
          />
          {errors.endTime && <p className="text-sm text-red-500">{errors.endTime}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Ubicación *</label>
        <Input
          placeholder="Ej: Auditorio Principal, Sala 101, Online (Zoom)"
          value={formData.location}
          onChange={(e) => handleInputChange("location", e.target.value)}
          className={errors.location ? "border-red-500" : ""}
        />
        {errors.location && <p className="text-sm text-red-500">{errors.location}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Máximo de Asistentes *</label>
          <Input
            type="number"
            placeholder="Ej: 50"
            value={formData.maxAttendees}
            onChange={(e) => handleInputChange("maxAttendees", e.target.value)}
            min="1"
            className={errors.maxAttendees ? "border-red-500" : ""}
          />
          {errors.maxAttendees && <p className="text-sm text-red-500">{errors.maxAttendees}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Precio (Crolars)</label>
          <Input
            type="number"
            placeholder="0 para evento gratuito"
            value={formData.price}
            onChange={(e) => handleInputChange("price", e.target.value)}
            min="0"
            step="0.01"
            className={errors.price ? "border-red-500" : ""}
          />
          {errors.price && <p className="text-sm text-red-500">{errors.price}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Privacidad del Evento</label>
        <Select value={formData.privacy} onValueChange={(value) => handleInputChange("privacy", value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {privacyOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                <div>
                  <div className="font-medium">{option.label}</div>
                  <div className="text-sm text-gray-500">{option.description}</div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      {/* Image Upload */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Imagen del Evento</label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          {imagePreview ? (
            <div className="relative">
              <img src={imagePreview} alt="Preview" className="max-h-48 mx-auto rounded-lg" />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => {
                  setImagePreview("");
                  setImageFile(null);
                }}
              >
                <X className="h-4 w-4 mr-2" />
                Remover
              </Button>
            </div>
          ) : (
            <div>
              <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">Sube una imagen para tu evento</p>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label htmlFor="image-upload">
                <Button type="button" variant="outline" className="cursor-pointer">
                  <Upload className="h-4 w-4 mr-2" />
                  Seleccionar Imagen
                </Button>
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Etiquetas</label>
        <div className="flex gap-2 mb-2">
          <Input
            placeholder="Agregar etiqueta"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
            className="flex-1"
          />
          <Button type="button" onClick={addTag} disabled={!newTag.trim() || tags.length >= 10}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {tags.map(tag => (
            <Badge key={tag} variant="secondary" className="flex items-center gap-1">
              <Tag className="h-3 w-3" />
              {tag}
              <button onClick={() => removeTag(tag)} className="ml-1 hover:text-red-500">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      </div>

      {/* Speakers */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Ponentes/Instructores</label>
        <div className="flex gap-2 mb-2">
          <Input
            placeholder="Nombre del ponente"
            value={newSpeaker}
            onChange={(e) => setNewSpeaker(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSpeaker())}
            className="flex-1"
          />
          <Button type="button" onClick={addSpeaker} disabled={!newSpeaker.trim() || speakers.length >= 10}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {speakers.map(speaker => (
            <Badge key={speaker} variant="outline" className="flex items-center gap-1">
              <Mic className="h-3 w-3" />
              {speaker}
              <button onClick={() => removeSpeaker(speaker)} className="ml-1 hover:text-red-500">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      </div>

      {/* Prizes */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Premios (opcional)</label>
        <div className="flex gap-2 mb-2">
          <Input
            placeholder="Descripción del premio"
            value={newPrize}
            onChange={(e) => setNewPrize(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPrize())}
            className="flex-1"
          />
          <Button type="button" onClick={addPrize} disabled={!newPrize.trim() || prizes.length >= 5}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {prizes.map(prize => (
            <Badge key={prize} variant="outline" className="flex items-center gap-1 bg-yellow-50 text-yellow-700 border-yellow-200">
              <Award className="h-3 w-3" />
              {prize}
              <button onClick={() => removePrize(prize)} className="ml-1 hover:text-red-500">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Requisitos de Participación</label>
        <Textarea
          placeholder="Ej: Conocimientos básicos de programación, laptop personal, etc."
          value={formData.requirements}
          onChange={(e) => handleInputChange("requirements", e.target.value)}
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Agenda del Evento</label>
        <Textarea
          placeholder="Describe la agenda o cronograma del evento..."
          value={formData.agenda}
          onChange={(e) => handleInputChange("agenda", e.target.value)}
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Instalaciones y Recursos</label>
        <Textarea
          placeholder="Describe las instalaciones, equipos disponibles, materiales incluidos..."
          value={formData.facilities}
          onChange={(e) => handleInputChange("facilities", e.target.value)}
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Información de Contacto</label>
        <Textarea
          placeholder="Email, teléfono, o cualquier información adicional de contacto..."
          value={formData.contactInfo}
          onChange={(e) => handleInputChange("contactInfo", e.target.value)}
          rows={2}
        />
      </div>
    </div>
  );

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-6 w-6 text-purple-600" />
          Crear Nuevo Evento
        </CardTitle>
        
        {/* Progress Steps */}
        <div className="flex items-center justify-between mt-4">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step <= currentStep 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {step < currentStep ? <CheckCircle className="h-4 w-4" /> : step}
              </div>
              {step < 4 && (
                <div className={`w-16 h-1 mx-2 ${
                  step < currentStep ? 'bg-purple-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
        
        <div className="text-sm text-gray-600 mt-2">
          {currentStep === 1 && "Información Básica"}
          {currentStep === 2 && "Fecha, Hora y Ubicación"}
          {currentStep === 3 && "Detalles Adicionales"}
          {currentStep === 4 && "Información Complementaria"}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}
        
        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6 border-t">
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            
            {currentStep > 1 && (
              <Button 
                variant="outline" 
                onClick={() => setCurrentStep(currentStep - 1)}
                disabled={isSubmitting}
              >
                Anterior
              </Button>
            )}
          </div>
          
          <div className="flex gap-2">
            {currentStep < 4 ? (
              <Button 
                onClick={() => setCurrentStep(currentStep + 1)}
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                disabled={isSubmitting}
              >
                Siguiente
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Creando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Crear Evento
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}