'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Home, ArrowLeft, Bug, Wifi, Server } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  showDetails?: boolean;
  className?: string;
}

interface ErrorFallbackProps {
  error: Error;
  errorInfo?: React.ErrorInfo;
  resetError: () => void;
  showDetails?: boolean;
  className?: string;
}

const errorVariants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.95
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25
    }
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.95,
    transition: {
      duration: 0.2
    }
  }
};

const iconVariants = {
  initial: { scale: 0, rotate: -180 },
  animate: {
    scale: 1,
    rotate: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25,
      delay: 0.1
    }
  },
  pulse: {
    scale: [1, 1.1, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

// Error types and their configurations
const errorTypes = {
  network: {
    icon: Wifi,
    title: 'Error de Conexión',
    description: 'No se pudo conectar al servidor. Verifica tu conexión a internet.',
    color: 'text-orange-500',
    bgColor: 'bg-orange-50 dark:bg-orange-950/20',
    borderColor: 'border-orange-200 dark:border-orange-800'
  },
  server: {
    icon: Server,
    title: 'Error del Servidor',
    description: 'El servidor está experimentando problemas. Intenta de nuevo más tarde.',
    color: 'text-red-500',
    bgColor: 'bg-red-50 dark:bg-red-950/20',
    borderColor: 'border-red-200 dark:border-red-800'
  },
  notFound: {
    icon: AlertTriangle,
    title: 'Página No Encontrada',
    description: 'La página que buscas no existe o ha sido movida.',
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-50 dark:bg-yellow-950/20',
    borderColor: 'border-yellow-200 dark:border-yellow-800'
  },
  permission: {
    icon: AlertTriangle,
    title: 'Acceso Denegado',
    description: 'No tienes permisos para acceder a este contenido.',
    color: 'text-purple-500',
    bgColor: 'bg-purple-50 dark:bg-purple-950/20',
    borderColor: 'border-purple-200 dark:border-purple-800'
  },
  generic: {
    icon: Bug,
    title: 'Error Inesperado',
    description: 'Ha ocurrido un error inesperado. Nuestro equipo ha sido notificado.',
    color: 'text-gray-500',
    bgColor: 'bg-gray-50 dark:bg-gray-950/20',
    borderColor: 'border-gray-200 dark:border-gray-800'
  }
};

function getErrorType(error: Error): keyof typeof errorTypes {
  const message = error.message.toLowerCase();
  
  if (message.includes('network') || message.includes('fetch')) {
    return 'network';
  }
  if (message.includes('server') || message.includes('500')) {
    return 'server';
  }
  if (message.includes('404') || message.includes('not found')) {
    return 'notFound';
  }
  if (message.includes('403') || message.includes('unauthorized') || message.includes('permission')) {
    return 'permission';
  }
  
  return 'generic';
}

// Default Error Fallback Component
function DefaultErrorFallback({ 
  error, 
  errorInfo, 
  resetError, 
  showDetails = false, 
  className 
}: ErrorFallbackProps) {
  const [showFullError, setShowFullError] = React.useState(false);
  const errorType = getErrorType(error);
  const config = errorTypes[errorType];
  const IconComponent = config.icon;

  const handleGoHome = () => {
    window.location.href = '/';
  };

  const handleGoBack = () => {
    window.history.back();
  };

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <motion.div
      variants={errorVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={cn("flex items-center justify-center min-h-[400px] p-4", className)}
    >
      <Card className={cn("w-full max-w-md", config.bgColor, config.borderColor)}>
        <CardHeader className="text-center">
          <motion.div
            variants={iconVariants}
            initial="initial"
            animate={["animate", "pulse"]}
            className="flex justify-center mb-4"
          >
            <div className={cn("p-3 rounded-full", config.bgColor)}>
              <IconComponent className={cn("h-8 w-8", config.color)} />
            </div>
          </motion.div>
          
          <CardTitle className="text-xl font-semibold">
            {config.title}
          </CardTitle>
          
          <CardDescription className="text-center">
            {config.description}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Action Buttons */}
          <div className="flex flex-col gap-2">
            <Button 
              onClick={resetError}
              className="w-full"
              variant="default"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Intentar de Nuevo
            </Button>
            
            <div className="flex gap-2">
              <Button 
                onClick={handleGoBack}
                variant="outline"
                className="flex-1"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
              
              <Button 
                onClick={handleGoHome}
                variant="outline"
                className="flex-1"
              >
                <Home className="h-4 w-4 mr-2" />
                Inicio
              </Button>
            </div>
            
            <Button 
              onClick={handleReload}
              variant="ghost"
              className="w-full"
            >
              Recargar Página
            </Button>
          </div>

          {/* Error Details */}
          {showDetails && (
            <div className="space-y-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFullError(!showFullError)}
                className="w-full text-xs"
              >
                {showFullError ? 'Ocultar' : 'Mostrar'} Detalles Técnicos
              </Button>
              
              {showFullError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <Alert variant="destructive">
                    <Bug className="h-4 w-4" />
                    <AlertDescription className="text-xs font-mono">
                      <div className="space-y-1">
                        <div><strong>Error:</strong> {error.name}</div>
                        <div><strong>Mensaje:</strong> {error.message}</div>
                        {error.stack && (
                          <details className="mt-2">
                            <summary className="cursor-pointer">Stack Trace</summary>
                            <pre className="mt-1 text-xs whitespace-pre-wrap">
                              {error.stack}
                            </pre>
                          </details>
                        )}
                      </div>
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Error Boundary Class Component
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // Call custom error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      
      return (
        <FallbackComponent
          error={this.state.error}
          errorInfo={this.state.errorInfo || undefined}
          resetError={this.resetError}
          showDetails={this.props.showDetails}
          className={this.props.className}
        />
      );
    }

    return this.props.children;
  }
}

// Hook for error handling
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const handleError = React.useCallback((error: Error) => {
    setError(error);
  }, []);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return {
    error,
    resetError,
    handleError
  };
}

// Async Error Boundary Hook
export function useAsyncError() {
  const [, setError] = React.useState();
  
  return React.useCallback(
    (error: Error) => {
      setError(() => {
        throw error;
      });
    },
    []
  );
}

// Error Boundary HOC
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

// Specific Error Components
export function NetworkError({ onRetry, className }: { onRetry?: () => void; className?: string }) {
  const config = errorTypes.network;
  const IconComponent = config.icon;
  
  return (
    <motion.div
      variants={errorVariants}
      initial="initial"
      animate="animate"
      className={cn("text-center p-6", className)}
    >
      <motion.div variants={iconVariants} className="flex justify-center mb-4">
        <IconComponent className={cn("h-12 w-12", config.color)} />
      </motion.div>
      
      <h3 className="text-lg font-semibold mb-2">{config.title}</h3>
      <p className="text-muted-foreground mb-4">{config.description}</p>
      
      {onRetry && (
        <Button onClick={onRetry}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Reintentar
        </Button>
      )}
    </motion.div>
  );
}

export function NotFoundError({ onGoHome, className }: { onGoHome?: () => void; className?: string }) {
  const config = errorTypes.notFound;
  const IconComponent = config.icon;
  
  return (
    <motion.div
      variants={errorVariants}
      initial="initial"
      animate="animate"
      className={cn("text-center p-6", className)}
    >
      <motion.div variants={iconVariants} className="flex justify-center mb-4">
        <IconComponent className={cn("h-12 w-12", config.color)} />
      </motion.div>
      
      <h3 className="text-lg font-semibold mb-2">{config.title}</h3>
      <p className="text-muted-foreground mb-4">{config.description}</p>
      
      <div className="flex gap-2 justify-center">
        <Button variant="outline" onClick={() => window.history.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        
        <Button onClick={onGoHome || (() => window.location.href = '/')}>
          <Home className="h-4 w-4 mr-2" />
          Ir al Inicio
        </Button>
      </div>
    </motion.div>
  );
}

export default ErrorBoundary;