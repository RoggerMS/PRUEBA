"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Progress } from "@/src/components/ui/progress";
import { 
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
  TrendingUp
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

interface ChallengeCardProps {
  challenge: Challenge;
  onClick?: () => void;
}

export function ChallengeCard({ challenge, onClick }: ChallengeCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
    toast.success(isLiked ? "Desafío removido de favoritos" : "Desafío agregado a favoritos");
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`${window.location.origin}/challenges/${challenge.id}`);
    toast.success("Enlace copiado al portapapeles");
  };

  const handleJoin = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsJoining(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsJoining(false);
    toast.success("¡Te has unido al desafío!");
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'daily': return <Calendar className="h-4 w-4" />;
      case 'weekly': return <Timer className="h-4 w-4" />;
      case 'special': return <Crown className="h-4 w-4" />;
      case 'community': return <Users className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'upcoming': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const completionRate = challenge.participants > 0 ? (challenge.completions / challenge.participants) * 100 : 0;
  const timeRemaining = challenge.endDate ? new Date(challenge.endDate).getTime() - new Date().getTime() : null;
  const daysRemaining = timeRemaining ? Math.ceil(timeRemaining / (1000 * 60 * 60 * 24)) : null;

  return (
    <Card 
      className={`group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
        challenge.featured ? 'ring-2 ring-yellow-400 ring-opacity-50' : ''
      }`}
      onClick={onClick}
    >
      {/* Image */}
      {challenge.image && (
        <div className="relative overflow-hidden rounded-t-lg">
          <img 
            src={challenge.image} 
            alt={challenge.title}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Overlays */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-2">
            {challenge.featured && (
              <Badge className="bg-yellow-500 text-white border-0 flex items-center gap-1">
                <Star className="h-3 w-3" />
                Destacado
              </Badge>
            )}
            <Badge className={`border ${getStatusColor(challenge.status)} flex items-center gap-1`}>
              {challenge.status === 'active' && <Flame className="h-3 w-3" />}
              {challenge.status === 'upcoming' && <Clock className="h-3 w-3" />}
              {challenge.status === 'completed' && <CheckCircle className="h-3 w-3" />}
              {challenge.status === 'active' ? 'Activo' : 
               challenge.status === 'upcoming' ? 'Próximo' : 'Completado'}
            </Badge>
          </div>
          
          <div className="absolute top-3 right-3 flex gap-2">
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
          
          {/* Time remaining overlay */}
          {daysRemaining && daysRemaining > 0 && (
            <div className="absolute bottom-3 left-3">
              <Badge className="bg-black/70 text-white border-0 flex items-center gap-1">
                <Timer className="h-3 w-3" />
                {daysRemaining} día{daysRemaining !== 1 ? 's' : ''} restante{daysRemaining !== 1 ? 's' : ''}
              </Badge>
            </div>
          )}
        </div>
      )}
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg text-gray-900 line-clamp-2 group-hover:text-purple-600 transition-colors">
              {challenge.title}
            </h3>
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
              {challenge.description}
            </p>
          </div>
          
          {/* Points Badge */}
          <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0 flex items-center gap-1 shrink-0">
            <Trophy className="h-3 w-3" />
            {challenge.points}
          </Badge>
        </div>
        
        {/* Tags */}
        <div className="flex flex-wrap gap-2 mt-3">
          <Badge className={`border ${getTypeColor(challenge.type)} flex items-center gap-1`}>
            {getTypeIcon(challenge.type)}
            {challenge.type === 'daily' ? 'Diario' :
             challenge.type === 'weekly' ? 'Semanal' :
             challenge.type === 'special' ? 'Especial' : 'Comunidad'}
          </Badge>
          <Badge className={`border ${getDifficultyColor(challenge.difficulty)}`}>
            {challenge.difficulty.charAt(0).toUpperCase() + challenge.difficulty.slice(1)}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {challenge.category}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="h-4 w-4" />
            <span>{challenge.participants.toLocaleString()} participantes</span>
          </div>
          {challenge.timeLimit && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span>{challenge.timeLimit} min</span>
            </div>
          )}
        </div>
        
        {/* Completion Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-600">Tasa de Finalización</span>
            <span className="font-medium text-gray-900">{completionRate.toFixed(1)}%</span>
          </div>
          <Progress value={completionRate} className="h-2" />
        </div>
        
        {/* Rewards */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1 text-yellow-600">
              <Trophy className="h-4 w-4" />
              <span>{challenge.rewards.crolars} Crolars</span>
            </div>
            <div className="flex items-center gap-1 text-blue-600">
              <Zap className="h-4 w-4" />
              <span>{challenge.rewards.xp} XP</span>
            </div>
          </div>
          
          {challenge.rewards.badges && challenge.rewards.badges.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-purple-600">
              <Award className="h-3 w-3" />
              <span>{challenge.rewards.badges.length} insignia{challenge.rewards.badges.length !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
        
        {/* Creator */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <img 
              src={challenge.creator.avatar} 
              alt={challenge.creator.name}
              className="w-6 h-6 rounded-full"
            />
            <span className="text-sm text-gray-600">{challenge.creator.name}</span>
            <Badge variant="outline" className="text-xs">
              Nivel {challenge.creator.level}
            </Badge>
          </div>
        </div>
        
        {/* Action Button */}
        <Button 
          className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
          onClick={handleJoin}
          disabled={isJoining || challenge.status !== 'active'}
        >
          {isJoining ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Uniéndose...
            </div>
          ) : challenge.status === 'active' ? (
            <div className="flex items-center gap-2">
              <Play className="h-4 w-4" />
              Participar
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
      </CardContent>
    </Card>
  );
}