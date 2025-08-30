'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import GamificationAdminPanel from '@/components/admin/GamificationAdminPanel';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Award, Users, Activity, TrendingUp, Star } from 'lucide-react';

interface AdminStats {
  totalBadges: number;
  totalAchievements: number;
  totalUsers: number;
  recentActivities: number;
  badgesByRarity: Record<string, number>;
  achievementsByType: Record<string, number>;
  topEarners: Array<{
    userId: string;
    username: string;
    badgeCount: number;
    totalXP: number;
  }>;
}

export default function GamificationAdminPage() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Verificar permisos
  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'MODERATOR')) {
      redirect('/unauthorized');
    }
  }, [session, status]);

  // Cargar estadísticas
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/gamification/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Error loading admin stats:', error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user) {
      fetchStats();
    }
  }, [session]);

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'MODERATOR')) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Panel de Administración - Gamificación</h1>
        <p className="text-muted-foreground">
          Gestiona badges, logros y el sistema de gamificación de la plataforma
        </p>
      </div>

      {/* Estadísticas generales */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Badges</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBadges}</div>
              <div className="flex gap-1 mt-2">
                {Object.entries(stats.badgesByRarity).map(([rarity, count]) => (
                  <Badge key={rarity} variant="outline" className="text-xs">
                    {rarity}: {count}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Logros</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAchievements}</div>
              <div className="flex gap-1 mt-2 flex-wrap">
                {Object.entries(stats.achievementsByType).slice(0, 3).map(([type, count]) => (
                  <Badge key={type} variant="outline" className="text-xs">
                    {type}: {count}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground mt-2">
                Con badges obtenidos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Actividades Recientes</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.recentActivities}</div>
              <p className="text-xs text-muted-foreground mt-2">
                Últimas 24 horas
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Top performers */}
      {stats?.topEarners && stats.topEarners.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Top Usuarios por Badges
            </CardTitle>
            <CardDescription>
              Usuarios con más badges obtenidos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.topEarners.slice(0, 5).map((user, index) => (
                <div key={user.userId} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{user.username}</p>
                      <p className="text-sm text-muted-foreground">{user.totalXP} XP total</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-yellow-500" />
                    <span className="font-bold">{user.badgeCount}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Panel principal */}
      <Tabs defaultValue="badges" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="badges" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Gestión de Badges
          </TabsTrigger>
          <TabsTrigger value="achievements" className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            Gestión de Logros
          </TabsTrigger>
        </TabsList>

        <TabsContent value="badges">
          <GamificationAdminPanel type="badges" />
        </TabsContent>

        <TabsContent value="achievements">
          <GamificationAdminPanel type="achievements" />
        </TabsContent>
      </Tabs>
    </div>
  );
}