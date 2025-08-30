"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  Trophy, 
  Users, 
  Clock, 
  Star, 
  Calendar,
  Award,
  Target,
  Zap,
  CheckCircle,
  Play,
  Share2,
  Bookmark,
  Flag,
  Medal,
  TrendingUp,
  BookOpen,
  Timer,
  Crown,
  Gift
} from "lucide-react";
import { toast } from "sonner";

interface Competition {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  status: string;
  startDate: Date;
  endDate: Date;
  participants: number;
  maxParticipants: number;
  prize: number;
  image: string;
  organizer: {
    name: string;
    avatar: string;
    level: string;
    points: number;
  };
  tags: string[];
  isJoined: boolean;
  progress?: number;
  rules: string[];
  requirements: string[];
  prizes: {
    position: number;
    reward: number;
    badge?: string;
  }[];
}

interface Participant {
  id: string;
  name: string;
  avatar: string;
  level: string;
  points: number;
  score: number;
  position: number;
  progress: number;
}

interface CompetitionDetailProps {
  competition: Competition;
  onBack: () => void;
  onJoin?: () => void;
}

export function CompetitionDetail({ competition, onBack, onJoin }: CompetitionDetailProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Mock leaderboard data
  const [leaderboard] = useState<Participant[]>([
    {
      id: "1",
      name: "Ana García",
      avatar: "/avatars/ana.jpg",
      level: "Experto",
      points: 4520,
      score: 2850,
      position: 1,
      progress: 95
    },
    {
      id: "2",
      name: "Carlos López",
      avatar: "/avatars/carlos.jpg",
      level: "Avanzado",
      points: 3210,
      score: 2720,
      position: 2,
      progress: 88
    },
    {
      id: "3",
      name: "María Rodríguez",
      avatar: "/avatars/maria.jpg",
      level: "Avanzado",
      points: 2890,
      score: 2650,
      position: 3,
      progress: 92
    },
    {
      id: "4",
      name: "Usuario Actual",
      avatar: "/avatars/current.jpg",
      level: "Intermedio",
      points: 1250,
      score: 1850,
      position: 15,
      progress: 65
    }
  ]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeRemaining = () => {
    const now = new Date();
    const target = competition.status === 'upcoming' ? competition.startDate : competition.endDate;
    const diffInMs = target.getTime() - now.getTime();
    const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
    const diffInHours = Math.ceil(diffInMs / (1000 * 60 * 60));
    
    if (diffInMs < 0) return null;
    if (diffInDays === 0) {
      if (diffInHours <= 1) return 'Menos de 1 hora';
      return `${diffInHours} horas`;
    }
    if (diffInDays === 1) return '1 día';
    return `${diffInDays} días`;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Matemáticas': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Ciencias': return 'bg-green-100 text-green-800 border-green-200';
      case 'Programación': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Idiomas': return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'Historia': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Arte': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Principiante': return 'bg-green-100 text-green-800';
      case 'Intermedio': return 'bg-yellow-100 text-yellow-800';
      case 'Avanzado': return 'bg-orange-100 text-orange-800';
      case 'Experto': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'upcoming': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ended': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'En curso';
      case 'upcoming': return 'Próximamente';
      case 'ended': return 'Finalizada';
      default: return status;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Principiante': return 'text-green-600';
      case 'Intermedio': return 'text-yellow-600';
      case 'Avanzado': return 'text-orange-600';
      case 'Experto': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1: return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2: return <Medal className="h-5 w-5 text-gray-400" />;
      case 3: return <Medal className="h-5 w-5 text-amber-600" />;
      default: return <span className="text-lg font-bold text-gray-600">#{position}</span>;
    }
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    toast.success(isBookmarked ? "Competencia removida de favoritos" : "Competencia guardada en favoritos");
  };

  const handleJoin = () => {
    onJoin?.();
    toast.success("¡Te has unido a la competencia!");
  };

  const timeRemaining = getTimeRemaining();
  const participationPercentage = (competition.participants / competition.maxParticipants) * 100;
  const currentUser = leaderboard.find(p => p.name === "Usuario Actual");

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Back button */}
      <Button variant="ghost" onClick={onBack} className="mb-4">
        ← Volver a la liga
      </Button>

      {/* Header */}
      <div className="relative h-64 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg overflow-hidden">
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute inset-0 p-8 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex gap-3">
              <Badge className={`${getStatusColor(competition.status)}`}>
                {getStatusText(competition.status)}
              </Badge>
              {competition.status === 'active' && timeRemaining && (
                <Badge variant="secondary" className="bg-white/90 text-gray-800">
                  <Clock className="h-4 w-4 mr-1" />
                  {timeRemaining} restantes
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={handleBookmark} className="text-white hover:bg-white/20">
                <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
              </Button>
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                <Share2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                <Flag className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {competition.title}
            </h1>
            <div className="flex items-center gap-4 text-white/90">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8 border-2 border-white">
                  <AvatarImage src={competition.organizer.avatar} alt={competition.organizer.name} />
                  <AvatarFallback>
                    {competition.organizer.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium">{competition.organizer.name}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{competition.participants} participantes</span>
              </div>
              {competition.prize > 0 && (
                <div className="flex items-center gap-1">
                  <Trophy className="h-4 w-4" />
                  <span>{competition.prize} Crolars</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Badge className={`${getCategoryColor(competition.category)}`}>
            {competition.category}
          </Badge>
          <Badge className={`${getDifficultyColor(competition.difficulty)}`}>
            <Target className="h-3 w-3 mr-1" />
            {competition.difficulty}
          </Badge>
          {competition.tags.map(tag => (
            <Badge key={tag} variant="outline">
              #{tag}
            </Badge>
          ))}
        </div>
        
        <div className="flex items-center gap-3">
          {competition.isJoined ? (
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Participando
              </Badge>
              {competition.status === 'active' && (
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Play className="h-4 w-4 mr-2" />
                  Continuar
                </Button>
              )}
            </div>
          ) : competition.status === 'ended' ? (
            <Button variant="outline">
              Ver Resultados
            </Button>
          ) : competition.participants >= competition.maxParticipants ? (
            <Button variant="outline" disabled>
              Completa
            </Button>
          ) : (
            <Button onClick={handleJoin} className="bg-purple-600 hover:bg-purple-700">
              <Zap className="h-4 w-4 mr-2" />
              Unirse a la Competencia
            </Button>
          )}
        </div>
      </div>

      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="leaderboard">Clasificación</TabsTrigger>
          <TabsTrigger value="rules">Reglas</TabsTrigger>
          <TabsTrigger value="prizes">Premios</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Descripción
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">
                    {competition.description}
                  </p>
                </CardContent>
              </Card>

              {competition.isJoined && currentUser && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Tu Progreso
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-purple-600">
                          #{currentUser.position}
                        </p>
                        <p className="text-sm text-gray-600">Posición actual</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">
                          {currentUser.score}
                        </p>
                        <p className="text-sm text-gray-600">Puntos</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Progreso</span>
                        <span className="font-medium">{currentUser.progress}%</span>
                      </div>
                      <Progress value={currentUser.progress} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Estadísticas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="h-4 w-4" />
                      <span>Participantes</span>
                    </div>
                    <span className="font-medium">
                      {competition.participants}/{competition.maxParticipants}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <Progress value={participationPercentage} className="h-2" />
                    <p className="text-xs text-gray-500 text-center">
                      {Math.round(participationPercentage)}% completo
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>Inicio</span>
                    </div>
                    <span className="text-sm font-medium">
                      {formatDate(competition.startDate)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Timer className="h-4 w-4" />
                      <span>Fin</span>
                    </div>
                    <span className="text-sm font-medium">
                      {formatDate(competition.endDate)}
                    </span>
                  </div>
                  
                  {competition.prize > 0 && (
                    <>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Gift className="h-4 w-4" />
                          <span>Premio Total</span>
                        </div>
                        <span className="font-bold text-yellow-600">
                          {competition.prize} Crolars
                        </span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Organizer */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Organizador</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={competition.organizer.avatar} alt={competition.organizer.name} />
                      <AvatarFallback>
                        {competition.organizer.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-gray-900">
                        {competition.organizer.name}
                      </p>
                      <div className="flex items-center gap-2 text-sm">
                        <span className={`font-medium ${getLevelColor(competition.organizer.level)}`}>
                          {competition.organizer.level}
                        </span>
                        <span className="text-gray-500">•</span>
                        <div className="flex items-center gap-1 text-gray-500">
                          <Award className="h-3 w-3" />
                          <span>{competition.organizer.points} pts</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Clasificación
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {leaderboard.map((participant, index) => (
                  <div 
                    key={participant.id} 
                    className={`flex items-center gap-4 p-4 rounded-lg border ${
                      participant.name === "Usuario Actual" 
                        ? 'bg-purple-50 border-purple-200' 
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-center w-12">
                      {getPositionIcon(participant.position)}
                    </div>
                    
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={participant.avatar} alt={participant.name} />
                      <AvatarFallback>
                        {participant.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900">
                          {participant.name}
                        </p>
                        {participant.name === "Usuario Actual" && (
                          <Badge variant="secondary" className="text-xs">
                            Tú
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className={`font-medium ${getLevelColor(participant.level)}`}>
                          {participant.level}
                        </span>
                        <span className="text-gray-500">•</span>
                        <span className="text-gray-500">{participant.progress}% completado</span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        {participant.score}
                      </p>
                      <p className="text-sm text-gray-600">puntos</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Reglas de la Competencia</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {competition.rules.map((rule, index) => (
                  <div key={index} className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>
                    <p className="text-gray-700">{rule}</p>
                  </div>
                ))}
              </div>
              
              <Separator className="my-6" />
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Requisitos</h4>
                <div className="space-y-2">
                  {competition.requirements.map((req, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-gray-700">{req}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prizes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5" />
                Premios y Recompensas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {competition.prizes.map((prize) => (
                  <div key={prize.position} className="flex items-center gap-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                    <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-full">
                      {getPositionIcon(prize.position)}
                    </div>
                    
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">
                        {prize.position === 1 ? 'Primer Lugar' : 
                         prize.position === 2 ? 'Segundo Lugar' : 
                         prize.position === 3 ? 'Tercer Lugar' : 
                         `Posición ${prize.position}`}
                      </p>
                      {prize.badge && (
                        <p className="text-sm text-gray-600">
                          Insignia especial: {prize.badge}
                        </p>
                      )}
                    </div>
                    
                    <div className="text-right">
                      <p className="text-xl font-bold text-yellow-600">
                        {prize.reward} Crolars
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}