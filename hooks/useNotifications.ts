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
  isConnected: boolean;
}

export function useNotifications(): UseNotificationsReturn {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [isConnected, setIsConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  // Track loading state separately to avoid refetch loops
  const isLoadingRef = useRef(false);

  // Cargar notificaciones desde la API
  const loadNotifications = useCallback(async (pageNum = 1, reset = false) => {
    if (!session?.user?.id || isLoadingRef.current) return;

    isLoadingRef.current = true;
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
      isLoadingRef.current = false;
      setIsLoading(false);
    }
  }, [session?.user?.id]);

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

  // Configurar SSE para notificaciones en tiempo real
  const setupSSE = useCallback(() => {
    if (!session?.user?.id || eventSourceRef.current) {
      return;
    }

    try {
      const eventSource = new EventSource(`/api/notifications/stream?userId=${session.user.id}`);
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        console.log('SSE conectado para notificaciones');
        reconnectAttempts.current = 0;
        setIsConnected(true);
      };

      eventSource.onmessage = (event) => {
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
          console.error('Error parsing SSE message:', err);
        }
      };

      eventSource.onerror = (event) => {
        console.error('Error en SSE:', event);
        eventSource.close();
        eventSourceRef.current = null;
        setIsConnected(false);
        
        // Intentar reconectar si no fue un cierre intencional
        if (reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.pow(2, reconnectAttempts.current) * 1000; // Backoff exponencial
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++;
            setupSSE();
          }, delay);
        }
      };
    } catch (err) {
      console.error('Error setting up SSE:', err);
    }
  }, [session?.user?.id]);

  // Limpiar SSE
  const cleanupSSE = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setIsConnected(false);
  }, []);

  // Efectos
  // Ejecutar solo cuando cambia el usuario de la sesión para no reabrir la SSE
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (session?.user?.id) {
      loadNotifications(1, true);
      setupSSE();
    }

    return cleanupSSE;
  }, [session?.user?.id]);

  // Limpiar al desmontar
  useEffect(() => {
    return cleanupSSE;
  }, [cleanupSSE]);

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
    page,
    isConnected
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