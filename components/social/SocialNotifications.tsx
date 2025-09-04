'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import {
  Bell,
  BellRing,
  Heart,
  MessageCircle,
  UserPlus,
  Share2,
  Trophy,
  Star,
  BookOpen,
  Users,
  CheckCircle,
  X,
  MoreHorizontal,
  Filter,
  Settings,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react';

interface SocialNotification {
  id: string;
  type: 'follow' | 'like' | 'comment' | 'share' | 'mention' | 'achievement' | 'message' | 'post';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  isImportant?: boolean;
  user?: {
    id: string;
    name: string;
    username: string;
    avatar?: string;
  };
  post?: {
    id: string;
    title: string;
    excerpt?: string;
  };
  achievement?: {
    id: string;
    name: string;
    icon: string;
    level?: string;
  };
  actionUrl?: string;
}

interface SocialNotificationsProps {
  notifications?: SocialNotification[];
  unreadCount?: number;
  onMarkAsRead?: (notificationId: string) => Promise<void>;
  onMarkAllAsRead?: () => Promise<void>;
  onDeleteNotification?: (notificationId: string) => Promise<void>;
  onNavigate?: (url: string) => void;
  onUpdateSettings?: (settings: NotificationSettings) => Promise<void>;
}

interface NotificationSettings {
  follows: boolean;
  likes: boolean;
  comments: boolean;
  shares: boolean;
  mentions: boolean;
  achievements: boolean;
  messages: boolean;
  posts: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
}

const defaultSettings: NotificationSettings = {
  follows: true,
  likes: true,
  comments: true,
  shares: true,
  mentions: true,
  achievements: true,
  messages: true,
  posts: true,
  emailNotifications: false,
  pushNotifications: true
};

export function SocialNotifications({
  notifications = [],
  unreadCount = 0,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification,
  onNavigate,
  onUpdateSettings
}: SocialNotificationsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'settings'>('all');
  const [settings, setSettings] = useState<NotificationSettings>(defaultSettings);
  const [loading, setLoading] = useState<Set<string>>(new Set());

  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 'unread') {
      return !notification.isRead;
    }
    return true;
  });

  const getNotificationIcon = (type: SocialNotification['type']) => {
    switch (type) {
      case 'follow':
        return <UserPlus className="w-4 h-4 text-blue-500" />;
      case 'like':
        return <Heart className="w-4 h-4 text-red-500" />;
      case 'comment':
        return <MessageCircle className="w-4 h-4 text-green-500" />;
      case 'share':
        return <Share2 className="w-4 h-4 text-purple-500" />;
      case 'achievement':
        return <Trophy className="w-4 h-4 text-yellow-500" />;
      case 'message':
        return <MessageCircle className="w-4 h-4 text-blue-500" />;
      case 'post':
        return <BookOpen className="w-4 h-4 text-indigo-500" />;
      case 'mention':
        return <Star className="w-4 h-4 text-orange-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatTimeAgo = (timestamp: string): string => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Hace un momento';
    if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)} h`;
    if (diffInSeconds < 604800) return `Hace ${Math.floor(diffInSeconds / 86400)} d`;
    
    return time.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short'
    });
  };

  const handleMarkAsRead = async (notificationId: string) => {
    setLoading(prev => new Set(prev).add(notificationId));
    try {
      await onMarkAsRead?.(notificationId);
    } catch (error) {
      toast.error('Error al marcar como leída');
    } finally {
      setLoading(prev => {
        const newSet = new Set(prev);
        newSet.delete(notificationId);
        return newSet;
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await onMarkAllAsRead?.();
      toast.success('Todas las notificaciones marcadas como leídas');
    } catch (error) {
      toast.error('Error al marcar todas como leídas');
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    setLoading(prev => new Set(prev).add(notificationId));
    try {
      await onDeleteNotification?.(notificationId);
      toast.success('Notificación eliminada');
    } catch (error) {
      toast.error('Error al eliminar notificación');
    } finally {
      setLoading(prev => {
        const newSet = new Set(prev);
        newSet.delete(notificationId);
        return newSet;
      });
    }
  };

  const handleSettingsUpdate = async (newSettings: NotificationSettings) => {
    try {
      await onUpdateSettings?.(newSettings);
      setSettings(newSettings);
      toast.success('Configuración actualizada');
    } catch (error) {
      toast.error('Error al actualizar configuración');
    }
  };

  const NotificationItem = ({ notification }: { notification: SocialNotification }) => {
    const isLoading = loading.has(notification.id);
    
    return (
      <div 
        className={`flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
          !notification.isRead ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
        }`}
        onClick={() => {
          if (!notification.isRead) {
            handleMarkAsRead(notification.id);
          }
          if (notification.actionUrl) {
            onNavigate?.(notification.actionUrl);
          }
        }}
      >
        <div className="flex-shrink-0 mt-1">
          {notification.user ? (
            <div className="relative">
              <Avatar className="w-10 h-10">
                <AvatarImage src={notification.user.avatar} alt={notification.user.name} />
                <AvatarFallback className="text-xs">
                  {notification.user.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1">
                {getNotificationIcon(notification.type)}
              </div>
            </div>
          ) : (
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
              {getNotificationIcon(notification.type)}
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className={`text-sm font-medium text-gray-900 ${
                !notification.isRead ? 'font-semibold' : ''
              }`}>
                {notification.title}
              </h4>
              <p className="text-sm text-gray-600 mt-1">
                {notification.message}
              </p>
              
              {notification.post && (
                <div className="mt-2 p-2 bg-gray-50 rounded-md">
                  <p className="text-xs font-medium text-gray-700">
                    {notification.post.title}
                  </p>
                  {notification.post.excerpt && (
                    <p className="text-xs text-gray-500 mt-1">
                      {notification.post.excerpt}
                    </p>
                  )}
                </div>
              )}
              
              {notification.achievement && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Trophy className="w-3 h-3 text-yellow-600" />
                  </div>
                  <span className="text-xs font-medium text-yellow-700">
                    {notification.achievement.name}
                  </span>
                  {notification.achievement.level && (
                    <Badge variant="outline" className="text-xs">
                      {notification.achievement.level}
                    </Badge>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-1 ml-2">
              <span className="text-xs text-gray-500">
                {formatTimeAgo(notification.timestamp)}
              </span>
              
              {notification.isImportant && (
                <Star className="w-3 h-3 text-yellow-500" />
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteNotification(notification.id);
                }}
                disabled={isLoading}
                className="w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                {isLoading ? (
                  <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <X className="w-3 h-3" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const SettingsPanel = () => (
    <div className="space-y-6 p-4">
      <div>
        <h3 className="text-lg font-semibold mb-4">Tipos de notificaciones</h3>
        <div className="space-y-3">
          {Object.entries(settings).slice(0, 8).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getNotificationIcon(key as SocialNotification['type'])}
                <span className="text-sm font-medium capitalize">
                  {key === 'follows' ? 'Nuevos seguidores' :
                   key === 'likes' ? 'Me gusta' :
                   key === 'comments' ? 'Comentarios' :
                   key === 'shares' ? 'Compartidos' :
                   key === 'mentions' ? 'Menciones' :
                   key === 'achievements' ? 'Logros' :
                   key === 'messages' ? 'Mensajes' :
                   key === 'posts' ? 'Nuevos posts' : key}
                </span>
              </div>
              <Button
                variant={value ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  const newSettings = { ...settings, [key]: !value };
                  handleSettingsUpdate(newSettings);
                }}
              >
                {value ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </Button>
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Métodos de entrega</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Notificaciones por email</span>
            <Button
              variant={settings.emailNotifications ? "default" : "outline"}
              size="sm"
              onClick={() => {
                const newSettings = { ...settings, emailNotifications: !settings.emailNotifications };
                handleSettingsUpdate(newSettings);
              }}
            >
              {settings.emailNotifications ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Notificaciones push</span>
            <Button
              variant={settings.pushNotifications ? "default" : "outline"}
              size="sm"
              onClick={() => {
                const newSettings = { ...settings, pushNotifications: !settings.pushNotifications };
                handleSettingsUpdate(newSettings);
              }}
            >
              {settings.pushNotifications ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          {unreadCount > 0 ? (
            <BellRing className="w-5 h-5" />
          ) : (
            <Bell className="w-5 h-5" />
          )}
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center text-xs p-0"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Notificaciones</DialogTitle>
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllAsRead}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Marcar todas como leídas
              </Button>
            )}
          </div>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Todas ({notifications.length})
            </TabsTrigger>
            <TabsTrigger value="unread" className="flex items-center gap-2">
              <BellRing className="w-4 h-4" />
              No leídas ({unreadCount})
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Configuración
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="flex-1 overflow-hidden mt-0">
            <ScrollArea className="h-full">
              {filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                  <Bell className="w-12 h-12 mb-4" />
                  <p>No tienes notificaciones</p>
                </div>
              ) : (
                <div className="divide-y group">
                  {filteredNotifications.map((notification) => (
                    <NotificationItem key={notification.id} notification={notification} />
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="unread" className="flex-1 overflow-hidden mt-0">
            <ScrollArea className="h-full">
              {filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                  <CheckCircle className="w-12 h-12 mb-4" />
                  <p>No tienes notificaciones sin leer</p>
                </div>
              ) : (
                <div className="divide-y group">
                  {filteredNotifications.map((notification) => (
                    <NotificationItem key={notification.id} notification={notification} />
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="settings" className="flex-1 overflow-hidden mt-0">
            <ScrollArea className="h-full">
              <SettingsPanel />
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

export default SocialNotifications;