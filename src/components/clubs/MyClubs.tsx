"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  Users, 
  Calendar, 
  Crown, 
  Settings, 
  MessageCircle, 
  TrendingUp,
  Filter,
  SortAsc,
  Eye,
  UserMinus,
  MoreVertical
} from "lucide-react";

interface Club {
  id: string;
  name: string;
  description: string;
  category: string;
  subject: string;
  memberCount: number;
  isPrivate: boolean;
  image: string;
  owner: {
    id: string;
    name: string;
    avatar: string;
    role: string;
  };
  tags: string[];
  level: string;
  createdAt: string;
  lastActivity: string;
  role: "owner" | "admin" | "moderator" | "member";
  joinedAt: string;
  unreadMessages: number;
  recentActivity: string;
}

interface MyClubsProps {
  onClubSelect: (club: Club) => void;
}

// Mock data for user's clubs
const mockMyClubs: Club[] = [
  {
    id: "1",
    name: "Matemáticas Avanzadas",
    description: "Club para estudiantes apasionados por las matemáticas de nivel universitario",
    category: "Académico",
    subject: "Matemáticas",
    memberCount: 45,
    isPrivate: false,
    image: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=mathematics%20advanced%20formulas%20blackboard%20classroom&image_size=landscape_4_3",
    owner: {
      id: "1",
      name: "Ana García",
      avatar: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=teacher%20woman%20professional%20portrait&image_size=square",
      role: "Profesora de Matemáticas"
    },
    tags: ["Cálculo", "Álgebra", "Geometría"],
    level: "Avanzado",
    createdAt: "2024-01-15T00:00:00Z",
    lastActivity: "2024-01-20T15:30:00Z",
    role: "owner",
    joinedAt: "2024-01-15T00:00:00Z",
    unreadMessages: 3,
    recentActivity: "Nueva publicación sobre límites"
  },
  {
    id: "2",
    name: "Física Cuántica",
    description: "Explorando los misterios del mundo cuántico",
    category: "Académico",
    subject: "Física",
    memberCount: 28,
    isPrivate: true,
    image: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=quantum%20physics%20particles%20laboratory%20science&image_size=landscape_4_3",
    owner: {
      id: "2",
      name: "Dr. Carlos Ruiz",
      avatar: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=professor%20man%20scientist%20portrait&image_size=square",
      role: "Profesor de Física"
    },
    tags: ["Mecánica Cuántica", "Partículas", "Teoría"],
    level: "Experto",
    createdAt: "2024-01-10T00:00:00Z",
    lastActivity: "2024-01-19T12:15:00Z",
    role: "admin",
    joinedAt: "2024-01-11T00:00:00Z",
    unreadMessages: 0,
    recentActivity: "Evento programado para mañana"
  },
  {
    id: "3",
    name: "Programación Competitiva",
    description: "Preparación para olimpiadas de programación",
    category: "Tecnología",
    subject: "Informática",
    memberCount: 67,
    isPrivate: false,
    image: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=competitive%20programming%20code%20algorithms%20computer&image_size=landscape_4_3",
    owner: {
      id: "3",
      name: "María López",
      avatar: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=programmer%20woman%20developer%20portrait&image_size=square",
      role: "Desarrolladora Senior"
    },
    tags: ["Algoritmos", "Estructuras de Datos", "Competencias"],
    level: "Intermedio",
    createdAt: "2024-01-05T00:00:00Z",
    lastActivity: "2024-01-20T18:45:00Z",
    role: "moderator",
    joinedAt: "2024-01-06T00:00:00Z",
    unreadMessages: 7,
    recentActivity: "Nuevo desafío semanal disponible"
  },
  {
    id: "4",
    name: "Literatura Contemporánea",
    description: "Análisis y discusión de obras literarias modernas",
    category: "Arte",
    subject: "Literatura",
    memberCount: 23,
    isPrivate: false,
    image: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=contemporary%20literature%20books%20library%20reading&image_size=landscape_4_3",
    owner: {
      id: "4",
      name: "Prof. Elena Martín",
      avatar: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=literature%20teacher%20woman%20books%20portrait&image_size=square",
      role: "Profesora de Literatura"
    },
    tags: ["Novela", "Poesía", "Crítica Literaria"],
    level: "Intermedio",
    createdAt: "2024-01-12T00:00:00Z",
    lastActivity: "2024-01-18T14:20:00Z",
    role: "member",
    joinedAt: "2024-01-13T00:00:00Z",
    unreadMessages: 1,
    recentActivity: "Discusión sobre nuevo libro del mes"
  }
];

export function MyClubs({ onClubSelect }: MyClubsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");

  const filteredClubs = mockMyClubs
    .filter(club => {
      const matchesSearch = club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           club.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           club.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesRole = roleFilter === "all" || club.role === roleFilter;
      const matchesCategory = categoryFilter === "all" || club.category === categoryFilter;
      
      return matchesSearch && matchesRole && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "members":
          return b.memberCount - a.memberCount;
        case "recent":
          return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime();
        case "joined":
          return new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime();
        default:
          return 0;
      }
    });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Académico":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "Extracurricular":
        return "bg-green-100 text-green-700 border-green-200";
      case "Deportivo":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "Arte":
        return "bg-pink-100 text-pink-700 border-pink-200";
      case "Tecnología":
        return "bg-purple-100 text-purple-700 border-purple-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "owner":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "admin":
        return "bg-red-100 text-red-700 border-red-200";
      case "moderator":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "member":
        return "bg-gray-100 text-gray-700 border-gray-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "owner":
        return <Crown className="h-4 w-4" />;
      case "admin":
        return <Settings className="h-4 w-4" />;
      case "moderator":
        return <Users className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar en mis clubes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/80 backdrop-blur-sm"
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[140px] bg-white/80 backdrop-blur-sm">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Rol" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los roles</SelectItem>
              <SelectItem value="owner">Propietario</SelectItem>
              <SelectItem value="admin">Administrador</SelectItem>
              <SelectItem value="moderator">Moderador</SelectItem>
              <SelectItem value="member">Miembro</SelectItem>
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[140px] bg-white/80 backdrop-blur-sm">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="Académico">Académico</SelectItem>
              <SelectItem value="Tecnología">Tecnología</SelectItem>
              <SelectItem value="Arte">Arte</SelectItem>
              <SelectItem value="Deportivo">Deportivo</SelectItem>
              <SelectItem value="Extracurricular">Extracurricular</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[140px] bg-white/80 backdrop-blur-sm">
              <SortAsc className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Ordenar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Más reciente</SelectItem>
              <SelectItem value="name">Nombre</SelectItem>
              <SelectItem value="members">Miembros</SelectItem>
              <SelectItem value="joined">Fecha de unión</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">{mockMyClubs.length}</div>
                <div className="text-sm text-gray-600">Clubes Unidos</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-600" />
              <div>
                <div className="text-2xl font-bold">
                  {mockMyClubs.filter(c => c.role === "owner").length}
                </div>
                <div className="text-sm text-gray-600">Propietario</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">
                  {mockMyClubs.reduce((sum, club) => sum + club.unreadMessages, 0)}
                </div>
                <div className="text-sm text-gray-600">Mensajes</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold">
                  {mockMyClubs.filter(c => {
                    const lastActivity = new Date(c.lastActivity);
                    const today = new Date();
                    const diffTime = Math.abs(today.getTime() - lastActivity.getTime());
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    return diffDays <= 1;
                  }).length}
                </div>
                <div className="text-sm text-gray-600">Activos Hoy</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Clubs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClubs.map(club => (
          <Card 
            key={club.id} 
            className="bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden"
            onClick={() => onClubSelect(club)}
          >
            <div className="relative">
              <img 
                src={club.image} 
                alt={club.name}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              
              {/* Unread Messages Badge */}
              {club.unreadMessages > 0 && (
                <Badge className="absolute top-3 right-3 bg-red-500 text-white">
                  {club.unreadMessages}
                </Badge>
              )}
              
              {/* Privacy Badge */}
              {club.isPrivate && (
                <Badge className="absolute top-3 left-3 bg-black/50 text-white border-0">
                  Privado
                </Badge>
              )}
              
              <div className="absolute bottom-3 left-3 right-3">
                <h3 className="text-lg font-bold text-white mb-1 group-hover:text-purple-200 transition-colors">
                  {club.name}
                </h3>
                <div className="flex gap-2">
                  <Badge className={getCategoryColor(club.category)}>
                    {club.category}
                  </Badge>
                  <Badge className={getRoleColor(club.role)}>
                    <span className="flex items-center gap-1">
                      {getRoleIcon(club.role)}
                      {club.role === "owner" ? "Propietario" : 
                       club.role === "admin" ? "Admin" :
                       club.role === "moderator" ? "Moderador" : "Miembro"}
                    </span>
                  </Badge>
                </div>
              </div>
            </div>

            <CardContent className="p-4">
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">{club.description}</p>
              
              <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{club.memberCount} miembros</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Unido {new Date(club.joinedAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-gray-50 rounded-lg p-2 mb-3">
                <div className="text-xs text-gray-600 mb-1">Actividad reciente:</div>
                <div className="text-sm font-medium text-gray-800">{club.recentActivity}</div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-3">
                {club.tags.slice(0, 3).map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs bg-gray-50">
                    {tag}
                  </Badge>
                ))}
                {club.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs bg-gray-50">
                    +{club.tags.length - 3}
                  </Badge>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClubSelect(club);
                  }}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Ver Club
                </Button>
                
                {club.role !== "owner" && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle leave club
                    }}
                  >
                    <UserMinus className="h-4 w-4" />
                  </Button>
                )}
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Handle more options
                  }}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredClubs.length === 0 && (
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardContent className="p-12 text-center">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No se encontraron clubes</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery || roleFilter !== "all" || categoryFilter !== "all" 
                ? "Intenta ajustar los filtros de búsqueda."
                : "Aún no te has unido a ningún club."}
            </p>
            {!searchQuery && roleFilter === "all" && categoryFilter === "all" && (
              <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                Explorar Clubes
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
