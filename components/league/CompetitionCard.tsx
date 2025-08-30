"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { 
  Trophy, 
  Users, 
  Clock, 
  Star, 
  Calendar,
  Award,
  Target,
  Zap,
  TrendingUp,
  CheckCircle,
  Play
} from "lucide-react";

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
  };
  tags: string[];
  isJoined: boolean;
  progress?: number;
}

interface CompetitionCardProps {
  competition: Competition;
  onClick: () => void;
  onJoin?: () => void;
}

export function CompetitionCard({ competition, onClick, onJoin }: CompetitionCardProps) {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getTimeRemaining = () => {
    const now = new Date();
    const target = competition.status === 'upcoming' ? competition.startDate : competition.endDate;
    const diffInMs = target.getTime() - now.getTime();
    const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays < 0) return null;
    if (diffInDays === 0) return 'Hoy';
    if (diffInDays === 1) return 'Mañana';
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

  const timeRemaining = getTimeRemaining();
  const participationPercentage = (competition.participants / competition.maxParticipants) * 100;

  return (
    <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 bg-white border border-gray-200 hover:border-purple-300 overflow-hidden">
      {/* Header Image */}
      <div className="relative h-48 bg-gradient-to-br from-purple-500 to-blue-600">
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute top-4 left-4 right-4 flex items-start justify-between">
          <div className="flex gap-2">
            <Badge className={`text-xs ${getStatusColor(competition.status)}`}>
              {getStatusText(competition.status)}
            </Badge>
            {competition.status === 'active' && timeRemaining && (
              <Badge variant="secondary" className="text-xs bg-white/90 text-gray-800">
                <Clock className="h-3 w-3 mr-1" />
                {timeRemaining}
              </Badge>
            )}
          </div>
          
          {competition.prize > 0 && (
            <Badge className="text-xs bg-yellow-100 text-yellow-800 border-yellow-200">
              <Trophy className="h-3 w-3 mr-1" />
              {competition.prize} Crolars
            </Badge>
          )}
        </div>
        
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">
            {competition.title}
          </h3>
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6 border-2 border-white">
              <AvatarImage src={competition.organizer.avatar} alt={competition.organizer.name} />
              <AvatarFallback className="text-xs">
                {competition.organizer.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <span className="text-white/90 text-sm font-medium">
              {competition.organizer.name}
            </span>
          </div>
        </div>
      </div>

      <CardContent className="p-6" onClick={onClick}>
        <div className="space-y-4">
          {/* Description */}
          <p className="text-gray-600 text-sm line-clamp-2">
            {competition.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            <Badge className={`text-xs ${getCategoryColor(competition.category)}`}>
              {competition.category}
            </Badge>
            <Badge className={`text-xs ${getDifficultyColor(competition.difficulty)}`}>
              <Target className="h-3 w-3 mr-1" />
              {competition.difficulty}
            </Badge>
            {competition.tags.slice(0, 2).map(tag => (
              <Badge key={tag} variant="outline" className="text-xs">
                #{tag}
              </Badge>
            ))}
            {competition.tags.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{competition.tags.length - 2}
              </Badge>
            )}
          </div>

          {/* Progress (if joined) */}
          {competition.isJoined && competition.progress !== undefined && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Tu progreso</span>
                <span className="font-medium text-purple-600">{competition.progress}%</span>
              </div>
              <Progress value={competition.progress} className="h-2" />
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Users className="h-4 w-4" />
              <span>{competition.participants}/{competition.maxParticipants}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(competition.endDate)}</span>
            </div>
          </div>

          {/* Participation Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Participación</span>
              <span>{Math.round(participationPercentage)}%</span>
            </div>
            <Progress value={participationPercentage} className="h-1" />
          </div>

          {/* Action Button */}
          <div className="pt-2">
            {competition.isJoined ? (
              <div className="flex items-center gap-2">
                <Button 
                  size="sm" 
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClick();
                  }}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Continuar
                </Button>
                {competition.status === 'active' && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      onClick();
                    }}
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ) : competition.status === 'ended' ? (
              <Button 
                size="sm" 
                variant="outline" 
                className="w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  onClick();
                }}
              >
                Ver Resultados
              </Button>
            ) : competition.participants >= competition.maxParticipants ? (
              <Button size="sm" variant="outline" className="w-full" disabled>
                Completa
              </Button>
            ) : (
              <Button 
                size="sm" 
                className="w-full bg-purple-600 hover:bg-purple-700"
                onClick={(e) => {
                  e.stopPropagation();
                  onJoin?.();
                }}
              >
                <Zap className="h-4 w-4 mr-2" />
                Unirse
              </Button>
            )}
          </div>

          {/* Featured indicator */}
          {competition.participants > 50 && (
            <div className="flex items-center gap-1 text-orange-600 text-xs">
              <TrendingUp className="h-3 w-3" />
              <span className="font-medium">Popular</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}