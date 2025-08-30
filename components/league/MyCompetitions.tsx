"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { 
  Trophy, 
  Medal, 
  Clock, 
  Star, 
  Users, 
  Calendar, 
  Target, 
  Play, 
  CheckCircle, 
  XCircle, 
  Award, 
  TrendingUp, 
  Search, 
  Filter, 
  Eye,
  BarChart3,
  Timer,
  Zap
} from "lucide-react";

interface UserCompetition {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  status: 'active' | 'completed' | 'upcoming';
  userStatus: 'participating' | 'won' | 'lost' | 'registered';
  startDate: Date;
  endDate: Date;
  participants: number;
  maxParticipants: number;
  prize: number;
  image: string;
  organizer: {
    name: string;
    avatar: string;
  };
  userRank?: number;
  userScore?: number;
  progress?: number;
  timeSpent?: string;
  badges?: string[];
}

interface MyCompetitionsProps {
  onViewCompetition?: (competitionId: string) => void;
}

export function MyCompetitions({ onViewCompetition }: MyCompetitionsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [activeTab, setActiveTab] = useState("all");

  // Mock user competitions data
  const [userCompetitions] = useState<UserCompetition[]>([
    {
      id: "1",
      title: "Desafío Matemático Supremo",
      description: "Competencia de matemáticas avanzadas con problemas de álgebra, cálculo y geometría",
      category: "Matemáticas",
      difficulty: "Avanzado",
      status: "active",
      userStatus: "participating",
      startDate: new Date('2024-02-20'),
      endDate: new Date('2024-02-25'),
      participants: 234,
      maxParticipants: 500,
      prize: 1000,
      image: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=mathematics%20competition%20advanced%20algebra&image_size=landscape_4_3",
      organizer: {
        name: "Departamento de Matemáticas",
        avatar: "/avatars/math-dept.jpg"
      },
      userRank: 15,
      userScore: 1850,
      progress: 65,
      timeSpent: "4h 30m",
      badges: ["Participante Activo"]
    },
    {
      id: "2",
      title: "Quiz de Ciencias Naturales",
      description: "Competencia de conocimientos en biología, química y física",
      category: "Ciencias",
      difficulty: "Intermedio",
      status: "completed",
      userStatus: "won",
      startDate: new Date('2024-02-18'),
      endDate: new Date('2024-02-18'),
      participants: 156,
      maxParticipants: 200,
      prize: 500,
      image: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=science%20quiz%20biology%20chemistry%20physics&image_size=landscape_4_3",
      organizer: {
        name: "Facultad de Ciencias",
        avatar: "/avatars/science-faculty.jpg"
      },
      userRank: 3,
      userScore: 2650,
      progress: 100,
      timeSpent: "1h 45m",
      badges: ["Tercer Lugar", "Científico Destacado"]
    },
    {
      id: "3",
      title: "Torneo de Programación",
      description: "Competencia de algoritmos y estructuras de datos",
      category: "Programación",
      difficulty: "Intermedio",
      status: "upcoming",
      userStatus: "registered",
      startDate: new Date('2024-02-22'),
      endDate: new Date('2024-02-24'),
      participants: 189,
      maxParticipants: 300,
      prize: 750,
      image: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=programming%20competition%20algorithms%20coding&image_size=landscape_4_3",
      organizer: {
        name: "Club de Programación",
        avatar: "/avatars/programming-club.jpg"
      },
      progress: 0,
      badges: []
    },
    {
      id: "4",
      title: "Competencia de Historia Antigua",
      description: "Desafío sobre civilizaciones antiguas",
      category: "Historia",
      difficulty: "Avanzado",
      status: "completed",
      userStatus: "lost",
      startDate: new Date('2024-02-10'),
      endDate: new Date('2024-02-12'),
      participants: 89,
      maxParticipants: 100,
      prize: 400,
      image: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=ancient%20history%20competition%20civilizations&image_size=landscape_4_3",
      organizer: {
        name: "Departamento de Historia",
        avatar: "/avatars/history-dept.jpg"
      },
      userRank: 45,
      userScore: 1200,
      progress: 100,
      timeSpent: "2h 15m",
      badges: ["Participante"]
    },
    {
      id: "5",
      title: "Desafío de Idiomas",
      description: "Competencia multiidioma: inglés, francés y alemán",
      category: "Idiomas",
      difficulty: "Intermedio",
      status: "completed",
      userStatus: "won",
      startDate: new Date('2024-02-05'),
      endDate: new Date('2024-02-07'),
      participants: 67,
      maxParticipants: 80,
      prize: 600,
      image: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=language%20competition%20multilingual%20challenge&image_size=landscape_4_3",
      organizer: {
        name: "Centro de Idiomas",
        avatar: "/avatars/language-center.jpg"
      },
      userRank: 1,
      userScore: 2950,
      progress: 100,
      timeSpent: "3h 20m",
      badges: ["Primer Lugar", "Políglota", "Campeón"]
    }
  ]);

  const categories = [
    { value: "all", label: "Todas las categorías" },
    { value: "matematicas", label: "Matemáticas" },
    { value: "programacion", label: "Programación" },
    { value: "ciencias", label: "Ciencias" },
    { value: "historia", label: "Historia" },
    { value: "idiomas", label: "Idiomas" }
  ];

  const statuses = [
    { value: "all", label: "Todos los estados" },
    { value: "active", label: "Activas" },
    { value: "completed", label: "Completadas" },
    { value: "upcoming", label: "Próximas" }
  ];

  const sortOptions = [
    { value: "recent", label: "Más recientes" },
    { value: "oldest", label: "Más antiguas" },
    { value: "rank", label: "Mejor posición" },
    { value: "score", label: "Mayor puntuación" }
  ];

  // Filter competitions
  const filteredCompetitions = userCompetitions.filter(competition => {
    const matchesSearch = competition.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         competition.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === "all" || 
                           competition.category.toLowerCase() === selectedCategory;
    
    const matchesStatus = selectedStatus === "all" || 
                         competition.status === selectedStatus;
    
    const matchesTab = activeTab === "all" || 
                      (activeTab === "won" && competition.userStatus === "won") ||
                      (activeTab === "participating" && competition.userStatus === "participating") ||
                      (activeTab === "upcoming" && competition.userStatus === "registered");
    
    return matchesSearch && matchesCategory && matchesStatus && matchesTab;
  });

  // Sort competitions
  const sortedCompetitions = [...filteredCompetitions].sort((a, b) => {
    switch (sortBy) {
      case "recent":
        return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
      case "oldest":
        return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
      case "rank":
        return (a.userRank || 999) - (b.userRank || 999);
      case "score":
        return (b.userScore || 0) - (a.userScore || 0);
      default:
        return 0;
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'upcoming': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getUserStatusColor = (userStatus: string) => {
    switch (userStatus) {
      case 'won': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'participating': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'lost': return 'bg-red-100 text-red-800 border-red-200';
      case 'registered': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getUserStatusText = (userStatus: string) => {
    switch (userStatus) {
      case 'won': return 'Ganaste';
      case 'participating': return 'Participando';
      case 'lost': return 'No clasificaste';
      case 'registered': return 'Registrado';
      default: return userStatus;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Principiante': return 'bg-green-100 text-green-800';
      case 'Intermedio': return 'bg-yellow-100 text-yellow-800';
      case 'Avanzado': return 'bg-orange-100 text-orange-800';
      case 'Experto': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Calculate stats
  const totalCompetitions = userCompetitions.length;
  const wonCompetitions = userCompetitions.filter(c => c.userStatus === 'won').length;
  const activeCompetitions = userCompetitions.filter(c => c.status === 'active').length;
  const totalPoints = userCompetitions.reduce((sum, c) => sum + (c.userScore || 0), 0);
  const winRate = totalCompetitions > 0 ? Math.round((wonCompetitions / totalCompetitions) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Trophy className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{totalCompetitions}</p>
                <p className="text-sm text-gray-600">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Medal className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{wonCompetitions}</p>
                <p className="text-sm text-gray-600">Ganadas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Play className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{activeCompetitions}</p>
                <p className="text-sm text-gray-600">Activas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Award className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{totalPoints}</p>
                <p className="text-sm text-gray-600">Puntos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{winRate}%</p>
                <p className="text-sm text-gray-600">Tasa Victoria</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar competencias..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
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

        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            {statuses.map(status => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-48">
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

      {/* Competition Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">Todas ({totalCompetitions})</TabsTrigger>
          <TabsTrigger value="won">Ganadas ({wonCompetitions})</TabsTrigger>
          <TabsTrigger value="participating">Activas ({activeCompetitions})</TabsTrigger>
          <TabsTrigger value="upcoming">Próximas</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {sortedCompetitions.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">No se encontraron competencias</p>
                <p className="text-sm text-gray-500">
                  Intenta ajustar los filtros o únete a nuevas competencias
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {sortedCompetitions.map((competition) => (
                <Card key={competition.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex gap-6">
                      {/* Competition Image */}
                      <div className="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        <img 
                          src={competition.image} 
                          alt={competition.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Competition Info */}
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                              {competition.title}
                            </h3>
                            <p className="text-gray-600 text-sm line-clamp-2">
                              {competition.description}
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Badge className={`${getStatusColor(competition.status)}`}>
                              {competition.status === 'active' ? 'Activa' : 
                               competition.status === 'completed' ? 'Completada' : 'Próxima'}
                            </Badge>
                            <Badge className={`${getUserStatusColor(competition.userStatus)}`}>
                              {getUserStatusText(competition.userStatus)}
                            </Badge>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Target className="h-4 w-4" />
                            <span>{competition.category}</span>
                          </div>
                          <Badge className={`${getDifficultyColor(competition.difficulty)}`}>
                            {competition.difficulty}
                          </Badge>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(competition.startDate)} - {formatDate(competition.endDate)}</span>
                          </div>
                          {competition.timeSpent && (
                            <div className="flex items-center gap-1">
                              <Timer className="h-4 w-4" />
                              <span>{competition.timeSpent}</span>
                            </div>
                          )}
                        </div>

                        {/* Progress and Stats */}
                        {competition.status === 'active' && competition.progress !== undefined && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">Progreso</span>
                              <span className="font-medium">{competition.progress}%</span>
                            </div>
                            <Progress value={competition.progress} className="h-2" />
                          </div>
                        )}

                        {competition.userRank && competition.userScore && (
                          <div className="flex items-center gap-6 text-sm">
                            <div className="flex items-center gap-2">
                              <Trophy className="h-4 w-4 text-yellow-600" />
                              <span className="font-medium">Posición #{competition.userRank}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Star className="h-4 w-4 text-purple-600" />
                              <span className="font-medium">{competition.userScore} puntos</span>
                            </div>
                            {competition.prize > 0 && competition.userStatus === 'won' && (
                              <div className="flex items-center gap-2">
                                <Award className="h-4 w-4 text-green-600" />
                                <span className="font-medium text-green-600">
                                  +{competition.prize} Crolars
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Badges */}
                        {competition.badges && competition.badges.length > 0 && (
                          <div className="flex items-center gap-2">
                            {competition.badges.map((badge, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                <Award className="h-3 w-3 mr-1" />
                                {badge}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => onViewCompetition?.(competition.id)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Detalles
                        </Button>
                        
                        {competition.status === 'active' && competition.userStatus === 'participating' && (
                          <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                            <Play className="h-4 w-4 mr-2" />
                            Continuar
                          </Button>
                        )}
                        
                        {competition.status === 'completed' && (
                          <Button variant="outline" size="sm">
                            <BarChart3 className="h-4 w-4 mr-2" />
                            Ver Resultados
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}