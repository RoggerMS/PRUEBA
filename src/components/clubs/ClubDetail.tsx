"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  ArrowLeft, 
  Users, 
  Calendar, 
  MessageCircle, 
  Share2, 
  Settings,
  UserPlus,
  UserCheck,
  Crown,
  Star,
  Trophy,
  Send,
  Image,
  FileText,
  Video,
  Link
} from "lucide-react";

interface Club {
  id: string;
  name: string;
  description: string;
  category: string;
  subject: string;
  memberCount: number;
  isPrivate: boolean;
  image: string;
  owner: {
    id: string;
    name: string;
    avatar: string;
    role: string;
  };
  tags: string[] | string;
  level: string;
  createdAt: string;
  lastActivity: string;
  isJoined: boolean;
  achievements: Array<{
    name: string;
    icon: string;
  }>;
}

interface ClubDetailProps {
  club: Club;
  onBack: () => void;
}

// Mock data for club details
const mockMembers = [
  {
    id: "1",
    name: "Ana García",
    avatar: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=student%20girl%20portrait%20friendly%20smile&image_size=square",
    role: "Administrador",
    joinedAt: "2024-01-15",
    isOwner: true
  },
  {
    id: "2",
    name: "Carlos Mendez",
    avatar: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=student%20boy%20portrait%20confident&image_size=square",
    role: "Moderador",
    joinedAt: "2024-01-16",
    isOwner: false
  },
  {
    id: "3",
    name: "María Torres",
    avatar: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=student%20girl%20portrait%20smart&image_size=square",
    role: "Miembro",
    joinedAt: "2024-01-17",
    isOwner: false
  }
];

const mockPosts = [
  {
    id: "1",
    author: {
      name: "Ana García",
      avatar: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=student%20girl%20portrait%20friendly%20smile&image_size=square",
      role: "Administrador"
    },
    content: "¡Bienvenidos al club de Matemáticas Avanzadas! Aquí compartiremos recursos, resolveremos problemas juntos y nos prepararemos para competencias.",
    timestamp: "2024-01-20T10:30:00Z",
    likes: 12,
    comments: 5,
    type: "text"
  },
  {
    id: "2",
    author: {
      name: "Carlos Mendez",
      avatar: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=student%20boy%20portrait%20confident&image_size=square",
      role: "Moderador"
    },
    content: "Compartiendo algunos ejercicios de cálculo diferencial para practicar esta semana.",
    timestamp: "2024-01-19T15:45:00Z",
    likes: 8,
    comments: 3,
    type: "file",
    attachment: {
      name: "ejercicios-calculo.pdf",
      type: "pdf"
    }
  }
];

const mockEvents = [
  {
    id: "1",
    title: "Sesión de Estudio: Límites y Continuidad",
    date: "2024-01-25",
    time: "16:00",
    location: "Aula 205",
    attendees: 15
  },
  {
    id: "2",
    title: "Competencia Interna de Matemáticas",
    date: "2024-01-30",
    time: "14:00",
    location: "Auditorio Principal",
    attendees: 25
  }
];

export function ClubDetail({ club, onBack }: ClubDetailProps) {
  const [isJoined, setIsJoined] = useState(club.isJoined);
  const [isJoining, setIsJoining] = useState(false);
  const [newPost, setNewPost] = useState("");
  const [activeTab, setActiveTab] = useState("feed");

  const handleJoin = async () => {
    setIsJoining(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsJoined(!isJoined);
    setIsJoining(false);
  };

  const handlePostSubmit = () => {
    if (newPost.trim()) {
      // Handle post submission
      setNewPost("");
    }
  };

  // Normalize tags to always work with an array
  const tags = Array.isArray(club.tags)
    ? club.tags
    : typeof club.tags === 'string'
      ? club.tags.split(',').map(tag => tag.trim())
      : [];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Académico":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "Extracurricular":
        return "bg-green-100 text-green-700 border-green-200";
      case "Deportivo":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "Arte":
        return "bg-pink-100 text-pink-700 border-pink-200";
      case "Tecnología":
        return "bg-purple-100 text-purple-700 border-purple-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onBack}
            className="hover:bg-white/50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div className="flex-1" />
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Compartir
          </Button>
          {isJoined && (
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Configuración
            </Button>
          )}
        </div>

        {/* Club Header */}
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg overflow-hidden">
          <div className="relative h-64">
            <img 
              src={club.image} 
              alt={club.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            
            <div className="absolute bottom-6 left-6 right-6">
              <div className="flex items-end justify-between">
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Badge className={getCategoryColor(club.category)}>
                      {club.category}
                    </Badge>
                    <Badge variant="secondary" className="bg-white/90 text-gray-700">
                      {club.level}
                    </Badge>
                  </div>
                  <h1 className="text-3xl font-bold text-white">{club.name}</h1>
                  <p className="text-white/90 max-w-2xl">{club.description}</p>
                </div>
                
                <div className="text-right">
                  {isJoined ? (
                    <Button 
                      variant="outline" 
                      className="bg-white/90 text-gray-800 hover:bg-white"
                      onClick={handleJoin}
                      disabled={isJoining}
                    >
                      <UserCheck className="h-4 w-4 mr-2" />
                      Miembro
                    </Button>
                  ) : (
                    <Button 
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                      onClick={handleJoin}
                      disabled={isJoining}
                    >
                      {isJoining ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Uniéndose...
                        </div>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Unirse al Club
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-600" />
                <div>
                  <div className="font-semibold">{club.memberCount}</div>
                  <div className="text-sm text-gray-600">Miembros</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="font-semibold">{new Date(club.createdAt).toLocaleDateString()}</div>
                  <div className="text-sm text-gray-600">Creado</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-600" />
                <div>
                  <div className="font-semibold">{club.achievements.length}</div>
                  <div className="text-sm text-gray-600">Logros</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-green-600" />
                <div>
                  <div className="font-semibold">4.8</div>
                  <div className="text-sm text-gray-600">Valoración</div>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mt-4">
              {tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="bg-gray-50">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-white/80 backdrop-blur-sm">
                <TabsTrigger value="feed">Feed</TabsTrigger>
                <TabsTrigger value="events">Eventos</TabsTrigger>
                <TabsTrigger value="resources">Recursos</TabsTrigger>
              </TabsList>

              <TabsContent value="feed" className="space-y-4">
                {/* New Post */}
                {isJoined && (
                  <Card className="bg-white/90 backdrop-blur-sm">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <Textarea
                          placeholder="Comparte algo con el club..."
                          value={newPost}
                          onChange={(e) => setNewPost(e.target.value)}
                          className="min-h-[80px]"
                        />
                        <div className="flex justify-between items-center">
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm">
                              <Image className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <FileText className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Video className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Link className="h-4 w-4" />
                            </Button>
                          </div>
                          <Button 
                            onClick={handlePostSubmit}
                            disabled={!newPost.trim()}
                            className="bg-gradient-to-r from-purple-600 to-blue-600"
                          >
                            <Send className="h-4 w-4 mr-2" />
                            Publicar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Posts */}
                {mockPosts.map(post => (
                  <Card key={post.id} className="bg-white/90 backdrop-blur-sm">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Avatar>
                          <AvatarImage src={post.author.avatar} alt={post.author.name} />
                          <AvatarFallback>
                            {post.author.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold">{post.author.name}</span>
                            <Badge variant="secondary" className="text-xs">{post.author.role}</Badge>
                            <span className="text-sm text-gray-500">
                              {new Date(post.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-gray-700 mb-3">{post.content}</p>
                          
                          {post.attachment && (
                            <div className="bg-gray-50 rounded-lg p-3 mb-3">
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-gray-600" />
                                <span className="text-sm font-medium">{post.attachment.name}</span>
                              </div>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <button className="flex items-center gap-1 hover:text-purple-600">
                              <Star className="h-4 w-4" />
                              {post.likes}
                            </button>
                            <button className="flex items-center gap-1 hover:text-blue-600">
                              <MessageCircle className="h-4 w-4" />
                              {post.comments}
                            </button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="events" className="space-y-4">
                {mockEvents.map(event => (
                  <Card key={event.id} className="bg-white/90 backdrop-blur-sm">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg">{event.title}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                            <span>{new Date(event.startDate).toLocaleDateString('es-ES')} - {new Date(event.startDate).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
                            <span>{event.location}</span>
                            <span>{event.currentAttendees} asistentes</span>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          Asistir
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="resources">
                <Card className="bg-white/90 backdrop-blur-sm">
                  <CardContent className="p-6 text-center">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Recursos del Club</h3>
                    <p className="text-gray-600">Los recursos compartidos aparecerán aquí.</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Owner Info */}
            <Card className="bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Crown className="h-5 w-5 text-yellow-600" />
                  Administrador
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={club.owner.avatar} alt={club.owner.name} />
                    <AvatarFallback>
                      {club.owner.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold">{club.owner.name}</div>
                    <div className="text-sm text-gray-600">{club.owner.role}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Members */}
            <Card className="bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-purple-600" />
                    Miembros
                  </span>
                  <Badge variant="secondary">{mockMembers.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {mockMembers.map(member => (
                  <div key={member.id} className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={member.avatar} alt={member.name} />
                      <AvatarFallback className="text-xs">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{member.name}</div>
                      <div className="text-xs text-gray-600">{member.role}</div>
                    </div>
                    {member.isOwner && (
                      <Crown className="h-4 w-4 text-yellow-600" />
                    )}
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full mt-3">
                  Ver todos los miembros
                </Button>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card className="bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-600" />
                  Logros
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {club.achievements.map((achievement, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                    <span className="text-lg">{achievement.icon}</span>
                    <span className="text-sm font-medium">{achievement.name}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
