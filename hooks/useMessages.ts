import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: 'text' | 'image' | 'file';
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface Conversation {
  id: string;
  participants: string[];
  lastMessage?: Message;
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export default function useMessages() {
  const { data: session } = useSession();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load conversations
  const loadConversations = async () => {
    if (!session?.user?.id) return;

    setLoading(true);
    try {
      const response = await fetch('/api/messages/conversations');
      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations || []);
      } else {
        throw new Error('Failed to load conversations');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load conversations');
      toast.error('Error al cargar conversaciones');
    } finally {
      setLoading(false);
    }
  };

  // Load messages for a conversation
  const loadMessages = async (conversationId: string) => {
    if (!session?.user?.id) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/messages/${conversationId}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      } else {
        throw new Error('Failed to load messages');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages');
      toast.error('Error al cargar mensajes');
    } finally {
      setLoading(false);
    }
  };

  // Send a message
  const sendMessage = async (receiverId: string, content: string, type: 'text' | 'image' | 'file' = 'text') => {
    if (!session?.user?.id) {
      toast.error('Debes iniciar sesión para enviar mensajes');
      return false;
    }

    try {
      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          receiverId,
          content,
          type,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Mensaje enviado');
        
        // Refresh conversations and messages
        await loadConversations();
        if (data.message?.conversationId) {
          await loadMessages(data.message.conversationId);
        }
        
        return true;
      } else {
        throw new Error('Failed to send message');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      toast.error('Error al enviar mensaje');
      return false;
    }
  };

  // Mark messages as read
  const markAsRead = async (conversationId: string) => {
    if (!session?.user?.id) return;

    try {
      const response = await fetch(`/api/messages/${conversationId}/read`, {
        method: 'POST',
      });

      if (response.ok) {
        // Update local state
        setConversations(prev => 
          prev.map(conv => 
            conv.id === conversationId 
              ? { ...conv, unreadCount: 0 }
              : conv
          )
        );
        
        setMessages(prev => 
          prev.map(msg => 
            msg.conversationId === conversationId 
              ? { ...msg, isRead: true }
              : msg
          )
        );
      }
    } catch (err) {
      console.error('Error marking messages as read:', err);
    }
  };

  // Get unread count
  const getUnreadCount = () => {
    return conversations.reduce((total, conv) => total + conv.unreadCount, 0);
  };

  // Start a new conversation
  const startConversation = async (participantId: string) => {
    if (!session?.user?.id) {
      toast.error('Debes iniciar sesión para iniciar una conversación');
      return null;
    }

    try {
      const response = await fetch('/api/messages/conversations/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          participantId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        await loadConversations();
        return data.conversation;
      } else {
        throw new Error('Failed to start conversation');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start conversation');
      toast.error('Error al iniciar conversación');
      return null;
    }
  };

  // Load conversations on mount
  useEffect(() => {
    if (session?.user?.id) {
      loadConversations();
    }
  }, [session?.user?.id]);

  return {
    conversations,
    messages,
    loading,
    error,
    loadConversations,
    loadMessages,
    sendMessage,
    markAsRead,
    getUnreadCount,
    startConversation,
  };
}

export type { Message, Conversation };