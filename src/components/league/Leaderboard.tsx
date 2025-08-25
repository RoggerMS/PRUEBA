"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Trophy, 
  Crown, 
  Medal, 
  Award, 
  Star, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Search, 
  Filter, 
  Flame, 
  Target, 
  Zap, 
  Calendar,
  Users,
  BookOpen,
  CheckCircle
} from "lucide-react";

interface LeaderboardEntry {
  id: string;
  name: string;
  avatar: string;
  score: number;
  rank: number;
  previousRank: number;
  level: string;
  streak: number;
  completedCompetitions: number;
  winRate: number;
  category: string;
  totalPoints: number;
  monthlyPoints: number;
  achievements: string[];
  joinDate: string;
  lastActive: string;
}

export function Leaderboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPeriod, setSelectedPeriod] = useState("all-time");
  const [selectedLevel, setSelectedLevel] = useState("all");

  // Mock data for leaderboard
  const mockLeaderboard: LeaderboardEntry[] = [
    {
      id: "1",
      name: "Ana García",
      avatar: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20student%20avatar%20female%20smiling&image_size=square",
      score: 15420,
      rank: 1,
      previousRank: 2,
      level: "Experto",
      streak: 28,
      completedCompetitions: 45,
      winRate: 78,
      category: "Matemáticas",
      totalPoints: 15420,
      monthlyPoints: 2340,
      achievements: ["Racha de Oro", "Campeón Mensual", "Maestro Matemático"],
      joinDate: "2023-09-15",
      lastActive: "2024-01-15T10:30:00Z"
    },
    {
      id: "2",
      name: "Carlos López",
      avatar: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20student%20avatar%20male%20confident&image_size=square",
      score: 14890,
      rank: 2,
      previousRank: 1,
      level: "Experto",
      streak: 22,
      completedCompetitions: 42,
      winRate: 74,
      category: "Programación",
      totalPoints: 14890,
      monthlyPoints: 2180,
      achievements: ["Código Maestro", "Velocista", "Top 3"],
      joinDate: "2023-08-20",
      lastActive: "2024-01-15T09:15:00Z"
    },
    {
      id: "3",
      name: "María Rodríguez",
      avatar: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20student%20avatar%20female%20focused&image_size=square",
      score: 13650,
      rank: 3,
      previousRank: 4,
      level: "Avanzado",
      streak: 19,
      completedCompetitions: 38,
      winRate: 71,
      category: "Ciencias",
      totalPoints: 13650,
      monthlyPoints: 1950,
      achievements: ["Científica", "Constancia", "Escalador"],
      joinDate: "2023-10-05",
      lastActive: "2024-01-15T08:45:00Z"
    },
    {
      id: "4",
      name: "Diego Martín",
      avatar: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20student%20avatar%20male%20serious&image_size=square",
      score: 12980,
      rank: 4,
      previousRank: 3,
      level: "Avanzado",
      streak: 15,
      completedCompetitions: 35,
      winRate: 69,
      category: "Historia",
      totalPoints: 12980,
      monthlyPoints: 1820,
      achievements: ["Historiador", "Perseverante"],
      joinDate: "2023-11-12",
      lastActive: "2024-01-14T16:20:00Z"
    },
    {
      id: "5",
      name: "Sofía Chen",
      avatar: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20student%20avatar%20female%20determined&image_size=square",
      score: 11750,
      rank: 5,
      previousRank: 6,
      level: "Avanzado",
      streak: 12,
      completedCompetitions: 32,
      winRate: 66,
      category: "Idiomas",
      totalPoints: 11750,
      monthlyPoints: 1680,
      achievements: ["Políglota", "Dedicación"],
      joinDate: "2023-12-01",
      lastActive: "2024-01-15T07:30:00Z"
    }
  ];

  const categories = [
    { value: "all", label: "Todas las categorías" },
    { value: "matemáticas", label: "Matemáticas" },
    { value: "programación", label: "Programación" },
    { value: "ciencias", label: "Ciencias" },
    { value: "historia", label: "Historia" },
    { value: "idiomas", label: "Idiomas" }
  ];

  const periods = [
    { value: "all-time", label: "Histórico" },
    { value: "monthly", label: "Este mes" },
    { value: "weekly", label: "Esta semana" },
    { value: "daily", label: "Hoy" }
  ];

  const levels = [
    { value: "all", label: "Todos los niveles" },
    { value: "principiante", label: "Principiante" },
    { value: "intermedio", label: "Intermedio" },
    { value: "avanzado", label: "Avanzado" },
    { value: "experto", label: "Experto" }
  ];

  const filteredLeaderboard = mockLeaderboard.filter(entry => {
    const matchesSearch = entry.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || entry.category.toLowerCase() === selectedCategory;
    const matchesLevel = selectedLevel === "all" || entry.level.toLowerCase() === selectedLevel;
    
    return matchesSearch && matchesCategory && matchesLevel;
  });

  const getRankChange = (current: number, previous: number) => {
    if (current < previous) {
      return { type: 'up', value: previous - current };
    } else if (current > previous) {
      return { type: 'down', value: current - previous };
    }
    return { type: 'same', value: 0 };
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-orange-500" />;
      default:
        return (
          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-white flex items-center justify-center text-sm font-bold">
            {rank}
          </div>
        );
    }
  };

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Hace menos de 1 hora';
    if (diffInHours < 24) return `Hace ${diffInHours} hora${diffInHours !== 1 ? 's' : ''}`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `Hace ${diffInDays} día${diffInDays !== 1 ? 's' : ''}`;
    
    return formatDate(dateString);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Clasificación General</h2>
          <p className="text-gray-600">Los mejores competidores de la liga académica</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
            <Trophy className="h-3 w-3 mr-1" />
            Liga Académica
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar participante..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
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
            
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
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
            
            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
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
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 text-gray-600 mb-2">
              <Users className="h-5 w-5" />
            </div>
            <div className="text-2xl font-bold text-gray-900">1,247</div>
            <div className="text-sm text-gray-500">Participantes Activos</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 text-gray-600 mb-2">
              <Trophy className="h-5 w-5" />
            </div>
            <div className="text-2xl font-bold text-gray-900">89</div>
            <div className="text-sm text-gray-500">Competencias Activas</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 text-gray-600 mb-2">
              <Target className="h-5 w-5" />
            </div>
            <div className="text-2xl font-bold text-gray-900">15,420</div>
            <div className="text-sm text-gray-500">Puntuación Máxima</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 text-gray-600 mb-2">
              <Flame className="h-5 w-5" />
            </div>
            <div className="text-2xl font-bold text-gray-900">28</div>
            <div className="text-sm text-gray-500">Racha Máxima</div>
          </CardContent>
        </Card>
      </div>

      {/* Leaderboard */}
      <div className="space-y-4">
        {filteredLeaderboard.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-gray-400 mb-4">
                <Search className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No se encontraron resultados
              </h3>
              <p className="text-gray-600">
                Intenta ajustar los filtros de búsqueda
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredLeaderboard.map((entry, index) => {
            const rankChange = getRankChange(entry.rank, entry.previousRank);
            
            return (
              <Card 
                key={entry.id} 
                className={`transition-all duration-300 hover:shadow-lg ${
                  entry.rank <= 3 ? 'ring-2 ring-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50' : 'hover:shadow-md'
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-6">
                    {/* Rank */}
                    <div className="flex items-center gap-3">
                      {getRankIcon(entry.rank)}
                      
                      {/* Rank Change */}
                      <div className="flex flex-col items-center">
                        {rankChange.type === 'up' && (
                          <div className="flex items-center gap-1 text-green-600">
                            <TrendingUp className="h-3 w-3" />
                            <span className="text-xs font-medium">+{rankChange.value}</span>
                          </div>
                        )}
                        {rankChange.type === 'down' && (
                          <div className="flex items-center gap-1 text-red-600">
                            <TrendingDown className="h-3 w-3" />
                            <span className="text-xs font-medium">-{rankChange.value}</span>
                          </div>
                        )}
                        {rankChange.type === 'same' && (
                          <div className="flex items-center gap-1 text-gray-400">
                            <Minus className="h-3 w-3" />
                            <span className="text-xs">-</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Avatar and Info */}
                    <div className="flex items-center gap-4 flex-1">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-white shadow-lg">
                          <img 
                            src={entry.avatar} 
                            alt={entry.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        {/* Streak Badge */}
                        {entry.streak > 0 && (
                          <div className="absolute -bottom-1 -right-1 bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                            <Flame className="h-3 w-3" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {entry.name}
                          </h3>
                          <Badge className={getLevelColor(entry.level)}>
                            {entry.level}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Trophy className="h-4 w-4" />
                            {entry.completedCompetitions} competencias
                          </span>
                          <span className="flex items-center gap-1">
                            <Target className="h-4 w-4" />
                            {entry.winRate}% victorias
                          </span>
                          <span className="flex items-center gap-1">
                            <Flame className="h-4 w-4" />
                            {entry.streak} días
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2 mt-2">
                          <Badge className={getCategoryColor(entry.category)}>
                            {entry.category}
                          </Badge>
                          
                          {entry.achievements.slice(0, 2).map(achievement => (
                            <Badge key={achievement} variant="outline" className="text-xs">
                              <Star className="h-3 w-3 mr-1" />
                              {achievement}
                            </Badge>
                          ))}
                          
                          {entry.achievements.length > 2 && (
                            <span className="text-xs text-gray-500">
                              +{entry.achievements.length - 2} más
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Score and Stats */}
                    <div className="text-right space-y-2">
                      <div className="text-2xl font-bold text-gray-900">
                        {entry.score.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">puntos totales</div>
                      
                      {selectedPeriod === 'monthly' && (
                        <div className="text-sm">
                          <span className="text-purple-600 font-medium">
                            +{entry.monthlyPoints.toLocaleString()}
                          </span>
                          <span className="text-gray-500 ml-1">este mes</span>
                        </div>
                      )}
                      
                      <div className="text-xs text-gray-400">
                        Activo {getTimeAgo(entry.lastActive)}
                      </div>
                    </div>
                    
                    {/* Action Button */}
                    <div className="flex flex-col gap-2">
                      <Button variant="outline" size="sm">
                        Ver Perfil
                      </Button>
                      
                      {entry.rank <= 3 && (
                        <Badge className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs justify-center">
                          <Crown className="h-3 w-3 mr-1" />
                          Top 3
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {/* Additional Stats for Top 3 */}
                  {entry.rank <= 3 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-lg font-semibold text-purple-600">
                            {entry.totalPoints.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-500">Puntos Totales</div>
                        </div>
                        
                        <div>
                          <div className="text-lg font-semibold text-green-600">
                            {entry.completedCompetitions}
                          </div>
                          <div className="text-xs text-gray-500">Competencias</div>
                        </div>
                        
                        <div>
                          <div className="text-lg font-semibold text-orange-600">
                            {entry.streak}
                          </div>
                          <div className="text-xs text-gray-500">Días de Racha</div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Load More */}
      {filteredLeaderboard.length > 0 && (
        <div className="text-center">
          <Button variant="outline" className="px-8">
            Cargar Más Resultados
          </Button>
        </div>
      )}
    </div>
  );
}
