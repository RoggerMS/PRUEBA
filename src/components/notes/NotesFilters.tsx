'use client';

import { Card, CardContent } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Badge } from '@/src/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/components/ui/select';
import { X } from 'lucide-react';

interface NotesFiltersProps {
  selectedCategory: string;
  selectedCareer: string;
  sortBy: string;
  onCategoryChange: (category: string) => void;
  onCareerChange: (career: string) => void;
  onSortChange: (sort: string) => void;
}

const categories = [
  { value: 'all', label: 'Todas las categorías' },
  { value: 'mathematics', label: 'Matemáticas' },
  { value: 'programming', label: 'Programación' },
  { value: 'physics', label: 'Física' },
  { value: 'chemistry', label: 'Química' },
  { value: 'biology', label: 'Biología' },
  { value: 'history', label: 'Historia' },
  { value: 'literature', label: 'Literatura' },
  { value: 'economics', label: 'Economía' },
  { value: 'psychology', label: 'Psicología' },
  { value: 'engineering', label: 'Ingeniería' },
  { value: 'medicine', label: 'Medicina' },
  { value: 'law', label: 'Derecho' },
  { value: 'business', label: 'Administración' },
  { value: 'design', label: 'Diseño' },
  { value: 'languages', label: 'Idiomas' }
];

const careers = [
  { value: 'all', label: 'Todas las carreras' },
  { value: 'Ingeniería de Sistemas', label: 'Ingeniería de Sistemas' },
  { value: 'Ingeniería Industrial', label: 'Ingeniería Industrial' },
  { value: 'Ingeniería Civil', label: 'Ingeniería Civil' },
  { value: 'Medicina', label: 'Medicina' },
  { value: 'Derecho', label: 'Derecho' },
  { value: 'Administración', label: 'Administración' },
  { value: 'Psicología', label: 'Psicología' },
  { value: 'Arquitectura', label: 'Arquitectura' },
  { value: 'Contabilidad', label: 'Contabilidad' },
  { value: 'Marketing', label: 'Marketing' },
  { value: 'Diseño Gráfico', label: 'Diseño Gráfico' },
  { value: 'Comunicaciones', label: 'Comunicaciones' },
  { value: 'Educación', label: 'Educación' },
  { value: 'Enfermería', label: 'Enfermería' },
  { value: 'Nutrición', label: 'Nutrición' }
];

const sortOptions = [
  { value: 'recent', label: 'Más recientes' },
  { value: 'popular', label: 'Más populares' },
  { value: 'rating', label: 'Mejor valorados' },
  { value: 'downloads', label: 'Más descargados' },
  { value: 'price-low', label: 'Precio: menor a mayor' },
  { value: 'price-high', label: 'Precio: mayor a menor' },
  { value: 'alphabetical', label: 'Alfabético' }
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

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Category Filter */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoría
            </label>
            <Select value={selectedCategory} onValueChange={onCategoryChange}>
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

          {/* Career Filter */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Carrera
            </label>
            <Select value={selectedCareer} onValueChange={onCareerChange}>
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

          {/* Sort Filter */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ordenar por
            </label>
            <Select value={sortBy} onValueChange={onSortChange}>
              <SelectTrigger>
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
          {hasActiveFilters && (
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={clearAllFilters}
                className="flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Limpiar filtros
              </Button>
            </div>
          )}
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-gray-600">Filtros activos:</span>
              
              {selectedCategory !== 'all' && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {categories.find(c => c.value === selectedCategory)?.label}
                  <button
                    onClick={() => onCategoryChange('all')}
                    className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              
              {selectedCareer !== 'all' && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {careers.find(c => c.value === selectedCareer)?.label}
                  <button
                    onClick={() => onCareerChange('all')}
                    className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              
              {sortBy !== 'recent' && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {sortOptions.find(s => s.value === sortBy)?.label}
                  <button
                    onClick={() => onSortChange('recent')}
                    className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}