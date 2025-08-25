"use client";

import { useState } from "react";
import { Play, Clock, Users, Star, BookOpen, Heart, ShoppingCart } from "lucide-react";
import { Card, CardContent } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Progress } from "@/src/components/ui/progress";

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

interface CourseCardProps {
  course: Course;
  onClick?: () => void;
}

export function CourseCard({ course, onClick }: CourseCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  const handleEnroll = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEnrolling(true);
    // Simulate enrollment process
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsEnrolling(false);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Principiante":
        return "bg-green-100 text-green-800";
      case "Intermedio":
        return "bg-yellow-100 text-yellow-800";
      case "Avanzado":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Matemáticas":
        return "bg-blue-100 text-blue-800";
      case "Ciencias":
        return "bg-purple-100 text-purple-800";
      case "Programación":
        return "bg-green-100 text-green-800";
      case "Idiomas":
        return "bg-orange-100 text-orange-800";
      case "Arte":
        return "bg-pink-100 text-pink-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card 
      className={`group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
        course.featured ? 'ring-2 ring-purple-200' : ''
      }`}
      onClick={onClick}
    >
      <CardContent className="p-0">
        {/* Thumbnail */}
        <div className="relative overflow-hidden rounded-t-lg">
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Featured Badge */}
          {course.featured && (
            <div className="absolute top-3 left-3">
              <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                Destacado
              </Badge>
            </div>
          )}
          
          {/* Like Button */}
          <button
            onClick={handleLike}
            className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
          >
            <Heart 
              className={`h-4 w-4 transition-colors ${
                isLiked ? 'fill-red-500 text-red-500' : 'text-gray-600'
              }`} 
            />
          </button>
          
          {/* Play Button Overlay */}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="p-3 bg-white/90 backdrop-blur-sm rounded-full">
              <Play className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          
          {/* Progress Bar (if enrolled) */}
          {course.enrolled && course.progress > 0 && (
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <div className="bg-white/90 backdrop-blur-sm rounded-lg p-2">
                <div className="flex items-center justify-between text-xs text-gray-700 mb-1">
                  <span>Progreso</span>
                  <span>{course.progress}%</span>
                </div>
                <Progress value={course.progress} className="h-2" />
              </div>
            </div>
          )}
        </div>
        
        {/* Content */}
        <div className="p-4">
          {/* Badges */}
          <div className="flex items-center gap-2 mb-3">
            <Badge className={getLevelColor(course.level)}>
              {course.level}
            </Badge>
            <Badge className={getCategoryColor(course.category)}>
              {course.category}
            </Badge>
          </div>
          
          {/* Title */}
          <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors">
            {course.title}
          </h3>
          
          {/* Description */}
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {course.description}
          </p>
          
          {/* Instructor */}
          <div className="flex items-center gap-2 mb-3">
            <img
              src={course.instructorAvatar}
              alt={course.instructor}
              className="w-6 h-6 rounded-full object-cover"
            />
            <span className="text-sm text-gray-700">{course.instructor}</span>
          </div>
          
          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
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
              <span>{course.students.toLocaleString()}</span>
            </div>
          </div>
          
          {/* Rating */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium text-gray-900">{course.rating}</span>
            </div>
            <span className="text-sm text-gray-600">({course.reviews} reseñas)</span>
          </div>
          
          {/* Tags */}
          <div className="flex flex-wrap gap-1 mb-4">
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
          
          {/* Price and Action */}
          <div className="flex items-center justify-between">
            <div>
              {course.enrolled ? (
                <span className="text-green-600 font-medium">Inscrito</span>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-purple-600">
                    {course.price} Crolars
                  </span>
                </div>
              )}
            </div>
            
            {course.enrolled ? (
              <Button size="sm" className="bg-gradient-to-r from-purple-600 to-blue-600">
                Continuar
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={handleEnroll}
                disabled={isEnrolling}
                className="bg-gradient-to-r from-purple-600 to-blue-600"
              >
                {isEnrolling ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Inscribiendo...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4" />
                    Inscribirse
                  </div>
                )}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}