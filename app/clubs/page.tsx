"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Users, Trophy, Calendar, Plus, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import ClubCard from "@/components/clubs/ClubCard";
import ClubDetail from "@/components/clubs/ClubDetail";
import MyClubs from "@/components/clubs/MyClubs";
import CreateClub, { CreateClubFormData } from "@/components/clubs/CreateClub";
import type { Club, ClubCategory } from "@/shared/types/clubs";

// Interfaces for API responses
interface ClubsResponse {
  clubs: Club[];
  total: number;
  page: number;
  totalPages: number;
}

interface ClubStats {
  totalClubs: number;
  totalMembers: number;
  eventsThisWeek: number;
  myClubsCount: number;
}

interface CategoriesResponse {
  categories: ClubCategory[];
  stats: {
    totalClubs: number;
    totalMembers: number;
    averageMembersPerClub: number;
    mostActiveCategory: string;
  };
}

export default function ClubsPage() {
  const { data: session } = useSession();
  
  // State management
  const [activeTab, setActiveTab] = useState("browse");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [selectedClubId, setSelectedClubId] = useState<string | null>(null);
  const [creatingClub, setCreatingClub] = useState(false);
  
  // Data state
  const [clubs, setClubs] = useState<Club[]>([]);
  const [categories, setCategories] = useState<ClubCategory[]>([]);
  const [stats, setStats] = useState<ClubStats>({
    totalClubs: 0,
    totalMembers: 0,
    eventsThisWeek: 0,
    myClubsCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Constants
  const sortOptions = [
    { value: "recent", label: "Más recientes" },
    { value: "popular", label: "Más populares" },
    { value: "active", label: "Más activos" },
    { value: "alphabetical", label: "Alfabético" }
  ];
  
  const levelOptions = [
    { value: "", label: "Todos los niveles" },
    { value: "BEGINNER", label: "Principiante" },
    { value: "INTERMEDIATE", label: "Intermedio" },
    { value: "ADVANCED", label: "Avanzado" }
  ];

  // API functions
  const fetchClubs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        ...(searchQuery && { search: searchQuery }),
        ...(selectedCategory !== 'Todas' && { category: selectedCategory }),
        ...(selectedSubject && { subject: selectedSubject }),
        ...(selectedLevel && { level: selectedLevel }),
        ...(sortBy && { sortBy })
      });
      
      const response = await fetch(`/api/clubs?${params}`);
      if (!response.ok) throw new Error('Failed to fetch clubs');
      
      const data: ClubsResponse = await response.json();
      setClubs(data.clubs);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error fetching clubs:', error);
      toast.error('Error al cargar los clubes');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/clubs/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      
      const data: CategoriesResponse = await response.json();
      setCategories(data.categories);
      setStats({
        totalClubs: data.stats.totalClubs,
        totalMembers: data.stats.totalMembers,
        eventsThisWeek: 0, // TODO: Implement events API
        myClubsCount: 0 // Will be fetched separately if user is logged in
      });
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchMyClubsCount = async () => {
    if (!session?.user?.id) return;
    
    try {
      const response = await fetch('/api/clubs/my-clubs?includeStats=true&limit=1');
      if (!response.ok) throw new Error('Failed to fetch my clubs count');
      
      const data = await response.json();
      setStats(prev => ({ ...prev, myClubsCount: data.total || 0 }));
    } catch (error) {
      console.error('Error fetching my clubs count:', error);
    }
  };

  // Event handlers
  const handleClubSelect = (clubId: string) => {
    setSelectedClubId(clubId);
  };

  const handleBackToClubs = () => {
    setSelectedClubId(null);
  };
  
  const openCreateTab = () => {
    setActiveTab('create');
  };

  const handleClubCreated = () => {
    setActiveTab('browse');
    fetchClubs();
  };

  const handleCreateClub = async (data: CreateClubFormData) => {
    try {
      setCreatingClub(true);
      const payload = {
        name: data.name,
        description: data.description,
        category: data.category,
        tags: data.tags,
        isPrivate: data.visibility === 'private',
      };
      const response = await fetch('/api/clubs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Failed to create club');
      handleClubCreated();
      toast.success('Club creado exitosamente');
    } catch (error) {
      console.error('Error creating club:', error);
      toast.error('Error al crear el club');
    } finally {
      setCreatingClub(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPage(1); // Reset to first page when searching
  };

  const handleFilterChange = () => {
    setPage(1); // Reset to first page when filters change
  };

  // Effects
  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchClubs();
  }, [page, searchQuery, selectedCategory, selectedSubject, selectedLevel, sortBy]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchMyClubsCount();
    }
  }, [session?.user?.id]);

  // Get featured clubs (first 3 clubs)
  const featuredClubs = clubs.slice(0, 3);
  
  // Get unique subjects from categories for filter dropdown
  const subjects = Array.from(new Set(
    categories.flatMap(cat => cat.subjects || [])
  )).sort();

  if (selectedClubId) {
    const selectedClub = clubs.find(club => club.id === selectedClubId);
    if (selectedClub) {
      return (
        <ClubDetail 
          club={selectedClub} 
          onBack={handleBackToClubs}
        />
      );
    }
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
              <div className="text-2xl font-bold text-purple-600">
                {loading ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : stats.totalClubs}
              </div>
              <div className="text-sm text-gray-600">Clubes Activos</div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm border-blue-200">
            <CardContent className="p-4 text-center">
              <Trophy className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">
                {loading ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : stats.totalMembers}
              </div>
              <div className="text-sm text-gray-600">Miembros Totales</div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm border-indigo-200">
            <CardContent className="p-4 text-center">
              <Calendar className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-indigo-600">
                {loading ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : stats.eventsThisWeek}
              </div>
              <div className="text-sm text-gray-600">Eventos Esta Semana</div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm border-green-200">
            <CardContent className="p-4 text-center">
              <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">
                {loading ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : stats.myClubsCount}
              </div>
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
              onClick={openCreateTab}
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
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={selectedCategory} onValueChange={(value) => { setSelectedCategory(value); handleFilterChange(); }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Todas">Todas las categorías</SelectItem>
                      {categories.map(category => (
                        <SelectItem key={category.name} value={category.name}>{category.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedSubject} onValueChange={(value) => { setSelectedSubject(value); handleFilterChange(); }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Materia" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todas las materias</SelectItem>
                      {subjects.map(subject => (
                        <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedLevel} onValueChange={(value) => { setSelectedLevel(value); handleFilterChange(); }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Nivel" />
                    </SelectTrigger>
                    <SelectContent>
                      {levelOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue placeholder="Ordenar" />
                    </SelectTrigger>
                    <SelectContent>
                      {sortOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Featured Clubs */}
            {!loading && featuredClubs.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-800">Clubes Destacados</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredClubs.map(club => (
                    <ClubCard 
                      key={club.id} 
                      club={club} 
                      onClick={() => handleClubSelect(club.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* All Clubs */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Todos los Clubes</h2>
                <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    `${clubs.length} clubes encontrados`
                  )}
                </Badge>
              </div>
              
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i} className="bg-white/80 backdrop-blur-sm animate-pulse">
                      <CardContent className="p-6">
                        <div className="h-4 bg-gray-200 rounded mb-4"></div>
                        <div className="h-3 bg-gray-200 rounded mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded mb-4"></div>
                        <div className="flex justify-between">
                          <div className="h-3 bg-gray-200 rounded w-16"></div>
                          <div className="h-3 bg-gray-200 rounded w-12"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : clubs.length === 0 ? (
                <Card className="bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-12 text-center">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">No se encontraron clubes</h3>
                    <p className="text-gray-500 mb-4">Intenta ajustar tus filtros de búsqueda</p>
                    <Button 
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory('Todas');
                        setSelectedSubject('');
                        setSelectedLevel('');
                      }}
                      variant="outline"
                    >
                      Limpiar filtros
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {clubs.map(club => (
                    <ClubCard 
                      key={club.id} 
                      club={club} 
                      onClick={() => handleClubSelect(club.id)}
                    />
                  ))}
                </div>
              )}
              
              {/* Pagination */}
              {!loading && totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2 mt-8">
                  <Button
                    variant="outline"
                    onClick={() => setPage(prev => Math.max(1, prev - 1))}
                    disabled={page === 1}
                  >
                    Anterior
                  </Button>
                  <span className="text-sm text-gray-600">
                    Página {page} de {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={page === totalPages}
                  >
                    Siguiente
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="my-clubs" className="space-y-6">
            <MyClubs onClubSelect={(club) => handleClubSelect(club.id)} />
          </TabsContent>

          <TabsContent value="create" className="space-y-6">
            <CreateClub
              onSubmit={handleCreateClub}
              onCancel={() => setActiveTab('browse')}
              isLoading={creatingClub}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}