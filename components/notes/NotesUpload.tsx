'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Upload, X, FileText, Image, Video, File, Plus } from 'lucide-react';

interface NotesUploadProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (noteData: any) => void;
}

const categories = [
  { value: 'matematicas', label: 'Matemáticas' },
  { value: 'fisica', label: 'Física' },
  { value: 'quimica', label: 'Química' },
  { value: 'biologia', label: 'Biología' },
  { value: 'historia', label: 'Historia' },
  { value: 'literatura', label: 'Literatura' },
  { value: 'idiomas', label: 'Idiomas' },
  { value: 'programacion', label: 'Programación' },
  { value: 'economia', label: 'Economía' },
  { value: 'derecho', label: 'Derecho' },
  { value: 'medicina', label: 'Medicina' },
  { value: 'ingenieria', label: 'Ingeniería' },
  { value: 'arte', label: 'Arte y Diseño' }
];

const careers = [
  { value: 'ingenieria-sistemas', label: 'Ingeniería de Sistemas' },
  { value: 'ingenieria-industrial', label: 'Ingeniería Industrial' },
  { value: 'medicina', label: 'Medicina' },
  { value: 'derecho', label: 'Derecho' },
  { value: 'administracion', label: 'Administración de Empresas' },
  { value: 'psicologia', label: 'Psicología' },
  { value: 'arquitectura', label: 'Arquitectura' },
  { value: 'contaduria', label: 'Contaduría Pública' },
  { value: 'comunicacion', label: 'Comunicación Social' },
  { value: 'economia', label: 'Economía' },
  { value: 'fisica', label: 'Física' },
  { value: 'quimica', label: 'Química' },
  { value: 'biologia', label: 'Biología' },
  { value: 'matematicas', label: 'Matemáticas' },
  { value: 'filosofia', label: 'Filosofía' },
  { value: 'historia', label: 'Historia' },
  { value: 'literatura', label: 'Literatura' },
  { value: 'arte', label: 'Artes Plásticas' },
  { value: 'musica', label: 'Música' }
];

const fileTypes = [
  { type: 'pdf', icon: FileText, label: 'PDF', accept: '.pdf' },
  { type: 'image', icon: Image, label: 'Imagen', accept: '.jpg,.jpeg,.png,.gif,.webp' },
  { type: 'video', icon: Video, label: 'Video', accept: '.mp4,.avi,.mov,.wmv' },
  { type: 'document', icon: File, label: 'Documento', accept: '.doc,.docx,.txt,.rtf' }
];

export function NotesUpload({ open, onClose, onSuccess }: NotesUploadProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    career: '',
    tags: [] as string[],
    price: '',
    isFree: true,
    files: [] as File[],
    allowComments: true,
    isPublic: true
  });
  const [currentTag, setCurrentTag] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const noteData = {
      ...formData,
      id: Date.now().toString(),
      author: {
        id: 'current-user',
        name: 'Usuario Actual',
        avatar: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20student%20avatar%20portrait&image_size=square'
      },
      rating: 0,
      downloads: 0,
      views: 0,
      createdAt: new Date().toISOString(),
      liked: false
    };
    
    onSuccess(noteData);
    onClose();
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      career: '',
      tags: [],
      price: '',
      isFree: true,
      files: [],
      allowComments: true,
      isPublic: true
    });
    setCurrentTag('');
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

  const handleFileUpload = (files: FileList | null) => {
    if (files) {
      const newFiles = Array.from(files);
      setFormData(prev => ({
        ...prev,
        files: [...prev.files, ...newFiles]
      }));
    }
  };

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }));
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const getFileIcon = (file: File) => {
    const fileType = fileTypes.find(type => {
      const extensions = type.accept.split(',').map(ext => ext.trim());
      return extensions.some(ext => file.name.toLowerCase().endsWith(ext.replace('.', '')));
    });
    return fileType?.icon || File;
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Subir Nuevos Apuntes
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Título de los apuntes"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="description">Descripción *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe el contenido de los apuntes"
                rows={3}
                required
              />
            </div>
          </div>

          {/* Category and Career */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Categoría *</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Carrera *</Label>
              <Select value={formData.career} onValueChange={(value) => setFormData(prev => ({ ...prev, career: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar carrera" />
                </SelectTrigger>
                <SelectContent>
                  {careers.map((career) => (
                    <SelectItem key={career.value} value={career.value}>
                      {career.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tags */}
          <div>
            <Label>Etiquetas</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                placeholder="Agregar etiqueta"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button type="button" onClick={addTag} variant="outline" size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                    {tag}
                    <X className="w-3 h-3 ml-1" />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* File Upload */}
          <div>
            <Label>Archivos *</Label>
            <Card 
              className={`border-2 border-dashed transition-colors ${
                dragActive ? 'border-purple-500 bg-purple-50' : 'border-gray-300'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <CardContent className="p-6 text-center">
                <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 mb-2">Arrastra archivos aquí o haz clic para seleccionar</p>
                <p className="text-sm text-gray-500 mb-4">Formatos soportados: PDF, imágenes, videos, documentos</p>
                <input
                  type="file"
                  multiple
                  onChange={(e) => handleFileUpload(e.target.files)}
                  className="hidden"
                  id="file-upload"
                  accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.mp4,.avi,.mov,.wmv,.doc,.docx,.txt,.rtf"
                />
                <Label htmlFor="file-upload" className="cursor-pointer">
                  <Button type="button" variant="outline" asChild>
                    <span>Seleccionar Archivos</span>
                  </Button>
                </Label>
              </CardContent>
            </Card>
            
            {formData.files.length > 0 && (
              <div className="mt-4 space-y-2">
                {formData.files.map((file, index) => {
                  const IconComponent = getFileIcon(file);
                  return (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        <IconComponent className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">{file.name}</span>
                        <span className="text-xs text-gray-500">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Pricing */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isFree"
                checked={formData.isFree}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isFree: !!checked, price: checked ? '' : prev.price }))}
              />
              <Label htmlFor="isFree">Apuntes gratuitos</Label>
            </div>
            
            {!formData.isFree && (
              <div>
                <Label htmlFor="price">Precio (COP)</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="0"
                  min="0"
                />
              </div>
            )}
          </div>

          {/* Settings */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="allowComments"
                checked={formData.allowComments}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, allowComments: !!checked }))}
              />
              <Label htmlFor="allowComments">Permitir comentarios</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isPublic"
                checked={formData.isPublic}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPublic: !!checked }))}
              />
              <Label htmlFor="isPublic">Hacer público</Label>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              disabled={!formData.title || !formData.description || !formData.category || !formData.career || formData.files.length === 0}
            >
              Subir Apuntes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}