"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { 
  Trophy, 
  Calendar, 
  Clock, 
  Users, 
  Target, 
  Award, 
  Upload, 
  X, 
  Plus, 
  Save, 
  Eye, 
  AlertCircle, 
  CheckCircle, 
  Image as ImageIcon, 
  FileText, 
  Settings, 
  Globe, 
  Lock, 
  Star, 
  Zap, 
  BookOpen, 
  Lightbulb, 
  Flag
} from "lucide-react";

interface Challenge {
  id: string;
  title: string;
  description: string;
  points: number;
  timeLimit?: number;
  difficulty: string;
}

interface Prize {
  id: string;
  position: number;
  description: string;
  value: string;
  type: 'crolars' | 'certificate' | 'badge' | 'physical';
}

interface Requirement {
  id: string;
  description: string;
  type: 'prerequisite' | 'equipment' | 'skill';
}

export function CreateCompetition() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Form data
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    difficulty: "",
    type: "",
    maxParticipants: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    registrationDeadline: "",
    privacy: "public",
    featured: false,
    allowTeams: false,
    maxTeamSize: "1",
    autoGrading: false,
    liveLeaderboard: true,
    allowLateSubmission: false,
    rules: "",
    judgingCriteria: "",
    additionalInfo: ""
  });
  
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [requirements, setRequirements] = useState<Requirement[]>([]);

  const categories = [
    { value: "matemáticas", label: "Matemáticas" },
    { value: "programación", label: "Programación" },
    { value: "ciencias", label: "Ciencias" },
    { value: "historia", label: "Historia" },
    { value: "idiomas", label: "Idiomas" },
    { value: "arte", label: "Arte" },
    { value: "música", label: "Música" },
    { value: "literatura", label: "Literatura" }
  ];

  const difficulties = [
    { value: "principiante", label: "Principiante" },
    { value: "intermedio", label: "Intermedio" },
    { value: "avanzado", label: "Avanzado" },
    { value: "experto", label: "Experto" }
  ];

  const competitionTypes = [
    { value: "quiz", label: "Quiz" },
    { value: "programming", label: "Programación" },
    { value: "essay", label: "Ensayo" },
    { value: "project", label: "Proyecto" },
    { value: "presentation", label: "Presentación" },
    { value: "debate", label: "Debate" },
    { value: "hackathon", label: "Hackathon" },
    { value: "olympiad", label: "Olimpiada" }
  ];

  const steps = [
    { number: 1, title: "Información Básica", description: "Título, descripción y categoría" },
    { number: 2, title: "Configuración", description: "Fechas, participantes y reglas" },
    { number: 3, title: "Desafíos y Premios", description: "Contenido y recompensas" },
    { number: 4, title: "Revisión", description: "Confirmar y publicar" }
  ];

  const handleInputChange = (field: string, value: string | boolean | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
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

  const addChallenge = () => {
    const newChallenge: Challenge = {
      id: Date.now().toString(),
      title: "",
      description: "",
      points: 100,
      difficulty: "intermedio"
    };
    setChallenges([...challenges, newChallenge]);
  };

  const updateChallenge = (id: string, field: string, value: string | number) => {
    setChallenges(challenges.map(challenge => 
      challenge.id === id ? { ...challenge, [field]: value } : challenge
    ));
  };

  const removeChallenge = (id: string) => {
    setChallenges(challenges.filter(challenge => challenge.id !== id));
  };

  const addPrize = () => {
    const newPrize: Prize = {
      id: Date.now().toString(),
      position: prizes.length + 1,
      description: "",
      value: "",
      type: "crolars"
    };
    setPrizes([...prizes, newPrize]);
  };

  const updatePrize = (id: string, field: string, value: string | number) => {
    setPrizes(prizes.map(prize => 
      prize.id === id ? { ...prize, [field]: value } : prize
    ));
  };

  const removePrize = (id: string) => {
    setPrizes(prizes.filter(prize => prize.id !== id));
  };

  const addRequirement = () => {
    const newRequirement: Requirement = {
      id: Date.now().toString(),
      description: "",
      type: "prerequisite"
    };
    setRequirements([...requirements, newRequirement]);
  };

  const updateRequirement = (id: string, field: string, value: string) => {
    setRequirements(requirements.map(req => 
      req.id === id ? { ...req, [field]: value } : req
    ));
  };

  const removeRequirement = (id: string) => {
    setRequirements(requirements.filter(req => req.id !== id));
  };

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};
    
    if (step === 1) {
      if (!formData.title.trim()) newErrors.title = "El título es requerido";
      if (!formData.description.trim()) newErrors.description = "La descripción es requerida";
      if (!formData.category) newErrors.category = "La categoría es requerida";
      if (!formData.difficulty) newErrors.difficulty = "La dificultad es requerida";
      if (!formData.type) newErrors.type = "El tipo de competencia es requerido";
    }
    
    if (step === 2) {
      if (!formData.startDate) newErrors.startDate = "La fecha de inicio es requerida";
      if (!formData.startTime) newErrors.startTime = "La hora de inicio es requerida";
      if (!formData.endDate) newErrors.endDate = "La fecha de fin es requerida";
      if (!formData.endTime) newErrors.endTime = "La hora de fin es requerida";
      if (!formData.maxParticipants) newErrors.maxParticipants = "El número máximo de participantes es requerido";
      
      // Validate dates
      const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
      const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);
      const now = new Date();
      
      if (startDateTime <= now) {
        newErrors.startDate = "La fecha de inicio debe ser futura";
      }
      
      if (endDateTime <= startDateTime) {
        newErrors.endDate = "La fecha de fin debe ser posterior al inicio";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;
    
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Reset form
      setFormData({
        title: "",
        description: "",
        category: "",
        difficulty: "",
        type: "",
        maxParticipants: "",
        startDate: "",
        startTime: "",
        endDate: "",
        endTime: "",
        registrationDeadline: "",
        privacy: "public",
        featured: false,
        allowTeams: false,
        maxTeamSize: "1",
        autoGrading: false,
        liveLeaderboard: true,
        allowLateSubmission: false,
        rules: "",
        judgingCriteria: "",
        additionalInfo: ""
      });
      setImage(null);
      setImagePreview("");
      setTags([]);
      setChallenges([]);
      setPrizes([]);
      setRequirements([]);
      setCurrentStep(1);
      
      alert("¡Competencia creada exitosamente!");
    } catch (error) {
      alert("Error al crear la competencia. Inténtalo de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Título de la Competencia *
          </label>
          <Input
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="Ej: Olimpiada de Matemáticas 2024"
            className={errors.title ? 'border-red-500' : ''}
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title}</p>
          )}
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descripción *
          </label>
          <Textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Describe los objetivos y contenido de la competencia..."
            rows={4}
            className={errors.description ? 'border-red-500' : ''}
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">{errors.description}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Categoría *
          </label>
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
            <p className="text-red-500 text-sm mt-1">{errors.category}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Dificultad *
          </label>
          <Select value={formData.difficulty} onValueChange={(value) => handleInputChange('difficulty', value)}>
            <SelectTrigger className={errors.difficulty ? 'border-red-500' : ''}>
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
          {errors.difficulty && (
            <p className="text-red-500 text-sm mt-1">{errors.difficulty}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Competencia *
          </label>
          <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
            <SelectTrigger className={errors.type ? 'border-red-500' : ''}>
              <SelectValue placeholder="Selecciona el tipo" />
            </SelectTrigger>
            <SelectContent>
              {competitionTypes.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.type && (
            <p className="text-red-500 text-sm mt-1">{errors.type}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Máximo de Participantes *
          </label>
          <Input
            type="number"
            value={formData.maxParticipants}
            onChange={(e) => handleInputChange('maxParticipants', e.target.value)}
            placeholder="100"
            min="1"
            className={errors.maxParticipants ? 'border-red-500' : ''}
          />
          {errors.maxParticipants && (
            <p className="text-red-500 text-sm mt-1">{errors.maxParticipants}</p>
          )}
        </div>
      </div>
      
      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Imagen de la Competencia
        </label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
          {imagePreview ? (
            <div className="relative">
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="max-h-48 mx-auto rounded-lg"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => {
                  setImage(null);
                  setImagePreview("");
                }}
              >
                <X className="h-4 w-4 mr-2" />
                Remover
              </Button>
            </div>
          ) : (
            <div>
              <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">Sube una imagen para la competencia</p>
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
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Etiquetas
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {tags.map(tag => (
            <Badge key={tag} variant="outline" className="flex items-center gap-1">
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="text-gray-500 hover:text-red-500"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="Agregar etiqueta..."
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
          />
          <Button type="button" onClick={addTag} variant="outline">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fecha de Inicio *
          </label>
          <Input
            type="date"
            value={formData.startDate}
            onChange={(e) => handleInputChange('startDate', e.target.value)}
            className={errors.startDate ? 'border-red-500' : ''}
          />
          {errors.startDate && (
            <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hora de Inicio *
          </label>
          <Input
            type="time"
            value={formData.startTime}
            onChange={(e) => handleInputChange('startTime', e.target.value)}
            className={errors.startTime ? 'border-red-500' : ''}
          />
          {errors.startTime && (
            <p className="text-red-500 text-sm mt-1">{errors.startTime}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fecha de Fin *
          </label>
          <Input
            type="date"
            value={formData.endDate}
            onChange={(e) => handleInputChange('endDate', e.target.value)}
            className={errors.endDate ? 'border-red-500' : ''}
          />
          {errors.endDate && (
            <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hora de Fin *
          </label>
          <Input
            type="time"
            value={formData.endTime}
            onChange={(e) => handleInputChange('endTime', e.target.value)}
            className={errors.endTime ? 'border-red-500' : ''}
          />
          {errors.endTime && (
            <p className="text-red-500 text-sm mt-1">{errors.endTime}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fecha Límite de Registro
          </label>
          <Input
            type="datetime-local"
            value={formData.registrationDeadline}
            onChange={(e) => handleInputChange('registrationDeadline', e.target.value)}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Privacidad
          </label>
          <Select value={formData.privacy} onValueChange={(value) => handleInputChange('privacy', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="public">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Pública
                </div>
              </SelectItem>
              <SelectItem value="private">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Privada
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Configuration Options */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Configuración Avanzada</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={formData.allowTeams}
              onChange={(e) => handleInputChange('allowTeams', e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm font-medium text-gray-700">Permitir equipos</span>
          </label>
          
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={formData.autoGrading}
              onChange={(e) => handleInputChange('autoGrading', e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm font-medium text-gray-700">Calificación automática</span>
          </label>
          
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={formData.liveLeaderboard}
              onChange={(e) => handleInputChange('liveLeaderboard', e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm font-medium text-gray-700">Tabla de posiciones en vivo</span>
          </label>
          
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={formData.allowLateSubmission}
              onChange={(e) => handleInputChange('allowLateSubmission', e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm font-medium text-gray-700">Permitir entregas tardías</span>
          </label>
        </div>
        
        {formData.allowTeams && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tamaño máximo del equipo
            </label>
            <Input
              type="number"
              value={formData.maxTeamSize}
              onChange={(e) => handleInputChange('maxTeamSize', e.target.value)}
              min="2"
              max="10"
            />
          </div>
        )}
      </div>
      
      {/* Rules and Criteria */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reglas de la Competencia
          </label>
          <Textarea
            value={formData.rules}
            onChange={(e) => handleInputChange('rules', e.target.value)}
            placeholder="Describe las reglas y normas de la competencia..."
            rows={4}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Criterios de Evaluación
          </label>
          <Textarea
            value={formData.judgingCriteria}
            onChange={(e) => handleInputChange('judgingCriteria', e.target.value)}
            placeholder="Explica cómo se evaluarán las participaciones..."
            rows={4}
          />
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      {/* Challenges */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Desafíos</h3>
          <Button type="button" onClick={addChallenge} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Agregar Desafío
          </Button>
        </div>
        
        <div className="space-y-4">
          {challenges.map((challenge) => (
            <Card key={challenge.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 space-y-4">
                    <Input
                      value={challenge.title}
                      onChange={(e) => updateChallenge(challenge.id, 'title', e.target.value)}
                      placeholder="Título del desafío"
                    />
                    <Textarea
                      value={challenge.description}
                      onChange={(e) => updateChallenge(challenge.id, 'description', e.target.value)}
                      placeholder="Descripción del desafío"
                      rows={3}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        type="number"
                        value={challenge.points}
                        onChange={(e) => updateChallenge(challenge.id, 'points', parseInt(e.target.value))}
                        placeholder="Puntos"
                      />
                      <Input
                        type="number"
                        value={challenge.timeLimit || ''}
                        onChange={(e) => updateChallenge(challenge.id, 'timeLimit', parseInt(e.target.value))}
                        placeholder="Tiempo límite (min)"
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeChallenge(challenge.id)}
                    className="ml-4"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      {/* Prizes */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Premios</h3>
          <Button type="button" onClick={addPrize} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Agregar Premio
          </Button>
        </div>
        
        <div className="space-y-4">
          {prizes.map((prize) => (
            <Card key={prize.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Input
                      type="number"
                      value={prize.position}
                      onChange={(e) => updatePrize(prize.id, 'position', parseInt(e.target.value))}
                      placeholder="Posición"
                      min="1"
                    />
                    <Input
                      value={prize.description}
                      onChange={(e) => updatePrize(prize.id, 'description', e.target.value)}
                      placeholder="Descripción del premio"
                    />
                    <Input
                      value={prize.value}
                      onChange={(e) => updatePrize(prize.id, 'value', e.target.value)}
                      placeholder="Valor (ej: 500 Crolars)"
                    />
                    <Select 
                      value={prize.type} 
                      onValueChange={(value) => updatePrize(prize.id, 'type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="crolars">Crolars</SelectItem>
                        <SelectItem value="certificate">Certificado</SelectItem>
                        <SelectItem value="badge">Insignia</SelectItem>
                        <SelectItem value="physical">Premio Físico</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removePrize(prize.id)}
                    className="ml-4"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      {/* Requirements */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Requisitos</h3>
          <Button type="button" onClick={addRequirement} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Agregar Requisito
          </Button>
        </div>
        
        <div className="space-y-4">
          {requirements.map((requirement) => (
            <Card key={requirement.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      value={requirement.description}
                      onChange={(e) => updateRequirement(requirement.id, 'description', e.target.value)}
                      placeholder="Descripción del requisito"
                    />
                    <Select 
                      value={requirement.type} 
                      onValueChange={(value) => updateRequirement(requirement.id, 'type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="prerequisite">Prerrequisito</SelectItem>
                        <SelectItem value="equipment">Equipo</SelectItem>
                        <SelectItem value="skill">Habilidad</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeRequirement(requirement.id)}
                    className="ml-4"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      {/* Additional Information */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Información Adicional
        </label>
        <Textarea
          value={formData.additionalInfo}
          onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
          placeholder="Cualquier información adicional relevante..."
          rows={4}
        />
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-blue-800 mb-2">
          <Eye className="h-5 w-5" />
          <h3 className="font-semibold">Vista Previa de la Competencia</h3>
        </div>
        <p className="text-blue-700 text-sm">
          Revisa todos los detalles antes de publicar tu competencia.
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl">{formData.title}</CardTitle>
              <p className="text-gray-600 mt-2">{formData.description}</p>
            </div>
            {imagePreview && (
              <img 
                src={imagePreview} 
                alt="Competition" 
                className="w-24 h-24 object-cover rounded-lg"
              />
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Detalles Básicos</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Categoría:</span>
                    <Badge>{categories.find(c => c.value === formData.category)?.label}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Dificultad:</span>
                    <Badge>{difficulties.find(d => d.value === formData.difficulty)?.label}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tipo:</span>
                    <Badge>{competitionTypes.find(t => t.value === formData.type)?.label}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Participantes:</span>
                    <span>{formData.maxParticipants}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Fechas</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Inicio:</span>
                    <span>{formData.startDate} {formData.startTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fin:</span>
                    <span>{formData.endDate} {formData.endTime}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Configuración</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Privacidad:</span>
                    <Badge variant={formData.privacy === 'public' ? 'default' : 'secondary'}>
                      {formData.privacy === 'public' ? 'Pública' : 'Privada'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Equipos:</span>
                    <span>{formData.allowTeams ? 'Permitidos' : 'No permitidos'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Calificación:</span>
                    <span>{formData.autoGrading ? 'Automática' : 'Manual'}</span>
                  </div>
                </div>
              </div>
              
              {tags.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Etiquetas</h4>
                  <div className="flex flex-wrap gap-1">
                    {tags.map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {(challenges.length > 0 || prizes.length > 0) && (
            <div className="mt-6 pt-6 border-t">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {challenges.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Desafíos ({challenges.length})</h4>
                    <div className="space-y-2">
                      {challenges.slice(0, 3).map(challenge => (
                        <div key={challenge.id} className="text-sm p-2 bg-gray-50 rounded">
                          <div className="font-medium">{challenge.title}</div>
                          <div className="text-gray-600">{challenge.points} puntos</div>
                        </div>
                      ))}
                      {challenges.length > 3 && (
                        <div className="text-sm text-gray-500">+{challenges.length - 3} más...</div>
                      )}
                    </div>
                  </div>
                )}
                
                {prizes.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Premios ({prizes.length})</h4>
                    <div className="space-y-2">
                      {prizes.slice(0, 3).map(prize => (
                        <div key={prize.id} className="text-sm p-2 bg-gray-50 rounded">
                          <div className="font-medium">#{prize.position} - {prize.description}</div>
                          <div className="text-gray-600">{prize.value}</div>
                        </div>
                      ))}
                      {prizes.length > 3 && (
                        <div className="text-sm text-gray-500">+{prizes.length - 3} más...</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Crear Nueva Competencia</h2>
        <p className="text-gray-600 mt-2">Organiza una competencia académica para la comunidad</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center space-x-4 mb-8">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
              currentStep >= step.number
                ? 'bg-purple-500 border-purple-500 text-white'
                : 'border-gray-300 text-gray-500'
            }`}>
              {currentStep > step.number ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                step.number
              )}
            </div>
            
            {index < steps.length - 1 && (
              <div className={`w-16 h-0.5 mx-2 ${
                currentStep > step.number ? 'bg-purple-500' : 'bg-gray-300'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm font-bold">
              {currentStep}
            </div>
            {steps[currentStep - 1].title}
          </CardTitle>
          <p className="text-gray-600">{steps[currentStep - 1].description}</p>
        </CardHeader>
        <CardContent>
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 1}
        >
          Anterior
        </Button>
        
        <div className="flex gap-2">
          {currentStep < 4 ? (
            <Button
              onClick={nextStep}
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
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
                  Crear Competencia
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}