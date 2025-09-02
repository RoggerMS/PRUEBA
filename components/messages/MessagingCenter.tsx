'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import {
  MessageCircle,
  Send,
  Search,
  Plus,
  MoreVertical,
  Smile,
  Paperclip,
  Phone,
  Video,
  Info,
  ArrowLeft,
  Reply,
  Edit3,
  Trash2,
  Check,
  CheckCheck
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  username: string;
  image?: string;
  isVerified?: boolean;
  lastSeen?: string;
}

interface Message {
  id: string;
  content: string;
  type: 'TEXT' | 'IMAGE' | 'FILE' | 'AUDIO' | 'VIDEO';
  sender: User;
  attachments?: any;
  replyTo?: {
    id: string;
    content: string;
    sender: User;
    type: string;
  };
  reactions: Record<string, User[]>;
  isRead: boolean;
  isEdited: boolean;
  createdAt: string;
  editedAt?: string;
  readAt?: string;
}

interface Conversation {
  id: string;
  title?: string;
  type: 'DIRECT' | 'GROUP';
  participants: User[];
  lastMessage?: {
    id: string;
    content: string;
    sender: User;
    createdAt: string;
    type: string;
  };
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
  metadata?: any;
}

const MessagingCenter: React.FC = () => {
  const { data: session } = useSession();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<string | null>(null);
  const [showNewConversation, setShowNewConversation] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);

  // Fetch conversations
  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/messages/conversations');
      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast.error('Error al cargar conversaciones');
    } finally {
      setLoading(false);
    }
  };

  // Fetch messages for selected conversation
  const fetchMessages = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/messages/${conversationId}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages);
        scrollToBottom();
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Error al cargar mensajes');
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || sendingMessage) return;

    setSendingMessage(true);
    try {
      const response = await fetch(`/api/messages/${selectedConversation.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: newMessage.trim(),
          type: 'TEXT',
          replyToId: replyingTo?.id
        })
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, data.message]);
        setNewMessage('');
        setReplyingTo(null);
        scrollToBottom();
        
        // Update conversation list
        fetchConversations();
      } else {
        toast.error('Error al enviar mensaje');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Error al enviar mensaje');
    } finally {
      setSendingMessage(false);
    }
  };

  // Add reaction to message
  const addReaction = async (messageId: string, emoji: string) => {
    try {
      const response = await fetch('/api/messages/reactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ messageId, emoji })
      });

      if (response.ok) {
        // Refresh messages to show updated reactions
        if (selectedConversation) {
          fetchMessages(selectedConversation.id);
        }
      } else {
        toast.error('Error al agregar reacción');
      }
    } catch (error) {
      console.error('Error adding reaction:', error);
      toast.error('Error al agregar reacción');
    }
  };

  // Delete message
  const deleteMessage = async (messageId: string) => {
    if (!selectedConversation) return;

    try {
      const response = await fetch(`/api/messages/${selectedConversation.id}?messageId=${messageId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchMessages(selectedConversation.id);
        toast.success('Mensaje eliminado');
      } else {
        toast.error('Error al eliminar mensaje');
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Error al eliminar mensaje');
    }
  };

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Handle key press in message input
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString('es-ES', { 
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    } else {
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit'
      });
    }
  };

  // Get conversation title
  const getConversationTitle = (conversation: Conversation) => {
    if (conversation.title) return conversation.title;
    if (conversation.type === 'DIRECT' && conversation.participants.length === 1) {
      return conversation.participants[0].name || conversation.participants[0].username;
    }
    return conversation.participants.map(p => p.name || p.username).join(', ');
  };

  // Filter conversations based on search
  const filteredConversations = conversations.filter(conversation => {
    const title = getConversationTitle(conversation).toLowerCase();
    const lastMessage = conversation.lastMessage?.content.toLowerCase() || '';
    const query = searchQuery.toLowerCase();
    return title.includes(query) || lastMessage.includes(query);
  });

  useEffect(() => {
    if (session) {
      fetchConversations();
    }
  }, [session]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  if (!session) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Inicia sesión para ver tus mensajes</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white">
      {/* Conversations Sidebar */}
      <div className={`w-full md:w-1/3 border-r border-gray-200 flex flex-col ${
        selectedConversation ? 'hidden md:flex' : 'flex'
      }`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Mensajes</h2>
            <button
              onClick={() => setShowNewConversation(true)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
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
              Cargando conversaciones...
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              {searchQuery ? 'No se encontraron conversaciones' : 'No tienes conversaciones aún'}
            </div>
          ) : (
            filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => setSelectedConversation(conversation)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedConversation?.id === conversation.id ? 'bg-blue-50 border-blue-200' : ''
                }`}
              >
                <div className="flex items-start space-x-3">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {conversation.type === 'DIRECT' && conversation.participants.length === 1 ? (
                      <img
                        src={conversation.participants[0].image || '/default-avatar.png'}
                        alt={conversation.participants[0].name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {getConversationTitle(conversation).charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {getConversationTitle(conversation)}
                      </h3>
                      <span className="text-xs text-gray-500">
                        {conversation.lastMessage && formatTime(conversation.lastMessage.createdAt)}
                      </span>
                    </div>
                    
                    {conversation.lastMessage && (
                      <p className="text-sm text-gray-600 truncate mt-1">
                        {conversation.lastMessage.sender.name}: {conversation.lastMessage.content}
                      </p>
                    )}
                    
                    {conversation.unreadCount > 0 && (
                      <div className="flex justify-end mt-1">
                        <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                          {conversation.unreadCount}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-1 flex flex-col ${
        selectedConversation ? 'flex' : 'hidden md:flex'
      }`}>
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setSelectedConversation(null)}
                    className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-full"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  
                  {selectedConversation.type === 'DIRECT' && selectedConversation.participants.length === 1 ? (
                    <img
                      src={selectedConversation.participants[0].image || '/default-avatar.png'}
                      alt={selectedConversation.participants[0].name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {getConversationTitle(selectedConversation).charAt(0).toUpperCase()}
                    </div>
                  )}
                  
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {getConversationTitle(selectedConversation)}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {selectedConversation.participants.length} participante{selectedConversation.participants.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
                    <Phone className="h-5 w-5" />
                  </button>
                  <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
                    <Video className="h-5 w-5" />
                  </button>
                  <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
                    <Info className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => {
                const isOwn = message.sender.id === session.user?.id;
                
                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs lg:max-w-md ${isOwn ? 'order-2' : 'order-1'}`}>
                      {/* Reply indicator */}
                      {message.replyTo && (
                        <div className="mb-2 p-2 bg-gray-100 rounded-lg border-l-4 border-blue-500">
                          <p className="text-xs text-gray-600">
                            Respondiendo a {message.replyTo.sender.name}
                          </p>
                          <p className="text-sm text-gray-800 truncate">
                            {message.replyTo.content}
                          </p>
                        </div>
                      )}
                      
                      {/* Message bubble */}
                      <div
                        className={`relative group px-4 py-2 rounded-2xl ${
                          isOwn
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        
                        {/* Message actions */}
                        <div className="absolute top-0 right-0 transform translate-x-full opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="flex items-center space-x-1 bg-white shadow-lg rounded-lg p-1">
                            <button
                              onClick={() => setReplyingTo(message)}
                              className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                            >
                              <Reply className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => addReaction(message.id, '👍')}
                              className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                            >
                              <Smile className="h-4 w-4" />
                            </button>
                            {isOwn && (
                              <>
                                <button
                                  onClick={() => setEditingMessage(message.id)}
                                  className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                                >
                                  <Edit3 className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => deleteMessage(message.id)}
                                  className="p-1 text-red-600 hover:bg-red-100 rounded"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                        
                        {/* Reactions */}
                        {Object.keys(message.reactions).length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {Object.entries(message.reactions).map(([emoji, users]) => (
                              <button
                                key={emoji}
                                onClick={() => addReaction(message.id, emoji)}
                                className="flex items-center space-x-1 bg-white bg-opacity-20 rounded-full px-2 py-1 text-xs"
                              >
                                <span>{emoji}</span>
                                <span>{users.length}</span>
                              </button>
                            ))}
                          </div>
                        )}
                        
                        {/* Message info */}
                        <div className={`flex items-center justify-between mt-1 text-xs ${
                          isOwn ? 'text-blue-200' : 'text-gray-500'
                        }`}>
                          <span>{formatTime(message.createdAt)}</span>
                          {isOwn && (
                            <div className="flex items-center space-x-1">
                              {message.isEdited && <span>editado</span>}
                              {message.isRead ? (
                                <CheckCheck className="h-3 w-3" />
                              ) : (
                                <Check className="h-3 w-3" />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Avatar for other users */}
                    {!isOwn && (
                      <img
                        src={message.sender.image || '/default-avatar.png'}
                        alt={message.sender.name}
                        className="w-8 h-8 rounded-full object-cover order-1 mr-2 mt-auto"
                      />
                    )}
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Reply indicator */}
            {replyingTo && (
              <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Reply className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      Respondiendo a {replyingTo.sender.name}
                    </span>
                  </div>
                  <button
                    onClick={() => setReplyingTo(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ×
                  </button>
                </div>
                <p className="text-sm text-gray-800 truncate mt-1">
                  {replyingTo.content}
                </p>
              </div>
            )}

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex items-end space-x-2">
                <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
                  <Paperclip className="h-5 w-5" />
                </button>
                
                <div className="flex-1">
                  <textarea
                    ref={messageInputRef}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Escribe un mensaje..."
                    rows={1}
                    className="w-full px-4 py-2 border border-gray-300 rounded-full resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    style={{ minHeight: '40px', maxHeight: '120px' }}
                  />
                </div>
                
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || sendingMessage}
                  className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          /* No conversation selected */
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Selecciona una conversación
              </h3>
              <p className="text-gray-600">
                Elige una conversación de la lista para comenzar a chatear
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagingCenter;