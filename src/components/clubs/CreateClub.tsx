"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import { Badge } from "@/src/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { 
  Plus, 
  X, 
  Upload, 
  Users, 
  Lock, 
  Globe, 
  Tag, 
  Image as ImageIcon,
  AlertCircle,
  CheckCircle
} from "lucide-react";

interface CreateClubProps {
  onCancel: () => void;
  onSuccess: () => void;
}

const categories = [
  "Académico",
  "Tecnología", 
  "Arte",
  "Deportivo",
  "Extracurricular"
];

const subjects = {
  "Académico": ["Matemáticas", "Física", "Química", "Biología", "Historia", "Literatura", "Filosofía"],
  "Tecnología": ["Programación", "Inteligencia Artificial", "Robótica", "Diseño Web", "Ciberseguridad"],
  "Arte": ["Pintura", "Música", "Teatro", "Danza", "Fotografía", "Escritura Creativa"],
  "Deportivo": ["Fútbol", "Baloncesto", "Tenis", "Natación", "Atletismo", "Yoga"],
  "Extracurricular": ["Debate", "Voluntariado", "Emprendimiento", "Medio Ambiente", "Cultura"]
};

const levels = ["Principiante", "Intermedio", "Avanzado", "Experto"];

export function CreateClub({ onCancel, onSuccess }: CreateClubProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    subject: "",
    level: "",
    isPrivate: false,
    maxMembers: "",
    rules: "",
    objectives: ""
  });
  
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim()) && tags.length < 10) {
      setTags(prev => [...prev, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "El nombre del club es requerido";
    } else if (formData.name.length < 3) {
      newErrors.name = "El nombre debe tener al menos 3 caracteres";
    }

    if (!formData.description.trim()) {
      newErrors.description = "La descripción es requerida";
    } else if (formData.description.length < 20) {
      newErrors.description = "La descripción debe tener al menos 20 caracteres";
    }

    if (!formData.category) {
      newErrors.category = "Selecciona una categoría";
    }

    if (!formData.subject) {
      newErrors.subject = "Selecciona una materia";
    }

    if (!formData.level) {
      newErrors.level = "Selecciona un nivel";
    }

    if (formData.maxMembers && (parseInt(formData.maxMembers) < 2 || parseInt(formData.maxMembers) > 1000)) {
      newErrors.maxMembers = "El número de miembros debe estar entre 2 y 1000";
    }

    if (tags.length === 0) {
      newErrors.tags = "Agrega al menos una etiqueta";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Success
      onSuccess();
    } catch (error) {
      console.error("Error creating club:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableSubjects = formData.category ? subjects[formData.category as keyof typeof subjects] || [] : [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Crear Nuevo Club
          </CardTitle>
          <p className="text-gray-600">
            Crea un espacio para conectar con estudiantes que comparten tus intereses
          </p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Club *
                  </label>
                  <Input
                    placeholder="Ej: Club de Matemáticas Avanzadas"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción *
                  </label>
                  <Textarea
                    placeholder="Describe el propósito y actividades del club..."
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    className={`min-h-[120px] ${errors.description ? "border-red-500" : ""}`}
                  />
                  <div className="flex justify-between items-center mt-1">
                    {errors.description ? (
                      <p className="text-red-500 text-sm flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.description}
                      </p>
                    ) : (
                      <p className="text-gray-500 text-sm">
                        {formData.description.length}/500 caracteres
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Categoría *
                    </label>
                    <Select 
                      value={formData.category} 
                      onValueChange={(value) => {
                        handleInputChange("category", value);
                        handleInputChange("subject", ""); // Reset subject when category changes
                      }}
                    >
                      <SelectTrigger className={errors.category ? "border-red-500" : ""}>
                        <SelectValue placeholder="Seleccionar categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category} value={category}>
                            {category}
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Materia *
                    </label>
                    <Select 
                      value={formData.subject} 
                      onValueChange={(value) => handleInputChange("subject", value)}
                      disabled={!formData.category}
                    >
                      <SelectTrigger className={errors.subject ? "border-red-500" : ""}>
                        <SelectValue placeholder="Seleccionar materia" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableSubjects.map(subject => (
                          <SelectItem key={subject} value={subject}>
                            {subject}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.subject && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.subject}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nivel *
                    </label>
                    <Select value={formData.level} onValueChange={(value) => handleInputChange("level", value)}>
                      <SelectTrigger className={errors.level ? "border-red-500" : ""}>
                        <SelectValue placeholder="Seleccionar nivel" />
                      </SelectTrigger>
                      <SelectContent>
                        {levels.map(level => (
                          <SelectItem key={level} value={level}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.level && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.level}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Máximo de Miembros
                    </label>
                    <Input
                      type="number"
                      placeholder="Ej: 50 (opcional)"
                      value={formData.maxMembers}
                      onChange={(e) => handleInputChange("maxMembers", e.target.value)}
                      className={errors.maxMembers ? "border-red-500" : ""}
                      min="2"
                      max="1000"
                    />
                    {errors.maxMembers && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.maxMembers}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Image Upload */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Imagen del Club
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
                    {image ? (
                      <div className="relative">
                        <img 
                          src={image} 
                          alt="Preview" 
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="absolute top-2 right-2 bg-white/90"
                          onClick={() => setImage(null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div>
                        <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-2">Sube una imagen para tu club</p>
                        <p className="text-sm text-gray-500 mb-4">JPG, PNG o GIF (máx. 5MB)</p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="image-upload"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById('image-upload')?.click()}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Seleccionar Imagen
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Privacy Settings */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Configuración de Privacidad
                  </label>
                  <div className="space-y-3">
                    <div 
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                        !formData.isPrivate 
                          ? "border-purple-500 bg-purple-50" 
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => handleInputChange("isPrivate", false)}
                    >
                      <div className="flex items-center gap-3">
                        <Globe className="h-5 w-5 text-green-600" />
                        <div>
                          <div className="font-medium">Club Público</div>
                          <div className="text-sm text-gray-600">
                            Cualquiera puede unirse y ver el contenido
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div 
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                        formData.isPrivate 
                          ? "border-purple-500 bg-purple-50" 
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => handleInputChange("isPrivate", true)}
                    >
                      <div className="flex items-center gap-3">
                        <Lock className="h-5 w-5 text-orange-600" />
                        <div>
                          <div className="font-medium">Club Privado</div>
                          <div className="text-sm text-gray-600">
                            Requiere aprobación para unirse
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Etiquetas * (máximo 10)
              </label>
              <div className="flex gap-2 mb-3">
                <Input
                  placeholder="Agregar etiqueta..."
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="flex-1"
                />
                <Button 
                  type="button" 
                  onClick={addTag}
                  disabled={!newTag.trim() || tags.length >= 10}
                  variant="outline"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    <Tag className="h-3 w-3" />
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              
              {errors.tags && (
                <p className="text-red-500 text-sm flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.tags}
                </p>
              )}
            </div>

            {/* Additional Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reglas del Club
                </label>
                <Textarea
                  placeholder="Define las reglas y normas de comportamiento..."
                  value={formData.rules}
                  onChange={(e) => handleInputChange("rules", e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Objetivos del Club
                </label>
                <Textarea
                  placeholder="¿Qué esperas lograr con este club?"
                  value={formData.objectives}
                  onChange={(e) => handleInputChange("objectives", e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1"
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Creando Club...
                  </div>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Crear Club
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}