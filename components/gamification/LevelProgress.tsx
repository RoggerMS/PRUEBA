'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Trophy, 
  Star, 
  Target, 
  TrendingUp, 
  Award, 
  Zap, 
  Crown, 
  Medal,
  ChevronRight,
  Gift
} from 'lucide-react';

interface LevelProgressProps {
  currentLevel: number;
  currentXP: number;
  nextLevelXP: number;
  totalXP: number;
  levelName: string;
  nextLevelName: string;
  recentAchievements?: Achievement[];
  xpBreakdown?: XPSource[];
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  xpReward: number;
  unlockedAt: string;
}

interface XPSource {
  source: string;
  amount: number;
  icon: string;
  color: string;
}

const mockAchievements: Achievement[] = [
  {
    id: '1',
    name: 'Primera Pregunta',
    description: 'Hiciste tu primera pregunta en el foro',
    icon: '🎯',
    rarity: 'common',
    xpReward: 50,
    unlockedAt: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    name: 'Estudiante Dedicado',
    description: 'Completaste 5 sesiones de estudio',
    icon: '📚',
    rarity: 'rare',
    xpReward: 150,
    unlockedAt: '2024-01-14T15:45:00Z'
  },
  {
    id: '3',
    name: 'Colaborador',
    description: 'Ayudaste a 10 compañeros con sus dudas',
    icon: '🤝',
    rarity: 'epic',
    xpReward: 300,
    unlockedAt: '2024-01-13T09:20:00Z'
  }
];

const mockXPBreakdown: XPSource[] = [
  {
    source: 'Preguntas respondidas',
    amount: 450,
    icon: '💬',
    color: 'bg-blue-500'
  },
  {
    source: 'Apuntes compartidos',
    amount: 300,
    icon: '📝',
    color: 'bg-green-500'
  },
  {
    source: 'Competencias ganadas',
    amount: 250,
    icon: '🏆',
    color: 'bg-yellow-500'
  },
  {
    source: 'Logros desbloqueados',
    amount: 200,
    icon: '🎖️',
    color: 'bg-purple-500'
  },
  {
    source: 'Sesiones de estudio',
    amount: 150,
    icon: '⏰',
    color: 'bg-orange-500'
  }
];

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

const getLevelIcon = (level: number) => {
  if (level >= 50) return Crown;
  if (level >= 30) return Trophy;
  if (level >= 20) return Medal;
  if (level >= 10) return Award;
  return Star;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    month: 'short',
    day: 'numeric'
  });
};

export function LevelProgress({
  currentLevel = 12,
  currentXP = 1350,
  nextLevelXP = 1500,
  totalXP = 8750,
  levelName = 'Estudiante Avanzado',
  nextLevelName = 'Mentor Junior',
  recentAchievements = mockAchievements,
  xpBreakdown = mockXPBreakdown
}: LevelProgressProps) {
  const progressPercentage = (currentXP / nextLevelXP) * 100;
  const xpNeeded = nextLevelXP - currentXP;
  const LevelIcon = getLevelIcon(currentLevel);
  const NextLevelIcon = getLevelIcon(currentLevel + 1);

  return (
    <div className="space-y-6">
      {/* Main Level Progress Card */}
      <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-full">
                <LevelIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-gray-900">
                  Nivel {currentLevel}
                </CardTitle>
                <p className="text-sm text-gray-600">{levelName}</p>
              </div>
            </div>
            <Badge className="bg-purple-600 hover:bg-purple-700">
              {totalXP.toLocaleString()} XP Total
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">
                {currentXP.toLocaleString()} / {nextLevelXP.toLocaleString()} XP
              </span>
              <span className="text-purple-600 font-medium">
                {progressPercentage.toFixed(1)}%
              </span>
            </div>
            <Progress 
              value={progressPercentage} 
              className="h-3 bg-purple-100"
            />
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">
                {xpNeeded.toLocaleString()} XP para el siguiente nivel
              </span>
              <div className="flex items-center gap-1 text-purple-600">
                <NextLevelIcon className="w-4 h-4" />
                <span className="font-medium">{nextLevelName}</span>
              </div>
            </div>
          </div>

          {/* Level Milestones */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-purple-200">
            <div className="text-center">
              <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full mx-auto mb-1">
                <Target className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-xs text-gray-600">Próximo Objetivo</p>
              <p className="text-sm font-semibold text-gray-900">Nivel {currentLevel + 1}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full mx-auto mb-1">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-xs text-gray-600">Progreso Semanal</p>
              <p className="text-sm font-semibold text-gray-900">+{Math.floor(Math.random() * 200 + 100)} XP</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-10 h-10 bg-yellow-100 rounded-full mx-auto mb-1">
                <Zap className="w-5 h-5 text-yellow-600" />
              </div>
              <p className="text-xs text-gray-600">Racha Actual</p>
              <p className="text-sm font-semibold text-gray-900">{Math.floor(Math.random() * 10 + 5)} días</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-full mx-auto mb-1">
                <Gift className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-xs text-gray-600">Recompensas</p>
              <p className="text-sm font-semibold text-gray-900">{recentAchievements.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* XP Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Desglose de Experiencia
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {xpBreakdown.map((source, index) => {
              const percentage = (source.amount / totalXP) * 100;
              return (
                <div key={index} className="flex items-center gap-3">
                  <div className="text-lg">{source.icon}</div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-700">
                        {source.source}
                      </span>
                      <span className="text-sm text-gray-600">
                        {source.amount.toLocaleString()} XP ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`${source.color} h-2 rounded-full transition-all duration-300`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Achievements */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-600" />
              Logros Recientes
            </CardTitle>
            <Button variant="outline" size="sm">
              Ver todos
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentAchievements.slice(0, 3).map((achievement) => (
              <div key={achievement.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl">{achievement.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-gray-900">{achievement.name}</h4>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getRarityColor(achievement.rarity)}`}
                    >
                      {achievement.rarity}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{achievement.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      Desbloqueado el {formatDate(achievement.unlockedAt)}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      +{achievement.xpReward} XP
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Level Rewards Preview */}
      <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-800">
            <Gift className="w-5 h-5" />
            Recompensas del Siguiente Nivel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center p-3 bg-white/50 rounded-lg">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Trophy className="w-6 h-6 text-yellow-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-1">Nuevo Título</h4>
              <p className="text-sm text-gray-600">{nextLevelName}</p>
            </div>
            <div className="text-center p-3 bg-white/50 rounded-lg">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Star className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-1">Insignia Especial</h4>
              <p className="text-sm text-gray-600">Mentor Badge</p>
            </div>
            <div className="text-center p-3 bg-white/50 rounded-lg">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Zap className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-1">Beneficio</h4>
              <p className="text-sm text-gray-600">+50% XP Bonus</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}