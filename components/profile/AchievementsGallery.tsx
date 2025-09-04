'use client';

import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Trophy, Star, Crown, Zap, Lock, Calendar, Target, Award, Filter, Search, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface AchievementsGalleryProps {
  userId: string;
  isOwnProfile?: boolean;
  className?: string;
}

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
  isEarned: boolean;
  earnedAt: string | null;
  progressPercentage: number;
}

interface AchievementData {
  id: string;
  name: string;
  description: string;
  type: string;
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  targetValue: number;
  currentProgress: number;
  isCompleted: boolean;
  completedAt: string | null;
  xpReward: number;
  badge?: {
    id: string;
    name: string;
    icon: string;
  };
}

interface StatsData {
  totalBadges: number;
  earnedBadges: number;
  totalAchievements: number;
  completedAchievements: number;
  totalXP: number;
  recentEarned: BadgeData[];
}

const rarityColors = {
  COMMON: {
    bg: 'bg-gray-50 dark:bg-gray-800',
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
  RARE: Trophy,
  EPIC: Award,
  LEGENDARY: Crown
};

export function AchievementsGallery({ userId, isOwnProfile = false, className }: AchievementsGalleryProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [rarityFilter, setRarityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Fetch badges data
  const { data: badgesData, isLoading: badgesLoading } = useQuery({
    queryKey: ['badges', userId],
    queryFn: async () => {
      const response = await fetch(`/api/gamification/user/${userId}/badges`);
      if (!response.ok) throw new Error('Failed to fetch badges');
      return response.json() as BadgeData[];
    }
  });

  // Fetch achievements data
  const { data: achievementsData, isLoading: achievementsLoading } = useQuery({
    queryKey: ['achievements', userId],
    queryFn: async () => {
      const response = await fetch(`/api/gamification/achievements?userId=${userId}`);
      if (!response.ok) throw new Error('Failed to fetch achievements');
      return response.json() as AchievementData[];
    }
  });

  // Calculate stats
  const stats: StatsData = useMemo(() => {
    if (!badgesData || !achievementsData) {
      return {
        totalBadges: 0,
        earnedBadges: 0,
        totalAchievements: 0,
        completedAchievements: 0,
        totalXP: 0,
        recentEarned: []
      };
    }

    const earnedBadges = badgesData.filter(b => b.isEarned);
    const completedAchievements = achievementsData.filter(a => a.isCompleted);
    const totalXP = completedAchievements.reduce((sum, a) => sum + a.xpReward, 0);
    const recentEarned = earnedBadges
      .filter(b => b.earnedAt)
      .sort((a, b) => new Date(b.earnedAt!).getTime() - new Date(a.earnedAt!).getTime())
      .slice(0, 6);

    return {
      totalBadges: badgesData.length,
      earnedBadges: earnedBadges.length,
      totalAchievements: achievementsData.length,
      completedAchievements: completedAchievements.length,
      totalXP,
      recentEarned
    };
  }, [badgesData, achievementsData]);

  // Filter badges
  const filteredBadges = useMemo(() => {
    if (!badgesData) return [];
    
    return badgesData.filter(badge => {
      const matchesSearch = badge.badge.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           badge.badge.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRarity = rarityFilter === 'all' || badge.badge.rarity === rarityFilter;
      const matchesCategory = categoryFilter === 'all' || badge.badge.category === categoryFilter;
      const matchesStatus = statusFilter === 'all' || 
                           (statusFilter === 'earned' && badge.isEarned) ||
                           (statusFilter === 'unearned' && !badge.isEarned);
      
      return matchesSearch && matchesRarity && matchesCategory && matchesStatus;
    });
  }, [badgesData, searchTerm, rarityFilter, categoryFilter, statusFilter]);

  // Filter achievements
  const filteredAchievements = useMemo(() => {
    if (!achievementsData) return [];
    
    return achievementsData.filter(achievement => {
      const matchesSearch = achievement.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           achievement.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRarity = rarityFilter === 'all' || achievement.rarity === rarityFilter;
      const matchesStatus = statusFilter === 'all' || 
                           (statusFilter === 'earned' && achievement.isCompleted) ||
                           (statusFilter === 'unearned' && !achievement.isCompleted);
      
      return matchesSearch && matchesRarity && matchesStatus;
    });
  }, [achievementsData, searchTerm, rarityFilter, statusFilter]);

  // Get unique categories
  const categories = useMemo(() => {
    if (!badgesData) return [];
    return Array.from(new Set(badgesData.map(b => b.badge.category)));
  }, [badgesData]);

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

  if (badgesLoading || achievementsLoading) {
    return (
      <div className={cn('space-y-6', className)}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-xl mb-2" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Badges Ganados</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.earnedBadges}/{stats.totalBadges}
                </p>
              </div>
              <Trophy className="h-8 w-8 text-yellow-500" />
            </div>
            <Progress 
              value={(stats.earnedBadges / Math.max(stats.totalBadges, 1)) * 100} 
              className="mt-2" 
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Logros</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.completedAchievements}/{stats.totalAchievements}
                </p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
            <Progress 
              value={(stats.completedAchievements / Math.max(stats.totalAchievements, 1)) * 100} 
              className="mt-2" 
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">XP Total</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.totalXP.toLocaleString()}
                </p>
              </div>
              <Zap className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Progreso</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {Math.round(((stats.earnedBadges + stats.completedAchievements) / Math.max(stats.totalBadges + stats.totalAchievements, 1)) * 100)}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
          <TabsTrigger value="achievements">Logros</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Recent Badges */}
          {stats.recentEarned.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Badges Recientes
                </CardTitle>
                <CardDescription>
                  Últimos badges ganados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                  {stats.recentEarned.map((badgeData) => {
                    const { badge } = badgeData;
                    const rarityStyle = rarityColors[badge.rarity];
                    const RarityIcon = getRarityIcon(badge.rarity);

                    return (
                      <div
                        key={badgeData.id}
                        className={cn(
                          'relative group cursor-pointer transition-all duration-300 hover:scale-105',
                          'p-3 rounded-xl border-2',
                          rarityStyle.bg,
                          rarityStyle.border,
                          `hover:shadow-lg ${rarityStyle.glow}`
                        )}
                      >
                        <div className="relative mb-2">
                          <div className="w-10 h-10 mx-auto rounded-full bg-white dark:bg-gray-700 flex items-center justify-center text-lg">
                            {badge.icon ? (
                              <span>{badge.icon}</span>
                            ) : (
                              <RarityIcon className={cn('w-5 h-5', rarityStyle.text)} />
                            )}
                          </div>
                          <div className={cn(
                            'absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center',
                            rarityStyle.bg,
                            rarityStyle.border,
                            'border'
                          )}>
                            <RarityIcon className={cn('w-2 h-2', rarityStyle.text)} />
                          </div>
                        </div>
                        <h3 className={cn(
                          'text-xs font-semibold text-center mb-1 line-clamp-2',
                          rarityStyle.text
                        )}>
                          {badge.name}
                        </h3>
                        {badgeData.earnedAt && (
                          <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                            {formatDate(badgeData.earnedAt)}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Progress Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Progreso por Rareza
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(['LEGENDARY', 'EPIC', 'RARE', 'COMMON'] as const).map((rarity) => {
                  const total = badgesData?.filter(b => b.badge.rarity === rarity).length || 0;
                  const earned = badgesData?.filter(b => b.badge.rarity === rarity && b.isEarned).length || 0;
                  const percentage = total > 0 ? (earned / total) * 100 : 0;
                  const rarityStyle = rarityColors[rarity];
                  const RarityIcon = getRarityIcon(rarity);

                  return (
                    <div key={rarity} className="flex items-center gap-4">
                      <div className="flex items-center gap-2 min-w-[120px]">
                        <RarityIcon className={cn('w-4 h-4', rarityStyle.text)} />
                        <span className={cn('text-sm font-medium', rarityStyle.text)}>
                          {rarity.charAt(0) + rarity.slice(1).toLowerCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <Progress value={percentage} className="h-2" />
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[60px] text-right">
                        {earned}/{total}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="badges" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar badges..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="earned">Ganados</SelectItem>
                    <SelectItem value="unearned">Pendientes</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={rarityFilter} onValueChange={setRarityFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Rareza" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="LEGENDARY">Legendario</SelectItem>
                    <SelectItem value="EPIC">Épico</SelectItem>
                    <SelectItem value="RARE">Raro</SelectItem>
                    <SelectItem value="COMMON">Común</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Badges Grid */}
          {filteredBadges.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {filteredBadges.map((badgeData) => {
                const { badge, isEarned, progressPercentage, earnedAt } = badgeData;
                const rarityStyle = rarityColors[badge.rarity];
                const RarityIcon = getRarityIcon(badge.rarity);

                return (
                  <div
                    key={badgeData.id}
                    className={cn(
                      'relative group cursor-pointer transition-all duration-300 hover:scale-105',
                      'p-4 rounded-xl border-2',
                      rarityStyle.bg,
                      rarityStyle.border,
                      isEarned ? 'opacity-100' : 'opacity-60',
                      isEarned && `hover:shadow-lg ${rarityStyle.glow}`
                    )}
                  >
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
                      
                      <div className={cn(
                        'absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center',
                        rarityStyle.bg,
                        rarityStyle.border,
                        'border'
                      )}>
                        <RarityIcon className={cn('w-3 h-3', rarityStyle.text)} />
                      </div>

                      {!isEarned && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                          <Lock className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>

                    <h3 className={cn(
                      'text-xs font-semibold text-center mb-1 line-clamp-2',
                      rarityStyle.text
                    )}>
                      {badge.name}
                    </h3>

                    {!isEarned && progressPercentage > 0 && (
                      <div className="mb-2">
                        <Progress value={progressPercentage} className="h-1.5" />
                        <p className="text-xs text-center mt-1 text-gray-500 dark:text-gray-400">
                          {Math.round(progressPercentage)}%
                        </p>
                      </div>
                    )}

                    {isEarned && earnedAt && (
                      <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                        {formatDate(earnedAt)}
                      </p>
                    )}

                    {/* Tooltip */}
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
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Trophy className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  No se encontraron badges
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Intenta ajustar los filtros de búsqueda
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          {/* Achievements List */}
          {filteredAchievements.length > 0 ? (
            <div className="space-y-4">
              {filteredAchievements.map((achievement) => {
                const rarityStyle = rarityColors[achievement.rarity];
                const RarityIcon = getRarityIcon(achievement.rarity);
                const progress = (achievement.currentProgress / achievement.targetValue) * 100;

                return (
                  <Card key={achievement.id} className={cn(
                    'transition-all duration-300 hover:shadow-md',
                    achievement.isCompleted && `border-l-4 ${rarityStyle.border.replace('border-', 'border-l-')}`
                  )}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={cn(
                          'w-12 h-12 rounded-full flex items-center justify-center',
                          rarityStyle.bg,
                          rarityStyle.border,
                          'border-2'
                        )}>
                          {achievement.badge?.icon ? (
                            <span className="text-xl">{achievement.badge.icon}</span>
                          ) : (
                            <RarityIcon className={cn('w-6 h-6', rarityStyle.text)} />
                          )}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                {achievement.name}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {achievement.description}
                              </p>
                            </div>
                            <div className="text-right">
                              <Badge variant={achievement.isCompleted ? 'default' : 'secondary'}>
                                {achievement.rarity.toLowerCase()}
                              </Badge>
                              {achievement.isCompleted && (
                                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                                  +{achievement.xpReward} XP
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600 dark:text-gray-400">
                                Progreso: {achievement.currentProgress}/{achievement.targetValue}
                              </span>
                              <span className="font-medium">
                                {Math.round(progress)}%
                              </span>
                            </div>
                            <Progress value={progress} className="h-2" />
                          </div>

                          {achievement.completedAt && (
                            <div className="flex items-center gap-2 mt-3 text-sm text-gray-500 dark:text-gray-400">
                              <Calendar className="w-4 h-4" />
                              Completado el {formatDate(achievement.completedAt)}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Target className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  No se encontraron logros
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Intenta ajustar los filtros de búsqueda
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}