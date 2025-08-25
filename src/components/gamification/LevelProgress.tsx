'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Trophy, 
  Star, 
  Zap, 
  TrendingUp, 
  Award,
  ChevronRight,
  Info
} from 'lucide-react'
import { Level } from '@/types/gamification'
import { LEVELS } from '@/services/gamificationService'

interface LevelProgressProps {
  currentXp: number
  totalXp: number
  level: number
  crolars: number
  className?: string
  showDetails?: boolean
}

export default function LevelProgress({ 
  currentXp, 
  totalXp, 
  level, 
  crolars, 
  className = '',
  showDetails = true 
}: LevelProgressProps) {
  const [showLevelDetails, setShowLevelDetails] = useState(false)
  const [currentLevel, setCurrentLevel] = useState<Level | null>(null)
  const [nextLevel, setNextLevel] = useState<Level | null>(null)
  const [progressPercentage, setProgressPercentage] = useState(0)
  const [xpToNext, setXpToNext] = useState(0)

  useEffect(() => {
    // Encontrar nivel actual
    const current = LEVELS.find(l => l.level === level) || LEVELS[0]
    setCurrentLevel(current)

    // Encontrar siguiente nivel
    const next = LEVELS.find(l => l.level === level + 1)
    setNextLevel(next)

    if (next) {
      // Calcular progreso hacia el siguiente nivel
      const currentLevelXp = totalXp - current.minXp
      const xpNeededForNext = next.minXp - current.minXp
      const percentage = Math.min((currentLevelXp / xpNeededForNext) * 100, 100)
      
      setProgressPercentage(percentage)
      setXpToNext(next.minXp - totalXp)
    } else {
      // Nivel máximo alcanzado
      setProgressPercentage(100)
      setXpToNext(0)
    }
  }, [totalXp, level])

  const getLevelColor = (levelNum: number) => {
    if (levelNum <= 3) return 'text-green-600 bg-green-100'
    if (levelNum <= 6) return 'text-blue-600 bg-blue-100'
    if (levelNum <= 9) return 'text-purple-600 bg-purple-100'
    if (levelNum <= 12) return 'text-orange-600 bg-orange-100'
    return 'text-red-600 bg-red-100'
  }

  const getLevelIcon = (levelNum: number) => {
    if (levelNum <= 3) return <Star className="h-4 w-4" />
    if (levelNum <= 6) return <Trophy className="h-4 w-4" />
    if (levelNum <= 9) return <Award className="h-4 w-4" />
    if (levelNum <= 12) return <Zap className="h-4 w-4" />
    return <TrendingUp className="h-4 w-4" />
  }

  return (
    <Card className={`${className}`}>
      <CardContent className="p-6">
        {/* Header con nivel actual */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${getLevelColor(level)}`}>
              {getLevelIcon(level)}
            </div>
            <div>
              <h3 className="font-semibold text-lg">
                {currentLevel?.name || 'Novato'}
              </h3>
              <p className="text-sm text-gray-600">Nivel {level}</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="flex items-center gap-1 text-yellow-600 font-semibold">
              <Trophy className="h-4 w-4" />
              <span>{crolars.toLocaleString()}</span>
            </div>
            <p className="text-xs text-gray-500">Crolars</p>
          </div>
        </div>

        {/* Barra de progreso */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              {totalXp.toLocaleString()} XP total
            </span>
            {nextLevel && (
              <span className="text-gray-600">
                {xpToNext.toLocaleString()} XP para {nextLevel.name}
              </span>
            )}
          </div>
          
          <Progress 
            value={progressPercentage} 
            className="h-3"
          />
          
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{currentLevel?.minXp.toLocaleString()} XP</span>
            {nextLevel && (
              <span>{nextLevel.minXp.toLocaleString()} XP</span>
            )}
          </div>
        </div>

        {/* Siguiente nivel preview */}
        {nextLevel && showDetails && (
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded ${getLevelColor(nextLevel.level)}`}>
                  {getLevelIcon(nextLevel.level)}
                </div>
                <span className="font-medium text-sm">
                  Próximo: {nextLevel.name}
                </span>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </div>
            
            <div className="flex items-center gap-4 text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <Trophy className="h-3 w-3 text-yellow-500" />
                <span>+{nextLevel.rewards.crolars} Crolars</span>
              </div>
              {nextLevel.rewards.badges && (
                <div className="flex items-center gap-1">
                  <Award className="h-3 w-3 text-purple-500" />
                  <span>Nueva insignia</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Botón para ver detalles */}
        {showDetails && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowLevelDetails(!showLevelDetails)}
            className="w-full"
          >
            <Info className="h-4 w-4 mr-2" />
            {showLevelDetails ? 'Ocultar' : 'Ver'} detalles de niveles
          </Button>
        )}

        {/* Detalles de todos los niveles */}
        {showLevelDetails && (
          <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
            <h4 className="font-medium text-sm text-gray-700 mb-2">Todos los niveles</h4>
            {LEVELS.map((lvl) => (
              <div 
                key={lvl.level}
                className={`flex items-center justify-between p-2 rounded text-sm ${
                  lvl.level === level 
                    ? 'bg-blue-50 border border-blue-200' 
                    : lvl.level < level 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-gray-50 border border-gray-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`p-1 rounded ${getLevelColor(lvl.level)}`}>
                    {getLevelIcon(lvl.level)}
                  </div>
                  <div>
                    <span className="font-medium">{lvl.name}</span>
                    <span className="text-gray-500 ml-1">(Nivel {lvl.level})</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-gray-600">
                    {lvl.minXp.toLocaleString()} XP
                  </span>
                  <div className="flex items-center gap-1 text-yellow-600">
                    <Trophy className="h-3 w-3" />
                    <span>{lvl.rewards.crolars}</span>
                  </div>
                  {lvl.rewards.badges && (
                    <Badge variant="secondary" className="text-xs px-1 py-0">
                      Insignia
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}