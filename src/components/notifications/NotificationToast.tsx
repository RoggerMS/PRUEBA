'use client';

import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, Star, Trophy, Target } from 'lucide-react';
import { notificationService } from '@/services/notificationService';
import type { Notification } from 'src/hooks/useNotifications'

interface ToastNotification extends Notification {
  id: string;
  isVisible: boolean;
}

const NotificationToast: React.FC = () => {
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  useEffect(() => {
    const unsubscribe = notificationService.subscribe((notification) => {
      // Crear toast para la nueva notificación
      const toast: ToastNotification = {
        ...notification,
        isVisible: true
      };

      setToasts(prev => [...prev, toast]);

      // Auto-remover después de 5 segundos
      setTimeout(() => {
        setToasts(prev => 
          prev.map(t => 
            t.id === notification.id ? { ...t, isVisible: false } : t
          )
        );
        
        // Remover completamente después de la animación
        setTimeout(() => {
          setToasts(prev => prev.filter(t => t.id !== notification.id));
        }, 300);
      }, 5000);
    });

    return unsubscribe;
  }, []);

  const removeToast = (id: string) => {
    setToasts(prev => 
      prev.map(t => 
        t.id === id ? { ...t, isVisible: false } : t
      )
    );
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 300);
  };

  const getToastIcon = (type: Notification['type']) => {
    switch (type) {
      case 'GAMIFICATION':
        return <Star className="w-5 h-5 text-purple-500" />;
      case 'SOCIAL':
        return <Info className="w-5 h-5 text-blue-500" />;
      case 'SYSTEM':
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
      case 'ACADEMIC':
        return <Trophy className="w-5 h-5 text-green-500" />;
      case 'MARKETPLACE':
        return <Info className="w-5 h-5 text-yellow-500" />;
      default:
        return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
  };

  const getToastColors = (type: Notification['type']) => {
    switch (type) {
      case 'GAMIFICATION':
        return 'bg-purple-50 border-purple-200 text-purple-800';
      case 'SOCIAL':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'SYSTEM':
        return 'bg-gray-50 border-gray-200 text-gray-800';
      case 'ACADEMIC':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'MARKETPLACE':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default:
        return 'bg-white border-gray-200 text-gray-800';
    }
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            transform transition-all duration-300 ease-in-out
            ${
              toast.isVisible
                ? 'translate-x-0 opacity-100 scale-100'
                : 'translate-x-full opacity-0 scale-95'
            }
          `}
        >
          <div
            className={`
              max-w-sm w-full bg-white shadow-lg rounded-lg border-l-4 p-4
              ${getToastColors(toast.type)}
            `}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {getToastIcon(toast.type)}
              </div>
              
              <div className="ml-3 w-0 flex-1">
                <p className="text-sm font-medium">
                  {toast.title}
                </p>
                <p className="mt-1 text-sm opacity-90">
                  {toast.message}
                </p>
                
                {/* Datos adicionales para gamificación */}
                {toast.type === 'GAMIFICATION' && toast.data?.xp && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-medium">
                      +{toast.data.xp} XP
                    </div>
                  </div>
                )}
                
                {toast.type === 'GAMIFICATION' && toast.data?.newLevel && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-medium">
                      Nivel {toast.data.newLevel.level}
                    </div>
                  </div>
                )}
                
                {toast.type === 'GAMIFICATION' && toast.data?.badge && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-medium">
                      {toast.data.badge.name || 'Nueva Insignia'}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="ml-4 flex-shrink-0 flex">
                <button
                  onClick={() => removeToast(toast.id)}
                  className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition ease-in-out duration-150"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {/* Barra de progreso para auto-cierre */}
            <div className="mt-3 w-full bg-gray-200 rounded-full h-1">
              <div 
                className="bg-current h-1 rounded-full animate-[shrink_5s_linear_forwards]" 
                style={{
                  animationName: 'shrink',
                  animationDuration: '5s',
                  animationTimingFunction: 'linear',
                  animationFillMode: 'forwards'
                }}
              />
            </div>
          </div>
        </div>
      ))}
      
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
};

export default NotificationToast;
