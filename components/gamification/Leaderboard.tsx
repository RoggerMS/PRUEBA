'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Trophy, 
  Medal, 
  Award, 
  Crown, 
  TrendingUp, 
  Users, 
  Calendar,
  Filter,
  Star,
  Zap,
  Target
} from 'lucide-react';

interface LeaderboardUser {
  id: string;
  name: string;
  avatar?: string;
  level: number;
  xp: number;
  rank: number;
  previousRank?: number;
  badges: number;
  achievements: number;
  streak: number;
  category?: string;
  isCurrentUser?: boolean;
}

interface LeaderboardProps {
  users?: LeaderboardUser[];
  currentUserId?: string;
  timeframe?: 'weekly' | 'monthly' | 'all-time';
  category?: string;
}

const mockUsers: LeaderboardUser[] = [
  {
    id: '1',
    name: 'Ana García',
    avatar: '/avatars/ana.jpg',
    level: 25,
    xp: 15750,
    rank: 1,
    previousRank: 2,
    badges: 12,
    achievements: 28,
    streak: 15,
    category: 'Ingeniería'
  },
  {
    id: '2',
    name: 'Carlos Mendoza',
    avatar: '/avatars/carlos.jpg',
    level: 23,
    xp: 14200,
    rank: 2,
    previousRank: 1,
    badges: 10,
    achievements: 25,
    streak: 12,
    category: 'Medicina'
  },
  {
    id: '3',
    name: 'María López',
    avatar: '/avatars/maria.jpg',
    level: 22,
    xp: 13800,
    rank: 3,
    previousRank: 3,
    badges: 11,
    achievements: 24,
    streak: 18,
    category: 'Derecho'
  },
  {
    id: '4',
    name: 'Tú',
    avatar: '/avatars/user.jpg',
    level: 12,
    xp: 8750,
    rank: 15,
    previousRank: 18,
    badges: 6,
    achievements: 14,
    streak: 7,
    category: 'Ingeniería',
    isCurrentUser: true
  },
  {
    id: '5',
    name: 'Diego Ruiz',
    avatar: '/avatars/diego.jpg',
    level: 20,
    xp: 12500,
    rank: 4,
    previousRank: 5,
    badges: 9,
    achievements: 22,
    streak: 10,
    category: 'Psicología'
  },
  {
    id: '6',
    name: 'Laura Fernández',
    avatar: '/avatars/laura.jpg',
    level: 19,
    xp: 11900,
    rank: 5,
    previousRank: 4,
    badges: 8,
    achievements: 20,
    streak: 14,
    category: 'Administración'
  }
];

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Crown className="w-5 h-5 text-yellow-500" />;
    case 2:
      return <Trophy className="w-5 h-5 text-gray-400" />;
    case 3:
      return <Medal className="w-5 h-5 text-amber-600" />;
    default:
      return <span className="text-sm font-bold text-gray-600">#{rank}</span>;
  }
};

const getRankChange = (rank: number, previousRank?: number) => {
  if (!previousRank) return null;
  
  const change = previousRank - rank;
  if (change > 0) {
    return (
      <div className="flex items-center text-green-600 text-xs">
        <TrendingUp className="w-3 h-3 mr-1" />
        +{change}
      </div>
    );
  } else if (change < 0) {
    return (
      <div className="flex items-center text-red-600 text-xs">
        <TrendingUp className="w-3 h-3 mr-1 rotate-180" />
        {change}
      </div>
    );
  }
  return (
    <div className="text-gray-400 text-xs">
      =
    </div>
  );
};

const getPodiumHeight = (rank: number) => {
  switch (rank) {
    case 1: return 'h-24';
    case 2: return 'h-20';
    case 3: return 'h-16';
    default: return 'h-12';
  }
};

export function Leaderboard({
  users = mockUsers,
  currentUserId = '4',
  timeframe = 'weekly',
  category = 'all'
}: LeaderboardProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState(timeframe);
  const [selectedCategory, setSelectedCategory] = useState(category);
  
  const topThree = users.slice(0, 3);
  const restOfUsers = users.slice(3);
  const currentUser = users.find(u => u.id === currentUserId);
  
  const categories = ['all', 'Ingeniería', 'Medicina', 'Derecho', 'Psicología', 'Administración'];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-600" />
              Tabla de Posiciones
            </CardTitle>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Semanal</SelectItem>
                  <SelectItem value="monthly">Mensual</SelectItem>
                  <SelectItem value="all-time">Histórico</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las carreras</SelectItem>
                  {categories.slice(1).map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Current User Stats */}
      {currentUser && (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12 border-2 border-blue-300">
                  <AvatarImage src={currentUser.avatar} />
                  <AvatarFallback className="bg-blue-100 text-blue-700">
                    {currentUser.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-gray-900">Tu Posición</h3>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-blue-600 hover:bg-blue-700">
                      #{currentUser.rank}
                    </Badge>
                    {getRankChange(currentUser.rank, currentUser.previousRank)}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-gray-600">Nivel</p>
                  <p className="font-bold text-lg text-gray-900">{currentUser.level}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">XP</p>
                  <p className="font-bold text-lg text-gray-900">{currentUser.xp.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Racha</p>
                  <p className="font-bold text-lg text-gray-900">{currentUser.streak}d</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Podium */}
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Top 3</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-center gap-4 mb-6">
            {/* Second Place */}
            {topThree[1] && (
              <div className="text-center">
                <Avatar className="w-16 h-16 mx-auto mb-2 border-2 border-gray-300">
                  <AvatarImage src={topThree[1].avatar} />
                  <AvatarFallback className="bg-gray-100">
                    {topThree[1].name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <h4 className="font-medium text-sm mb-1">{topThree[1].name}</h4>
                <Badge className="bg-gray-500 hover:bg-gray-600 mb-2">2°</Badge>
                <div className={`bg-gray-200 ${getPodiumHeight(2)} w-20 rounded-t-lg flex items-end justify-center pb-2`}>
                  <Trophy className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-xs text-gray-600 mt-1">{topThree[1].xp.toLocaleString()} XP</p>
              </div>
            )}

            {/* First Place */}
            {topThree[0] && (
              <div className="text-center">
                <Avatar className="w-20 h-20 mx-auto mb-2 border-4 border-yellow-300">
                  <AvatarImage src={topThree[0].avatar} />
                  <AvatarFallback className="bg-yellow-100">
                    {topThree[0].name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <h4 className="font-bold text-base mb-1">{topThree[0].name}</h4>
                <Badge className="bg-yellow-500 hover:bg-yellow-600 mb-2">1°</Badge>
                <div className={`bg-yellow-200 ${getPodiumHeight(1)} w-24 rounded-t-lg flex items-end justify-center pb-2`}>
                  <Crown className="w-8 h-8 text-yellow-600" />
                </div>
                <p className="text-sm font-semibold text-gray-900 mt-1">{topThree[0].xp.toLocaleString()} XP</p>
              </div>
            )}

            {/* Third Place */}
            {topThree[2] && (
              <div className="text-center">
                <Avatar className="w-16 h-16 mx-auto mb-2 border-2 border-amber-300">
                  <AvatarImage src={topThree[2].avatar} />
                  <AvatarFallback className="bg-amber-100">
                    {topThree[2].name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <h4 className="font-medium text-sm mb-1">{topThree[2].name}</h4>
                <Badge className="bg-amber-600 hover:bg-amber-700 mb-2">3°</Badge>
                <div className={`bg-amber-200 ${getPodiumHeight(3)} w-20 rounded-t-lg flex items-end justify-center pb-2`}>
                  <Medal className="w-6 h-6 text-amber-600" />
                </div>
                <p className="text-xs text-gray-600 mt-1">{topThree[2].xp.toLocaleString()} XP</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Full Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle>Clasificación Completa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {users.map((user, index) => (
              <div
                key={user.id}
                className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${
                  user.isCurrentUser 
                    ? 'bg-blue-50 border border-blue-200' 
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-center w-8">
                  {getRankIcon(user.rank)}
                </div>
                
                <Avatar className="w-10 h-10">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback>
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className={`font-medium ${
                      user.isCurrentUser ? 'text-blue-900' : 'text-gray-900'
                    }`}>
                      {user.name}
                    </h4>
                    {user.isCurrentUser && (
                      <Badge variant="outline" className="text-xs border-blue-300 text-blue-700">
                        Tú
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>Nivel {user.level}</span>
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      {user.xp.toLocaleString()} XP
                    </span>
                    <span className="flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      {user.streak}d
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Insignias</p>
                    <p className="font-semibold text-sm">{user.badges}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Logros</p>
                    <p className="font-semibold text-sm">{user.achievements}</p>
                  </div>
                  {getRankChange(user.rank, user.previousRank)}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 text-center">
            <Button variant="outline">
              Ver más posiciones
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}