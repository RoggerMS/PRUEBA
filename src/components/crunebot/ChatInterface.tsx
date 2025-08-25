"use client";

import { forwardRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Card } from "@/src/components/ui/card";
import { 
  Bot, 
  User, 
  Copy, 
  ThumbsUp, 
  ThumbsDown, 
  Star, 
  Download, 
  Share, 
  MoreHorizontal,
  CheckCircle,
  Clock,
  Brain,
  Zap,
  BookOpen,
  Code,
  FileText,
  Image as ImageIcon
} from "lucide-react";

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: string;
  type: 'text' | 'image' | 'file' | 'code';
  metadata?: {
    subject?: string;
    difficulty?: string;
    confidence?: number;
    sources?: string[];
    attachments?: {
      name: string;
      type: string;
      size: number;
      url: string;
    }[];
  };
}

interface ChatInterfaceProps {
  messages: Message[];
  isTyping: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

export const ChatInterface = forwardRef<HTMLDivElement, ChatInterfaceProps>(
  ({ messages, isTyping, messagesEndRef }, ref) => {
    const formatTime = (timestamp: string) => {
      return new Date(timestamp).toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const handleCopyMessage = (content: string) => {
      navigator.clipboard.writeText(content);
    };

    const handleRateMessage = (messageId: string, rating: 'up' | 'down') => {
      console.log(`Rating message ${messageId}: ${rating}`);
    };

    const renderMessageContent = (message: Message) => {
      switch (message.type) {
        case 'code':
          return (
            <div className="bg-gray-900 rounded-lg p-4 my-2">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Code className="h-4 w-4 text-green-400" />
                  <span className="text-sm text-gray-300">Código</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopyMessage(message.content)}
                  className="text-gray-400 hover:text-white"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <pre className="text-green-400 text-sm overflow-x-auto">
                <code>{message.content}</code>
              </pre>
            </div>
          );
        case 'image':
          return (
            <div className="my-2">
              <img 
                src={message.content} 
                alt="Imagen compartida" 
                className="max-w-sm rounded-lg shadow-md"
              />
            </div>
          );
        case 'file':
          return (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg my-2">
              <FileText className="h-8 w-8 text-blue-600" />
              <div className="flex-1">
                <p className="font-medium text-gray-900">{message.content}</p>
                <p className="text-sm text-gray-500">Archivo adjunto</p>
              </div>
              <Button variant="ghost" size="sm">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          );
        default:
          return (
            <div className="prose prose-sm max-w-none">
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
          );
      }
    };

    const getSubjectIcon = (subject?: string) => {
      switch (subject) {
        case 'matemáticas':
          return <Brain className="h-4 w-4" />;
        case 'programación':
          return <Code className="h-4 w-4" />;
        case 'ciencias':
          return <Zap className="h-4 w-4" />;
        case 'idiomas':
          return <BookOpen className="h-4 w-4" />;
        default:
          return <Bot className="h-4 w-4" />;
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

    return (
      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={ref}>
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="p-4 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full mb-4">
              <Bot className="h-12 w-12 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              ¡Hola! Soy CruneBot
            </h3>
            <p className="text-gray-600 max-w-md">
              Tu asistente académico inteligente. Puedo ayudarte con tareas, 
              explicaciones, resolución de problemas y mucho más.
            </p>
            <div className="grid grid-cols-2 gap-2 mt-6 w-full max-w-md">
              <Card className="p-3 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium">Resolver problemas</span>
                </div>
              </Card>
              <Card className="p-3 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium">Explicar conceptos</span>
                </div>
              </Card>
              <Card className="p-3 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center gap-2">
                  <Code className="h-5 w-5 text-purple-600" />
                  <span className="text-sm font-medium">Revisar código</span>
                </div>
              </Card>
              <Card className="p-3 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-orange-600" />
                  <span className="text-sm font-medium">Generar contenido</span>
                </div>
              </Card>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.sender === 'bot' && (
                <Avatar className="w-8 h-8 mt-1">
                  <AvatarImage src="/avatars/crunebot.png" />
                  <AvatarFallback className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              )}
              
              <div className={`max-w-[80%] ${message.sender === 'user' ? 'order-first' : ''}`}>
                <div
                  className={`rounded-lg p-3 ${
                    message.sender === 'user'
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white ml-auto'
                      : 'bg-white border shadow-sm'
                  }`}
                >
                  {renderMessageContent(message)}
                  
                  {/* Message metadata for bot messages */}
                  {message.sender === 'bot' && message.metadata && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-2 mb-2">
                        {message.metadata.subject && (
                          <Badge 
                            variant="secondary" 
                            className={`text-xs ${getSubjectColor(message.metadata.subject)}`}
                          >
                            {getSubjectIcon(message.metadata.subject)}
                            <span className="ml-1 capitalize">{message.metadata.subject}</span>
                          </Badge>
                        )}
                        {message.metadata.confidence && (
                          <Badge variant="outline" className="text-xs">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            {Math.round(message.metadata.confidence * 100)}% confianza
                          </Badge>
                        )}
                      </div>
                      
                      {message.metadata.sources && message.metadata.sources.length > 0 && (
                        <div className="text-xs text-gray-500">
                          <span className="font-medium">Fuentes: </span>
                          {message.metadata.sources.join(', ')}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-between mt-1 px-1">
                  <span className="text-xs text-gray-500">
                    {formatTime(message.timestamp)}
                  </span>
                  
                  {message.sender === 'bot' && (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyMessage(message.content)}
                        className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRateMessage(message.id, 'up')}
                        className="h-6 w-6 p-0 text-gray-400 hover:text-green-600"
                      >
                        <ThumbsUp className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRateMessage(message.id, 'down')}
                        className="h-6 w-6 p-0 text-gray-400 hover:text-red-600"
                      >
                        <ThumbsDown className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                      >
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              
              {message.sender === 'user' && (
                <Avatar className="w-8 h-8 mt-1">
                  <AvatarImage src="/avatars/user.png" />
                  <AvatarFallback className="bg-gray-600 text-white">
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))
        )}
        
        {/* Typing indicator */}
        {isTyping && (
          <div className="flex gap-3 justify-start">
            <Avatar className="w-8 h-8 mt-1">
              <AvatarFallback className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                <Bot className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div className="bg-white border shadow-sm rounded-lg p-3 max-w-[80%]">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-sm text-gray-500">CruneBot está escribiendo...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
    );
  }
);

ChatInterface.displayName = "ChatInterface";