import { MessageCircle, Users, Zap } from 'lucide-react';

interface EmptyStateProps {
  type?: 'feed' | 'search' | 'user';
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
}

export function EmptyState({ 
  type = 'feed',
  title,
  description,
  actionText,
  onAction 
}: EmptyStateProps) {
  const getDefaultContent = () => {
    switch (type) {
      case 'search':
        return {
          icon: <MessageCircle className="w-16 h-16 text-gray-400" />,
          title: 'No se encontraron resultados',
          description: 'Intenta con otros términos de búsqueda o explora el feed principal.',
        };
      case 'user':
        return {
          icon: <Users className="w-16 h-16 text-gray-400" />,
          title: 'Aún no hay publicaciones',
          description: 'Este usuario no ha compartido nada todavía.',
        };
      default:
        return {
          icon: <Zap className="w-16 h-16 text-gray-400" />,
          title: '¡Sé el primero en publicar!',
          description: 'El feed está vacío. Comparte algo interesante con la comunidad estudiantil.',
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
      
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}

export default EmptyState;