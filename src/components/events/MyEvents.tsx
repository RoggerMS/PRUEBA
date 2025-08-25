"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Badge } from "@/src/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { EventCard } from "./EventCard";
import { 
  Search, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Star,
  Filter,
  SortAsc,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp
} from "lucide-react";

interface Event {
  id: string;
  title: string;
  description: string;
  image: string;
  date: string;
  time: string;
  endTime?: string;
  location: string;
  category: string;
  type: string;
  organizer: string;
  organizerAvatar: string;
  attendees: number;
  maxAttendees: number;
  price: number;
  tags: string[];
  status: string;
  isRegistered: boolean;
  isFeatured: boolean;
  difficulty?: string;
  duration?: string;
  prizes?: string[];
  requirements?: string[];
  speakers?: string[];
}

interface MyEventsProps {
  events: Event[];
  onEventClick: (eventId: string) => void;
}

// Mock data for user's events
const mockMyEvents = [
  {
    id: "1",
    title: "Hackathon de Inteligencia Artificial",
    description: "Competencia de 48 horas para desarrollar soluciones innovadoras con IA",
    image: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=AI%20hackathon%20event%20with%20students%20coding%20laptops%20modern%20tech%20atmosphere&image_size=landscape_4_3",
    date: "2024-02-15",
    time: "09:00",
    endTime: "18:00",
    location: "Auditorio Principal",
    category: "Tecnología",
    type: "Competencia",
    organizer: "Club de Programación",
    organizerAvatar: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=programming%20club%20logo%20modern%20tech%20icon&image_size=square",
    attendees: 156,
    maxAttendees: 200,
    price: 0,
    tags: ["IA", "Programación", "Competencia", "Premios"],
    status: "upcoming",
    isRegistered: true,
    isFeatured: true,
    difficulty: "Intermedio",
    duration: "2 días",
    registrationDate: "2024-01-10",
    attendanceStatus: "confirmed"
  },
  {
    id: "2",
    title: "Conferencia de Sostenibilidad",
    description: "Charlas sobre medio ambiente y desarrollo sostenible",
    image: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=sustainability%20conference%20green%20environment%20students%20presentation&image_size=landscape_4_3",
    date: "2024-02-20",
    time: "14:00",
    endTime: "17:00",
    location: "Sala de Conferencias",
    category: "Académico",
    type: "Conferencia",
    organizer: "Club de Medio Ambiente",
    organizerAvatar: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=environmental%20club%20logo%20green%20nature%20icon&image_size=square",
    attendees: 89,
    maxAttendees: 150,
    price: 15,
    tags: ["Sostenibilidad", "Medio Ambiente", "Conferencia"],
    status: "upcoming",
    isRegistered: true,
    isFeatured: false,
    difficulty: "Principiante",
    duration: "3 horas",
    registrationDate: "2024-01-15",
    attendanceStatus: "pending"
  },
  {
    id: "3",
    title: "Taller de Desarrollo Web",
    description: "Aprende las últimas tecnologías de desarrollo web",
    image: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=web%20development%20workshop%20coding%20students%20computers&image_size=landscape_4_3",
    date: "2024-01-20",
    time: "10:00",
    endTime: "16:00",
    location: "Laboratorio de Computación",
    category: "Tecnología",
    type: "Taller",
    organizer: "Departamento de Sistemas",
    organizerAvatar: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=computer%20science%20department%20logo%20academic&image_size=square",
    attendees: 25,
    maxAttendees: 30,
    price: 20,
    tags: ["Web", "JavaScript", "React", "Taller"],
    status: "completed",
    isRegistered: true,
    isFeatured: false,
    difficulty: "Intermedio",
    duration: "6 horas",
    registrationDate: "2024-01-05",
    attendanceStatus: "attended"
  },
  {
    id: "4",
    title: "Seminario de Emprendimiento",
    description: "Estrategias para crear y hacer crecer tu startup",
    image: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=entrepreneurship%20seminar%20business%20students%20presentation&image_size=landscape_4_3",
    date: "2024-01-10",
    time: "15:00",
    endTime: "18:00",
    location: "Aula de Negocios",
    category: "Extracurricular",
    type: "Seminario",
    organizer: "Centro de Emprendimiento",
    organizerAvatar: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=entrepreneurship%20center%20logo%20business&image_size=square",
    attendees: 45,
    maxAttendees: 50,
    price: 0,
    tags: ["Emprendimiento", "Startup", "Negocios"],
    status: "completed",
    isRegistered: true,
    isFeatured: false,
    difficulty: "Principiante",
    duration: "3 horas",
    registrationDate: "2024-01-01",
    attendanceStatus: "no-show"
  }
];

const statusOptions = [
  { value: "all", label: "Todos los Estados" },
  { value: "upcoming", label: "Próximos" },
  { value: "completed", label: "Completados" },
  { value: "cancelled", label: "Cancelados" }
];

const attendanceOptions = [
  { value: "all", label: "Todas las Asistencias" },
  { value: "confirmed", label: "Confirmados" },
  { value: "pending", label: "Pendientes" },
  { value: "attended", label: "Asistidos" },
  { value: "no-show", label: "No Asistidos" }
];

const sortOptions = [
  { value: "date", label: "Fecha del Evento" },
  { value: "registration", label: "Fecha de Registro" },
  { value: "name", label: "Nombre" },
  { value: "category", label: "Categoría" }
];

export function MyEvents({ events, onEventClick }: MyEventsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedAttendance, setSelectedAttendance] = useState("all");
  const [sortBy, setSortBy] = useState("date");

  // Use mock data for demonstration
  const myEvents = mockMyEvents;

  const filteredEvents = myEvents.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = selectedStatus === "all" || event.status === selectedStatus;
    const matchesAttendance = selectedAttendance === "all" || (event as any).attendanceStatus === selectedAttendance;
    
    return matchesSearch && matchesStatus && matchesAttendance;
  });

  const sortedEvents = [...filteredEvents].sort((a, b) => {
    switch (sortBy) {
      case "date":
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      case "registration":
        return new Date((a as any).registrationDate).getTime() - new Date((b as any).registrationDate).getTime();
      case "name":
        return a.title.localeCompare(b.title);
      case "category":
        return a.category.localeCompare(b.category);
      default:
        return 0;
    }
  });

  const stats = {
    total: myEvents.length,
    upcoming: myEvents.filter(e => e.status === "upcoming").length,
    completed: myEvents.filter(e => e.status === "completed").length,
    attended: myEvents.filter(e => (e as any).attendanceStatus === "attended").length
  };

  const getAttendanceIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'attended': return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'no-show': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getAttendanceLabel = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmado';
      case 'pending': return 'Pendiente';
      case 'attended': return 'Asistido';
      case 'no-show': return 'No Asistió';
      default: return 'Desconocido';
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-full">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-sm text-gray-600">Total Eventos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.upcoming}</p>
                <p className="text-sm text-gray-600">Próximos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
                <p className="text-sm text-gray-600">Completados</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.attended}</p>
                <p className="text-sm text-gray-600">Asistidos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-purple-600" />
            Mis Eventos Registrados
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar mis eventos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Estado del Evento" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedAttendance} onValueChange={setSelectedAttendance}>
              <SelectTrigger>
                <SelectValue placeholder="Estado de Asistencia" />
              </SelectTrigger>
              <SelectContent>
                {attendanceOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
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

      {/* Events List */}
      {sortedEvents.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Eventos Encontrados</h2>
            <Badge variant="secondary">{sortedEvents.length}</Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedEvents.map(event => (
              <div key={event.id} className="relative">
                <EventCard
                  event={event}
                  onClick={() => onEventClick(event.id)}
                />
                
                {/* Attendance Status Overlay */}
                <div className="absolute top-2 left-2 z-10">
                  <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 text-xs">
                    {getAttendanceIcon((event as any).attendanceStatus)}
                    <span className="font-medium">
                      {getAttendanceLabel((event as any).attendanceStatus)}
                    </span>
                  </div>
                </div>

                {/* Registration Date */}
                <div className="absolute bottom-2 left-2 z-10">
                  <Badge className="bg-black/70 text-white border-0 text-xs">
                    Registrado: {new Date((event as any).registrationDate).toLocaleDateString('es-ES')}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-12 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron eventos</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery || selectedStatus !== "all" || selectedAttendance !== "all" 
                ? "Intenta ajustar tus filtros de búsqueda" 
                : "Aún no te has registrado en ningún evento"}
            </p>
            <div className="flex gap-2 justify-center">
              {(searchQuery || selectedStatus !== "all" || selectedAttendance !== "all") && (
                <Button 
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedStatus("all");
                    setSelectedAttendance("all");
                  }}
                  variant="outline"
                >
                  Limpiar Filtros
                </Button>
              )}
              <Button 
                onClick={() => window.location.reload()}
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
              >
                Explorar Eventos
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => {
                setSelectedStatus("upcoming");
                setSelectedAttendance("confirmed");
              }}
            >
              <CheckCircle className="h-6 w-6 text-green-500" />
              <div className="text-center">
                <p className="font-medium">Próximos Confirmados</p>
                <p className="text-sm text-gray-600">Ver eventos confirmados</p>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => {
                setSelectedStatus("completed");
                setSelectedAttendance("attended");
              }}
            >
              <TrendingUp className="h-6 w-6 text-blue-500" />
              <div className="text-center">
                <p className="font-medium">Historial de Asistencia</p>
                <p className="text-sm text-gray-600">Ver eventos asistidos</p>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => {
                setSelectedStatus("upcoming");
                setSelectedAttendance("pending");
              }}
            >
              <AlertCircle className="h-6 w-6 text-yellow-500" />
              <div className="text-center">
                <p className="font-medium">Pendientes de Confirmar</p>
                <p className="text-sm text-gray-600">Confirmar asistencia</p>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}