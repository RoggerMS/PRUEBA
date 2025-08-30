"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  Trophy, 
  Calendar as CalendarIcon, 
  Clock, 
  Users, 
  Target, 
  Award, 
  Settings, 
  Eye, 
  Plus, 
  X, 
  Upload, 
  Info, 
  CheckCircle, 
  AlertCircle,
  Globe,
  Lock,
  Bell,
  UserCheck,
  Zap,
  Star
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface CreateCompetitionProps {
  onCancel?: () => void;
  onSubmit?: (competition: any) => void;
}

export function CreateCompetition({ onCancel, onSubmit }: CreateCompetitionProps) {
  const [activeTab, setActiveTab] = useState("basic");
  const [isPreview, setIsPreview] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    difficulty: "",
    type: "quiz",
    imageUrl: "",
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    startTime: "",
    endTime: "",
    duration: "",
    maxParticipants: "",
    prize: "",
    location: "",
    tags: [] as string[],
    requirements: "",
    rules: "",
    prizes: [
      { position: "1er Lugar", reward: "" },
      { position: "2do Lugar", reward: "" },
      { position: "3er Lugar", reward: "" }
    ],
    isPublic: true,
    allowRegistration: true,
    requireApproval: false,
    sendReminders: true,
    allowComments: true,
    showLeaderboard: true
  });

  const [newTag, setNewTag] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const categories = [
    { value: "matematicas", label: "Matemáticas" },
    { value: "programacion", label: "Programación" },
    { value: "ciencias", label: "Ciencias" },
    { value: "historia", label: "Historia" },
    { value: "idiomas", label: "Idiomas" },
    { value: "arte", label: "Arte y Cultura" },
    { value: "deportes", label: "Deportes" },
    { value: "tecnologia", label: "Tecnología" }
  ];

  const difficulties = [
    { value: "principiante", label: "Principiante" },
    { value: "intermedio", label: "Intermedio" },
    { value: "avanzado", label: "Avanzado" },
    { value: "experto", label: "Experto" }
  ];

  const competitionTypes = [
    { value: "quiz", label: "Quiz", icon: Target },
    { value: "tournament", label: "Torneo", icon: Trophy },
    { value: "challenge", label: "Desafío", icon: Zap },
    { value: "contest", label: "Concurso", icon: Award }
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const updatePrize = (index: number, reward: string) => {
    setFormData(prev => ({
      ...prev,
      prizes: prev.prizes.map((prize, i) => 
        i === index ? { ...prize, reward } : prize
      )
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "El título es requerido";
    }
    if (!formData.description.trim()) {
      newErrors.description = "La descripción es requerida";
    }
    if (!formData.category) {
      newErrors.category = "La categoría es requerida";
    }
    if (!formData.difficulty) {
      newErrors.difficulty = "La dificultad es requerida";
    }
    if (!formData.startDate) {
      newErrors.startDate = "La fecha de inicio es requerida";
    }
    if (!formData.endDate) {
      newErrors.endDate = "La fecha de fin es requerida";
    }
    if (formData.startDate && formData.endDate && formData.startDate >= formData.endDate) {
      newErrors.endDate = "La fecha de fin debe ser posterior a la de inicio";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit?.(formData);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'principiante': return 'bg-green-100 text-green-800';
      case 'intermedio': return 'bg-yellow-100 text-yellow-800';
      case 'avanzado': return 'bg-orange-100 text-orange-800';
      case 'experto': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isPreview) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Vista Previa</h2>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsPreview(false)}>
              <Settings className="h-4 w-4 mr-2" />
              Editar
            </Button>
            <Button onClick={handleSubmit} className="bg-purple-600 hover:bg-purple-700">
              <CheckCircle className="h-4 w-4 mr-2" />
              Crear Competencia
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex gap-6">
                <div className="w-32 h-32 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                  {formData.imageUrl ? (
                    <img src={formData.imageUrl} alt={formData.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Trophy className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{formData.title || "Título de la competencia"}</h3>
                      <p className="text-gray-600">{formData.description || "Descripción de la competencia"}</p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {formData.isPublic ? (
                        <Badge className="bg-green-100 text-green-800">
                          <Globe className="h-3 w-3 mr-1" />
                          Pública
                        </Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-800">
                          <Lock className="h-3 w-3 mr-1" />
                          Privada
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    {formData.category && (
                      <div className="flex items-center gap-1">
                        <Target className="h-4 w-4" />
                        <span>{categories.find(c => c.value === formData.category)?.label}</span>
                      </div>
                    )}
                    {formData.difficulty && (
                      <Badge className={getDifficultyColor(formData.difficulty)}>
                        {difficulties.find(d => d.value === formData.difficulty)?.label}
                      </Badge>
                    )}
                    {formData.startDate && formData.endDate && (
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="h-4 w-4" />
                        <span>
                          {format(formData.startDate, "dd MMM", { locale: es })} - {format(formData.endDate, "dd MMM yyyy", { locale: es })}
                        </span>
                      </div>
                    )}
                    {formData.maxParticipants && (
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>Máx. {formData.maxParticipants} participantes</span>
                      </div>
                    )}
                  </div>

                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Prize */}
              {formData.prize && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-yellow-600" />
                    <span className="font-semibold text-yellow-800">Premio: {formData.prize} Crolars</span>
                  </div>
                </div>
              )}

              {/* Additional Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {formData.requirements && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Requisitos</h4>
                    <p className="text-gray-600 text-sm">{formData.requirements}</p>
                  </div>
                )}
                
                {formData.rules && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Reglas</h4>
                    <p className="text-gray-600 text-sm">{formData.rules}</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Crear Nueva Competencia</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button variant="outline" onClick={() => setIsPreview(true)}>
            <Eye className="h-4 w-4 mr-2" />
            Vista Previa
          </Button>
          <Button onClick={handleSubmit} className="bg-purple-600 hover:bg-purple-700">
            <CheckCircle className="h-4 w-4 mr-2" />
            Crear Competencia
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Información Básica</TabsTrigger>
          <TabsTrigger value="schedule">Fecha y Ubicación</TabsTrigger>
          <TabsTrigger value="details">Detalles Adicionales</TabsTrigger>
          <TabsTrigger value="settings">Configuración</TabsTrigger>
        </TabsList>

        {/* Basic Information */}
        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Información Básica
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    placeholder="Ej: Desafío Matemático Supremo"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    className={errors.title ? "border-red-500" : ""}
                  />
                  {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Categoría *</Label>
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
                  {errors.category && <p className="text-red-500 text-sm">{errors.category}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe tu competencia, objetivos y qué pueden esperar los participantes..."
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  rows={4}
                  className={errors.description ? "border-red-500" : ""}
                />
                {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="difficulty">Dificultad *</Label>
                  <Select value={formData.difficulty} onValueChange={(value) => handleInputChange("difficulty", value)}>
                    <SelectTrigger className={errors.difficulty ? "border-red-500" : ""}>
                      <SelectValue placeholder="Selecciona la dificultad" />
                    </SelectTrigger>
                    <SelectContent>
                      {difficulties.map(difficulty => (
                        <SelectItem key={difficulty.value} value={difficulty.value}>
                          {difficulty.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.difficulty && <p className="text-red-500 text-sm">{errors.difficulty}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Tipo de Competencia</Label>
                  <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona el tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {competitionTypes.map(type => {
                        const Icon = type.icon;
                        return (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4" />
                              {type.label}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="imageUrl">URL de Imagen</Label>
                <Input
                  id="imageUrl"
                  placeholder="https://ejemplo.com/imagen.jpg"
                  value={formData.imageUrl}
                  onChange={(e) => handleInputChange("imageUrl", e.target.value)}
                />
                <p className="text-sm text-gray-500">Opcional: URL de una imagen representativa para tu competencia</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Schedule and Location */}
        <TabsContent value="schedule" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Fecha y Ubicación
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Fecha de Inicio *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button 
                        variant="outline" 
                        className={`w-full justify-start text-left font-normal ${errors.startDate ? "border-red-500" : ""}`}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.startDate ? format(formData.startDate, "PPP", { locale: es }) : "Selecciona fecha"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.startDate}
                        onSelect={(date) => handleInputChange("startDate", date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  {errors.startDate && <p className="text-red-500 text-sm">{errors.startDate}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Fecha de Fin *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button 
                        variant="outline" 
                        className={`w-full justify-start text-left font-normal ${errors.endDate ? "border-red-500" : ""}`}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.endDate ? format(formData.endDate, "PPP", { locale: es }) : "Selecciona fecha"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.endDate}
                        onSelect={(date) => handleInputChange("endDate", date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  {errors.endDate && <p className="text-red-500 text-sm">{errors.endDate}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="startTime">Hora de Inicio</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => handleInputChange("startTime", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endTime">Hora de Fin</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => handleInputChange("endTime", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duración (minutos)</Label>
                  <Input
                    id="duration"
                    type="number"
                    placeholder="60"
                    value={formData.duration}
                    onChange={(e) => handleInputChange("duration", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="maxParticipants">Máximo de Participantes</Label>
                  <Input
                    id="maxParticipants"
                    type="number"
                    placeholder="100"
                    value={formData.maxParticipants}
                    onChange={(e) => handleInputChange("maxParticipants", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prize">Premio (Crolars)</Label>
                  <Input
                    id="prize"
                    type="number"
                    placeholder="500"
                    value={formData.prize}
                    onChange={(e) => handleInputChange("prize", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Ubicación</Label>
                <Input
                  id="location"
                  placeholder="Ej: Aula Virtual, Campus Principal, etc."
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Additional Details */}
        <TabsContent value="details" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Detalles Adicionales
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Etiquetas</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Agregar etiqueta"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  />
                  <Button type="button" onClick={addTag} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <button onClick={() => removeTag(tag)} className="ml-1">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="requirements">Requisitos</Label>
                <Textarea
                  id="requirements"
                  placeholder="Describe los requisitos para participar..."
                  value={formData.requirements}
                  onChange={(e) => handleInputChange("requirements", e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rules">Reglas</Label>
                <Textarea
                  id="rules"
                  placeholder="Describe las reglas de la competencia..."
                  value={formData.rules}
                  onChange={(e) => handleInputChange("rules", e.target.value)}
                  rows={4}
                />
              </div>

              <div className="space-y-4">
                <Label>Premios por Posición</Label>
                {formData.prizes.map((prize, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-24">
                      <Badge variant="outline">{prize.position}</Badge>
                    </div>
                    <Input
                      placeholder="Ej: 500 Crolars, Certificado, etc."
                      value={prize.reward}
                      onChange={(e) => updatePrize(index, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configuración
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Competencia Pública
                    </Label>
                    <p className="text-sm text-gray-500">
                      Permite que cualquier usuario pueda ver y unirse a la competencia
                    </p>
                  </div>
                  <Switch
                    checked={formData.isPublic}
                    onCheckedChange={(checked) => handleInputChange("isPublic", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Permitir Registro
                    </Label>
                    <p className="text-sm text-gray-500">
                      Los usuarios pueden registrarse automáticamente
                    </p>
                  </div>
                  <Switch
                    checked={formData.allowRegistration}
                    onCheckedChange={(checked) => handleInputChange("allowRegistration", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="flex items-center gap-2">
                      <UserCheck className="h-4 w-4" />
                      Requiere Aprobación
                    </Label>
                    <p className="text-sm text-gray-500">
                      Los registros deben ser aprobados manualmente
                    </p>
                  </div>
                  <Switch
                    checked={formData.requireApproval}
                    onCheckedChange={(checked) => handleInputChange("requireApproval", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="flex items-center gap-2">
                      <Bell className="h-4 w-4" />
                      Enviar Recordatorios
                    </Label>
                    <p className="text-sm text-gray-500">
                      Notificar a los participantes sobre fechas importantes
                    </p>
                  </div>
                  <Switch
                    checked={formData.sendReminders}
                    onCheckedChange={(checked) => handleInputChange("sendReminders", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Permitir Comentarios</Label>
                    <p className="text-sm text-gray-500">
                      Los participantes pueden comentar en la competencia
                    </p>
                  </div>
                  <Switch
                    checked={formData.allowComments}
                    onCheckedChange={(checked) => handleInputChange("allowComments", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Mostrar Tabla de Posiciones</Label>
                    <p className="text-sm text-gray-500">
                      Mostrar el ranking en tiempo real durante la competencia
                    </p>
                  </div>
                  <Switch
                    checked={formData.showLeaderboard}
                    onCheckedChange={(checked) => handleInputChange("showLeaderboard", checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}