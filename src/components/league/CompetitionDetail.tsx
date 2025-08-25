"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { Textarea } from "@/src/components/ui/textarea";
import { 
  ArrowLeft,
  Trophy, 
  Users, 
  Calendar, 
  Clock, 
  Star, 
  Heart, 
  Share2, 
  Award, 
  Target,
  Zap,
  CheckCircle,
  XCircle,
  AlertCircle,
  MapPin,
  BookOpen,
  Send,
  Medal,
  Crown,
  Flame,
  TrendingUp,
  User,
  MessageCircle
} from "lucide-react";

interface Competition {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  difficulty: string;
  participants: number;
  maxParticipants: number;
  startDate: string;
  endDate: string;
  duration: string;
  prize: number;
  status: string;
  isJoined: boolean;
  isFeatured: boolean;
  organizer: string;
  organizerAvatar: string;
  tags: string[];
  requirements: string[];
  rules: string[];
}

interface CompetitionDetailProps {
  competition: Competition;
  onBack: () => void;
}

export function CompetitionDetail({ competition, onBack }: CompetitionDetailProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [isJoined, setIsJoined] = useState(competition.isJoined);
  const [newComment, setNewComment] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  // Mock data for participants
  const mockParticipants = [
    {
      id: "1",
      name: "Ana García",
      avatar: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20student%20avatar%20female%20smiling&image_size=square",
      score: 2450,
      rank: 1,
      level: "Experto",
      streak: 15
    },
    {
      id: "2",
      name: "Carlos López",
      avatar: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20student%20avatar%20male%20confident&image_size=square",
      score: 2380,
      rank: 2,
      level: "Avanzado",
      streak: 12
    },
    {
      id: "3",
      name: "María Rodríguez",
      avatar: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20student%20avatar%20female%20focused&image_size=square",
      score: 2290,
      rank: 3,
      level: "Avanzado",
      streak: 8
    }
  ];

  // Mock data for leaderboard
  const mockLeaderboard = [
    {
      id: "1",
      name: "Ana García",
      avatar: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20student%20avatar%20female%20smiling&image_size=square",
      score: 2450,
      rank: 1,
      change: "+2",
      completedChallenges: 15,
      accuracy: 94
    },
    {
      id: "2",
      name: "Carlos López",
      avatar: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20student%20avatar%20male%20confident&image_size=square",
      score: 2380,
      rank: 2,
      change: "-1",
      completedChallenges: 14,
      accuracy: 91
    },
    {
      id: "3",
      name: "María Rodríguez",
      avatar: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20student%20avatar%20female%20focused&image_size=square",
      score: 2290,
      rank: 3,
      change: "+1",
      completedChallenges: 13,
      accuracy: 89
    }
  ];

  // Mock data for challenges
  const mockChallenges = [
    {
      id: "1",
      title: "Ecuaciones Cuadráticas",
      description: "Resuelve 10 ecuaciones cuadráticas en tiempo límite",
      difficulty: "Intermedio",
      points: 150,
      timeLimit: "30 min",
      completed: true,
      score: 140
    },
    {
      id: "2",
      title: "Geometría Analítica",
      description: "Problemas de distancias y puntos en el plano",
      difficulty: "Avanzado",
      points: 200,
      timeLimit: "45 min",
      completed: false,
      score: null
    },
    {
      id: "3",
      title: "Trigonometría",
      description: "Identidades y funciones trigonométricas",
      difficulty: "Experto",
      points: 250,
      timeLimit: "60 min",
      completed: false,
      score: null
    }
  ];

  // Mock data for comments
  const mockComments = [
    {
      id: "1",
      user: "Ana García",
      avatar: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20student%20avatar%20female%20smiling&image_size=square",
      content: "¡Excelente competencia! Los desafíos están muy bien diseñados.",
      timestamp: "2024-01-15T10:30:00Z",
      likes: 12
    },
    {
      id: "2",
      user: "Carlos López",
      avatar: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20student%20avatar%20male%20confident&image_size=square",
      content: "¿Alguien tiene tips para el desafío de geometría analítica?",
      timestamp: "2024-01-15T09:15:00Z",
      likes: 5
    }
  ];

  const handleLike = () => {
    setIsLiked(!isLiked);
  };

  const handleShare = () => {
    navigator.share?.({
      title: competition.title,
      text: competition.description,
      url: window.location.href
    }).catch(() => {
      navigator.clipboard.writeText(window.location.href);
    });
  };

  const handleJoin = async () => {
    setIsJoining(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsJoined(true);
    setIsJoining(false);
  };

  const handleCommentSubmit = () => {
    if (newComment.trim()) {
      // Handle comment submission
      setNewComment("");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'upcoming':
        return 'bg-blue-100 text-blue-700';
      case 'completed':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Zap className="h-4 w-4" />;
      case 'upcoming':
        return <Clock className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'En curso';
      case 'upcoming':
        return 'Próximamente';
      case 'completed':
        return 'Finalizada';
      default:
        return 'Desconocido';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'principiante':
        return 'bg-green-100 text-green-700';
      case 'intermedio':
        return 'bg-yellow-100 text-yellow-700';
      case 'avanzado':
        return 'bg-orange-100 text-orange-700';
      case 'experto':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'matemáticas':
        return 'bg-purple-100 text-purple-700';
      case 'programación':
        return 'bg-blue-100 text-blue-700';
      case 'ciencias':
        return 'bg-green-100 text-green-700';
      case 'historia':
        return 'bg-amber-100 text-amber-700';
      case 'idiomas':
        return 'bg-pink-100 text-pink-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const participationPercentage = (competition.participants / competition.maxParticipants) * 100;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="sm"
          onClick={onBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Button>
        
        <div className="flex items-center gap-2">
          {competition.isFeatured && (
            <Badge className="bg-yellow-500 text-white">
              <Star className="h-3 w-3 mr-1" />
              Destacada
            </Badge>
          )}
          
          <Badge className={getStatusColor(competition.status)}>
            {getStatusIcon(competition.status)}
            {getStatusText(competition.status)}
          </Badge>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Hero Section */}
          <Card className="overflow-hidden">
            <div className="aspect-video w-full overflow-hidden">
              <img 
                src={competition.image} 
                alt={competition.title}
                className="w-full h-full object-cover"
              />
            </div>
            
            <CardContent className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {competition.title}
                  </h1>
                  <p className="text-gray-600">
                    {competition.description}
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLike}
                  >
                    <Heart className={`h-4 w-4 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShare}
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                <Badge className={getCategoryColor(competition.category)}>
                  {competition.category}
                </Badge>
                <Badge className={getDifficultyColor(competition.difficulty)}>
                  {competition.difficulty}
                </Badge>
                {competition.tags.map(tag => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
                    <Users className="h-4 w-4" />
                  </div>
                  <div className="text-lg font-semibold text-gray-900">
                    {competition.participants}
                  </div>
                  <div className="text-xs text-gray-500">Participantes</div>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div className="text-lg font-semibold text-gray-900">
                    {competition.duration}
                  </div>
                  <div className="text-xs text-gray-500">Duración</div>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
                    <Trophy className="h-4 w-4" />
                  </div>
                  <div className="text-lg font-semibold text-gray-900">
                    {competition.prize}
                  </div>
                  <div className="text-xs text-gray-500">Crolars</div>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
                    <Target className="h-4 w-4" />
                  </div>
                  <div className="text-lg font-semibold text-gray-900">
                    {Math.round(participationPercentage)}%
                  </div>
                  <div className="text-xs text-gray-500">Ocupación</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Información</TabsTrigger>
              <TabsTrigger value="challenges">Desafíos</TabsTrigger>
              <TabsTrigger value="leaderboard">Ranking</TabsTrigger>
              <TabsTrigger value="comments">Comentarios</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              {/* Requirements */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Requisitos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {competition.requirements.map((req, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{req}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Rules */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Reglas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {competition.rules.map((rule, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-4 h-4 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-semibold mt-0.5 flex-shrink-0">
                          {index + 1}
                        </div>
                        <span className="text-sm text-gray-700">{rule}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="challenges" className="space-y-4">
              {mockChallenges.map(challenge => (
                <Card key={challenge.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">
                            {challenge.title}
                          </h3>
                          {challenge.completed && (
                            <Badge className="bg-green-100 text-green-700">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Completado
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          {challenge.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Target className="h-4 w-4" />
                            {challenge.points} puntos
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {challenge.timeLimit}
                          </span>
                          <Badge className={getDifficultyColor(challenge.difficulty)}>
                            {challenge.difficulty}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        {challenge.completed ? (
                          <div className="space-y-1">
                            <div className="text-lg font-semibold text-green-600">
                              {challenge.score}/{challenge.points}
                            </div>
                            <div className="text-xs text-gray-500">Puntuación</div>
                          </div>
                        ) : (
                          <Button size="sm">
                            Comenzar
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
            
            <TabsContent value="leaderboard" className="space-y-4">
              {mockLeaderboard.map((participant, index) => (
                <Card key={participant.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      {/* Rank */}
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold">
                        {index === 0 && <Crown className="h-5 w-5" />}
                        {index === 1 && <Medal className="h-5 w-5" />}
                        {index === 2 && <Award className="h-5 w-5" />}
                        {index > 2 && participant.rank}
                      </div>
                      
                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-full overflow-hidden">
                        <img 
                          src={participant.avatar} 
                          alt={participant.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      {/* Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">
                            {participant.name}
                          </h3>
                          <Badge 
                            className={`text-xs ${
                              participant.change.startsWith('+') ? 'bg-green-100 text-green-700' : 
                              participant.change.startsWith('-') ? 'bg-red-100 text-red-700' : 
                              'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {participant.change}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>{participant.completedChallenges} desafíos</span>
                          <span>{participant.accuracy}% precisión</span>
                        </div>
                      </div>
                      
                      {/* Score */}
                      <div className="text-right">
                        <div className="text-lg font-semibold text-gray-900">
                          {participant.score.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">puntos</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
            
            <TabsContent value="comments" className="space-y-4">
              {/* Comment Form */}
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <Textarea
                      placeholder="Escribe un comentario..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="min-h-[80px]"
                    />
                    <div className="flex justify-end">
                      <Button 
                        size="sm"
                        onClick={handleCommentSubmit}
                        disabled={!newComment.trim()}
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Comentar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Comments List */}
              {mockComments.map(comment => (
                <Card key={comment.id}>
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden">
                        <img 
                          src={comment.avatar} 
                          alt={comment.user}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-gray-900">
                            {comment.user}
                          </h4>
                          <span className="text-xs text-gray-500">
                            {new Date(comment.timestamp).toLocaleDateString('es-ES')}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-700">
                          {comment.content}
                        </p>
                        
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" className="h-8 px-2">
                            <Heart className="h-3 w-3 mr-1" />
                            {comment.likes}
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 px-2">
                            <MessageCircle className="h-3 w-3 mr-1" />
                            Responder
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Join/Status Card */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="text-center space-y-3">
                {isJoined ? (
                  <>
                    <Badge className="bg-green-100 text-green-700 text-sm px-3 py-1">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Participando
                    </Badge>
                    <p className="text-sm text-gray-600">
                      ¡Ya estás participando en esta competencia!
                    </p>
                    <Button className="w-full" variant="outline">
                      <Target className="h-4 w-4 mr-2" />
                      Ver Mi Progreso
                    </Button>
                  </>
                ) : competition.status === 'completed' ? (
                  <>
                    <Badge className="bg-gray-100 text-gray-700 text-sm px-3 py-1">
                      <XCircle className="h-4 w-4 mr-2" />
                      Finalizada
                    </Badge>
                    <p className="text-sm text-gray-600">
                      Esta competencia ya ha finalizado.
                    </p>
                    <Button className="w-full" variant="outline">
                      Ver Resultados
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="text-2xl font-bold text-purple-600">
                      {competition.prize} Crolars
                    </div>
                    <p className="text-sm text-gray-600">
                      Premio para el ganador
                    </p>
                    <Button 
                      className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                      onClick={handleJoin}
                      disabled={isJoining}
                    >
                      {isJoining ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Uniéndose...
                        </div>
                      ) : (
                        <>
                          <Award className="h-4 w-4 mr-2" />
                          Participar Ahora
                        </>
                      )}
                    </Button>
                  </>
                )}
              </div>
              
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Participación</span>
                  <span className="font-medium">
                    {competition.participants}/{competition.maxParticipants}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(participationPercentage, 100)}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Schedule Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Cronograma
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-gray-600">Inicio:</span>
                </div>
                <div className="ml-4 text-sm font-medium">
                  {formatDate(competition.startDate)}
                </div>
                <div className="ml-4 text-xs text-gray-500">
                  {formatTime(competition.startDate)}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  <span className="text-gray-600">Final:</span>
                </div>
                <div className="ml-4 text-sm font-medium">
                  {formatDate(competition.endDate)}
                </div>
                <div className="ml-4 text-xs text-gray-500">
                  {formatTime(competition.endDate)}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Organizer Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Organizador
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden">
                  <img 
                    src={competition.organizerAvatar} 
                    alt={competition.organizer}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">
                    {competition.organizer}
                  </h4>
                  <p className="text-sm text-gray-600">Organizador</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Top Participants */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Top Participantes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockParticipants.slice(0, 3).map((participant, index) => (
                <div key={participant.id} className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    index === 0 ? 'bg-yellow-500 text-white' :
                    index === 1 ? 'bg-gray-400 text-white' :
                    'bg-orange-500 text-white'
                  }`}>
                    {index + 1}
                  </div>
                  
                  <div className="w-8 h-8 rounded-full overflow-hidden">
                    <img 
                      src={participant.avatar} 
                      alt={participant.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {participant.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {participant.score.toLocaleString()} pts
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Flame className="h-3 w-3 text-orange-500" />
                    <span className="text-xs text-gray-600">
                      {participant.streak}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}