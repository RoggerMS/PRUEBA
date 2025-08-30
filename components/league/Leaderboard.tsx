"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Trophy, 
  Medal, 
  Crown, 
  Star, 
  TrendingUp, 
  Award, 
  Users,
  Calendar,
  Target,
  Zap,
  ChevronUp,
  ChevronDown,
  Minus
} from "lucide-react";

interface LeaderboardUser {
  id: string;
  name: string;
  avatar: string;
  level: string;
  totalPoints: number;
  competitionsWon: number;
  competitionsParticipated: number;
  currentRank: number;
  previousRank: number;
  badges: string[];
  winRate: number;
  streak: number;
}

interface LeaderboardProps {
  timeframe?: string;
}

export function Leaderboard({ timeframe = "all" }: LeaderboardProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState(timeframe);
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Mock leaderboard data
  const [leaderboardData] = useState<LeaderboardUser[]>([
    {
      id: "1",
      name: "Ana García",
      avatar: "/avatars/ana.jpg",
      level: "Experto",
      totalPoints: 15420,
      competitionsWon: 12,
      competitionsParticipated: 18,
      currentRank: 1,
      previousRank: 2,
      badges: ["Matemático Supremo", "Programador Elite", "Científico Destacado"],
      winRate: 67,
      streak: 5
    },
    {
      id: "2",
      name: "Carlos López",
      avatar: "/avatars/carlos.jpg",
      level: "Avanzado",
      totalPoints: 14850,
      competitionsWon: 10,
      competitionsParticipated: 15,
      currentRank: 2,
      previousRank: 1,
      badges: ["Programador Elite", "Lógico Maestro"],
      winRate: 67,
      streak: 3
    },
    {
      id: "3",
      name: "María Rodríguez",
      avatar: "/avatars/maria.jpg",
      level: "Avanzado",
      totalPoints: 13290,
      competitionsWon: 8,
      competitionsParticipated: 14,
      currentRank: 3,
      previousRank: 4,
      badges: ["Científico Destacado", "Investigadora"],
      winRate: 57,
      streak: 2
    },
    {
      id: "4",
      name: "Diego Martín",
      avatar: "/avatars/diego.jpg",
      level: "Avanzado",
      totalPoints: 12750,
      competitionsWon: 7,
      competitionsParticipated: 12,
      currentRank: 4,
      previousRank: 3,
      badges: ["Matemático Supremo", "Analista"],
      winRate: 58,
      streak: 1
    },
    {
      id: "5",
      name: "Laura Fernández",
      avatar: "/avatars/laura.jpg",
      level: "Intermedio",
      totalPoints: 11200,
      competitionsWon: 6,
      competitionsParticipated: 11,
      currentRank: 5,
      previousRank: 6,
      badges: ["Programadora Emergente"],
      winRate: 55,
      streak: 4
    },
    {
      id: "6",
      name: "Usuario Actual",
      avatar: "/avatars/current.jpg",
      level: "Intermedio",
      totalPoints: 8450,
      competitionsWon: 3,
      competitionsParticipated: 8,
      currentRank: 15,
      previousRank: 18,
      badges: ["Participante Activo"],
      winRate: 38,
      streak: 1
    }
  ]);

  const timeframes = [
    { value: "all", label: "Todo el tiempo" },
    { value: "month", label: "Este mes" },
    { value: "week", label: "Esta semana" },
    { value: "year", label: "Este año" }
  ];

  const categories = [
    { value: "all", label: "Todas las categorías" },
    { value: "matematicas", label: "Matemáticas" },
    { value: "programacion", label: "Programación" },
    { value: "ciencias", label: "Ciencias" },
    { value: "historia", label: "Historia" },
    { value: "idiomas", label: "Idiomas" }
  ];

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Principiante': return 'text-green-600';
      case 'Intermedio': return 'text-yellow-600';
      case 'Avanzado': return 'text-orange-600';
      case 'Experto': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2: return <Medal className="h-6 w-6 text-gray-400" />;
      case 3: return <Medal className="h-6 w-6 text-amber-600" />;
      default: return <span className="text-xl font-bold text-gray-600">#{rank}</span>;
    }
  };

  const getRankChange = (current: number, previous: number) => {
    if (current < previous) {
      return (
        <div className="flex items-center gap-1 text-green-600">
          <ChevronUp className="h-4 w-4" />
          <span className="text-sm font-medium">+{previous - current}</span>
        </div>
      );
    } else if (current > previous) {
      return (
        <div className="flex items-center gap-1 text-red-600">
          <ChevronDown className="h-4 w-4" />
          <span className="text-sm font-medium">-{current - previous}</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-1 text-gray-500">
          <Minus className="h-4 w-4" />
          <span className="text-sm font-medium">0</span>
        </div>
      );
    }
  };

  const currentUser = leaderboardData.find(user => user.name === "Usuario Actual");
  const topUsers = leaderboardData.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Current User Stats */}
      {currentUser && (
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Tu Posición en la Liga
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full">
                  <span className="text-2xl font-bold text-purple-600">
                    #{currentUser.currentRank}
                  </span>
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-900">
                    {currentUser.name}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className={`font-medium ${getLevelColor(currentUser.level)}`}>
                      {currentUser.level}
                    </span>
                    <span className="text-gray-500">•</span>
                    <span className="text-gray-600">
                      {currentUser.totalPoints} puntos
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex-1 grid grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">
                    {currentUser.competitionsWon}
                  </p>
                  <p className="text-sm text-gray-600">Victorias</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {currentUser.winRate}%
                  </p>
                  <p className="text-sm text-gray-600">Tasa de Victoria</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">
                    {currentUser.streak}
                  </p>
                  <p className="text-sm text-gray-600">Racha</p>
                </div>
                <div className="text-center">
                  {getRankChange(currentUser.currentRank, currentUser.previousRank)}
                  <p className="text-sm text-gray-600">Cambio</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Seleccionar período" />
          </SelectTrigger>
          <SelectContent>
            {timeframes.map(timeframe => (
              <SelectItem key={timeframe.value} value={timeframe.value}>
                {timeframe.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Seleccionar categoría" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(category => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Leaderboard Tabs */}
      <Tabs defaultValue="overall" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overall">Clasificación General</TabsTrigger>
          <TabsTrigger value="monthly">Top del Mes</TabsTrigger>
          <TabsTrigger value="rising">Estrellas Emergentes</TabsTrigger>
        </TabsList>

        <TabsContent value="overall" className="space-y-6">
          {/* Top 3 Podium */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Podium de Campeones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-center gap-8 py-8">
                {/* Second Place */}
                {topUsers[1] && (
                  <div className="flex flex-col items-center">
                    <div className="w-20 h-16 bg-gray-200 rounded-t-lg flex items-center justify-center mb-4">
                      <Medal className="h-8 w-8 text-gray-500" />
                    </div>
                    <Avatar className="h-16 w-16 mb-3 border-4 border-gray-300">
                      <AvatarImage src={topUsers[1].avatar} alt={topUsers[1].name} />
                      <AvatarFallback>
                        {topUsers[1].name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <p className="font-semibold text-center">{topUsers[1].name}</p>
                    <p className="text-sm text-gray-600">{topUsers[1].totalPoints} pts</p>
                  </div>
                )}

                {/* First Place */}
                {topUsers[0] && (
                  <div className="flex flex-col items-center">
                    <div className="w-24 h-20 bg-yellow-200 rounded-t-lg flex items-center justify-center mb-4">
                      <Crown className="h-10 w-10 text-yellow-600" />
                    </div>
                    <Avatar className="h-20 w-20 mb-3 border-4 border-yellow-400">
                      <AvatarImage src={topUsers[0].avatar} alt={topUsers[0].name} />
                      <AvatarFallback>
                        {topUsers[0].name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <p className="font-bold text-lg text-center">{topUsers[0].name}</p>
                    <p className="text-sm text-gray-600">{topUsers[0].totalPoints} pts</p>
                    <Badge className="mt-2 bg-yellow-100 text-yellow-800">
                      <Crown className="h-3 w-3 mr-1" />
                      Campeón
                    </Badge>
                  </div>
                )}

                {/* Third Place */}
                {topUsers[2] && (
                  <div className="flex flex-col items-center">
                    <div className="w-20 h-12 bg-amber-200 rounded-t-lg flex items-center justify-center mb-4">
                      <Medal className="h-6 w-6 text-amber-700" />
                    </div>
                    <Avatar className="h-16 w-16 mb-3 border-4 border-amber-400">
                      <AvatarImage src={topUsers[2].avatar} alt={topUsers[2].name} />
                      <AvatarFallback>
                        {topUsers[2].name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <p className="font-semibold text-center">{topUsers[2].name}</p>
                    <p className="text-sm text-gray-600">{topUsers[2].totalPoints} pts</p>
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
              <div className="space-y-4">
                {leaderboardData.map((user, index) => (
                  <div 
                    key={user.id} 
                    className={`flex items-center gap-4 p-4 rounded-lg border ${
                      user.name === "Usuario Actual" 
                        ? 'bg-purple-50 border-purple-200' 
                        : index < 3 
                        ? 'bg-yellow-50 border-yellow-200' 
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-center w-12">
                      {getRankIcon(user.currentRank)}
                    </div>
                    
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback>
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900">
                          {user.name}
                        </p>
                        {user.name === "Usuario Actual" && (
                          <Badge variant="secondary" className="text-xs">
                            Tú
                          </Badge>
                        )}
                        {user.streak >= 3 && (
                          <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                            <Zap className="h-3 w-3 mr-1" />
                            Racha {user.streak}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className={`font-medium ${getLevelColor(user.level)}`}>
                          {user.level}
                        </span>
                        <span className="text-gray-500">•</span>
                        <span className="text-gray-600">
                          {user.competitionsWon}/{user.competitionsParticipated} victorias
                        </span>
                        <span className="text-gray-500">•</span>
                        <span className="text-gray-600">
                          {user.winRate}% tasa de victoria
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        {user.totalPoints}
                      </p>
                      <p className="text-sm text-gray-600">puntos</p>
                    </div>
                    
                    <div className="w-16 text-center">
                      {getRankChange(user.currentRank, user.previousRank)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monthly">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Top del Mes - Febrero 2024
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center py-8">
                Clasificación mensual próximamente...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rising">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Estrellas Emergentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center py-8">
                Usuarios con mayor crecimiento próximamente...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}