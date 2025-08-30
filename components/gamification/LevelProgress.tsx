'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Trophy, 
  Star, 
  Zap, 
  Target, 
  Award, 
  TrendingUp, 
  Gift,
  Crown,
  Flame,
  BookOpen
} from 'lucide-react'

interface LevelProgressProps {
  className?: string
}

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlocked: boolean
  progress?: number
  maxProgress?: number
}

interface LevelData {
  currentLevel: number
  currentXP: number
  nextLevelXP: number
  totalXP: number
  levelName: string
  nextLevelName: string
  xpToNext: number
  progressPercentage: number
}

const LevelProgress: React.FC<LevelProgressProps> = ({ className }) => {
  // Mock data - en una aplicación real, esto vendría de una API o contexto
  const levelData: LevelData = {
    currentLevel: 12,
    currentXP: 2850,
    nextLevelXP: 3200,
    totalXP: 15420,
    levelName: 'Estudiante Avanzado',
    nextLevelName: 'Mentor Junior',
    xpToNext: 350,
    progressPercentage: 89
  }

  const xpBreakdown = [
    { source: 'Desafíos Completados', xp: 1200, icon: 'Target', color: 'text-blue-600' },
    { source: 'Participación en Foros', xp: 450, icon: 'BookOpen', color: 'text-green-600' },
    { source: 'Proyectos Entregados', xp: 800, icon: 'Trophy', color: 'text-purple-600' },
    { source: 'Ayuda a Compañeros', xp: 400, icon: 'Star', color: 'text-yellow-600' }
  ]

  const milestones: Achievement[] = [
    {
      id: '1',
      title: 'Primera Victoria',
      description: 'Completa tu primer desafío',
      icon: 'Trophy',
      unlocked: true
    },
    {
      id: '2',
      title: 'Racha de Fuego',
      description: 'Mantén una racha de 7 días consecutivos',
      icon: 'Flame',
      unlocked: true
    },
    {
      id: '3',
      title: 'Mentor Nato',
      description: 'Ayuda a 10 compañeros con sus dudas',
      icon: 'Crown',
      unlocked: false,
      progress: 7,
      maxProgress: 10
    },
    {
      id: '4',
      title: 'Experto en Código',
      description: 'Completa 50 desafíos de programación',
      icon: 'Award',
      unlocked: false,
      progress: 32,
      maxProgress: 50
    }
  ]

  const getIconComponent = (iconName: string) => {
    const iconMap: { [key: string]: React.ComponentType<any> } = {
      Trophy, Star, Zap, Target, Award, TrendingUp, Gift, Crown, Flame, BookOpen
    }
    const IconComponent = iconMap[iconName] || Trophy
    return IconComponent
  }

  const getLevelBadgeColor = (level: number) => {
    if (level >= 20) return 'bg-gradient-to-r from-purple-500 to-pink-500'
    if (level >= 15) return 'bg-gradient-to-r from-blue-500 to-cyan-500'
    if (level >= 10) return 'bg-gradient-to-r from-green-500 to-emerald-500'
    if (level >= 5) return 'bg-gradient-to-r from-yellow-500 to-orange-500'
    return 'bg-gradient-to-r from-gray-500 to-slate-500'
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Nivel Actual y Progreso Principal */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-full ${getLevelBadgeColor(levelData.currentLevel)} flex items-center justify-center text-white font-bold text-xl shadow-lg`}>
                {levelData.currentLevel}
              </div>
              <div>
                <CardTitle className="text-2xl">{levelData.levelName}</CardTitle>
                <p className="text-muted-foreground">Nivel {levelData.currentLevel}</p>
              </div>
            </div>
            <Badge variant="secondary" className="text-sm px-3 py-1">
              {levelData.totalXP.toLocaleString()} XP Total
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Progreso al Nivel {levelData.currentLevel + 1}</span>
              <span className="text-sm text-muted-foreground">
                {levelData.currentXP} / {levelData.nextLevelXP} XP
              </span>
            </div>
            <Progress value={levelData.progressPercentage} className="h-3" />
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">
                {levelData.xpToNext} XP para {levelData.nextLevelName}
              </span>
              <span className="font-medium text-primary">
                {levelData.progressPercentage}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Desglose de XP */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Fuentes de Experiencia
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {xpBreakdown.map((item, index) => {
              const IconComponent = getIconComponent(item.icon)
              return (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full bg-background flex items-center justify-center ${item.color}`}>
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <span className="font-medium text-sm">{item.source}</span>
                  </div>
                  <Badge variant="outline" className="font-mono">
                    +{item.xp} XP
                  </Badge>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Hitos y Logros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Hitos de Progreso
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {milestones.map((milestone) => {
              const IconComponent = getIconComponent(milestone.icon)
              return (
                <div 
                  key={milestone.id} 
                  className={`p-4 rounded-lg border-2 transition-all ${
                    milestone.unlocked 
                      ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950' 
                      : 'border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      milestone.unlocked 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-300 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                    }`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-sm">{milestone.title}</h4>
                        {milestone.unlocked && (
                          <Badge variant="secondary" className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            Completado
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{milestone.description}</p>
                      {!milestone.unlocked && milestone.progress && milestone.maxProgress && (
                        <div className="space-y-1">
                          <Progress 
                            value={(milestone.progress / milestone.maxProgress) * 100} 
                            className="h-2" 
                          />
                          <p className="text-xs text-muted-foreground">
                            {milestone.progress} / {milestone.maxProgress}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Próximas Recompensas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5" />
            Próximas Recompensas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 rounded-lg border">
              <div className="flex items-center gap-3">
                <Crown className="w-6 h-6 text-purple-600" />
                <div>
                  <p className="font-semibold text-sm">Título: {levelData.nextLevelName}</p>
                  <p className="text-xs text-muted-foreground">Nivel {levelData.currentLevel + 1}</p>
                </div>
              </div>
              <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                {levelData.xpToNext} XP restantes
              </Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 rounded-lg border">
              <div className="flex items-center gap-3">
                <Zap className="w-6 h-6 text-blue-600" />
                <div>
                  <p className="font-semibold text-sm">Bonus de XP +25%</p>
                  <p className="text-xs text-muted-foreground">Por 7 días</p>
                </div>
              </div>
              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                Nivel {levelData.currentLevel + 2}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botón de Acción */}
      <div className="flex justify-center">
        <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
          <Target className="w-4 h-4 mr-2" />
          Explorar Desafíos
        </Button>
      </div>
    </div>
  )
}

export default LevelProgress