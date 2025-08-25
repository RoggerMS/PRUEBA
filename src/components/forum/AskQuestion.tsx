'use client';

import { useState } from 'react';
import { gamificationService } from '@/services/gamificationService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Plus, 
  X, 
  HelpCircle, 
  BookOpen, 
  GraduationCap,
  Coins,
  AlertCircle
} from 'lucide-react';

interface AskQuestionProps {
  onSubmit: (questionData: any) => void;
  onCancel: () => void;
}

const subjects = [
  'Matemáticas', 'Física', 'Química', 'Biología', 
  'Historia', 'Literatura', 'Inglés', 'Cálculo',
  'Estadística', 'Programación', 'Filosofía', 'Arte'
];

const careers = [
  'Ingeniería', 'Medicina', 'Derecho', 'Administración', 
  'Psicología', 'Educación', 'Arquitectura', 'Economía',
  'Comunicación', 'Diseño', 'Enfermería', 'Contabilidad'
];

const suggestedTags = [
  'álgebra', 'geometría', 'cálculo', 'estadística',
  'física', 'química', 'biología', 'anatomía',
  'historia', 'literatura', 'gramática', 'vocabulario',
  'programación', 'algoritmos', 'bases de datos', 'web',
  'examen', 'tarea', 'proyecto', 'investigación'
];

export function AskQuestion({ onSubmit, onCancel }: AskQuestionProps) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    subject: '',
    career: '',
    tags: [] as string[],
    bounty: 0
  });
  const [newTag, setNewTag] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'El título es obligatorio';
    } else if (formData.title.length < 10) {
      newErrors.title = 'El título debe tener al menos 10 caracteres';
    }
    
    if (!formData.content.trim()) {
      newErrors.content = 'La descripción es obligatoria';
    } else if (formData.content.length < 20) {
      newErrors.content = 'La descripción debe tener al menos 20 caracteres';
    }
    
    if (!formData.subject) {
      newErrors.subject = 'Selecciona una materia';
    }
    
    if (!formData.career) {
      newErrors.career = 'Selecciona una carrera';
    }
    
    if (formData.tags.length === 0) {
      newErrors.tags = 'Agrega al menos una etiqueta';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        onSubmit(formData);
        
        // Grant XP for asking a question
        await gamificationService.grantXP(
          'current-user', // In real app, get from auth context
          20,
          'forum_question',
          Date.now().toString(),
          'Pregunta publicada en el foro'
        );
      } catch (error) {
        console.error('Error granting XP for question:', error);
        // Still proceed with question submission even if XP fails
      }
    }
  };

  const addTag = (tag: string) => {
    if (tag && !formData.tags.includes(tag) && formData.tags.length < 5) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            onClick={onCancel}
            className="p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Hacer una Pregunta
            </h1>
            <p className="text-gray-600 mt-1">
              Describe tu pregunta de manera clara y detallada
            </p>
          </div>
        </div>

        {/* Tips Card */}
        <Card className="mb-6 bg-blue-50/50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <HelpCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">Consejos para una buena pregunta:</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Sé específico y claro en tu título</li>
                  <li>• Explica el contexto y lo que has intentado</li>
                  <li>• Usa etiquetas relevantes para que otros puedan encontrar tu pregunta</li>
                  <li>• Revisa si tu pregunta ya fue respondida antes</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <Card className="bg-white/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-purple-600" />
                Detalles de la Pregunta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título de la pregunta *
                </label>
                <Input
                  placeholder="¿Cómo resolver...? ¿Cuál es la diferencia entre...?"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className={errors.title ? 'border-red-500' : ''}
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.title}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {formData.title.length}/100 caracteres
                </p>
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción detallada *
                </label>
                <Textarea
                  placeholder="Explica tu pregunta con el mayor detalle posible. Incluye lo que has intentado, el contexto del problema, y cualquier información relevante..."
                  value={formData.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  rows={6}
                  className={errors.content ? 'border-red-500' : ''}
                />
                {errors.content && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.content}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {formData.content.length}/1000 caracteres
                </p>
              </div>

              {/* Subject and Career */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Materia *
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => handleInputChange('subject', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md bg-white ${errors.subject ? 'border-red-500' : 'border-gray-300'}`}
                  >
                    <option value="">Selecciona una materia</option>
                    {subjects.map(subject => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                  {errors.subject && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.subject}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Carrera *
                  </label>
                  <select
                    value={formData.career}
                    onChange={(e) => handleInputChange('career', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md bg-white ${errors.career ? 'border-red-500' : 'border-gray-300'}`}
                  >
                    <option value="">Selecciona una carrera</option>
                    {careers.map(career => (
                      <option key={career} value={career}>{career}</option>
                    ))}
                  </select>
                  {errors.career && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.career}
                    </p>
                  )}
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Etiquetas * (máximo 5)
                </label>
                
                {/* Current Tags */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.tags.map((tag, index) => (
                    <Badge key={index} className="bg-purple-100 text-purple-800 border-purple-200">
                      #{tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-2 hover:text-purple-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>

                {/* Add Tag */}
                <div className="flex gap-2 mb-3">
                  <Input
                    placeholder="Agregar etiqueta"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag(newTag);
                      }
                    }}
                    disabled={formData.tags.length >= 5}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => addTag(newTag)}
                    disabled={!newTag || formData.tags.length >= 5}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {/* Suggested Tags */}
                <div>
                  <p className="text-sm text-gray-600 mb-2">Etiquetas sugeridas:</p>
                  <div className="flex flex-wrap gap-2">
                    {suggestedTags.filter(tag => !formData.tags.includes(tag)).slice(0, 8).map(tag => (
                      <Button
                        key={tag}
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => addTag(tag)}
                        disabled={formData.tags.length >= 5}
                        className="text-xs h-7 px-2 bg-gray-100 hover:bg-gray-200"
                      >
                        #{tag}
                      </Button>
                    ))}
                  </div>
                </div>
                
                {errors.tags && (
                  <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.tags}
                  </p>
                )}
              </div>

              {/* Bounty */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recompensa (Crolars) - Opcional
                </label>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    min="0"
                    max="500"
                    placeholder="0"
                    value={formData.bounty || ''}
                    onChange={(e) => handleInputChange('bounty', parseInt(e.target.value) || 0)}
                    className="w-32"
                  />
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Coins className="w-4 h-4 text-yellow-500" />
                    <span>Ofrecer Crolars para obtener mejores respuestas</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Los Crolars se otorgarán automáticamente cuando marques una respuesta como aceptada
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-4 mt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
            >
              Cancelar
            </Button>
            <Button 
              type="submit"
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              Publicar Pregunta
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}