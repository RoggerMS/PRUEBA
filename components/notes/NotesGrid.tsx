'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Image, 
  File, 
  Download, 
  Eye, 
  Star, 
  Calendar, 
  User,
  Heart,
  Share2
} from 'lucide-react';

interface Note {
  id: string;
  title: string;
  description: string;
  author: {
    name: string;
    avatar: string;
    verified: boolean;
  };
  career: string;
  category: string;
  tags: string[];
  price: number;
  rating: number;
  downloads: number;
  views: number;
  createdAt: string;
  files: Array<{
    id: string;
    name: string;
    type: 'pdf' | 'image' | 'doc';
    url: string;
    pages?: number;
  }>;
}

interface NotesGridProps {
  searchQuery: string;
  onNoteSelect: (noteId: string) => void;
}

// Mock data for notes
const mockNotes: Note[] = [
  {
    id: '1',
    title: 'Cálculo Diferencial - Límites y Continuidad',
    description: 'Apuntes completos sobre límites, continuidad y derivadas. Incluye ejemplos prácticos y ejercicios resueltos paso a paso.',
    author: {
      name: 'María González',
      avatar: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20student%20avatar%20female%20smiling&image_size=square',
      verified: true
    },
    career: 'Ingeniería de Sistemas',
    category: 'Matemáticas',
    tags: ['cálculo', 'límites', 'derivadas', 'continuidad'],
    price: 0,
    rating: 4.8,
    downloads: 1250,
    views: 3420,
    createdAt: '2024-01-15T10:00:00Z',
    files: [
      {
        id: '1',
        name: 'Calculo_Diferencial_Limites.pdf',
        type: 'pdf',
        url: 'https://example.com/file1.pdf',
        pages: 25
      },
      {
        id: '2',
        name: 'Ejercicios_Resueltos.pdf',
        type: 'pdf',
        url: 'https://example.com/file2.pdf',
        pages: 15
      }
    ]
  },
  {
    id: '2',
    title: 'Química Orgánica - Reacciones y Mecanismos',
    description: 'Guía completa de reacciones orgánicas con mecanismos detallados y ejemplos de síntesis.',
    author: {
      name: 'Carlos Ruiz',
      avatar: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=student%20avatar%20male%20friendly%20chemistry&image_size=square',
      verified: false
    },
    career: 'Química',
    category: 'Química',
    tags: ['química orgánica', 'reacciones', 'mecanismos', 'síntesis'],
    price: 150,
    rating: 4.6,
    downloads: 890,
    views: 2150,
    createdAt: '2024-01-12T14:30:00Z',
    files: [
      {
        id: '3',
        name: 'Quimica_Organica_Reacciones.pdf',
        type: 'pdf',
        url: 'https://example.com/file3.pdf',
        pages: 45
      }
    ]
  },
  {
    id: '3',
    title: 'Física Cuántica - Fundamentos',
    description: 'Introducción a los principios de la mecánica cuántica con ejercicios y aplicaciones.',
    author: {
      name: 'Ana López',
      avatar: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=student%20avatar%20female%20studying%20physics&image_size=square',
      verified: true
    },
    career: 'Física',
    category: 'Física',
    tags: ['física cuántica', 'mecánica cuántica', 'fundamentos'],
    price: 200,
    rating: 4.9,
    downloads: 650,
    views: 1800,
    createdAt: '2024-01-10T09:15:00Z',
    files: [
      {
        id: '4',
        name: 'Fisica_Cuantica_Fundamentos.pdf',
        type: 'pdf',
        url: 'https://example.com/file4.pdf',
        pages: 60
      },
      {
        id: '5',
        name: 'Ejercicios_Cuantica.pdf',
        type: 'pdf',
        url: 'https://example.com/file5.pdf',
        pages: 20
      }
    ]
  }
];

export function NotesGrid({ searchQuery, onNoteSelect }: NotesGridProps) {
  const [filteredNotes, setFilteredNotes] = useState<Note[]>(mockNotes);
  const [likedNotes, setLikedNotes] = useState<Set<string>>(new Set());

  useEffect(() => {
    const filtered = mockNotes.filter(note => {
      const searchLower = searchQuery.toLowerCase();
      return (
        note.title.toLowerCase().includes(searchLower) ||
        note.description.toLowerCase().includes(searchLower) ||
        note.category.toLowerCase().includes(searchLower) ||
        note.career.toLowerCase().includes(searchLower) ||
        note.author.name.toLowerCase().includes(searchLower) ||
        note.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    });
    setFilteredNotes(filtered);
  }, [searchQuery]);

  const handleLike = (noteId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newLikedNotes = new Set(likedNotes);
    if (likedNotes.has(noteId)) {
      newLikedNotes.delete(noteId);
    } else {
      newLikedNotes.add(noteId);
    }
    setLikedNotes(newLikedNotes);
  };

  const handleShare = (noteId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // Implementar funcionalidad de compartir
    console.log('Compartir nota:', noteId);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-4 h-4 text-red-500" />;
      case 'image':
        return <Image className="w-4 h-4 text-blue-500" />;
      default:
        return <File className="w-4 h-4 text-gray-500" />;
    }
  };

  if (filteredNotes.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">
          No se encontraron apuntes
        </h3>
        <p className="text-gray-500">
          {searchQuery ? 'Intenta con otros términos de búsqueda' : 'Sé el primero en subir apuntes'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {filteredNotes.map((note) => (
        <Card 
          key={note.id}
          className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-white/90 backdrop-blur-sm border-0 shadow-lg overflow-hidden"
          onClick={() => onNoteSelect(note.id)}
        >
          {/* Header with preview */}
          <div className="aspect-video bg-gradient-to-br from-purple-100 to-blue-100 relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <FileText className="w-12 h-12 text-purple-600 mx-auto mb-2" />
                <div className="text-sm font-medium text-purple-700">
                  {note.files.length} archivo{note.files.length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
            
            {/* Price badge */}
            <Badge className={`absolute top-2 right-2 border-0 text-xs font-bold ${
              note.price === 0 
                ? 'bg-green-500 text-white' 
                : 'bg-purple-600 text-white'
            }`}>
              {note.price === 0 ? 'Gratis' : `$${note.price}`}
            </Badge>
            
            {/* Quick actions overlay */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
              <Button
                size="sm"
                className="bg-white text-gray-900 hover:bg-gray-100"
                onClick={(e) => {
                  e.stopPropagation();
                  onNoteSelect(note.id);
                }}
              >
                <Eye className="w-4 h-4 mr-1" />
                Ver
              </Button>
              <Button
                size="sm"
                className="bg-purple-600 text-white hover:bg-purple-700"
                onClick={(e) => {
                  e.stopPropagation();
                  const file = note.files[0];
                  if (file) window.open(file.url, '_blank');
                }}
              >
                <Download className="w-4 h-4 mr-1" />
                Descargar
              </Button>
            </div>
          </div>
          
          <CardContent className="p-4">
            {/* Title and description */}
            <div className="mb-3">
              <h3 className="font-semibold text-gray-900 line-clamp-2 leading-tight mb-1">
                {note.title}
              </h3>
              <p className="text-sm text-gray-600 line-clamp-2">
                {note.description}
              </p>
            </div>
            
            {/* Categories */}
            <div className="flex gap-1 mb-3">
              <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700">
                {note.category}
              </Badge>
              <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700">
                {note.career}
              </Badge>
            </div>
            
            {/* Tags */}
            <div className="flex flex-wrap gap-1 mb-3">
              {note.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs px-1.5 py-0.5">
                  {tag}
                </Badge>
              ))}
              {note.tags.length > 3 && (
                <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                  +{note.tags.length - 3}
                </Badge>
              )}
            </div>
            
            {/* Author */}
            <div className="flex items-center gap-2 mb-3">
              <img
                src={note.author.avatar}
                alt={note.author.name}
                className="w-6 h-6 rounded-full"
              />
              <span className="text-sm text-gray-600 truncate flex-1">
                {note.author.name}
              </span>
              {note.author.verified && (
                <Star className="w-3 h-3 text-blue-500 fill-current" />
              )}
            </div>
            
            {/* Files preview */}
            <div className="mb-3">
              <div className="text-xs text-gray-500 mb-1">Archivos incluidos:</div>
              <div className="space-y-1">
                {note.files.slice(0, 2).map((file) => (
                  <div key={file.id} className="flex items-center gap-2 text-xs text-gray-600">
                    {getFileIcon(file.type)}
                    <span className="truncate flex-1">{file.name}</span>
                    {file.pages && (
                      <span className="text-gray-400">{file.pages}p</span>
                    )}
                  </div>
                ))}
                {note.files.length > 2 && (
                  <div className="text-xs text-gray-400">
                    +{note.files.length - 2} archivo{note.files.length - 2 !== 1 ? 's' : ''} más
                  </div>
                )}
              </div>
            </div>
            
            {/* Stats and actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-yellow-500 fill-current" />
                  <span className="font-medium">{note.rating}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Download className="w-3 h-3" />
                  <span>{formatNumber(note.downloads)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  <span>{formatNumber(note.views)}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  className={`w-7 h-7 p-0 ${
                    likedNotes.has(note.id) 
                      ? 'text-red-500 hover:text-red-600' 
                      : 'text-gray-400 hover:text-red-500'
                  }`}
                  onClick={(e) => handleLike(note.id, e)}
                >
                  <Heart className={`w-3 h-3 ${likedNotes.has(note.id) ? 'fill-current' : ''}`} />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="w-7 h-7 p-0 text-gray-400 hover:text-blue-500"
                  onClick={(e) => handleShare(note.id, e)}
                >
                  <Share2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
            
            {/* Date */}
            <div className="flex items-center gap-1 text-xs text-gray-400 mt-2">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(note.createdAt)}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}