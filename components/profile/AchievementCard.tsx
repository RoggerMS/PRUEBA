'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import { Trophy, Star, Award, Heart, Target, GraduationCap, Gift, CheckCircle, Clock } from 'lucide-react'

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  category: 'milestone' | 'learning' | 'challenge' | 'social' | 'streak'
  difficulty: 'easy' | 'medium' | 'hard'
  points: number
  earned: boolean
  earnedDate?: string
  progress?: number
  maxProgress?: number
  claimed: boolean
  claimable: boolean
  reward: {
    xp: number
    crolars: number
  }
}

interface AchievementCardProps {
  achievement: Achievement
  onClaim?: (achievementId: string) => void
}

const AchievementCard: React.FC<AchievementCardProps> = ({ achievement, onClaim }) => {
  const getIcon = (iconName: string) => {
    const icons = {
      Trophy: Trophy,
      Star: Star,
      Award: Award,
      Heart: Heart,
      Target: Target,
      GraduationCap: GraduationCap
    }
    const IconComponent = icons[iconName as keyof typeof icons] || Trophy
    return <IconComponent className="h-6 w-6" />
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      milestone: 'bg-purple-100 text-purple-800 border-purple-200',
      learning: 'bg-blue-100 text-blue-800 border-blue-200',
      challenge: 'bg-red-100 text-red-800 border-red-200',
      social: 'bg-green-100 text-green-800 border-green-200',
      streak: 'bg-orange-100 text-orange-800 border-orange-200'
    }
    return colors[category as keyof typeof colors] || colors.milestone
  }

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      easy: 'text-green-600',
      medium: 'text-yellow-600',
      hard: 'text-red-600'
    }
    return colors[difficulty as keyof typeof colors] || colors.easy
  }

  const getCategoryLabel = (category: string) => {
    const labels = {
      milestone: 'Hito',
      learning: 'Aprendizaje',
      challenge: 'Desafío',
      social: 'Social',
      streak: 'Racha'
    }
    return labels[category as keyof typeof labels] || category
  }

  const getDifficultyLabel = (difficulty: string) => {
    const labels = {
      easy: 'Fácil',
      medium: 'Medio',
      hard: 'Difícil'
    }
    return labels[difficulty as keyof typeof labels] || difficulty
  }

  const handleClaim = () => {
    if (onClaim && achievement.claimable && !achievement.claimed) {
      onClaim(achievement.id)
      toast.success(`¡Has reclamado ${achievement.reward.xp} XP y ${achievement.reward.crolars} Crolars!`)
    }
  }

  const progressPercentage = achievement.progress && achievement.maxProgress 
    ? (achievement.progress / achievement.maxProgress) * 100 
    : 0

  return (
    <Card className={`relative overflow-hidden transition-all duration-200 hover:shadow-lg ${
      achievement.earned ? 'border-green-200 bg-green-50/30' : 'border-gray-200'
    } ${
      achievement.claimable && !achievement.claimed ? 'ring-2 ring-yellow-400 ring-opacity-50' : ''
    }`}>
      {/* Indicador de estado */}
      <div className="absolute top-3 right-3">
        {achievement.earned ? (
          achievement.claimed ? (
            <CheckCircle className="h-5 w-5 text-green-600" />
          ) : (
            <Gift className="h-5 w-5 text-yellow-600" />
          )
        ) : (
          <Clock className="h-5 w-5 text-gray-400" />
        )}
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-start space-x-3">
          <div className={`p-2 rounded-lg ${
            achievement.earned ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
          }`}>
            {getIcon(achievement.icon)}
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold text-gray-900 mb-1">
              {achievement.title}
            </CardTitle>
            <p className="text-sm text-gray-600 leading-relaxed">
              {achievement.description}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Badges de categoría y dificultad */}
        <div className="flex items-center space-x-2 mb-4">
          <Badge className={getCategoryColor(achievement.category)}>
            {getCategoryLabel(achievement.category)}
          </Badge>
          <Badge variant="outline" className={getDifficultyColor(achievement.difficulty)}>
            {getDifficultyLabel(achievement.difficulty)}
          </Badge>
          <Badge variant="secondary">
            {achievement.points} pts
          </Badge>
        </div>

        {/* Progreso (si no está completado) */}
        {!achievement.earned && achievement.progress !== undefined && achievement.maxProgress && (
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Progreso</span>
              <span className="text-sm text-gray-500">
                {achievement.progress}/{achievement.maxProgress}
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        )}

        {/* Recompensas */}
        <div className="mb-4">
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 text-blue-500" />
              <span className="text-gray-600">{achievement.reward.xp} XP</span>
            </div>
            <div className="flex items-center space-x-1">
              <Trophy className="h-4 w-4 text-yellow-500" />
              <span className="text-gray-600">{achievement.reward.crolars} Crolars</span>
            </div>
          </div>
        </div>

        {/* Fecha de obtención */}
        {achievement.earned && achievement.earnedDate && (
          <div className="mb-4">
            <p className="text-xs text-gray-500">
              Obtenido el {new Date(achievement.earnedDate).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        )}

        {/* Botón de reclamar */}
        {achievement.earned && achievement.claimable && !achievement.claimed && (
          <Button 
            onClick={handleClaim}
            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white"
            size="sm"
          >
            <Gift className="h-4 w-4 mr-2" />
            Reclamar Recompensa
          </Button>
        )}

        {/* Estado completado */}
        {achievement.earned && achievement.claimed && (
          <div className="flex items-center justify-center py-2 text-green-600">
            <CheckCircle className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">Completado</span>
          </div>
        )}

        {/* Estado bloqueado */}
        {!achievement.earned && (
          <div className="flex items-center justify-center py-2 text-gray-400">
            <Clock className="h-4 w-4 mr-2" />
            <span className="text-sm">En progreso</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default AchievementCard