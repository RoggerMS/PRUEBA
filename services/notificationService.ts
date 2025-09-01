import type { Notification } from '../hooks/useNotifications';

// Re-exportar el tipo para uso externo
export type { Notification };

export interface NotificationListener {
  (notification: Notification): void;
}

class NotificationService {
  private eventSource: EventSource | null = null;
  private listeners: NotificationListener[] = [];
  private notifications: Notification[] = [];
  private isConnected = false;

  constructor() {
    // No inicializar automáticamente, esperar a que el usuario se conecte
  }

  private async initializeSSE(userId: string) {
    try {
      // Conectar a Server-Sent Events
      this.eventSource = new EventSource(`/api/notifications/stream?userId=${userId}`);

      this.eventSource.onopen = () => {
        console.log('Connected to notification stream');
        this.isConnected = true;
      };

      this.eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'notification') {
            this.handleNewNotification(data.data);
          } else if (data.type === 'connected') {
            console.log('SSE connection established');
          }
        } catch (error) {
          console.error('Error parsing SSE message:', error);
        }
      };

      this.eventSource.onerror = (error) => {
        console.error('SSE connection error:', error);
        this.isConnected = false;
        
        // Intentar reconectar después de 5 segundos
        setTimeout(() => {
          if (this.eventSource?.readyState === EventSource.CLOSED) {
            this.initializeSSE(userId);
          }
        }, 5000);
      };

    } catch (error) {
      console.warn('SSE not available:', error);
      this.isConnected = false;
    }
  }

  async connect(userId: string) {
    if (!this.isConnected) {
      await this.initializeSSE(userId);
      // Cargar notificaciones existentes
      await this.loadNotifications();
    }
  }

  disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
      this.isConnected = false;
    }
  }

  // Cargar notificaciones desde la API
  private async loadNotifications() {
    try {
      const response = await fetch('/api/notifications');
      if (response.ok) {
        const data = await response.json();
        this.notifications = data.notifications.map((n: any) => ({
          ...n,
          createdAt: new Date(n.createdAt)
        }));
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  }

  private handleNewNotification(notification: Notification) {
    // Agregar la notificación a la lista
    this.notifications.unshift(notification);
    
    // Mantener solo las últimas 100 notificaciones
    if (this.notifications.length > 100) {
      this.notifications = this.notifications.slice(0, 100);
    }

    // Notificar a todos los listeners
    this.listeners.forEach(listener => {
      try {
        listener(notification);
      } catch (error) {
        console.error('Error in notification listener:', error);
      }
    });

    // Mostrar notificación del navegador si está permitido
    this.showBrowserNotification(notification);
  }

  private showBrowserNotification(notification: Notification) {
    if ('Notification' in window && Notification.permission === 'granted') {
      const browserNotification = new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notification.id
      });

      // Auto-cerrar después de 5 segundos
      setTimeout(() => {
        browserNotification.close();
      }, 5000);
    }
  }

  // Método para simular notificaciones cuando WebSocket no está disponible
  simulateNotification(notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) {
    const fullNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
      read: false
    };

    this.handleNewNotification(fullNotification);
  }

  // Suscribirse a notificaciones
  subscribe(listener: NotificationListener): () => void {
    this.listeners.push(listener);
    
    // Retornar función para desuscribirse
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Obtener todas las notificaciones
  getNotifications(): Notification[] {
    return [...this.notifications];
  }

  // Obtener notificaciones no leídas
  getUnreadNotifications(): Notification[] {
    return this.notifications.filter(n => !n.read);
  }

  // Marcar notificación como leída
  async markAsRead(notificationId: string) {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH'
      });
      
      if (response.ok) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification) {
          notification.read = true;
        }
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  // Marcar todas como leídas
  async markAllAsRead() {
    try {
      const response = await fetch('/api/notifications/read-all', {
        method: 'PATCH'
      });
      
      if (response.ok) {
        this.notifications.forEach(n => n.read = true);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }

  // Eliminar notificación
  removeNotification(notificationId: string) {
    const index = this.notifications.findIndex(n => n.id === notificationId);
    if (index > -1) {
      this.notifications.splice(index, 1);
    }
  }

  // Limpiar todas las notificaciones
  clearAll() {
    this.notifications = [];
  }

  // Solicitar permisos para notificaciones del navegador
  async requestNotificationPermission(): Promise<NotificationPermission> {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission;
    }
    return 'denied';
  }

  // Obtener estado de conexión
  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  // Crear notificación en el servidor
  async createNotification(type: Notification['type'], title: string, message: string, data?: any) {
    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type,
          title,
          message,
          data
        })
      });
      
      if (response.ok) {
        const notification = await response.json();
        return notification;
      }
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  }

  // Enviar notificación de XP ganado
  async notifyXPGained(xp: number, reason: string) {
    await this.createNotification(
      'GAMIFICATION',
      '¡XP Ganado!',
      `Has ganado ${xp} XP por ${reason}`,
      { xp, reason }
    );
  }

  // Enviar notificación de subida de nivel
  async notifyLevelUp(newLevel: number) {
    await this.createNotification(
      'SYSTEM',
      '¡Nivel Alcanzado!',
      `¡Felicidades! Has alcanzado el nivel ${newLevel}`,
      { level: newLevel }
    );
  }

  // Enviar notificación de badge ganado
  async notifyBadgeEarned(badgeName: string) {
    await this.createNotification(
      'SYSTEM',
      '¡Badge Desbloqueado!',
      `Has desbloqueado el badge: ${badgeName}`,
      { badge: badgeName }
    );
  }


}

// Instancia singleton
export const notificationService = new NotificationService();