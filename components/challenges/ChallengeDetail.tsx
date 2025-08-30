'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Play,
  ArrowLeft,
  Share2,
  Bookmark,
  Flag,
  Timer,
  BookOpen,
  Lightbulb
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

interface ChallengeDetailProps {
  challenge: Challenge;
  onBack: () => void;
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

export function ChallengeDetail({ challenge, onBack, onJoin }: ChallengeDetailProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const completionRate = challenge.participants > 0 
    ? Math.round((challenge.completions / challenge.participants) * 100) 
    : 0;

  const timeRemaining = challenge.endDate 
    ? Math.max(0, Math.ceil((new Date(challenge.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
    : null;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={onBack} className="flex items-center">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Share2 className="w-4 h-4 mr-2" />
            Compartir
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsBookmarked(!isBookmarked)}
          >
            <Bookmark className={`w-4 h-4 mr-2 ${isBookmarked ? 'fill-current' : ''}`} />
            {isBookmarked ? 'Guardado' : 'Guardar'}
          </Button>
          <Button variant="outline" size="sm">
            <Flag className="w-4 h-4 mr-2" />
            Reportar
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Challenge Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Hero Section */}
          <Card>
            {challenge.image && (
              <div className="relative h-64 overflow-hidden rounded-t-lg">
                <img 
                  src={challenge.image} 
                  alt={challenge.title}
                  className="w-full h-full object-cover"
                />
                {challenge.featured && (
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-yellow-500 text-white">
                      <Star className="w-3 h-3 mr-1" />
                      Destacado
                    </Badge>
                  </div>
                )}
              </div>
            )}
            <CardHeader>
              <div className="flex flex-wrap gap-2 mb-3">
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
                {challenge.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
              <CardTitle className="text-2xl">{challenge.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 leading-relaxed">
                {challenge.description}
              </p>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Detalles</TabsTrigger>
              <TabsTrigger value="requirements">Requisitos</TabsTrigger>
              <TabsTrigger value="leaderboard">Clasificación</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BookOpen className="w-5 h-5 mr-2" />
                    Información del Desafío
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-2 text-gray-500" />
                      <span className="text-sm">
                        {challenge.participants.toLocaleString()} participantes
                      </span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2 text-gray-500" />
                      <span className="text-sm">
                        {challenge.completions.toLocaleString()} completados
                      </span>
                    </div>
                    {challenge.timeLimit && (
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-gray-500" />
                        <span className="text-sm">
                          Límite: {challenge.timeLimit} minutos
                        </span>
                      </div>
                    )}
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                      <span className="text-sm">
                        Inicio: {new Date(challenge.startDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Tasa de Completación</span>
                      <span>{completionRate}%</span>
                    </div>
                    <Progress value={completionRate} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="requirements" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Lightbulb className="w-5 h-5 mr-2" />
                    Requisitos y Preparación
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {challenge.requirements && challenge.requirements.length > 0 ? (
                    <ul className="space-y-2">
                      {challenge.requirements.map((req, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle className="w-4 h-4 mr-2 mt-0.5 text-green-500" />
                          <span className="text-sm">{req}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-600 text-sm">
                      No hay requisitos específicos para este desafío. ¡Cualquiera puede participar!
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="leaderboard" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Clasificación</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">
                    La clasificación se mostrará una vez que comiences a participar en el desafío.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column - Actions & Info */}
        <div className="space-y-6">
          {/* Action Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Participar</span>
                <div className="flex items-center text-yellow-600">
                  <Trophy className="w-5 h-5 mr-1" />
                  {challenge.points}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {timeRemaining !== null && (
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-center">
                    <Timer className="w-4 h-4 mr-2 text-orange-600" />
                    <span className="text-sm font-medium">Tiempo restante</span>
                  </div>
                  <span className="text-sm font-bold text-orange-600">
                    {timeRemaining} días
                  </span>
                </div>
              )}
              
              <Button 
                className="w-full" 
                size="lg"
                onClick={() => onJoin?.(challenge.id)}
                disabled={challenge.status !== 'active'}
              >
                <Play className="w-4 h-4 mr-2" />
                {challenge.status === 'active' ? 'Comenzar Desafío' : 
                 challenge.status === 'upcoming' ? 'Próximamente' : 'Finalizado'}
              </Button>
              
              <div className="text-xs text-gray-500 text-center">
                Al participar, aceptas las reglas del desafío
              </div>
            </CardContent>
          </Card>

          {/* Rewards Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="w-5 h-5 mr-2" />
                Recompensas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Zap className="w-4 h-4 mr-2 text-yellow-500" />
                  <span className="text-sm">Crolars</span>
                </div>
                <span className="font-bold text-yellow-600">
                  {challenge.rewards.crolars}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Target className="w-4 h-4 mr-2 text-blue-500" />
                  <span className="text-sm">Experiencia</span>
                </div>
                <span className="font-bold text-blue-600">
                  {challenge.rewards.xp} XP
                </span>
              </div>
              
              {challenge.rewards.badges && challenge.rewards.badges.length > 0 && (
                <div>
                  <div className="flex items-center mb-2">
                    <Award className="w-4 h-4 mr-2 text-purple-500" />
                    <span className="text-sm">Insignias</span>
                  </div>
                  <div className="space-y-1">
                    {challenge.rewards.badges.map((badge, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {badge}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Creator Card */}
          <Card>
            <CardHeader>
              <CardTitle>Creador</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-3">
                <img 
                  src={challenge.creator.avatar || '/default-avatar.png'} 
                  alt={challenge.creator.name}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <div className="font-medium">{challenge.creator.name}</div>
                  <div className="text-sm text-gray-600">
                    Nivel {challenge.creator.level}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}