'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Award, 
  Trophy, 
  Star, 
  Target, 
  Lock, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  Users,
  BookOpen,
  MessageSquare,
  Zap,
  Crown,
  Gift
} from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  category: 'academic' | 'social' | 'engagement' | 'milestone' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  icon: string;
  xpReward: number;
  status: 'locked' | 'in_progress' | 'completed';
  progress?: {
    current: number;
    total: number;
  };
  unlockedAt?: string;
  requirements: string[];
}

interface AchievementSystemProps {
  achievements?: Achievement[];
  userStats?: {
    totalAchievements: number;
    completedAchievements: number;
    totalXP: number;
    currentStreak: number;
  };
}

const mockAchievements: Achievement[] = [
  {
    id: '1',
    title: 'Primera Pregunta',
    description: 'Haz tu primera pregunta en el foro',
    category: 'engagement',
    rarity: 'common',
    icon: '❓',
    xpReward: 50,
    status: 'completed',
    unlockedAt: '2024-01-15T10:30:00Z',
    requirements: ['Hacer 1 pregunta en el foro']
  },
  {
    id: '2',
    title: 'Estudiante Dedicado',
    description: 'Completa 10 sesiones de estudio',
    category: 'academic',
    rarity: 'rare',
    icon: '📚',
    xpReward: 200,
    status: 'in_progress',
    progress: {
      current: 7,
      total: 10
    },
    requirements: ['Completar 10 sesiones de estudio']
  },
  {
    id: '3',
    title: 'Colaborador',
    description: 'Ayuda a 25 compañeros con sus dudas',
    category: 'social',
    rarity: 'epic',
    icon: '🤝',
    xpReward: 500,
    status: 'completed',
    unlockedAt: '2024-01-14T15:45:00Z',
    requirements: ['Ayudar a 25 compañeros', 'Recibir 50 likes en respuestas']
  },
  {
    id: '4',
    title: 'Racha de Fuego',
    description: 'Mantén una racha de 30 días consecutivos',
    category: 'milestone',
    rarity: 'epic',
    icon: '🔥',
    xpReward: 750,
    status: 'in_progress',
    progress: {
      current: 15,
      total: 30
    },
    requirements: ['Actividad diaria por 30 días consecutivos']
  },
  {
    id: '5',
    title: 'Mentor Legendario',
    description: 'Alcanza el nivel 50 y ayuda a 100 estudiantes',
    category: 'special',
    rarity: 'legendary',
    icon: '👑',
    xpReward: 2000,
    status: 'locked',
    requirements: ['Alcanzar nivel 50', 'Ayudar a 100 estudiantes', 'Tener 500+ likes']
  },
  {
    id: '6',
    title: 'Compartir es Vivir',
    description: 'Comparte 50 apuntes con la comunidad',
    category: 'social',
    rarity: 'rare',
    icon: '📝',
    xpReward: 300,
    status: 'in_progress',
    progress: {
      current: 23,
      total: 50
    },
    requirements: ['Compartir 50 apuntes', 'Recibir valoraciones positivas']
  },
  {
    id: '7',
    title: 'Competidor Nato',
    description: 'Gana 10 competencias académicas',
    category: 'academic',
    rarity: 'epic',
    icon: '🏆',
    xpReward: 600,
    status: 'locked',
    requirements: ['Ganar 10 competencias', 'Participar en 25 competencias']
  },
  {
    id: '8',
    title: 'Explorador',
    description: 'Visita todas las secciones de la plataforma',
    category: 'engagement',
    rarity: 'common',
    icon: '🗺️',
    xpReward: 100,
    status: 'completed',
    unlockedAt: '2024-01-13T09:20:00Z',
    requirements: ['Visitar foro, marketplace, competencias, perfil']
  }
];

const mockUserStats = {
  totalAchievements: 8,
  completedAchievements: 3,
  totalXP: 1250,
  currentStreak: 15
};

const getCategoryIcon = (category: Achievement['category']) => {
  switch (category) {
    case 'academic':
      return BookOpen;
    case 'social':
      return Users;
    case 'engagement':
      return MessageSquare;
    case 'milestone':
      return Target;
    case 'special':
      return Crown;
    default:
      return Award;
  }
};

const getRarityColor = (rarity: Achievement['rarity']) => {
  switch (rarity) {
    case 'common':
      return 'bg-gray-100 text-gray-700 border-gray-300';
    case 'rare':
      return 'bg-blue-100 text-blue-700 border-blue-300';
    case 'epic':
      return 'bg-purple-100 text-purple-700 border-purple-300';
    case 'legendary':
      return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-300';
  }
};

const getStatusIcon = (status: Achievement['status']) => {
  switch (status) {
    case 'completed':
      return CheckCircle;
    case 'in_progress':
      return Clock;
    case 'locked':
      return Lock;
    default:
      return Award;
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export function AchievementSystem({
  achievements = mockAchievements,
  userStats = mockUserStats
}: AchievementSystemProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  
  const categories = [
    { id: 'all', name: 'Todos', icon: Award },
    { id: 'academic', name: 'Académicos', icon: BookOpen },
    { id: 'social', name: 'Sociales', icon: Users },
    { id: 'engagement', name: 'Participación', icon: MessageSquare },
    { id: 'milestone', name: 'Hitos', icon: Target },
    { id: 'special', name: 'Especiales', icon: Crown }
  ];
  
  const filteredAchievements = selectedCategory === 'all' 
    ? achievements 
    : achievements.filter(a => a.category === selectedCategory);
  
  const completedAchievements = achievements.filter(a => a.status === 'completed');
  const inProgressAchievements = achievements.filter(a => a.status === 'in_progress');
  const lockedAchievements = achievements.filter(a => a.status === 'locked');
  
  const completionPercentage = (userStats.completedAchievements / userStats.totalAchievements) * 100;

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-purple-600" />
            Sistema de Logros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mx-auto mb-2">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{userStats.completedAchievements}</p>
              <p className="text-sm text-gray-600">Completados</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mx-auto mb-2">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{inProgressAchievements.length}</p>
              <p className="text-sm text-gray-600">En Progreso</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-full mx-auto mb-2">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{userStats.totalXP}</p>
              <p className="text-sm text-gray-600">XP Total</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full mx-auto mb-2">
                <Zap className="w-6 h-6 text-orange-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{userStats.currentStreak}</p>
              <p className="text-sm text-gray-600">Días de Racha</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progreso General</span>
              <span>{completionPercentage.toFixed(1)}%</span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-6">
          {categories.map((category) => {
            const IconComponent = category.icon;
            return (
              <TabsTrigger key={category.id} value={category.id} className="flex items-center gap-1">
                <IconComponent className="w-4 h-4" />
                <span className="hidden sm:inline">{category.name}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAchievements.map((achievement) => {
              const StatusIcon = getStatusIcon(achievement.status);
              const CategoryIcon = getCategoryIcon(achievement.category);
              const rarityColor = getRarityColor(achievement.rarity);
              
              return (
                <Dialog key={achievement.id}>
                  <DialogTrigger asChild>
                    <Card className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                      achievement.status === 'completed' 
                        ? 'bg-green-50 border-green-200' 
                        : achievement.status === 'locked'
                        ? 'bg-gray-50 border-gray-200 opacity-75'
                        : 'bg-blue-50 border-blue-200'
                    }`}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="text-3xl">{achievement.icon}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className={`font-semibold text-sm ${
                                achievement.status === 'locked' ? 'text-gray-500' : 'text-gray-900'
                              }`}>
                                {achievement.title}
                              </h3>
                              <StatusIcon className={`w-4 h-4 ${
                                achievement.status === 'completed' 
                                  ? 'text-green-600' 
                                  : achievement.status === 'locked'
                                  ? 'text-gray-400'
                                  : 'text-blue-600'
                              }`} />
                            </div>
                            
                            <p className={`text-xs mb-2 ${
                              achievement.status === 'locked' ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              {achievement.description}
                            </p>
                            
                            <div className="flex items-center justify-between">
                              <Badge variant="outline" className={`text-xs ${rarityColor}`}>
                                {achievement.rarity}
                              </Badge>
                              <Badge className="bg-purple-600 hover:bg-purple-700 text-xs">
                                +{achievement.xpReward} XP
                              </Badge>
                            </div>
                            
                            {achievement.progress && (
                              <div className="mt-3">
                                <div className="flex justify-between text-xs mb-1">
                                  <span>Progreso</span>
                                  <span>{achievement.progress.current}/{achievement.progress.total}</span>
                                </div>
                                <Progress 
                                  value={(achievement.progress.current / achievement.progress.total) * 100} 
                                  className="h-2"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </DialogTrigger>
                  
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-3">
                        <span className="text-2xl">{achievement.icon}</span>
                        <div>
                          <h2 className="text-lg font-bold">{achievement.title}</h2>
                          <Badge variant="outline" className={`text-xs ${rarityColor}`}>
                            {achievement.rarity}
                          </Badge>
                        </div>
                      </DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                      <p className="text-gray-600">{achievement.description}</p>
                      
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <CategoryIcon className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-600 capitalize">{achievement.category}</span>
                        </div>
                        <Badge className="bg-purple-600 hover:bg-purple-700">
                          +{achievement.xpReward} XP
                        </Badge>
                      </div>
                      
                      {achievement.progress && (
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span>Progreso</span>
                            <span>{achievement.progress.current}/{achievement.progress.total}</span>
                          </div>
                          <Progress 
                            value={(achievement.progress.current / achievement.progress.total) * 100} 
                            className="h-3"
                          />
                        </div>
                      )}
                      
                      <div>
                        <h4 className="font-semibold text-sm mb-2">Requisitos:</h4>
                        <ul className="space-y-1">
                          {achievement.requirements.map((req, index) => (
                            <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                              {req}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      {achievement.unlockedAt && (
                        <div className="bg-green-50 p-3 rounded-lg">
                          <div className="flex items-center gap-2 text-green-700">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-sm font-medium">Completado</span>
                          </div>
                          <p className="text-xs text-green-600 mt-1">
                            Desbloqueado el {formatDate(achievement.unlockedAt)}
                          </p>
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Recent Achievements */}
      {completedAchievements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-green-600" />
              Logros Recientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {completedAchievements.slice(0, 3).map((achievement) => (
                <div key={achievement.id} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <span className="text-2xl">{achievement.icon}</span>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{achievement.title}</h4>
                    <p className="text-sm text-gray-600">{achievement.description}</p>
                  </div>
                  <Badge className="bg-green-600 hover:bg-green-700">
                    +{achievement.xpReward} XP
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}