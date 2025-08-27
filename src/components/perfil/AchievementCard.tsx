'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { 
  Award, 
  Lock, 
  Calendar, 
  Target, 
  Share2,
  Trophy
} from 'lucide-react'
import { toast } from 'sonner'

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  category: 'learning' | 'social' | 'streak' | 'challenge' | 'milestone'
  difficulty: 'easy' | 'medium' | 'hard' | 'legendary'
  points: number
  earned: boolean
  earnedDate?: string
  progress?: number
  maxProgress?: number
  requirements?: string[]
  reward?: {
    xp: number
    crolars: number
    badge?: string
  }
}

interface AchievementCardProps {
  achievement: Achievement
  showDetails?: boolean
  onShare?: (achievement: Achievement) => void
}

const categoryColors = {
  learning: 'from-blue-500 to-blue-600',
  social: 'from-green-500 to-green-600',
  streak: 'from-orange-500 to-orange-600',
  challenge: 'from-purple-500 to-purple-600',
  milestone: 'from-yellow-500 to-yellow-600'
}

const difficultyColors = {
  easy: 'bg-green-100 text-green-800 border-green-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  hard: 'bg-red-100 text-red-800 border-red-200',
  legendary: 'bg-purple-100 text-purple-800 border-purple-200'
}

const difficultyLabels = {
  easy: 'Fácil',
  medium: 'Medio',
  hard: 'Difícil',
  legendary: 'Legendario'
}

export default function AchievementCard({ 
  achievement, 
  showDetails = false, 
  onShare 
}: AchievementCardProps) {
  const progressPercentage = achievement.progress && achievement.maxProgress 
    ? (achievement.progress / achievement.maxProgress) * 100 
    : 0

  const handleShare = () => {
    if (onShare) {
      onShare(achievement)
    } else {
      // Compartir por defecto
      const text = `¡Acabo de desbloquear el logro "${achievement.title}" en CRUNEVO! 🏆`
      if (navigator.share) {
        navigator.share({
          title: 'Logro Desbloqueado',
          text: text,
          url: window.location.href
        })
      } else {
        navigator.clipboard.writeText(text)
        toast.success('Texto copiado al portapapeles')
      }
    }
  }

  return (
    <Card className={`transition-all duration-300 hover:shadow-lg ${
      achievement.earned 
        ? 'bg-gradient-to-br from-yellow-50 via-orange-50 to-yellow-50 border-yellow-200 shadow-md' 
        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
    }`}>
      <CardContent className="p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`relative text-3xl transition-all duration-200 ${
              achievement.earned ? 'scale-110' : 'grayscale opacity-50'
            }`}>
              {achievement.icon}
              {achievement.earned && (
                <div className="absolute -top-1 -right-1">
                  <Award className="h-4 w-4 text-yellow-500 bg-white rounded-full" />
                </div>
              )}
              {!achievement.earned && (
                <div className="absolute -top-1 -right-1">
                  <Lock className="h-4 w-4 text-gray-400 bg-white rounded-full" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className={`font-bold text-lg ${
                  achievement.earned ? 'text-gray-900' : 'text-gray-500'
                }`}>
                  {achievement.title}
                </h3>
                <Badge 
                  variant="outline" 
                  className={`text-xs ${difficultyColors[achievement.difficulty]}`}
                >
                  {difficultyLabels[achievement.difficulty]}
                </Badge>
              </div>
              <p className={`text-sm ${
                achievement.earned ? 'text-gray-700' : 'text-gray-500'
              }`}>
                {achievement.description}
              </p>
            </div>
          </div>
          
          {achievement.earned && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="text-gray-500 hover:text-gray-700"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Progress Bar */}
        {!achievement.earned && achievement.progress !== undefined && achievement.maxProgress && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Progreso</span>
              <span className="text-sm text-gray-600">
                {achievement.progress}/{achievement.maxProgress}
              </span>
            </div>
            <Progress 
              value={progressPercentage} 
              className="h-2"
            />
            <div className="text-xs text-gray-500">
              {Math.round(progressPercentage)}% completado
            </div>
          </div>
        )}

        {/* Earned Date */}
        {achievement.earned && achievement.earnedDate && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>
              Desbloqueado el {new Date(achievement.earnedDate).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>
        )}

        {/* Requirements */}
        {showDetails && !achievement.earned && achievement.requirements && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Target className="h-4 w-4" />
              Requisitos
            </h4>
            <ul className="space-y-1">
              {achievement.requirements.map((req, index) => (
                <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                  <span className="text-gray-400 mt-1">•</span>
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Rewards */}
        {showDetails && achievement.reward && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Recompensas
            </h4>
            <div className="flex flex-wrap gap-2">
              {achievement.reward.xp > 0 && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  +{achievement.reward.xp} XP
                </Badge>
              )}
              {achievement.reward.crolars > 0 && (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  +{achievement.reward.crolars} Crolars
                </Badge>
              )}
              {achievement.reward.badge && (
                <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                  Insignia: {achievement.reward.badge}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Points */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${
              categoryColors[achievement.category]
            }`} />
            <span className="text-xs text-gray-600 capitalize">
              {achievement.category === 'learning' && 'Aprendizaje'}
              {achievement.category === 'social' && 'Social'}
              {achievement.category === 'streak' && 'Racha'}
              {achievement.category === 'challenge' && 'Desafío'}
              {achievement.category === 'milestone' && 'Hito'}
            </span>
          </div>
          <Badge 
            variant="outline" 
            className={achievement.earned ? 'border-yellow-300 text-yellow-700' : 'border-gray-300'}
          >
            {achievement.points} pts
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
