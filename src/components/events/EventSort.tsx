"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem
} from '@/components/ui/dropdown-menu';
import { 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown,
  Calendar,
  Clock,
  Users,
  Star,
  TrendingUp,
  MapPin,
  DollarSign
} from 'lucide-react';

export type SortField = 
  | 'startDate' 
  | 'title' 
  | 'currentAttendees' 
  | 'maxAttendees' 
  | 'createdAt'
  | 'price'
  | 'rating'
  | 'popularity';

export type SortOrder = 'asc' | 'desc';

export interface SortOption {
  field: SortField;
  order: SortOrder;
  label: string;
  icon: React.ReactNode;
  description?: string;
}

interface EventSortProps {
  sortBy: SortField;
  sortOrder: SortOrder;
  onSortChange: (field: SortField, order: SortOrder) => void;
  className?: string;
}

const sortOptions: SortOption[] = [
  {
    field: 'startDate',
    order: 'asc',
    label: 'Fecha (Próximos primero)',
    icon: <Calendar className="h-4 w-4" />,
    description: 'Eventos más próximos primero'
  },
  {
    field: 'startDate',
    order: 'desc',
    label: 'Fecha (Lejanos primero)',
    icon: <Calendar className="h-4 w-4" />,
    description: 'Eventos más lejanos primero'
  },
  {
    field: 'title',
    order: 'asc',
    label: 'Nombre (A-Z)',
    icon: <ArrowUp className="h-4 w-4" />,
    description: 'Orden alfabético ascendente'
  },
  {
    field: 'title',
    order: 'desc',
    label: 'Nombre (Z-A)',
    icon: <ArrowDown className="h-4 w-4" />,
    description: 'Orden alfabético descendente'
  },
  {
    field: 'currentAttendees',
    order: 'desc',
    label: 'Más populares',
    icon: <Users className="h-4 w-4" />,
    description: 'Mayor número de asistentes'
  },
  {
    field: 'currentAttendees',
    order: 'asc',
    label: 'Menos populares',
    icon: <Users className="h-4 w-4" />,
    description: 'Menor número de asistentes'
  },
  {
    field: 'createdAt',
    order: 'desc',
    label: 'Más recientes',
    icon: <Clock className="h-4 w-4" />,
    description: 'Eventos creados recientemente'
  },
  {
    field: 'createdAt',
    order: 'asc',
    label: 'Más antiguos',
    icon: <Clock className="h-4 w-4" />,
    description: 'Eventos creados hace más tiempo'
  },
  {
    field: 'price',
    order: 'asc',
    label: 'Precio (Menor a mayor)',
    icon: <DollarSign className="h-4 w-4" />,
    description: 'Eventos más baratos primero'
  },
  {
    field: 'price',
    order: 'desc',
    label: 'Precio (Mayor a menor)',
    icon: <DollarSign className="h-4 w-4" />,
    description: 'Eventos más caros primero'
  }
];

export function EventSort({ 
  sortBy, 
  sortOrder, 
  onSortChange, 
  className = "" 
}: EventSortProps) {
  const currentSort = sortOptions.find(
    option => option.field === sortBy && option.order === sortOrder
  );

  const handleSortSelect = (value: string) => {
    const [field, order] = value.split('-') as [SortField, SortOrder];
    onSortChange(field, order);
  };

  const getSortIcon = () => {
    if (sortOrder === 'asc') {
      return <ArrowUp className="h-4 w-4" />;
    } else {
      return <ArrowDown className="h-4 w-4" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className={`gap-2 ${className}`}
        >
          <ArrowUpDown className="h-4 w-4" />
          <span className="hidden sm:inline">
            {currentSort?.label || 'Ordenar por'}
          </span>
          <span className="sm:hidden">
            Ordenar
          </span>
          {getSortIcon()}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="flex items-center gap-2">
          <ArrowUpDown className="h-4 w-4" />
          Ordenar eventos
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuRadioGroup 
          value={`${sortBy}-${sortOrder}`}
          onValueChange={handleSortSelect}
        >
          {/* Date Sorting */}
          <DropdownMenuLabel className="text-xs text-gray-500 uppercase tracking-wide px-2 py-1">
            Por fecha
          </DropdownMenuLabel>
          {sortOptions
            .filter(option => option.field === 'startDate')
            .map((option) => (
              <DropdownMenuRadioItem 
                key={`${option.field}-${option.order}`}
                value={`${option.field}-${option.order}`}
                className="flex items-start gap-3 py-2"
              >
                <div className="flex items-center gap-2 flex-1">
                  {option.icon}
                  <div>
                    <div className="font-medium">{option.label}</div>
                    {option.description && (
                      <div className="text-xs text-gray-500">
                        {option.description}
                      </div>
                    )}
                  </div>
                </div>
              </DropdownMenuRadioItem>
            ))
          }
          
          <DropdownMenuSeparator />
          
          {/* Popularity Sorting */}
          <DropdownMenuLabel className="text-xs text-gray-500 uppercase tracking-wide px-2 py-1">
            Por popularidad
          </DropdownMenuLabel>
          {sortOptions
            .filter(option => option.field === 'currentAttendees')
            .map((option) => (
              <DropdownMenuRadioItem 
                key={`${option.field}-${option.order}`}
                value={`${option.field}-${option.order}`}
                className="flex items-start gap-3 py-2"
              >
                <div className="flex items-center gap-2 flex-1">
                  {option.icon}
                  <div>
                    <div className="font-medium">{option.label}</div>
                    {option.description && (
                      <div className="text-xs text-gray-500">
                        {option.description}
                      </div>
                    )}
                  </div>
                </div>
              </DropdownMenuRadioItem>
            ))
          }
          
          <DropdownMenuSeparator />
          
          {/* Name Sorting */}
          <DropdownMenuLabel className="text-xs text-gray-500 uppercase tracking-wide px-2 py-1">
            Por nombre
          </DropdownMenuLabel>
          {sortOptions
            .filter(option => option.field === 'title')
            .map((option) => (
              <DropdownMenuRadioItem 
                key={`${option.field}-${option.order}`}
                value={`${option.field}-${option.order}`}
                className="flex items-start gap-3 py-2"
              >
                <div className="flex items-center gap-2 flex-1">
                  {option.icon}
                  <div>
                    <div className="font-medium">{option.label}</div>
                    {option.description && (
                      <div className="text-xs text-gray-500">
                        {option.description}
                      </div>
                    )}
                  </div>
                </div>
              </DropdownMenuRadioItem>
            ))
          }
          
          <DropdownMenuSeparator />
          
          {/* Other Sorting Options */}
          <DropdownMenuLabel className="text-xs text-gray-500 uppercase tracking-wide px-2 py-1">
            Otros
          </DropdownMenuLabel>
          {sortOptions
            .filter(option => !['startDate', 'currentAttendees', 'title'].includes(option.field))
            .map((option) => (
              <DropdownMenuRadioItem 
                key={`${option.field}-${option.order}`}
                value={`${option.field}-${option.order}`}
                className="flex items-start gap-3 py-2"
              >
                <div className="flex items-center gap-2 flex-1">
                  {option.icon}
                  <div>
                    <div className="font-medium">{option.label}</div>
                    {option.description && (
                      <div className="text-xs text-gray-500">
                        {option.description}
                      </div>
                    )}
                  </div>
                </div>
              </DropdownMenuRadioItem>
            ))
          }
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Quick sort buttons component
interface QuickSortProps {
  onSortChange: (field: SortField, order: SortOrder) => void;
  className?: string;
}

export function QuickSort({ onSortChange, className = "" }: QuickSortProps) {
  return (
    <div className={`flex gap-2 ${className}`}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onSortChange('startDate', 'asc')}
        className="gap-2"
      >
        <Calendar className="h-4 w-4" />
        Próximos
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onSortChange('currentAttendees', 'desc')}
        className="gap-2"
      >
        <TrendingUp className="h-4 w-4" />
        Populares
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onSortChange('createdAt', 'desc')}
        className="gap-2"
      >
        <Clock className="h-4 w-4" />
        Nuevos
      </Button>
    </div>
  );
}