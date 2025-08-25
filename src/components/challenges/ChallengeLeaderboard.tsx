"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Badge } from "@/src/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { 
  Search, 
  Trophy, 
  Medal, 
  Award, 
  Crown, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Users, 
  Target, 
  Zap, 
  Flame, 
  Calendar, 
  Clock, 
  Star, 
  ChevronUp, 
  ChevronDown, 
  Filter, 
  RotateCcw, 
  Eye, 
  MessageCircle, 
  Heart, 
  Share2
} from "lucide-react";

interface LeaderboardEntry {
  id: string;
  rank: number;
  previousRank?: number;
  user: {
    id: string;
    name: string;
    avatar: string;
    level: number;
    title?: string;
  };
  stats: {
    totalPoints: number;
    challengesCompleted: number;
    averageScore: number;
    streak: number;
    winRate: number;
    monthlyPoints: number;
  };
  achievements: string[];
  category: string;
  lastActive: string;
}

export function ChallengeLeaderboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [periodFilter, setPeriodFilter] = useState("all-time");
  const [levelFilter, setLevelFilter] = useState("all");

  // Mock data
  const leaderboardData: LeaderboardEntry[] = [
    {
      id: "1",
      rank: 1,
      previousRank: 2,
      user: {
        id: "u1",
        name: "Ana García",
        avatar: "/avatars/user1.png",
        level: 85,
        title: "Maestra de Desafíos"
      },
      stats: {
        totalPoints: 15420,
        challengesCompleted: 156,
        averageScore: 94.2,
        streak: 28,
        winRate: 89.5,
        monthlyPoints: 2840
      },
      achievements: ["Racha de Oro", "Perfeccionista", "Velocista"],
      category: "Matemáticas",
      lastActive: "2024-01-15T18:30:00Z"
    },
    {
      id: "2",
      rank: 2,
      previousRank: 1,
      user: {
        id: "u2",
        name: "Carlos López",
        avatar: "/avatars/user2.png",
        level: 78,
        title: "Estratega Supremo"
      },
      stats: {
        totalPoints: 14890,
        challengesCompleted: 142,
        averageScore: 91.8,
        streak: 15,
        winRate: 87.2,
        monthlyPoints: 2650
      },
      achievements: ["Pensador Crítico", "Constancia", "Líder"],
      category: "Ciencias",
      lastActive: "2024-01-15T17:45:00Z"
    },
    {
      id: "3",
      rank: 3,
      previousRank: 4,
      user: {
        id: "u3",
        name: "María Rodríguez",
        avatar: "/avatars/user3.png",
        level: 72,
        title: "Exploradora del Conocimiento"
      },
      stats: {
        totalPoints: 13560,
        challengesCompleted: 128,
        averageScore: 88.9,
        streak: 22,
        winRate: 84.6,
        monthlyPoints: 2420
      },
      achievements: ["Curiosa Incansable", "Racha de Plata"],
      category: "Historia",
      lastActive: "2024-01-15T19:15:00Z"
    },
    {
      id: "4",
      rank: 4,
      previousRank: 3,
      user: {
        id: "u4",
        name: "Pedro Martín",
        avatar: "/avatars/user4.png",
        level: 69,
        title: "Solucionador Experto"
      },
      stats: {
        totalPoints: 12980,
        challengesCompleted: 134,
        averageScore: 86.7,
        streak: 12,
        winRate: 82.1,
        monthlyPoints: 2180
      },
      achievements: ["Persistente", "Analítico"],
      category: "Física",
      lastActive: "2024-01-15T16:20:00Z"
    },
    {
      id: "5",
      rank: 5,
      previousRank: 6,
      user: {
        id: "u5",
        name: "Laura Sánchez",
        avatar: "/avatars/user5.png",
        level: 65,
        title: "Innovadora Creativa"
      },
      stats: {
        totalPoints: 11750,
        challengesCompleted: 119,
        averageScore: 85.3,
        streak: 8,
        winRate: 79.8,
        monthlyPoints: 1950
      },
      achievements: ["Creativa", "Colaboradora"],
      category: "Arte",
      lastActive: "2024-01-15T20:10:00Z"
    }
  ];

  const categories = [
    { value: "all", label: "Todas las Categorías" },
    { value: "matematicas", label: "Matemáticas" },
    { value: "ciencias", label: "Ciencias" },
    { value: "historia", label: "Historia" },
    { value: "fisica", label: "Física" },
    { value: "arte", label: "Arte" },
    { value: "literatura", label: "Literatura" },
    { value: "tecnologia", label: "Tecnología" }
  ];

  const periods = [
    { value: "all-time", label: "Todos los Tiempos" },
    { value: "monthly", label: "Este Mes" },
    { value: "weekly", label: "Esta Semana" },
    { value: "daily", label: "Hoy" }
  ];

  const levels = [
    { value: "all", label: "Todos los Niveles" },
    { value: "beginner", label: "Principiante (1-20)" },
    { value: "intermediate", label: "Intermedio (21-50)" },
    { value: "advanced", label: "Avanzado (51-80)" },
    { value: "expert", label: "Experto (81-100)" }
  ];

  const filteredData = leaderboardData.filter(entry => {
    const matchesSearch = entry.user.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || entry.category.toLowerCase().includes(categoryFilter);
    const matchesLevel = levelFilter === "all" || 
      (levelFilter === "beginner" && entry.user.level <= 20) ||
      (levelFilter === "intermediate" && entry.user.level > 20 && entry.user.level <= 50) ||
      (levelFilter === "advanced" && entry.user.level > 50 && entry.user.level <= 80) ||
      (levelFilter === "expert" && entry.user.level > 80);
    
    return matchesSearch && matchesCategory && matchesLevel;
  });

  const getRankChange = (current: number, previous?: number) => {
    if (!previous) return null;
    const change = previous - current;
    if (change > 0) return { type: 'up', value: change };
    if (change < 0) return { type: 'down', value: Math.abs(change) };
    return { type: 'same', value: 0 };
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2: return <Medal className="h-5 w-5 text-gray-400" />;
      case 3: return <Award className="h-5 w-5 text-amber-600" />;
      default: return null;
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setCategoryFilter("all");
    setPeriodFilter("all-time");
    setLevelFilter("all");
  };

  // Statistics
  const totalParticipants = leaderboardData.length;
  const activeChallenges = 45;
  const maxScore = Math.max(...leaderboardData.map(entry => entry.stats.totalPoints));
  const maxStreak = Math.max(...leaderboardData.map(entry => entry.stats.streak));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Clasificación de Desafíos</h2>
          <p className="text-gray-600">Compite con otros estudiantes y sube en el ranking</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar participantes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={periodFilter} onValueChange={setPeriodFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                {periods.map(period => (
                  <SelectItem key={period.value} value={period.value}>
                    {period.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className="flex gap-2">
              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Nivel" />
                </SelectTrigger>
                <SelectContent>
                  {levels.map(level => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button variant="outline" onClick={clearFilters} size="sm">
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Participantes Activos</p>
                <p className="text-2xl font-bold text-gray-900">{totalParticipants.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Target className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Desafíos Activos</p>
                <p className="text-2xl font-bold text-gray-900">{activeChallenges}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Trophy className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Puntuación Máxima</p>
                <p className="text-2xl font-bold text-gray-900">{maxScore.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Flame className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Racha Máxima</p>
                <p className="text-2xl font-bold text-gray-900">{maxStreak} días</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Clasificación ({filteredData.length} participantes)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredData.length > 0 ? (
            <div className="space-y-4">
              {filteredData.map((entry) => {
                const rankChange = getRankChange(entry.rank, entry.previousRank);
                const isTopThree = entry.rank <= 3;
                
                return (
                  <div 
                    key={entry.id} 
                    className={`p-4 border rounded-lg transition-all hover:shadow-md ${
                      isTopThree ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Rank */}
                      <div className="flex items-center gap-2">
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${
                          entry.rank === 1 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white' :
                          entry.rank === 2 ? 'bg-gradient-to-r from-gray-300 to-gray-400 text-white' :
                          entry.rank === 3 ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-white' :
                          'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                        }`}>
                          {getRankIcon(entry.rank) || entry.rank}
                        </div>
                        
                        {/* Rank Change */}
                        {rankChange && (
                          <div className="flex items-center">
                            {rankChange.type === 'up' && (
                              <div className="flex items-center text-green-600">
                                <ChevronUp className="h-4 w-4" />
                                <span className="text-xs font-medium">+{rankChange.value}</span>
                              </div>
                            )}
                            {rankChange.type === 'down' && (
                              <div className="flex items-center text-red-600">
                                <ChevronDown className="h-4 w-4" />
                                <span className="text-xs font-medium">-{rankChange.value}</span>
                              </div>
                            )}
                            {rankChange.type === 'same' && (
                              <div className="flex items-center text-gray-500">
                                <Minus className="h-4 w-4" />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {/* User Info */}
                      <div className="flex items-center gap-3 flex-1">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={entry.user.avatar} />
                          <AvatarFallback>{entry.user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-gray-900">{entry.user.name}</h4>
                            <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0 text-xs">
                              Nivel {entry.user.level}
                            </Badge>
                          </div>
                          
                          {entry.user.title && (
                            <p className="text-sm text-purple-600 font-medium">{entry.user.title}</p>
                          )}
                          
                          <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                            <span>{entry.stats.challengesCompleted} desafíos</span>
                            <span>•</span>
                            <span>{entry.stats.winRate}% éxito</span>
                            <span>•</span>
                            <div className="flex items-center gap-1">
                              <Flame className="h-3 w-3 text-orange-500" />
                              <span>{entry.stats.streak} días</span>
                            </div>
                            <span>•</span>
                            <span>{entry.category}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Achievements */}
                      {isTopThree && entry.achievements.length > 0 && (
                        <div className="hidden md:flex flex-wrap gap-1 max-w-xs">
                          {entry.achievements.slice(0, 2).map((achievement, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {achievement}
                            </Badge>
                          ))}
                          {entry.achievements.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{entry.achievements.length - 2}
                            </Badge>
                          )}
                        </div>
                      )}
                      
                      {/* Stats */}
                      <div className="text-right">
                        <div className="font-bold text-lg text-gray-900">
                          {entry.stats.totalPoints.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-600">puntos totales</div>
                        
                        {periodFilter === 'monthly' && (
                          <div className="text-sm text-purple-600 font-medium mt-1">
                            +{entry.stats.monthlyPoints} este mes
                          </div>
                        )}
                      </div>
                      
                      {/* Last Active */}
                      <div className="text-xs text-gray-500 text-right min-w-[80px]">
                        <Clock className="h-3 w-3 inline mr-1" />
                        {new Date(entry.lastActive).toLocaleDateString()}
                      </div>
                    </div>
                    
                    {/* Extended Stats for Top 3 */}
                    {isTopThree && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="text-center">
                            <div className="font-semibold text-gray-900">{entry.stats.averageScore}%</div>
                            <div className="text-gray-600">Promedio</div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold text-gray-900">{entry.stats.challengesCompleted}</div>
                            <div className="text-gray-600">Completados</div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold text-gray-900">{entry.stats.winRate}%</div>
                            <div className="text-gray-600">Tasa de Éxito</div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold text-gray-900 flex items-center justify-center gap-1">
                              <Flame className="h-3 w-3 text-orange-500" />
                              {entry.stats.streak}
                            </div>
                            <div className="text-gray-600">Racha</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron participantes</h3>
              <p className="text-gray-600 mb-4">Intenta ajustar los filtros de búsqueda</p>
              <Button variant="outline" onClick={clearFilters}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Limpiar Filtros
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}