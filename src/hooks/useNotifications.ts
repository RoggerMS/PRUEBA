'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { debugFetch } from '@/lib/debugFetch';

export interface Notification {
  id: string;
  type: 'SOCIAL' | 'ACADEMIC' | 'GAMIFICATION' | 'MARKETPLACE' | 'SYSTEM';
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  createdAt: Date;
}

export interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  isConnected: boolean;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

export function useNotifications(): UseNotificationsReturn {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  // Ref to persist EventSource instance without triggering re-renders
  const eventSourceRef = useRef<EventSource | null>(null);

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    if (!session?.user?.id) return;

    try {
      const response = await debugFetch('/api/notifications');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }, [session?.user?.id]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    if (!session?.user?.id) return;

    try {
      const response = await debugFetch(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH'
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === notificationId 
              ? { ...notification, read: true }
              : notification
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, [session?.user?.id]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!session?.user?.id) return;

    try {
      const response = await debugFetch('/api/notifications/read-all', {
        method: 'PATCH'
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notification => ({ ...notification, read: true }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, [session?.user?.id]);

  // Setup Server-Sent Events for real-time notifications
  const connect = useCallback(() => {
    if (!session?.user?.id) {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
        setIsConnected(false);
      }
      return;
    }

    // Avoid creating a new connection if one is already active
    if (eventSourceRef.current && eventSourceRef.current.readyState !== EventSource.CLOSED) {
      return;
    }

    // Incluir credenciales para que la sesión se mantenga en conexiones SSE
    const es = new EventSource(
      `/api/notifications/stream?userId=${session.user.id}`,
      { withCredentials: true }
    );
    eventSourceRef.current = es;

    es.onopen = () => {
      setIsConnected(true);
      console.log('Notifications stream connected');
    };

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'notification') {
          const newNotification = data.data;

          // Add to notifications list
          setNotifications(prev => [newNotification, ...prev.slice(0, 49)]); // Keep only 50 notifications
          setUnreadCount(prev => prev + 1);

          // Show toast notification
          toast(newNotification.title, {
            description: newNotification.message,
            action: {
              label: 'Ver',
              onClick: () => {
                // Handle notification click
                markAsRead(newNotification.id);
              }
            }
          });
        } else if (data.type === 'feed_update') {
          // Handle feed updates
          toast.info('Nueva actividad en tu feed', {
            description: 'Hay nuevas publicaciones disponibles'
          });
        } else if (data.type === 'system_announcement') {
          // Handle system announcements
          toast.warning(data.data.title, {
            description: data.data.message,
            duration: 10000 // Show for 10 seconds
          });
        }
      } catch (error) {
        console.error('Error parsing notification data:', error);
      }
    };

    es.onerror = (event) => {
      const readyState = es.readyState;
      console.error('Notifications stream error:', { event, readyState });
      setIsConnected(false);
      eventSourceRef.current?.close();
      eventSourceRef.current = null;

      // Attempt to reconnect only when the connection is fully closed
      if (readyState === EventSource.CLOSED) {
        setTimeout(() => {
          connect();
        }, 5000);
      }
    };
  }, [session?.user?.id, markAsRead]);

  useEffect(() => {
    connect();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      setIsConnected(false);
    };
  }, [connect]);

  // Initial fetch of notifications
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Refresh notifications
  const refreshNotifications = useCallback(async () => {
    await fetchNotifications();
  }, [fetchNotifications]);

  return {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
    refreshNotifications
  };
}

// Hook for managing notification preferences
export function useNotificationPreferences() {
  const { data: session } = useSession();
  const [preferences, setPreferences] = useState({
    email: true,
    push: true,
    social: true,
    academic: true,
    gamification: true,
    marketplace: true,
    system: true
  });

  // Fetch preferences
  const fetchPreferences = useCallback(async () => {
    if (!session?.user?.id) return;

    try {
      const response = await debugFetch('/api/notifications/preferences');
      if (response.ok) {
        const data = await response.json();
        setPreferences(data);
      }
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
    }
  }, [session?.user?.id]);

  // Update preferences
  const updatePreferences = useCallback(async (newPreferences: Partial<typeof preferences>) => {
    if (!session?.user?.id) return;

    try {
      const response = await debugFetch('/api/notifications/preferences', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newPreferences)
      });

      if (response.ok) {
        setPreferences(prev => ({ ...prev, ...newPreferences }));
        toast.success('Preferencias actualizadas');
      }
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      toast.error('Error al actualizar preferencias');
    }
  }, [session?.user?.id]);

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  return {
    preferences,
    updatePreferences
  };
}