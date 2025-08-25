'use client'

import { useState } from 'react'
import { Calendar, Flame, Gift } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'
import { Badge } from '@/src/components/ui/badge'
import { formatCrolars } from '@/lib/utils'

interface StreakDay {
  day: number
  reward: number
  completed: boolean
  current: boolean
}

const streakDays: StreakDay[] = [
  { day: 1, reward: 1, completed: true, current: false },
  { day: 2, reward: 2, completed: true, current: false },
  { day: 3, reward: 3, completed: true, current: false },
  { day: 4, reward: 4, completed: false, current: true },
  { day: 5, reward: 5, completed: false, current: false },
  { day: 6, reward: 7, completed: false, current: false },
  { day: 7, reward: 10, completed: false, current: false },
]

export default function WeeklyStreak() {
  const [canClaim, setCanClaim] = useState(true)
  const [totalEarned, setTotalEarned] = useState(6) // 1+2+3 = 6 Crolars earned
  
  const currentDay = streakDays.find(day => day.current)
  const completedDays = streakDays.filter(day => day.completed).length
  const totalPossible = streakDays.reduce((sum, day) => sum + day.reward, 0)

  const handleClaim = () => {
    if (canClaim && currentDay) {
      setTotalEarned(prev => prev + currentDay.reward)
      setCanClaim(false)
      // TODO: Actualizar estado en el backend
      console.log(`Reclamados ${currentDay.reward} Crolars`)
    }
  }

  return (
    <Card className="crunevo-card streak-widget">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center space-x-2">
            <Flame className="h-5 w-5 text-orange-500" />
            <span>Racha Semanal</span>
          </CardTitle>
          <Badge variant="crolars" className="text-xs">
            {formatCrolars(totalEarned)}/{formatCrolars(totalPossible)} ₡
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Progress Bar */}
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-orange-400 to-red-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(completedDays / streakDays.length) * 100}%` }}
            />
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-2">
            {streakDays.map((day) => (
              <div
                key={day.day}
                className={`
                  relative flex flex-col items-center p-2 rounded-lg border-2 transition-all
                  ${
                    day.completed
                      ? 'bg-green-50 border-green-200 text-green-700'
                      : day.current
                      ? 'bg-orange-50 border-orange-200 text-orange-700 ring-2 ring-orange-300'
                      : 'bg-muted border-border text-muted-foreground'
                  }
                `}
              >
                <Calendar className="h-4 w-4 mb-1" />
                <span className="text-xs font-medium">Día {day.day}</span>
                <div className="flex items-center space-x-1 mt-1">
                  <span className="text-xs font-bold">{day.reward}</span>
                  <span className="text-xs">₡</span>
                </div>
                {day.completed && (
                  <div className="absolute -top-1 -right-1 h-4 w-4 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Current Day Info */}
          {currentDay && (
            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4 border border-orange-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-orange-800">¡Día {currentDay.day} disponible!</h4>
                  <p className="text-sm text-orange-600">
                    Reclama {currentDay.reward} Crolars por tu actividad de hoy
                  </p>
                </div>
                <Button
                  variant="crolars"
                  size="sm"
                  onClick={handleClaim}
                  disabled={!canClaim}
                  className="flex items-center space-x-1"
                >
                  <Gift className="h-4 w-4" />
                  <span>{canClaim ? 'Reclamar' : 'Reclamado'}</span>
                </Button>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-2xl font-bold text-primary">{completedDays}</p>
              <p className="text-xs text-muted-foreground">Días completados</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-2xl font-bold text-crolars">{formatCrolars(totalEarned)}</p>
              <p className="text-xs text-muted-foreground">Crolars ganados</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}