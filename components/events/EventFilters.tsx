"use client";

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Search, 
  Filter, 
  X, 
  Calendar as CalendarIcon,
  MapPin,
  DollarSign,
  Users,
  Clock,
  ChevronDown,
  SlidersHorizontal
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { eventFilterSchema, type EventFilterData } from '@/lib/validations';

interface EventFiltersProps {
  filters: EventFilterData;
  onFiltersChange: (filters: EventFilterData) => void;
  onClearFilters: () => void;
  totalResults?: number;
  isLoading?: boolean;
}

const categories = [
  { value: 'TECHNOLOGY', label: 'Tecnología' },
  { value: 'ACADEMIC', label: 'Académico' },
  { value: 'ARTS', label: 'Arte y Cultura' },
  { value: 'SPORTS', label: 'Deportivo' },
  { value: 'SOCIAL', label: 'Social' },
  { value: 'BUSINESS', label: 'Negocios' },
  { value: 'HEALTH', label: 'Salud' },
  { value: 'SCIENCE', label: 'Ciencia' },
];

const eventTypes = [
  { value: 'WORKSHOP', label: 'Taller' },
  { value: 'CONFERENCE', label: 'Conferencia' },
  { value: 'SEMINAR', label: 'Seminario' },
  { value: 'COMPETITION', label: 'Competencia' },
  { value: 'SOCIAL', label: 'Social' },
  { value: 'MEETING', label: 'Reunión' },
  { value: 'HACKATHON', label: 'Hackathon' },
  { value: 'NETWORKING', label: 'Networking' },
];

const sortOptions = [
  { value: 'date', label: 'Fecha' },
  { value: 'title', label: 'Nombre' },
  { value: 'popularity', label: 'Popularidad' },
  { value: 'price', label: 'Precio' },
  { value: 'attendees', label: 'Asistentes' },
];

const difficultyLevels = [
  { value: 'BEGINNER', label: 'Principiante' },
  { value: 'INTERMEDIATE', label: 'Intermedio' },
  { value: 'ADVANCED', label: 'Avanzado' },
  { value: 'EXPERT', label: 'Experto' },
];

export function EventFilters({ 
  filters, 
  onFiltersChange, 
  onClearFilters, 
  totalResults = 0,
  isLoading = false 
}: EventFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [dateFrom, setDateFrom] = useState<Date | undefined>(filters.dateFrom ? new Date(filters.dateFrom) : undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(filters.dateTo ? new Date(filters.dateTo) : undefined);
  const [priceRange, setPriceRange] = useState([filters.minPrice || 0, filters.maxPrice || 1000]);

  const updateFilters = (updates: Partial<EventFilterData>) => {
    const newFilters = { ...filters, ...updates };
    onFiltersChange(newFilters);
  };

  const handleCategoryToggle = (category: string) => {
    const currentCategories = filters.categories || [];
    const newCategories = currentCategories.includes(category)
      ? currentCategories.filter(c => c !== category)
      : [...currentCategories, category];
    updateFilters({ categories: newCategories });
  };

  const handleTypeToggle = (type: string) => {
    const currentTypes = filters.types || [];
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter(t => t !== type)
      : [...currentTypes, type];
    updateFilters({ types: newTypes });
  };

  const handleDifficultyToggle = (difficulty: string) => {
    const currentDifficulties = filters.difficulties || [];
    const newDifficulties = currentDifficulties.includes(difficulty)
      ? currentDifficulties.filter(d => d !== difficulty)
      : [...currentDifficulties, difficulty];
    updateFilters({ difficulties: newDifficulties });
  };

  const handleDateFromChange = (date: Date | undefined) => {
    setDateFrom(date);
    updateFilters({ dateFrom: date?.toISOString() });
  };

  const handleDateToChange = (date: Date | undefined) => {
    setDateTo(date);
    updateFilters({ dateTo: date?.toISOString() });
  };

  const handlePriceRangeChange = (values: number[]) => {
    setPriceRange(values);
    updateFilters({ minPrice: values[0], maxPrice: values[1] });
  };

  const activeFiltersCount = [
    filters.search,
    filters.categories?.length,
    filters.types?.length,
    filters.difficulties?.length,
    filters.isOnline !== undefined,
    filters.isFree !== undefined,
    filters.dateFrom,
    filters.dateTo,
    filters.minPrice !== undefined && filters.minPrice > 0,
    filters.maxPrice !== undefined && filters.maxPrice < 1000,
  ].filter(Boolean).length;

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
      <CardContent className="p-6 space-y-6">
        {/* Basic Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar eventos..."
              value={filters.search || ''}
              onChange={(e) => updateFilters({ search: e.target.value })}
              className="pl-10"
            />
          </div>

          {/* Sort */}
          <Select value={filters.sortBy || 'date'} onValueChange={(value) => updateFilters({ sortBy: value as any })}>
            <SelectTrigger>
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sort Order */}
          <Select value={filters.sortOrder || 'asc'} onValueChange={(value) => updateFilters({ sortOrder: value as 'asc' | 'desc' })}>
            <SelectTrigger>
              <SelectValue placeholder="Orden" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">Ascendente</SelectItem>
              <SelectItem value="desc">Descendente</SelectItem>
            </SelectContent>
          </Select>

          {/* Advanced Toggle */}
          <Button
            variant="outline"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filtros Avanzados
            <ChevronDown className={`h-4 w-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-1">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="space-y-6 border-t pt-6">
            {/* Categories */}
            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Categorías
              </Label>
              <div className="flex flex-wrap gap-2">
                {categories.map(category => {
                  const isSelected = filters.categories?.includes(category.value) || false;
                  return (
                    <Badge
                      key={category.value}
                      variant={isSelected ? "default" : "outline"}
                      className="cursor-pointer hover:bg-purple-100"
                      onClick={() => handleCategoryToggle(category.value)}
                    >
                      {category.label}
                      {isSelected && <X className="h-3 w-3 ml-1" />}
                    </Badge>
                  );
                })}
              </div>
            </div>

            {/* Event Types */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Tipos de Evento</Label>
              <div className="flex flex-wrap gap-2">
                {eventTypes.map(type => {
                  const isSelected = filters.types?.includes(type.value) || false;
                  return (
                    <Badge
                      key={type.value}
                      variant={isSelected ? "default" : "outline"}
                      className="cursor-pointer hover:bg-blue-100"
                      onClick={() => handleTypeToggle(type.value)}
                    >
                      {type.label}
                      {isSelected && <X className="h-3 w-3 ml-1" />}
                    </Badge>
                  );
                })}
              </div>
            </div>

            {/* Difficulty Levels */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Nivel de Dificultad</Label>
              <div className="flex flex-wrap gap-2">
                {difficultyLevels.map(difficulty => {
                  const isSelected = filters.difficulties?.includes(difficulty.value) || false;
                  return (
                    <Badge
                      key={difficulty.value}
                      variant={isSelected ? "default" : "outline"}
                      className="cursor-pointer hover:bg-green-100"
                      onClick={() => handleDifficultyToggle(difficulty.value)}
                    >
                      {difficulty.label}
                      {isSelected && <X className="h-3 w-3 ml-1" />}
                    </Badge>
                  );
                })}
              </div>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  Fecha desde
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateFrom ? format(dateFrom, 'PPP', { locale: es }) : 'Seleccionar fecha'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateFrom}
                      onSelect={handleDateFromChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Fecha hasta</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateTo ? format(dateTo, 'PPP', { locale: es }) : 'Seleccionar fecha'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateTo}
                      onSelect={handleDateToChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Price Range */}
            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Rango de Precio: ${priceRange[0]} - ${priceRange[1]}
              </Label>
              <Slider
                value={priceRange}
                onValueChange={handlePriceRangeChange}
                max={1000}
                min={0}
                step={10}
                className="w-full"
              />
            </div>

            {/* Quick Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="online"
                  checked={filters.isOnline || false}
                  onCheckedChange={(checked) => updateFilters({ isOnline: checked as boolean })}
                />
                <Label htmlFor="online" className="flex items-center gap-2 cursor-pointer">
                  <MapPin className="h-4 w-4" />
                  Solo eventos online
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="free"
                  checked={filters.isFree || false}
                  onCheckedChange={(checked) => updateFilters({ isFree: checked as boolean })}
                />
                <Label htmlFor="free" className="flex items-center gap-2 cursor-pointer">
                  <DollarSign className="h-4 w-4" />
                  Solo eventos gratuitos
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="available"
                  checked={filters.hasAvailableSpots || false}
                  onCheckedChange={(checked) => updateFilters({ hasAvailableSpots: checked as boolean })}
                />
                <Label htmlFor="available" className="flex items-center gap-2 cursor-pointer">
                  <Users className="h-4 w-4" />
                  Con cupos disponibles
                </Label>
              </div>
            </div>
          </div>
        )}

        {/* Results and Clear */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-gray-600">
            {isLoading ? (
              'Buscando eventos...'
            ) : (
              `${totalResults} evento${totalResults !== 1 ? 's' : ''} encontrado${totalResults !== 1 ? 's' : ''}`
            )}
          </div>
          
          {activeFiltersCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearFilters}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Limpiar Filtros
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}