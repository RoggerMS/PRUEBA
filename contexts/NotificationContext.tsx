'use client'

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { toast } from 'sonner'

interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  timestamp: Date
  read: boolean
  actionUrl?: string
  actionText?: string
}

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  removeNotification: (id: string) => void
  clearAll: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}

interface NotificationProviderProps {
  children: ReactNode
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'success',
      title: 'Bienvenido a La Cantuta',
      message: 'Tu cuenta ha sido creada exitosamente. ¡Comienza tu viaje educativo!',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutos atrás
      read: false,
      actionUrl: '/perfil',
      actionText: 'Ver Perfil'
    },
    {
      id: '2',
      type: 'info',
      title: 'Nuevo Desafío Disponible',
      message: 'Se ha publicado un nuevo desafío de Matemática e Informática. ¡Participa ahora!',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 horas atrás
      read: false,
      actionUrl: '/challenges',
      actionText: 'Ver Desafío'
    },
    {
      id: '3',
      type: 'warning',
      title: 'Tarea Pendiente',
      message: 'Tienes una tarea de Programación Educativa que vence mañana.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 horas atrás
      read: true,
      actionUrl: '/workspace',
      actionText: 'Ver Tarea'
    },
    {
      id: '4',
      type: 'success',
      title: 'Logro Desbloqueado',
      message: '¡Felicitaciones! Has completado tu primer módulo de formación pedagógica.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 día atrás
      read: true,
      actionUrl: '/perfil/gamification',
      actionText: 'Ver Logros'
    }
  ])

  const unreadCount = notifications.filter(n => !n.read).length

  const addNotification = useCallback((notificationData: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notificationData,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false
    }

    setNotifications(prev => [newNotification, ...prev])

    // Mostrar toast según el tipo
    switch (notificationData.type) {
      case 'success':
        toast.success(notificationData.title, {
          description: notificationData.message
        })
        break
      case 'error':
        toast.error(notificationData.title, {
          description: notificationData.message
        })
        break
      case 'warning':
        toast.warning(notificationData.title, {
          description: notificationData.message
        })
        break
      default:
        toast.info(notificationData.title, {
          description: notificationData.message
        })
    }
  }, [])

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    )
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    )
  }, [])

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
  }, [])

  const clearAll = useCallback(() => {
    setNotifications([])
  }, [])

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

export default NotificationContext