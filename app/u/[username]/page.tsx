'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MapPin, Calendar, GraduationCap, Users, FileText, Trophy, BarChart3, Star, Award, Heart } from 'lucide-react'
import { ProfileHeader } from '@/components/perfil/ProfileHeader'
import { ProfileFeed } from '@/components/perfil/ProfileFeed'
import AchievementCard from '@/components/perfil/AchievementCard'

interface PublicUser {
  id: string
  username: string
  displayName: string
  bio: string
  avatarUrl: string
  bannerUrl?: string
  location: string
  university: string
  major: string
  interests: string[]
  joinDate: string
  isPublic: boolean
  followers?: number
  following?: number
  posts?: number
}

// Mock achievements and stats for demo
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

const mockStats = [
  { label: 'Desafíos Completados', value: '67', icon: 'Target' },
  { label: 'Días Activo', value: '45', icon: 'Calendar' },
  { label: 'Puntos Totales', value: '1,250', icon: 'Zap' },
  { label: 'Materias Favoritas', value: '3', icon: 'BookOpen' }
]

export default function PublicProfilePage() {
  const params = useParams()
  const username = params.username as string
  const [user, setUser] = useState<PublicUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/users/${username}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Usuario no encontrado')
          } else if (response.status === 403) {
            setError('Este perfil es privado')
          } else {
            setError('Error al cargar el perfil')
          }
          return
        }

        const userData = await response.json()
        setUser(userData)
      } catch (err) {
        console.error('Error fetching user:', err)
        setError('Error al cargar el perfil')
        toast.error('Error al cargar el perfil del usuario')
      } finally {
        setLoading(false)
      }
    }

    if (username) {
      fetchUser()
    }
  }, [username])

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'bg-gradient-to-r from-yellow-400 to-orange-500'
      case 'epic': return 'bg-gradient-to-r from-purple-400 to-pink-500'
      case 'rare': return 'bg-gradient-to-r from-blue-400 to-cyan-500'
      default: return 'bg-gradient-to-r from-gray-400 to-gray-500'
    }
  }

  const getIconComponent = (iconName: string) => {
    const iconMap: { [key: string]: React.ComponentType<any> } = {
      Trophy, Star, Target, Zap, Calendar, BookOpen
    }
    const IconComponent = iconMap[iconName] || Trophy
    return <IconComponent className="w-4 h-4" />
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {error || 'Usuario no encontrado'}
          </h1>
          <p className="text-gray-600 mb-4">
            El perfil que buscas no existe o no está disponible públicamente.
          </p>
          <a 
            href="/" 
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Volver al inicio
          </a>
        </div>
      </div>
    )
  }

  // Transform user data for ProfileHeader
  const headerUser = {
    id: user.id,
    name: user.displayName,
    username: user.username,
    avatar: user.avatarUrl,
    banner: user.bannerUrl,
    bio: user.bio,
    location: user.location,
    university: user.university,
    major: user.major,
    joinDate: new Date(user.joinDate).toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long' 
    }),
    followers: user.followers,
    following: user.following,
    posts: user.posts
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Profile Header */}
        <ProfileHeader 
          user={headerUser}
          mode="public"
        />

        {/* Profile Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Info Cards */}
          <div className="lg:col-span-1 space-y-6">
            {/* Interests */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Intereses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {user.interests.map((interest, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {interest}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Estadísticas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockStats.map((stat, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getIconComponent(stat.icon)}
                      <span className="text-sm text-gray-600">{stat.label}</span>
                    </div>
                    <span className="font-semibold">{stat.value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Feed and Achievements */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Feed */}
            <ProfileFeed 
              posts={[]} // TODO: Cargar posts reales del usuario
              isOwnProfile={false}
              username={user.username}
            />

            {/* Recent Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Logros Destacados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mockAchievements.map((achievement) => (
                    <AchievementCard 
                      key={achievement.id} 
                      achievement={achievement} 
                      showDetails={false}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}