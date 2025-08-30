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
import { Save, X, Award } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BadgeData {
  id?: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  category: string;
  isActive: boolean;
}

interface BadgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (badge: BadgeData) => Promise<void>;
  badge?: BadgeData | null;
  mode: 'create' | 'edit';
}

const RARITY_OPTIONS = [
  { value: 'COMMON', label: 'Común', color: 'bg-gray-500' },
  { value: 'RARE', label: 'Raro', color: 'bg-blue-500' },
  { value: 'EPIC', label: 'Épico', color: 'bg-purple-500' },
  { value: 'LEGENDARY', label: 'Legendario', color: 'bg-yellow-500' }
];

const CATEGORY_OPTIONS = [
  'Social',
  'Contenido',
  'Participación',
  'Logros',
  'Tiempo',
  'Especial',
  'Evento',
  'Habilidad'
];

const ICON_OPTIONS = [
  '🏆', '🥇', '🥈', '🥉', '🎖️', '🏅', '⭐', '🌟',
  '💎', '👑', '🔥', '⚡', '🎯', '🎪', '🎨', '🎭',
  '🚀', '💫', '🌈', '🦄', '🎊', '🎉', '💝', '🎁',
  '📚', '✍️', '💬', '👥', '❤️', '👍', '🔔', '📈'
];

export function BadgeModal({ isOpen, onClose, onSave, badge, mode }: BadgeModalProps) {
  const [formData, setFormData] = useState<BadgeData>({
    name: '',
    description: '',
    icon: '🏆',
    rarity: 'COMMON',
    category: 'Social',
    isActive: true
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Inicializar formulario cuando cambia el badge
  useEffect(() => {
    if (badge && mode === 'edit') {
      setFormData({
        id: badge.id,
        name: badge.name,
        description: badge.description,
        icon: badge.icon,
        rarity: badge.rarity,
        category: badge.category,
        isActive: badge.isActive
      });
    } else {
      setFormData({
        name: '',
        description: '',
        icon: '🏆',
        rarity: 'COMMON',
        category: 'Social',
        isActive: true
      });
    }
    setErrors({});
  }, [badge, mode, isOpen]);

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

    if (!formData.icon) {
      newErrors.icon = 'El icono es requerido';
    }

    if (!formData.category.trim()) {
      newErrors.category = 'La categoría es requerida';
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
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving badge:', error);
      toast.error('Error al guardar el badge');
    } finally {
      setLoading(false);
    }
  };

  // Manejar cambios en el formulario
  const handleChange = (field: keyof BadgeData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Obtener color de rareza
  const getRarityColor = (rarity: string) => {
    const option = RARITY_OPTIONS.find(opt => opt.value === rarity);
    return option?.color || 'bg-gray-500';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Award className="w-5 h-5" />
            <span>
              {mode === 'create' ? 'Crear Nuevo Badge' : 'Editar Badge'}
            </span>
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Crea un nuevo badge para el sistema de gamificación'
              : 'Modifica los detalles del badge seleccionado'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Vista previa del badge */}
          <div className="flex items-center justify-center p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="text-center">
              <div className="text-4xl mb-2">{formData.icon}</div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                {formData.name || 'Nombre del Badge'}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {formData.description || 'Descripción del badge'}
              </p>
              <div className="flex items-center justify-center space-x-2">
                <Badge 
                  className={cn(
                    'text-white',
                    getRarityColor(formData.rarity)
                  )}
                >
                  {RARITY_OPTIONS.find(opt => opt.value === formData.rarity)?.label}
                </Badge>
                <Badge variant="outline">
                  {formData.category}
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

            {/* Categoría */}
            <div className="space-y-2">
              <Label htmlFor="category">Categoría *</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => handleChange('category', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-red-500">{errors.category}</p>
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
              placeholder="Describe qué debe hacer el usuario para obtener este badge..."
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Icono */}
            <div className="space-y-2">
              <Label htmlFor="icon">Icono *</Label>
              <div className="grid grid-cols-8 gap-2 p-3 border rounded-lg max-h-32 overflow-y-auto">
                {ICON_OPTIONS.map(icon => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => handleChange('icon', icon)}
                    className={cn(
                      'p-2 text-xl rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors',
                      formData.icon === icon ? 'bg-blue-100 dark:bg-blue-900 ring-2 ring-blue-500' : ''
                    )}
                  >
                    {icon}
                  </button>
                ))}
              </div>
              {errors.icon && (
                <p className="text-sm text-red-500">{errors.icon}</p>
              )}
            </div>

            {/* Rareza */}
            <div className="space-y-2">
              <Label htmlFor="rarity">Rareza *</Label>
              <Select 
                value={formData.rarity} 
                onValueChange={(value) => handleChange('rarity', value as BadgeData['rarity'])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar rareza" />
                </SelectTrigger>
                <SelectContent>
                  {RARITY_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center space-x-2">
                        <div className={cn('w-3 h-3 rounded-full', option.color)} />
                        <span>{option.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Estado activo */}
          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => handleChange('isActive', checked)}
            />
            <Label htmlFor="isActive" className="text-sm">
              Badge activo (los usuarios pueden obtenerlo)
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
              {loading ? 'Guardando...' : (mode === 'create' ? 'Crear Badge' : 'Guardar Cambios')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default BadgeModal;