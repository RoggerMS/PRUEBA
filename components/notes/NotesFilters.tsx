'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface NotesFiltersProps {
  selectedCategory: string;
  selectedCareer: string;
  sortBy: string;
  onCategoryChange: (category: string) => void;
  onCareerChange: (career: string) => void;
  onSortChange: (sortBy: string) => void;
}

const categories = [
  { value: 'all', label: 'Todas las categorías' },
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
  { value: 'all', label: 'Todas las carreras' },
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

const sortOptions = [
  { value: 'recent', label: 'Más recientes' },
  { value: 'popular', label: 'Más populares' },
  { value: 'rating', label: 'Mejor valorados' },
  { value: 'downloads', label: 'Más descargados' },
  { value: 'price-low', label: 'Precio: menor a mayor' },
  { value: 'price-high', label: 'Precio: mayor a menor' },
  { value: 'free', label: 'Solo gratuitos' }
];

export function NotesFilters({
  selectedCategory,
  selectedCareer,
  sortBy,
  onCategoryChange,
  onCareerChange,
  onSortChange
}: NotesFiltersProps) {
  const hasActiveFilters = selectedCategory !== 'all' || selectedCareer !== 'all' || sortBy !== 'recent';

  const clearAllFilters = () => {
    onCategoryChange('all');
    onCareerChange('all');
    onSortChange('recent');
  };

  const getCategoryLabel = (value: string) => {
    return categories.find(cat => cat.value === value)?.label || 'Todas las categorías';
  };

  const getCareerLabel = (value: string) => {
    return careers.find(career => career.value === value)?.label || 'Todas las carreras';
  };

  const getSortLabel = (value: string) => {
    return sortOptions.find(option => option.value === value)?.label || 'Más recientes';
  };

  return (
    <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Filter Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Category Filter */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Categoría
              </label>
              <Select value={selectedCategory} onValueChange={onCategoryChange}>
                <SelectTrigger className="h-10">
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

            {/* Career Filter */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Carrera
              </label>
              <Select value={selectedCareer} onValueChange={onCareerChange}>
                <SelectTrigger className="h-10">
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

            {/* Sort Filter */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Ordenar por
              </label>
              <Select value={sortBy} onValueChange={onSortChange}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  onClick={clearAllFilters}
                  className="h-10 w-full"
                >
                  <X className="w-4 h-4 mr-2" />
                  Limpiar filtros
                </Button>
              )}
            </div>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200">
              <span className="text-sm font-medium text-gray-600">Filtros activos:</span>
              
              {selectedCategory !== 'all' && (
                <Badge 
                  variant="secondary" 
                  className="bg-purple-100 text-purple-700 cursor-pointer hover:bg-purple-200"
                  onClick={() => onCategoryChange('all')}
                >
                  {getCategoryLabel(selectedCategory)}
                  <X className="w-3 h-3 ml-1" />
                </Badge>
              )}
              
              {selectedCareer !== 'all' && (
                <Badge 
                  variant="secondary" 
                  className="bg-blue-100 text-blue-700 cursor-pointer hover:bg-blue-200"
                  onClick={() => onCareerChange('all')}
                >
                  {getCareerLabel(selectedCareer)}
                  <X className="w-3 h-3 ml-1" />
                </Badge>
              )}
              
              {sortBy !== 'recent' && (
                <Badge 
                  variant="secondary" 
                  className="bg-green-100 text-green-700 cursor-pointer hover:bg-green-200"
                  onClick={() => onSortChange('recent')}
                >
                  {getSortLabel(sortBy)}
                  <X className="w-3 h-3 ml-1" />
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}