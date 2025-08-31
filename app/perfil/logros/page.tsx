'use client'

export const dynamic = 'force-dynamic'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import AchievementCard from '@/components/perfil/AchievementCard'
import BadgeCollection from '@/components/gamification/BadgeCollection'
import { Trophy, Award } from 'lucide-react'

const mockAchievements = [
  {
    id: '1',
    title: 'Bienvenido a La Cantuta',
    description: 'Completaste tu registro en la Universidad Nacional de Educación',
    icon: 'Trophy',
    category: 'milestone' as const,
    difficulty: 'easy' as const,
    points: 50,
    earned: true,
    earnedDate: '2024-01-15',
    claimed: false,
    claimable: true,
    reward: 'XP: 50, Crolars: 10'
  },
  {
    id: '2',
    title: 'Futuro Educador',
    description: 'Completaste 10 módulos de formación pedagógica',
    icon: 'Star',
    category: 'learning' as const,
    difficulty: 'medium' as const,
    points: 100,
    earned: true,
    earnedDate: '2024-01-20',
    claimed: true,
    claimable: true,
    reward: 'XP: 100, Crolars: 25'
  },
  {
    id: '3',
    title: 'Maestro de la Tecnología',
    description: 'Domina 50 conceptos de programación educativa',
    icon: 'Award',
    category: 'challenge' as const,
    difficulty: 'hard' as const,
    points: 500,
    earned: false,
    progress: 23,
    maxProgress: 50,
    claimed: false,
    claimable: false,
    reward: 'XP: 500, Crolars: 100'
  },
  {
    id: '4',
    title: 'Compañero Solidario',
    description: 'Ayuda a 5 estudiantes cantutinos en el foro académico',
    icon: 'Award',
    category: 'social' as const,
    difficulty: 'medium' as const,
    points: 150,
    earned: true,
    earnedDate: '2024-01-25',
    claimed: false,
    claimable: true,
    reward: 'XP: 150, Crolars: 30'
  }
]

export default function ProfileAchievementsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Logros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockAchievements.map((achievement) => (
                <AchievementCard key={achievement.id} achievement={achievement} />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sección de insignias omitida por falta de datos */}
      </div>
    </div>
  )
}
