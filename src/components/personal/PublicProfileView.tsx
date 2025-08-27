import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { MapPin, GraduationCap, BookOpen, Calendar, Trophy, Star, Target, Zap } from 'lucide-react'

interface UserProfile {
  name: string
  email: string
  avatar: string
  bio: string
  location: string
  university: string
  major: string
  interests: string[]
  socialLinks: {
    linkedin?: string
    github?: string
    twitter?: string
  }
  joinDate: string
  level: number
  xp: number
  nextLevelXP: number
  achievements: Array<{
    id: string
    title: string
    description: string
    icon: string
    unlockedAt: string
    rarity: 'common' | 'rare' | 'epic' | 'legendary'
  }>
  stats: Array<{
    label: string
    value: string
    icon: string
  }>
}

interface PublicProfileViewProps {
  user: UserProfile
}

const PublicProfileView: React.FC<PublicProfileViewProps> = ({ user }) => {
  const progressPercentage = (user.xp / user.nextLevelXP) * 100

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

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header del perfil */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <Avatar className="w-24 h-24">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="text-2xl">
                {user.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold mb-2">{user.name}</h1>
              <p className="text-muted-foreground mb-4">{user.bio}</p>
              
              <div className="flex flex-wrap gap-4 justify-center md:justify-start text-sm text-muted-foreground">
                {user.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {user.location}
                  </div>
                )}
                {user.university && (
                  <div className="flex items-center gap-1">
                    <GraduationCap className="w-4 h-4" />
                    {user.university}
                  </div>
                )}
                {user.major && (
                  <div className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    {user.major}
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Miembro desde {user.joinDate}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Nivel y XP */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Nivel y Experiencia
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">Nivel {user.level}</span>
              <span className="text-muted-foreground">{user.xp} / {user.nextLevelXP} XP</span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Intereses */}
        <Card>
          <CardHeader>
            <CardTitle>Intereses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {user.interests.map((interest, index) => (
                <Badge key={index} variant="secondary">
                  {interest}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Estadísticas */}
        <Card>
          <CardHeader>
            <CardTitle>Estadísticas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {user.stats.map((stat, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getIconComponent(stat.icon)}
                    <span>{stat.label}</span>
                  </div>
                  <span className="font-semibold">{stat.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Logros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Logros ({user.achievements.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {user.achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`p-4 rounded-lg text-white ${getRarityColor(achievement.rarity)}`}
              >
                <div className="flex items-center gap-3 mb-2">
                  {getIconComponent(achievement.icon)}
                  <h3 className="font-semibold">{achievement.title}</h3>
                </div>
                <p className="text-sm opacity-90 mb-2">{achievement.description}</p>
                <p className="text-xs opacity-75">Desbloqueado: {achievement.unlockedAt}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Enlaces sociales */}
      {(user.socialLinks.linkedin || user.socialLinks.github || user.socialLinks.twitter) && (
        <Card>
          <CardHeader>
            <CardTitle>Enlaces</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              {user.socialLinks.linkedin && (
                <a
                  href={user.socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                >
                  LinkedIn
                </a>
              )}
              {user.socialLinks.github && (
                <a
                  href={user.socialLinks.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-800 hover:text-gray-600 transition-colors"
                >
                  GitHub
                </a>
              )}
              {user.socialLinks.twitter && (
                <a
                  href={user.socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-600 transition-colors"
                >
                  Twitter
                </a>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default PublicProfileView