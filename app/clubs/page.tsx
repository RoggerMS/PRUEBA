"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ClubCard } from "@/components/clubs/ClubCard";
import { ClubDetail } from "@/components/clubs/ClubDetail";
import { MyClubs } from "@/components/clubs/MyClubs";
import { CreateClub } from "@/components/clubs/CreateClub";
import { Search, Users, Trophy, Calendar, Plus, Filter } from "lucide-react";

// Mock data for clubs
const mockClubs = [
  {
    id: "1",
    name: "Matemáticas Avanzadas",
    description: "Club dedicado al estudio de matemáticas de nivel universitario y competencias.",
    category: "Académico",
    subject: "Matemáticas",
    memberCount: 156,
    isPrivate: false,
    image: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=mathematics%20club%20students%20studying%20calculus%20equations%20blackboard%20modern%20classroom&image_size=landscape_4_3",
    owner: {
      id: "owner1",
      name: "Dr. Ana García",
      avatar: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20female%20mathematics%20teacher%20portrait%20friendly%20smile&image_size=square",
      role: "Profesora"
    },
    tags: ["Cálculo", "Álgebra", "Geometría", "Competencias"],
    level: "Avanzado",
    createdAt: "2024-01-15",
    lastActivity: "2024-01-20",
    isJoined: true,
    achievements: [
      { name: "Club Activo", icon: "🏆" },
      { name: "100+ Miembros", icon: "👥" }
    ]
  },
  {
    id: "2",
    name: "Ciencias Naturales",
    description: "Exploramos el mundo de la biología, química y física a través de experimentos.",
    category: "Académico",
    subject: "Ciencias",
    memberCount: 89,
    isPrivate: false,
    image: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=science%20laboratory%20students%20conducting%20experiments%20microscopes%20test%20tubes&image_size=landscape_4_3",
    owner: {
      id: "owner2",
      name: "Prof. Carlos Mendez",
      avatar: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=male%20science%20teacher%20laboratory%20coat%20professional%20portrait&image_size=square",
      role: "Profesor"
    },
    tags: ["Biología", "Química", "Física", "Experimentos"],
    level: "Intermedio",
    createdAt: "2024-01-10",
    lastActivity: "2024-01-19",
    isJoined: false,
    achievements: [
      { name: "Experimentadores", icon: "🔬" }
    ]
  },
  {
    id: "3",
    name: "Debate y Oratoria",
    description: "Desarrollamos habilidades de comunicación y pensamiento crítico.",
    category: "Extracurricular",
    subject: "Comunicación",
    memberCount: 67,
    isPrivate: false,
    image: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=debate%20club%20students%20public%20speaking%20podium%20audience%20formal%20setting&image_size=landscape_4_3",
    owner: {
      id: "owner3",
      name: "Lic. María Torres",
      avatar: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=female%20debate%20coach%20professional%20confident%20portrait&image_size=square",
      role: "Coordinadora"
    },
    tags: ["Debate", "Oratoria", "Comunicación", "Liderazgo"],
    level: "Intermedio",
    createdAt: "2024-01-08",
    lastActivity: "2024-01-18",
    isJoined: true,
    achievements: [
      { name: "Oradores Expertos", icon: "🎤" }
    ]
  }
];

const categories = ["Todos", "Académico", "Extracurricular", "Deportivo", "Arte", "Tecnología"];
const subjects = ["Todos", "Matemáticas", "Ciencias", "Historia", "Literatura", "Idiomas", "Comunicación"];
const levels = ["Todos", "Principiante", "Intermedio", "Avanzado"];
const sortOptions = ["Más recientes", "Más populares", "Más activos", "Alfabético"];

export default function ClubsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [selectedSubject, setSelectedSubject] = useState("Todos");
  const [selectedLevel, setSelectedLevel] = useState("Todos");
  const [sortBy, setSortBy] = useState("Más recientes");
  const [selectedClubId, setSelectedClubId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("browse");
  const [showCreateClub, setShowCreateClub] = useState(false);

  const handleClubSelect = (clubId: string) => {
    setSelectedClubId(clubId);
  };

  const handleBackToClubs = () => {
    setSelectedClubId(null);
  };

  const handleCreateClub = () => {
    setShowCreateClub(true);
  };

  const handleCloseCreateClub = () => {
    setShowCreateClub(false);
  };

  // Filter clubs based on search and filters
  const filteredClubs = mockClubs.filter(club => {
    const matchesSearch = club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         club.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         club.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === "Todos" || club.category === selectedCategory;
    const matchesSubject = selectedSubject === "Todos" || club.subject === selectedSubject;
    const matchesLevel = selectedLevel === "Todos" || club.level === selectedLevel;
    
    return matchesSearch && matchesCategory && matchesSubject && matchesLevel;
  });

  // Sort clubs
  const sortedClubs = [...filteredClubs].sort((a, b) => {
    switch (sortBy) {
      case "Más populares":
        return b.memberCount - a.memberCount;
      case "Más activos":
        return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime();
      case "Alfabético":
        return a.name.localeCompare(b.name);
      default: // Más recientes
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  if (selectedClubId) {
    const selectedClub = mockClubs.find(club => club.id === selectedClubId);
    if (selectedClub) {
      return (
        <ClubDetail 
          club={selectedClub} 
          onBack={handleBackToClubs}
        />
      );
    }
  }

  if (showCreateClub) {
    return (
      <CreateClub onClose={handleCloseCreateClub} />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Clubes Estudiantiles
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Únete a comunidades de aprendizaje, comparte conocimientos y desarrolla habilidades junto a otros estudiantes.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-white/80 backdrop-blur-sm border-purple-200">
            <CardContent className="p-4 text-center">
              <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-600">24</div>
              <div className="text-sm text-gray-600">Clubes Activos</div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm border-blue-200">
            <CardContent className="p-4 text-center">
              <Trophy className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">312</div>
              <div className="text-sm text-gray-600">Miembros Totales</div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm border-indigo-200">
            <CardContent className="p-4 text-center">
              <Calendar className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-indigo-600">8</div>
              <div className="text-sm text-gray-600">Eventos Esta Semana</div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm border-green-200">
            <CardContent className="p-4 text-center">
              <Plus className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">3</div>
              <div className="text-sm text-gray-600">Mis Clubes</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <TabsList className="bg-white/80 backdrop-blur-sm">
              <TabsTrigger value="browse">Explorar</TabsTrigger>
              <TabsTrigger value="my-clubs">Mis Clubes</TabsTrigger>
              <TabsTrigger value="create">Crear Club</TabsTrigger>
            </TabsList>
            
            <Button 
              onClick={handleCreateClub}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Crear Club
            </Button>
          </div>

          <TabsContent value="browse" className="space-y-6">
            {/* Search and Filters */}
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                  <div className="lg:col-span-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Buscar clubes..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                    <SelectTrigger>
                      <SelectValue placeholder="Materia" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map(subject => (
                        <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                    <SelectTrigger>
                      <SelectValue placeholder="Nivel" />
                    </SelectTrigger>
                    <SelectContent>
                      {levels.map(level => (
                        <SelectItem key={level} value={level}>{level}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue placeholder="Ordenar" />
                    </SelectTrigger>
                    <SelectContent>
                      {sortOptions.map(option => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Featured Clubs */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-800">Clubes Destacados</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedClubs.slice(0, 3).map(club => (
                  <ClubCard 
                    key={club.id} 
                    club={club} 
                    onClick={() => handleClubSelect(club.id)}
                  />
                ))}
              </div>
            </div>

            {/* All Clubs */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Todos los Clubes</h2>
                <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                  {sortedClubs.length} clubes encontrados
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedClubs.map(club => (
                  <ClubCard 
                    key={club.id} 
                    club={club} 
                    onClick={() => handleClubSelect(club.id)}
                  />
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="my-clubs">
            <MyClubs />
          </TabsContent>

          <TabsContent value="create">
            <CreateClub onClose={() => setActiveTab("browse")} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}