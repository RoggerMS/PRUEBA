'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  createdAt: string;
  readAt: string | null;
  metadata?: Record<string, any>;
  actionUrl?: string;
}

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  loadNotifications: (page?: number, reset?: boolean) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  clearAll: () => Promise<void>;
  hasMore: boolean;
  page: number;
}

export function useNotifications(): UseNotificationsReturn {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  // Cargar notificaciones desde la API
  const loadNotifications = useCallback(async (pageNum = 1, reset = false) => {
    if (!session?.user?.id || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/notifications?page=${pageNum}&limit=20`);
      
      if (!response.ok) {
        throw new Error('Error al cargar notificaciones');
      }

      const data = await response.json();
      
      if (reset) {
        setNotifications(data.notifications);
      } else {
        setNotifications(prev => {
          const existingIds = new Set(prev.map(n => n.id));
          const newNotifications = data.notifications.filter((n: Notification) => !existingIds.has(n.id));
          return [...prev, ...newNotifications];
        });
      }
      
      setUnreadCount(data.unreadCount);
      setHasMore(data.pagination.page < data.pagination.pages);
      setPage(pageNum);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error('Error loading notifications:', err);
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id, isLoading]);

  // Marcar notificación como leída
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationIds: [notificationId] })
      });

      if (!response.ok) {
        throw new Error('Error al marcar como leída');
      }

      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId 
            ? { ...n, readAt: new Date().toISOString() }
            : n
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
      toast.error('Error al marcar la notificación como leída');
    }
  }, []);

  // Marcar todas como leídas
  const markAllAsRead = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllAsRead: true })
      });

      if (!response.ok) {
        throw new Error('Error al marcar todas como leídas');
      }

      setNotifications(prev => 
        prev.map(n => ({ ...n, readAt: new Date().toISOString() }))
      );
      setUnreadCount(0);
      toast.success('Todas las notificaciones marcadas como leídas');
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      toast.error('Error al marcar todas las notificaciones como leídas');
    }
  }, []);

  // Eliminar notificación
  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications?ids=${notificationId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Error al eliminar notificación');
      }

      const notification = notifications.find(n => n.id === notificationId);
      
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      if (notification && !notification.readAt) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      toast.success('Notificación eliminada');
    } catch (err) {
      console.error('Error deleting notification:', err);
      toast.error('Error al eliminar la notificación');
    }
  }, [notifications]);

  // Limpiar todas las notificaciones
  const clearAll = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications?all=true', {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Error al limpiar notificaciones');
      }

      setNotifications([]);
      setUnreadCount(0);
      toast.success('Todas las notificaciones eliminadas');
    } catch (err) {
      console.error('Error clearing all notifications:', err);
      toast.error('Error al limpiar las notificaciones');
    }
  }, []);

  // Configurar WebSocket para notificaciones en tiempo real
  const setupWebSocket = useCallback(() => {
    if (!session?.user?.id || wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      // En un entorno real, esto sería wss://tu-dominio.com/ws
      const wsUrl = `ws://localhost:3001/ws?userId=${session.user.id}`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket conectado para notificaciones');
        reconnectAttempts.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'notification') {
            const newNotification = data.notification as Notification;
            
            // Agregar nueva notificación al estado
            setNotifications(prev => [newNotification, ...prev]);
            setUnreadCount(prev => prev + 1);
            
            // Mostrar toast de notificación
            toast(newNotification.title, {
              description: newNotification.message,
              action: newNotification.actionUrl ? {
                label: 'Ver',
                onClick: () => window.location.href = newNotification.actionUrl!
              } : undefined
            });
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };

      ws.onclose = (event) => {
        console.log('WebSocket desconectado:', event.code, event.reason);
        wsRef.current = null;
        
        // Intentar reconectar si no fue un cierre intencional
        if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.pow(2, reconnectAttempts.current) * 1000; // Backoff exponencial
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++;
            setupWebSocket();
          }, delay);
        }
      };

      ws.onerror = (error) => {
        console.error('Error en WebSocket:', error);
      };
    } catch (err) {
      console.error('Error setting up WebSocket:', err);
    }
  }, [session?.user?.id]);

  // Limpiar WebSocket
  const cleanupWebSocket = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.close(1000, 'Component unmounting');
      wsRef.current = null;
    }
  }, []);

  // Efectos
  useEffect(() => {
    if (session?.user?.id) {
      loadNotifications(1, true);
      setupWebSocket();
    }

    return cleanupWebSocket;
  }, [session?.user?.id, loadNotifications, setupWebSocket, cleanupWebSocket]);

  // Limpiar al desmontar
  useEffect(() => {
    return cleanupWebSocket;
  }, [cleanupWebSocket]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    hasMore,
    page
  };
}

// Hook para obtener solo el contador de notificaciones no leídas
export function useUnreadNotificationCount() {
  const { data: session } = useSession();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const fetchUnreadCount = useCallback(async () => {
    if (!session?.user?.id || isLoading) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/notifications?limit=1&unreadOnly=true');
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id, isLoading]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchUnreadCount();
      
      // Actualizar cada 30 segundos
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [session?.user?.id, fetchUnreadCount]);

  return { unreadCount, isLoading, refresh: fetchUnreadCount };
}