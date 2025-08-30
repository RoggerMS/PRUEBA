import { toast } from 'sonner'

export interface NotificationData {
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  actionUrl?: string
  actionText?: string
}

class NotificationService {
  private static instance: NotificationService
  private subscribers: ((notification: NotificationData) => void)[] = []
  private userId: string | null = null
  private isConnected: boolean = false

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService()
    }
    return NotificationService.instance
  }

  subscribe(callback: (notification: NotificationData) => void) {
    this.subscribers.push(callback)
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback)
    }
  }

  notify(notification: NotificationData) {
    // Notificar a todos los suscriptores
    this.subscribers.forEach(callback => callback(notification))

    // Mostrar toast
    this.showToast(notification)
  }

  private showToast(notification: NotificationData) {
    const { type, title, message } = notification

    switch (type) {
      case 'success':
        toast.success(title, {
          description: message
        })
        break
      case 'error':
        toast.error(title, {
          description: message
        })
        break
      case 'warning':
        toast.warning(title, {
          description: message
        })
        break
      default:
        toast.info(title, {
          description: message
        })
    }
  }

  // Métodos de conveniencia
  success(title: string, message: string, actionUrl?: string, actionText?: string) {
    this.notify({ type: 'success', title, message, actionUrl, actionText })
  }

  error(title: string, message: string, actionUrl?: string, actionText?: string) {
    this.notify({ type: 'error', title, message, actionUrl, actionText })
  }

  warning(title: string, message: string, actionUrl?: string, actionText?: string) {
    this.notify({ type: 'warning', title, message, actionUrl, actionText })
  }

  info(title: string, message: string, actionUrl?: string, actionText?: string) {
    this.notify({ type: 'info', title, message, actionUrl, actionText })
  }

  // Connection methods for WebSocket integration
  connect(userId: string) {
    this.userId = userId
    this.isConnected = true
    console.log(`Notification service connected for user: ${userId}`)
  }

  disconnect() {
    this.userId = null
    this.isConnected = false
    console.log('Notification service disconnected')
  }

  // Request browser notification permission
  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications')
      return 'denied'
    }

    if (Notification.permission === 'granted') {
      return 'granted'
    }

    if (Notification.permission === 'denied') {
      return 'denied'
    }

    try {
      const permission = await Notification.requestPermission()
      return permission
    } catch (error) {
      console.error('Error requesting notification permission:', error)
      return 'denied'
    }
  }

  // Show browser notification
  showBrowserNotification(title: string, options?: NotificationOptions) {
    if (Notification.permission === 'granted') {
      new Notification(title, options)
    }
  }

  // Getters
  getUserId(): string | null {
    return this.userId
  }

  getIsConnected(): boolean {
    return this.isConnected
  }
}

export const notificationService = NotificationService.getInstance()
export default notificationService