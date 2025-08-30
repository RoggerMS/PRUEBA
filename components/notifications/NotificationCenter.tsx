'use client';

import { useState, useEffect } from 'react';
import { Bell, X, Check, CheckCheck, Trash2, Settings, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useNotifications } from '@/hooks/useNotifications';

export function NotificationCenter() {
  const {
    notifications,
    unreadCount,
    isLoading,
    hasMore,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    page,
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);

  // Cargar más notificaciones
  const loadMore = async () => {
    if (hasMore && !isLoading) {
      await loadNotifications(page + 1, false);
    }
  };

  // Obtener icono según el tipo de notificación
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'LIKE':
        return '❤️';
      case 'COMMENT':
        return '💬';
      case 'FOLLOW':
        return '👥';
      case 'MENTION':
        return '@';
      case 'ACHIEVEMENT_UNLOCKED':
        return '🏆';
      case 'LEVEL_UP':
        return '⬆️';
      case 'CROLAR_EARNED':
        return '💰';
      case 'NOTE_RATED':
        return '⭐';
      case 'ANSWER_ACCEPTED':
        return '✅';
      case 'MARKETPLACE_SALE':
        return '🛒';
      default:
        return '🔔';
    }
  };

  // Navegar a la notificación
  const handleNotificationClick = async (notification: any) => {
    if (!notification.readAt) {
      await markAsRead(notification.id);
    }
    
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
    
    setIsOpen(false);
  };

  useEffect(() => {
    if (isOpen && notifications.length === 0) {
      loadNotifications(1, true);
    }
  }, [isOpen, notifications.length, loadNotifications]);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="end" 
        className="w-80 max-h-96 p-0"
        sideOffset={5}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Notificaciones</h3>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs"
              >
                <CheckCheck className="h-4 w-4 mr-1" />
                Marcar todas
              </Button>
            )}
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Lista de notificaciones */}
        <ScrollArea className="max-h-80">
          {isLoading && notifications.length === 0 ? (
            <div className="p-4 text-center">
              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
              <p className="text-sm text-gray-500">Cargando notificaciones...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p>No tienes notificaciones</p>
            </div>
          ) : (
            <div className="space-y-1">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    'flex items-start gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 transition-colors',
                    !notification.readAt && 'bg-blue-50'
                  )}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarImage src="/placeholder-avatar.jpg" />
                    <AvatarFallback>
                      <Bell className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(notification.createdAt).toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        {!notification.readAt && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        )}
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-gray-400 hover:text-red-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Botón para cargar más */}
              {hasMore && (
                <div className="p-3 text-center border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={loadMore}
                    disabled={isLoading}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Cargando...
                      </>
                    ) : (
                      'Cargar más'
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-center text-xs"
                onClick={() => {
                  setIsOpen(false);
                  // Navegar a página completa de notificaciones
                  window.location.href = '/notifications';
                }}
              >
                Ver todas las notificaciones
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default NotificationCenter;