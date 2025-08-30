import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data: any;
  read: boolean;
  createdAt: string;
}

interface WebSocketMessage {
  type: 'notification' | 'notifications' | 'error';
  notification?: Notification;
  notifications?: Notification[];
  message?: string;
}

export function useWebSocketNotifications() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = () => {
    if (!session?.user?.id || eventSourceRef.current?.readyState === EventSource.OPEN) {
      return;
    }

    try {
      const sseUrl = `/api/notifications/stream?userId=${session.user.id}`;
      
      eventSourceRef.current = new EventSource(sseUrl);

      eventSourceRef.current.onopen = () => {
        console.log('SSE connected');
        setIsConnected(true);
        reconnectAttempts.current = 0;
        
        // Load initial notifications via API
        loadInitialNotifications();
      };

      eventSourceRef.current.onmessage = (event) => {
        try {
          if (event.type === 'notification') {
            const notification: Notification = JSON.parse(event.data);
            handleNewNotification(notification);
          }
        } catch (error) {
          console.error('Error parsing SSE message:', error);
        }
      };

      eventSourceRef.current.onclose = () => {
        console.log('SSE disconnected');
        setIsConnected(false);
        
        // Attempt to reconnect
        if (reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.pow(2, reconnectAttempts.current) * 1000; // Exponential backoff
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++;
            connect();
          }, delay);
        }
      };

      eventSourceRef.current.onerror = (event) => {
        console.error('SSE error:', event);
        setIsConnected(false);
      };
    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
    }
  };

  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    
    setIsConnected(false);
  };

  const loadInitialNotifications = async () => {
    try {
      const response = await fetch('/api/notifications?limit=20&offset=0');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        updateUnreadCount(data.notifications || []);
      }
    } catch (error) {
      console.error('Error loading initial notifications:', error);
    }
  };

  const handleNewNotification = (notification: Notification) => {
    // Add to notifications list
    setNotifications(prev => [notification, ...prev]);
    
    // Update unread count
    if (!notification.read) {
      setUnreadCount(prev => prev + 1);
    }
    
    // Show toast notification
    showNotificationToast(notification);
  };

  const showNotificationToast = (notification: Notification) => {
    const getIcon = (type: string) => {
      switch (type.toLowerCase()) {
        case 'badge_earned':
          return '🏆';
        case 'achievement_unlocked':
          return '🎯';
        case 'level_up':
          return '⬆️';
        case 'streak_milestone':
          return '🔥';
        case 'xp_gained':
          return '✨';
        default:
          return '🔔';
      }
    };

    const getToastStyle = (type: string) => {
      switch (type.toLowerCase()) {
        case 'badge_earned':
          return { style: { background: 'linear-gradient(135deg, #ffd700, #ffed4e)' } };
        case 'achievement_unlocked':
          return { style: { background: 'linear-gradient(135deg, #10b981, #34d399)' } };
        case 'level_up':
          return { style: { background: 'linear-gradient(135deg, #8b5cf6, #a78bfa)' } };
        case 'streak_milestone':
          return { style: { background: 'linear-gradient(135deg, #f59e0b, #fbbf24)' } };
        default:
          return {};
      }
    };

    toast(`${getIcon(notification.type)} ${notification.title}`, {
      description: notification.message,
      duration: 5000,
      ...getToastStyle(notification.type)
    });
  };

  const updateUnreadCount = (notificationsList: Notification[]) => {
    const unread = notificationsList.filter(n => !n.read).length;
    setUnreadCount(unread);
  };

  const markAsRead = async (notificationId: string) => {
    try {
      // Update local state immediately for better UX
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));

      // Call API to persist the change
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT'
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      // Revert local state on error
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, read: false } : n
        )
      );
      setUnreadCount(prev => prev + 1);
    }
  };

  const markAllAsRead = async () => {
    try {
      // Call API to mark all as read
      await fetch('/api/notifications/read-all', {
        method: 'PUT'
      });

      // Update local state
      setNotifications(prev => 
        prev.map(n => ({ ...n, read: true }))
      );
      
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const refreshNotifications = () => {
    loadInitialNotifications();
  };

  // SSE connections don't need periodic pings
  // The browser handles connection keep-alive automatically

  // Connect when session is available
  useEffect(() => {
    if (session?.user?.id) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [session?.user?.id]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  return {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
    refreshNotifications,
    connect,
    disconnect
  };
}