'use client';

import { TrendingUp, Hash, ArrowUpRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface TrendingTopic {
  id: string;
  name: string;
  category: 'carrera' | 'materia' | 'general';
  posts: number;
  growth: number;
  isHot: boolean;
}

const trendingTopics: TrendingTopic[] = [
  {
    id: '1',
    name: 'Cálculo Diferencial',
    category: 'materia',
    posts: 234,
    growth: 45,
    isHot: true
  },
  {
    id: '2',
    name: 'Ingeniería de Software',
    category: 'carrera',
    posts: 189,
    growth: 32,
    isHot: true
  },
  {
    id: '3',
    name: 'Exámenes Finales',
    category: 'general',
    posts: 156,
    growth: 28,
    isHot: false
  },
  {
    id: '4',
    name: 'Algoritmos y Estructuras',
    category: 'materia',
    posts: 143,
    growth: 22,
    isHot: false
  },
  {
    id: '5',
    name: 'Medicina',
    category: 'carrera',
    posts: 128,
    growth: 18,
    isHot: false
  },
  {
    id: '6',
    name: 'Becas y Oportunidades',
    category: 'general',
    posts: 95,
    growth: 15,
    isHot: false
  }
];

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'carrera':
      return 'bg-blue-100 text-blue-700';
    case 'materia':
      return 'bg-green-100 text-green-700';
    case 'general':
      return 'bg-purple-100 text-purple-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

const getCategoryLabel = (category: string) => {
  switch (category) {
    case 'carrera':
      return 'Carrera';
    case 'materia':
      return 'Materia';
    case 'general':
      return 'General';
    default:
      return 'Otro';
  }
};

export function TrendingTopics() {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-lg font-semibold">
          <TrendingUp className="w-5 h-5 text-crunevo-600" />
          <span>Tendencias</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {trendingTopics.map((topic, index) => (
          <Link 
            key={topic.id} 
            href={`/search?q=${encodeURIComponent(topic.name)}`}
            className="block group"
          >
            <div className={cn(
              'flex items-center justify-between p-3 rounded-lg transition-all duration-200',
              'hover:bg-crunevo-50 hover:shadow-sm border border-transparent hover:border-crunevo-200'
            )}>
              <div className="flex items-center space-x-3 flex-1">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-500">
                    {index + 1}
                  </span>
                  {topic.isHot && (
                    <div className="w-2 h-2 bg-fire rounded-full animate-pulse" />
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <Hash className="w-3 h-3 text-gray-400" />
                    <span className="font-medium text-gray-900 group-hover:text-crunevo-700 transition-colors">
                      {topic.name}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant="secondary" 
                      className={cn('text-xs', getCategoryColor(topic.category))}
                    >
                      {getCategoryLabel(topic.category)}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {topic.posts} publicaciones
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="text-right">
                  <div className="flex items-center space-x-1 text-green-600">
                    <ArrowUpRight className="w-3 h-3" />
                    <span className="text-xs font-medium">+{topic.growth}%</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
        
        {/* Ver más tendencias */}
        <Link 
          href="/trending" 
          className="block text-center py-2 text-sm text-crunevo-600 hover:text-crunevo-700 font-medium transition-colors"
        >
          Ver todas las tendencias
        </Link>
      </CardContent>
    </Card>
  );
}