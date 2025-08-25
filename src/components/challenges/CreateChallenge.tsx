"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import { Label } from "@/src/components/ui/label";
import { Badge } from "@/src/components/ui/badge";
import { Switch } from "@/src/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { 
  X, 
  Plus, 
  Upload, 
  Calendar, 
  Clock, 
  Trophy, 
  Users, 
  Target, 
  BookOpen, 
  Brain, 
  Lightbulb, 
  Award, 
  Zap, 
  Star, 
  Image as ImageIcon, 
  FileText, 
  Save, 
  Eye, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  Coins, 
  Medal, 
  Crown
} from "lucide-react";

interface CreateChallengeProps {
  onClose: () => void;
  onSubmit: (challenge: any) => void;
}

export function CreateChallenge({ onClose, onSubmit }: CreateChallengeProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Form data
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    difficulty: "",
    type: "daily" as 'daily' | 'weekly' | 'special' | 'community',
    points: 100,
    timeLimit: 30,
    startDate: "",
    endDate: "",
    featured: false,
    maxParticipants: 0, // 0 = unlimited
    requiresApproval: false,
    allowLateSubmissions: false,
    image: ""
  });
  
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  
  const [questions, setQuestions] = useState<Array<{
    id: string;
    type: 'multiple-choice' | 'true-false' | 'short-answer' | 'essay';
    question: string;
    options?: string[];
    correctAnswer?: string;
    points: number;
    explanation?: string;
  }>>([]);
  
  const [rewards, setRewards] = useState({
    crolars: 50,
    xp: 100,
    badges: [] as string[]
  });
  
  const [requirements, setRequirements] = useState<string[]>([]);
  const [newRequirement, setNewRequirement] = useState("");
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const categories = [
    { value: "matematicas", label: "Matemáticas", icon: "📊" },
    { value: "historia", label: "Historia", icon: "📚" },
    { value: "fisica", label: "Física", icon: "⚛️" },
    { value: "quimica", label: "Química", icon: "🧪" },
    { value: "biologia", label: "Biología", icon: "🧬" },
    { value: "tecnologia", label: "Tecnología", icon: "💻" },
    { value: "arte", label: "Arte", icon: "🎨" },
    { value: "literatura", label: "Literatura", icon: "📖" },
    { value: "idiomas", label: "Idiomas", icon: "🌍" },
    { value: "musica", label: "Música", icon: "🎵" }
  ];

  const difficulties = [
    { value: "principiante", label: "Principiante", color: "bg-green-100 text-green-800" },
    { value: "intermedio", label: "Intermedio", color: "bg-yellow-100 text-yellow-800" },
    { value: "avanzado", label: "Avanzado", color: "bg-orange-100 text-orange-800" },
    { value: "experto", label: "Experto", color: "bg-red-100 text-red-800" }
  ];

  const challengeTypes = [
    { value: "daily", label: "Diario", description: "Desafío que se renueva cada día" },
    { value: "weekly", label: "Semanal", description: "Desafío que dura una semana" },
    { value: "special", label: "Especial", description: "Evento especial con duración personalizada" },
    { value: "community", label: "Comunitario", description: "Creado por la comunidad" }
  ];

  const questionTypes = [
    { value: "multiple-choice", label: "Opción Múltiple" },
    { value: "true-false", label: "Verdadero/Falso" },
    { value: "short-answer", label: "Respuesta Corta" },
    { value: "essay", label: "Ensayo" }
  ];

  const availableBadges = [
    "Primer Lugar", "Velocista", "Perfeccionista", "Innovador", 
    "Colaborador", "Mentor", "Explorador", "Estratega"
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags(prev => [...prev, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const addQuestion = () => {
    const newQuestion = {
      id: Date.now().toString(),
      type: 'multiple-choice' as const,
      question: "",
      options: ["", "", "", ""],
      correctAnswer: "",
      points: 10,
      explanation: ""
    };
    setQuestions(prev => [...prev, newQuestion]);
  };

  const updateQuestion = (id: string, field: string, value: any) => {
    setQuestions(prev => prev.map(q => 
      q.id === id ? { ...q, [field]: value } : q
    ));
  };

  const removeQuestion = (id: string) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
  };

  const addRequirement = () => {
    if (newRequirement.trim() && !requirements.includes(newRequirement.trim())) {
      setRequirements(prev => [...prev, newRequirement.trim()]);
      setNewRequirement("");
    }
  };

  const removeRequirement = (reqToRemove: string) => {
    setRequirements(prev => prev.filter(req => req !== reqToRemove));
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

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};
    
    switch (step) {
      case 1:
        if (!formData.title.trim()) newErrors.title = "El título es requerido";
        if (!formData.description.trim()) newErrors.description = "La descripción es requerida";
        if (!formData.category) newErrors.category = "La categoría es requerida";
        if (!formData.difficulty) newErrors.difficulty = "La dificultad es requerida";
        break;
      case 2:
        if (!formData.startDate) newErrors.startDate = "La fecha de inicio es requerida";
        if (formData.type !== 'daily' && !formData.endDate) {
          newErrors.endDate = "La fecha de fin es requerida para este tipo de desafío";
        }
        if (formData.endDate && formData.startDate && new Date(formData.endDate) <= new Date(formData.startDate)) {
          newErrors.endDate = "La fecha de fin debe ser posterior a la fecha de inicio";
        }
        if (formData.points < 1) newErrors.points = "Los puntos deben ser mayor a 0";
        break;
      case 3:
        if (questions.length === 0) {
          newErrors.questions = "Debe agregar al menos una pregunta";
        }
        break;
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
    if (!validateStep(4)) return;
    
    setIsSubmitting(true);
    
    try {
      const challengeData = {
        ...formData,
        tags,
        questions,
        rewards,
        requirements,
        image: imagePreview || formData.image,
        createdAt: new Date().toISOString(),
        status: 'pending' // Pending approval
      };
      
      await onSubmit(challengeData);
      onClose();
    } catch (error) {
      console.error('Error creating challenge:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Título del Desafío *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Ej: Desafío Matemático Diario"
                  className={errors.title ? "border-red-500" : ""}
                />
                {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title}</p>}
              </div>
              
              <div>
                <Label htmlFor="description">Descripción *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe el desafío y sus objetivos..."
                  rows={4}
                  className={errors.description ? "border-red-500" : ""}
                />
                {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description}</p>}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Categoría *</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                    <SelectTrigger className={errors.category ? "border-red-500" : ""}>
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category.value} value={category.value}>
                          <span className="flex items-center gap-2">
                            <span>{category.icon}</span>
                            {category.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && <p className="text-sm text-red-500 mt-1">{errors.category}</p>}
                </div>
                
                <div>
                  <Label>Dificultad *</Label>
                  <Select value={formData.difficulty} onValueChange={(value) => handleInputChange('difficulty', value)}>
                    <SelectTrigger className={errors.difficulty ? "border-red-500" : ""}>
                      <SelectValue placeholder="Selecciona la dificultad" />
                    </SelectTrigger>
                    <SelectContent>
                      {difficulties.map(difficulty => (
                        <SelectItem key={difficulty.value} value={difficulty.value}>
                          <Badge className={difficulty.color}>{difficulty.label}</Badge>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.difficulty && <p className="text-sm text-red-500 mt-1">{errors.difficulty}</p>}
                </div>
              </div>
              
              <div>
                <Label>Tipo de Desafío</Label>
                <Select value={formData.type} onValueChange={(value: any) => handleInputChange('type', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {challengeTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        <div>
                          <div className="font-medium">{type.label}</div>
                          <div className="text-sm text-gray-500">{type.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Etiquetas</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Agregar etiqueta"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" onClick={addTag} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => removeTag(tag)} />
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Fecha de Inicio *</Label>
                <Input
                  id="startDate"
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  className={errors.startDate ? "border-red-500" : ""}
                />
                {errors.startDate && <p className="text-sm text-red-500 mt-1">{errors.startDate}</p>}
              </div>
              
              {formData.type !== 'daily' && (
                <div>
                  <Label htmlFor="endDate">Fecha de Fin *</Label>
                  <Input
                    id="endDate"
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    className={errors.endDate ? "border-red-500" : ""}
                  />
                  {errors.endDate && <p className="text-sm text-red-500 mt-1">{errors.endDate}</p>}
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="points">Puntos Base *</Label>
                <Input
                  id="points"
                  type="number"
                  min="1"
                  value={formData.points}
                  onChange={(e) => handleInputChange('points', parseInt(e.target.value) || 0)}
                  className={errors.points ? "border-red-500" : ""}
                />
                {errors.points && <p className="text-sm text-red-500 mt-1">{errors.points}</p>}
              </div>
              
              <div>
                <Label htmlFor="timeLimit">Límite de Tiempo (minutos)</Label>
                <Input
                  id="timeLimit"
                  type="number"
                  min="0"
                  value={formData.timeLimit}
                  onChange={(e) => handleInputChange('timeLimit', parseInt(e.target.value) || 0)}
                  placeholder="0 = Sin límite"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="maxParticipants">Máximo de Participantes</Label>
              <Input
                id="maxParticipants"
                type="number"
                min="0"
                value={formData.maxParticipants}
                onChange={(e) => handleInputChange('maxParticipants', parseInt(e.target.value) || 0)}
                placeholder="0 = Ilimitado"
              />
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Desafío Destacado</Label>
                  <p className="text-sm text-gray-600">Aparecerá en la sección destacada</p>
                </div>
                <Switch
                  checked={formData.featured}
                  onCheckedChange={(checked) => handleInputChange('featured', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Requiere Aprobación</Label>
                  <p className="text-sm text-gray-600">Los participantes deben ser aprobados</p>
                </div>
                <Switch
                  checked={formData.requiresApproval}
                  onCheckedChange={(checked) => handleInputChange('requiresApproval', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Permitir Entregas Tardías</Label>
                  <p className="text-sm text-gray-600">Acepta respuestas después del límite</p>
                </div>
                <Switch
                  checked={formData.allowLateSubmissions}
                  onCheckedChange={(checked) => handleInputChange('allowLateSubmissions', checked)}
                />
              </div>
            </div>
            
            <div>
              <Label>Imagen del Desafío</Label>
              <div className="mt-2">
                {imagePreview ? (
                  <div className="relative">
                    <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setImagePreview(null);
                        setImageFile(null);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">Sube una imagen para el desafío</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <Button type="button" variant="outline" onClick={() => document.getElementById('image-upload')?.click()}>
                      <Upload className="h-4 w-4 mr-2" />
                      Seleccionar Imagen
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
        
      case 3:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Preguntas del Desafío</h3>
                <p className="text-sm text-gray-600">Agrega las preguntas que formarán parte del desafío</p>
              </div>
              <Button onClick={addQuestion} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Agregar Pregunta
              </Button>
            </div>
            
            {errors.questions && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <p className="text-sm text-red-600">{errors.questions}</p>
                </div>
              </div>
            )}
            
            <div className="space-y-4">
              {questions.map((question, index) => (
                <Card key={question.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Pregunta {index + 1}</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeQuestion(question.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Tipo de Pregunta</Label>
                      <Select 
                        value={question.type} 
                        onValueChange={(value: any) => updateQuestion(question.id, 'type', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {questionTypes.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Pregunta</Label>
                      <Textarea
                        value={question.question}
                        onChange={(e) => updateQuestion(question.id, 'question', e.target.value)}
                        placeholder="Escribe la pregunta..."
                        rows={2}
                      />
                    </div>
                    
                    {(question.type === 'multiple-choice' || question.type === 'true-false') && (
                      <div>
                        <Label>Opciones</Label>
                        <div className="space-y-2">
                          {question.type === 'true-false' ? (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  name={`correct-${question.id}`}
                                  checked={question.correctAnswer === 'true'}
                                  onChange={() => updateQuestion(question.id, 'correctAnswer', 'true')}
                                />
                                <span>Verdadero</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  name={`correct-${question.id}`}
                                  checked={question.correctAnswer === 'false'}
                                  onChange={() => updateQuestion(question.id, 'correctAnswer', 'false')}
                                />
                                <span>Falso</span>
                              </div>
                            </div>
                          ) : (
                            question.options?.map((option, optionIndex) => (
                              <div key={optionIndex} className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  name={`correct-${question.id}`}
                                  checked={question.correctAnswer === option}
                                  onChange={() => updateQuestion(question.id, 'correctAnswer', option)}
                                />
                                <Input
                                  value={option}
                                  onChange={(e) => {
                                    const newOptions = [...(question.options || [])];
                                    newOptions[optionIndex] = e.target.value;
                                    updateQuestion(question.id, 'options', newOptions);
                                  }}
                                  placeholder={`Opción ${optionIndex + 1}`}
                                />
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Puntos</Label>
                        <Input
                          type="number"
                          min="1"
                          value={question.points}
                          onChange={(e) => updateQuestion(question.id, 'points', parseInt(e.target.value) || 1)}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label>Explicación (Opcional)</Label>
                      <Textarea
                        value={question.explanation || ""}
                        onChange={(e) => updateQuestion(question.id, 'explanation', e.target.value)}
                        placeholder="Explica la respuesta correcta..."
                        rows={2}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {questions.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No hay preguntas</h3>
                  <p className="text-gray-600 mb-4">Agrega preguntas para crear el desafío</p>
                  <Button onClick={addQuestion}>
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Primera Pregunta
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        );
        
      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Recompensas y Configuración Final</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <Label htmlFor="crolars">Crolars</Label>
                  <div className="flex items-center gap-2">
                    <Coins className="h-4 w-4 text-yellow-500" />
                    <Input
                      id="crolars"
                      type="number"
                      min="0"
                      value={rewards.crolars}
                      onChange={(e) => setRewards(prev => ({ ...prev, crolars: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="xp">Puntos de Experiencia</Label>
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-blue-500" />
                    <Input
                      id="xp"
                      type="number"
                      min="0"
                      value={rewards.xp}
                      onChange={(e) => setRewards(prev => ({ ...prev, xp: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                </div>
                
                <div>
                  <Label>Insignias Especiales</Label>
                  <Select onValueChange={(value) => {
                    if (!rewards.badges.includes(value)) {
                      setRewards(prev => ({ ...prev, badges: [...prev.badges, value] }));
                    }
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Agregar insignia" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableBadges.map(badge => (
                        <SelectItem key={badge} value={badge}>
                          <div className="flex items-center gap-2">
                            <Medal className="h-4 w-4" />
                            {badge}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <div className="flex flex-wrap gap-2 mt-2">
                    {rewards.badges.map(badge => (
                      <Badge key={badge} variant="secondary" className="flex items-center gap-1">
                        <Medal className="h-3 w-3" />
                        {badge}
                        <X 
                          className="h-3 w-3 cursor-pointer" 
                          onClick={() => setRewards(prev => ({ 
                            ...prev, 
                            badges: prev.badges.filter(b => b !== badge) 
                          }))}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <Label>Requisitos (Opcional)</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={newRequirement}
                  onChange={(e) => setNewRequirement(e.target.value)}
                  placeholder="Agregar requisito"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
                />
                <Button type="button" onClick={addRequirement} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2">
                {requirements.map(req => (
                  <div key={req} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <span className="text-sm">{req}</span>
                    <X className="h-4 w-4 cursor-pointer text-gray-500" onClick={() => removeRequirement(req)} />
                  </div>
                ))}
              </div>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Vista Previa del Desafío
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium">{formData.title || "Título del desafío"}</h4>
                    <p className="text-sm text-gray-600">{formData.description || "Descripción del desafío"}</p>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <Badge>{categories.find(c => c.value === formData.category)?.label || "Categoría"}</Badge>
                    <Badge className={difficulties.find(d => d.value === formData.difficulty)?.color}>
                      {difficulties.find(d => d.value === formData.difficulty)?.label || "Dificultad"}
                    </Badge>
                    <Badge variant="outline">{formData.points} puntos</Badge>
                    {formData.timeLimit > 0 && (
                      <Badge variant="outline">{formData.timeLimit} min</Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      {questions.length} preguntas
                    </span>
                    <span className="flex items-center gap-1">
                      <Coins className="h-4 w-4" />
                      {rewards.crolars} Crolars
                    </span>
                    <span className="flex items-center gap-1">
                      <Zap className="h-4 w-4" />
                      {rewards.xp} XP
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
        
      default:
        return null;
    }
  };

  const steps = [
    { number: 1, title: "Información Básica", icon: Info },
    { number: 2, title: "Configuración", icon: Calendar },
    { number: 3, title: "Preguntas", icon: FileText },
    { number: 4, title: "Recompensas", icon: Trophy }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Crear Nuevo Desafío</h2>
            <p className="text-sm text-gray-600">Paso {currentStep} de {steps.length}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Progress Steps */}
        <div className="px-6 py-4 border-b bg-gray-50">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;
              
              return (
                <div key={step.number} className="flex items-center">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                    isCompleted ? 'bg-green-500 text-white' :
                    isActive ? 'bg-blue-500 text-white' :
                    'bg-gray-200 text-gray-600'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <Icon className="h-4 w-4" />
                    )}
                  </div>
                  <div className="ml-2 hidden sm:block">
                    <p className={`text-sm font-medium ${
                      isActive ? 'text-blue-600' : 'text-gray-600'
                    }`}>
                      {step.title}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-12 h-0.5 mx-4 ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {renderStepContent()}
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <Button 
            variant="outline" 
            onClick={prevStep} 
            disabled={currentStep === 1}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Anterior
          </Button>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            
            {currentStep < steps.length ? (
              <Button onClick={nextStep} className="flex items-center gap-2">
                Siguiente
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit} 
                disabled={isSubmitting}
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    Creando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Crear Desafío
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}