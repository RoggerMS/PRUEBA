'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Upload, 
  X, 
  FileText, 
  Image, 
  File,
  AlertCircle,
  CheckCircle,
  Loader2,
  Globe,
  Users,
  Lock,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';
import { gamificationService } from '@/services/gamificationService';

interface NotesUploadProps {
  onClose: () => void;
  onSuccess: () => void;
}

interface UploadFile {
  file: File;
  preview?: string;
  type: 'pdf' | 'docx' | 'pptx' | 'xlsx' | 'image' | 'other';
}

const careers = [
  'Ingeniería de Sistemas',
  'Ingeniería Industrial',
  'Ingeniería Civil',
  'Medicina',
  'Derecho',
  'Administración',
  'Psicología',
  'Arquitectura',
  'Contabilidad',
  'Marketing',
  'Diseño Gráfico',
  'Comunicaciones',
  'Educación',
  'Enfermería',
  'Nutrición'
];

const categories = [
  'Matemáticas',
  'Programación',
  'Física',
  'Química',
  'Biología',
  'Historia',
  'Literatura',
  'Economía',
  'Psicología',
  'Ingeniería',
  'Medicina',
  'Derecho',
  'Administración',
  'Diseño',
  'Idiomas'
];

const getFileType = (file: File): UploadFile['type'] => {
  const extension = file.name.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'pdf':
      return 'pdf';
    case 'doc':
    case 'docx':
      return 'docx';
    case 'ppt':
    case 'pptx':
      return 'pptx';
    case 'xls':
    case 'xlsx':
      return 'xlsx';
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'webp':
      return 'image';
    default:
      return 'other';
  }
};

const getFileIcon = (type: UploadFile['type']) => {
  switch (type) {
    case 'pdf':
      return <FileText className="w-8 h-8 text-red-500" />;
    case 'docx':
      return <FileText className="w-8 h-8 text-blue-500" />;
    case 'pptx':
      return <FileText className="w-8 h-8 text-orange-500" />;
    case 'xlsx':
      return <FileText className="w-8 h-8 text-green-500" />;
    case 'image':
      return <Image className="w-8 h-8 text-purple-500" />;
    default:
      return <File className="w-8 h-8 text-gray-500" />;
  }
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export function NotesUpload({ onClose, onSuccess }: NotesUploadProps) {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCareer, setSelectedCareer] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [price, setPrice] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [publishToFeed, setPublishToFeed] = useState(false);
  const [feedVisibility, setFeedVisibility] = useState<'public' | 'followers' | 'private'>('public');

  const visibilityOptions = [
    {
      value: 'public' as const,
      label: 'Público',
      icon: <Globe className="w-4 h-4" />,
      description: 'Visible para todos los usuarios'
    },
    {
      value: 'followers' as const,
      label: 'Seguidores',
      icon: <Users className="w-4 h-4" />,
      description: 'Solo visible para tus seguidores'
    },
    {
      value: 'private' as const,
      label: 'Privado',
      icon: <Lock className="w-4 h-4" />,
      description: 'Solo visible para ti'
    }
  ];
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const newFiles: UploadFile[] = [];
    
    Array.from(selectedFiles).forEach(file => {
      // Validate file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        toast.error(`El archivo ${file.name} es demasiado grande (máximo 50MB)`);
        return;
      }

      const fileType = getFileType(file);
      const uploadFile: UploadFile = {
        file,
        type: fileType
      };

      // Generate preview for images
      if (fileType === 'image') {
        const reader = new FileReader();
        reader.onload = (e) => {
          uploadFile.preview = e.target?.result as string;
          setFiles(prev => [...prev]);
        };
        reader.readAsDataURL(file);
      }

      newFiles.push(uploadFile);
    });

    setFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags(prev => [...prev, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error('El título es requerido');
      return;
    }
    
    if (files.length === 0) {
      toast.error('Debes seleccionar al menos un archivo');
      return;
    }
    
    if (!selectedCareer) {
      toast.error('Selecciona una carrera');
      return;
    }
    
    if (!selectedCategory) {
      toast.error('Selecciona una categoría');
      return;
    }

    setIsUploading(true);
    
    try {
      // Simulate upload process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Grant XP for uploading notes
      try {
        await gamificationService.grantXP(
          'current-user-id', // This should be the actual user ID
          50, // XP amount for uploading notes
          'notes_upload',
          `note-${Date.now()}`, // Generate a unique note ID
          `Subió el apunte: ${title}`
        );
      } catch (xpError) {
        console.error('Error granting XP for note upload:', xpError);
      }
      
      // Si se va a publicar en el feed, crear el post
      if (publishToFeed) {
        const feedPost = {
          id: Date.now().toString(),
          type: 'note' as const,
          author: {
            id: '1',
            name: 'Usuario Actual',
            username: '@usuario',
            avatar: '/avatars/user.jpg',
            verified: true,
            career: selectedCareer || 'Carrera no especificada'
          },
          title,
          content: description,
          tags,
          createdAt: new Date().toISOString(),
          likes: 0,
          comments: 0,
          shares: 0,
          isLiked: false,
          isBookmarked: false,
          visibility: feedVisibility,
          publishToFeed: true
        };
        
        // Aquí se enviaría el post al feed
        // onPostCreated?.(feedPost);
        
        try {
          await gamificationService.grantXP(
            'current-user-id',
            25,
            'create_post',
            `post-${Date.now()}`,
            'Publicó un apunte en el feed'
          );
        } catch (xpError) {
          console.error('Error granting XP for post creation:', xpError);
        }
      }
      
      toast.success(publishToFeed ? 'Apunte subido y publicado en el feed exitosamente' : 'Apunte subido exitosamente');
      onSuccess();
    } catch (error) {
      toast.error('Error al subir el apunte');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Subir Nuevo Apunte</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* File Upload Area */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Archivos *
              </label>
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">
                  Haz clic para seleccionar archivos o arrastra y suelta
                </p>
                <p className="text-sm text-gray-500">
                  Soporta: PDF, Word, PowerPoint, Excel, Imágenes (máx. 50MB)
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.webp"
                  onChange={(e) => handleFileSelect(e.target.files)}
                  className="hidden"
                />
              </div>
            </div>

            {/* Selected Files */}
            {files.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Archivos seleccionados ({files.length})
                </label>
                <div className="space-y-2">
                  {files.map((uploadFile, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                      {uploadFile.preview ? (
                        <img 
                          src={uploadFile.preview} 
                          alt={uploadFile.file.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      ) : (
                        getFileIcon(uploadFile.type)
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{uploadFile.file.name}</p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(uploadFile.file.size)} • {uploadFile.type.toUpperCase()}
                        </p>
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
                  ))}
                </div>
              </div>
            )}

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título *
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Cálculo Diferencial - Límites y Continuidad"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe el contenido de tus apuntes..."
                rows={3}
              />
            </div>

            {/* Career and Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Carrera *
                </label>
                <Select value={selectedCareer} onValueChange={setSelectedCareer}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar carrera" />
                  </SelectTrigger>
                  <SelectContent>
                    {careers.map((career) => (
                      <SelectItem key={career} value={career}>
                        {career}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoría *
                </label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar categoría" />
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
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Etiquetas
              </label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Agregar etiqueta..."
                  className="flex-1"
                />
                <Button type="button" onClick={addTag} variant="outline">
                  Agregar
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Precio (Crolars)
              </label>
              <Input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0 (gratis)"
                min="0"
              />
              <p className="text-xs text-gray-500 mt-1">
                Deja en blanco o 0 para hacer el apunte gratuito
              </p>
            </div>

            {/* Feed Publication Options */}
            <div className="space-y-4 pt-6 border-t">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Eye className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Publicar en el feed</span>
                </div>
                <Button
                  variant={publishToFeed ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPublishToFeed(!publishToFeed)}
                >
                  {publishToFeed ? 'Sí' : 'No'}
                </Button>
              </div>

              {publishToFeed && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Visibilidad en el feed</span>
                    <Select value={feedVisibility} onValueChange={(value: 'public' | 'followers' | 'private') => setFeedVisibility(value)}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {visibilityOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center space-x-2">
                              {option.icon}
                              <span>{option.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="text-xs text-gray-500">
                    {visibilityOptions.find(opt => opt.value === feedVisibility)?.description}
                  </div>
                </div>
              )}

              <div className="text-xs text-gray-500">
                {publishToFeed 
                  ? 'Este apunte aparecerá en el feed además de la biblioteca de apuntes.' 
                  : 'Este apunte solo estará disponible en la biblioteca de apuntes.'}
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isUploading}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Subiendo...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    {publishToFeed ? 'Subir y Publicar' : 'Subir Apunte'}
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
