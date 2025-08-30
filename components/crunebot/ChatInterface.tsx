'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Send, 
  Bot, 
  User, 
  Copy, 
  ThumbsUp, 
  ThumbsDown, 
  MoreVertical,
  Paperclip,
  Mic,
  Image as ImageIcon,
  Code,
  FileText,
  Loader2
} from 'lucide-react';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: string;
  type: 'text' | 'image' | 'file' | 'code';
}

interface ChatInterfaceProps {
  messages: Message[];
  isTyping: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  onSendMessage?: (message: string) => void;
}

export function ChatInterface({ messages, isTyping, messagesEndRef, onSendMessage }: ChatInterfaceProps) {
  const [inputValue, setInputValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, messagesEndRef]);

  const handleSendMessage = () => {
    if (inputValue.trim() && onSendMessage) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'code': return <Code className="h-4 w-4" />;
      case 'image': return <ImageIcon className="h-4 w-4" />;
      case 'file': return <FileText className="h-4 w-4" />;
      default: return null;
    }
  };

  return (
    <div className="flex flex-col h-[600px]">
      {/* Chat Messages */}
      <Card className="flex-1 mb-4">
        <CardContent className="p-0 h-full">
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.sender === 'bot' && (
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarFallback className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div className={`flex flex-col max-w-[70%] ${message.sender === 'user' ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`rounded-2xl px-4 py-3 ${
                        message.sender === 'user'
                          ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      {message.type !== 'text' && (
                        <div className="flex items-center gap-2 mb-2 opacity-75">
                          {getMessageIcon(message.type)}
                          <span className="text-xs uppercase tracking-wide">{message.type}</span>
                        </div>
                      )}
                      
                      <div className="whitespace-pre-wrap break-words">
                        {message.content}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-1 px-2">
                      <span className="text-xs text-gray-500">
                        {formatTimestamp(message.timestamp)}
                      </span>
                      
                      {message.sender === 'bot' && (
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                            onClick={() => copyToClipboard(message.content)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-gray-400 hover:text-green-600"
                          >
                            <ThumbsUp className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-gray-400 hover:text-red-600"
                          >
                            <ThumbsDown className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {message.sender === 'user' && (
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarFallback className="bg-gray-200">
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              
              {isTyping && (
                <div className="flex gap-3 justify-start">
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarFallback className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="bg-gray-100 rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-gray-600">CruneBot está escribiendo...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Input Area */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-end gap-3">
            {/* Attachment Button */}
            <Button
              variant="outline"
              size="sm"
              className="flex-shrink-0"
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            
            {/* Input Field */}
            <div className="flex-1">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Escribe tu pregunta aquí..."
                className="min-h-[40px] resize-none"
                disabled={isTyping}
              />
            </div>
            
            {/* Voice Recording Button */}
            <Button
              variant="outline"
              size="sm"
              className={`flex-shrink-0 ${isRecording ? 'bg-red-100 text-red-600' : ''}`}
              onClick={() => setIsRecording(!isRecording)}
            >
              <Mic className="h-4 w-4" />
            </Button>
            
            {/* Send Button */}
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isTyping}
              className="flex-shrink-0 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Quick Suggestions */}
          <div className="flex flex-wrap gap-2 mt-3">
            {[
              "Explica este concepto",
              "Resuelve paso a paso",
              "Dame ejemplos",
              "Simplifica esto"
            ].map((suggestion, index) => (
              <Badge
                key={index}
                variant="outline"
                className="cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => setInputValue(suggestion)}
              >
                {suggestion}
              </Badge>
            ))}
          </div>
          
          {/* Input Hints */}
          <div className="text-xs text-gray-500 mt-2 flex items-center justify-between">
            <span>Presiona Enter para enviar, Shift+Enter para nueva línea</span>
            <span>{inputValue.length}/2000</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}