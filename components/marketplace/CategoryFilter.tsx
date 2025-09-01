'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight, Filter } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  parentId?: string;
  children?: Category[];
}

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory?: string;
  onCategorySelect: (categoryId: string | undefined) => void;
}

export default function CategoryFilter({ categories, selectedCategory, onCategorySelect }: CategoryFilterProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const toggleExpanded = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const renderCategory = (category: Category, level: number = 0) => {
    const isExpanded = expandedCategories.has(category.id);
    const isSelected = selectedCategory === category.id;
    const hasChildren = category.children && category.children.length > 0;

    return (
      <div key={category.id} className={`ml-${level * 4}`}>
        <div className="flex items-center gap-2 py-2">
          {hasChildren && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleExpanded(category.id)}
              className="p-1 h-6 w-6"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </Button>
          )}
          {!hasChildren && <div className="w-6" />}
          
          <Button
            variant={isSelected ? "default" : "ghost"}
            size="sm"
            onClick={() => onCategorySelect(isSelected ? undefined : category.id)}
            className={`flex-1 justify-start ${isSelected ? 'bg-purple-600 text-white' : ''}`}
          >
            {category.name}
          </Button>
        </div>
        
        {hasChildren && isExpanded && (
          <div className="ml-4">
            {category.children!.map(child => renderCategory(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-purple-600" />
          <h3 className="font-semibold">Categorías</h3>
        </div>
        
        <div className="space-y-1">
          <Button
            variant={!selectedCategory ? "default" : "ghost"}
            size="sm"
            onClick={() => onCategorySelect(undefined)}
            className={`w-full justify-start ${!selectedCategory ? 'bg-purple-600 text-white' : ''}`}
          >
            Todas las categorías
          </Button>
          
          {categories.map(category => renderCategory(category))}
        </div>
        
        {selectedCategory && (
          <div className="mt-4 pt-4 border-t">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Filter className="w-3 h-3" />
              Filtro activo
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
