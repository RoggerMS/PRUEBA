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
}

export const notificationService = NotificationService.getInstance()
export default notificationService