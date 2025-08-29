"use client";

import { useState } from "react";
import { ArrowLeft, Play, Clock, Users, Star, BookOpen, Download, CheckCircle, Lock, Heart, Share2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { gamificationService } from "@/services/gamificationService";

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
}

interface Lesson {
  id: string;
  title: string;
  duration: string;
  type: 'video' | 'quiz' | 'assignment' | 'reading';
  completed: boolean;
  locked: boolean;
  description?: string;
}

interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
  completed: boolean;
}

interface Review {
  id: string;
  user: string;
  avatar: string;
  rating: number;
  comment: string;
  date: string;
}

interface CourseDetailProps {
  course: Course;
  onBack: () => void;
}

// Mock data for course modules and lessons
const mockModules: Module[] = [
  {
    id: "1",
    title: "Introducción al Cálculo",
    completed: true,
    lessons: [
      {
        id: "1-1",
        title: "¿Qué es el cálculo?",
        duration: "15:30",
        type: "video",
        completed: true,
        locked: false,
        description: "Introducción general a los conceptos del cálculo diferencial e integral."
      },
      {
        id: "1-2",
        title: "Historia del cálculo",
        duration: "12:45",
        type: "video",
        completed: true,
        locked: false
      },
      {
        id: "1-3",
        title: "Quiz: Conceptos básicos",
        duration: "10:00",
        type: "quiz",
        completed: true,
        locked: false
      }
    ]
  },
  {
    id: "2",
    title: "Límites y Continuidad",
    completed: false,
    lessons: [
      {
        id: "2-1",
        title: "Concepto de límite",
        duration: "20:15",
        type: "video",
        completed: true,
        locked: false
      },
      {
        id: "2-2",
        title: "Propiedades de los límites",
        duration: "18:30",
        type: "video",
        completed: false,
        locked: false
      },
      {
        id: "2-3",
        title: "Continuidad de funciones",
        duration: "22:00",
        type: "video",
        completed: false,
        locked: true
      }
    ]
  },
  {
    id: "3",
    title: "Derivadas",
    completed: false,
    lessons: [
      {
        id: "3-1",
        title: "Definición de derivada",
        duration: "25:00",
        type: "video",
        completed: false,
        locked: true
      },
      {
        id: "3-2",
        title: "Reglas de derivación",
        duration: "30:15",
        type: "video",
        completed: false,
        locked: true
      }
    ]
  }
];

const mockReviews: Review[] = [
  {
    id: "1",
    user: "Ana García",
    avatar: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=student%20portrait%20female%20academic%20style&image_size=square",
    rating: 5,
    comment: "Excelente curso, muy bien explicado. Los ejemplos son claros y fáciles de seguir.",
    date: "2024-01-20"
  },
  {
    id: "2",
    user: "Carlos Mendoza",
    avatar: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=student%20portrait%20male%20academic%20style&image_size=square",
    rating: 4,
    comment: "Muy buen contenido, aunque me gustaría más ejercicios prácticos.",
    date: "2024-01-18"
  }
];

export function CourseDetail({ course, onBack }: CourseDetailProps) {
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);

  const handleEnroll = async () => {
    setIsEnrolling(true);
    // Simulate enrollment process
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsEnrolling(false);
    
    try {
      // Grant XP for enrolling in a course
      await gamificationService.grantXP("user-id", 30, "course", course.id, 'Inscripción en curso');
    } catch (error) {
      console.error('Error granting XP for course enrollment:', error);
    }
  };

  const handleLessonSelect = (lessonId: string) => {
    setSelectedLesson(lessonId);
  };

  const handleCompleteLesson = async (lessonId: string) => {
    try {
      // Find and mark lesson as completed
      const updatedModules = mockModules.map(module => ({
        ...module,
        lessons: module.lessons.map(lesson => 
          lesson.id === lessonId 
            ? { ...lesson, completed: true }
            : lesson
        )
      }));
      
      // Grant XP for completing a lesson
      await gamificationService.grantXP("user-id", 15, "course", course.id, 'Lección completada');
      
      // Here you would normally update the state or make an API call
      console.log('Lesson completed:', lessonId);
    } catch (error) {
      console.error('Error completing lesson:', error);
    }
  };

  const handleCompleteCourse = async () => {
    try {
      // Grant XP for completing entire course
      await gamificationService.grantXP("user-id", 100, "course", course.id, 'Curso completado');
      console.log('Course completed!');
    } catch (error) {
      console.error('Error completing course:', error);
    }
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Play className="h-4 w-4" />;
      case 'quiz':
        return <CheckCircle className="h-4 w-4" />;
      case 'assignment':
        return <BookOpen className="h-4 w-4" />;
      case 'reading':
        return <BookOpen className="h-4 w-4" />;
      default:
        return <Play className="h-4 w-4" />;
    }
  };

  const completedLessons = mockModules.reduce((total, module) => {
    return total + module.lessons.filter(lesson => lesson.completed).length;
  }, 0);

  const totalLessons = mockModules.reduce((total, module) => {
    return total + module.lessons.length;
  }, 0);

  const progressPercentage = (completedLessons / totalLessons) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
          <div className="flex items-center gap-2 ml-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsLiked(!isLiked)}
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Course Header */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full md:w-80 h-48 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className="bg-purple-100 text-purple-800">
                        {course.level}
                      </Badge>
                      <Badge className="bg-blue-100 text-blue-800">
                        {course.category}
                      </Badge>
                      {course.featured && (
                        <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                          Destacado
                        </Badge>
                      )}
                    </div>
                    
                    <h1 className="text-3xl font-bold text-gray-900 mb-3">
                      {course.title}
                    </h1>
                    
                    <p className="text-gray-600 mb-4">
                      {course.description}
                    </p>
                    
                    <div className="flex items-center gap-2 mb-4">
                      <img
                        src={course.instructorAvatar}
                        alt={course.instructor}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <span className="font-medium text-gray-900">{course.instructor}</span>
                    </div>
                    
                    <div className="flex items-center gap-6 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{course.duration}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        <span>{course.lessons} lecciones</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{course.students.toLocaleString()} estudiantes</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{course.rating} ({course.reviews} reseñas)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Course Content Tabs */}
            <Tabs defaultValue="curriculum" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="curriculum">Contenido</TabsTrigger>
                <TabsTrigger value="reviews">Reseñas</TabsTrigger>
                <TabsTrigger value="instructor">Instructor</TabsTrigger>
              </TabsList>

              <TabsContent value="curriculum" className="space-y-4">
                {mockModules.map((module, moduleIndex) => (
                  <Card key={module.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>Módulo {moduleIndex + 1}: {module.title}</span>
                        {module.completed && (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {module.lessons.map((lesson, lessonIndex) => (
                          <div
                            key={lesson.id}
                            className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                              lesson.locked 
                                ? 'bg-gray-50' 
                                : 'hover:bg-purple-50 border-gray-200'
                            } ${
                              selectedLesson === lesson.id ? 'bg-purple-100 border-purple-300' : ''
                            }`}
                          >
                            <div 
                              className="flex items-center gap-3 flex-1 cursor-pointer"
                              onClick={() => !lesson.locked && handleLessonSelect(lesson.id)}
                            >
                              <div className={`p-2 rounded-full ${
                                lesson.completed 
                                  ? 'bg-green-100 text-green-600' 
                                  : lesson.locked 
                                    ? 'bg-gray-100 text-gray-400'
                                    : 'bg-purple-100 text-purple-600'
                              }`}>
                                {lesson.locked ? (
                                  <Lock className="h-4 w-4" />
                                ) : lesson.completed ? (
                                  <CheckCircle className="h-4 w-4" />
                                ) : (
                                  getLessonIcon(lesson.type)
                                )}
                              </div>
                              <div>
                                <h4 className={`font-medium ${
                                  lesson.locked ? 'text-gray-400' : 'text-gray-900'
                                }`}>
                                  {lessonIndex + 1}. {lesson.title}
                                </h4>
                                {lesson.description && (
                                  <p className="text-sm text-gray-600">{lesson.description}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`text-sm ${
                                lesson.locked ? 'text-gray-400' : 'text-gray-600'
                              }`}>
                                {lesson.duration}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {lesson.type}
                              </Badge>
                              {!lesson.locked && !lesson.completed && course.enrolled && (
                                <Button
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCompleteLesson(lesson.id);
                                  }}
                                  className="ml-2 bg-green-600 hover:bg-green-700 text-white"
                                >
                                  Completar
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="reviews" className="space-y-4">
                {mockReviews.map((review) => (
                  <Card key={review.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <img
                          src={review.avatar}
                          alt={review.user}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium text-gray-900">{review.user}</h4>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < review.rating
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-gray-500">{review.date}</span>
                          </div>
                          <p className="text-gray-700">{review.comment}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="instructor">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-6">
                      <img
                        src={course.instructorAvatar}
                        alt={course.instructor}
                        className="w-24 h-24 rounded-full object-cover"
                      />
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">{course.instructor}</h3>
                        <p className="text-gray-600 mb-4">
                          Profesor con más de 15 años de experiencia en matemáticas y cálculo. 
                          Ha publicado numerosos artículos académicos y ha enseñado a miles de estudiantes.
                        </p>
                        <div className="flex items-center gap-6 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <BookOpen className="h-4 w-4" />
                            <span>12 cursos</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>15,000+ estudiantes</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span>4.8 valoración</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Enrollment Card */}
            <Card>
              <CardContent className="p-6">
                {course.enrolled ? (
                  <div className="space-y-4">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Tu Progreso</h3>
                      <div className="text-3xl font-bold text-purple-600 mb-2">
                        {Math.round(progressPercentage)}%
                      </div>
                      <Progress value={progressPercentage} className="mb-4" />
                      <p className="text-sm text-gray-600">
                        {completedLessons} de {totalLessons} lecciones completadas
                      </p>
                      {course.enrolled && progressPercentage === 100 && (
                        <Button
                          onClick={handleCompleteCourse}
                          className="mt-3 w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                        >
                          🎉 Completar Curso
                        </Button>
                      )}
                    </div>
                    <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600">
                      Continuar Aprendiendo
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600 mb-2">
                        {course.price} Crolars
                      </div>
                      <p className="text-sm text-gray-600">Acceso completo de por vida</p>
                    </div>
                    <Button
                      onClick={handleEnroll}
                      disabled={isEnrolling}
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600"
                    >
                      {isEnrolling ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Inscribiendo...
                        </div>
                      ) : (
                        'Inscribirse Ahora'
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Course Info */}
            <Card>
              <CardHeader>
                <CardTitle>Información del Curso</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Duración:</span>
                  <span className="font-medium">{course.duration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Lecciones:</span>
                  <span className="font-medium">{course.lessons}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Nivel:</span>
                  <span className="font-medium">{course.level}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Idioma:</span>
                  <span className="font-medium">Español</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Certificado:</span>
                  <span className="font-medium">Sí</span>
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader>
                <CardTitle>Temas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {course.tags.map((tag, index) => (
                    <Badge key={index} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
