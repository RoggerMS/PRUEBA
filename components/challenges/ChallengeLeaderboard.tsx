'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy, 
  Medal, 
  Crown, 
  Star, 
  Clock, 
  Target, 
  TrendingUp,
  Award,
  Zap,
  Users,
  Calendar
} from 'lucide-react';

interface LeaderboardEntry {
  id: string;
  user: {
    id: string;
    name: string;
    avatar: string;
    level: number;
    university?: string;
  };
  score: number;
  completionTime?: number;
  completedAt: string;
  rank: number;
  badges?: string[];
}

interface ChallengeLeaderboardProps {
  challengeId: string;
  challengeTitle: string;
  entries?: LeaderboardEntry[];
  currentUserId?: string;
}

// Mock data
const mockEntries: LeaderboardEntry[] = [
  {
    id: '1',
    user: {
      id: 'user1',
      name: 'Ana García',
      avatar: '/avatars/ana.png',
      level: 45,
      university: 'Universidad Nacional'
    },
    score: 950,
    completionTime: 8,
    completedAt: '2024-01-15T10:30:00Z',
    rank: 1,
    badges: ['Velocista', 'Perfeccionista']
  },
  {
    id: '2',
    user: {
      id: 'user2',
      name: 'Carlos Mendoza',
      avatar: '/avatars/carlos.png',
      level: 38,
      university: 'Universidad Tecnológica'
    },
    score: 920,
    completionTime: 12,
    completedAt: '2024-01-15T11:15:00Z',
    rank: 2
  },
  {
    id: '3',
    user: {
      id: 'user3',
      name: 'María López',
      avatar: '/avatars/maria.png',
      level: 52,
      university: 'Universidad Central'
    },
    score: 890,
    completionTime: 15,
    completedAt: '2024-01-15T12:00:00Z',
    rank: 3,
    badges: ['Estratega']
  },
  {
    id: '4',
    user: {
      id: 'user4',
      name: 'Diego Ruiz',
      avatar: '/avatars/diego.png',
      level: 29,
      university: 'Universidad del Norte'
    },
    score: 850,
    completionTime: 18,
    completedAt: '2024-01-15T13:30:00Z',
    rank: 4
  },
  {
    id: '5',
    user: {
      id: 'user5',
      name: 'Sofía Herrera',
      avatar: '/avatars/sofia.png',
      level: 41,
      university: 'Universidad Nacional'
    },
    score: 820,
    completionTime: 22,
    completedAt: '2024-01-15T14:45:00Z',
    rank: 5
  }
];

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Crown className="w-5 h-5 text-yellow-500" />;
    case 2:
      return <Medal className="w-5 h-5 text-gray-400" />;
    case 3:
      return <Award className="w-5 h-5 text-amber-600" />;
    default:
      return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-gray-600">#{rank}</span>;
  }
};

const getRankColor = (rank: number) => {
  switch (rank) {
    case 1:
      return 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200';
    case 2:
      return 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200';
    case 3:
      return 'bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200';
    default:
      return 'bg-white border-gray-200';
  }
};

export function ChallengeLeaderboard({ 
  challengeId, 
  challengeTitle, 
  entries = mockEntries, 
  currentUserId 
}: ChallengeLeaderboardProps) {
  const [activeTab, setActiveTab] = useState('overall');
  
  const topPerformers = entries.slice(0, 3);
  const otherEntries = entries.slice(3);
  const currentUserEntry = entries.find(entry => entry.user.id === currentUserId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Trophy className="w-6 h-6 mr-2 text-yellow-500" />
            Clasificación - {challengeTitle}
          </CardTitle>
          <p className="text-sm text-gray-600">
            Ranking basado en puntuación y tiempo de completación
          </p>
        </CardHeader>
      </Card>

      {/* Current User Position (if applicable) */}
      {currentUserEntry && currentUserEntry.rank > 3 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                  <span className="font-bold text-blue-600">#{currentUserEntry.rank}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <img 
                    src={currentUserEntry.user.avatar || '/default-avatar.png'} 
                    alt={currentUserEntry.user.name}
                    className="w-8 h-8 rounded-full"
                  />
                  <div>
                    <div className="font-medium text-blue-900">
                      {currentUserEntry.user.name} (Tú)
                    </div>
                    <div className="text-sm text-blue-700">
                      {currentUserEntry.user.university}
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-blue-900">{currentUserEntry.score} pts</div>
                {currentUserEntry.completionTime && (
                  <div className="text-sm text-blue-700">
                    {currentUserEntry.completionTime} min
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overall">General</TabsTrigger>
          <TabsTrigger value="speed">Más Rápidos</TabsTrigger>
          <TabsTrigger value="university">Por Universidad</TabsTrigger>
        </TabsList>

        <TabsContent value="overall" className="space-y-4">
          {/* Top 3 Podium */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Top 3</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {topPerformers.map((entry) => (
                  <div 
                    key={entry.id}
                    className={`p-4 rounded-lg border-2 ${getRankColor(entry.rank)}`}
                  >
                    <div className="text-center space-y-3">
                      <div className="flex justify-center">
                        {getRankIcon(entry.rank)}
                      </div>
                      <img 
                        src={entry.user.avatar || '/default-avatar.png'} 
                        alt={entry.user.name}
                        className="w-16 h-16 rounded-full mx-auto"
                      />
                      <div>
                        <div className="font-bold">{entry.user.name}</div>
                        <div className="text-sm text-gray-600">
                          Nivel {entry.user.level}
                        </div>
                        {entry.user.university && (
                          <div className="text-xs text-gray-500">
                            {entry.user.university}
                          </div>
                        )}
                      </div>
                      <div className="space-y-1">
                        <div className="font-bold text-lg">{entry.score} pts</div>
                        {entry.completionTime && (
                          <div className="text-sm text-gray-600">
                            <Clock className="w-3 h-3 inline mr-1" />
                            {entry.completionTime} min
                          </div>
                        )}
                      </div>
                      {entry.badges && entry.badges.length > 0 && (
                        <div className="flex flex-wrap justify-center gap-1">
                          {entry.badges.map((badge, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {badge}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Rest of the leaderboard */}
          {otherEntries.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Clasificación Completa</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {otherEntries.map((entry) => (
                    <div 
                      key={entry.id}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        entry.user.id === currentUserId 
                          ? 'border-blue-200 bg-blue-50' 
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full">
                          <span className="text-sm font-bold text-gray-600">#{entry.rank}</span>
                        </div>
                        <img 
                          src={entry.user.avatar || '/default-avatar.png'} 
                          alt={entry.user.name}
                          className="w-10 h-10 rounded-full"
                        />
                        <div>
                          <div className="font-medium">
                            {entry.user.name}
                            {entry.user.id === currentUserId && (
                              <Badge variant="outline" className="ml-2 text-xs">
                                Tú
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-gray-600">
                            Nivel {entry.user.level}
                            {entry.user.university && ` • ${entry.user.university}`}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{entry.score} pts</div>
                        {entry.completionTime && (
                          <div className="text-sm text-gray-600">
                            {entry.completionTime} min
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="speed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="w-5 h-5 mr-2 text-yellow-500" />
                Clasificación por Velocidad
              </CardTitle>
              <p className="text-sm text-gray-600">
                Ordenado por tiempo de completación
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {entries
                  .filter(entry => entry.completionTime)
                  .sort((a, b) => (a.completionTime || 0) - (b.completionTime || 0))
                  .map((entry, index) => (
                    <div 
                      key={entry.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-8 h-8 bg-yellow-100 rounded-full">
                          <span className="text-sm font-bold text-yellow-600">#{index + 1}</span>
                        </div>
                        <img 
                          src={entry.user.avatar || '/default-avatar.png'} 
                          alt={entry.user.name}
                          className="w-10 h-10 rounded-full"
                        />
                        <div>
                          <div className="font-medium">{entry.user.name}</div>
                          <div className="text-sm text-gray-600">
                            {entry.score} pts • Nivel {entry.user.level}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-yellow-600">
                          <Clock className="w-4 h-4 inline mr-1" />
                          {entry.completionTime} min
                        </div>
                      </div>
                    </div>
                  ))
                }
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="university" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2 text-blue-500" />
                Clasificación por Universidad
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Próximamente: Ranking por universidades y competencias inter-universitarias.
              </p>
              <Button variant="outline" disabled>
                <TrendingUp className="w-4 h-4 mr-2" />
                Ver Estadísticas Universitarias
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}