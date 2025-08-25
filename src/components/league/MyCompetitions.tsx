"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CompetitionCard } from "./CompetitionCard";
import { 
  Trophy, 
  Calendar, 
  Clock, 
  Users, 
  Target, 
  Award, 
  Search, 
  Filter, 
  Plus, 
  TrendingUp, 
  CheckCircle, 
  AlertCircle, 
  Play, 
  Pause,
  Star,
  Medal,
  Crown,
  Flame
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
  prize: string;
  status: 'upcoming' | 'active' | 'completed' | 'paused';
  featured: boolean;
  organizer: string;
  tags: string[];
  myStatus: 'registered' | 'participating' | 'completed' | 'winner' | 'not-registered';
  myRank?: number;
  myScore?: number;
  progress?: number;
}

export function MyCompetitions() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedMyStatus, setSelectedMyStatus] = useState("all");
  const [sortBy, setSortBy] = useState("recent");

  // Mock data for user's competitions
  const mockCompetitions: Competition[] = [
    {
      id: "1",
      title: "Desafío de Algoritmos Avanzados",
      description: "Resuelve problemas complejos de programación y algoritmos en tiempo limitado.",
      image: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=programming%20algorithms%20competition%20coding%20challenge&image_size=landscape_4_3",
      category: "Programación",
      difficulty: "Experto",
      participants: 156,
      maxParticipants: 200,
      startDate: "2024-01-10T09:00:00Z",
      endDate: "2024-01-17T18:00:00Z",
      duration: "7 días",
      prize: "500 Crolars + Certificado",
      status: "active",
      featured: true,
      organizer: "Prof. García",
      tags: ["Algoritmos", "Python", "Competitivo"],
      myStatus: "participating",
      myRank: 12,
      myScore: 850,
      progress: 65
    },
    {
      id: "2",
      title: "Olimpiada de Matemáticas",
      description: "Competencia de matemáticas con problemas de álgebra, geometría y cálculo.",
      image: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=mathematics%20olympiad%20competition%20formulas%20equations&image_size=landscape_4_3",
      category: "Matemáticas",
      difficulty: "Avanzado",
      participants: 89,
      maxParticipants: 100,
      startDate: "2024-01-05T10:00:00Z",
      endDate: "2024-01-05T15:00:00Z",
      duration: "5 horas",
      prize: "300 Crolars + Medalla",
      status: "completed",
      featured: false,
      organizer: "Dr. Martínez",
      tags: ["Álgebra", "Geometría", "Cálculo"],
      myStatus: "winner",
      myRank: 1,
      myScore: 95,
      progress: 100
    },
    {
      id: "3",
      title: "Quiz de Historia Universal",
      description: "Pon a prueba tus conocimientos sobre eventos históricos importantes.",
      image: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=history%20quiz%20ancient%20civilizations%20world%20events&image_size=landscape_4_3",
      category: "Historia",
      difficulty: "Intermedio",
      participants: 234,
      maxParticipants: 300,
      startDate: "2024-01-20T14:00:00Z",
      endDate: "2024-01-20T16:00:00Z",
      duration: "2 horas",
      prize: "200 Crolars",
      status: "upcoming",
      featured: false,
      organizer: "Prof. López",
      tags: ["Antigua", "Medieval", "Moderna"],
      myStatus: "registered",
      progress: 0
    },
    {
      id: "4",
      title: "Laboratorio de Química",
      description: "Experimentos virtuales y resolución de problemas químicos.",
      image: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=chemistry%20laboratory%20experiments%20molecules%20reactions&image_size=landscape_4_3",
      category: "Ciencias",
      difficulty: "Avanzado",
      participants: 67,
      maxParticipants: 80,
      startDate: "2024-01-12T11:00:00Z",
      endDate: "2024-01-19T17:00:00Z",
      duration: "1 semana",
      prize: "400 Crolars + Kit de Lab",
      status: "active",
      featured: true,
      organizer: "Dra. Chen",
      tags: ["Orgánica", "Inorgánica", "Laboratorio"],
      myStatus: "participating",
      myRank: 8,
      myScore: 720,
      progress: 45
    },
    {
      id: "5",
      title: "Torneo de Inglés",
      description: "Competencia de comprensión lectora y gramática en inglés.",
      image: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=english%20language%20competition%20grammar%20reading%20comprehension&image_size=landscape_4_3",
      category: "Idiomas",
      difficulty: "Intermedio",
      participants: 145,
      maxParticipants: 200,
      startDate: "2023-12-28T09:00:00Z",
      endDate: "2023-12-28T12:00:00Z",
      duration: "3 horas",
      prize: "250 Crolars",
      status: "completed",
      featured: false,
      organizer: "Prof. Johnson",
      tags: ["Grammar", "Reading", "Vocabulary"],
      myStatus: "completed",
      myRank: 23,
      myScore: 78,
      progress: 100
    }
  ];

  const statusOptions = [
    { value: "all", label: "Todos los estados" },
    { value: "upcoming", label: "Próximas" },
    { value: "active", label: "Activas" },
    { value: "completed", label: "Completadas" },
    { value: "paused", label: "Pausadas" }
  ];

  const myStatusOptions = [
    { value: "all", label: "Mi participación" },
    { value: "registered", label: "Registrado" },
    { value: "participating", label: "Participando" },
    { value: "completed", label: "Completadas" },
    { value: "winner", label: "Ganadas" },
    { value: "not-registered", label: "No registrado" }
  ];

  const categories = [
    { value: "all", label: "Todas las categorías" },
    { value: "matemáticas", label: "Matemáticas" },
    { value: "programación", label: "Programación" },
    { value: "ciencias", label: "Ciencias" },
    { value: "historia", label: "Historia" },
    { value: "idiomas", label: "Idiomas" }
  ];

  const sortOptions = [
    { value: "recent", label: "Más recientes" },
    { value: "ending-soon", label: "Terminan pronto" },
    { value: "my-rank", label: "Mi ranking" },
    { value: "my-score", label: "Mi puntuación" },
    { value: "participants", label: "Más participantes" },
    { value: "prize", label: "Mayor premio" }
  ];

  const filteredCompetitions = mockCompetitions.filter(competition => {
    const matchesSearch = competition.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         competition.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === "all" || competition.status === selectedStatus;
    const matchesCategory = selectedCategory === "all" || competition.category.toLowerCase() === selectedCategory;
    const matchesMyStatus = selectedMyStatus === "all" || competition.myStatus === selectedMyStatus;
    
    return matchesSearch && matchesStatus && matchesCategory && matchesMyStatus;
  });

  // Calculate statistics
  const stats = {
    total: mockCompetitions.length,
    active: mockCompetitions.filter(c => c.myStatus === 'participating').length,
    completed: mockCompetitions.filter(c => c.myStatus === 'completed' || c.myStatus === 'winner').length,
    won: mockCompetitions.filter(c => c.myStatus === 'winner').length,
    avgRank: Math.round(mockCompetitions.filter(c => c.myRank).reduce((sum, c) => sum + (c.myRank || 0), 0) / mockCompetitions.filter(c => c.myRank).length) || 0,
    totalScore: mockCompetitions.filter(c => c.myScore).reduce((sum, c) => sum + (c.myScore || 0), 0)
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-700';
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'completed':
        return 'bg-gray-100 text-gray-700';
      case 'paused':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getMyStatusColor = (myStatus: string) => {
    switch (myStatus) {
      case 'registered':
        return 'bg-blue-100 text-blue-700';
      case 'participating':
        return 'bg-green-100 text-green-700';
      case 'completed':
        return 'bg-gray-100 text-gray-700';
      case 'winner':
        return 'bg-yellow-100 text-yellow-700';
      case 'not-registered':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getMyStatusIcon = (myStatus: string) => {
    switch (myStatus) {
      case 'registered':
        return <CheckCircle className="h-4 w-4" />;
      case 'participating':
        return <Play className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'winner':
        return <Crown className="h-4 w-4" />;
      case 'not-registered':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getMyStatusLabel = (myStatus: string) => {
    switch (myStatus) {
      case 'registered':
        return 'Registrado';
      case 'participating':
        return 'Participando';
      case 'completed':
        return 'Completada';
      case 'winner':
        return 'Ganador';
      case 'not-registered':
        return 'No registrado';
      default:
        return 'Desconocido';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Mis Competencias</h2>
          <p className="text-gray-600">Gestiona tu participación en la liga académica</p>
        </div>
        
        <Button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600">
          <Plus className="h-4 w-4 mr-2" />
          Buscar Competencias
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.total}</div>
            <div className="text-sm text-gray-500">Total</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <div className="text-sm text-gray-500">Activas</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.completed}</div>
            <div className="text-sm text-gray-500">Completadas</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.won}</div>
            <div className="text-sm text-gray-500">Ganadas</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.avgRank}</div>
            <div className="text-sm text-gray-500">Ranking Prom.</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-indigo-600">{stats.totalScore.toLocaleString()}</div>
            <div className="text-sm text-gray-500">Puntos Total</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar competencias..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedMyStatus} onValueChange={setSelectedMyStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Mi estado" />
              </SelectTrigger>
              <SelectContent>
                {myStatusOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
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
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setSelectedMyStatus('participating')}
        >
          <Play className="h-4 w-4 mr-2" />
          Participando Ahora
        </Button>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setSelectedStatus('upcoming')}
        >
          <Calendar className="h-4 w-4 mr-2" />
          Próximas
        </Button>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setSelectedMyStatus('winner')}
        >
          <Crown className="h-4 w-4 mr-2" />
          Mis Victorias
        </Button>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setSortBy('my-rank')}
        >
          <TrendingUp className="h-4 w-4 mr-2" />
          Mejor Ranking
        </Button>
      </div>

      {/* Competitions Grid */}
      {filteredCompetitions.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-gray-400 mb-4">
              <Trophy className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No se encontraron competencias
            </h3>
            <p className="text-gray-600 mb-4">
              {searchQuery || selectedStatus !== "all" || selectedCategory !== "all" || selectedMyStatus !== "all"
                ? "Intenta ajustar los filtros de búsqueda"
                : "Aún no te has registrado en ninguna competencia"}
            </p>
            <Button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600">
              <Plus className="h-4 w-4 mr-2" />
              Explorar Competencias
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompetitions.map((competition) => (
            <div key={competition.id} className="relative">
              {/* My Status Badge */}
              <div className="absolute top-4 right-4 z-10">
                <Badge className={`${getMyStatusColor(competition.myStatus)} flex items-center gap-1`}>
                  {getMyStatusIcon(competition.myStatus)}
                  {getMyStatusLabel(competition.myStatus)}
                </Badge>
              </div>
              
              {/* Rank Badge for participating/completed */}
              {competition.myRank && (competition.myStatus === 'participating' || competition.myStatus === 'completed' || competition.myStatus === 'winner') && (
                <div className="absolute top-4 left-4 z-10">
                  <Badge className={`${
                    competition.myRank <= 3 
                      ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white' 
                      : 'bg-white text-gray-700'
                  } flex items-center gap-1`}>
                    {competition.myRank <= 3 ? (
                      competition.myRank === 1 ? <Crown className="h-3 w-3" /> :
                      competition.myRank === 2 ? <Medal className="h-3 w-3" /> :
                      <Award className="h-3 w-3" />
                    ) : (
                      <Target className="h-3 w-3" />
                    )}
                    #{competition.myRank}
                  </Badge>
                </div>
              )}
              
              {/* Progress Bar for active competitions */}
              {competition.myStatus === 'participating' && competition.progress !== undefined && (
                <div className="absolute bottom-4 left-4 right-4 z-10">
                  <div className="bg-white/90 backdrop-blur-sm rounded-lg p-2">
                    <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                      <span>Progreso</span>
                      <span>{competition.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${competition.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}
              
              <CompetitionCard
                competition={competition as any}
                onClick={() => console.log('View competition:', competition.id)}
              />
            </div>
          ))}
        </div>
      )}

      {/* Load More */}
      {filteredCompetitions.length > 0 && (
        <div className="text-center">
          <Button variant="outline" className="px-8">
            Cargar Más Competencias
          </Button>
        </div>
      )}
    </div>
  );
}
