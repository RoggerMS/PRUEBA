"use client";

import { useState } from "react";
import { Search, Filter, BookOpen, Play, Clock, Users, Star, Trophy, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CourseCard } from "@/components/courses/CourseCard";
import { CourseDetail } from "@/components/courses/CourseDetail";
import { MyCourses } from "@/components/courses/MyCourses";
import { CourseProgress } from "@/components/courses/CourseProgress";

// Mock data for courses
const mockCourses = [
  {
    id: "1",
    title: "Cálculo Diferencial e Integral",
    description: "Domina los conceptos fundamentales del cálculo con ejercicios prácticos y ejemplos reales.",
    instructor: "Dr. María González",
    instructorAvatar: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20female%20mathematics%20professor%20portrait%20academic%20style&image_size=square",
    thumbnail: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=calculus%20mathematics%20formulas%20blackboard%20academic%20classroom&image_size=landscape_16_9",
    duration: "12 horas",
    lessons: 24,
    students: 1250,
    rating: 4.8,
    reviews: 156,
    price: 150,
    level: "Intermedio",
    category: "Matemáticas",
    subject: "Cálculo",
    tags: ["Derivadas", "Integrales", "Límites", "Continuidad"],
    progress: 0,
    enrolled: false,
    featured: true,
    createdAt: "2024-01-15"
  },
  {
    id: "2",
    title: "Química Orgánica Avanzada",
    description: "Explora las reacciones y mecanismos de la química orgánica con laboratorios virtuales.",
    instructor: "Prof. Carlos Mendoza",
    instructorAvatar: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20male%20chemistry%20professor%20portrait%20laboratory%20coat&image_size=square",
    thumbnail: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=organic%20chemistry%20laboratory%20molecules%20scientific%20equipment&image_size=landscape_16_9",
    duration: "16 horas",
    lessons: 32,
    students: 890,
    rating: 4.7,
    reviews: 98,
    price: 200,
    level: "Avanzado",
    category: "Ciencias",
    subject: "Química",
    tags: ["Reacciones", "Mecanismos", "Síntesis", "Laboratorio"],
    progress: 65,
    enrolled: true,
    featured: false,
    createdAt: "2024-01-10"
  },
  {
    id: "3",
    title: "Física Cuántica Fundamental",
    description: "Introducción a los principios de la mecánica cuántica y sus aplicaciones modernas.",
    instructor: "Dra. Ana Rodríguez",
    instructorAvatar: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20female%20physics%20professor%20portrait%20academic%20style&image_size=square",
    thumbnail: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=quantum%20physics%20atoms%20particles%20scientific%20visualization&image_size=landscape_16_9",
    duration: "20 horas",
    lessons: 40,
    students: 567,
    rating: 4.9,
    reviews: 89,
    price: 250,
    level: "Avanzado",
    category: "Ciencias",
    subject: "Física",
    tags: ["Cuántica", "Partículas", "Ondas", "Probabilidad"],
    progress: 0,
    enrolled: false,
    featured: true,
    createdAt: "2024-01-05"
  }
];

const categories = ["Todas", "Matemáticas", "Ciencias", "Programación", "Idiomas", "Arte"];
const levels = ["Todos", "Principiante", "Intermedio", "Avanzado"];
const sortOptions = [
  { value: "popular", label: "Más populares" },
  { value: "recent", label: "Más recientes" },
  { value: "rating", label: "Mejor valorados" },
  { value: "price-low", label: "Precio: menor a mayor" },
  { value: "price-high", label: "Precio: mayor a menor" }
];

export default function CoursesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [selectedLevel, setSelectedLevel] = useState("Todos");
  const [sortBy, setSortBy] = useState("popular");
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("browse");

  const handleCourseSelect = (courseId: string) => {
    setSelectedCourseId(courseId);
  };

  const handleBackToCourses = () => {
    setSelectedCourseId(null);
  };

  // Filter and sort courses
  const filteredCourses = mockCourses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.instructor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "Todas" || course.category === selectedCategory;
    const matchesLevel = selectedLevel === "Todos" || course.level === selectedLevel;
    
    return matchesSearch && matchesCategory && matchesLevel;
  }).sort((a, b) => {
    switch (sortBy) {
      case "recent":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "rating":
        return b.rating - a.rating;
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      default: // popular
        return b.students - a.students;
    }
  });

  const enrolledCourses = mockCourses.filter(course => course.enrolled);
  const featuredCourses = mockCourses.filter(course => course.featured);

  if (selectedCourseId) {
    const selectedCourse = mockCourses.find(course => course.id === selectedCourseId);
    if (selectedCourse) {
      return (
        <CourseDetail 
          course={selectedCourse} 
          onBack={handleBackToCourses}
        />
      );
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Cursos</h1>
              <p className="text-gray-600">Aprende con los mejores instructores</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <BookOpen className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{mockCourses.length}</p>
                    <p className="text-sm text-gray-600">Cursos disponibles</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{enrolledCourses.length}</p>
                    <p className="text-sm text-gray-600">Cursos inscritos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Trophy className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">1</p>
                    <p className="text-sm text-gray-600">Cursos completados</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Clock className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">48h</p>
                    <p className="text-sm text-gray-600">Tiempo estudiado</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="browse">Explorar</TabsTrigger>
            <TabsTrigger value="my-courses">Mis Cursos</TabsTrigger>
            <TabsTrigger value="progress">Progreso</TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-6">
            {/* Search and Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Buscar cursos, instructores o temas..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                    
                    <select
                      value={selectedLevel}
                      onChange={(e) => setSelectedLevel(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      {levels.map(level => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
                    
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      {sortOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Featured Courses */}
            {featuredCourses.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Cursos Destacados</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6 mb-8">
                  {featuredCourses.map(course => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      onClick={() => handleCourseSelect(course.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* All Courses */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Todos los Cursos ({filteredCourses.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
                {filteredCourses.map(course => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    onClick={() => handleCourseSelect(course.id)}
                  />
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="my-courses">
            <MyCourses onCourseSelect={handleCourseSelect} />
          </TabsContent>

          <TabsContent value="progress">
            <CourseProgress />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}