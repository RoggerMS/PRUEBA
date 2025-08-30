'use client';

import React, { useState, useEffect } from 'react';
import { Badge, Trophy, Star, Crown, Zap, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BadgeData {
  id: string;
  badge: {
    id: string;
    name: string;
    description: string;
    icon: string;
    rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
    category: string;
  };
  progress: number;
  earnedAt: string | null;
  isEarned: boolean;
  progressPercentage: number;
}

interface BadgeGridProps {
  userId: string;
  badges: BadgeData[];
  isOwnProfile?: boolean;
  showProgress?: boolean;
  maxDisplay?: number;
  onBadgeClick?: (badge: BadgeData) => void;
}

const rarityColors = {
  COMMON: {
    bg: 'bg-gray-100 dark:bg-gray-800',
    border: 'border-gray-300 dark:border-gray-600',
    text: 'text-gray-700 dark:text-gray-300',
    glow: 'shadow-gray-200 dark:shadow-gray-700'
  },
  RARE: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-300 dark:border-blue-600',
    text: 'text-blue-700 dark:text-blue-300',
    glow: 'shadow-blue-200 dark:shadow-blue-700'
  },
  EPIC: {
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    border: 'border-purple-300 dark:border-purple-600',
    text: 'text-purple-700 dark:text-purple-300',
    glow: 'shadow-purple-200 dark:shadow-purple-700'
  },
  LEGENDARY: {
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    border: 'border-yellow-300 dark:border-yellow-600',
    text: 'text-yellow-700 dark:text-yellow-300',
    glow: 'shadow-yellow-200 dark:shadow-yellow-700'
  }
};

const rarityIcons = {
  COMMON: Star,
  RARE: Badge,
  EPIC: Trophy,
  LEGENDARY: Crown
};

export function BadgeGrid({ 
  userId, 
  badges, 
  isOwnProfile = false, 
  showProgress = true,
  maxDisplay,
  onBadgeClick 
}: BadgeGridProps) {
  const [filter, setFilter] = useState<'all' | 'earned' | 'unearned'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [rarityFilter, setRarityFilter] = useState<string>('all');

  // Filtrar badges
  const filteredBadges = badges.filter(badge => {
    if (filter === 'earned' && !badge.isEarned) return false;
    if (filter === 'unearned' && badge.isEarned) return false;
    if (categoryFilter !== 'all' && badge.badge.category !== categoryFilter) return false;
    if (rarityFilter !== 'all' && badge.badge.rarity !== rarityFilter) return false;
    return true;
  });

  // Limitar cantidad si se especifica
  const displayBadges = maxDisplay ? filteredBadges.slice(0, maxDisplay) : filteredBadges;

  // Obtener categorías únicas
  const categories = [...new Set(badges.map(b => b.badge.category))];

  const handleBadgeClick = (badge: BadgeData) => {
    if (onBadgeClick) {
      onBadgeClick(badge);
    }
  };

  const getRarityIcon = (rarity: string) => {
    const IconComponent = rarityIcons[rarity as keyof typeof rarityIcons] || Star;
    return IconComponent;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (badges.length === 0) {
    return (
      <div className="text-center py-12">
        <Trophy className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          {isOwnProfile ? 'Aún no tienes badges' : 'Este usuario no tiene badges'}
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          {isOwnProfile 
            ? 'Participa en la comunidad para ganar tus primeros badges'
            : 'Los badges aparecerán aquí cuando los gane'
          }
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      {!maxDisplay && (
        <div className="flex flex-wrap gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          {/* Filtro por estado */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={cn(
                'px-3 py-1 rounded-full text-sm font-medium transition-colors',
                filter === 'all'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
              )}
            >
              Todos ({badges.length})
            </button>
            <button
              onClick={() => setFilter('earned')}
              className={cn(
                'px-3 py-1 rounded-full text-sm font-medium transition-colors',
                filter === 'earned'
                  ? 'bg-green-500 text-white'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
              )}
            >
              Ganados ({badges.filter(b => b.isEarned).length})
            </button>
            <button
              onClick={() => setFilter('unearned')}
              className={cn(
                'px-3 py-1 rounded-full text-sm font-medium transition-colors',
                filter === 'unearned'
                  ? 'bg-orange-500 text-white'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
              )}
            >
              Pendientes ({badges.filter(b => !b.isEarned).length})
            </button>
          </div>

          {/* Filtro por categoría */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1 rounded-md text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
          >
            <option value="all">Todas las categorías</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          {/* Filtro por rareza */}
          <select
            value={rarityFilter}
            onChange={(e) => setRarityFilter(e.target.value)}
            className="px-3 py-1 rounded-md text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
          >
            <option value="all">Todas las rarezas</option>
            <option value="COMMON">Común</option>
            <option value="RARE">Raro</option>
            <option value="EPIC">Épico</option>
            <option value="LEGENDARY">Legendario</option>
          </select>
        </div>
      )}

      {/* Grid de badges */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {displayBadges.map((badgeData) => {
          const { badge, isEarned, progressPercentage, earnedAt } = badgeData;
          const rarityStyle = rarityColors[badge.rarity];
          const RarityIcon = getRarityIcon(badge.rarity);

          return (
            <div
              key={badgeData.id}
              onClick={() => handleBadgeClick(badgeData)}
              className={cn(
                'relative group cursor-pointer transition-all duration-300 hover:scale-105',
                'p-4 rounded-xl border-2',
                rarityStyle.bg,
                rarityStyle.border,
                isEarned ? 'opacity-100' : 'opacity-60',
                isEarned && `hover:shadow-lg ${rarityStyle.glow}`
              )}
            >
              {/* Badge Icon */}
              <div className="relative mb-3">
                <div className={cn(
                  'w-12 h-12 mx-auto rounded-full flex items-center justify-center text-2xl',
                  isEarned ? 'bg-white dark:bg-gray-700' : 'bg-gray-200 dark:bg-gray-600'
                )}>
                  {badge.icon ? (
                    <span>{badge.icon}</span>
                  ) : (
                    <RarityIcon className={cn('w-6 h-6', rarityStyle.text)} />
                  )}
                </div>
                
                {/* Rarity indicator */}
                <div className={cn(
                  'absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center',
                  rarityStyle.bg,
                  rarityStyle.border,
                  'border'
                )}>
                  <RarityIcon className={cn('w-3 h-3', rarityStyle.text)} />
                </div>

                {/* Lock overlay for unearned badges */}
                {!isEarned && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                    <Lock className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>

              {/* Badge Name */}
              <h3 className={cn(
                'text-xs font-semibold text-center mb-1 line-clamp-2',
                rarityStyle.text
              )}>
                {badge.name}
              </h3>

              {/* Progress Bar (for unearned badges) */}
              {!isEarned && showProgress && progressPercentage > 0 && (
                <div className="mb-2">
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                    <div 
                      className={cn(
                        'h-1.5 rounded-full transition-all duration-300',
                        badge.rarity === 'LEGENDARY' ? 'bg-yellow-500' :
                        badge.rarity === 'EPIC' ? 'bg-purple-500' :
                        badge.rarity === 'RARE' ? 'bg-blue-500' : 'bg-gray-500'
                      )}
                      style={{ width: `${Math.min(100, progressPercentage)}%` }}
                    />
                  </div>
                  <p className="text-xs text-center mt-1 text-gray-500 dark:text-gray-400">
                    {Math.round(progressPercentage)}%
                  </p>
                </div>
              )}

              {/* Earned Date */}
              {isEarned && earnedAt && (
                <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                  {formatDate(earnedAt)}
                </p>
              )}

              {/* Hover tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-black text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 whitespace-nowrap">
                <div className="font-semibold">{badge.name}</div>
                <div className="text-gray-300">{badge.description}</div>
                {!isEarned && progressPercentage > 0 && (
                  <div className="text-gray-300">Progreso: {Math.round(progressPercentage)}%</div>
                )}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Mostrar más badges si hay límite */}
      {maxDisplay && badges.length > maxDisplay && (
        <div className="text-center">
          <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
            Ver todos los badges ({badges.length})
          </button>
        </div>
      )}

      {/* Mensaje si no hay badges después del filtro */}
      {displayBadges.length === 0 && badges.length > 0 && (
        <div className="text-center py-8">
          <Trophy className="mx-auto h-8 w-8 text-gray-400 mb-2" />
          <p className="text-gray-500 dark:text-gray-400">
            No se encontraron badges con los filtros seleccionados
          </p>
        </div>
      )}
    </div>
  );
}

export default BadgeGrid;