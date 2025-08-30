'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Search, 
  MessageSquare, 
  Calendar, 
  Tag, 
  Trash2, 
  Star, 
  MoreVertical, 
  Filter,
  Clock,
  Bot,
  User,
  BookOpen,
  Code,
  Calculator,
  Globe,
  Beaker,
  Palette,
  Music,
  Heart,
  Zap
} from 'lucide-react';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: string;
  type: 'text' | 'image' | 'file' | 'code';
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
  subject?: string;
  tags: string[];
}

interface ChatHistoryProps {
  sessions: ChatSession[];
  onLoadSession: (sessionId: string) => void;
  selectedSession: string | null;
}

export function ChatHistory({ sessions, onLoadSession, selectedSession }: ChatHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'recent' | 'oldest' | 'title'>('recent');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Filter and sort sessions
  const filteredSessions = sessions
    .filter(session => {
      const matchesSearch = session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           session.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesSubject = !selectedSubject || session.subject === selectedSubject;
      return matchesSearch && matchesSubject;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

  // Get unique subjects
  const subjects = Array.from(new Set(sessions.map(s => s.subject).filter(Boolean)));

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Hoy';
    if (diffDays === 2) return 'Ayer';
    if (diffDays <= 7) return `Hace ${diffDays} días`;
    
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const getSubjectIcon = (subject: string) => {
    const icons: { [key: string]: React.ComponentType<any> } = {
      'matemáticas': Calculator,
      'programación': Code,
      'literatura': BookOpen,
      'ciencias': Beaker,
      'idiomas': Globe,
      'arte': Palette,
      'música': Music,
      'salud': Heart,
      'física': Zap
    };
    
    const Icon = icons[subject?.toLowerCase()] || BookOpen;
    return <Icon className="h-4 w-4" />;
  };

  const getSubjectColor = (subject: string) => {
    const colors: { [key: string]: string } = {
      'matemáticas': 'bg-blue-100 text-blue-800',
      'programación': 'bg-green-100 text-green-800',
      'literatura': 'bg-purple-100 text-purple-800',
      'ciencias': 'bg-orange-100 text-orange-800',
      'idiomas': 'bg-pink-100 text-pink-800',
      'arte': 'bg-yellow-100 text-yellow-800',
      'música': 'bg-indigo-100 text-indigo-800',
      'salud': 'bg-red-100 text-red-800',
      'física': 'bg-cyan-100 text-cyan-800'
    };
    
    return colors[subject?.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  const toggleFavorite = (sessionId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(sessionId)) {
      newFavorites.delete(sessionId);
    } else {
      newFavorites.add(sessionId);
    }
    setFavorites(newFavorites);
  };

  const getMessagePreview = (messages: Message[]) => {
    const lastUserMessage = messages.filter(m => m.sender === 'user').pop();
    return lastUserMessage?.content.substring(0, 100) + (lastUserMessage?.content.length > 100 ? '...' : '') || 'Sin mensajes';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Historial de Conversaciones</h2>
          <p className="text-gray-600">Revisa y continúa tus conversaciones anteriores</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            {filteredSessions.length} conversaciones
          </Badge>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar conversaciones..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            {/* Subject Filter */}
            <div className="flex gap-2">
              <Button
                variant={selectedSubject === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedSubject(null)}
              >
                Todas
              </Button>
              {subjects.map((subject) => (
                <Button
                  key={subject}
                  variant={selectedSubject === subject ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedSubject(subject)}
                  className="flex items-center gap-1"
                >
                  {getSubjectIcon(subject)}
                  {subject}
                </Button>
              ))}
            </div>
            
            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'recent' | 'oldest' | 'title')}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="recent">Más recientes</option>
              <option value="oldest">Más antiguos</option>
              <option value="title">Por título</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Sessions List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSessions.map((session) => (
          <Card 
            key={session.id} 
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
              selectedSession === session.id ? 'ring-2 ring-purple-500 bg-purple-50' : 'hover:bg-gray-50'
            }`}
            onClick={() => onLoadSession(session.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-base line-clamp-2 mb-2">
                    {session.title}
                  </CardTitle>
                  
                  <div className="flex items-center gap-2 mb-2">
                    {session.subject && (
                      <Badge className={getSubjectColor(session.subject)} variant="secondary">
                        {getSubjectIcon(session.subject)}
                        <span className="ml-1">{session.subject}</span>
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(session.id);
                    }}
                  >
                    <Star 
                      className={`h-4 w-4 ${
                        favorites.has(session.id) 
                          ? 'text-yellow-500 fill-current' 
                          : 'text-gray-400'
                      }`} 
                    />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              {/* Message Preview */}
              <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                {getMessagePreview(session.messages)}
              </p>
              
              {/* Tags */}
              {session.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {session.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                  {session.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{session.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}
              
              {/* Session Info */}
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" />
                    <span>{session.messages.length} mensajes</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{formatDate(session.updatedAt)}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  <Avatar className="w-4 h-4">
                    <AvatarFallback className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs">
                      <Bot className="h-2 w-2" />
                    </AvatarFallback>
                  </Avatar>
                  <span>CruneBot</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Empty State */}
      {filteredSessions.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No se encontraron conversaciones
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || selectedSubject 
                ? 'Intenta ajustar tus filtros de búsqueda'
                : 'Inicia una nueva conversación con CruneBot para comenzar'
              }
            </p>
            {(searchTerm || selectedSubject) && (
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedSubject(null);
                }}
              >
                Limpiar filtros
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}