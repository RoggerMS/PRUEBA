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
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = () => {
    if (!session?.user?.id || wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/api/ws?userId=${session.user.id}`;
      
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        reconnectAttempts.current = 0;
        
        // Request initial notifications
        wsRef.current?.send(JSON.stringify({
          type: 'get_notifications',
          limit: 20,
          offset: 0
        }));
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          
          switch (message.type) {
            case 'notification':
              if (message.notification) {
                handleNewNotification(message.notification);
              }
              break;
            case 'notifications':
              if (message.notifications) {
                setNotifications(message.notifications);
                updateUnreadCount(message.notifications);
              }
              break;
            case 'error':
              console.error('WebSocket error:', message.message);
              break;
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      wsRef.current.onclose = () => {
        console.log('WebSocket disconnected');
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

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
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
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    setIsConnected(false);
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
      // Send WebSocket message
      wsRef.current?.send(JSON.stringify({
        type: 'mark_read',
        notificationId
      }));

      // Update local state
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));

      // Also call API as backup
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT'
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
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
    wsRef.current?.send(JSON.stringify({
      type: 'get_notifications',
      limit: 20,
      offset: 0
    }));
  };

  // Send periodic ping to keep connection alive
  useEffect(() => {
    if (!isConnected) return;

    const pingInterval = setInterval(() => {
      wsRef.current?.send(JSON.stringify({ type: 'ping' }));
    }, 30000); // Ping every 30 seconds

    return () => clearInterval(pingInterval);
  }, [isConnected]);

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