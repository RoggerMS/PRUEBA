"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  HelpCircle, 
  Tag, 
  Star, 
  Eye, 
  Users, 
  AlertCircle,
  CheckCircle,
  X,
  Plus
} from "lucide-react";
import { toast } from "sonner";

interface AskQuestionProps {
  onSubmit: (question: any) => void;
  onCancel: () => void;
}

export function AskQuestion({ onSubmit, onCancel }: AskQuestionProps) {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    subject: "",
    career: "",
    tags: [] as string[],
    bounty: 0,
    isAnonymous: false,
    allowComments: true,
    notifyAnswers: true
  });
  
  const [currentTag, setCurrentTag] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const subjects = [
    "Matemáticas", "Física", "Química", "Biología", 
    "Historia", "Literatura", "Inglés", "Cálculo",
    "Programación", "Estadística", "Filosofía", "Economía"
  ];

  const careers = [
    "Ingeniería", "Medicina", "Derecho", "Administración",
    "Psicología", "Arquitectura", "Comunicación", "Educación",
    "Ciencias", "Arte", "Música", "Deportes"
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = "El título es obligatorio";
    } else if (formData.title.length < 10) {
      newErrors.title = "El título debe tener al menos 10 caracteres";
    }
    
    if (!formData.content.trim()) {
      newErrors.content = "La descripción es obligatoria";
    } else if (formData.content.length < 20) {
      newErrors.content = "La descripción debe tener al menos 20 caracteres";
    }
    
    if (!formData.subject) {
      newErrors.subject = "Selecciona una materia";
    }
    
    if (!formData.career) {
      newErrors.career = "Selecciona una carrera";
    }
    
    if (formData.tags.length === 0) {
      newErrors.tags = "Agrega al menos una etiqueta";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim()) && formData.tags.length < 5) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag("");
      if (errors.tags) {
        setErrors(prev => ({ ...prev, tags: "" }));
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Por favor corrige los errores en el formulario");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const questionData = {
        ...formData,
        id: Date.now().toString(),
        author: {
          id: "current-user",
          name: formData.isAnonymous ? "Usuario Anónimo" : "Usuario Actual",
          avatar: "/avatars/default.jpg",
          level: "Intermedio",
          points: 1250
        },
        votes: 0,
        answers: 0,
        views: 0,
        createdAt: new Date(),
        hasAcceptedAnswer: false
      };
      
      onSubmit(questionData);
      toast.success("¡Pregunta publicada exitosamente!");
    } catch (error) {
      toast.error("Error al publicar la pregunta");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="bg-white border border-gray-200">
        <CardHeader className="pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <HelpCircle className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Hacer una Pregunta
                </CardTitle>
                <p className="text-gray-600 mt-1">
                  Comparte tu duda con la comunidad y obtén ayuda de expertos
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium text-gray-700">
                Título de la pregunta *
              </Label>
              <Input
                id="title"
                placeholder="¿Cuál es tu pregunta? Sé específico y claro..."
                value={formData.title}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, title: e.target.value }));
                  if (errors.title) setErrors(prev => ({ ...prev, title: "" }));
                }}
                className={errors.title ? "border-red-300 focus:border-red-500" : ""}
              />
              {errors.title && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.title}
                </p>
              )}
              <p className="text-xs text-gray-500">
                {formData.title.length}/100 caracteres
              </p>
            </div>

            {/* Content */}
            <div className="space-y-2">
              <Label htmlFor="content" className="text-sm font-medium text-gray-700">
                Descripción detallada *
              </Label>
              <Textarea
                id="content"
                placeholder="Describe tu pregunta en detalle. Incluye el contexto, lo que has intentado y qué resultado esperas..."
                value={formData.content}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, content: e.target.value }));
                  if (errors.content) setErrors(prev => ({ ...prev, content: "" }));
                }}
                className={`min-h-[120px] ${errors.content ? "border-red-300 focus:border-red-500" : ""}`}
              />
              {errors.content && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.content}
                </p>
              )}
              <p className="text-xs text-gray-500">
                {formData.content.length}/1000 caracteres
              </p>
            </div>

            {/* Subject and Career */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Materia *
                </Label>
                <Select
                  value={formData.subject}
                  onValueChange={(value) => {
                    setFormData(prev => ({ ...prev, subject: value }));
                    if (errors.subject) setErrors(prev => ({ ...prev, subject: "" }));
                  }}
                >
                  <SelectTrigger className={errors.subject ? "border-red-300" : ""}>
                    <SelectValue placeholder="Selecciona una materia" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map(subject => (
                      <SelectItem key={subject} value={subject}>
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.subject && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.subject}
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Carrera *
                </Label>
                <Select
                  value={formData.career}
                  onValueChange={(value) => {
                    setFormData(prev => ({ ...prev, career: value }));
                    if (errors.career) setErrors(prev => ({ ...prev, career: "" }));
                  }}
                >
                  <SelectTrigger className={errors.career ? "border-red-300" : ""}>
                    <SelectValue placeholder="Selecciona una carrera" />
                  </SelectTrigger>
                  <SelectContent>
                    {careers.map(career => (
                      <SelectItem key={career} value={career}>
                        {career}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.career && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.career}
                  </p>
                )}
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Etiquetas * (máximo 5)
              </Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Agregar etiqueta..."
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddTag}
                  disabled={!currentTag.trim() || formData.tags.length >= 5}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      <Tag className="h-3 w-3" />
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 hover:text-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
              
              {errors.tags && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.tags}
                </p>
              )}
            </div>

            {/* Bounty */}
            <div className="space-y-2">
              <Label htmlFor="bounty" className="text-sm font-medium text-gray-700">
                Recompensa (Crolars)
              </Label>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <Input
                  id="bounty"
                  type="number"
                  min="0"
                  max="1000"
                  value={formData.bounty}
                  onChange={(e) => setFormData(prev => ({ ...prev, bounty: parseInt(e.target.value) || 0 }))}
                  className="w-32"
                />
                <span className="text-sm text-gray-600">
                  Ofrece Crolars para obtener respuestas más rápidas
                </span>
              </div>
            </div>

            <Separator />

            {/* Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Configuración</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-gray-500" />
                    <Label htmlFor="anonymous" className="text-sm font-medium">
                      Publicar como anónimo
                    </Label>
                  </div>
                  <Switch
                    id="anonymous"
                    checked={formData.isAnonymous}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isAnonymous: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <Label htmlFor="comments" className="text-sm font-medium">
                      Permitir comentarios
                    </Label>
                  </div>
                  <Switch
                    id="comments"
                    checked={formData.allowComments}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, allowComments: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-gray-500" />
                    <Label htmlFor="notifications" className="text-sm font-medium">
                      Notificar nuevas respuestas
                    </Label>
                  </div>
                  <Switch
                    id="notifications"
                    checked={formData.notifyAnswers}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, notifyAnswers: checked }))}
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isSubmitting ? "Publicando..." : "Publicar Pregunta"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}