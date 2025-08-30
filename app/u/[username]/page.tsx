import React from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MapPin, Calendar, GraduationCap, Users, MessageSquare, Heart, Share2, Trophy, Zap, Target, BookOpen } from 'lucide-react'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ProfileHeader } from '@/components/profile/ProfileHeader'
import { ProfileFeed } from '@/components/profile/ProfileFeed'
import Link from 'next/link'

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

const mockStats = [
  { label: 'Desafíos Completados', value: '67', icon: 'Target' },
  { label: 'Días Activo', value: '45', icon: 'Calendar' },
  { label: 'Puntos Totales', value: '1,250', icon: 'Zap' },
  { label: 'Materias Favoritas', value: '3', icon: 'BookOpen' }
]

interface PageProps {
  params: Promise<{ username: string }>
}

export default async function PublicProfilePage({ params }: PageProps) {
  const { username } = await params
  const session = await getServerSession(authOptions)
  
  // Fetch user data server-side
  let user = null
  let error = null
  
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/users/${username}`, {
      cache: 'no-store'
    })
    
    if (!response.ok) {
      if (response.status === 404) {
        error = 'Usuario no encontrado'
      } else if (response.status === 403) {
        error = 'Este perfil es privado'
      } else {
        error = 'Error al cargar el perfil'
      }
    } else {
      user = await response.json()
    }
  } catch (err) {
    error = 'Error de conexión'
  }

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

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">{error === 'Usuario no encontrado' ? '👤' : '😔'}</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">{error || 'Usuario no encontrado'}</h1>
          <p className="text-gray-600 mb-4">
            {error === 'Usuario no encontrado' 
              ? 'Este usuario no existe o su perfil es privado'
              : 'No pudimos cargar este perfil'
            }
          </p>
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

          {/* Right Column - Feed */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Feed */}
            <ProfileFeed
              isOwnProfile={false}
              username={user.username}
              isPublicView={!session}
            />

            <div className="text-right">
              <Button variant="outline" asChild>
                <Link href={`/u/${user.username}/logros`}>Ver logros</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}