'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Bell, CheckCircle, AlertCircle, Info, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface NotificationToastProps {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'achievement' | 'system';
  title: string;
  message: string;
  actionUrl?: string;
  actionLabel?: string;
  duration?: number;
  onClose?: (id: string) => void;
  onAction?: (id: string, url?: string) => void;
}

const typeConfig = {
  info: {
    icon: Info,
    bgColor: 'bg-blue-50 dark:bg-blue-950',
    borderColor: 'border-blue-200 dark:border-blue-800',
    iconColor: 'text-blue-600 dark:text-blue-400',
    titleColor: 'text-blue-900 dark:text-blue-100'
  },
  success: {
    icon: CheckCircle,
    bgColor: 'bg-green-50 dark:bg-green-950',
    borderColor: 'border-green-200 dark:border-green-800',
    iconColor: 'text-green-600 dark:text-green-400',
    titleColor: 'text-green-900 dark:text-green-100'
  },
  warning: {
    icon: AlertCircle,
    bgColor: 'bg-yellow-50 dark:bg-yellow-950',
    borderColor: 'border-yellow-200 dark:border-yellow-800',
    iconColor: 'text-yellow-600 dark:text-yellow-400',
    titleColor: 'text-yellow-900 dark:text-yellow-100'
  },
  error: {
    icon: AlertCircle,
    bgColor: 'bg-red-50 dark:bg-red-950',
    borderColor: 'border-red-200 dark:border-red-800',
    iconColor: 'text-red-600 dark:text-red-400',
    titleColor: 'text-red-900 dark:text-red-100'
  },
  achievement: {
    icon: Star,
    bgColor: 'bg-purple-50 dark:bg-purple-950',
    borderColor: 'border-purple-200 dark:border-purple-800',
    iconColor: 'text-purple-600 dark:text-purple-400',
    titleColor: 'text-purple-900 dark:text-purple-100'
  },
  system: {
    icon: Bell,
    bgColor: 'bg-gray-50 dark:bg-gray-950',
    borderColor: 'border-gray-200 dark:border-gray-800',
    iconColor: 'text-gray-600 dark:text-gray-400',
    titleColor: 'text-gray-900 dark:text-gray-100'
  }
};

export function NotificationToast({
  id,
  type,
  title,
  message,
  actionUrl,
  actionLabel = 'Ver',
  duration = 5000,
  onClose,
  onAction
}: NotificationToastProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  
  const config = typeConfig[type];
  const Icon = config.icon;

  const handleClose = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.(id);
    }, 300);
  }, [id, onClose]);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, handleClose]);

  const handleAction = () => {
    onAction?.(id, actionUrl);
    if (actionUrl) {
      window.location.href = actionUrl;
    }
    handleClose();
  };

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        'fixed top-4 right-4 z-50 w-96 max-w-sm rounded-lg border p-4 shadow-lg transition-all duration-300 ease-in-out',
        config.bgColor,
        config.borderColor,
        isExiting ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'
      )}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <div className={cn('flex-shrink-0 mt-0.5', config.iconColor)}>
          <Icon className="h-5 w-5" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h4 className={cn('text-sm font-semibold', config.titleColor)}>
                {title}
                {type === 'achievement' && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    ¡Logro desbloqueado!
                  </Badge>
                )}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                {message}
              </p>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              onClick={handleClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {actionUrl && (
            <div className="mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleAction}
                className="text-xs"
              >
                {actionLabel}
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {/* Barra de progreso para mostrar tiempo restante */}
      {duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700 rounded-b-lg overflow-hidden">
          <div 
            className={cn(
              'h-full transition-all ease-linear',
              config.iconColor.replace('text-', 'bg-')
            )}
            style={{
              animation: `shrink ${duration}ms linear forwards`
            }}
          />
        </div>
      )}
      
      <style jsx>{`
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
}

// Componente contenedor para manejar múltiples toasts
interface NotificationToastContainerProps {
  notifications: Array<{
    id: string;
    type: 'info' | 'success' | 'warning' | 'error' | 'achievement' | 'system';
    title: string;
    message: string;
    actionUrl?: string;
    actionLabel?: string;
    duration?: number;
  }>;
  onClose?: (id: string) => void;
  onAction?: (id: string, url?: string) => void;
}

export function NotificationToastContainer({
  notifications,
  onClose,
  onAction
}: NotificationToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification, index) => (
        <div
          key={notification.id}
          style={{
            transform: `translateY(${index * 8}px)`,
            zIndex: 50 - index
          }}
        >
          <NotificationToast
            {...notification}
            onClose={onClose}
            onAction={onAction}
          />
        </div>
      ))}
    </div>
  );
}

// Hook para manejar toasts de notificaciones
import { useCallback } from 'react';

interface ToastNotification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'achievement' | 'system';
  title: string;
  message: string;
  actionUrl?: string;
  actionLabel?: string;
  duration?: number;
}

export function useNotificationToasts() {
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const addToast = useCallback((toast: Omit<ToastNotification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { ...toast, id };
    
    setToasts(prev => [...prev, newToast]);
    
    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  return {
    toasts,
    addToast,
    removeToast,
    clearAllToasts
  };
}