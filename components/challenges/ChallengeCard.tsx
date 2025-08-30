'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Trophy, 
  Clock, 
  Users, 
  Target, 
  Star, 
  Calendar,
  Award,
  Zap,
  CheckCircle,
  Play
} from 'lucide-react';

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
  onSelect?: (challenge: Challenge) => void;
  onJoin?: (challengeId: string) => void;
}

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty.toLowerCase()) {
    case 'principiante':
      return 'bg-green-100 text-green-800';
    case 'intermedio':
      return 'bg-yellow-100 text-yellow-800';
    case 'avanzado':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'daily':
      return 'bg-blue-100 text-blue-800';
    case 'weekly':
      return 'bg-purple-100 text-purple-800';
    case 'special':
      return 'bg-orange-100 text-orange-800';
    case 'community':
      return 'bg-pink-100 text-pink-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'upcoming':
      return 'bg-yellow-100 text-yellow-800';
    case 'completed':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export function ChallengeCard({ challenge, onSelect, onJoin }: ChallengeCardProps) {
  const completionRate = challenge.participants > 0 
    ? Math.round((challenge.completions / challenge.participants) * 100) 
    : 0;

  return (
    <Card 
      className={`transition-all duration-200 hover:shadow-lg cursor-pointer ${
        challenge.featured ? 'ring-2 ring-yellow-400 ring-opacity-50' : ''
      }`}
      onClick={() => onSelect?.(challenge)}
    >
      {challenge.image && (
        <div className="relative h-48 overflow-hidden rounded-t-lg">
          <img 
            src={challenge.image} 
            alt={challenge.title}
            className="w-full h-full object-cover"
          />
          {challenge.featured && (
            <div className="absolute top-2 right-2">
              <Badge className="bg-yellow-500 text-white">
                <Star className="w-3 h-3 mr-1" />
                Destacado
              </Badge>
            </div>
          )}
          <div className="absolute top-2 left-2">
            <Badge className={getStatusColor(challenge.status)}>
              {challenge.status === 'active' ? 'Activo' : 
               challenge.status === 'upcoming' ? 'Próximo' : 'Completado'}
            </Badge>
          </div>
        </div>
      )}
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2">{challenge.title}</CardTitle>
            <div className="flex flex-wrap gap-2 mb-2">
              <Badge variant="outline" className={getDifficultyColor(challenge.difficulty)}>
                {challenge.difficulty}
              </Badge>
              <Badge variant="outline" className={getTypeColor(challenge.type)}>
                {challenge.type === 'daily' ? 'Diario' :
                 challenge.type === 'weekly' ? 'Semanal' :
                 challenge.type === 'special' ? 'Especial' : 'Comunidad'}
              </Badge>
              <Badge variant="secondary">
                {challenge.category}
              </Badge>
            </div>
          </div>
          <div className="text-right ml-4">
            <div className="flex items-center text-yellow-600 font-bold">
              <Trophy className="w-4 h-4 mr-1" />
              {challenge.points}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {challenge.description}
        </p>
        
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div className="flex items-center text-gray-600">
            <Users className="w-4 h-4 mr-2" />
            {challenge.participants.toLocaleString()} participantes
          </div>
          <div className="flex items-center text-gray-600">
            <CheckCircle className="w-4 h-4 mr-2" />
            {completionRate}% completado
          </div>
          {challenge.timeLimit && (
            <div className="flex items-center text-gray-600">
              <Clock className="w-4 h-4 mr-2" />
              {challenge.timeLimit} min
            </div>
          )}
          <div className="flex items-center text-gray-600">
            <Calendar className="w-4 h-4 mr-2" />
            {new Date(challenge.startDate).toLocaleDateString()}
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <img 
              src={challenge.creator.avatar || '/default-avatar.png'} 
              alt={challenge.creator.name}
              className="w-6 h-6 rounded-full"
            />
            <span className="text-xs text-gray-600">
              {challenge.creator.name}
            </span>
          </div>
          
          <Button 
            size="sm" 
            onClick={(e) => {
              e.stopPropagation();
              onJoin?.(challenge.id);
            }}
            disabled={challenge.status !== 'active'}
          >
            <Play className="w-4 h-4 mr-1" />
            {challenge.status === 'active' ? 'Participar' : 
             challenge.status === 'upcoming' ? 'Próximamente' : 'Finalizado'}
          </Button>
        </div>
        
        {challenge.rewards && (
          <div className="mt-3 p-2 bg-gray-50 rounded-md">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">Recompensas:</span>
              <div className="flex items-center space-x-3">
                <span className="flex items-center text-yellow-600">
                  <Zap className="w-3 h-3 mr-1" />
                  {challenge.rewards.crolars}
                </span>
                <span className="flex items-center text-blue-600">
                  <Target className="w-3 h-3 mr-1" />
                  {challenge.rewards.xp} XP
                </span>
                {challenge.rewards.badges && challenge.rewards.badges.length > 0 && (
                  <span className="flex items-center text-purple-600">
                    <Award className="w-3 h-3 mr-1" />
                    {challenge.rewards.badges.length}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}