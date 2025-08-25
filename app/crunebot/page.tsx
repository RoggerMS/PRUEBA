"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { ChatInterface } from "@/src/components/crunebot/ChatInterface";
import { ChatHistory } from "@/src/components/crunebot/ChatHistory";
import { BotPersonality } from "@/src/components/crunebot/BotPersonality";
import { QuickActions } from "@/src/components/crunebot/QuickActions";
import { 
  Bot, 
  MessageSquare, 
  Zap, 
  Brain, 
  Settings, 
  History, 
  Sparkles, 
  Users, 
  TrendingUp, 
  Clock,
  Star,
  Award,
  Target
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

interface PersonalityTrait {
  id: string;
  name: string;
  description: string;
  value: number;
  icon: React.ComponentType<any>;
  color: string;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
  category: string;
  prompt: string;
  popular?: boolean;
}

export default function CruneBotPage() {
  const [activeTab, setActiveTab] = useState("chat");
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "¡Hola! Soy CruneBot, tu asistente de estudio con IA. ¿En qué puedo ayudarte hoy?",
      sender: "bot",
      timestamp: new Date().toISOString(),
      type: "text"
    }
  ]);

  const [sessions] = useState<ChatSession[]>([
    {
      id: "1",
      title: "Ayuda con Cálculo Integral",
      messages: [
        {
          id: "1",
          content: "¿Puedes ayudarme a resolver esta integral?",
          sender: "user",
          timestamp: "2024-01-15T10:00:00Z",
          type: "text"
        },
        {
          id: "2",
          content: "¡Por supuesto! Te ayudo paso a paso con la integral.",
          sender: "bot",
          timestamp: "2024-01-15T10:01:00Z",
          type: "text"
        }
      ],
      createdAt: "2024-01-15T10:00:00Z",
      updatedAt: "2024-01-15T11:30:00Z",
      subject: "matemáticas",
      tags: ["cálculo", "integrales", "matemáticas"]
    },
    {
      id: "2",
      title: "Debugging en JavaScript",
      messages: [
        {
          id: "1",
          content: "Tengo un error en mi código JavaScript",
          sender: "user",
          timestamp: "2024-01-14T14:20:00Z",
          type: "text"
        }
      ],
      createdAt: "2024-01-14T14:20:00Z",
      updatedAt: "2024-01-14T15:45:00Z",
      subject: "programación",
      tags: ["javascript", "debugging", "programación"]
    },
    {
      id: "3",
      title: "Análisis de \"Cien años de soledad\"",
      messages: [
        {
          id: "1",
          content: "Necesito analizar esta obra literaria",
          sender: "user",
          timestamp: "2024-01-13T09:15:00Z",
          type: "text"
        }
      ],
      createdAt: "2024-01-13T09:15:00Z",
      updatedAt: "2024-01-13T10:30:00Z",
      subject: "literatura",
      tags: ["literatura", "análisis", "garcía márquez"]
    }
  ]);

  const handleSendMessage = (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: "user",
      timestamp: new Date().toISOString(),
      type: "text"
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Simulate bot response
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Entiendo tu pregunta. Déjame ayudarte con eso...",
        sender: "bot",
        timestamp: new Date().toISOString(),
        type: "text"
      };
      setMessages(prev => [...prev, botMessage]);
    }, 1000);
  };

  const handleLoadSession = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setMessages(session.messages);
      setSelectedSession(sessionId);
      setActiveTab("chat");
    }
  };

  const handlePersonalityChange = (traits: PersonalityTrait[]) => {
    console.log('Personality updated:', traits);
    // Here you would update the bot's personality settings
  };

  const handleActionSelect = (action: QuickAction) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      content: action.prompt,
      sender: "user",
      timestamp: new Date().toISOString(),
      type: "text"
    };
    
    setMessages(prev => [...prev, userMessage]);
    setActiveTab("chat");
    
    // Simulate bot response
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `Perfecto, te ayudo con ${action.title.toLowerCase()}. Por favor, comparte los detalles específicos.`,
        sender: "bot",
        timestamp: new Date().toISOString(),
        type: "text"
      };
      setMessages(prev => [...prev, botMessage]);
    }, 1000);
  };

  const stats = {
    totalChats: 156,
    questionsAnswered: 1247,
    studyHours: 89,
    satisfaction: 4.8
  };

  const tabs = [
    { id: "chat", label: "Chat", icon: MessageSquare },
    { id: "history", label: "Historial", icon: History },
    { id: "quick-actions", label: "Acciones Rápidas", icon: Zap },
    { id: "settings", label: "Configuración", icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl">
              <Bot className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">CruneBot</h1>
              <p className="text-gray-600">Tu asistente de estudio con inteligencia artificial</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <MessageSquare className="h-4 w-4 text-purple-600" />
                  <span className="text-2xl font-bold text-gray-900">{stats.totalChats}</span>
                </div>
                <p className="text-sm text-gray-600">Conversaciones</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Brain className="h-4 w-4 text-blue-600" />
                  <span className="text-2xl font-bold text-gray-900">{stats.questionsAnswered}</span>
                </div>
                <p className="text-sm text-gray-600">Preguntas Respondidas</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-green-600" />
                  <span className="text-2xl font-bold text-gray-900">{stats.studyHours}</span>
                </div>
                <p className="text-sm text-gray-600">Horas de Estudio</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Star className="h-4 w-4 text-yellow-600" />
                  <span className="text-2xl font-bold text-gray-900">{stats.satisfaction}</span>
                </div>
                <p className="text-sm text-gray-600">Satisfacción</p>
              </CardContent>
            </Card>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "default" : "outline"}
                  onClick={() => setActiveTab(tab.id)}
                  className="flex items-center gap-2"
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === "chat" && (
              <ChatInterface
                messages={messages}
                onSendMessage={handleSendMessage}
                isTyping={false}
              />
            )}
            
            {activeTab === "history" && (
              <ChatHistory
                sessions={sessions}
                onLoadSession={handleLoadSession}
                selectedSession={selectedSession}
              />
            )}
            
            {activeTab === "quick-actions" && (
              <QuickActions onActionSelect={handleActionSelect} />
            )}
            
            {activeTab === "settings" && (
              <BotPersonality onPersonalityChange={handlePersonalityChange} />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Estadísticas Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Sesiones hoy</span>
                  <Badge variant="secondary">3</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Tiempo promedio</span>
                  <Badge variant="secondary">25 min</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Tema favorito</span>
                  <Badge variant="secondary">Matemáticas</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Actividad Reciente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { action: "Resolvió ecuación cuadrática", time: "Hace 2 horas" },
                    { action: "Explicó concepto de derivadas", time: "Hace 4 horas" },
                    { action: "Ayudó con código Python", time: "Ayer" }
                  ].map((activity, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">{activity.action}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Consejo del Día
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Usa comandos específicos como \"explica paso a paso\" para obtener respuestas más detalladas.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}