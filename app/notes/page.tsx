'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Upload, 
  Filter,
  FileText,
  Image,
  File,
  Download,
  Eye,
  Star,
  Calendar,
  User
} from 'lucide-react';
import { NotesGrid } from '@/components/notes/NotesGrid';
import { NotesFilters } from '@/components/notes/NotesFilters';
import { NotesUpload } from '@/components/notes/NotesUpload';
import { NotesViewer } from '@/components/notes/NotesViewer';

// Mock data for selected note
const mockNote = {
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
      type: 'pdf' as const,
      url: 'https://example.com/file1.pdf',
      pages: 25
    },
    {
      id: '2',
      name: 'Ejercicios_Resueltos.pdf',
      type: 'pdf' as const,
      url: 'https://example.com/file2.pdf',
      pages: 15
    },
    {
      id: '3',
      name: 'Graficas_Funciones.png',
      type: 'image' as const,
      url: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=mathematical%20function%20graphs%20calculus%20limits%20continuity&image_size=landscape_4_3'
    }
  ],
  comments: [
    {
      id: '1',
      user: {
        name: 'Carlos Ruiz',
        avatar: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=student%20avatar%20male%20friendly&image_size=square'
      },
      content: 'Excelentes apuntes, muy claros y bien organizados. Me ayudaron mucho para el examen.',
      rating: 5,
      createdAt: '2024-01-20T14:30:00Z'
    },
    {
      id: '2',
      user: {
        name: 'Ana López',
        avatar: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=student%20avatar%20female%20studying&image_size=square'
      },
      content: 'Los ejercicios resueltos están muy bien explicados. Recomendado 100%.',
      rating: 5,
      createdAt: '2024-01-18T09:15:00Z'
    }
  ]
};

export default function NotesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [selectedNote, setSelectedNote] = useState<typeof mockNote | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCareer, setSelectedCareer] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  const handleNoteSelect = (noteId: string) => {
    // In a real app, fetch the note data by ID
    setSelectedNote(mockNote);
  };

  const handleUploadSuccess = () => {
    setShowUpload(false);
    // Refresh notes list
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📚 Biblioteca de Apuntes
          </h1>
          <p className="text-gray-600">
            Encuentra y comparte apuntes de calidad con la comunidad estudiantil
          </p>
        </div>

        {/* Search and Actions */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search Bar */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar apuntes por título, materia o autor..."
                  className="pl-10"
                />
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filtros
                </Button>
                <Button 
                  onClick={() => setShowUpload(true)}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Subir Apunte
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        {showFilters && (
          <div className="mb-6">
            <NotesFilters
              selectedCategory={selectedCategory}
              selectedCareer={selectedCareer}
              sortBy={sortBy}
              onCategoryChange={setSelectedCategory}
              onCareerChange={setSelectedCareer}
              onSortChange={setSortBy}
            />
          </div>
        )}

        {/* Notes Grid */}
        <NotesGrid 
          searchQuery={searchQuery} 
          onNoteSelect={handleNoteSelect}
        />
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <NotesUpload 
          onClose={() => setShowUpload(false)}
          onSuccess={handleUploadSuccess}
        />
      )}

      {/* Viewer Modal */}
      {selectedNote && (
        <NotesViewer 
          note={selectedNote}
          onClose={() => setSelectedNote(null)}
        />
      )}
    </div>
  );
}