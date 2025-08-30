'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bell, 
  Trophy, 
  Star, 
  Award, 
  TrendingUp, 
  Users, 
  Target, 
  Gift,
  X,
  Check,
  Clock,
  Zap
} from 'lucide-react';

interface Notification {
  id: string;
  type: 'achievement' | 'level_up' | 'badge' | 'competition' | 'milestone' | 'streak';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  data?: {
    xp?: number;
    level?: number;
    badge?: string;
    achievement?: string;
    icon?: string;
  };
}

interface GamificationNotificationsProps {
  notifications?: Notification[];
  onMarkAsRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
  onDismiss?: (id: string) => void;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'level_up',
    title: '¡Subiste de nivel!',
    message: 'Alcanzaste el nivel 12 - Estudiante Avanzado',
    timestamp: '2024-01-15T10:30:00Z',
    read: false,
    data: {
      level: 12,
      xp: 250,
      icon: '🎓'
    }
  },
  {
    id: '2',
    type: 'achievement',
    title: 'Nuevo logro desbloqueado',
    message: 'Colaborador - Ayudaste a 10 compañeros',
    timestamp: '2024-01-15T09:15:00Z',
    read: false,
    data: {
      achievement: 'Colaborador',
      xp: 300,
      icon: '🤝'
    }
  },
  {
    id: '3',
    type: 'badge',
    title: 'Nueva insignia obtenida',
    message: 'Mentor Badge - Por tu dedicación ayudando a otros',
    timestamp: '2024-01-15T08:45:00Z',
    read: true,
    data: {
      badge: 'Mentor Badge',
      icon: '🏆'
    }
  },
  {
    id: '4',
    type: 'competition',
    title: 'Competencia finalizada',
    message: '¡Quedaste en 3er lugar en "Quiz de Matemáticas"!',
    timestamp: '2024-01-14T20:30:00Z',
    read: true,
    data: {
      xp: 150,
      icon: '🥉'
    }
  },
  {
    id: '5',
    type: 'streak',
    title: 'Racha mantenida',
    message: '7 días consecutivos de actividad - ¡Sigue así!',
    timestamp: '2024-01-14T18:00:00Z',
    read: true,
    data: {
      xp: 100,
      icon: '🔥'
    }
  },
  {
    id: '6',
    type: 'milestone',
    title: 'Hito alcanzado',
    message: 'Completaste 50 sesiones de estudio',
    timestamp: '2024-01-14T15:20:00Z',
    read: true,
    data: {
      xp: 200,
      icon: '📚'
    }
  }
];

const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'level_up':
      return TrendingUp;
    case 'achievement':
      return Award;
    case 'badge':
      return Trophy;
    case 'competition':
      return Users;
    case 'milestone':
      return Target;
    case 'streak':
      return Zap;
    default:
      return Bell;
  }
};

const getNotificationColor = (type: Notification['type']) => {
  switch (type) {
    case 'level_up':
      return 'bg-purple-100 text-purple-600 border-purple-200';
    case 'achievement':
      return 'bg-yellow-100 text-yellow-600 border-yellow-200';
    case 'badge':
      return 'bg-blue-100 text-blue-600 border-blue-200';
    case 'competition':
      return 'bg-green-100 text-green-600 border-green-200';
    case 'milestone':
      return 'bg-orange-100 text-orange-600 border-orange-200';
    case 'streak':
      return 'bg-red-100 text-red-600 border-red-200';
    default:
      return 'bg-gray-100 text-gray-600 border-gray-200';
  }
};

const formatTimeAgo = (timestamp: string) => {
  const now = new Date();
  const time = new Date(timestamp);
  const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Ahora mismo';
  if (diffInMinutes < 60) return `Hace ${diffInMinutes}m`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `Hace ${diffInHours}h`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  return `Hace ${diffInDays}d`;
};

export function GamificationNotifications({
  notifications = mockNotifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDismiss
}: GamificationNotificationsProps) {
  const [localNotifications, setLocalNotifications] = useState(notifications);
  const unreadCount = localNotifications.filter(n => !n.read).length;

  useEffect(() => {
    setLocalNotifications(notifications);
  }, [notifications]);

  const handleMarkAsRead = (id: string) => {
    setLocalNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    onMarkAsRead?.(id);
  };

  const handleMarkAllAsRead = () => {
    setLocalNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
    onMarkAllAsRead?.();
  };

  const handleDismiss = (id: string) => {
    setLocalNotifications(prev => 
      prev.filter(n => n.id !== id)
    );
    onDismiss?.(id);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-600" />
            Notificaciones
            {unreadCount > 0 && (
              <Badge className="bg-red-500 hover:bg-red-600 text-white">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleMarkAllAsRead}
              className="text-xs"
            >
              Marcar todas
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-96">
          {localNotifications.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">No hay notificaciones</p>
            </div>
          ) : (
            <div className="space-y-1">
              {localNotifications.map((notification) => {
                const IconComponent = getNotificationIcon(notification.type);
                const colorClasses = getNotificationColor(notification.type);
                
                return (
                  <div
                    key={notification.id}
                    className={`p-4 border-l-4 transition-all duration-200 hover:bg-gray-50 ${
                      !notification.read ? 'bg-blue-50/50' : 'bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-full ${colorClasses}`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <h4 className={`text-sm font-medium ${
                              !notification.read ? 'text-gray-900' : 'text-gray-700'
                            }`}>
                              {notification.title}
                            </h4>
                            <p className="text-xs text-gray-600 mt-1">
                              {notification.message}
                            </p>
                            
                            {/* XP Reward */}
                            {notification.data?.xp && (
                              <Badge 
                                variant="secondary" 
                                className="mt-2 text-xs bg-green-100 text-green-700"
                              >
                                +{notification.data.xp} XP
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-1">
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleMarkAsRead(notification.id)}
                                className="h-6 w-6 p-0 hover:bg-blue-100"
                              >
                                <Check className="w-3 h-3" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDismiss(notification.id)}
                              className="h-6 w-6 p-0 hover:bg-red-100"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            {formatTimeAgo(notification.timestamp)}
                          </div>
                          
                          {notification.data?.icon && (
                            <span className="text-lg">{notification.data.icon}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
        
        {/* Footer */}
        {localNotifications.length > 0 && (
          <div className="p-3 border-t bg-gray-50">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{localNotifications.length} notificaciones</span>
              <Button variant="ghost" size="sm" className="text-xs h-auto p-1">
                Ver historial
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}