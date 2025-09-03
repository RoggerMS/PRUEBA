'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Bell,
  BellRing,
  Check,
  CheckCheck,
  Trash2,
  Settings,
  Heart,
  MessageCircle,
  UserPlus,
  AtSign,
  Mail,
  Award,
  AlertCircle,
  Loader2,
  X
} from 'lucide-react';

interface Notification {
  id: string;
  type: 'LIKE' | 'COMMENT' | 'FOLLOW' | 'MENTION' | 'MESSAGE' | 'SYSTEM' | 'ACHIEVEMENT';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
  relatedId?: string;
  relatedType?: 'POST' | 'COMMENT' | 'USER' | 'MESSAGE';
  metadata?: Record<string, any>;
  sender?: {
    id: string;
    name: string;
    username: string;
    image?: string;
    isVerified: boolean;
  };
}

interface NotificationCenterProps {
  className?: string;
}

export function NotificationCenter({ className }: NotificationCenterProps) {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchNotifications = useCallback(async (pageNum: number = 1, reset: boolean = false) => {
    if (!session?.user || loading) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/notifications?page=${pageNum}&limit=20`);
      const data = await response.json();

      if (response.ok) {
        if (reset) {
          setNotifications(data.notifications);
        } else {
          setNotifications(prev => [...prev, ...data.notifications]);
        }
        setUnreadCount(data.unreadCount);
        setHasMore(data.pagination.page < data.pagination.pages);
        setPage(pageNum);
      } else {
        toast.error(data.error || 'Error al cargar notificaciones');
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Error al cargar notificaciones');
    } finally {
      setLoading(false);
    }
  }, [session?.user, loading]);

  const fetchUnreadCount = useCallback(async () => {
    if (!session?.user) return;

    try {
      const response = await fetch('/api/notifications?unreadOnly=true&limit=1');
      const data = await response.json();

      if (response.ok) {
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  }, [session?.user]);

  useEffect(() => {
    if (session?.user) {
      fetchNotifications(1, true);

      // Poll for new notifications every 30 seconds
      intervalRef.current = setInterval(() => {
        fetchUnreadCount();
      }, 30000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [session, fetchNotifications, fetchUnreadCount]);

  const markAsRead = async (notificationIds?: string[]) => {
    if (!session?.user) return;

    try {
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          notificationIds,
          markAll: !notificationIds
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Update local state
        setNotifications(prev => prev.map(notification => {
          if (!notificationIds || notificationIds.includes(notification.id)) {
            return { ...notification, isRead: true };
          }
          return notification;
        }));
        setUnreadCount(data.unreadCount);
        toast.success(data.message);
      } else {
        toast.error(data.error || 'Error al marcar como leído');
      }
    } catch (error) {
      console.error('Error marking as read:', error);
      toast.error('Error al marcar como leído');
    }
  };

  const deleteNotifications = async (notificationIds: string[]) => {
    if (!session?.user) return;

    try {
      const response = await fetch('/api/notifications', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ notificationIds })
      });

      const data = await response.json();

      if (response.ok) {
        // Update local state
        setNotifications(prev => prev.filter(n => !notificationIds.includes(n.id)));
        // Update unread count if deleted notifications were unread
        const deletedUnreadCount = notifications.filter(n => 
          notificationIds.includes(n.id) && !n.isRead
        ).length;
        setUnreadCount(prev => prev - deletedUnreadCount);
        toast.success(data.message);
      } else {
        toast.error(data.error || 'Error al eliminar notificaciones');
      }
    } catch (error) {
      console.error('Error deleting notifications:', error);
      toast.error('Error al eliminar notificaciones');
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read if unread
    if (!notification.isRead) {
      markAsRead([notification.id]);
    }

    // Navigate to action URL if available
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      fetchNotifications(page + 1, false);
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'LIKE':
        return <Heart className="w-4 h-4 text-red-500" />;
      case 'COMMENT':
        return <MessageCircle className="w-4 h-4 text-blue-500" />;
      case 'FOLLOW':
        return <UserPlus className="w-4 h-4 text-green-500" />;
      case 'MENTION':
        return <AtSign className="w-4 h-4 text-purple-500" />;
      case 'MESSAGE':
        return <Mail className="w-4 h-4 text-blue-600" />;
      case 'ACHIEVEMENT':
        return <Award className="w-4 h-4 text-yellow-500" />;
      case 'SYSTEM':
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Ahora';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
    return date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
  };

  if (!session?.user) {
    return null;
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`relative ${className}`}
          onClick={() => {
            setIsOpen(true);
            if (notifications.length === 0) {
              fetchNotifications(1, true);
            }
          }}
        >
          {unreadCount > 0 ? (
            <BellRing className="w-5 h-5" />
          ) : (
            <Bell className="w-5 h-5" />
          )}
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Notificaciones</h3>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => markAsRead()}
                className="text-xs"
              >
                <CheckCheck className="w-4 h-4 mr-1" />
                Marcar todas
              </Button>
            )}
            <Button size="sm" variant="ghost" className="w-8 h-8 p-0">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <ScrollArea className="h-96">
          {loading && notifications.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8 px-4">
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-sm">No tienes notificaciones</p>
            </div>
          ) : (
            <div className="space-y-1">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex items-start gap-3 p-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                    !notification.isRead ? 'bg-blue-50 border-l-2 border-l-blue-500' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex-shrink-0 mt-1">
                    {notification.sender ? (
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={notification.sender.image} alt={notification.sender.name} />
                        <AvatarFallback className="text-xs">
                          {notification.sender.name?.charAt(0)?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                        {getNotificationIcon(notification.type)}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 mb-1">
                          {notification.title}
                        </p>
                        <p className="text-xs text-gray-600 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatTimeAgo(notification.createdAt)}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-1 ml-2">
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="w-6 h-6 p-0 opacity-0 group-hover:opacity-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotifications([notification.id]);
                          }}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {hasMore && (
                <div className="p-3 text-center">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={loadMore}
                    disabled={loading}
                    className="text-xs"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : null}
                    Cargar más
                  </Button>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}