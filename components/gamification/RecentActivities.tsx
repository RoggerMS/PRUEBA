'use client';

import React, { useState } from 'react';
import { 
  Trophy, 
  Star, 
  Heart, 
  MessageCircle, 
  UserPlus, 
  TrendingUp, 
  Award, 
  Zap,
  Calendar,
  Filter,
  ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Activity {
  id: string;
  type: string;
  description: string;
  xpGained: number;
  crolarsGained: number;
  createdAt: string;
  metadata?: {
    postId?: string;
    userId?: string;
    badgeId?: string;
    achievementId?: string;
    [key: string]: any;
  };
}

interface RecentActivitiesProps {
  activities: Activity[];
  userId: string;
  showFilters?: boolean;
  maxItems?: number;
  className?: string;
}

const activityIcons = {
  'post_created': MessageCircle,
  'post_liked': Heart,
  'user_followed': UserPlus,
  'comment_created': MessageCircle,
  'badge_earned': Award,
  'achievement_unlocked': Trophy,
  'level_reached': TrendingUp,
  'streak_milestone': Zap,
  'daily_login': Calendar,
  'profile_completed': Star,
  'first_post': MessageCircle,
  'social_butterfly': UserPlus,
  'content_creator': MessageCircle,
  'engagement_master': Heart,
  'default': Star
};

const activityColors = {
  'post_created': 'text-blue-500 bg-blue-100 dark:bg-blue-900/20',
  'post_liked': 'text-red-500 bg-red-100 dark:bg-red-900/20',
  'user_followed': 'text-green-500 bg-green-100 dark:bg-green-900/20',
  'comment_created': 'text-purple-500 bg-purple-100 dark:bg-purple-900/20',
  'badge_earned': 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/20',
  'achievement_unlocked': 'text-orange-500 bg-orange-100 dark:bg-orange-900/20',
  'level_reached': 'text-indigo-500 bg-indigo-100 dark:bg-indigo-900/20',
  'streak_milestone': 'text-pink-500 bg-pink-100 dark:bg-pink-900/20',
  'daily_login': 'text-teal-500 bg-teal-100 dark:bg-teal-900/20',
  'profile_completed': 'text-cyan-500 bg-cyan-100 dark:bg-cyan-900/20',
  'default': 'text-gray-500 bg-gray-100 dark:bg-gray-700'
};

const activityLabels = {
  'post_created': 'Publicación creada',
  'post_liked': 'Publicación gustada',
  'user_followed': 'Usuario seguido',
  'comment_created': 'Comentario creado',
  'badge_earned': 'Badge obtenido',
  'achievement_unlocked': 'Logro desbloqueado',
  'level_reached': 'Nivel alcanzado',
  'streak_milestone': 'Hito de racha',
  'daily_login': 'Inicio de sesión diario',
  'profile_completed': 'Perfil completado',
  'first_post': 'Primera publicación',
  'social_butterfly': 'Mariposa social',
  'content_creator': 'Creador de contenido',
  'engagement_master': 'Maestro del engagement'
};

export function RecentActivities({ 
  activities, 
  userId, 
  showFilters = true, 
  maxItems,
  className 
}: RecentActivitiesProps) {
  const [filter, setFilter] = useState<string>('all');
  const [timeFilter, setTimeFilter] = useState<string>('all');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // Filtrar actividades
  const filteredActivities = activities.filter(activity => {
    // Filtro por tipo
    if (filter !== 'all') {
      if (filter === 'badges' && !['badge_earned', 'achievement_unlocked'].includes(activity.type)) {
        return false;
      }
      if (filter === 'social' && !['user_followed', 'post_liked', 'comment_created'].includes(activity.type)) {
        return false;
      }
      if (filter === 'content' && !['post_created', 'comment_created'].includes(activity.type)) {
        return false;
      }
      if (filter === 'progress' && !['level_reached', 'streak_milestone', 'daily_login'].includes(activity.type)) {
        return false;
      }
    }

    // Filtro por tiempo
    if (timeFilter !== 'all') {
      const activityDate = new Date(activity.createdAt);
      const now = new Date();
      const diffTime = now.getTime() - activityDate.getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);

      if (timeFilter === 'today' && diffDays > 1) return false;
      if (timeFilter === 'week' && diffDays > 7) return false;
      if (timeFilter === 'month' && diffDays > 30) return false;
    }

    return true;
  });

  // Limitar cantidad si se especifica
  const displayActivities = maxItems ? filteredActivities.slice(0, maxItems) : filteredActivities;

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return 'Ahora mismo';
    if (diffMinutes < 60) return `Hace ${diffMinutes}m`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;
    
    return date.toLocaleDateString('es-ES', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getActivityIcon = (type: string) => {
    return activityIcons[type as keyof typeof activityIcons] || activityIcons.default;
  };

  const getActivityColor = (type: string) => {
    return activityColors[type as keyof typeof activityColors] || activityColors.default;
  };

  const getActivityLabel = (type: string) => {
    return activityLabels[type as keyof typeof activityLabels] || type;
  };

  if (activities.length === 0) {
    return (
      <div className={cn('text-center py-8', className)}>
        <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          No hay actividades recientes
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Las actividades de gamificación aparecerán aquí
        </p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Filtros */}
      {showFilters && !maxItems && (
        <div className="flex flex-wrap gap-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          {/* Filtros por tipo */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilter('all')}
              className={cn(
                'px-3 py-1 rounded-full text-sm font-medium transition-colors',
                filter === 'all'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
              )}
            >
              Todas
            </button>
            <button
              onClick={() => setFilter('badges')}
              className={cn(
                'px-3 py-1 rounded-full text-sm font-medium transition-colors',
                filter === 'badges'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
              )}
            >
              Badges
            </button>
            <button
              onClick={() => setFilter('social')}
              className={cn(
                'px-3 py-1 rounded-full text-sm font-medium transition-colors',
                filter === 'social'
                  ? 'bg-green-500 text-white'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
              )}
            >
              Social
            </button>
            <button
              onClick={() => setFilter('content')}
              className={cn(
                'px-3 py-1 rounded-full text-sm font-medium transition-colors',
                filter === 'content'
                  ? 'bg-purple-500 text-white'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
              )}
            >
              Contenido
            </button>
            <button
              onClick={() => setFilter('progress')}
              className={cn(
                'px-3 py-1 rounded-full text-sm font-medium transition-colors',
                filter === 'progress'
                  ? 'bg-indigo-500 text-white'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
              )}
            >
              Progreso
            </button>
          </div>

          {/* Filtro por tiempo */}
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="px-3 py-1 rounded-md text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
          >
            <option value="all">Todo el tiempo</option>
            <option value="today">Hoy</option>
            <option value="week">Esta semana</option>
            <option value="month">Este mes</option>
          </select>
        </div>
      )}

      {/* Lista de actividades */}
      <div className="space-y-3">
        {displayActivities.map((activity) => {
          const Icon = getActivityIcon(activity.type);
          const colorClasses = getActivityColor(activity.type);
          const [textColor, bgColor] = colorClasses.split(' ');

          return (
            <div
              key={activity.id}
              className="flex items-start space-x-3 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
            >
              {/* Icono */}
              <div className={cn('p-2 rounded-full flex-shrink-0', bgColor)}>
                <Icon className={cn('w-4 h-4', textColor)} />
              </div>

              {/* Contenido */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {getActivityLabel(activity.type)}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {activity.description}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatTimeAgo(activity.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Recompensas */}
                {(activity.xpGained > 0 || activity.crolarsGained > 0) && (
                  <div className="flex items-center space-x-4 mt-2">
                    {activity.xpGained > 0 && (
                      <div className="flex items-center space-x-1">
                        <Star className="w-3 h-3 text-blue-500" />
                        <span className="text-xs font-medium text-blue-500">
                          +{activity.xpGained} XP
                        </span>
                      </div>
                    )}
                    {activity.crolarsGained > 0 && (
                      <div className="flex items-center space-x-1">
                        <Zap className="w-3 h-3 text-yellow-500" />
                        <span className="text-xs font-medium text-yellow-500">
                          +{activity.crolarsGained} Crolars
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Mostrar más actividades si hay límite */}
      {maxItems && activities.length > maxItems && (
        <div className="text-center">
          <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
            Ver todas las actividades ({activities.length})
          </button>
        </div>
      )}

      {/* Mensaje si no hay actividades después del filtro */}
      {displayActivities.length === 0 && activities.length > 0 && (
        <div className="text-center py-8">
          <Filter className="mx-auto h-8 w-8 text-gray-400 mb-2" />
          <p className="text-gray-500 dark:text-gray-400">
            No se encontraron actividades con los filtros seleccionados
          </p>
        </div>
      )}
    </div>
  );
}

export default RecentActivities;