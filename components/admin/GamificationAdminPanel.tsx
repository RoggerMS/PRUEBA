'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  Trophy,
  Award,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  RefreshCw,
  Save,
  X,
  Users,
  BarChart3,
  Settings,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface BadgeData {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  category: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    userBadges: number;
  };
}

interface AchievementData {
  id: string;
  name: string;
  description: string;
  type: string;
  targetValue: number;
  xpReward: number;
  crolarsReward: number;
  badgeId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  badge?: {
    name: string;
    rarity: string;
  };
  _count?: {
    userBadges: number;
  };
}

interface AdminStats {
  totalBadges: number;
  totalAchievements: number;
  totalUsers: number;
  activeBadges: number;
  activeAchievements: number;
  recentActivities: number;
}

export function GamificationAdminPanel() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [badges, setBadges] = useState<BadgeData[]>([]);
  const [achievements, setAchievements] = useState<AchievementData[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRarity, setFilterRarity] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [editingBadge, setEditingBadge] = useState<BadgeData | null>(null);
  const [editingAchievement, setEditingAchievement] = useState<AchievementData | null>(null);
  const [showCreateBadge, setShowCreateBadge] = useState(false);
  const [showCreateAchievement, setShowCreateAchievement] = useState(false);

  // Verificar permisos de administrador
  const isAdmin = session?.user?.role === 'ADMIN' || session?.user?.role === 'MODERATOR';

  // Cargar datos iniciales
  const loadData = async () => {
    try {
      setLoading(true);
      const [badgesRes, achievementsRes, statsRes] = await Promise.all([
        fetch('/api/gamification/catalog?type=badge&includeStats=true'),
        fetch('/api/gamification/catalog?type=achievement&includeStats=true'),
        fetch('/api/admin/gamification/stats')
      ]);

      if (badgesRes.ok) {
        const badgesData = await badgesRes.json();
        setBadges(badgesData.items || []);
      }

      if (achievementsRes.ok) {
        const achievementsData = await achievementsRes.json();
        setAchievements(achievementsData.items || []);
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
    } catch (error) {
      console.error('Error loading admin data:', error);
      toast.error('Error al cargar los datos del panel');
    } finally {
      setLoading(false);
    }
  };

  // Crear/actualizar badge
  const saveBadge = async (badgeData: Partial<BadgeData>) => {
    try {
      const isEditing = !!badgeData.id;
      const url = isEditing 
        ? `/api/admin/gamification/badges/${badgeData.id}`
        : '/api/gamification/catalog';
      
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...badgeData,
          type: 'badge'
        })
      });

      if (!response.ok) {
        throw new Error('Error al guardar el badge');
      }

      const savedBadge = await response.json();
      
      if (isEditing) {
        setBadges(prev => prev.map(b => b.id === savedBadge.id ? savedBadge : b));
        setEditingBadge(null);
        toast.success('Badge actualizado correctamente');
      } else {
        setBadges(prev => [savedBadge, ...prev]);
        setShowCreateBadge(false);
        toast.success('Badge creado correctamente');
      }
    } catch (error) {
      console.error('Error saving badge:', error);
      toast.error('Error al guardar el badge');
    }
  };

  // Eliminar badge
  const deleteBadge = async (badgeId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este badge?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/gamification/badges/${badgeId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Error al eliminar el badge');
      }

      setBadges(prev => prev.filter(b => b.id !== badgeId));
      toast.success('Badge eliminado correctamente');
    } catch (error) {
      console.error('Error deleting badge:', error);
      toast.error('Error al eliminar el badge');
    }
  };

  // Crear/actualizar achievement
  const saveAchievement = async (achievementData: Partial<AchievementData>) => {
    try {
      const isEditing = !!achievementData.id;
      const url = isEditing 
        ? `/api/admin/gamification/achievements/${achievementData.id}`
        : '/api/gamification/catalog';
      
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...achievementData,
          type: 'achievement'
        })
      });

      if (!response.ok) {
        throw new Error('Error al guardar el logro');
      }

      const savedAchievement = await response.json();
      
      if (isEditing) {
        setAchievements(prev => prev.map(a => a.id === savedAchievement.id ? savedAchievement : a));
        setEditingAchievement(null);
        toast.success('Logro actualizado correctamente');
      } else {
        setAchievements(prev => [savedAchievement, ...prev]);
        setShowCreateAchievement(false);
        toast.success('Logro creado correctamente');
      }
    } catch (error) {
      console.error('Error saving achievement:', error);
      toast.error('Error al guardar el logro');
    }
  };

  // Eliminar achievement
  const deleteAchievement = async (achievementId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este logro?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/gamification/achievements/${achievementId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Error al eliminar el logro');
      }

      setAchievements(prev => prev.filter(a => a.id !== achievementId));
      toast.success('Logro eliminado correctamente');
    } catch (error) {
      console.error('Error deleting achievement:', error);
      toast.error('Error al eliminar el logro');
    }
  };

  // Filtrar badges
  const filteredBadges = badges.filter(badge => {
    const matchesSearch = badge.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         badge.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRarity = filterRarity === 'all' || badge.rarity === filterRarity;
    const matchesCategory = filterCategory === 'all' || badge.category === filterCategory;
    
    return matchesSearch && matchesRarity && matchesCategory;
  });

  // Filtrar achievements
  const filteredAchievements = achievements.filter(achievement => {
    const matchesSearch = achievement.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         achievement.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  // Obtener categorías únicas
  const categories = Array.from(new Set(badges.map(b => b.category)));

  useEffect(() => {
    if (isAdmin) {
      loadData();
    }
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          Acceso Denegado
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          No tienes permisos para acceder al panel de administración
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Panel de Administración - Gamificación
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gestiona badges, logros y estadísticas del sistema
          </p>
        </div>
        <Button onClick={loadData} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {/* Estadísticas generales */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Award className="w-8 h-8 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {stats.totalBadges}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Total Badges
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Trophy className="w-8 h-8 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {stats.totalAchievements}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Total Logros
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Users className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {stats.totalUsers}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Usuarios Activos
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-8 h-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {stats.recentActivities}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Actividades (7d)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs principales */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">
            <BarChart3 className="w-4 h-4 mr-2" />
            Resumen
          </TabsTrigger>
          <TabsTrigger value="badges">
            <Award className="w-4 h-4 mr-2" />
            Badges
          </TabsTrigger>
          <TabsTrigger value="achievements">
            <Trophy className="w-4 h-4 mr-2" />
            Logros
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Badges más Populares</CardTitle>
                <CardDescription>
                  Los badges más obtenidos por los usuarios
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {badges
                    .sort((a, b) => (b._count?.userBadges || 0) - (a._count?.userBadges || 0))
                    .slice(0, 5)
                    .map((badge) => (
                      <div key={badge.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{badge.icon}</span>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                              {badge.name}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {badge.category}
                            </p>
                          </div>
                        </div>
                        <Badge variant="secondary">
                          {badge._count?.userBadges || 0} usuarios
                        </Badge>
                      </div>
                    ))
                  }
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribución por Rareza</CardTitle>
                <CardDescription>
                  Cantidad de badges por nivel de rareza
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['LEGENDARY', 'EPIC', 'RARE', 'COMMON'].map((rarity) => {
                    const count = badges.filter(b => b.rarity === rarity).length;
                    const percentage = badges.length > 0 ? (count / badges.length) * 100 : 0;
                    
                    return (
                      <div key={rarity} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {rarity}
                          </span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {count} ({Math.round(percentage)}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className={cn(
                              'h-2 rounded-full transition-all duration-300',
                              rarity === 'LEGENDARY' ? 'bg-yellow-500' :
                              rarity === 'EPIC' ? 'bg-purple-500' :
                              rarity === 'RARE' ? 'bg-blue-500' : 'bg-gray-500'
                            )}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="badges" className="space-y-6">
          {/* Controles de badges */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar badges..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
              
              <Select value={filterRarity} onValueChange={setFilterRarity}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Rareza" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="COMMON">Común</SelectItem>
                  <SelectItem value="RARE">Raro</SelectItem>
                  <SelectItem value="EPIC">Épico</SelectItem>
                  <SelectItem value="LEGENDARY">Legendario</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-full sm:w-40">
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
            
            <Button onClick={() => setShowCreateBadge(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Crear Badge
            </Button>
          </div>

          {/* Lista de badges */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBadges.map((badge) => (
              <Card key={badge.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{badge.icon}</span>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                          {badge.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {badge.category}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingBadge(badge)}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteBadge(badge.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {badge.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <Badge 
                      variant={badge.rarity === 'LEGENDARY' ? 'default' : 'secondary'}
                      className={cn(
                        badge.rarity === 'LEGENDARY' ? 'bg-yellow-500' :
                        badge.rarity === 'EPIC' ? 'bg-purple-500' :
                        badge.rarity === 'RARE' ? 'bg-blue-500' : 'bg-gray-500'
                      )}
                    >
                      {badge.rarity}
                    </Badge>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {badge._count?.userBadges || 0} usuarios
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          {/* Controles de achievements */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar logros..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full sm:w-64"
              />
            </div>
            
            <Button onClick={() => setShowCreateAchievement(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Crear Logro
            </Button>
          </div>

          {/* Lista de achievements */}
          <div className="space-y-4">
            {filteredAchievements.map((achievement) => (
              <Card key={achievement.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <Trophy className="w-5 h-5 text-purple-500" />
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                          {achievement.name}
                        </h3>
                        {achievement.badge && (
                          <Badge variant="outline">
                            Badge: {achievement.badge.name}
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {achievement.description}
                      </p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        <span>Tipo: {achievement.type}</span>
                        <span>Meta: {achievement.targetValue}</span>
                        <span>XP: {achievement.xpReward}</span>
                        <span>Crolars: {achievement.crolarsReward}</span>
                        <span>{achievement._count?.userBadges || 0} completados</span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingAchievement(achievement)}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteAchievement(achievement.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Modales de creación/edición se implementarán en componentes separados */}
    </div>
  );
}

export default GamificationAdminPanel;