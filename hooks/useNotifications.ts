'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

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

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  fetchNotifications: (page?: number, reset?: boolean) => Promise<void>;
  markAsRead: (notificationIds?: string[]) => Promise<void>;
  deleteNotifications: (notificationIds: string[]) => Promise<void>;
  createNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => Promise<void>;
  hasMore: boolean;
  page: number;
  isConnected: boolean;
}

export function useNotifications(): UseNotificationsReturn {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [isConnected, setIsConnected] = useState(false);
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  // WebSocket connection
  const connectWebSocket = useCallback(() => {
    if (!session?.user || wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      // In a real implementation, you would use your WebSocket server URL
      // For now, we'll simulate the connection
      const wsUrl = process.env.NODE_ENV === 'production' 
        ? `wss://${window.location.host}/api/ws/notifications`
        : `ws://localhost:3000/api/ws/notifications`;
      
      // Note: This is a placeholder - you'll need to implement WebSocket server
      // wsRef.current = new WebSocket(wsUrl);
      
      // Simulate connection for now
      setIsConnected(true);
      reconnectAttempts.current = 0;
      
      // In real implementation:
      /*
      wsRef.current.onopen = () => {
        setIsConnected(true);
        reconnectAttempts.current = 0;
        console.log('WebSocket connected');
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleWebSocketMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      wsRef.current.onclose = () => {
        setIsConnected(false);
        console.log('WebSocket disconnected');
        
        // Attempt to reconnect
        if (reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++;
          const delay = Math.pow(2, reconnectAttempts.current) * 1000; // Exponential backoff
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connectWebSocket();
          }, delay);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('Error de conexión en tiempo real');
      };
      */
    } catch (error) {
      console.error('Error connecting WebSocket:', error);
      setError('Error al conectar notificaciones en tiempo real');
    }
  }, [session]);

  // Handle WebSocket messages
  const handleWebSocketMessage = useCallback((data: any) => {
    switch (data.type) {
      case 'NEW_NOTIFICATION':
        const newNotification = data.notification as Notification;
        setNotifications(prev => [newNotification, ...prev]);
        setUnreadCount(prev => prev + 1);
        
        // Show toast notification
        toast(newNotification.title, {
          description: newNotification.message,
          action: newNotification.actionUrl ? {
            label: 'Ver',
            onClick: () => window.location.href = newNotification.actionUrl!
          } : undefined
        });
        break;
        
      case 'NOTIFICATION_READ':
        const readIds = data.notificationIds as string[];
        setNotifications(prev => prev.map(notification => 
          readIds.includes(notification.id) 
            ? { ...notification, isRead: true }
            : notification
        ));
        setUnreadCount(data.unreadCount);
        break;
        
      case 'NOTIFICATION_DELETED':
        const deletedIds = data.notificationIds as string[];
        setNotifications(prev => prev.filter(n => !deletedIds.includes(n.id)));
        setUnreadCount(data.unreadCount);
        break;
        
      default:
        console.log('Unknown WebSocket message type:', data.type);
    }
  }, []);

  // Fetch notifications from API
  const fetchNotifications = useCallback(async (pageNum: number = 1, reset: boolean = false) => {
    if (!session?.user || loading) return;

    setLoading(true);
    setError(null);
    
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
        setError(data.error || 'Error al cargar notificaciones');
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError('Error al cargar notificaciones');
    } finally {
      setLoading(false);
    }
  }, [session, loading]);

  // Mark notifications as read
  const markAsRead = useCallback(async (notificationIds?: string[]) => {
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
      } else {
        setError(data.error || 'Error al marcar como leído');
      }
    } catch (error) {
      console.error('Error marking as read:', error);
      setError('Error al marcar como leído');
    }
  }, [session]);

  // Delete notifications
  const deleteNotifications = useCallback(async (notificationIds: string[]) => {
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
      } else {
        setError(data.error || 'Error al eliminar notificaciones');
      }
    } catch (error) {
      console.error('Error deleting notifications:', error);
      setError('Error al eliminar notificaciones');
    }
  }, [session, notifications]);

  // Create new notification
  const createNotification = useCallback(async (notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => {
    if (!session?.user) return;

    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(notification)
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Error al crear notificación');
      }
    } catch (error) {
      console.error('Error creating notification:', error);
      setError('Error al crear notificación');
    }
  }, [session]);

  // Initialize WebSocket connection and fetch initial data
  useEffect(() => {
    if (session?.user) {
      connectWebSocket();
      fetchNotifications(1, true);
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [session, connectWebSocket, fetchNotifications]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    deleteNotifications,
    createNotification,
    hasMore,
    page,
    isConnected
  };
}