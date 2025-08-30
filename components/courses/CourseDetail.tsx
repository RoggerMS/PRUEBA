'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft,
  Play,
  Clock,
  Users,
  Star,
  BookOpen,
  Download,
  Share2,
  Heart,
  Trophy,
  CheckCircle,
  Lock,
  PlayCircle,
  FileText,
  MessageCircle,
  ThumbsUp,
  Calendar,
  Globe,
  Award
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
}

interface Lesson {
  id: string;
  title: string;
  duration: string;
  type: 'video' | 'reading' | 'quiz' | 'assignment';
  completed: boolean;
  locked: boolean;
  description?: string;
}

interface Module {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
  duration: string;
  completed: boolean;
}

interface Review {
  id: string;
  user: {
    name: string;
    avatar?: string;
  };
  rating: number;
  comment: string;
  date: string;
  helpful: number;
}

interface CourseDetailProps {
  course: Course;
  onBack: () => void;
  onEnroll?: (courseId: string) => void;
  onStartLesson?: (lessonId: string) => void;
}

export function CourseDetail({ course, onBack, onEnroll, onStartLesson }: CourseDetailProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedModule, setExpandedModule] = useState<string | null>(null);

  // Mock data for course modules
  const mockModules: Module[] = [
    {
      id: '1',
      title: 'Introducción al Cálculo',
      description: 'Conceptos fundamentales y preparación',
      duration: '2h 30m',
      completed: course.enrolled && course.progress > 0,
      lessons: [
        {
          id: '1-1',
          title: 'Bienvenida al curso',
          duration: '10m',
          type: 'video',
          completed: course.enrolled && course.progress > 10,
          locked: false
        },
        {
          id: '1-2',
          title: 'Conceptos previos de álgebra',
          duration: '25m',
          type: 'video',
          completed: course.enrolled && course.progress > 20,
          locked: !course.enrolled
        },
        {
          id: '1-3',
          title: 'Funciones y gráficas',
          duration: '30m',
          type: 'video',
          completed: course.enrolled && course.progress > 30,
          locked: !course.enrolled
        },
        {
          id: '1-4',
          title: 'Quiz: Conceptos básicos',
          duration: '15m',
          type: 'quiz',
          completed: course.enrolled && course.progress > 40,
          locked: !course.enrolled
        }
      ]
    },
    {
      id: '2',
      title: 'Límites y Continuidad',
      description: 'Fundamentos de límites y funciones continuas',
      duration: '4h 15m',
      completed: false,
      lessons: [
        {
          id: '2-1',
          title: 'Concepto de límite',
          duration: '35m',
          type: 'video',
          completed: false,
          locked: !course.enrolled
        },
        {
          id: '2-2',
          title: 'Cálculo de límites',
          duration: '45m',
          type: 'video',
          completed: false,
          locked: !course.enrolled
        },
        {
          id: '2-3',
          title: 'Continuidad de funciones',
          duration: '40m',
          type: 'video',
          completed: false,
          locked: !course.enrolled
        }
      ]
    }
  ];

  // Mock reviews
  const mockReviews: Review[] = [
    {
      id: '1',
      user: {
        name: 'Ana García',
        avatar: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20female%20student%20portrait%20friendly%20smile&image_size=square'
      },
      rating: 5,
      comment: 'Excelente curso, muy bien explicado. Los ejemplos son claros y las prácticas ayudan mucho.',
      date: '2024-01-10',
      helpful: 12
    },
    {
      id: '2',
      user: {
        name: 'Carlos Mendoza',
        avatar: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20male%20student%20portrait%20academic%20style&image_size=square'
      },
      rating: 4,
      comment: 'Muy buen contenido, aunque me gustaría que tuviera más ejercicios prácticos.',
      date: '2024-01-08',
      helpful: 8
    }
  ];

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
      'Idiomas': 'bg-pink-100 text-pink-800',
      'Arte': 'bg-indigo-100 text-indigo-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const formatPrice = (price: number) => {
    return price === 0 ? 'Gratis' : `$${price.toLocaleString()}`;
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating) 
            ? 'text-yellow-400 fill-current' 
            : i < rating 
            ? 'text-yellow-400 fill-current opacity-50'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'video': return <PlayCircle className="h-4 w-4" />;
      case 'reading': return <FileText className="h-4 w-4" />;
      case 'quiz': return <CheckCircle className="h-4 w-4" />;
      case 'assignment': return <BookOpen className="h-4 w-4" />;
      default: return <PlayCircle className="h-4 w-4" />;
    }
  };

  const totalLessons = mockModules.reduce((acc, module) => acc + module.lessons.length, 0);
  const completedLessons = mockModules.reduce((acc, module) => 
    acc + module.lessons.filter(lesson => lesson.completed).length, 0
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="mb-4 hover:bg-white/50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a cursos
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Course Header */}
            <Card>
              <div className="relative">
                {course.thumbnail && (
                  <img 
                    src={course.thumbnail} 
                    alt={course.title}
                    className="w-full h-64 object-cover rounded-t-lg"
                  />
                )}
                
                {/* Play button overlay */}
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center rounded-t-lg">
                  <Button size="lg" className="bg-white/90 hover:bg-white text-blue-600">
                    <Play className="h-6 w-6 mr-2" />
                    {course.enrolled ? 'Continuar curso' : 'Vista previa'}
                  </Button>
                </div>
              </div>
              
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-2xl mb-2">{course.title}</CardTitle>
                    <CardDescription className="text-base mb-4">
                      {course.description}
                    </CardDescription>
                    
                    {/* Instructor */}
                    <div className="flex items-center gap-3 mb-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={course.instructorAvatar} alt={course.instructor} />
                        <AvatarFallback>
                          {course.instructor.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{course.instructor}</p>
                        <p className="text-sm text-gray-600">Instructor</p>
                      </div>
                    </div>
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge className={getCategoryColor(course.category)}>
                        {course.category}
                      </Badge>
                      <Badge className={getLevelColor(course.level)} variant="outline">
                        {course.level}
                      </Badge>
                      {course.featured && (
                        <Badge className="bg-yellow-100 text-yellow-800">
                          <Trophy className="h-3 w-3 mr-1" />
                          Destacado
                        </Badge>
                      )}
                    </div>
                    
                    {/* Stats */}
                    <div className="flex items-center gap-6 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{course.duration}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        <span>{totalLessons} lecciones</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{course.students.toLocaleString()} estudiantes</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {renderStars(course.rating)}
                        <span className="ml-1">{course.rating} ({course.reviews})</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Course Content Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Descripción</TabsTrigger>
                <TabsTrigger value="curriculum">Contenido</TabsTrigger>
                <TabsTrigger value="reviews">Reseñas</TabsTrigger>
                <TabsTrigger value="instructor">Instructor</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Sobre este curso</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      {course.description}
                    </p>
                    
                    <h4 className="font-semibold mb-2">Lo que aprenderás:</h4>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Conceptos fundamentales del cálculo diferencial e integral</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Técnicas de derivación e integración</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Aplicaciones prácticas en problemas reales</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Resolución de ejercicios paso a paso</span>
                      </li>
                    </ul>
                    
                    <h4 className="font-semibold mb-2 mt-6">Requisitos:</h4>
                    <ul className="space-y-1 text-gray-700">
                      <li>• Conocimientos básicos de álgebra</li>
                      <li>• Manejo de funciones matemáticas</li>
                      <li>• Ganas de aprender y practicar</li>
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="curriculum" className="space-y-4">
                {mockModules.map((module, index) => (
                  <Card key={module.id}>
                    <CardHeader 
                      className="cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => setExpandedModule(
                        expandedModule === module.id ? null : module.id
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">
                            Módulo {index + 1}: {module.title}
                          </CardTitle>
                          <CardDescription>{module.description}</CardDescription>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">{module.duration}</p>
                          <p className="text-xs text-gray-500">
                            {module.lessons.length} lecciones
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    
                    {expandedModule === module.id && (
                      <CardContent className="pt-0">
                        <div className="space-y-2">
                          {module.lessons.map((lesson, lessonIndex) => (
                            <div 
                              key={lesson.id}
                              className={`flex items-center gap-3 p-3 rounded-lg border ${
                                lesson.completed 
                                  ? 'bg-green-50 border-green-200' 
                                  : lesson.locked 
                                  ? 'bg-gray-50 border-gray-200' 
                                  : 'bg-white border-gray-200 hover:bg-blue-50 cursor-pointer'
                              }`}
                              onClick={() => {
                                if (!lesson.locked) {
                                  onStartLesson?.(lesson.id);
                                }
                              }}
                            >
                              <div className="flex-shrink-0">
                                {lesson.locked ? (
                                  <Lock className="h-4 w-4 text-gray-400" />
                                ) : lesson.completed ? (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                  getLessonIcon(lesson.type)
                                )}
                              </div>
                              
                              <div className="flex-1">
                                <p className={`font-medium ${
                                  lesson.locked ? 'text-gray-400' : 'text-gray-900'
                                }`}>
                                  {lessonIndex + 1}. {lesson.title}
                                </p>
                                {lesson.description && (
                                  <p className="text-sm text-gray-600">{lesson.description}</p>
                                )}
                              </div>
                              
                              <div className="text-sm text-gray-500">
                                {lesson.duration}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="reviews" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Reseñas de estudiantes</CardTitle>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {renderStars(course.rating)}
                        <span className="text-2xl font-bold">{course.rating}</span>
                      </div>
                      <div className="text-gray-600">
                        {course.reviews} reseñas
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {mockReviews.map((review) => (
                        <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                          <div className="flex items-start gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={review.user.avatar} alt={review.user.name} />
                              <AvatarFallback>
                                {review.user.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-medium">{review.user.name}</span>
                                <div className="flex items-center gap-1">
                                  {renderStars(review.rating)}
                                </div>
                                <span className="text-sm text-gray-500">
                                  {new Date(review.date).toLocaleDateString()}
                                </span>
                              </div>
                              
                              <p className="text-gray-700 mb-3">{review.comment}</p>
                              
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <button className="flex items-center gap-1 hover:text-blue-600">
                                  <ThumbsUp className="h-4 w-4" />
                                  Útil ({review.helpful})
                                </button>
                                <button className="flex items-center gap-1 hover:text-blue-600">
                                  <MessageCircle className="h-4 w-4" />
                                  Responder
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="instructor">
                <Card>
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={course.instructorAvatar} alt={course.instructor} />
                        <AvatarFallback className="text-lg">
                          {course.instructor.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div>
                        <CardTitle className="text-xl">{course.instructor}</CardTitle>
                        <CardDescription className="text-base">Profesor de Matemáticas</CardDescription>
                        
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>2,450 estudiantes</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <BookOpen className="h-4 w-4" />
                            <span>8 cursos</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4" />
                            <span>4.8 valoración</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      Dr. María González es profesora de Matemáticas con más de 15 años de experiencia 
                      en educación superior. Especializada en cálculo y análisis matemático, ha ayudado 
                      a miles de estudiantes a dominar conceptos complejos a través de métodos de 
                      enseñanza innovadores y ejemplos prácticos.
                    </p>
                    
                    <h4 className="font-semibold mb-2">Experiencia:</h4>
                    <ul className="space-y-1 text-gray-700 mb-4">
                      <li>• PhD en Matemáticas - Universidad Nacional</li>
                      <li>• 15+ años de experiencia docente</li>
                      <li>• Autora de 3 libros de texto de cálculo</li>
                      <li>• Investigadora en análisis matemático</li>
                    </ul>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Contactar
                      </Button>
                      <Button variant="outline" size="sm">
                        <Globe className="h-4 w-4 mr-2" />
                        Perfil completo
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Enrollment Card */}
            <Card className="sticky top-6">
              <CardHeader>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {formatPrice(course.price)}
                  </div>
                  {course.price > 0 && (
                    <p className="text-sm text-gray-600">Acceso completo de por vida</p>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {course.enrolled ? (
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span>Progreso del curso</span>
                        <span className="font-medium">{course.progress}%</span>
                      </div>
                      <Progress value={course.progress} className="h-2" />
                      <p className="text-xs text-gray-500 mt-1">
                        {completedLessons} de {totalLessons} lecciones completadas
                      </p>
                    </div>
                    
                    <Button className="w-full" size="lg">
                      <Play className="h-5 w-5 mr-2" />
                      Continuar curso
                    </Button>
                    
                    <Button variant="outline" className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Descargar certificado
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Button 
                      className="w-full" 
                      size="lg"
                      onClick={() => onEnroll?.(course.id)}
                    >
                      <BookOpen className="h-5 w-5 mr-2" />
                      Inscribirse ahora
                    </Button>
                    
                    <Button variant="outline" className="w-full">
                      <Play className="h-4 w-4 mr-2" />
                      Vista previa gratuita
                    </Button>
                  </div>
                )}
                
                <Separator />
                
                <div className="flex justify-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Heart className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Course Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Información del curso</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Nivel:</span>
                  <Badge className={getLevelColor(course.level)} variant="secondary">
                    {course.level}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Duración:</span>
                  <span className="font-medium">{course.duration}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Lecciones:</span>
                  <span className="font-medium">{totalLessons}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Estudiantes:</span>
                  <span className="font-medium">{course.students.toLocaleString()}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Idioma:</span>
                  <span className="font-medium">Español</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Certificado:</span>
                  <div className="flex items-center gap-1">
                    <Award className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-600">Incluido</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}