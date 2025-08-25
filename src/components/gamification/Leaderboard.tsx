'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Trophy, 
  Medal, 
  Award, 
  Crown, 
  TrendingUp, 
  Users, 
  Calendar,
  Zap,
  Target,
  Star
} from 'lucide-react'
import { Leaderboard as LeaderboardType, LeaderboardEntry } from '@/types/gamification'

interface LeaderboardProps {
  leaderboard: LeaderboardType
  currentUserId?: string
  className?: string
}

// Componente para una entrada del leaderboard
function LeaderboardEntryItem({ 
  entry, 
  position, 
  leaderboard,
  isCurrentUser = false 
}: { 
  entry: LeaderboardEntry
  position: number
  leaderboard: LeaderboardType
  isCurrentUser?: boolean
}) {
  const getRankIcon = () => {
    switch (position) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />
      default:
        return (
          <div className="h-5 w-5 flex items-center justify-center text-sm font-semibold text-gray-600">
            {position}
          </div>
        )
    }
  }

  const getRankBadgeColor = () => {
    switch (position) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white'
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white'
      case 3:
        return 'bg-gradient-to-r from-amber-400 to-amber-600 text-white'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const formatScore = (score: number, category: string) => {
    switch (category) {
      case 'xp':
        return `${score.toLocaleString()} XP`
      case 'level':
        return `Nivel ${score}`
      case 'achievements':
        return `${score} logros`
      case 'streak':
        return `${score} días`
      case 'crolars':
        return `${score.toLocaleString()} Crolars`
      default:
        return score.toLocaleString()
    }
  }

  return (
    <div className={`flex items-center gap-4 p-4 rounded-lg transition-colors ${
      isCurrentUser 
        ? 'bg-blue-50 border-2 border-blue-200' 
        : 'hover:bg-gray-50'
    }`}>
      {/* Posición */}
      <div className="flex-shrink-0">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
          position <= 3 ? getRankBadgeColor() : 'bg-gray-100'
        }`}>
          {getRankIcon()}
        </div>
      </div>

      {/* Avatar y nombre */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <Avatar className="h-10 w-10">
          <AvatarImage src={entry.user.avatar} alt={entry.user.name} />
          <AvatarFallback>
            {entry.user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className={`font-semibold truncate ${
              isCurrentUser ? 'text-blue-700' : 'text-gray-900'
            }`}>
              {entry.user.name}
              {isCurrentUser && (
                <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-800">
                  Tú
                </Badge>
              )}
            </h4>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Nivel {entry.user.level}</span>
          </div>
        </div>
      </div>

      {/* Puntuación */}
      <div className="flex-shrink-0 text-right">
        <div className={`font-bold text-lg ${
          isCurrentUser ? 'text-blue-700' : 'text-gray-900'
        }`}>
          {formatScore(entry.value, leaderboard.category)}
        </div>
        
        {entry.change !== undefined && (
          <div className={`flex items-center gap-1 text-sm ${
            entry.change > 0 
              ? 'text-green-600' 
              : entry.change < 0 
                ? 'text-red-600' 
                : 'text-gray-500'
          }`}>
            {entry.change > 0 && <TrendingUp className="h-3 w-3" />}
            {entry.change !== 0 && (
              <span>
                {entry.change > 0 ? '+' : ''}{entry.change}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function Leaderboard({ 
  leaderboard, 
  currentUserId, 
  className = '' 
}: LeaderboardProps) {
  const [timeFilter, setTimeFilter] = useState<'daily' | 'weekly' | 'monthly' | 'all'>('weekly')
  
  const getLeaderboardIcon = () => {
    switch (leaderboard.category) {
      case 'xp':
        return <Zap className="h-5 w-5 text-blue-500" />
      case 'level':
        return <TrendingUp className="h-5 w-5 text-green-500" />
      case 'achievements':
        return <Award className="h-5 w-5 text-purple-500" />
      case 'streak':
        return <Target className="h-5 w-5 text-orange-500" />
      case 'crolars':
        return <Star className="h-5 w-5 text-yellow-500" />
      default:
        return <Trophy className="h-5 w-5 text-gray-500" />
    }
  }

  const getLeaderboardTitle = () => {
    switch (leaderboard.category) {
      case 'xp':
        return 'Ranking de Experiencia'
      case 'level':
        return 'Ranking de Niveles'
      case 'achievements':
        return 'Coleccionistas de Logros'
      case 'streak':
        return 'Rachas más Largas'
      case 'crolars':
        return 'Ranking de Crolars'
      default:
        return 'Clasificación General'
    }
  }

  const getTimeFilterLabel = () => {
    switch (timeFilter) {
      case 'daily':
        return 'Hoy'
      case 'weekly':
        return 'Esta semana'
      case 'monthly':
        return 'Este mes'
      case 'all':
        return 'Histórico'
      default:
        return 'Esta semana'
    }
  }

  // Encontrar la posición del usuario actual
  const currentUserEntry = leaderboard.users.find(entry => entry.user.id === currentUserId)
  const currentUserPosition = currentUserEntry 
    ? leaderboard.users.findIndex(entry => entry.user.id === currentUserId) + 1
    : null

  // Mostrar top 10 + usuario actual si no está en el top 10
  const topEntries = leaderboard.users.slice(0, 10)
  const showCurrentUser = currentUserEntry && currentUserPosition && currentUserPosition > 10

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getLeaderboardIcon()}
            <div>
              <CardTitle className="text-xl">{getLeaderboardTitle()}</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Compite con otros estudiantes y sube en el ranking
              </p>
            </div>
          </div>

          {/* Filtros de tiempo */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            {(['daily', 'weekly', 'monthly', 'all'] as const).map((filter) => (
              <Button
                key={filter}
                variant={timeFilter === filter ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setTimeFilter(filter)}
                className="h-8 px-3 text-xs"
              >
                {filter === 'daily' && 'Diario'}
                {filter === 'weekly' && 'Semanal'}
                {filter === 'monthly' && 'Mensual'}
                {filter === 'all' && 'Total'}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Estadísticas generales */}
        <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Users className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">Participantes</span>
            </div>
            <div className="font-bold text-lg">{leaderboard.users.length}</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">Período</span>
            </div>
            <div className="font-bold text-sm">{getTimeFilterLabel()}</div>
          </div>
          
          {currentUserPosition && (
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Trophy className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">Tu posición</span>
              </div>
              <div className="font-bold text-lg text-blue-600">#{currentUserPosition}</div>
            </div>
          )}
        </div>

        {/* Lista del leaderboard */}
        <div className="space-y-2">
          {topEntries.map((entry, index) => (
            <LeaderboardEntryItem
              key={entry.user.id}
              entry={entry}
              position={index + 1}
              leaderboard={leaderboard}
              isCurrentUser={entry.user.id === currentUserId}
            />
          ))}

          {/* Usuario actual si no está en el top 10 */}
          {showCurrentUser && currentUserEntry && currentUserPosition && (
            <>
              <div className="flex items-center justify-center py-2">
                <div className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  ... {currentUserPosition - 11} posiciones más ...
                </div>
              </div>
              
              <LeaderboardEntryItem
                entry={currentUserEntry}
                position={currentUserPosition}
                leaderboard={leaderboard}
                isCurrentUser={true}
              />
            </>
          )}
        </div>

        {leaderboard.users.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="font-semibold mb-2">No hay datos disponibles</h3>
            <p className="text-sm">
              Completa actividades para aparecer en el ranking
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
