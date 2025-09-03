import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  success: (title: string, description?: string, options?: Partial<Toast>) => void;
  error: (title: string, description?: string, options?: Partial<Toast>) => void;
  warning: (title: string, description?: string, options?: Partial<Toast>) => void;
  info: (title: string, description?: string, options?: Partial<Toast>) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: React.ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { ...toast, id };

    setToasts(prev => [...prev, newToast]);

    // Auto remove after duration
    const duration = toast.duration ?? 5000;
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const success = useCallback((title: string, description?: string, options?: Partial<Toast>) => {
    addToast({ ...options, type: 'success', title, description });
  }, [addToast]);

  const error = useCallback((title: string, description?: string, options?: Partial<Toast>) => {
    addToast({ ...options, type: 'error', title, description, duration: options?.duration ?? 7000 });
  }, [addToast]);

  const warning = useCallback((title: string, description?: string, options?: Partial<Toast>) => {
    addToast({ ...options, type: 'warning', title, description });
  }, [addToast]);

  const info = useCallback((title: string, description?: string, options?: Partial<Toast>) => {
    addToast({ ...options, type: 'info', title, description });
  }, [addToast]);

  return (
    <ToastContext.Provider value={{
      toasts,
      addToast,
      removeToast,
      success,
      error,
      warning,
      info
    }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
};

const ToastContainer: React.FC = () => {
  const { toasts } = useToast();

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
};

interface ToastItemProps {
  toast: Toast;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast }) => {
  const { removeToast } = useToast();
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Trigger enter animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleRemove = () => {
    setIsLeaving(true);
    setTimeout(() => removeToast(toast.id), 200);
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getColorClasses = () => {
    switch (toast.type) {
      case 'success':
        return 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950';
      case 'error':
        return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950';
      case 'info':
        return 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950';
    }
  };

  return (
    <div
      className={cn(
        'relative flex items-start gap-3 p-4 rounded-lg border shadow-lg backdrop-blur-sm transition-all duration-300 ease-out',
        getColorClasses(),
        isVisible && !isLeaving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0',
        isLeaving && 'translate-x-full opacity-0'
      )}
    >
      <div className="flex-shrink-0 mt-0.5">
        {getIcon()}
      </div>
      
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-foreground">
          {toast.title}
        </h4>
        {toast.description && (
          <p className="text-sm text-muted-foreground mt-1">
            {toast.description}
          </p>
        )}
        {toast.action && (
          <button
            onClick={toast.action.onClick}
            className="text-sm font-medium text-primary hover:text-primary/80 mt-2 underline"
          >
            {toast.action.label}
          </button>
        )}
      </div>
      
      <button
        onClick={handleRemove}
        className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

// Utility functions for common toast scenarios
export const eventToasts = {
  eventCreated: (eventTitle: string) => ({
    type: 'success' as ToastType,
    title: '¡Evento creado exitosamente!',
    description: `"${eventTitle}" ha sido publicado y está disponible para registros.`,
    duration: 6000
  }),
  
  eventUpdated: (eventTitle: string) => ({
    type: 'success' as ToastType,
    title: 'Evento actualizado',
    description: `Los cambios en "${eventTitle}" han sido guardados.`,
    duration: 4000
  }),
  
  eventDeleted: (eventTitle: string) => ({
    type: 'info' as ToastType,
    title: 'Evento eliminado',
    description: `"${eventTitle}" ha sido eliminado permanentemente.`,
    duration: 5000
  }),
  
  registrationSuccess: (eventTitle: string) => ({
    type: 'success' as ToastType,
    title: '¡Registro exitoso!',
    description: `Te has registrado para "${eventTitle}". Recibirás un recordatorio antes del evento.`,
    duration: 6000
  }),
  
  registrationCancelled: (eventTitle: string) => ({
    type: 'warning' as ToastType,
    title: 'Registro cancelado',
    description: `Tu registro para "${eventTitle}" ha sido cancelado.`,
    duration: 5000
  }),
  
  registrationFull: (eventTitle: string) => ({
    type: 'error' as ToastType,
    title: 'Evento lleno',
    description: `"${eventTitle}" ha alcanzado su capacidad máxima. Puedes unirte a la lista de espera.`,
    duration: 7000,
    action: {
      label: 'Lista de espera',
      onClick: () => console.log('Join waitlist')
    }
  }),
  
  commentAdded: () => ({
    type: 'success' as ToastType,
    title: 'Comentario publicado',
    description: 'Tu comentario ha sido añadido al evento.',
    duration: 3000
  }),
  
  networkError: () => ({
    type: 'error' as ToastType,
    title: 'Error de conexión',
    description: 'No se pudo conectar con el servidor. Verifica tu conexión a internet.',
    duration: 8000
  }),
  
  validationError: (field: string) => ({
    type: 'error' as ToastType,
    title: 'Error de validación',
    description: `Por favor, verifica el campo: ${field}`,
    duration: 5000
  }),
  
  saveProgress: (percentage: number) => ({
    type: 'info' as ToastType,
    title: 'Guardando progreso...',
    description: `${percentage}% completado`,
    duration: 2000
  })
};