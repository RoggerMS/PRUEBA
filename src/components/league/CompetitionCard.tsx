"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { gamificationService } from "@/services/gamificationService";
import { 
  Trophy, 
  Users, 
  Calendar, 
  Clock, 
  Star, 
  Heart, 
  Share2, 
  Eye, 
  Award, 
  Target,
  Zap,
  CheckCircle,
  XCircle,
  AlertCircle
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

interface CompetitionCardProps {
  competition: Competition;
  onClick?: (competitionId: string) => void;
}

export function CompetitionCard({ competition, onClick }: CompetitionCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    const wasLiked = isLiked;
    setIsLiked(!isLiked);
    
    // Grant XP for liking a competition (only when liking, not unliking)
    if (!wasLiked) {
      try {
        gamificationService.grantXP("user-id", 3, "manual", "settings", 'Dar like a competencia');
      } catch (error) {
        console.error('Error granting XP for competition like:', error);
      }
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Implement share functionality
    navigator.share?.({
      title: competition.title,
      text: competition.description,
      url: window.location.href
    }).catch(() => {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    });
  };

  const handleJoin = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsJoining(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsJoining(false);
    
    // Grant XP for joining a competition
    try {
      gamificationService.grantXP("user-id", 20, "achievement", competition.id, 'Unirse a competición');
    } catch (error) {
      console.error('Error granting XP for joining competition:', error);
    }
    
    // Update join status would be handled by parent component
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
        return <Zap className="h-3 w-3" />;
      case 'upcoming':
        return <Clock className="h-3 w-3" />;
      case 'completed':
        return <CheckCircle className="h-3 w-3" />;
      default:
        return <AlertCircle className="h-3 w-3" />;
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

  const participationPercentage = (competition.participants / competition.maxParticipants) * 100;
  const isNearlyFull = participationPercentage >= 80;
  const isFull = participationPercentage >= 100;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short'
    });
  };

  const daysUntilStart = Math.ceil(
    (new Date(competition.startDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <Card 
      className={`group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-white/90 backdrop-blur-sm border-0 shadow-lg overflow-hidden ${
        competition.isFeatured ? 'ring-2 ring-yellow-200' : ''
      }`}
      onClick={() => onClick?.(competition.id)}
    >
      {/* Image and Featured Badge */}
      <div className="relative">
        <div className="aspect-video w-full overflow-hidden">
          <img 
            src={competition.image} 
            alt={competition.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        
        {/* Overlay Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          {competition.isFeatured && (
            <Badge className="bg-yellow-500 text-white border-0">
              <Star className="h-3 w-3 mr-1" />
              Destacada
            </Badge>
          )}
          
          <Badge className={`border-0 ${getStatusColor(competition.status)}`}>
            {getStatusIcon(competition.status)}
            {getStatusText(competition.status)}
          </Badge>
        </div>
        
        {/* Prize Badge */}
        {competition.prize > 0 && (
          <div className="absolute top-3 right-3">
            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white border-0">
              <Trophy className="h-3 w-3 mr-1" />
              {competition.prize} Crolars
            </Badge>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="absolute bottom-3 right-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="sm"
            variant="secondary"
            className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
            onClick={handleLike}
          >
            <Heart className={`h-4 w-4 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
          </Button>
          
          <Button
            size="sm"
            variant="secondary"
            className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
            onClick={handleShare}
          >
            <Share2 className="h-4 w-4 text-gray-600" />
          </Button>
        </div>
      </div>

      <CardContent className="p-4 space-y-4">
        {/* Title and Description */}
        <div className="space-y-2">
          <h3 className="font-semibold text-lg text-gray-900 line-clamp-1 group-hover:text-purple-600 transition-colors">
            {competition.title}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2">
            {competition.description}
          </p>
        </div>

        {/* Category and Difficulty */}
        <div className="flex items-center gap-2">
          <Badge className={`text-xs ${getCategoryColor(competition.category)}`}>
            {competition.category}
          </Badge>
          <Badge className={`text-xs ${getDifficultyColor(competition.difficulty)}`}>
            {competition.difficulty}
          </Badge>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Users className="h-4 w-4" />
            <span>
              {competition.participants}/{competition.maxParticipants}
              {isNearlyFull && (
                <span className={`ml-1 ${isFull ? 'text-red-600' : 'text-orange-600'}`}>
                  {isFull ? '(Lleno)' : '(Casi lleno)'}
                </span>
              )}
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-gray-600">
            <Clock className="h-4 w-4" />
            <span>{competition.duration}</span>
          </div>
        </div>

        {/* Dates */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>
              {formatDate(competition.startDate)} - {formatDate(competition.endDate)}
            </span>
          </div>
          
          {competition.status === 'upcoming' && daysUntilStart > 0 && (
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
              En {daysUntilStart} día{daysUntilStart !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Organizer */}
        <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100">
            <img 
              src={competition.organizerAvatar} 
              alt={competition.organizer}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500">Organizado por</p>
            <p className="text-sm font-medium text-gray-900 truncate">
              {competition.organizer}
            </p>
          </div>
        </div>

        {/* Tags */}
        {competition.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {competition.tags.slice(0, 3).map(tag => (
              <span 
                key={tag}
                className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
            {competition.tags.length > 3 && (
              <span className="text-xs text-gray-500">
                +{competition.tags.length - 3} más
              </span>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-2">
          {competition.isJoined ? (
            <Badge className="bg-green-100 text-green-700 flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Participando
            </Badge>
          ) : competition.status === 'completed' ? (
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={(e) => {
                e.stopPropagation();
                onClick?.(competition.id);
              }}
            >
              <Eye className="h-4 w-4 mr-2" />
              Ver Resultados
            </Button>
          ) : isFull ? (
            <Button variant="outline" size="sm" className="flex-1" disabled>
              <XCircle className="h-4 w-4 mr-2" />
              Lleno
            </Button>
          ) : (
            <Button 
              size="sm" 
              className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
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
                  Participar
                </>
              )}
            </Button>
          )}
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onClick?.(competition.id);
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>

        {/* Participation Progress Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Participación</span>
            <span>{Math.round(participationPercentage)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                isFull ? 'bg-red-500' : 
                isNearlyFull ? 'bg-orange-500' : 
                'bg-gradient-to-r from-purple-500 to-blue-500'
              }`}
              style={{ width: `${Math.min(participationPercentage, 100)}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
