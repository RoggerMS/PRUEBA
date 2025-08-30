import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import AchievementCard from '@/components/perfil/AchievementCard'
import { Trophy } from 'lucide-react'

const mockAchievements = [
  {
    id: '1',
    title: 'Primer Paso',
    description: 'Completaste tu primer desafío',
    icon: 'Trophy',
    unlockedAt: 'Enero 2024',
    rarity: 'common' as const
  },
  {
    id: '2',
    title: 'Estudiante Dedicado',
    description: 'Completaste 10 desafíos',
    icon: 'Star',
    unlockedAt: 'Febrero 2024',
    rarity: 'rare' as const
  },
  {
    id: '3',
    title: 'Maestro del Código',
    description: 'Resolviste 50 problemas de programación',
    icon: 'Target',
    unlockedAt: 'Marzo 2024',
    rarity: 'epic' as const
  }
]

interface PageProps {
  params: { username: string }
}

export default function PublicAchievementsPage({ params }: PageProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Logros de {params.username}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockAchievements.map((achievement) => (
                <AchievementCard key={achievement.id} achievement={achievement} showDetails={false} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
