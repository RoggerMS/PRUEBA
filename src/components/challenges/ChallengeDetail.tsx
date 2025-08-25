"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Progress } from "@/src/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { Textarea } from "@/src/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { 
  ArrowLeft, 
  Clock, 
  Users, 
  Trophy, 
  Star, 
  Heart, 
  Share2, 
  Play, 
  Timer, 
  Target, 
  Award, 
  CheckCircle, 
  Calendar, 
  Zap, 
  Crown, 
  Flame, 
  TrendingUp, 
  Send, 
  ThumbsUp, 
  MessageCircle, 
  Eye, 
  Download, 
  BookOpen, 
  Lightbulb, 
  Flag, 
  Medal, 
  Brain, 
  Puzzle
} from "lucide-react";
import { toast } from "sonner";

interface Challenge {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  type: 'daily' | 'weekly' | 'special' | 'community';
  points: number;
  timeLimit?: number;
  participants: number;
  completions: number;
  startDate: string;
  endDate?: string;
  status: 'active' | 'upcoming' | 'completed';
  featured: boolean;
  tags: string[];
  creator: {
    id: string;
    name: string;
    avatar: string;
    level: number;
  };
  rewards: {
    crolars: number;
    xp: number;
    badges?: string[];
  };
  requirements?: string[];
  image?: string;
}

interface ChallengeDetailProps {
  challenge: Challenge;
  onBack: () => void;
}

export function ChallengeDetail({ challenge, onBack }: ChallengeDetailProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  // Mock data
  const participants = [
    {
      id: "1",
      name: "Ana García",
      avatar: "/avatars/user1.png",
      level: 45,
      score: 950,
      completedAt: "2024-01-15T10:30:00Z",
      rank: 1
    },
    {
      id: "2",
      name: "Carlos López",
      avatar: "/avatars/user2.png",
      level: 38,
      score: 890,
      completedAt: "2024-01-15T11:15:00Z",
      rank: 2
    },
    {
      id: "3",
      name: "María Rodríguez",
      avatar: "/avatars/user3.png",
      level: 52,
      score: 875,
      completedAt: "2024-01-15T12:00:00Z",
      rank: 3
    }
  ];

  const questions = [
    {
      id: "1",
      question: "¿Cuál es el resultado de 15 × 8?",
      options: ["120", "125", "130", "115"],
      correct: 0,
      points: 10
    },
    {
      id: "2",
      question: "Resuelve: 3x + 7 = 22",
      options: ["x = 5", "x = 6", "x = 4", "x = 7"],
      correct: 0,
      points: 15
    },
    {
      id: "3",
      question: "¿Cuál es el área de un círculo con radio 5?",
      options: ["25π", "10π", "15π", "20π"],
      correct: 0,
      points: 20
    }
  ];

  const comments = [
    {
      id: "1",
      user: {
        name: "Pedro Martín",
        avatar: "/avatars/user4.png",
        level: 42
      },
      content: "¡Excelente desafío! Me ayudó mucho a practicar álgebra.",
      timestamp: "2024-01-15T14:30:00Z",
      likes: 12,
      replies: 3
    },
    {
      id: "2",
      user: {
        name: "Laura Sánchez",
        avatar: "/avatars/user5.png",
        level: 36
      },
      content: "Las preguntas están muy bien estructuradas. ¿Habrá más desafíos similares?",
      timestamp: "2024-01-15T15:45:00Z",
      likes: 8,
      replies: 1
    }
  ];

  const handleLike = () => {
    setIsLiked(!isLiked);
    toast.success(isLiked ? "Desafío removido de favoritos" : "Desafío agregado a favoritos");
  };

  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/challenges/${challenge.id}`);
    toast.success("Enlace copiado al portapapeles");
  };

  const handleJoin = async () => {
    setIsJoining(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsJoining(false);
    setIsJoined(true);
    toast.success("¡Te has unido al desafío! Puedes comenzar cuando estés listo.");
  };

  const handleSubmitComment = () => {
    if (!newComment.trim()) return;
    
    toast.success("Comentario publicado");
    setNewComment("");
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'principiante': return 'bg-green-100 text-green-800 border-green-200';
      case 'intermedio': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'avanzado': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'experto': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'daily': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'weekly': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'special': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'community': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const completionRate = challenge.participants > 0 ? (challenge.completions / challenge.participants) * 100 : 0;
  const timeRemaining = challenge.endDate ? new Date(challenge.endDate).getTime() - new Date().getTime() : null;
  const daysRemaining = timeRemaining ? Math.ceil(timeRemaining / (1000 * 60 * 60 * 24)) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
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
            {challenge.featured && (
              <Badge className="bg-yellow-500 text-white border-0 flex items-center gap-1">
                <Star className="h-3 w-3" />
                Destacado
              </Badge>
            )}
            <Badge className={`border ${getTypeColor(challenge.type)} flex items-center gap-1`}>
              {challenge.type === 'daily' ? 'Diario' :
               challenge.type === 'weekly' ? 'Semanal' :
               challenge.type === 'special' ? 'Especial' : 'Comunidad'}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Challenge Header */}
            <Card>
              <CardContent className="p-6">
                {challenge.image && (
                  <div className="relative mb-6 rounded-lg overflow-hidden">
                    <img 
                      src={challenge.image} 
                      alt={challenge.title}
                      className="w-full h-64 object-cover"
                    />
                    {daysRemaining && daysRemaining > 0 && (
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-black/70 text-white border-0 flex items-center gap-1">
                          <Timer className="h-3 w-3" />
                          {daysRemaining} día{daysRemaining !== 1 ? 's' : ''} restante{daysRemaining !== 1 ? 's' : ''}
                        </Badge>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{challenge.title}</h1>
                    <p className="text-gray-600 text-lg">{challenge.description}</p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleLike}
                      className={isLiked ? 'text-red-500 border-red-200' : ''}
                    >
                      <Heart className={`h-4 w-4 mr-2 ${isLiked ? 'fill-current' : ''}`} />
                      {isLiked ? 'Favorito' : 'Me gusta'}
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleShare}>
                      <Share2 className="h-4 w-4 mr-2" />
                      Compartir
                    </Button>
                  </div>
                </div>
                
                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  <Badge className={`border ${getDifficultyColor(challenge.difficulty)}`}>
                    {challenge.difficulty.charAt(0).toUpperCase() + challenge.difficulty.slice(1)}
                  </Badge>
                  <Badge variant="outline">{challenge.category}</Badge>
                  {challenge.tags.map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>
                
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <Users className="h-5 w-5 text-gray-600 mx-auto mb-1" />
                    <div className="text-lg font-semibold text-gray-900">{challenge.participants.toLocaleString()}</div>
                    <div className="text-xs text-gray-600">Participantes</div>
                  </div>
                  
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600 mx-auto mb-1" />
                    <div className="text-lg font-semibold text-gray-900">{challenge.completions.toLocaleString()}</div>
                    <div className="text-xs text-gray-600">Completados</div>
                  </div>
                  
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <Trophy className="h-5 w-5 text-yellow-600 mx-auto mb-1" />
                    <div className="text-lg font-semibold text-gray-900">{challenge.points}</div>
                    <div className="text-xs text-gray-600">Puntos</div>
                  </div>
                  
                  {challenge.timeLimit && (
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <Clock className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                      <div className="text-lg font-semibold text-gray-900">{challenge.timeLimit}</div>
                      <div className="text-xs text-gray-600">Minutos</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Resumen</TabsTrigger>
                <TabsTrigger value="questions">Preguntas</TabsTrigger>
                <TabsTrigger value="leaderboard">Clasificación</TabsTrigger>
                <TabsTrigger value="comments">Comentarios</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Requirements */}
                {challenge.requirements && challenge.requirements.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        Requisitos
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {challenge.requirements.map((req, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                            <span className="text-sm text-gray-700">{req}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Creator Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Creador del Desafío
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={challenge.creator.avatar} />
                        <AvatarFallback>{challenge.creator.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-semibold text-gray-900">{challenge.creator.name}</h4>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Badge variant="outline" className="text-xs">
                            Nivel {challenge.creator.level}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Completion Progress */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Progreso de Finalización
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Tasa de Finalización</span>
                        <span className="font-semibold text-gray-900">{completionRate.toFixed(1)}%</span>
                      </div>
                      <Progress value={completionRate} className="h-3" />
                      <div className="text-xs text-gray-500">
                        {challenge.completions} de {challenge.participants} participantes han completado este desafío
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="questions">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5" />
                      Preguntas del Desafío ({questions.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {questions.map((q, index) => (
                        <div key={q.id} className="p-4 border rounded-lg">
                          <div className="flex items-start justify-between mb-3">
                            <h4 className="font-medium text-gray-900">
                              {index + 1}. {q.question}
                            </h4>
                            <Badge variant="outline" className="text-xs">
                              {q.points} pts
                            </Badge>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {q.options.map((option, optIndex) => (
                              <div 
                                key={optIndex} 
                                className="p-2 border rounded text-sm hover:bg-gray-50 cursor-pointer"
                              >
                                {String.fromCharCode(65 + optIndex)}. {option}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="leaderboard">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="h-5 w-5" />
                      Clasificación
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {participants.map((participant) => (
                        <div key={participant.id} className="flex items-center gap-4 p-3 border rounded-lg">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold text-sm">
                            {participant.rank}
                          </div>
                          
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={participant.avatar} />
                            <AvatarFallback>{participant.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{participant.name}</h4>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Badge variant="outline" className="text-xs">
                                Nivel {participant.level}
                              </Badge>
                              <span>•</span>
                              <span>{new Date(participant.completedAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="font-semibold text-gray-900">{participant.score} pts</div>
                            <div className="text-xs text-gray-600">Puntuación</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="comments">
                <div className="space-y-6">
                  {/* Add Comment */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MessageCircle className="h-5 w-5" />
                        Agregar Comentario
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <Textarea
                          placeholder="Comparte tu experiencia con este desafío..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          className="min-h-[100px]"
                        />
                        <Button 
                          onClick={handleSubmitComment}
                          disabled={!newComment.trim()}
                          className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Publicar Comentario
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Comments List */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Comentarios ({comments.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {comments.map((comment) => (
                          <div key={comment.id} className="border-b border-gray-100 pb-4 last:border-0">
                            <div className="flex items-start gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={comment.user.avatar} />
                                <AvatarFallback>{comment.user.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h5 className="font-medium text-gray-900">{comment.user.name}</h5>
                                  <Badge variant="outline" className="text-xs">
                                    Nivel {comment.user.level}
                                  </Badge>
                                  <span className="text-xs text-gray-500">
                                    {new Date(comment.timestamp).toLocaleDateString()}
                                  </span>
                                </div>
                                
                                <p className="text-gray-700 mb-2">{comment.content}</p>
                                
                                <div className="flex items-center gap-4 text-sm">
                                  <button className="flex items-center gap-1 text-gray-600 hover:text-purple-600">
                                    <ThumbsUp className="h-3 w-3" />
                                    {comment.likes}
                                  </button>
                                  <button className="flex items-center gap-1 text-gray-600 hover:text-purple-600">
                                    <MessageCircle className="h-3 w-3" />
                                    {comment.replies} respuestas
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Join Challenge Card */}
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Participar en el Desafío
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Rewards */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Recompensas</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm">Crolars</span>
                      </div>
                      <span className="font-semibold text-yellow-600">+{challenge.rewards.crolars}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-blue-500" />
                        <span className="text-sm">Experiencia</span>
                      </div>
                      <span className="font-semibold text-blue-600">+{challenge.rewards.xp} XP</span>
                    </div>
                    {challenge.rewards.badges && challenge.rewards.badges.length > 0 && (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Award className="h-4 w-4 text-purple-500" />
                          <span className="text-sm">Insignias</span>
                        </div>
                        {challenge.rewards.badges.map((badge, index) => (
                          <Badge key={index} variant="outline" className="text-xs ml-6">
                            {badge}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Button */}
                {!isJoined ? (
                  <Button 
                    className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                    onClick={handleJoin}
                    disabled={isJoining || challenge.status !== 'active'}
                    size="lg"
                  >
                    {isJoining ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Uniéndose...
                      </div>
                    ) : challenge.status === 'active' ? (
                      <div className="flex items-center gap-2">
                        <Play className="h-4 w-4" />
                        Unirse al Desafío
                      </div>
                    ) : challenge.status === 'upcoming' ? (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Próximamente
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        Completado
                      </div>
                    )}
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-center">
                      <CheckCircle className="h-5 w-5 text-green-600 mx-auto mb-1" />
                      <p className="text-sm text-green-800 font-medium">¡Ya estás participando!</p>
                    </div>
                    <Button 
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                      size="lg"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Comenzar Desafío
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}