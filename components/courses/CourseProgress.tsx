'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  TrendingUp,
  Clock,
  BookOpen,
  Trophy,
  Star,
  Calendar,
  CheckCircle,
  Target,
  Award,
  BarChart3,
  Activity,
  Zap,
  Users,
  Medal,
  Flame,
  Brain,
  Timer,
  PlayCircle,
  FileText,
  MessageSquare,
  ThumbsUp,
  Eye,
  Download
} from 'lucide-react';

interface CourseStats {
  totalCourses: number;
  completedCourses: number;
  activeCourses: number;
  totalHours: number;
  averageRating: number;
  certificates: number;
  streak: number;
  rank: number;
  totalUsers: number;
}

interface WeeklyActivity {
  day: string;
  hours: number;
  lessons: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedDate?: string;
  progress?: number;
  target?: number;
}

interface CourseProgressData {
  id: string;
  title: string;
  instructor: string;
  thumbnail?: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  timeSpent: string;
  lastActivity: string;
  nextMilestone: string;
  category: string;
  difficulty: string;
}

interface CourseProgressProps {
  onCourseSelect?: (courseId: string) => void;
}

export function CourseProgress({ onCourseSelect }: CourseProgressProps) {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data for course statistics
  const mockStats: CourseStats = {
    totalCourses: 8,
    completedCourses: 3,
    activeCourses: 4,
    totalHours: 127.5,
    averageRating: 4.7,
    certificates: 3,
    streak: 12,
    rank: 156,
    totalUsers: 2847
  };

  // Mock weekly activity data
  const mockWeeklyActivity: WeeklyActivity[] = [
    { day: 'Lun', hours: 2.5, lessons: 4 },
    { day: 'Mar', hours: 1.8, lessons: 3 },
    { day: 'Mié', hours: 3.2, lessons: 5 },
    { day: 'Jue', hours: 0, lessons: 0 },
    { day: 'Vie', hours: 2.1, lessons: 3 },
    { day: 'Sáb', hours: 4.5, lessons: 7 },
    { day: 'Dom', hours: 1.5, lessons: 2 }
  ];

  // Mock achievements data
  const mockAchievements: Achievement[] = [
    {
      id: '1',
      title: 'Primer Paso',
      description: 'Completa tu primera lección',
      icon: '🎯',
      earned: true,
      earnedDate: '2024-01-15'
    },
    {
      id: '2',
      title: 'Racha de Fuego',
      description: 'Estudia 7 días consecutivos',
      icon: '🔥',
      earned: true,
      earnedDate: '2024-01-18'
    },
    {
      id: '3',
      title: 'Maratonista',
      description: 'Estudia más de 5 horas en un día',
      icon: '🏃‍♂️',
      earned: false,
      progress: 3.2,
      target: 5
    },
    {
      id: '4',
      title: 'Experto',
      description: 'Completa 5 cursos',
      icon: '🎓',
      earned: false,
      progress: 3,
      target: 5
    },
    {
      id: '5',
      title: 'Perfeccionista',
      description: 'Obtén calificación perfecta en 10 quizzes',
      icon: '⭐',
      earned: false,
      progress: 7,
      target: 10
    },
    {
      id: '6',
      title: 'Velocista',
      description: 'Completa 20 lecciones en una semana',
      icon: '⚡',
      earned: true,
      earnedDate: '2024-01-12'
    }
  ];

  // Mock course progress data
  const mockCourseProgress: CourseProgressData[] = [
    {
      id: '1',
      title: 'Cálculo Diferencial e Integral',
      instructor: 'Dr. María González',
      thumbnail: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=mathematics%20calculus%20equations%20academic&image_size=square',
      progress: 62,
      totalLessons: 45,
      completedLessons: 28,
      timeSpent: '24h 30m',
      lastActivity: '2024-01-20',
      nextMilestone: 'Examen parcial (70%)',
      category: 'Matemáticas',
      difficulty: 'Intermedio'
    },
    {
      id: '2',
      title: 'Programación en Python',
      instructor: 'Ing. Carlos Ruiz',
      thumbnail: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=python%20programming%20code%20development&image_size=square',
      progress: 100,
      totalLessons: 60,
      completedLessons: 60,
      timeSpent: '42h 15m',
      lastActivity: '2024-01-10',
      nextMilestone: 'Curso completado',
      category: 'Programación',
      difficulty: 'Principiante'
    },
    {
      id: '3',
      title: 'Física Cuántica Básica',
      instructor: 'Dr. Ana Martínez',
      thumbnail: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=quantum%20physics%20atoms%20science&image_size=square',
      progress: 32,
      totalLessons: 38,
      completedLessons: 12,
      timeSpent: '18h 45m',
      lastActivity: '2024-01-18',
      nextMilestone: 'Laboratorio virtual (50%)',
      category: 'Ciencias',
      difficulty: 'Avanzado'
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
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

  const maxHours = Math.max(...mockWeeklyActivity.map(d => d.hours));

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Progreso general</p>
                <p className="text-2xl font-bold text-blue-600">
                  {Math.round((mockStats.completedCourses / mockStats.totalCourses) * 100)}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Horas totales</p>
                <p className="text-2xl font-bold text-green-600">{mockStats.totalHours}h</p>
              </div>
              <Clock className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Racha actual</p>
                <p className="text-2xl font-bold text-orange-600">{mockStats.streak} días</p>
              </div>
              <Flame className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ranking</p>
                <p className="text-2xl font-bold text-purple-600">#{mockStats.rank}</p>
              </div>
              <Trophy className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="courses">Cursos</TabsTrigger>
          <TabsTrigger value="activity">Actividad</TabsTrigger>
          <TabsTrigger value="achievements">Logros</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Weekly Activity Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Actividad semanal
              </CardTitle>
              <CardDescription>
                Horas de estudio y lecciones completadas esta semana
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockWeeklyActivity.map((day, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-12 text-sm font-medium text-gray-600">
                      {day.day}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div 
                          className="bg-blue-500 rounded-full h-2 transition-all duration-300"
                          style={{ width: `${(day.hours / maxHours) * 100}%`, minWidth: day.hours > 0 ? '8px' : '0' }}
                        />
                        <span className="text-sm text-gray-600">{day.hours}h</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {day.lessons} lecciones
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 grid grid-cols-2 gap-4 text-center">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">
                    {mockWeeklyActivity.reduce((acc, day) => acc + day.hours, 0)}h
                  </p>
                  <p className="text-sm text-blue-600">Esta semana</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">
                    {mockWeeklyActivity.reduce((acc, day) => acc + day.lessons, 0)}
                  </p>
                  <p className="text-sm text-green-600">Lecciones</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Estadísticas generales
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Cursos completados</span>
                  <span className="font-medium">{mockStats.completedCourses}/{mockStats.totalCourses}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Valoración promedio</span>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="font-medium">{mockStats.averageRating}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Certificados obtenidos</span>
                  <span className="font-medium">{mockStats.certificates}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Posición en ranking</span>
                  <span className="font-medium">#{mockStats.rank} de {mockStats.totalUsers.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Actividad reciente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                  <div>
                    <p className="text-sm font-medium">Lección completada</p>
                    <p className="text-xs text-gray-600">Integración por partes - hace 2 horas</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                  <div>
                    <p className="text-sm font-medium">Quiz aprobado</p>
                    <p className="text-xs text-gray-600">Límites y continuidad - ayer</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2" />
                  <div>
                    <p className="text-sm font-medium">Logro desbloqueado</p>
                    <p className="text-xs text-gray-600">Racha de fuego - hace 3 días</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2" />
                  <div>
                    <p className="text-sm font-medium">Curso iniciado</p>
                    <p className="text-xs text-gray-600">Física Cuántica - hace 1 semana</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="courses" className="space-y-4">
          {mockCourseProgress.map((course) => (
            <Card key={course.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {course.thumbnail && (
                    <img 
                      src={course.thumbnail} 
                      alt={course.title}
                      className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                    />
                  )}
                  
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{course.title}</h3>
                        <p className="text-gray-600">{course.instructor}</p>
                      </div>
                      
                      <div className="flex gap-2">
                        <Badge className={getCategoryColor(course.category)} variant="secondary">
                          {course.category}
                        </Badge>
                        <Badge className={getDifficultyColor(course.difficulty)} variant="outline">
                          {course.difficulty}
                        </Badge>
                      </div>
                    </div>
                    
                    {/* Progress */}
                    <div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span>Progreso del curso</span>
                        <span className="font-medium">{course.progress}%</span>
                      </div>
                      <Progress value={course.progress} className="h-2" />
                      <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                        <span>{course.completedLessons} de {course.totalLessons} lecciones</span>
                        <span>{course.timeSpent} invertidas</span>
                      </div>
                    </div>
                    
                    {/* Next milestone */}
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm text-blue-800 font-medium">Próximo hito:</p>
                      <p className="text-sm text-blue-600">{course.nextMilestone}</p>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        Última actividad: {new Date(course.lastActivity).toLocaleDateString()}
                      </div>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onCourseSelect?.(course.id)}
                      >
                        Ver detalles
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Historial de actividad
              </CardTitle>
              <CardDescription>
                Tu actividad de aprendizaje en los últimos 30 días
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Activity timeline */}
                <div className="space-y-4">
                  {[
                    { date: '2024-01-20', type: 'lesson', title: 'Integración por partes completada', course: 'Cálculo Diferencial', time: '14:30' },
                    { date: '2024-01-20', type: 'quiz', title: 'Quiz de límites aprobado (95%)', course: 'Cálculo Diferencial', time: '13:15' },
                    { date: '2024-01-19', type: 'achievement', title: 'Logro "Racha de fuego" desbloqueado', course: '', time: '16:45' },
                    { date: '2024-01-19', type: 'lesson', title: '3 lecciones completadas', course: 'Inglés Conversacional', time: '10:20' },
                    { date: '2024-01-18', type: 'course', title: 'Curso "Física Cuántica" iniciado', course: '', time: '09:00' },
                    { date: '2024-01-17', type: 'certificate', title: 'Certificado de Python obtenido', course: 'Programación en Python', time: '15:30' }
                  ].map((activity, index) => (
                    <div key={index} className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-b-0">
                      <div className="flex-shrink-0">
                        {activity.type === 'lesson' && <PlayCircle className="h-5 w-5 text-blue-500" />}
                        {activity.type === 'quiz' && <CheckCircle className="h-5 w-5 text-green-500" />}
                        {activity.type === 'achievement' && <Trophy className="h-5 w-5 text-yellow-500" />}
                        {activity.type === 'course' && <BookOpen className="h-5 w-5 text-purple-500" />}
                        {activity.type === 'certificate' && <Award className="h-5 w-5 text-orange-500" />}
                      </div>
                      
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{activity.title}</p>
                        {activity.course && (
                          <p className="text-sm text-gray-600">{activity.course}</p>
                        )}
                        <p className="text-xs text-gray-500">
                          {new Date(activity.date).toLocaleDateString()} a las {activity.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="text-center">
                  <Button variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    Ver más actividad
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Medal className="h-5 w-5" />
                Logros y insignias
              </CardTitle>
              <CardDescription>
                Desbloquea logros completando cursos y alcanzando metas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mockAchievements.map((achievement) => (
                  <Card 
                    key={achievement.id} 
                    className={`transition-all duration-200 ${
                      achievement.earned 
                        ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200 shadow-md' 
                        : 'bg-gray-50 border-gray-200 opacity-75'
                    }`}
                  >
                    <CardContent className="p-4 text-center">
                      <div className="text-4xl mb-3">{achievement.icon}</div>
                      <h3 className={`font-semibold mb-2 ${
                        achievement.earned ? 'text-gray-900' : 'text-gray-600'
                      }`}>
                        {achievement.title}
                      </h3>
                      <p className={`text-sm mb-3 ${
                        achievement.earned ? 'text-gray-700' : 'text-gray-500'
                      }`}>
                        {achievement.description}
                      </p>
                      
                      {achievement.earned ? (
                        <div>
                          <Badge className="bg-yellow-100 text-yellow-800 mb-2">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Completado
                          </Badge>
                          {achievement.earnedDate && (
                            <p className="text-xs text-gray-600">
                              {new Date(achievement.earnedDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div>
                          {achievement.progress !== undefined && achievement.target && (
                            <div className="space-y-2">
                              <Progress 
                                value={(achievement.progress / achievement.target) * 100} 
                                className="h-2"
                              />
                              <p className="text-xs text-gray-600">
                                {achievement.progress} / {achievement.target}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}