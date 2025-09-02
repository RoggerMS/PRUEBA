'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import {
  X,
  Search,
  Users,
  MessageCircle,
  Check,
  Plus
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  username: string;
  image?: string;
  isVerified?: boolean;
  isFollowing?: boolean;
}

interface NewConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConversationCreated: (conversation: any) => void;
}

const NewConversationModal: React.FC<NewConversationModalProps> = ({
  isOpen,
  onClose,
  onConversationCreated
}) => {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [conversationType, setConversationType] = useState<'DIRECT' | 'GROUP'>('DIRECT');
  const [groupTitle, setGroupTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [creating, setCreating] = useState(false);

  // Search users
  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}&limit=20`);
      if (response.ok) {
        const data = await response.json();
        // Filter out current user
        const filteredUsers = data.users.filter((user: User) => user.id !== session?.user?.id);
        setSearchResults(filteredUsers);
      }
    } catch (error) {
      console.error('Error searching users:', error);
      toast.error('Error al buscar usuarios');
    } finally {
      setSearching(false);
    }
  };

  // Toggle user selection
  const toggleUserSelection = (user: User) => {
    setSelectedUsers(prev => {
      const isSelected = prev.find(u => u.id === user.id);
      if (isSelected) {
        return prev.filter(u => u.id !== user.id);
      } else {
        const newSelection = [...prev, user];
        // Auto-switch to group if more than 1 user selected
        if (newSelection.length > 1) {
          setConversationType('GROUP');
        } else {
          setConversationType('DIRECT');
        }
        return newSelection;
      }
    });
  };

  // Create conversation
  const createConversation = async () => {
    if (selectedUsers.length === 0) {
      toast.error('Selecciona al menos un usuario');
      return;
    }

    if (conversationType === 'GROUP' && !groupTitle.trim()) {
      toast.error('Ingresa un título para el grupo');
      return;
    }

    setCreating(true);
    try {
      const response = await fetch('/api/messages/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          participantIds: selectedUsers.map(u => u.id),
          title: conversationType === 'GROUP' ? groupTitle : undefined,
          type: conversationType
        })
      });

      if (response.ok) {
        const data = await response.json();
        onConversationCreated(data.conversation);
        toast.success(data.message || 'Conversación creada correctamente');
        handleClose();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Error al crear conversación');
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast.error('Error al crear conversación');
    } finally {
      setCreating(false);
    }
  };

  // Handle modal close
  const handleClose = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSelectedUsers([]);
    setConversationType('DIRECT');
    setGroupTitle('');
    onClose();
  };

  // Handle search input change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchUsers(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Nueva Conversación
          </h2>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Conversation Type Toggle */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex space-x-4">
              <button
                onClick={() => {
                  setConversationType('DIRECT');
                  if (selectedUsers.length > 1) {
                    setSelectedUsers(selectedUsers.slice(0, 1));
                  }
                }}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  conversationType === 'DIRECT'
                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <MessageCircle className="h-4 w-4" />
                <span>Directo</span>
              </button>
              <button
                onClick={() => setConversationType('GROUP')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  conversationType === 'GROUP'
                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Users className="h-4 w-4" />
                <span>Grupo</span>
              </button>
            </div>
          </div>

          {/* Group Title Input */}
          {conversationType === 'GROUP' && (
            <div className="p-6 border-b border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título del Grupo
              </label>
              <input
                type="text"
                value={groupTitle}
                onChange={(e) => setGroupTitle(e.target.value)}
                placeholder="Ingresa el título del grupo"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                maxLength={50}
              />
            </div>
          )}

          {/* Selected Users */}
          {selectedUsers.length > 0 && (
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Participantes Seleccionados ({selectedUsers.length})
                {conversationType === 'DIRECT' && ' - Máximo 1'}
              </h3>
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center space-x-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                  >
                    <img
                      src={user.image || '/default-avatar.png'}
                      alt={user.name}
                      className="w-5 h-5 rounded-full object-cover"
                    />
                    <span>{user.name || user.username}</span>
                    <button
                      onClick={() => toggleUserSelection(user)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search */}
          <div className="p-6 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar usuarios..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Search Results */}
          <div className="flex-1 overflow-y-auto">
            {searching ? (
              <div className="p-6 text-center text-gray-500">
                Buscando usuarios...
              </div>
            ) : searchResults.length === 0 && searchQuery ? (
              <div className="p-6 text-center text-gray-500">
                No se encontraron usuarios
              </div>
            ) : searchQuery === '' ? (
              <div className="p-6 text-center text-gray-500">
                Busca usuarios para agregar a la conversación
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {searchResults.map((user) => {
                  const isSelected = selectedUsers.find(u => u.id === user.id);
                  const canSelect = conversationType === 'GROUP' || selectedUsers.length === 0;
                  
                  return (
                    <div
                      key={user.id}
                      onClick={() => canSelect && toggleUserSelection(user)}
                      className={`p-4 flex items-center justify-between transition-colors ${
                        canSelect
                          ? 'cursor-pointer hover:bg-gray-50'
                          : 'cursor-not-allowed opacity-50'
                      } ${
                        isSelected ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <img
                          src={user.image || '/default-avatar.png'}
                          alt={user.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <div className="flex items-center space-x-1">
                            <h3 className="text-sm font-medium text-gray-900">
                              {user.name || user.username}
                            </h3>
                            {user.isVerified && (
                              <Check className="h-4 w-4 text-blue-500" />
                            )}
                          </div>
                          <p className="text-sm text-gray-500">@{user.username}</p>
                          {user.isFollowing && (
                            <p className="text-xs text-blue-600">Te sigue</p>
                          )}
                        </div>
                      </div>
                      
                      {isSelected && (
                        <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                          <Check className="h-4 w-4 text-white" />
                        </div>
                      )}
                      
                      {!isSelected && canSelect && (
                        <div className="w-6 h-6 border-2 border-gray-300 rounded-full flex items-center justify-center">
                          <Plus className="h-4 w-4 text-gray-400" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={createConversation}
            disabled={selectedUsers.length === 0 || creating || (conversationType === 'GROUP' && !groupTitle.trim())}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            {creating && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            <span>
              {creating ? 'Creando...' : 'Crear Conversación'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewConversationModal;