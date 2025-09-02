'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import {
  X,
  Users,
  Settings,
  UserPlus,
  UserMinus,
  Edit3,
  Trash2,
  Crown,
  Shield,
  MessageCircle,
  Calendar,
  Check,
  MoreVertical
} from 'lucide-react';

interface Participant {
  id: string;
  userId: string;
  role: 'ADMIN' | 'MEMBER';
  joinedAt: string;
  user: {
    id: string;
    name: string;
    username: string;
    image?: string;
    isVerified?: boolean;
  };
}

interface Conversation {
  id: string;
  title?: string;
  type: 'DIRECT' | 'GROUP';
  createdAt: string;
  updatedAt: string;
  participants: Participant[];
  _count: {
    messages: number;
  };
}

interface ConversationDetailsProps {
  conversation: Conversation;
  isOpen: boolean;
  onClose: () => void;
  onConversationUpdated: (conversation: Conversation) => void;
  onConversationDeleted: (conversationId: string) => void;
}

const ConversationDetails: React.FC<ConversationDetailsProps> = ({
  conversation,
  isOpen,
  onClose,
  onConversationUpdated,
  onConversationDeleted
}) => {
  const { data: session } = useSession();
  const [editingTitle, setEditingTitle] = useState(false);
  const [newTitle, setNewTitle] = useState(conversation.title || '');
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [participantMenuOpen, setParticipantMenuOpen] = useState<string | null>(null);

  const currentUserParticipant = conversation.participants.find(
    p => p.userId === session?.user?.id
  );
  const isAdmin = currentUserParticipant?.role === 'ADMIN';
  const isGroupChat = conversation.type === 'GROUP';

  // Update conversation title
  const updateTitle = async () => {
    if (!newTitle.trim() || newTitle === conversation.title) {
      setEditingTitle(false);
      setNewTitle(conversation.title || '');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/messages/conversations`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          conversationId: conversation.id,
          title: newTitle.trim()
        })
      });

      if (response.ok) {
        const data = await response.json();
        onConversationUpdated(data.conversation);
        toast.success('Título actualizado correctamente');
        setEditingTitle(false);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Error al actualizar título');
      }
    } catch (error) {
      console.error('Error updating title:', error);
      toast.error('Error al actualizar título');
    } finally {
      setLoading(false);
    }
  };

  // Remove participant
  const removeParticipant = async (participantId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/messages/conversations`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          conversationId: conversation.id,
          action: 'REMOVE_PARTICIPANT',
          participantId
        })
      });

      if (response.ok) {
        const data = await response.json();
        onConversationUpdated(data.conversation);
        toast.success('Participante eliminado correctamente');
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Error al eliminar participante');
      }
    } catch (error) {
      console.error('Error removing participant:', error);
      toast.error('Error al eliminar participante');
    } finally {
      setLoading(false);
      setParticipantMenuOpen(null);
    }
  };

  // Change participant role
  const changeParticipantRole = async (participantId: string, newRole: 'ADMIN' | 'MEMBER') => {
    setLoading(true);
    try {
      const response = await fetch(`/api/messages/conversations`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          conversationId: conversation.id,
          action: 'CHANGE_ROLE',
          participantId,
          role: newRole
        })
      });

      if (response.ok) {
        const data = await response.json();
        onConversationUpdated(data.conversation);
        toast.success(`Rol cambiado a ${newRole.toLowerCase()}`);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Error al cambiar rol');
      }
    } catch (error) {
      console.error('Error changing role:', error);
      toast.error('Error al cambiar rol');
    } finally {
      setLoading(false);
      setParticipantMenuOpen(null);
    }
  };

  // Leave conversation
  const leaveConversation = async () => {
    if (!currentUserParticipant) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/messages/conversations`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          conversationId: conversation.id,
          action: 'LEAVE'
        })
      });

      if (response.ok) {
        toast.success('Has salido de la conversación');
        onConversationDeleted(conversation.id);
        onClose();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Error al salir de la conversación');
      }
    } catch (error) {
      console.error('Error leaving conversation:', error);
      toast.error('Error al salir de la conversación');
    } finally {
      setLoading(false);
    }
  };

  // Delete conversation
  const deleteConversation = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/messages/conversations?id=${conversation.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Conversación eliminada correctamente');
        onConversationDeleted(conversation.id);
        onClose();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Error al eliminar conversación');
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast.error('Error al eliminar conversación');
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Detalles de la Conversación
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Conversation Info */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-blue-100 rounded-full">
                {isGroupChat ? (
                  <Users className="h-6 w-6 text-blue-600" />
                ) : (
                  <MessageCircle className="h-6 w-6 text-blue-600" />
                )}
              </div>
              <div className="flex-1">
                {editingTitle && isGroupChat && isAdmin ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      onBlur={updateTitle}
                      onKeyPress={(e) => e.key === 'Enter' && updateTitle()}
                      className="flex-1 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      maxLength={50}
                      autoFocus
                    />
                    <button
                      onClick={updateTitle}
                      disabled={loading}
                      className="p-1 text-green-600 hover:text-green-700"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-medium text-gray-900">
                      {isGroupChat ? (conversation.title || 'Grupo sin título') : 
                       conversation.participants.find(p => p.userId !== session?.user?.id)?.user.name || 'Chat Directo'}
                    </h3>
                    {isGroupChat && isAdmin && (
                      <button
                        onClick={() => setEditingTitle(true)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                )}
                <p className="text-sm text-gray-500">
                  {isGroupChat ? `${conversation.participants.length} participantes` : 'Chat directo'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Creado:</span>
                <p className="font-medium">{formatDate(conversation.createdAt)}</p>
              </div>
              <div>
                <span className="text-gray-500">Mensajes:</span>
                <p className="font-medium">{conversation._count.messages}</p>
              </div>
            </div>
          </div>

          {/* Participants */}
          <div className="p-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Participantes ({conversation.participants.length})</span>
            </h4>
            
            <div className="space-y-3">
              {conversation.participants.map((participant) => (
                <div key={participant.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img
                      src={participant.user.image || '/default-avatar.png'}
                      alt={participant.user.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <h5 className="text-sm font-medium text-gray-900">
                          {participant.user.name}
                        </h5>
                        {participant.user.isVerified && (
                          <Check className="h-4 w-4 text-blue-500" />
                        )}
                        {participant.role === 'ADMIN' && (
                          <Crown className="h-4 w-4 text-yellow-500" />
                        )}
                        {participant.userId === session?.user?.id && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            Tú
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">@{participant.user.username}</p>
                      <p className="text-xs text-gray-400">
                        Se unió {formatDate(participant.joinedAt)}
                      </p>
                    </div>
                  </div>

                  {/* Participant Actions */}
                  {isGroupChat && isAdmin && participant.userId !== session?.user?.id && (
                    <div className="relative">
                      <button
                        onClick={() => setParticipantMenuOpen(
                          participantMenuOpen === participant.id ? null : participant.id
                        )}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                      
                      {participantMenuOpen === participant.id && (
                        <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[150px]">
                          {participant.role === 'MEMBER' ? (
                            <button
                              onClick={() => changeParticipantRole(participant.id, 'ADMIN')}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                            >
                              <Crown className="h-4 w-4" />
                              <span>Hacer Admin</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => changeParticipantRole(participant.id, 'MEMBER')}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                            >
                              <Shield className="h-4 w-4" />
                              <span>Quitar Admin</span>
                            </button>
                          )}
                          <button
                            onClick={() => removeParticipant(participant.id)}
                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                          >
                            <UserMinus className="h-4 w-4" />
                            <span>Eliminar</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-200 space-y-3">
          {isGroupChat && (
            <button
              onClick={leaveConversation}
              disabled={loading}
              className="w-full px-4 py-2 text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <UserMinus className="h-4 w-4" />
              <span>Salir de la Conversación</span>
            </button>
          )}
          
          {isAdmin && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              disabled={loading}
              className="w-full px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <Trash2 className="h-4 w-4" />
              <span>Eliminar Conversación</span>
            </button>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              ¿Eliminar conversación?
            </h3>
            <p className="text-gray-600 mb-6">
              Esta acción no se puede deshacer. Todos los mensajes se eliminarán permanentemente.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={deleteConversation}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConversationDetails;