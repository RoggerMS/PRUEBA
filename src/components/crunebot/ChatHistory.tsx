"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  History, 
  Search, 
  MessageSquare, 
  Calendar, 
  Tag, 
  Trash2, 
  Star, 
  MoreVertical, 
  Filter,
  Clock,
  BookOpen,
  Code,
  Brain,
  Zap
} from "lucide-react";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [sortBy, setSortBy] = useState("recent");

  const subjects = [
    { value: "all", label: "Todas las materias", icon: null },
    { value: "matemáticas", label: "Matemáticas", icon: Brain },
    { value: "programación", label: "Programación", icon: Code },
    { value: "ciencias", label: "Ciencias", icon: Zap },
    { value: "idiomas", label: "Idiomas", icon: BookOpen },
  ];

  const filteredSessions = sessions
    .filter(session => {
      const matchesSearch = session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           session.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesSubject = selectedSubject === "all" || session.subject === selectedSubject;
      return matchesSearch && matchesSubject;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "recent":
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "title":
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return "Hoy";
    } else if (diffDays === 2) {
      return "Ayer";
    } else if (diffDays <= 7) {
      return `Hace ${diffDays - 1} días`;
    } else {
      return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short'
      });
    }
  };

  const getSubjectColor = (subject?: string) => {
    switch (subject) {
      case 'matemáticas':
        return 'bg-blue-100 text-blue-800';
      case 'programación':
        return 'bg-green-100 text-green-800';
      case 'ciencias':
        return 'bg-purple-100 text-purple-800';
      case 'idiomas':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // Implement delete logic
    console.log('Delete session:', sessionId);
  };

  const handleStarSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // Implement star logic
    console.log('Star session:', sessionId);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <History className="h-5 w-5" />
          Historial de Chats
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar conversaciones..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filters */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filtros</span>
          </div>
          
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md text-sm"
          >
            {subjects.map(subject => (
              <option key={subject.value} value={subject.value}>
                {subject.label}
              </option>
            ))}
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="recent">Más recientes</option>
            <option value="oldest">Más antiguos</option>
            <option value="title">Por título</option>
          </select>
        </div>

        {/* Sessions List */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredSessions.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">
                {searchQuery || selectedSubject !== "all" 
                  ? "No se encontraron conversaciones"
                  : "No hay conversaciones guardadas"
                }
              </p>
            </div>
          ) : (
            filteredSessions.map((session) => (
              <Card
                key={session.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedSession === session.id 
                    ? 'ring-2 ring-purple-500 bg-purple-50' 
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => onLoadSession(session.id)}
              >
                <CardContent className="p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate mb-1">
                        {session.title}
                      </h4>
                      
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="h-3 w-3" />
                          {formatDate(session.updatedAt)}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <MessageSquare className="h-3 w-3" />
                          {session.messages.length} mensajes
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1 flex-wrap">
                        {session.subject && (
                          <Badge 
                            variant="secondary" 
                            className={`text-xs ${getSubjectColor(session.subject)}`}
                          >
                            {session.subject}
                          </Badge>
                        )}
                        {session.tags.slice(0, 2).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            <Tag className="h-2 w-2 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                        {session.tags.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{session.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 ml-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleStarSession(session.id, e)}
                        className="h-6 w-6 p-0 text-gray-400 hover:text-yellow-500"
                      >
                        <Star className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleDeleteSession(session.id, e)}
                        className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                      >
                        <MoreVertical className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Stats */}
        {sessions.length > 0 && (
          <div className="pt-3 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-lg font-semibold text-gray-900">
                  {sessions.length}
                </div>
                <div className="text-xs text-gray-500">Conversaciones</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-gray-900">
                  {sessions.reduce((total, session) => total + session.messages.length, 0)}
                </div>
                <div className="text-xs text-gray-500">Mensajes totales</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
