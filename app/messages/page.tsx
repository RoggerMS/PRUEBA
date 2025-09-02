'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import MessagingCenter from '../../components/messages/MessagingCenter';
import NewConversationModal from '../../components/messages/NewConversationModal';
import ConversationDetails from '../../components/messages/ConversationDetails';
import { MessageCircle, Plus, Users, Search } from 'lucide-react';

interface Conversation {
  id: string;
  title?: string;
  type: 'DIRECT' | 'GROUP';
  createdAt: string;
  updatedAt: string;
  lastMessage?: {
    id: string;
    content: string;
    createdAt: string;
    sender: {
      name: string;
      username: string;
    };
  };
  participants: Array<{
    id: string;
    userId: string;
    role: 'ADMIN' | 'MEMBER';
    user: {
      id: string;
      name: string;
      username: string;
      image?: string;
      isVerified?: boolean;
    };
  }>;
  _count: {
    messages: number;
    unreadMessages: number;
  };
}

const MessagesPage: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [showConversationDetails, setShowConversationDetails] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([]);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  // Load conversations
  const loadConversations = async () => {
    if (!session?.user?.id) return;

    try {
      const response = await fetch('/api/messages/conversations');
      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations || []);
      } else {
        toast.error('Error al cargar conversaciones');
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
      toast.error('Error al cargar conversaciones');
    } finally {
      setLoading(false);
    }
  };

  // Filter conversations based on search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredConversations(conversations);
    } else {
      const filtered = conversations.filter(conversation => {
        const title = conversation.title || '';
        const participantNames = conversation.participants
          .filter(p => p.userId !== session?.user?.id)
          .map(p => p.user.name || p.user.username)
          .join(' ');
        
        return (
          title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          participantNames.toLowerCase().includes(searchQuery.toLowerCase())
        );
      });
      setFilteredConversations(filtered);
    }
  }, [searchQuery, conversations, session?.user?.id]);

  // Handle conversation selection
  const handleConversationSelect = (conversation: Conversation) => {
    setSelectedConversation(conversation);
  };

  // Handle new conversation created
  const handleConversationCreated = (newConversation: Conversation) => {
    setConversations(prev => [newConversation, ...prev]);
    setSelectedConversation(newConversation);
  };

  // Handle conversation updated
  const handleConversationUpdated = (updatedConversation: Conversation) => {
    setConversations(prev => 
      prev.map(conv => 
        conv.id === updatedConversation.id ? updatedConversation : conv
      )
    );
    if (selectedConversation?.id === updatedConversation.id) {
      setSelectedConversation(updatedConversation);
    }
  };

  // Handle conversation deleted
  const handleConversationDeleted = (conversationId: string) => {
    setConversations(prev => prev.filter(conv => conv.id !== conversationId));
    if (selectedConversation?.id === conversationId) {
      setSelectedConversation(null);
    }
  };

  // Format conversation display name
  const getConversationDisplayName = (conversation: Conversation) => {
    if (conversation.type === 'GROUP') {
      return conversation.title || 'Grupo sin título';
    }
    
    const otherParticipant = conversation.participants.find(
      p => p.userId !== session?.user?.id
    );
    return otherParticipant?.user.name || otherParticipant?.user.username || 'Usuario';
  };

  // Format last message time
  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString('es-ES', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('es-ES', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  // Load conversations on mount
  useEffect(() => {
    if (session?.user?.id) {
      loadConversations();
    }
  }, [session?.user?.id]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex h-[calc(100vh-8rem)]">
            {/* Conversations Sidebar */}
            <div className="w-1/3 border-r border-gray-200 flex flex-col">
              {/* Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h1 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                    <MessageCircle className="h-6 w-6 text-blue-600" />
                    <span>Mensajes</span>
                  </h1>
                  <button
                    onClick={() => setShowNewConversation(true)}
                    className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                    title="Nueva conversación"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
                
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Buscar conversaciones..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Conversations List */}
              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="p-4 text-center text-gray-500">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    Cargando conversaciones...
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    {searchQuery ? (
                      <div>
                        <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                        <p>No se encontraron conversaciones</p>
                      </div>
                    ) : (
                      <div>
                        <MessageCircle className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                        <p>No tienes conversaciones aún</p>
                        <button
                          onClick={() => setShowNewConversation(true)}
                          className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          Crear nueva conversación
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {filteredConversations.map((conversation) => {
                      const isSelected = selectedConversation?.id === conversation.id;
                      const hasUnread = conversation._count.unreadMessages > 0;
                      
                      return (
                        <div
                          key={conversation.id}
                          onClick={() => handleConversationSelect(conversation)}
                          className={`p-4 cursor-pointer transition-colors ${
                            isSelected 
                              ? 'bg-blue-50 border-r-2 border-blue-600' 
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="relative">
                              {conversation.type === 'GROUP' ? (
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                  <Users className="h-6 w-6 text-blue-600" />
                                </div>
                              ) : (
                                <img
                                  src={
                                    conversation.participants.find(p => p.userId !== session?.user?.id)?.user.image ||
                                    '/default-avatar.png'
                                  }
                                  alt="Avatar"
                                  className="w-12 h-12 rounded-full object-cover"
                                />
                              )}
                              {hasUnread && (
                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                  {conversation._count.unreadMessages > 9 ? '9+' : conversation._count.unreadMessages}
                                </div>
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h3 className={`text-sm font-medium truncate ${
                                  hasUnread ? 'text-gray-900' : 'text-gray-700'
                                }`}>
                                  {getConversationDisplayName(conversation)}
                                </h3>
                                {conversation.lastMessage && (
                                  <span className="text-xs text-gray-500 ml-2">
                                    {formatMessageTime(conversation.lastMessage.createdAt)}
                                  </span>
                                )}
                              </div>
                              
                              {conversation.lastMessage && (
                                <p className={`text-sm truncate mt-1 ${
                                  hasUnread ? 'text-gray-900 font-medium' : 'text-gray-500'
                                }`}>
                                  {conversation.lastMessage.sender.name}: {conversation.lastMessage.content}
                                </p>
                              )}
                              
                              <div className="flex items-center justify-between mt-1">
                                <span className="text-xs text-gray-400">
                                  {conversation.type === 'GROUP' 
                                    ? `${conversation.participants.length} participantes`
                                    : 'Chat directo'
                                  }
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
              {selectedConversation ? (
                <MessagingCenter
                  conversation={selectedConversation}
                  onConversationUpdated={handleConversationUpdated}
                  onShowDetails={() => setShowConversationDetails(true)}
                />
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <MessageCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Selecciona una conversación
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Elige una conversación de la lista para comenzar a chatear
                    </p>
                    <button
                      onClick={() => setShowNewConversation(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Nueva Conversación
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <NewConversationModal
        isOpen={showNewConversation}
        onClose={() => setShowNewConversation(false)}
        onConversationCreated={handleConversationCreated}
      />

      {selectedConversation && (
        <ConversationDetails
          conversation={selectedConversation}
          isOpen={showConversationDetails}
          onClose={() => setShowConversationDetails(false)}
          onConversationUpdated={handleConversationUpdated}
          onConversationDeleted={handleConversationDeleted}
        />
      )}
    </div>
  );
};

export default MessagesPage;