import { AlertCircle, RefreshCw, Wifi, WifiOff } from 'lucide-react';

interface ErrorStateProps {
  type?: 'network' | 'server' | 'generic';
  title?: string;
  description?: string;
  onRetry?: () => void;
  isRetrying?: boolean;
}

export function ErrorState({ 
  type = 'generic',
  title,
  description,
  onRetry,
  isRetrying = false
}: ErrorStateProps) {
  const getDefaultContent = () => {
    switch (type) {
      case 'network':
        return {
          icon: <WifiOff className="w-16 h-16 text-red-400" />,
          title: 'Sin conexión a internet',
          description: 'Verifica tu conexión e intenta nuevamente.',
        };
      case 'server':
        return {
          icon: <AlertCircle className="w-16 h-16 text-red-400" />,
          title: 'Error del servidor',
          description: 'Estamos experimentando problemas técnicos. Intenta más tarde.',
        };
      default:
        return {
          icon: <AlertCircle className="w-16 h-16 text-red-400" />,
          title: 'Algo salió mal',
          description: 'Ocurrió un error inesperado. Por favor, intenta nuevamente.',
        };
    }
  };

  const defaultContent = getDefaultContent();

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="mb-6">
        {defaultContent.icon}
      </div>
      
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {title || defaultContent.title}
      </h3>
      
      <p className="text-gray-600 mb-6 max-w-md">
        {description || defaultContent.description}
      </p>
      
      {onRetry && (
        <button
          onClick={onRetry}
          disabled={isRetrying}
          className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
        >
          <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
          <span>{isRetrying ? 'Reintentando...' : 'Reintentar'}</span>
        </button>
      )}
      
      {type === 'network' && (
        <div className="mt-4 flex items-center space-x-2 text-sm text-gray-500">
          <Wifi className="w-4 h-4" />
          <span>Verifica tu conexión a internet</span>
        </div>
      )}
    </div>
  );
}

export default ErrorState;