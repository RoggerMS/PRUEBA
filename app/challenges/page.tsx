"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Trophy, 
  Calendar, 
  Clock, 
  Users, 
  Target, 
  Award, 
  Search, 
  Filter, 
  Star, 
  Zap, 
  BookOpen, 
  Lightbulb, 
  Flag, 
  TrendingUp, 
  Medal, 
  Crown, 
  Flame, 
  CheckCircle, 
  Play, 
  Timer, 
  Brain, 
  Puzzle, 
  GameController2,
  Plus
} from "lucide-react";
import { ChallengeCard } from "@/components/challenges/ChallengeCard";
import { ChallengeDetail } from "@/components/challenges/ChallengeDetail";
import { ChallengeLeaderboard } from "@/components/challenges/ChallengeLeaderboard";
import { MyChallenges } from "@/components/challenges/MyChallenges";
import { CreateChallenge } from "@/components/challenges/CreateChallenge";

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

export default function ChallengesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [activeTab, setActiveTab] = useState("browse");
  const [showCreateChallenge, setShowCreateChallenge] = useState(false);

  // Mock data
  const challenges: Challenge[] = [
    {
      id: "1",
      title: "Desafío Diario: Matemáticas Rápidas",
      description: "Resuelve 10 problemas de matemáticas en el menor tiempo posible. Incluye álgebra, geometría y aritmética básica.",
      category: "matemáticas",
      difficulty: "intermedio",
      type: "daily",
      points: 50,
      timeLimit: 15,
      participants: 1247,
      completions: 892,
      startDate: "2024-01-15",
      status: "active",
      featured: true,
      tags: ["matemáticas", "velocidad", "diario"],
      creator: {
        id: "system",
        name: "CRUNEVO",
        avatar: "/avatars/system.png",
        level: 100
      },
      rewards: {
        crolars: 25,
        xp: 50,
        badges: ["Matemático Rápido"]
      },
      image: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=mathematical%20equations%20and%20formulas%20floating%20in%20space%20with%20purple%20and%20blue%20gradient%20background%2C%20modern%20digital%20art%20style&image_size=landscape_4_3"
    },
    {
      id: "2",
      title: "Reto Semanal: Programación Creativa",
      description: "Crea un programa que genere arte ASCII. Demuestra tu creatividad y habilidades de programación.",
      category: "programación",
      difficulty: "avanzado",
      type: "weekly",
      points: 200,
      timeLimit: 120,
      participants: 456,
      completions: 234,
      startDate: "2024-01-14",
      endDate: "2024-01-21",
      status: "active",
      featured: true,
      tags: ["programación", "creatividad", "arte"],
      creator: {
        id: "prof1",
        name: "Prof. García",
        avatar: "/avatars/prof1.png",
        level: 85
      },
      rewards: {
        crolars: 100,
        xp: 200,
        badges: ["Artista del Código", "Programador Creativo"]
      },
      requirements: ["Conocimientos básicos de programación", "Cualquier lenguaje de programación"],
      image: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=colorful%20ASCII%20art%20patterns%20and%20code%20symbols%20on%20dark%20background%2C%20cyberpunk%20aesthetic%20with%20neon%20colors&image_size=landscape_4_3"
    },
    {
      id: "3",
      title: "Desafío de Ciencias: Experimento Virtual",
      description: "Diseña y explica un experimento de física usando simulaciones. Demuestra tu comprensión de los principios científicos.",
      category: "ciencias",
      difficulty: "intermedio",
      type: "special",
      points: 150,
      timeLimit: 60,
      participants: 789,
      completions: 456,
      startDate: "2024-01-13",
      endDate: "2024-01-20",
      status: "active",
      featured: false,
      tags: ["física", "experimento", "simulación"],
      creator: {
        id: "prof2",
        name: "Dra. Martínez",
        avatar: "/avatars/prof2.png",
        level: 92
      },
      rewards: {
        crolars: 75,
        xp: 150,
        badges: ["Científico Virtual"]
      },
      image: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=scientific%20laboratory%20with%20virtual%20reality%20elements%2C%20holographic%20molecules%20and%20physics%20formulas%2C%20futuristic%20blue%20lighting&image_size=landscape_4_3"
    },
    {
      id: "4",
      title: "Rompecabezas de Lógica",
      description: "Resuelve una serie de acertijos lógicos y puzzles mentales. Pon a prueba tu capacidad de razonamiento.",
      category: "lógica",
      difficulty: "principiante",
      type: "daily",
      points: 30,
      timeLimit: 20,
      participants: 2156,
      completions: 1789,
      startDate: "2024-01-15",
      status: "active",
      featured: false,
      tags: ["lógica", "puzzles", "razonamiento"],
      creator: {
        id: "system",
        name: "CRUNEVO",
        avatar: "/avatars/system.png",
        level: 100
      },
      rewards: {
        crolars: 15,
        xp: 30
      },
      image: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=colorful%20puzzle%20pieces%20and%20brain%20teasers%20floating%20in%20geometric%20space%2C%20vibrant%20colors%20and%20modern%20design&image_size=landscape_4_3"
    },
    {
      id: "5",
      title: "Desafío de Historia: Línea de Tiempo",
      description: "Crea una línea de tiempo interactiva sobre un período histórico específico. Incluye eventos clave y personajes importantes.",
      category: "historia",
      difficulty: "intermedio",
      type: "weekly",
      points: 120,
      timeLimit: 90,
      participants: 345,
      completions: 198,
      startDate: "2024-01-14",
      endDate: "2024-01-21",
      status: "active",
      featured: false,
      tags: ["historia", "investigación", "cronología"],
      creator: {
        id: "prof3",
        name: "Prof. López",
        avatar: "/avatars/prof3.png",
        level: 78
      },
      rewards: {
        crolars: 60,
        xp: 120,
        badges: ["Historiador Digital"]
      },
      image: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=ancient%20scrolls%20and%20historical%20documents%20with%20timeline%20elements%2C%20vintage%20sepia%20tones%20mixed%20with%20modern%20digital%20interface&image_size=landscape_4_3"
    },
    {
      id: "6",
      title: "Torneo de Idiomas: Traducción Rápida",
      description: "Traduce textos entre diferentes idiomas en el menor tiempo posible. Incluye inglés, francés, alemán y español.",
      category: "idiomas",
      difficulty: "avanzado",
      type: "special",
      points: 180,
      timeLimit: 45,
      participants: 567,
      completions: 289,
      startDate: "2024-01-12",
      endDate: "2024-01-19",
      status: "active",
      featured: true,
      tags: ["idiomas", "traducción", "velocidad"],
      creator: {
        id: "prof4",
        name: "Prof. Smith",
        avatar: "/avatars/prof4.png",
        level: 88
      },
      rewards: {
        crolars: 90,
        xp: 180,
        badges: ["Políglota Rápido", "Traductor Experto"]
      },
      requirements: ["Conocimiento de al menos 2 idiomas"],
      image: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=multiple%20language%20flags%20and%20text%20bubbles%20with%20different%20scripts%2C%20colorful%20international%20theme%20with%20communication%20symbols&image_size=landscape_4_3"
    }
  ];

  const categories = [
    { value: "all", label: "Todas las Categorías" },
    { value: "matemáticas", label: "Matemáticas" },
    { value: "programación", label: "Programación" },
    { value: "ciencias", label: "Ciencias" },
    { value: "historia", label: "Historia" },
    { value: "idiomas", label: "Idiomas" },
    { value: "lógica", label: "Lógica" },
    { value: "arte", label: "Arte" },
    { value: "literatura", label: "Literatura" }
  ];

  const difficulties = [
    { value: "all", label: "Todas las Dificultades" },
    { value: "principiante", label: "Principiante" },
    { value: "intermedio", label: "Intermedio" },
    { value: "avanzado", label: "Avanzado" },
    { value: "experto", label: "Experto" }
  ];

  const types = [
    { value: "all", label: "Todos los Tipos" },
    { value: "daily", label: "Diarios" },
    { value: "weekly", label: "Semanales" },
    { value: "special", label: "Especiales" },
    { value: "community", label: "Comunidad" }
  ];

  const statuses = [
    { value: "all", label: "Todos los Estados" },
    { value: "active", label: "Activos" },
    { value: "upcoming", label: "Próximos" },
    { value: "completed", label: "Completados" }
  ];

  const sortOptions = [
    { value: "newest", label: "Más Recientes" },
    { value: "oldest", label: "Más Antiguos" },
    { value: "popular", label: "Más Populares" },
    { value: "points", label: "Más Puntos" },
    { value: "difficulty", label: "Dificultad" },
    { value: "ending", label: "Terminan Pronto" }
  ];

  // Filter and sort challenges
  const filteredChallenges = challenges.filter(challenge => {
    const matchesSearch = challenge.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         challenge.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         challenge.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || challenge.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === "all" || challenge.difficulty === selectedDifficulty;
    const matchesType = selectedType === "all" || challenge.type === selectedType;
    const matchesStatus = selectedStatus === "all" || challenge.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesDifficulty && matchesType && matchesStatus;
  }).sort((a, b) => {
    switch (sortBy) {
      case "popular":
        return b.participants - a.participants;
      case "points":
        return b.points - a.points;
      case "oldest":
        return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
      case "ending":
        if (!a.endDate && !b.endDate) return 0;
        if (!a.endDate) return 1;
        if (!b.endDate) return -1;
        return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
      default:
        return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
    }
  });

  const featuredChallenges = challenges.filter(challenge => challenge.featured && challenge.status === 'active');
  const activeChallenges = challenges.filter(challenge => challenge.status === 'active').length;
  const totalParticipants = challenges.reduce((sum, challenge) => sum + challenge.participants, 0);
  const totalRewards = challenges.reduce((sum, challenge) => sum + challenge.rewards.crolars, 0);

  if (selectedChallenge) {
    return (
      <ChallengeDetail 
        challenge={selectedChallenge} 
        onBack={() => setSelectedChallenge(null)} 
      />
    );
  }

  if (showCreateChallenge) {
    return (
      <CreateChallenge onBack={() => setShowCreateChallenge(false)} />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full">
              <Target className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Desafíos CRUNEVO
            </h1>
          </div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Pon a prueba tus conocimientos con desafíos diarios, semanales y especiales. 
            Gana Crolars, XP y desbloquea insignias únicas.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Desafíos Activos</p>
                  <p className="text-2xl font-bold">{activeChallenges}</p>
                </div>
                <div className="p-3 bg-white/20 rounded-full">
                  <Flame className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Participantes</p>
                  <p className="text-2xl font-bold">{totalParticipants.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-white/20 rounded-full">
                  <Users className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Crolars en Juego</p>
                  <p className="text-2xl font-bold">{totalRewards.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-white/20 rounded-full">
                  <Trophy className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Tu Racha</p>
                  <p className="text-2xl font-bold">7 días</p>
                </div>
                <div className="p-3 bg-white/20 rounded-full">
                  <Zap className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
            <TabsTrigger value="browse" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Explorar
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Clasificación
            </TabsTrigger>
            <TabsTrigger value="my-challenges" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Mis Desafíos
            </TabsTrigger>
            <TabsTrigger value="create" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Crear
            </TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-6">
            {/* Featured Challenges */}
            {featuredChallenges.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <h2 className="text-xl font-semibold text-gray-900">Desafíos Destacados</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {featuredChallenges.slice(0, 3).map(challenge => (
                    <ChallengeCard
                      key={challenge.id}
                      challenge={challenge}
                      onClick={() => setSelectedChallenge(challenge)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filtros y Búsqueda
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                  <div className="lg:col-span-2">
                    <Input
                      placeholder="Buscar desafíos..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {difficulties.map(difficulty => (
                        <SelectItem key={difficulty.value} value={difficulty.value}>
                          {difficulty.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {types.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue />
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

            {/* All Challenges */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Todos los Desafíos ({filteredChallenges.length})
                </h2>
                <Button 
                  onClick={() => setShowCreateChallenge(true)}
                  className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Desafío
                </Button>
              </div>
              
              {filteredChallenges.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredChallenges.map(challenge => (
                    <ChallengeCard
                      key={challenge.id}
                      challenge={challenge}
                      onClick={() => setSelectedChallenge(challenge)}
                    />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No se encontraron desafíos</h3>
                    <p className="text-gray-600 mb-4">Intenta ajustar tus filtros de búsqueda</p>
                    <Button 
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedCategory("all");
                        setSelectedDifficulty("all");
                        setSelectedType("all");
                        setSelectedStatus("all");
                      }}
                      variant="outline"
                    >
                      Limpiar Filtros
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="leaderboard">
            <ChallengeLeaderboard />
          </TabsContent>

          <TabsContent value="my-challenges">
            <MyChallenges />
          </TabsContent>

          <TabsContent value="create">
            <div className="text-center py-12">
              <div className="max-w-md mx-auto">
                <div className="p-4 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Plus className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Crear Nuevo Desafío</h3>
                <p className="text-gray-600 mb-6">
                  Comparte tu conocimiento creando desafíos únicos para la comunidad
                </p>
                <Button 
                  onClick={() => setShowCreateChallenge(true)}
                  className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Comenzar a Crear
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}