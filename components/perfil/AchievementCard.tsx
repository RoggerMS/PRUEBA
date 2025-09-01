'use client'

import { useState } from 'react'
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
  Trophy,
  Gift,
  Sparkles,
  Check
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
  claimed?: boolean
  claimable?: boolean
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
  onClaim?: (achievementId: string) => void
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
  onShare,
  onClaim
}: AchievementCardProps) {
  const [isClaiming, setIsClaiming] = useState(false)
  const [isClaimed, setIsClaimed] = useState(achievement.claimed || false)
  const [showClaimAnimation, setShowClaimAnimation] = useState(false)
  
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

  const handleClaim = async () => {
    if (!achievement.earned || !achievement.claimable || isClaimed || isClaiming) {
      return
    }

    setIsClaiming(true)
    setShowClaimAnimation(true)

    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Actualizar estado
      setIsClaimed(true)
      
      // Mostrar toast de éxito
      toast.success(
        `¡Logro reclamado! +${achievement.reward?.xp || 0} XP, +${achievement.reward?.crolars || 0} Crolars`,
        {
          duration: 4000,
          description: `Has reclamado las recompensas del logro "${achievement.title}"`
        }
      )
      
      // Llamar callback si existe
      if (onClaim) {
        onClaim(achievement.id)
      }
      
    } catch (error) {
      toast.error('Error al reclamar el logro. Inténtalo de nuevo.')
    } finally {
      setIsClaiming(false)
      setTimeout(() => setShowClaimAnimation(false), 2000)
    }
  }

  return (
    <Card className={`group relative overflow-hidden transition-all duration-500 hover:shadow-xl hover:-translate-y-1 ${
      achievement.earned 
        ? 'bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 border-amber-200 shadow-lg hover:shadow-amber-200/50' 
        : 'bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200 hover:border-gray-300 hover:bg-gradient-to-br hover:from-gray-100 hover:to-slate-100'
    }`}>
      <CardContent className="p-6 space-y-4">
        {/* Decorative background element */}
        {achievement.earned && (
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-amber-200/20 to-transparent rounded-full transform translate-x-16 -translate-y-16 group-hover:scale-110 transition-transform duration-700" />
        )}
        
        {/* Header */}
        <div className="flex items-start justify-between relative z-10">
          <div className="flex items-center gap-4">
            <div className={`relative flex items-center justify-center w-16 h-16 rounded-xl transition-all duration-300 group-hover:scale-105 ${
              achievement.earned 
                ? 'bg-gradient-to-br from-amber-100 to-yellow-100 text-amber-600 shadow-md group-hover:shadow-lg' 
                : 'bg-gradient-to-br from-gray-100 to-slate-100 text-gray-400 group-hover:text-gray-500'
            }`}>
              <div className={`text-2xl transition-all duration-300 ${
                achievement.earned ? 'animate-pulse' : 'grayscale'
              }`}>
                {achievement.icon === 'Trophy' && <Trophy className="h-8 w-8" />}
                {achievement.icon === 'Star' && <Award className="h-8 w-8" />}
                {achievement.icon === 'Award' && <Award className="h-8 w-8" />}
              </div>
              {achievement.earned && (
                <div className="absolute -top-1 -right-1 animate-bounce">
                  <div className="w-6 h-6 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full flex items-center justify-center shadow-lg">
                    <Award className="h-3 w-3 text-white" />
                  </div>
                </div>
              )}
              {!achievement.earned && (
                <div className="absolute -top-1 -right-1">
                  <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                    <Lock className="h-3 w-3 text-gray-500" />
                  </div>
                </div>
              )}
            </div>
            <div className="flex-1">
              <h3 className={`font-bold text-xl mb-2 transition-colors duration-300 ${
                achievement.earned 
                  ? 'text-gray-900 group-hover:text-amber-700' 
                  : 'text-gray-600 group-hover:text-gray-700'
              }`}>
                {achievement.title}
              </h3>
              <p className={`text-sm leading-relaxed transition-colors duration-300 ${
                achievement.earned 
                  ? 'text-gray-700 group-hover:text-gray-800' 
                  : 'text-gray-500 group-hover:text-gray-600'
              }`}>
                {achievement.description}
              </p>
              <div className="flex items-center gap-2 mt-3">
                <Badge 
                  variant="outline" 
                  className={`text-xs transition-all duration-300 ${difficultyColors[achievement.difficulty]} ${
                    achievement.earned 
                      ? 'group-hover:border-amber-400 group-hover:bg-amber-100' 
                      : 'group-hover:border-gray-400 group-hover:bg-gray-100'
                  }`}
                >
                  {difficultyLabels[achievement.difficulty]}
                </Badge>
              </div>
            </div>
          </div>
          

        </div>

        {/* Progress or Points */}
        <div className="relative z-10">
          {achievement.earned ? (
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg border border-amber-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full flex items-center justify-center shadow-md">
                  <Trophy className="h-4 w-4 text-white" />
                </div>
                <div>
                  <span className="text-sm font-bold text-amber-800">
                    +{achievement.points} puntos
                  </span>
                  <p className="text-xs text-amber-600">¡Logro desbloqueado!</p>
                </div>
              </div>
              <div className="flex gap-2">
                {/* Botón de Reclamar */}
                {achievement.claimable && !isClaimed ? (
                  <Button
                    onClick={handleClaim}
                    disabled={isClaiming}
                    className={`relative overflow-hidden bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0 transition-all duration-300 ${showClaimAnimation ? 'animate-pulse' : ''}`}
                    size="sm"
                  >
                    {isClaiming ? (
                      <>
                        <Sparkles className="h-3 w-3 mr-1 animate-spin" />
                        Reclamando...
                      </>
                    ) : (
                      <>
                        <Gift className="h-3 w-3 mr-1" />
                        Reclamar
                      </>
                    )}
                    {showClaimAnimation && (
                      <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/30 to-orange-400/30 animate-pulse" />
                    )}
                  </Button>
                ) : isClaimed ? (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled
                    className="border-green-300 text-green-700 bg-green-50 dark:bg-green-900/20 dark:text-green-300 dark:border-green-700"
                  >
                    <Check className="h-3 w-3 mr-1" />
                    Reclamado
                  </Button>
                ) : null}
                
                {/* Botón de Compartir */}
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={handleShare}
                  className="border-amber-300 text-amber-700 hover:bg-amber-100 hover:border-amber-400 transition-all duration-300 group-hover:scale-105"
                >
                  <Share2 className="h-3 w-3 mr-1" />
                  Compartir
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3 p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 font-medium">Progreso</span>
                <span className="text-gray-800 font-bold">
                  {achievement.progress}/{achievement.maxProgress}
                </span>
              </div>
              <div className="relative">
                <Progress 
                  value={progressPercentage} 
                  className="h-3 bg-gray-200"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full opacity-75" 
                     style={{ width: `${progressPercentage}%` }} />
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-4 h-4 bg-gray-300 rounded-full flex items-center justify-center">
                  <Lock className="h-2 w-2 text-gray-600" />
                </div>
                <span className="text-gray-600">
                  <span className="font-medium">Recompensa:</span> {achievement.reward?.xp} XP, {achievement.reward?.crolars} Crolars
                </span>
              </div>
            </div>
          )}
        </div>

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
