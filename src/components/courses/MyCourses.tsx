"use client";

import { useState } from "react";
import { Search, Filter, BookOpen, Clock, Users, Star, Play, CheckCircle, MoreVertical } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Badge } from "@/src/components/ui/badge";
import { Progress } from "@/src/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  instructorAvatar: string;
  thumbnail: string;
  duration: string;
  lessons: number;
  students: number;
  rating: number;
  reviews: number;
  price: number;
  level: string;
  category: string;
  subject: string;
  tags: string[];
  progress: number;
  enrolled: boolean;
  featured: boolean;
  createdAt: string;
  enrolledAt: string;
  lastAccessed: string;
  completedLessons: number;
  certificateEarned: boolean;
}

interface MyCoursesProps {
  onCourseSelect: (courseId: string) => void;
}

// Mock data for enrolled courses
const mockEnrolledCourses: Course[] = [
  {
    id: "1",
    title: "Cálculo Diferencial e Integral",
    description: "Aprende los fundamentos del cálculo desde cero hasta nivel avanzado.",
    instructor: "Dr. María González",
    instructorAvatar: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=female%20professor%20mathematics%20professional%20portrait&image_size=square",
    thumbnail: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=calculus%20mathematics%20education%20blackboard%20formulas&image_size=landscape_16_9",
    duration: "12h 30m",
    lessons: 45,
    students: 2847,
    rating: 4.8,
    reviews: 324,
    price: 150,
    level: "Intermedio",
    category: "Matemáticas",
    subject: "Cálculo",
    tags: ["derivadas", "integrales", "límites", "continuidad"],
    progress: 75,
    enrolled: true,
    featured: true,
    createdAt: "2024-01-15",
    enrolledAt: "2024-01-20",
    lastAccessed: "2024-01-25",
    completedLessons: 34,
    certificateEarned: false
  },
  {
    id: "2",
    title: "Física Cuántica Básica",
    description: "Introducción a los principios fundamentales de la mecánica cuántica.",
    instructor: "Prof. Carlos Ruiz",
    instructorAvatar: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=male%20professor%20physics%20professional%20portrait&image_size=square",
    thumbnail: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=quantum%20physics%20atoms%20particles%20science%20laboratory&image_size=landscape_16_9",
    duration: "8h 45m",
    lessons: 28,
    students: 1523,
    rating: 4.6,
    reviews: 187,
    price: 120,
    level: "Avanzado",
    category: "Ciencias",
    subject: "Física",
    tags: ["cuántica", "partículas", "ondas", "probabilidad"],
    progress: 100,
    enrolled: true,
    featured: false,
    createdAt: "2024-01-10",
    enrolledAt: "2024-01-12",
    lastAccessed: "2024-01-24",
    completedLessons: 28,
    certificateEarned: true
  },
  {
    id: "3",
    title: "Química Orgánica Avanzada",
    description: "Estudio profundo de compuestos orgánicos y sus reacciones.",
    instructor: "Dra. Ana Martínez",
    instructorAvatar: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=female%20professor%20chemistry%20professional%20portrait&image_size=square",
    thumbnail: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=organic%20chemistry%20molecules%20laboratory%20compounds&image_size=landscape_16_9",
    duration: "15h 20m",
    lessons: 52,
    students: 987,
    rating: 4.9,
    reviews: 156,
    price: 180,
    level: "Avanzado",
    category: "Ciencias",
    subject: "Química",
    tags: ["orgánica", "reacciones", "síntesis", "mecanismos"],
    progress: 45,
    enrolled: true,
    featured: true,
    createdAt: "2024-01-08",
    enrolledAt: "2024-01-18",
    lastAccessed: "2024-01-23",
    completedLessons: 23,
    certificateEarned: false
  },
  {
    id: "4",
    title: "Historia del Arte Moderno",
    description: "Explora los movimientos artísticos del siglo XX y XXI.",
    instructor: "Prof. Luis Herrera",
    instructorAvatar: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=male%20professor%20art%20history%20professional%20portrait&image_size=square",
    thumbnail: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20art%20gallery%20paintings%20sculptures%20museum&image_size=landscape_16_9",
    duration: "6h 15m",
    lessons: 24,
    students: 1245,
    rating: 4.7,
    reviews: 89,
    price: 90,
    level: "Principiante",
    category: "Humanidades",
    subject: "Arte",
    tags: ["modernismo", "vanguardia", "pintura", "escultura"],
    progress: 20,
    enrolled: true,
    featured: false,
    createdAt: "2024-01-05",
    enrolledAt: "2024-01-22",
    lastAccessed: "2024-01-22",
    completedLessons: 5,
    certificateEarned: false
  }
];

const progressFilters = [
  { value: "all", label: "Todos" },
  { value: "in-progress", label: "En progreso" },
  { value: "completed", label: "Completados" },
  { value: "not-started", label: "Sin empezar" }
];

const sortOptions = [
  { value: "recent", label: "Acceso reciente" },
  { value: "progress", label: "Progreso" },
  { value: "title", label: "Título" },
  { value: "enrolled", label: "Fecha de inscripción" }
];

export function MyCourses({ onCourseSelect }: MyCoursesProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [progressFilter, setProgressFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");

  const filteredCourses = mockEnrolledCourses
    .filter(course => {
      const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           course.instructor.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           course.category.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesProgress = progressFilter === "all" ||
                             (progressFilter === "completed" && course.progress === 100) ||
                             (progressFilter === "in-progress" && course.progress > 0 && course.progress < 100) ||
                             (progressFilter === "not-started" && course.progress === 0);
      
      return matchesSearch && matchesProgress;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "progress":
          return b.progress - a.progress;
        case "title":
          return a.title.localeCompare(b.title);
        case "enrolled":
          return new Date(b.enrolledAt).getTime() - new Date(a.enrolledAt).getTime();
        case "recent":
        default:
          return new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime();
      }
    });

  const getProgressStatus = (progress: number) => {
    if (progress === 0) return { text: "Sin empezar", color: "bg-gray-100 text-gray-800" };
    if (progress === 100) return { text: "Completado", color: "bg-green-100 text-green-800" };
    return { text: "En progreso", color: "bg-blue-100 text-blue-800" };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Mis Cursos</h2>
          <p className="text-gray-600">Continúa tu aprendizaje donde lo dejaste</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-purple-100 text-purple-800">
            {mockEnrolledCourses.length} cursos inscritos
          </Badge>
          <Badge className="bg-green-100 text-green-800">
            {mockEnrolledCourses.filter(c => c.certificateEarned).length} certificados
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar en mis cursos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={progressFilter} onValueChange={setProgressFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {progressFilters.map((filter) => (
              <SelectItem key={filter.value} value={filter.value}>
                {filter.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => {
          const progressStatus = getProgressStatus(course.progress);
          
          return (
            <Card 
              key={course.id} 
              className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-purple-200"
              onClick={() => onCourseSelect(course.id)}
            >
              <div className="relative">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 rounded-t-lg flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Button size="sm" className="bg-white text-purple-600 hover:bg-purple-50">
                      <Play className="h-4 w-4 mr-2" />
                      Continuar
                    </Button>
                  </div>
                </div>
                
                {/* Progress Badge */}
                <div className="absolute top-3 left-3">
                  <Badge className={progressStatus.color}>
                    {progressStatus.text}
                  </Badge>
                </div>
                
                {/* Certificate Badge */}
                {course.certificateEarned && (
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-yellow-100 text-yellow-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Certificado
                    </Badge>
                  </div>
                )}
                
                {/* More Options */}
                <div className="absolute bottom-3 right-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="bg-white/90 backdrop-blur-sm"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem>Ver detalles</DropdownMenuItem>
                      <DropdownMenuItem>Descargar certificado</DropdownMenuItem>
                      <DropdownMenuItem>Compartir progreso</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">Cancelar inscripción</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Course Info */}
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
                      {course.title}
                    </h3>
                    <div className="flex items-center gap-2 mb-3">
                      <img
                        src={course.instructorAvatar}
                        alt={course.instructor}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      <span className="text-sm text-gray-600">{course.instructor}</span>
                    </div>
                  </div>
                  
                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Progreso</span>
                      <span className="font-medium text-purple-600">{course.progress}%</span>
                    </div>
                    <Progress value={course.progress} className="h-2" />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{course.completedLessons} de {course.lessons} lecciones</span>
                      <span>Último acceso: {formatDate(course.lastAccessed)}</span>
                    </div>
                  </div>
                  
                  {/* Course Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{course.duration}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{course.rating}</span>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {course.level}
                    </Badge>
                  </div>
                  
                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    {course.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {course.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{course.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {/* Empty State */}
      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron cursos</h3>
          <p className="text-gray-600 mb-4">
            {searchQuery || progressFilter !== "all" 
              ? "Intenta ajustar tus filtros de búsqueda"
              : "Aún no tienes cursos inscritos"}
          </p>
          {!searchQuery && progressFilter === "all" && (
            <Button className="bg-gradient-to-r from-purple-600 to-blue-600">
              Explorar Cursos
            </Button>
          )}
        </div>
      )}
    </div>
  );
}