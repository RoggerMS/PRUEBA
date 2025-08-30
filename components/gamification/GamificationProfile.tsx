'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { 
  Trophy, 
  Star, 
  Award, 
  Activity, 
  TrendingUp, 
  RefreshCw,
  Share2,
  Settings,
  Eye,
  EyeOff
} from 'lucide-react';
import { cn } from '@/lib/utils';

import { BadgeGrid } from './BadgeGrid';
import { GamificationStats } from './GamificationStats';
import { RecentActivities } from './RecentActivities';

interface GamificationProfileProps {
  userId: string;
  isOwnProfile?: boolean;
  className?: string;
}

interface UserGamificationData {
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
  badges: Array<{
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
  }>;
  activities: Array<{
    id: string;
    type: string;
    description: string;
    xpGained: number;
    crolarsGained: number;
    createdAt: string;
    metadata?: any;
  }>;
  progressCounters: Array<{
    id: string;
    type: string;
    currentValue: number;
    targetValue: number;
    progress: number;
  }>;
}

export function GamificationProfile({ userId, isOwnProfile = false, className }: GamificationProfileProps) {
  const { data: session } = useSession();
  const [data, setData] = useState<UserGamificationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [showPrivateStats, setShowPrivateStats] = useState(isOwnProfile);

  // Cargar datos de gamificación
  const loadGamificationData = async () => {
    try {
      setError(null);
      
      // Cargar estadísticas y badges
      const [statsResponse, badgesResponse, activitiesResponse] = await Promise.all([
        fetch(`/api/gamification/user/${userId}/progress`),
        fetch(`/api/gamification/user/${userId}/badges`),
        fetch(`/api/gamification/user/${userId}/progress?include=activities&limit=20`)
      ]);

      if (!statsResponse.ok || !badgesResponse.ok || !activitiesResponse.ok) {
        throw new Error('Error al cargar los datos de gamificación');
      }

      const [statsData, badgesData, activitiesData] = await Promise.all([
        statsResponse.json(),
        badgesResponse.json(),
        activitiesResponse.json()
      ]);

      setData({
        stats: statsData.stats,
        badges: badgesData.badges,
        activities: activitiesData.activities || [],
        progressCounters: statsData.progressCounters || []
      });
    } catch (err) {
      console.error('Error loading gamification data:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      toast.error('Error al cargar los datos de gamificación');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Refrescar datos
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadGamificationData();
    toast.success('Datos actualizados');
  };

  // Compartir perfil
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Perfil de gamificación de ${isOwnProfile ? 'mi' : 'usuario'}`,
          text: `¡Mira mi progreso en la plataforma! Nivel ${data?.stats.level}, ${data?.stats.earnedBadges} badges obtenidos.`,
          url: window.location.href
        });
      } catch (err) {
        // Usuario canceló o error
      }
    } else {
      // Fallback: copiar al portapapeles
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Enlace copiado al portapapeles');
      } catch (err) {
        toast.error('Error al copiar el enlace');
      }
    }
  };

  useEffect(() => {
    loadGamificationData();
  }, [userId]);

  if (loading) {
    return (
      <div className={cn('space-y-6', className)}>
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className={cn('text-center py-12', className)}>
        <Trophy className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          Error al cargar el perfil
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          {error || 'No se pudieron cargar los datos de gamificación'}
        </p>
        <Button onClick={loadGamificationData} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {isOwnProfile ? 'Mi Perfil de Gamificación' : 'Perfil de Gamificación'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Nivel {data.stats.level} • {data.stats.earnedBadges} badges obtenidos
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {isOwnProfile && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPrivateStats(!showPrivateStats)}
            >
              {showPrivateStats ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="w-4 h-4 mr-2" />
            Compartir
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={cn('w-4 h-4 mr-2', refreshing && 'animate-spin')} />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Estadísticas principales */}
      <GamificationStats 
        stats={data.stats} 
        showDetailed={showPrivateStats}
      />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <Trophy className="w-4 h-4" />
            <span>Resumen</span>
          </TabsTrigger>
          <TabsTrigger value="badges" className="flex items-center space-x-2">
            <Award className="w-4 h-4" />
            <span>Badges</span>
          </TabsTrigger>
          <TabsTrigger value="activities" className="flex items-center space-x-2">
            <Activity className="w-4 h-4" />
            <span>Actividades</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Badges destacados */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="w-5 h-5" />
                  <span>Badges Recientes</span>
                </CardTitle>
                <CardDescription>
                  Tus últimos logros obtenidos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BadgeGrid
                  userId={userId}
                  badges={data.badges.filter(b => b.isEarned).slice(0, 6)}
                  isOwnProfile={isOwnProfile}
                  showProgress={false}
                  maxDisplay={6}
                />
              </CardContent>
            </Card>

            {/* Actividades recientes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="w-5 h-5" />
                  <span>Actividad Reciente</span>
                </CardTitle>
                <CardDescription>
                  Tus últimas acciones y logros
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RecentActivities
                  activities={data.activities}
                  userId={userId}
                  showFilters={false}
                  maxItems={5}
                />
              </CardContent>
            </Card>
          </div>

          {/* Progreso de badges por categoría */}
          {showPrivateStats && data.progressCounters.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5" />
                  <span>Progreso por Categoría</span>
                </CardTitle>
                <CardDescription>
                  Tu avance hacia nuevos badges
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data.progressCounters.map((counter) => (
                    <div key={counter.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {counter.type}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {counter.currentValue}/{counter.targetValue}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, counter.progress)}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {Math.round(counter.progress)}% completado
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="badges">
          <Card>
            <CardHeader>
              <CardTitle>Colección de Badges</CardTitle>
              <CardDescription>
                Todos tus badges obtenidos y por obtener
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BadgeGrid
                userId={userId}
                badges={data.badges}
                isOwnProfile={isOwnProfile}
                showProgress={true}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activities">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Actividades</CardTitle>
              <CardDescription>
                Todas tus actividades y logros en la plataforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RecentActivities
                activities={data.activities}
                userId={userId}
                showFilters={true}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default GamificationProfile;