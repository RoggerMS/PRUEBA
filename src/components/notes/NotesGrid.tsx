'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Badge } from '@/src/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/src/components/ui/avatar';
import { 
  FileText, 
  Download, 
  Eye, 
  Heart, 
  MessageCircle, 
  Share2, 
  MoreVertical,
  Star,
  Clock,
  Users
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { gamificationService } from '@/services/gamificationService';
import { formatCrolars } from '@/lib/utils';

interface Note {
  id: string;
  title: string;
  description: string;
  fileType: 'pdf' | 'docx' | 'pptx' | 'xlsx' | 'image';
  fileName: string;
  fileSize: number;
  thumbnailUrl?: string;
  tags: string[];
  career: string;
  price?: number;
  author: {
    id: string;
    name: string;
    avatar?: string;
    verified: boolean;
  };
  stats: {
    views: number;
    downloads: number;
    likes: number;
    comments: number;
    rating: number;
  };
  createdAt: Date;
  isPremium: boolean;
  isOwned: boolean;
}

interface NotesGridProps {
  searchQuery: string;
  onNoteSelect: (noteId: string) => void;
}

// Mock data
const mockNotes: Note[] = [
  {
    id: '1',
    title: 'Cálculo Diferencial - Límites y Continuidad',
    description: 'Apuntes completos sobre límites, continuidad y derivadas. Incluye ejercicios resueltos y ejemplos prácticos.',
    fileType: 'pdf',
    fileName: 'calculo-diferencial-limites.pdf',
    fileSize: 2.5 * 1024 * 1024,
    thumbnailUrl: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=mathematics%20calculus%20notes%20with%20formulas%20and%20graphs%20on%20white%20paper%20academic%20style&image_size=square',
    tags: ['matemáticas', 'cálculo', 'límites', 'derivadas'],
    career: 'Ingeniería de Sistemas',
    price: 150,
    author: {
      id: 'user1',
      name: 'María González',
      avatar: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20female%20student%20avatar%20smiling%20portrait&image_size=square',
      verified: true
    },
    stats: {
      views: 1250,
      downloads: 89,
      likes: 156,
      comments: 23,
      rating: 4.8
    },
    createdAt: new Date('2024-01-15'),
    isPremium: false,
    isOwned: false
  },
  {
    id: '2',
    title: 'Algoritmos y Estructuras de Datos',
    description: 'Guía completa de algoritmos de ordenamiento, búsqueda y estructuras de datos fundamentales.',
    fileType: 'docx',
    fileName: 'algoritmos-estructuras-datos.docx',
    fileSize: 1.8 * 1024 * 1024,
    thumbnailUrl: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=computer%20science%20algorithms%20flowchart%20diagrams%20programming%20code%20academic%20notes&image_size=square',
    tags: ['programación', 'algoritmos', 'estructuras', 'datos'],
    career: 'Ingeniería de Sistemas',
    author: {
      id: 'user2',
      name: 'Carlos Mendoza',
      avatar: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20male%20student%20avatar%20smiling%20portrait&image_size=square',
      verified: false
    },
    stats: {
      views: 890,
      downloads: 67,
      likes: 98,
      comments: 15,
      rating: 4.5
    },
    createdAt: new Date('2024-01-10'),
    isPremium: true,
    isOwned: true
  }
];

const getFileIcon = (fileType: string) => {
  switch (fileType) {
    case 'pdf':
      return <FileText className="w-5 h-5 text-red-500" />;
    case 'docx':
      return <FileText className="w-5 h-5 text-blue-500" />;
    case 'pptx':
      return <FileText className="w-5 h-5 text-orange-500" />;
    case 'xlsx':
      return <FileText className="w-5 h-5 text-green-500" />;
    default:
      return <FileText className="w-5 h-5 text-gray-500" />;
  }
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export function NotesGrid({ searchQuery, onNoteSelect }: NotesGridProps) {
  const [notes, setNotes] = useState<Note[]>(mockNotes);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>(mockNotes);

  useEffect(() => {
    let filtered = [...notes];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(note => 
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
        note.author.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort by newest by default
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    setFilteredNotes(filtered);
  }, [notes, searchQuery]);

  const handleLike = async (noteId: string) => {
    setNotes(prev => prev.map(note => 
      note.id === noteId 
        ? { ...note, stats: { ...note.stats, likes: note.stats.likes + 1 } }
        : note
    ));
    
    // Grant XP for liking a note
    try {
      await gamificationService.grantXP(
        'current-user-id', // This should be the actual user ID
        5, // XP amount for liking a note
        'notes_like',
        noteId,
        'Le dio like a una nota'
      );
    } catch (error) {
      console.error('Error granting XP for note like:', error);
    }
  };

  const handleDownload = async (note: Note) => {
    if (note.price && !note.isOwned) {
      // Handle purchase logic
      console.log(`Purchase note ${note.id} for ${note.price} Crolars`);
    } else {
      // Handle download logic
      console.log(`Download note ${note.id}`);
      setNotes(prev => prev.map(n => 
        n.id === note.id 
          ? { ...n, stats: { ...n.stats, downloads: n.stats.downloads + 1 } }
          : n
      ));
      
      // Grant XP for downloading a note
      try {
        await gamificationService.grantXP(
          'current-user-id', // This should be the actual user ID
          10, // XP amount for downloading a note
          'notes_download',
          note.id,
          `Descargó la nota: ${note.title}`
        );
      } catch (error) {
        console.error('Error granting XP for note download:', error);
      }
    }
  };

  if (filteredNotes.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron apuntes</h3>
        <p className="text-gray-500">Intenta ajustar tus filtros de búsqueda</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {filteredNotes.map((note) => (
        <Card key={note.id} className="group hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="p-4">
            {/* Thumbnail */}
            <div className="relative aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden mb-3">
              {note.thumbnailUrl ? (
                <img 
                  src={note.thumbnailUrl} 
                  alt={note.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  {getFileIcon(note.fileType)}
                </div>
              )}
              {note.isPremium && (
                <Badge className="absolute top-2 right-2 bg-yellow-500 text-white">
                  Premium
                </Badge>
              )}
            </div>

            {/* Title and Description */}
            <div>
              <h3 className="font-semibold text-sm line-clamp-2 mb-2">{note.title}</h3>
              <p className="text-xs text-gray-600 line-clamp-2 mb-3">{note.description}</p>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1 mb-3">
              {note.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {note.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{note.tags.length - 3}
                </Badge>
              )}
            </div>
          </CardHeader>

          <CardContent className="px-4 pb-2">
            {/* Author */}
            <div className="flex items-center gap-2 mb-3">
              <Avatar className="w-6 h-6">
                <AvatarImage src={note.author.avatar} />
                <AvatarFallback className="text-xs">
                  {note.author.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-gray-600 truncate">{note.author.name}</span>
              {note.author.verified && (
                <Star className="w-3 h-3 text-yellow-500 fill-current" />
              )}
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {note.stats.views}
                </span>
                <span className="flex items-center gap-1">
                  <Download className="w-3 h-3" />
                  {note.stats.downloads}
                </span>
                <span className="flex items-center gap-1">
                  <Heart className="w-3 h-3" />
                  {note.stats.likes}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-yellow-500 fill-current" />
                <span>{note.stats.rating}</span>
              </div>
            </div>

            {/* File Info */}
            <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
              <div className="flex items-center gap-1">
                {getFileIcon(note.fileType)}
                <span>{note.fileType.toUpperCase()}</span>
              </div>
              <span>{formatFileSize(note.fileSize)}</span>
            </div>

            {/* Time */}
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              <span>{formatDistanceToNow(note.createdAt, { addSuffix: true, locale: es })}</span>
            </div>
          </CardContent>

          <CardFooter className="p-4 pt-2">
            <div className="flex items-center justify-between w-full gap-2">
              {/* Price or Free */}
              <div className="flex-1">
                {note.price && !note.isOwned ? (
                  <span className="text-sm font-semibold text-purple-600">
                    {formatCrolars(note.price)}
                  </span>
                ) : (
                  <span className="text-sm font-semibold text-green-600">
                    {note.isOwned ? 'Adquirido' : 'Gratis'}
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleLike(note.id)}
                  className="h-8 w-8 p-0"
                >
                  <Heart className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0"
                >
                  <Share2 className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onNoteSelect(note.id)}
                  className="h-8 w-8 p-0"
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleDownload(note)}
                  className="bg-purple-600 hover:bg-purple-700 text-white h-8 px-3"
                >
                  {note.price && !note.isOwned ? 'Comprar' : 'Descargar'}
                </Button>
              </div>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}