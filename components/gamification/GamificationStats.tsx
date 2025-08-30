'use client';

import React from 'react';
import { Trophy, Star, Zap, Target, TrendingUp, Calendar, Award, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GamificationStatsProps {
  stats: {
    level: number;
    xp: number;
    xpToNextLevel: number;
    totalXp: number;
    crolars: number;
    streak: number;
    maxStreak: number;
    totalBadges: number;
    earnedBadges: number;
    legendaryBadges: number;
    epicBadges: number;
    rareBadges: number;
    commonBadges: number;
    totalActivities: number;
    lastActivity: string | null;
    joinedAt: string;
    rank?: number;
    totalUsers?: number;
  };
  showDetailed?: boolean;
  className?: string;
}

export function GamificationStats({ stats, showDetailed = true, className }: GamificationStatsProps) {
  const xpProgress = stats.xpToNextLevel > 0 ? (stats.xp / (stats.xp + stats.xpToNextLevel)) * 100 : 100;
  const badgeProgress = stats.totalBadges > 0 ? (stats.earnedBadges / stats.totalBadges) * 100 : 0;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Nunca';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Hoy';
    if (diffDays === 2) return 'Ayer';
    if (diffDays <= 7) return `Hace ${diffDays} días`;
    
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getLevelColor = (level: number) => {
    if (level >= 50) return 'text-yellow-500';
    if (level >= 25) return 'text-purple-500';
    if (level >= 10) return 'text-blue-500';
    return 'text-green-500';
  };

  const getStreakColor = (streak: number) => {
    if (streak >= 30) return 'text-red-500';
    if (streak >= 14) return 'text-orange-500';
    if (streak >= 7) return 'text-yellow-500';
    if (streak >= 3) return 'text-green-500';
    return 'text-gray-500';
  };

  const StatCard = ({ icon: Icon, label, value, color = 'text-gray-600', subtitle }: {
    icon: React.ElementType;
    label: string;
    value: string | number;
    color?: string;
    subtitle?: string;
  }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center space-x-3">
        <div className={cn('p-2 rounded-lg', color.includes('yellow') ? 'bg-yellow-100 dark:bg-yellow-900/20' :
          color.includes('purple') ? 'bg-purple-100 dark:bg-purple-900/20' :
          color.includes('blue') ? 'bg-blue-100 dark:bg-blue-900/20' :
          color.includes('green') ? 'bg-green-100 dark:bg-green-900/20' :
          color.includes('red') ? 'bg-red-100 dark:bg-red-900/20' :
          color.includes('orange') ? 'bg-orange-100 dark:bg-orange-900/20' :
          'bg-gray-100 dark:bg-gray-700'
        )}>
          <Icon className={cn('w-5 h-5', color)} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{label}</p>
          <p className={cn('text-2xl font-bold', color)}>{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className={cn('space-y-6', className)}>
      {/* Estadísticas principales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={Trophy}
          label="Nivel"
          value={stats.level}
          color={getLevelColor(stats.level)}
          subtitle={`${stats.xp} XP`}
        />
        <StatCard
          icon={Zap}
          label="Crolars"
          value={stats.crolars.toLocaleString()}
          color="text-yellow-500"
        />
        <StatCard
          icon={Target}
          label="Racha"
          value={stats.streak}
          color={getStreakColor(stats.streak)}
          subtitle={`Máx: ${stats.maxStreak}`}
        />
        <StatCard
          icon={Award}
          label="Badges"
          value={`${stats.earnedBadges}/${stats.totalBadges}`}
          color="text-purple-500"
          subtitle={`${Math.round(badgeProgress)}% completado`}
        />
      </div>

      {/* Progreso de nivel */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Progreso de Nivel
          </h3>
          <div className="text-right">
            <p className="text-2xl font-bold text-blue-500">Nivel {stats.level}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {stats.xp} / {stats.xp + stats.xpToNextLevel} XP
            </p>
          </div>
        </div>
        
        <div className="relative">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${Math.min(100, xpProgress)}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-600 dark:text-gray-400">
            <span>Nivel {stats.level}</span>
            <span>{Math.round(xpProgress)}%</span>
            <span>Nivel {stats.level + 1}</span>
          </div>
        </div>
      </div>

      {showDetailed && (
        <>
          {/* Distribución de badges */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Distribución de Badges
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center">
                  <Crown className="w-6 h-6 text-yellow-500" />
                </div>
                <p className="text-2xl font-bold text-yellow-500">{stats.legendaryBadges}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Legendarios</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-purple-500" />
                </div>
                <p className="text-2xl font-bold text-purple-500">{stats.epicBadges}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Épicos</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                  <Award className="w-6 h-6 text-blue-500" />
                </div>
                <p className="text-2xl font-bold text-blue-500">{stats.rareBadges}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Raros</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <Star className="w-6 h-6 text-gray-500" />
                </div>
                <p className="text-2xl font-bold text-gray-500">{stats.commonBadges}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Comunes</p>
              </div>
            </div>
          </div>

          {/* Estadísticas adicionales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Actividad
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Total de actividades</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {stats.totalActivities.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Última actividad</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {formatDate(stats.lastActivity)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Miembro desde</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {new Date(stats.joinedAt).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'short'
                    })}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Ranking
              </h3>
              <div className="space-y-3">
                {stats.rank && stats.totalUsers && (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Posición global</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        #{stats.rank}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">De total usuarios</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {stats.totalUsers.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Percentil</span>
                      <span className="font-semibold text-green-500">
                        Top {Math.round((1 - stats.rank / stats.totalUsers) * 100)}%
                      </span>
                    </div>
                  </>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">XP total</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {stats.totalXp.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default GamificationStats;