"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Trophy, 
  Medal, 
  Crown, 
  Star, 
  Users, 
  Calendar, 
  Clock, 
  Target, 
  Zap, 
  TrendingUp, 
  Award, 
  Search, 
  Filter, 
  Plus,
  ChevronRight,
  Flame,
  BookOpen,
  Brain,
  Calculator,
  Globe,
  Beaker,
  Palette,
  Music,
  Dumbbell
} from "lucide-react";
import { CompetitionCard } from "@/components/league/CompetitionCard";
import { CompetitionDetail } from "@/components/league/CompetitionDetail";
import { Leaderboard } from "@/components/league/Leaderboard";
import { MyCompetitions } from "@/components/league/MyCompetitions";
import { CreateCompetition } from "@/components/league/CreateCompetition";

// Mock data for competitions
const mockCompetitions = [
  {
    id: "1",
    title: "Desafío Matemático Supremo",
    description: "Competencia de matemáticas avanzadas con problemas de álgebra, cálculo y geometría",
    image: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=mathematics%20competition%20advanced%20algebra&image_size=landscape_4_3",
    category: "Matemáticas",
    difficulty: "Avanzado",
    participants: 234,
    maxParticipants: 500,
    startDate: "2024-02-20",
    endDate: "2024-02-25",
    duration: "5 días",
    prize: 1000,
    status: "active",
    isJoined: true,
    isFeatured: true,
    organizer: "Departamento de Matemáticas",
    organizerAvatar: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=mathematics%20department%20logo&image_size=square",
    tags: ["Álgebra", "Cálculo", "Geometría"],
    requirements: ["Nivel universitario", "Conocimientos de cálculo"],
    rules: ["Tiempo límite por problema: 30 minutos", "No se permite calculadora", "3 intentos máximo por problema"]
  },
  {
    id: "2",
    title: "Torneo de Programación",
    description: "Competencia de algoritmos y estructuras de datos con problemas de diferentes niveles",
    image: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=programming%20competition%20algorithms%20coding&image_size=landscape_4_3",
    category: "Programación",
    difficulty: "Intermedio",
    participants: 189,
    maxParticipants: 300,
    startDate: "2024-02-22",
    endDate: "2024-02-24",
    duration: "3 días",
    prize: 750,
    status: "upcoming",
    isJoined: false,
    isFeatured: true,
    organizer: "Club de Programación",
    organizerAvatar: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=programming%20club%20logo&image_size=square",
    tags: ["Algoritmos", "Estructuras de Datos", "Python"],
    requirements: ["Conocimientos básicos de programación", "Laptop propia"],
    rules: ["Lenguajes permitidos: Python, Java, C++", "Tiempo límite: 3 horas", "Internet permitido para documentación"]
  },
  {
    id: "3",
    title: "Quiz de Ciencias Naturales",
    description: "Competencia de conocimientos en biología, química y física",
    image: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=science%20quiz%20biology%20chemistry%20physics&image_size=landscape_4_3",
    category: "Ciencias",
    difficulty: "Intermedio",
    participants: 156,
    maxParticipants: 200,
    startDate: "2024-02-18",
    endDate: "2024-02-18",
    duration: "2 horas",
    prize: 500,
    status: "completed",
    isJoined: true,
    isFeatured: false,
    organizer: "Facultad de Ciencias",
    organizerAvatar: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=science%20faculty%20logo&image_size=square",
    tags: ["Biología", "Química", "Física"],
    requirements: ["Estudiante de ciencias", "Conocimientos básicos"],
    rules: ["100 preguntas", "Tiempo límite: 2 horas", "Respuesta múltiple"]
  },
  {
    id: "4",
    title: "Debate de Historia",
    description: "Competencia de debate sobre eventos históricos importantes",
    image: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=history%20debate%20competition%20academic&image_size=landscape_4_3",
    category: "Historia",
    difficulty: "Avanzado",
    participants: 45,
    maxParticipants: 60,
    startDate: "2024-02-26",
    endDate: "2024-02-28",
    duration: "3 días",
    prize: 600,
    status: "upcoming",
    isJoined: false,
    isFeatured: false,
    organizer: "Departamento de Historia",
    organizerAvatar: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=history%20department%20logo&image_size=square",
    tags: ["Debate", "Historia Mundial", "Argumentación"],
    requirements: ["Conocimientos de historia", "Habilidades de debate"],
    rules: ["Equipos de 3 personas", "Tiempo por argumento: 5 minutos", "Temas asignados aleatoriamente"]
  }
];

// Mock data for categories
const categories = [
  { value: "all", label: "Todas las categorías", icon: Target },
  { value: "matematicas", label: "Matemáticas", icon: Calculator },
  { value: "programacion", label: "Programación", icon: Brain },
  { value: "ciencias", label: "Ciencias", icon: Beaker },
  { value: "historia", label: "Historia", icon: BookOpen },
  { value: "idiomas", label: "Idiomas", icon: Globe },
  { value: "arte", label: "Arte", icon: Palette },
  { value: "musica", label: "Música", icon: Music },
  { value: "deportes", label: "Deportes", icon: Dumbbell }
];

const difficulties = [
  { value: "all", label: "Todos los niveles" },
  { value: "principiante", label: "Principiante" },
  { value: "intermedio", label: "Intermedio" },
  { value: "avanzado", label: "Avanzado" },
  { value: "experto", label: "Experto" }
];

const statuses = [
  { value: "all", label: "Todos los estados" },
  { value: "upcoming", label: "Próximas" },
  { value: "active", label: "Activas" },
  { value: "completed", label: "Completadas" }
];

const sortOptions = [
  { value: "newest", label: "Más recientes" },
  { value: "oldest", label: "Más antiguas" },
  { value: "participants", label: "Más participantes" },
  { value: "prize", label: "Mayor premio" },
  { value: "ending", label: "Terminan pronto" }
];

export default function LeaguePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedCompetition, setSelectedCompetition] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("browse");
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Filter competitions based on search and filters
  const filteredCompetitions = mockCompetitions.filter(competition => {
    const matchesSearch = competition.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         competition.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         competition.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === "all" || 
                           competition.category.toLowerCase() === selectedCategory;
    
    const matchesDifficulty = selectedDifficulty === "all" || 
                             competition.difficulty.toLowerCase() === selectedDifficulty;
    
    const matchesStatus = selectedStatus === "all" || 
                         competition.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesDifficulty && matchesStatus;
  });

  // Sort competitions
  const sortedCompetitions = [...filteredCompetitions].sort((a, b) => {
    switch (sortBy) {
      case "participants":
        return b.participants - a.participants;
      case "prize":
        return b.prize - a.prize;
      case "ending":
        return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
      case "oldest":
        return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
      default: // newest
        return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
    }
  });

  const handleCompetitionClick = (competitionId: string) => {
    setSelectedCompetition(competitionId);
  };

  const handleBackToList = () => {
    setSelectedCompetition(null);
  };

  const handleCreateCompetition = () => {
    setShowCreateForm(true);
    setActiveTab("create");
  };

  const handleCancelCreate = () => {
    setShowCreateForm(false);
    setActiveTab("browse");
  };

  // Show competition detail if one is selected
  if (selectedCompetition) {
    const competition = mockCompetitions.find(c => c.id === selectedCompetition);
    if (competition) {
      return (
        <CompetitionDetail 
          competition={competition} 
          onBack={handleBackToList}
        />
      );
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full">
              <Trophy className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Liga Académica
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Compite con estudiantes de todo el mundo en desafíos académicos y demuestra tus conocimientos
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-full">
                  <Trophy className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Competencias Activas</p>
                  <p className="text-2xl font-bold text-gray-900">12</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Participantes</p>
                  <p className="text-2xl font-bold text-gray-900">2,847</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Medal className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tu Ranking</p>
                  <p className="text-2xl font-bold text-gray-900">#47</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <Zap className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Crolars Ganados</p>
                  <p className="text-2xl font-bold text-gray-900">1,250</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white/90 backdrop-blur-sm border-0 shadow-lg">
            <TabsTrigger value="browse" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Explorar
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Rankings
            </TabsTrigger>
            <TabsTrigger value="my-competitions" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              Mis Competencias
            </TabsTrigger>
            <TabsTrigger value="create" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Crear
            </TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-6">
            {/* Search and Filters */}
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Buscar competencias..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-white border-gray-200 focus:border-purple-300 focus:ring-purple-200"
                      />
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-3">
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-[180px] bg-white border-gray-200">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => {
                          const IconComponent = category.icon;
                          return (
                            <SelectItem key={category.value} value={category.value}>
                              <div className="flex items-center gap-2">
                                <IconComponent className="h-4 w-4" />
                                {category.label}
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>

                    <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                      <SelectTrigger className="w-[150px] bg-white border-gray-200">
                        <SelectValue placeholder="Dificultad" />
                      </SelectTrigger>
                      <SelectContent>
                        {difficulties.map(difficulty => (
                          <SelectItem key={difficulty.value} value={difficulty.value}>
                            {difficulty.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                      <SelectTrigger className="w-[150px] bg-white border-gray-200">
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
                      <SelectTrigger className="w-[150px] bg-white border-gray-200">
                        <SelectValue placeholder="Ordenar" />
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
                </div>
              </CardContent>
            </Card>

            {/* Featured Competitions */}
            {sortedCompetitions.some(c => c.isFeatured) && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <h2 className="text-xl font-semibold text-gray-900">Competencias Destacadas</h2>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {sortedCompetitions
                    .filter(competition => competition.isFeatured)
                    .slice(0, 2)
                    .map(competition => (
                      <CompetitionCard
                        key={competition.id}
                        competition={competition}
                        onClick={() => handleCompetitionClick(competition.id)}
                      />
                    ))
                  }
                </div>
              </div>
            )}

            {/* All Competitions */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  Todas las Competencias ({sortedCompetitions.length})
                </h2>
                
                <Button 
                  onClick={handleCreateCompetition}
                  className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Competencia
                </Button>
              </div>
              
              {sortedCompetitions.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {sortedCompetitions.map(competition => (
                    <CompetitionCard
                      key={competition.id}
                      competition={competition}
                      onClick={() => handleCompetitionClick(competition.id)}
                    />
                  ))}
                </div>
              ) : (
                <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                  <CardContent className="p-12 text-center">
                    <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron competencias</h3>
                    <p className="text-gray-600 mb-4">
                      No hay competencias que coincidan con tus filtros actuales.
                    </p>
                    <Button 
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedCategory("all");
                        setSelectedDifficulty("all");
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
            <Leaderboard />
          </TabsContent>

          <TabsContent value="my-competitions">
            <MyCompetitions onCompetitionClick={handleCompetitionClick} />
          </TabsContent>

          <TabsContent value="create">
            <CreateCompetition onCancel={handleCancelCreate} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}