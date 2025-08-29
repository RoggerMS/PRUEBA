"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  Trophy, 
  Clock, 
  Target, 
  CheckCircle, 
  Play, 
  Pause, 
  RotateCcw, 
  Filter, 
  Calendar, 
  Award, 
  Zap, 
  Flame, 
  Star, 
  TrendingUp, 
  Users, 
  Timer, 
  BookOpen, 
  Brain, 
  Lightbulb, 
  Medal, 
  Crown
} from "lucide-react";
import { ChallengeCard } from "./ChallengeCard";

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
  userStatus?: {
    joined: boolean;
    completed: boolean;
    score?: number;
    rank?: number;
    progress?: number;
    timeSpent?: number;
    attempts?: number;
  };
  image?: string;
}

export function MyChallenges() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);

  // Mock data
  const challenges: Challenge[] = [
    {
      id: "1",
      title: "Desafío Matemático Diario",
      description: "Resuelve 10 problemas de álgebra en tiempo récord",
      category: "Matemáticas",
      difficulty: "intermedio",
      type: "daily",
      points: 150,
      timeLimit: 30,
      participants: 1250,
      completions: 890,
      startDate: "2024-01-15T00:00:00Z",
      endDate: "2024-01-15T23:59:59Z",
      status: "active",
      featured: true,
      tags: ["álgebra", "ecuaciones", "rapidez"],
      creator: {
        id: "c1",
        name: "Prof. García",
        avatar: "/avatars/teacher1.png",
        level: 95
      },
      rewards: {
        crolars: 50,
        xp: 150,
        badges: ["Matemático Veloz"]
      },
      userStatus: {
        joined: true,
        completed: false,
        progress: 60,
        timeSpent: 18,
        attempts: 1,
        rank: 45
      },
      image: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=mathematical%20equations%20and%20formulas%20on%20a%20chalkboard%20with%20colorful%20chalk%20in%20a%20modern%20classroom%20setting&image_size=landscape_4_3"
    },
    {
      id: "2",
      title: "Quiz de Historia Mundial",
      description: "Demuestra tus conocimientos sobre eventos históricos importantes",
      category: "Historia",
      difficulty: "avanzado",
      type: "weekly",
      points: 300,
      timeLimit: 45,
      participants: 850,
      completions: 420,
      startDate: "2024-01-14T00:00:00Z",
      endDate: "2024-01-21T23:59:59Z",
      status: "active",
      featured: false,
      tags: ["historia", "cultura", "eventos"],
      creator: {
        id: "c2",
        name: "Dr. Martínez",
        avatar: "/avatars/teacher2.png",
        level: 88
      },
      rewards: {
        crolars: 100,
        xp: 300,
        badges: ["Historiador Experto", "Conocedor del Mundo"]
      },
      userStatus: {
        joined: true,
        completed: true,
        score: 285,
        rank: 12,
        progress: 100,
        timeSpent: 42,
        attempts: 2
      },
      image: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=ancient%20world%20map%20with%20historical%20landmarks%20and%20monuments%20in%20vintage%20style%20with%20warm%20colors&image_size=landscape_4_3"
    },
    {
      id: "3",
      title: "Laboratorio de Física Cuántica",
      description: "Experimenta con conceptos avanzados de mecánica cuántica",
      category: "Física",
      difficulty: "experto",
      type: "special",
      points: 500,
      timeLimit: 60,
      participants: 320,
      completions: 85,
      startDate: "2024-01-10T00:00:00Z",
      endDate: "2024-01-20T23:59:59Z",
      status: "active",
      featured: true,
      tags: ["física", "cuántica", "experimentos"],
      creator: {
        id: "c3",
        name: "Prof. Einstein",
        avatar: "/avatars/teacher3.png",
        level: 100
      },
      rewards: {
        crolars: 200,
        xp: 500,
        badges: ["Físico Cuántico", "Genio Científico"]
      },
      userStatus: {
        joined: true,
        completed: false,
        progress: 25,
        timeSpent: 35,
        attempts: 3,
        rank: 28
      },
      image: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=quantum%20physics%20laboratory%20with%20particle%20accelerator%20and%20scientific%20equipment%20in%20futuristic%20blue%20lighting&image_size=landscape_4_3"
    },
    {
      id: "4",
      title: "Desafío de Programación",
      description: "Resuelve algoritmos complejos y optimiza tu código",
      category: "Tecnología",
      difficulty: "avanzado",
      type: "community",
      points: 400,
      timeLimit: 90,
      participants: 650,
      completions: 180,
      startDate: "2024-01-12T00:00:00Z",
      endDate: "2024-01-19T23:59:59Z",
      status: "active",
      featured: false,
      tags: ["programación", "algoritmos", "código"],
      creator: {
        id: "c4",
        name: "Dev Master",
        avatar: "/avatars/teacher4.png",
        level: 92
      },
      rewards: {
        crolars: 150,
        xp: 400,
        badges: ["Programador Experto"]
      },
      userStatus: {
        joined: false,
        completed: false
      },
      image: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=programming%20code%20on%20multiple%20monitors%20in%20a%20modern%20developer%20workspace%20with%20neon%20lighting&image_size=landscape_4_3"
    },
    {
      id: "5",
      title: "Arte y Creatividad",
      description: "Explora técnicas artísticas y desarrolla tu creatividad",
      category: "Arte",
      difficulty: "principiante",
      type: "weekly",
      points: 200,
      participants: 420,
      completions: 380,
      startDate: "2024-01-08T00:00:00Z",
      endDate: "2024-01-15T23:59:59Z",
      status: "completed",
      featured: false,
      tags: ["arte", "creatividad", "técnicas"],
      creator: {
        id: "c5",
        name: "Artista Luna",
        avatar: "/avatars/teacher5.png",
        level: 78
      },
      rewards: {
        crolars: 75,
        xp: 200,
        badges: ["Artista Creativo"]
      },
      userStatus: {
        joined: true,
        completed: true,
        score: 195,
        rank: 8,
        progress: 100,
        timeSpent: 120,
        attempts: 1
      },
      image: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=colorful%20art%20studio%20with%20paintbrushes%20canvas%20and%20vibrant%20paintings%20in%20natural%20lighting&image_size=landscape_4_3"
    }
  ];

  const categories = [
    { value: "all", label: "Todas las Categorías" },
    { value: "matematicas", label: "Matemáticas" },
    { value: "historia", label: "Historia" },
    { value: "fisica", label: "Física" },
    { value: "tecnologia", label: "Tecnología" },
    { value: "arte", label: "Arte" },
    { value: "ciencias", label: "Ciencias" },
    { value: "literatura", label: "Literatura" }
  ];

  const statusOptions = [
    { value: "all", label: "Todos los Estados" },
    { value: "joined", label: "Unidos" },
    { value: "completed", label: "Completados" },
    { value: "in-progress", label: "En Progreso" },
    { value: "not-joined", label: "No Unidos" }
  ];

  const sortOptions = [
    { value: "recent", label: "Más Recientes" },
    { value: "points", label: "Más Puntos" },
    { value: "difficulty", label: "Dificultad" },
    { value: "progress", label: "Progreso" },
    { value: "deadline", label: "Fecha Límite" }
  ];

  const filteredChallenges = challenges.filter(challenge => {
    const matchesSearch = challenge.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         challenge.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === "all" || 
                           challenge.category.toLowerCase().includes(categoryFilter);
    
    const matchesStatus = statusFilter === "all" ||
                         (statusFilter === "joined" && challenge.userStatus?.joined) ||
                         (statusFilter === "completed" && challenge.userStatus?.completed) ||
                         (statusFilter === "in-progress" && challenge.userStatus?.joined && !challenge.userStatus?.completed) ||
                         (statusFilter === "not-joined" && !challenge.userStatus?.joined);
    
    return matchesSearch && matchesCategory && matchesStatus;
  }).sort((a, b) => {
    switch (sortBy) {
      case "points":
        return b.points - a.points;
      case "difficulty":
        const difficultyOrder = { "principiante": 1, "intermedio": 2, "avanzado": 3, "experto": 4 };
        return difficultyOrder[b.difficulty as keyof typeof difficultyOrder] - difficultyOrder[a.difficulty as keyof typeof difficultyOrder];
      case "progress":
        return (b.userStatus?.progress || 0) - (a.userStatus?.progress || 0);
      case "deadline":
        if (!a.endDate && !b.endDate) return 0;
        if (!a.endDate) return 1;
        if (!b.endDate) return -1;
        return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
      default:
        return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
    }
  });

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setCategoryFilter("all");
    setSortBy("recent");
  };

  // Statistics
  const joinedChallenges = challenges.filter(c => c.userStatus?.joined).length;
  const completedChallenges = challenges.filter(c => c.userStatus?.completed).length;
  const totalPoints = challenges
    .filter(c => c.userStatus?.completed)
    .reduce((sum, c) => sum + (c.userStatus?.score || c.points), 0);
  const averageRank = challenges
    .filter(c => c.userStatus?.rank)
    .reduce((sum, c, _, arr) => sum + (c.userStatus?.rank || 0) / arr.length, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Mis Desafíos</h2>
          <p className="text-gray-600">Gestiona tus desafíos y sigue tu progreso</p>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Target className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Desafíos Unidos</p>
                <p className="text-2xl font-bold text-gray-900">{joinedChallenges}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Completados</p>
                <p className="text-2xl font-bold text-gray-900">{completedChallenges}</p>
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
                <p className="text-sm text-gray-600">Puntos Totales</p>
                <p className="text-2xl font-bold text-gray-900">{totalPoints.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Medal className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Ranking Promedio</p>
                <p className="text-2xl font-bold text-gray-900">#{Math.round(averageRank) || '-'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar desafíos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map(status => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
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
            
            <div className="flex gap-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
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

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Button 
          variant="outline" 
          onClick={() => setStatusFilter("in-progress")}
          className="flex items-center gap-2"
        >
          <Play className="h-4 w-4" />
          En Progreso
        </Button>
        <Button 
          variant="outline" 
          onClick={() => setStatusFilter("completed")}
          className="flex items-center gap-2"
        >
          <CheckCircle className="h-4 w-4" />
          Completados
        </Button>
        <Button 
          variant="outline" 
          onClick={() => setSortBy("deadline")}
          className="flex items-center gap-2"
        >
          <Clock className="h-4 w-4" />
          Por Vencer
        </Button>
        <Button 
          variant="outline" 
          onClick={() => setSortBy("points")}
          className="flex items-center gap-2"
        >
          <Trophy className="h-4 w-4" />
          Más Puntos
        </Button>
      </div>

      {/* Challenges Grid */}
      {filteredChallenges.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredChallenges.map((challenge) => (
            <div key={challenge.id} className="relative">
              <ChallengeCard 
                challenge={challenge} 
                onClick={() => setSelectedChallenge(challenge)}
              />
              
              {/* User Status Overlay */}
              {challenge.userStatus && (
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                  {challenge.userStatus.joined && (
                    <Badge className="bg-blue-500 text-white border-0">
                      {challenge.userStatus.completed ? 'Completado' : 'En Progreso'}
                    </Badge>
                  )}
                  
                  {challenge.userStatus.rank && (
                    <Badge className="bg-yellow-500 text-white border-0 flex items-center gap-1">
                      <Crown className="h-3 w-3" />
                      #{challenge.userStatus.rank}
                    </Badge>
                  )}
                </div>
              )}
              
              {/* Progress Bar for Active Challenges */}
              {challenge.userStatus?.joined && !challenge.userStatus.completed && challenge.userStatus.progress !== undefined && (
                <div className="absolute bottom-3 left-3 right-3">
                  <div className="bg-white/90 backdrop-blur-sm rounded-lg p-2">
                    <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                      <span>Progreso</span>
                      <span>{challenge.userStatus.progress}%</span>
                    </div>
                    <Progress value={challenge.userStatus.progress} className="h-2" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron desafíos</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery || statusFilter !== "all" || categoryFilter !== "all" 
                ? "Intenta ajustar los filtros de búsqueda" 
                : "Aún no te has unido a ningún desafío"}
            </p>
            <div className="flex gap-2 justify-center">
              {(searchQuery || statusFilter !== "all" || categoryFilter !== "all") && (
                <Button variant="outline" onClick={clearFilters}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Limpiar Filtros
                </Button>
              )}
              <Button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600">
                <Target className="h-4 w-4 mr-2" />
                Explorar Desafíos
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
