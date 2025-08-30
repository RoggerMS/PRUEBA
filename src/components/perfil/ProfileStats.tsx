import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Zap } from 'lucide-react';

interface ProfileStatsProps {
  level: number;
  xp: number;
  maxXp: number;
  posts: number;
  followers: number;
  following: number;
  showLevel?: boolean;
}

export function ProfileStats({ 
  level, 
  xp, 
  maxXp, 
  posts, 
  followers, 
  following, 
  showLevel = true 
}: ProfileStatsProps) {
  const xpProgress = (xp / maxXp) * 100;

  return (
    <div className="space-y-4">
      {/* Nivel del usuario - Mostrado de forma sutil */}
      {showLevel && (
        <div className="flex items-center justify-center mb-6">
          <Badge 
            variant="outline" 
            className="px-3 py-1 text-sm font-medium bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 text-blue-700"
          >
            <Zap className="w-3 h-3 mr-1" />
            Nivel {level}
          </Badge>
        </div>
      )}

      {/* Estadísticas principales */}
      <div className="grid grid-cols-3 gap-6 text-center">
        <div className="space-y-1">
          <div className="text-2xl font-bold text-gray-900">{posts}</div>
          <div className="text-sm text-gray-600">Publicaciones</div>
        </div>
        <div className="space-y-1">
          <div className="text-2xl font-bold text-gray-900">{followers}</div>
          <div className="text-sm text-gray-600">Seguidores</div>
        </div>
        <div className="space-y-1">
          <div className="text-2xl font-bold text-gray-900">{following}</div>
          <div className="text-sm text-gray-600">Siguiendo</div>
        </div>
      </div>

      {/* Barra de progreso XP - Solo si se muestra el nivel */}
      {showLevel && (
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>{xp} XP</span>
            <span>{maxXp} XP</span>
          </div>
          <Progress value={xpProgress} className="h-2" />
        </div>
      )}
    </div>
  );
}