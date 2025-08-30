'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Search,
  Filter,
  Play,
  Clock,
  BookOpen,
  Trophy,
  Star,
  Calendar,
  CheckCircle,
  MoreVertical,
  Download,
  Share2,
  Trash2,
  Archive,
  RotateCcw,
  TrendingUp,
  Award,
  Target,
  Users
} from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  instructorAvatar?: string;
  thumbnail?: string;
  duration: string;
  lessons: number;
  completedLessons: number;
  progress: number;
  rating: number;
  category: string;
  level: string;
  enrolledDate: string;
  lastAccessed: string;
  status: 'active' | 'completed' | 'paused';
  certificate?: boolean;
  nextLesson?: string;
}

interface MyCoursesProps {
  onCourseSelect?: (courseId: string) => void;
  onContinueCourse?: (courseId: string) => void;
}

export function MyCourses({ onCourseSelect, onContinueCourse }: MyCoursesProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  // Mock data for user's courses
  const mockCourses: Course[] = [
    {
      id: '1',
      title: 'Cálculo Diferencial e Integral',
      description: 'Curso completo de cálculo para estudiantes universitarios',
      instructor: 'Dr. María González',
      instructorAvatar: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20female%20professor%20mathematics%20friendly%20smile&image_size=square',
      thumbnail: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=mathematics%20calculus%20equations%20blackboard%20academic%20classroom&image_size=landscape_16_9',
      duration: '12h 30m',
      lessons: 45,
      completedLessons: 28,
      progress: 62,
      rating: 4.8,
      category: 'Matemáticas',
      level: 'Intermedio',
      enrolledDate: '2024-01-15',
      lastAccessed: '2024-01-20',
      status: 'active',
      nextLesson: 'Integración por partes'
    },
    {
      id: '2',
      title: 'Programación en Python',
      description: 'Aprende Python desde cero hasta nivel avanzado',
      instructor: 'Ing. Carlos Ruiz',
      instructorAvatar: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20male%20programmer%20developer%20coding%20expert&image_size=square',
      thumbnail: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=python%20programming%20code%20laptop%20development%20modern%20workspace&image_size=landscape_16_9',
      duration: '20h 15m',
      lessons: 60,
      completedLessons: 60,
      progress: 100,
      rating: 4.9,
      category: 'Programación',
      level: 'Principiante',
      enrolledDate: '2023-12-01',
      lastAccessed: '2024-01-10',
      status: 'completed',
      certificate: true
    },
    {
      id: '3',
      title: 'Física Cuántica Básica',
      description: 'Introducción a los conceptos fundamentales de la física cuántica',
      instructor: 'Dr. Ana Martínez',
      instructorAvatar: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20female%20physicist%20scientist%20laboratory%20academic&image_size=square',
      thumbnail: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=quantum%20physics%20atoms%20particles%20scientific%20laboratory%20modern&image_size=landscape_16_9',
      duration: '15h 45m',
      lessons: 38,
      completedLessons: 12,
      progress: 32,
      rating: 4.7,
      category: 'Ciencias',
      level: 'Avanzado',
      enrolledDate: '2024-01-08',
      lastAccessed: '2024-01-18',
      status: 'paused',
      nextLesson: 'Principio de incertidumbre'
    },
    {
      id: '4',
      title: 'Inglés Conversacional',
      description: 'Mejora tu inglés hablado con práctica intensiva',
      instructor: 'Prof. Sarah Johnson',
      instructorAvatar: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20english%20teacher%20language%20instructor%20friendly&image_size=square',
      thumbnail: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=english%20language%20learning%20conversation%20books%20classroom%20international&image_size=landscape_16_9',
      duration: '25h 00m',
      lessons: 75,
      completedLessons: 45,
      progress: 60,
      rating: 4.6,
      category: 'Idiomas',
      level: 'Intermedio',
      enrolledDate: '2023-11-20',
      lastAccessed: '2024-01-19',
      status: 'active',
      nextLesson: 'Business conversations'
    }
  ];

  const filteredCourses = mockCourses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTab = activeTab === 'all' || 
                      (activeTab === 'active' && course.status === 'active') ||
                      (activeTab === 'completed' && course.status === 'completed') ||
                      (activeTab === 'paused' && course.status === 'paused');
    
    return matchesSearch && matchesTab;
  });

  const sortedCourses = [...filteredCourses].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime();
      case 'progress':
        return b.progress - a.progress;
      case 'title':
        return a.title.localeCompare(b.title);
      case 'rating':
        return b.rating - a.rating;
      default:
        return 0;
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'En progreso';
      case 'completed': return 'Completado';
      case 'paused': return 'Pausado';
      default: return status;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'principiante': return 'bg-green-100 text-green-800';
      case 'intermedio': return 'bg-yellow-100 text-yellow-800';
      case 'avanzado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Matemáticas': 'bg-blue-100 text-blue-800',
      'Ciencias': 'bg-purple-100 text-purple-800',
      'Programación': 'bg-orange-100 text-orange-800',
      'Idiomas': 'bg-pink-100 text-pink-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${
          i < Math.floor(rating) 
            ? 'text-yellow-400 fill-current' 
            : i < rating 
            ? 'text-yellow-400 fill-current opacity-50'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  // Statistics
  const totalCourses = mockCourses.length;
  const activeCourses = mockCourses.filter(c => c.status === 'active').length;
  const completedCourses = mockCourses.filter(c => c.status === 'completed').length;
  const totalProgress = Math.round(mockCourses.reduce((acc, course) => acc + course.progress, 0) / totalCourses);
  const certificates = mockCourses.filter(c => c.certificate).length;

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Cursos totales</p>
                <p className="text-2xl font-bold text-blue-600">{totalCourses}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">En progreso</p>
                <p className="text-2xl font-bold text-green-600">{activeCourses}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completados</p>
                <p className="text-2xl font-bold text-purple-600">{completedCourses}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Certificados</p>
                <p className="text-2xl font-bold text-yellow-600">{certificates}</p>
              </div>
              <Award className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Progreso general
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span>Progreso promedio</span>
                <span className="font-medium">{totalProgress}%</span>
              </div>
              <Progress value={totalProgress} className="h-3" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="font-medium text-green-800">{activeCourses}</p>
                <p className="text-green-600">Cursos activos</p>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="font-medium text-blue-800">{completedCourses}</p>
                <p className="text-blue-600">Completados</p>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <p className="font-medium text-yellow-800">{certificates}</p>
                <p className="text-yellow-600">Certificados</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <CardTitle>Mis Cursos</CardTitle>
            
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar cursos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
              
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="recent">Más recientes</option>
                <option value="progress">Por progreso</option>
                <option value="title">Por título</option>
                <option value="rating">Por valoración</option>
              </select>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">Todos ({totalCourses})</TabsTrigger>
              <TabsTrigger value="active">Activos ({activeCourses})</TabsTrigger>
              <TabsTrigger value="completed">Completados ({completedCourses})</TabsTrigger>
              <TabsTrigger value="paused">Pausados ({mockCourses.filter(c => c.status === 'paused').length})</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              {sortedCourses.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron cursos</h3>
                  <p className="text-gray-600">Intenta ajustar los filtros de búsqueda.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {sortedCourses.map((course) => (
                    <Card key={course.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                      <div className="relative">
                        {course.thumbnail && (
                          <img 
                            src={course.thumbnail} 
                            alt={course.title}
                            className="w-full h-40 object-cover rounded-t-lg"
                          />
                        )}
                        
                        {/* Status badge */}
                        <div className="absolute top-3 left-3">
                          <Badge className={getStatusColor(course.status)}>
                            {getStatusText(course.status)}
                          </Badge>
                        </div>
                        
                        {/* Certificate badge */}
                        {course.certificate && (
                          <div className="absolute top-3 right-3">
                            <Badge className="bg-yellow-100 text-yellow-800">
                              <Trophy className="h-3 w-3 mr-1" />
                              Certificado
                            </Badge>
                          </div>
                        )}
                      </div>
                      
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg mb-1 line-clamp-2">{course.title}</CardTitle>
                            <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                          </div>
                          
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        {/* Instructor */}
                        <div className="flex items-center gap-2 mt-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={course.instructorAvatar} alt={course.instructor} />
                            <AvatarFallback className="text-xs">
                              {course.instructor.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-gray-600">{course.instructor}</span>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        {/* Progress */}
                        <div>
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span>Progreso</span>
                            <span className="font-medium">{course.progress}%</span>
                          </div>
                          <Progress value={course.progress} className="h-2" />
                          <p className="text-xs text-gray-500 mt-1">
                            {course.completedLessons} de {course.lessons} lecciones completadas
                          </p>
                        </div>
                        
                        {/* Course info */}
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>{course.duration}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              {renderStars(course.rating)}
                              <span className="ml-1">{course.rating}</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Tags */}
                        <div className="flex flex-wrap gap-2">
                          <Badge className={getCategoryColor(course.category)} variant="secondary">
                            {course.category}
                          </Badge>
                          <Badge className={getLevelColor(course.level)} variant="outline">
                            {course.level}
                          </Badge>
                        </div>
                        
                        {/* Next lesson */}
                        {course.nextLesson && course.status === 'active' && (
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <p className="text-sm text-blue-800 font-medium">Siguiente lección:</p>
                            <p className="text-sm text-blue-600">{course.nextLesson}</p>
                          </div>
                        )}
                        
                        {/* Action buttons */}
                        <div className="flex gap-2 pt-2">
                          {course.status === 'completed' ? (
                            <>
                              <Button 
                                variant="outline" 
                                className="flex-1"
                                onClick={() => onCourseSelect?.(course.id)}
                              >
                                <RotateCcw className="h-4 w-4 mr-2" />
                                Revisar
                              </Button>
                              {course.certificate && (
                                <Button variant="default" className="flex-1">
                                  <Download className="h-4 w-4 mr-2" />
                                  Certificado
                                </Button>
                              )}
                            </>
                          ) : (
                            <>
                              <Button 
                                className="flex-1"
                                onClick={() => onContinueCourse?.(course.id)}
                              >
                                <Play className="h-4 w-4 mr-2" />
                                {course.progress === 0 ? 'Comenzar' : 'Continuar'}
                              </Button>
                              <Button 
                                variant="outline"
                                onClick={() => onCourseSelect?.(course.id)}
                              >
                                Ver detalles
                              </Button>
                            </>
                          )}
                        </div>
                        
                        {/* Last accessed */}
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>Último acceso: {new Date(course.lastAccessed).toLocaleDateString()}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}