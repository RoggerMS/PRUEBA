'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { Upload, X, Plus, Zap, DollarSign, Tag, Image as ImageIcon } from 'lucide-react';
import { ImageUpload } from '@/components/ui/image-upload';
import { crolarsToSoles, solesToCrolars } from '@/shared/constants/currency';

interface SellProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (productData: any) => void;
}

export default function SellProductModal({ isOpen, onClose, onSubmit }: SellProductModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    priceInSoles: '',
    category: '',
    subcategory: '',
    tags: [] as string[],
    images: [] as File[],
    stock: '1'
  });
  
  const [currentTag, setCurrentTag] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const categories = [
    'Materiales de Estudio',
    'Libros y Referencias',
    'Software y Herramientas',
    'Servicios Académicos',
    'Equipos y Suministros'
  ];

  const subcategories: Record<string, string[]> = {
    'Materiales de Estudio': ['Apuntes', 'Resúmenes', 'Ejercicios', 'Exámenes', 'Guías de Estudio'],
    'Libros y Referencias': ['Libros de Texto', 'Manuales', 'Diccionarios', 'Enciclopedias'],
    'Software y Herramientas': ['Software Educativo', 'Aplicaciones', 'Plantillas', 'Códigos'],
    'Servicios Académicos': ['Tutorías', 'Asesorías', 'Corrección de Textos', 'Traducciones'],
    'Equipos y Suministros': ['Calculadoras', 'Material de Laboratorio', 'Instrumentos', 'Suministros']
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // Auto-convert prices
    if (field === 'price' && value) {
      const crolars = parseFloat(value);
      if (!isNaN(crolars)) {
        const soles = crolarsToSoles(crolars);
        setFormData(prev => ({ ...prev, priceInSoles: soles.toFixed(2) }));
      }
    } else if (field === 'priceInSoles' && value) {
      const soles = parseFloat(value);
      if (!isNaN(soles)) {
        const crolars = solesToCrolars(soles);
        setFormData(prev => ({ ...prev, price: crolars.toString() }));
      }
    }
  };

  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleImagesChange = (images: File[]) => {
    setFormData(prev => ({ ...prev, images }));
    if (errors.images) {
      setErrors(prev => ({ ...prev, images: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'El nombre es requerido';
    if (!formData.description.trim()) newErrors.description = 'La descripción es requerida';
    if (!formData.price || parseFloat(formData.price) <= 0) newErrors.price = 'El precio debe ser mayor a 0';
    if (!formData.priceInSoles || parseFloat(formData.priceInSoles) <= 0) newErrors.priceInSoles = 'El precio en soles debe ser mayor a 0';
    if (!formData.category) newErrors.category = 'La categoría es requerida';
    if (!formData.subcategory) newErrors.subcategory = 'La subcategoría es requerida';
    if (formData.tags.length === 0) newErrors.tags = 'Agrega al menos una etiqueta';
    if (formData.images.length === 0) newErrors.images = 'Agrega al menos una imagen';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // Create FormData for file upload
      const formDataToSend = new FormData();
      
      // Add basic product data
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('priceInSoles', formData.priceInSoles);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('subcategory', formData.subcategory);
      formDataToSend.append('stock', formData.stock);
      formDataToSend.append('tags', JSON.stringify(formData.tags));
      
      // Add image files
      formData.images.forEach((file, index) => {
        formDataToSend.append('images', file);
      });

      // Send to API
      const response = await fetch('/api/marketplace/products', {
        method: 'POST',
        body: formDataToSend
      });

      if (!response.ok) {
        throw new Error('Failed to create product');
      }

      const result = await response.json();
      
      if (onSubmit) {
        await onSubmit(result.data);
      }
      
      toast.success('Producto creado exitosamente');
      handleClose();
    } catch (error) {
      toast.error('Error al crear el producto');
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      priceInSoles: '',
      category: '',
      subcategory: '',
      tags: [],
      images: [],
      stock: '1'
    });
    setCurrentTag('');

    setErrors({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-purple-600" />
            Vender Producto
          </DialogTitle>
          <DialogDescription>
            Completa la información de tu producto para ponerlo a la venta en el marketplace.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información básica */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nombre del Producto *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Ej: Resumen de Cálculo Diferencial"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
            </div>

            <div>
              <Label htmlFor="description">Descripción *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe tu producto, qué incluye y por qué es útil..."
                rows={4}
                className={errors.description ? 'border-red-500' : ''}
              />
              {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description}</p>}
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Precio (Crolars) *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm font-medium">₡</span>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="1"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', e.target.value)}
                      placeholder="5000"
                      className={`pl-10 ${errors.price ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.price && <p className="text-sm text-red-500 mt-1">{errors.price}</p>}
                </div>

                <div>
                  <Label htmlFor="priceInSoles">Precio (Soles Peruanos) *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm font-medium">S/</span>
                    <Input
                      id="priceInSoles"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.priceInSoles}
                      onChange={(e) => handleInputChange('priceInSoles', e.target.value)}
                      placeholder="5.00"
                      className={`pl-10 ${errors.priceInSoles ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.priceInSoles && <p className="text-sm text-red-500 mt-1">{errors.priceInSoles}</p>}
                </div>
              </div>
              <div className="text-sm text-gray-500 bg-blue-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-800">Conversión Automática</span>
                </div>
                <p>1,000 Crolars = 1 Sol Peruano. Los precios se convierten automáticamente.</p>
              </div>
            </div>

            <div>
              <Label htmlFor="stock">Stock Disponible</Label>
              <Input
                id="stock"
                type="number"
                min="1"
                value={formData.stock}
                onChange={(e) => handleInputChange('stock', e.target.value)}
                placeholder="1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Categoría *</Label>
                <Select value={formData.category} onValueChange={(value) => {
                  handleInputChange('category', value);
                  handleInputChange('subcategory', ''); // Reset subcategory when category changes
                }}>
                  <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && <p className="text-sm text-red-500 mt-1">{errors.category}</p>}
              </div>

              <div>
                <Label htmlFor="subcategory">Subcategoría *</Label>
                <Select 
                  value={formData.subcategory} 
                  onValueChange={(value) => handleInputChange('subcategory', value)}
                  disabled={!formData.category}
                >
                  <SelectTrigger className={errors.subcategory ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Selecciona una subcategoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {formData.category && subcategories[formData.category]?.map(subcategory => (
                      <SelectItem key={subcategory} value={subcategory}>
                        {subcategory}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.subcategory && <p className="text-sm text-red-500 mt-1">{errors.subcategory}</p>}
              </div>
            </div>
          </div>

          {/* Etiquetas */}
          <div>
            <Label>Etiquetas *</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                placeholder="Agregar etiqueta"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button type="button" onClick={addTag} size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 hover:text-red-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
            {errors.tags && <p className="text-sm text-red-500 mt-1">{errors.tags}</p>}
          </div>

          {/* Imágenes */}
          <div>
            <Label>Imágenes del Producto *</Label>
            <ImageUpload
              images={formData.images}
              onImagesChange={handleImagesChange}
              maxImages={5}
              maxSizeInMB={5}
              className="mt-2"
            />
            {errors.images && <p className="text-sm text-red-500 mt-1">{errors.images}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-purple-600 hover:bg-purple-700">
              {isSubmitting ? 'Creando...' : 'Crear Producto'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}