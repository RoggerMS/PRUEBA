'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Save, X, Trophy, Award } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BadgeOption {
  id: string;
  name: string;
  icon: string;
  rarity: string;
}

interface AchievementData {
  id?: string;
  name: string;
  description: string;
  type: string;
  targetValue: number;
  xpReward: number;
  crolarsReward: number;
  badgeId?: string;
  isActive: boolean;
}

interface AchievementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (achievement: AchievementData) => Promise<void>;
  achievement?: AchievementData | null;
  mode: 'create' | 'edit';
  badges?: BadgeOption[];
}

const ACHIEVEMENT_TYPES = [
  { value: 'post_count', label: 'Cantidad de Posts', description: 'Crear X cantidad de posts' },
  { value: 'like_count', label: 'Cantidad de Likes', description: 'Recibir X cantidad de likes' },
  { value: 'comment_count', label: 'Cantidad de Comentarios', description: 'Hacer X cantidad de comentarios' },
  { value: 'follower_count', label: 'Cantidad de Seguidores', description: 'Obtener X cantidad de seguidores' },
  { value: 'following_count', label: 'Cantidad de Seguidos', description: 'Seguir a X cantidad de usuarios' },
  { value: 'streak_days', label: 'Días Consecutivos', description: 'Mantener racha de X días' },
  { value: 'level_reached', label: 'Nivel Alcanzado', description: 'Alcanzar el nivel X' },
  { value: 'xp_earned', label: 'XP Ganado', description: 'Ganar X cantidad de XP' },
  { value: 'crolars_earned', label: 'Crolars Ganados', description: 'Ganar X cantidad de Crolars' },
  { value: 'badges_earned', label: 'Badges Obtenidos', description: 'Obtener X cantidad de badges' },
  { value: 'profile_complete', label: 'Perfil Completo', description: 'Completar el perfil al X%' },
  { value: 'first_post', label: 'Primer Post', description: 'Crear el primer post' },
  { value: 'first_like', label: 'Primer Like', description: 'Dar el primer like' },
  { value: 'first_comment', label: 'Primer Comentario', description: 'Hacer el primer comentario' },
  { value: 'first_follower', label: 'Primer Seguidor', description: 'Obtener el primer seguidor' },
  { value: 'custom', label: 'Personalizado', description: 'Logro personalizado' }
];

export function AchievementModal({ isOpen, onClose, onSave, achievement, mode, badges = [] }: AchievementModalProps) {
  const [formData, setFormData] = useState<AchievementData>({
    name: '',
    description: '',
    type: 'post_count',
    targetValue: 1,
    xpReward: 10,
    crolarsReward: 5,
    badgeId: '',
    isActive: true
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Inicializar formulario cuando cambia el achievement
  useEffect(() => {
    if (achievement && mode === 'edit') {
      setFormData({
        id: achievement.id,
        name: achievement.name,
        description: achievement.description,
        type: achievement.type,
        targetValue: achievement.targetValue,
        xpReward: achievement.xpReward,
        crolarsReward: achievement.crolarsReward,
        badgeId: achievement.badgeId || '',
        isActive: achievement.isActive
      });
    } else {
      setFormData({
        name: '',
        description: '',
        type: 'post_count',
        targetValue: 1,
        xpReward: 10,
        crolarsReward: 5,
        badgeId: '',
        isActive: true
      });
    }
    setErrors({});
  }, [achievement, mode, isOpen]);

  // Validar formulario
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    } else if (formData.name.length < 3) {
      newErrors.name = 'El nombre debe tener al menos 3 caracteres';
    } else if (formData.name.length > 50) {
      newErrors.name = 'El nombre no puede exceder 50 caracteres';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es requerida';
    } else if (formData.description.length < 10) {
      newErrors.description = 'La descripción debe tener al menos 10 caracteres';
    } else if (formData.description.length > 200) {
      newErrors.description = 'La descripción no puede exceder 200 caracteres';
    }

    if (!formData.type) {
      newErrors.type = 'El tipo es requerido';
    }

    if (formData.targetValue <= 0) {
      newErrors.targetValue = 'El valor objetivo debe ser mayor a 0';
    } else if (formData.targetValue > 1000000) {
      newErrors.targetValue = 'El valor objetivo no puede exceder 1,000,000';
    }

    if (formData.xpReward < 0) {
      newErrors.xpReward = 'La recompensa de XP no puede ser negativa';
    } else if (formData.xpReward > 10000) {
      newErrors.xpReward = 'La recompensa de XP no puede exceder 10,000';
    }

    if (formData.crolarsReward < 0) {
      newErrors.crolarsReward = 'La recompensa de Crolars no puede ser negativa';
    } else if (formData.crolarsReward > 10000) {
      newErrors.crolarsReward = 'La recompensa de Crolars no puede exceder 10,000';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const dataToSave = { ...formData };
      if (!dataToSave.badgeId) {
        delete dataToSave.badgeId;
      }
      await onSave(dataToSave);
      onClose();
    } catch (error) {
      console.error('Error saving achievement:', error);
      toast.error('Error al guardar el logro');
    } finally {
      setLoading(false);
    }
  };

  // Manejar cambios en el formulario
  const handleChange = (field: keyof AchievementData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Obtener información del tipo seleccionado
  const selectedType = ACHIEVEMENT_TYPES.find(type => type.value === formData.type);
  const selectedBadge = badges.find(badge => badge.id === formData.badgeId);

  // Auto-generar nombre y descripción basado en el tipo
  const handleTypeChange = (newType: string) => {
    const typeInfo = ACHIEVEMENT_TYPES.find(t => t.value === newType);
    if (typeInfo && (!formData.name || formData.name === selectedType?.label)) {
      handleChange('name', typeInfo.label);
    }
    if (typeInfo && (!formData.description || formData.description === selectedType?.description)) {
      handleChange('description', typeInfo.description);
    }
    handleChange('type', newType);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Trophy className="w-5 h-5" />
            <span>
              {mode === 'create' ? 'Crear Nuevo Logro' : 'Editar Logro'}
            </span>
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Crea un nuevo logro para el sistema de gamificación'
              : 'Modifica los detalles del logro seleccionado'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Vista previa del logro */}
          <div className="flex items-center justify-center p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Trophy className="w-8 h-8 text-purple-500" />
                {selectedBadge && (
                  <div className="flex items-center space-x-1">
                    <span className="text-2xl">{selectedBadge.icon}</span>
                    <Award className="w-4 h-4 text-yellow-500" />
                  </div>
                )}
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                {formData.name || 'Nombre del Logro'}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {formData.description || 'Descripción del logro'}
              </p>
              <div className="flex items-center justify-center space-x-2">
                <Badge variant="outline">
                  Meta: {formData.targetValue}
                </Badge>
                <Badge variant="secondary">
                  {formData.xpReward} XP
                </Badge>
                <Badge variant="secondary">
                  {formData.crolarsReward} Crolars
                </Badge>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nombre */}
            <div className="space-y-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Ej: Primer Post"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            {/* Tipo */}
            <div className="space-y-2">
              <Label htmlFor="type">Tipo de Logro *</Label>
              <Select 
                value={formData.type} 
                onValueChange={handleTypeChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  {ACHIEVEMENT_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      <div>
                        <div className="font-medium">{type.label}</div>
                        <div className="text-xs text-gray-500">{type.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-sm text-red-500">{errors.type}</p>
              )}
            </div>
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="description">Descripción *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Describe qué debe hacer el usuario para completar este logro..."
              rows={3}
              className={errors.description ? 'border-red-500' : ''}
            />
            <div className="flex justify-between text-sm text-gray-500">
              {errors.description && (
                <span className="text-red-500">{errors.description}</span>
              )}
              <span className="ml-auto">
                {formData.description.length}/200
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Valor objetivo */}
            <div className="space-y-2">
              <Label htmlFor="targetValue">Valor Objetivo *</Label>
              <Input
                id="targetValue"
                type="number"
                min="1"
                max="1000000"
                value={formData.targetValue}
                onChange={(e) => handleChange('targetValue', parseInt(e.target.value) || 1)}
                className={errors.targetValue ? 'border-red-500' : ''}
              />
              {errors.targetValue && (
                <p className="text-sm text-red-500">{errors.targetValue}</p>
              )}
            </div>

            {/* Recompensa XP */}
            <div className="space-y-2">
              <Label htmlFor="xpReward">Recompensa XP *</Label>
              <Input
                id="xpReward"
                type="number"
                min="0"
                max="10000"
                value={formData.xpReward}
                onChange={(e) => handleChange('xpReward', parseInt(e.target.value) || 0)}
                className={errors.xpReward ? 'border-red-500' : ''}
              />
              {errors.xpReward && (
                <p className="text-sm text-red-500">{errors.xpReward}</p>
              )}
            </div>

            {/* Recompensa Crolars */}
            <div className="space-y-2">
              <Label htmlFor="crolarsReward">Recompensa Crolars *</Label>
              <Input
                id="crolarsReward"
                type="number"
                min="0"
                max="10000"
                value={formData.crolarsReward}
                onChange={(e) => handleChange('crolarsReward', parseInt(e.target.value) || 0)}
                className={errors.crolarsReward ? 'border-red-500' : ''}
              />
              {errors.crolarsReward && (
                <p className="text-sm text-red-500">{errors.crolarsReward}</p>
              )}
            </div>
          </div>

          {/* Badge asociado */}
          <div className="space-y-2">
            <Label htmlFor="badgeId">Badge Asociado (Opcional)</Label>
            <Select 
              value={formData.badgeId || ''} 
              onValueChange={(value) => handleChange('badgeId', value || undefined)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar badge (opcional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Sin badge asociado</SelectItem>
                {badges.map(badge => (
                  <SelectItem key={badge.id} value={badge.id}>
                    <div className="flex items-center space-x-2">
                      <span>{badge.icon}</span>
                      <span>{badge.name}</span>
                      <Badge 
                        variant="outline" 
                        className={cn(
                          'text-xs',
                          badge.rarity === 'LEGENDARY' ? 'border-yellow-500 text-yellow-600' :
                          badge.rarity === 'EPIC' ? 'border-purple-500 text-purple-600' :
                          badge.rarity === 'RARE' ? 'border-blue-500 text-blue-600' : 
                          'border-gray-500 text-gray-600'
                        )}
                      >
                        {badge.rarity}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              Si seleccionas un badge, se otorgará automáticamente al completar este logro
            </p>
          </div>

          {/* Estado activo */}
          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => handleChange('isActive', checked)}
            />
            <Label htmlFor="isActive" className="text-sm">
              Logro activo (los usuarios pueden completarlo)
            </Label>
          </div>

          <DialogFooter className="flex space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Guardando...' : (mode === 'create' ? 'Crear Logro' : 'Guardar Cambios')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default AchievementModal;