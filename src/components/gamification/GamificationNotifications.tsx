'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  X, 
  Trophy, 
  Award, 
  Zap, 
  TrendingUp, 
  Flame, 
  Star,
  Gift,
  CheckCircle
} from 'lucide-react'
import { Notification } from '@/types/gamification'

interface GamificationNotificationsProps {
  notifications: Notification[]
  onMarkAsRead: (notificationId: string) => void
  onMarkAllAsRead: () => void
  onDismiss: (notificationId: string) => void
  className?: string
}

// Componente para una notificación individual
function NotificationItem({ 
  notification, 
  onMarkAsRead, 
  onDismiss 
}: { 
  notification: Notification
  onMarkAsRead: (id: string) => void
  onDismiss: (id: string) => void
}) {
  const getNotificationIcon = () => {
    switch (notification.type) {
      case 'GAMIFICATION':
        return <Trophy className="h-5 w-5 text-yellow-500" />
      case 'CROLARS_EARNED':
        return <Zap className="h-5 w-5 text-blue-500" />
      case 'ACADEMIC':
        return <Award className="h-5 w-5 text-purple-500" />
      case 'SOCIAL':
        return <TrendingUp className="h-5 w-5 text-green-500" />
      case 'SYSTEM':
        return <Flame className="h-5 w-5 text-orange-500" />
      default:
        return <Star className="h-5 w-5 text-gray-500" />
    }
  }

  const getNotificationColor = () => {
    switch (notification.type) {
      case 'GAMIFICATION':
        return 'border-l-yellow-500 bg-yellow-50'
      case 'CROLARS_EARNED':
        return 'border-l-blue-500 bg-blue-50'
      case 'ACADEMIC':
        return 'border-l-purple-500 bg-purple-50'
      case 'SOCIAL':
        return 'border-l-green-500 bg-green-50'
      case 'SYSTEM':
        return 'border-l-orange-500 bg-orange-50'
      case 'MARKETPLACE':
        return 'border-l-indigo-500 bg-indigo-50'
      default:
        return 'border-l-gray-500 bg-gray-50'
    }
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const notificationDate = new Date(date)
    const diffInMinutes = Math.floor((now.getTime() - notificationDate.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return 'Ahora'
    if (diffInMinutes < 60) return `Hace ${diffInMinutes}m`
    if (diffInMinutes < 1440) return `Hace ${Math.floor(diffInMinutes / 60)}h`
    return `Hace ${Math.floor(diffInMinutes / 1440)}d`
  }

  return (
    <Card className={`border-l-4 ${getNotificationColor()} ${!notification.read ? 'shadow-md' : 'opacity-75'}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Icono */}
          <div className="flex-shrink-0 mt-0.5">
            {getNotificationIcon()}
          </div>

          {/* Contenido */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <h4 className="font-semibold text-sm text-gray-900">
                  {notification.title}
                </h4>
                <p className="text-sm text-gray-600 mt-1">
                  {notification.message}
                </p>

                {/* Datos adicionales según el tipo */}
                {notification.type === 'CROLARS_EARNED' && notification.data && (
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      +{notification.data.amount} Crolars
                    </Badge>
                  </div>
                )}

                {notification.type === 'GAMIFICATION' && notification.data && (
                  <div className="flex items-center gap-2 mt-2">
                    {notification.data.xp && (
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        +{notification.data.xp} XP
                      </Badge>
                    )}
                    {notification.data.level && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Nivel {notification.data.level}
                      </Badge>
                    )}
                  </div>
                )}

                {notification.type === 'ACADEMIC' && notification.data && (
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                      <Award className="h-3 w-3" />
                      <span>{notification.data.achievement || notification.data.course}</span>
                    </div>
                  </div>
                )}

                {notification.type === 'SOCIAL' && notification.data && (
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {notification.data.action || 'Actividad social'}
                    </Badge>
                  </div>
                )}

                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-gray-500">
                    {formatTimeAgo(notification.createdAt)}
                  </span>
                  
                  <div className="flex items-center gap-1">
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onMarkAsRead(notification.id)}
                        className="h-6 px-2 text-xs"
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Marcar leída
                      </Button>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDismiss(notification.id)}
                      className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function GamificationNotifications({ 
  notifications, 
  onMarkAsRead, 
  onMarkAllAsRead, 
  onDismiss, 
  className = '' 
}: GamificationNotificationsProps) {
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  
  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') {
      return !notification.read
    }
    return true
  })

  const unreadCount = notifications.filter(n => !n.read).length

  if (notifications.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-8 text-center">
          <Gift className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="font-semibold text-gray-600 mb-2">No hay notificaciones</h3>
          <p className="text-sm text-gray-500">
            Aquí aparecerán tus logros, subidas de nivel y recompensas
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-lg">Notificaciones</h3>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="bg-red-100 text-red-800">
                {unreadCount} nuevas
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Filtro */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <Button
                variant={filter === 'all' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setFilter('all')}
                className="h-7 px-3 text-xs"
              >
                Todas ({notifications.length})
              </Button>
              <Button
                variant={filter === 'unread' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setFilter('unread')}
                className="h-7 px-3 text-xs"
              >
                No leídas ({unreadCount})
              </Button>
            </div>

            {/* Marcar todas como leídas */}
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={onMarkAllAsRead}
                className="text-xs"
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                Marcar todas
              </Button>
            )}
          </div>
        </div>

        {/* Lista de notificaciones */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredNotifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkAsRead={onMarkAsRead}
              onDismiss={onDismiss}
            />
          ))}
        </div>

        {filteredNotifications.length === 0 && filter === 'unread' && (
          <div className="text-center py-8 text-gray-500">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No hay notificaciones sin leer</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
