'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus, Target, Users, Trophy, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface CreateChallengeProps {
  onChallengeCreated?: (challenge: any) => void;
  onCancel?: () => void;
}

export default function CreateChallenge({ onChallengeCreated, onCancel }: CreateChallengeProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    difficulty: '',
    points: 100,
    maxProgress: 1,
    deadline: undefined as Date | undefined,
    isTeamChallenge: false,
    maxParticipants: 1,
    tags: [] as string[],
    requirements: ''
  });
  
  const [newTag, setNewTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    'Académico',
    'Programación',
    'Investigación',
    'Deportes',
    'Arte y Creatividad',
    'Voluntariado',
    'Networking',
    'Desarrollo Personal'
  ];

  const difficulties = [
    { value: 'Fácil', points: 50 },
    { value: 'Medio', points: 100 },
    { value: 'Difícil', points: 200 }
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDifficultyChange = (difficulty: string) => {
    const difficultyData = difficulties.find(d => d.value === difficulty);
    setFormData(prev => ({
      ...prev,
      difficulty,
      points: difficultyData?.points || 100
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simular creación del desafío
      const newChallenge = {
        id: Date.now().toString(),
        ...formData,
        status: 'draft',
        createdAt: new Date().toISOString(),
        participants: 0,
        type: formData.isTeamChallenge ? 'team' : 'individual'
      };

      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 1000));

      onChallengeCreated?.(newChallenge);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        category: '',
        difficulty: '',
        points: 100,
        maxProgress: 1,
        deadline: undefined,
        isTeamChallenge: false,
        maxParticipants: 1,
        tags: [],
        requirements: ''
      });
    } catch (error) {
      console.error('Error creating challenge:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = formData.title.trim() && 
                     formData.description.trim() && 
                     formData.category && 
                     formData.difficulty && 
                     formData.deadline;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Crear Nuevo Desafío
        </CardTitle>
        <CardDescription>
          Diseña un desafío para motivar a la comunidad estudiantil
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información Básica */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Título del Desafío *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Ej: Completar 10 ejercicios de matemáticas"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="description">Descripción *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe el desafío, objetivos y lo que los participantes deben hacer..."
                className="mt-1 min-h-[100px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Categoría *</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger className="mt-1">
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
              </div>

              <div>
                <Label htmlFor="difficulty">Dificultad *</Label>
                <Select value={formData.difficulty} onValueChange={handleDifficultyChange}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecciona dificultad" />
                  </SelectTrigger>
                  <SelectContent>
                    {difficulties.map((diff) => (
                      <SelectItem key={diff.value} value={diff.value}>
                        <div className="flex items-center justify-between w-full">
                          <span>{diff.value}</span>
                          <span className="text-sm text-gray-500 ml-2">{diff.points} pts</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Configuración del Desafío */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="points">Puntos de Recompensa</Label>
                <Input
                  id="points"
                  type="number"
                  min="10"
                  max="1000"
                  value={formData.points}
                  onChange={(e) => handleInputChange('points', parseInt(e.target.value) || 100)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="maxProgress">Meta/Objetivo Numérico</Label>
                <Input
                  id="maxProgress"
                  type="number"
                  min="1"
                  value={formData.maxProgress}
                  onChange={(e) => handleInputChange('maxProgress', parseInt(e.target.value) || 1)}
                  placeholder="Ej: 10 ejercicios, 3 artículos"
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label>Fecha Límite *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full mt-1 justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.deadline ? (
                      format(formData.deadline, 'PPP', { locale: es })
                    ) : (
                      <span>Selecciona una fecha</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.deadline}
                    onSelect={(date) => handleInputChange('deadline', date)}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Configuración de Equipo */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="team-challenge">Desafío de Equipo</Label>
                <p className="text-sm text-gray-500">Permite que múltiples personas trabajen juntas</p>
              </div>
              <Switch
                id="team-challenge"
                checked={formData.isTeamChallenge}
                onCheckedChange={(checked) => handleInputChange('isTeamChallenge', checked)}
              />
            </div>

            {formData.isTeamChallenge && (
              <div>
                <Label htmlFor="maxParticipants">Máximo de Participantes por Equipo</Label>
                <Input
                  id="maxParticipants"
                  type="number"
                  min="2"
                  max="10"
                  value={formData.maxParticipants}
                  onChange={(e) => handleInputChange('maxParticipants', parseInt(e.target.value) || 2)}
                  className="mt-1"
                />
              </div>
            )}
          </div>

          {/* Tags */}
          <div>
            <Label>Etiquetas</Label>
            <div className="flex gap-2 mt-1">
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
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                    {tag} ×
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Requisitos */}
          <div>
            <Label htmlFor="requirements">Requisitos Adicionales</Label>
            <Textarea
              id="requirements"
              value={formData.requirements}
              onChange={(e) => handleInputChange('requirements', e.target.value)}
              placeholder="Especifica cualquier requisito especial, materiales necesarios, etc."
              className="mt-1"
            />
          </div>

          {/* Preview */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Vista Previa</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                <span>{formData.title || 'Título del desafío'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                <span>{formData.points} puntos</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>{formData.isTeamChallenge ? `Equipo (máx. ${formData.maxParticipants})` : 'Individual'}</span>
              </div>
              {formData.deadline && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Hasta {format(formData.deadline, 'dd/MM/yyyy')}</span>
                </div>
              )}
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? 'Creando...' : 'Crear Desafío'}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}