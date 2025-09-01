'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

interface ImageUploadProps {
  images: File[];
  onImagesChange: (images: File[]) => void;
  maxImages?: number;
  maxSizeInMB?: number;
  acceptedTypes?: string[];
  className?: string;
}

export function ImageUpload({
  images,
  onImagesChange,
  maxImages = 5,
  maxSizeInMB = 5,
  acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
  className = ''
}: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (!acceptedTypes.includes(file.type)) {
      return `Tipo de archivo no soportado: ${file.type}`;
    }
    if (file.size > maxSizeInMB * 1024 * 1024) {
      return `El archivo es muy grande. Máximo ${maxSizeInMB}MB`;
    }
    return null;
  };

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;

    const newFiles: File[] = [];
    const errors: string[] = [];

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const validationError = validateFile(file);
      
      if (validationError) {
        errors.push(`${file.name}: ${validationError}`);
      } else if (images.length + newFiles.length < maxImages) {
        newFiles.push(file);
      } else {
        errors.push(`Máximo ${maxImages} imágenes permitidas`);
        break;
      }
    }

    if (errors.length > 0) {
      setError(errors.join(', '));
    } else {
      setError(null);
    }

    if (newFiles.length > 0) {
      onImagesChange([...images, ...newFiles]);
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
    setError(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const getImagePreview = (file: File): string => {
    return URL.createObjectURL(file);
  };

  return (
    <div className={className}>
      {/* Upload Area */}
      <Card 
        className={`border-2 border-dashed transition-colors cursor-pointer ${
          dragActive 
            ? 'border-purple-500 bg-purple-50' 
            : 'border-gray-300 hover:border-purple-400'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
      >
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Upload className={`w-12 h-12 mb-4 ${
            dragActive ? 'text-purple-500' : 'text-gray-400'
          }`} />
          <p className="text-lg font-medium text-gray-700 mb-2">
            {dragActive ? 'Suelta las imágenes aquí' : 'Arrastra imágenes aquí'}
          </p>
          <p className="text-sm text-gray-500 mb-4">
            o haz clic para seleccionar archivos
          </p>
          <div className="flex flex-wrap gap-2 text-xs text-gray-500">
            <Badge variant="outline">Máximo {maxImages} imágenes</Badge>
            <Badge variant="outline">Hasta {maxSizeInMB}MB cada una</Badge>
            <Badge variant="outline">JPG, PNG, WebP, GIF</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedTypes.join(',')}
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
      />

      {/* Error Message */}
      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Image Previews */}
      {images.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Imágenes seleccionadas ({images.length}/{maxImages})
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {images.map((file, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <Image
                    src={getImagePreview(file)}
                    alt={`Preview ${index + 1}`}
                    width={150}
                    height={150}
                    className="w-full h-full object-cover"
                  />
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage(index);
                  }}
                >
                  <X className="w-3 h-3" />
                </Button>
                <div className="absolute bottom-1 left-1 right-1">
                  <Badge variant="secondary" className="text-xs truncate w-full">
                    {file.name}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Button (Alternative) */}
      {images.length === 0 && (
        <div className="mt-3 text-center">
          <Button
            type="button"
            variant="outline"
            onClick={handleClick}
            className="flex items-center gap-2"
          >
            <ImageIcon className="w-4 h-4" />
            Seleccionar Imágenes
          </Button>
        </div>
      )}
    </div>
  );
}