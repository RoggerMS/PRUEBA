'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Clock, 
  Users, 
  Star, 
  BookOpen, 
  Play, 
  Trophy,
  Heart,
  Share2,
  MoreVertical,
  CheckCircle
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

interface CourseCardProps {
  course: Course;
  onClick?: () => void;
  onEnroll?: (courseId: string) => void;
  onFavorite?: (courseId: string) => void;
  onShare?: (courseId: string) => void;
  variant?: 'default' | 'compact' | 'detailed';
  showProgress?: boolean;
}

export function CourseCard({ 
  course, 
  onClick, 
  onEnroll, 
  onFavorite, 
  onShare,
  variant = 'default',
  showProgress = true
}: CourseCardProps) {
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
      'Arte': 'bg-indigo-100 text-indigo-800',
      'Historia': 'bg-yellow-100 text-yellow-800',
      'Filosofía': 'bg-gray-100 text-gray-800'
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

  if (variant === 'compact') {
    return (
      <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group" onClick={onClick}>
        <div className="flex gap-4 p-4">
          {course.thumbnail && (
            <div className="relative w-20 h-20 flex-shrink-0">
              <img 
                src={course.thumbnail} 
                alt={course.title}
                className="w-full h-full object-cover rounded-lg"
              />
              {course.enrolled && (
                <div className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full p-1">
                  <CheckCircle className="h-3 w-3" />
                </div>
              )}
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-blue-600 transition-colors">
                {course.title}
              </h3>
              <Badge className={getLevelColor(course.level)} variant="secondary">
                {course.level}
              </Badge>
            </div>
            
            <p className="text-xs text-gray-600 mb-2">{course.instructor}</p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{course.duration}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  <span>{course.students}</span>
                </div>
              </div>
              
              <div className="text-sm font-semibold text-blue-600">
                {formatPrice(course.price)}
              </div>
            </div>
            
            {course.enrolled && showProgress && (
              <div className="mt-2">
                <Progress value={course.progress} className="h-1" />
                <p className="text-xs text-gray-500 mt-1">{course.progress}% completado</p>
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group overflow-hidden" onClick={onClick}>
      {/* Thumbnail */}
      <div className="relative">
        {course.thumbnail ? (
          <img 
            src={course.thumbnail} 
            alt={course.title}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
          />
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
            <BookOpen className="h-12 w-12 text-gray-400" />
          </div>
        )}
        
        {/* Overlays */}
        <div className="absolute top-3 left-3 flex gap-2">
          {course.featured && (
            <Badge className="bg-yellow-500 text-white">
              <Trophy className="h-3 w-3 mr-1" />
              Destacado
            </Badge>
          )}
          {course.enrolled && (
            <Badge className="bg-green-500 text-white">
              <CheckCircle className="h-3 w-3 mr-1" />
              Inscrito
            </Badge>
          )}
        </div>
        
        <div className="absolute top-3 right-3 flex gap-1">
          <Button
            size="sm"
            variant="secondary"
            className="h-8 w-8 p-0 bg-white/80 hover:bg-white"
            onClick={(e) => {
              e.stopPropagation();
              onFavorite?.(course.id);
            }}
          >
            <Heart className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="h-8 w-8 p-0 bg-white/80 hover:bg-white"
            onClick={(e) => {
              e.stopPropagation();
              onShare?.(course.id);
            }}
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Play button overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="bg-white/90 rounded-full p-3">
              <Play className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        {/* Duration badge */}
        <div className="absolute bottom-3 right-3">
          <Badge variant="secondary" className="bg-black/70 text-white">
            <Clock className="h-3 w-3 mr-1" />
            {course.duration}
          </Badge>
        </div>
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg line-clamp-2 group-hover:text-blue-600 transition-colors">
              {course.title}
            </CardTitle>
            <CardDescription className="line-clamp-2 mt-1">
              {course.description}
            </CardDescription>
          </div>
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

      <CardContent className="pt-0">
        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          <Badge className={getCategoryColor(course.category)} variant="secondary">
            {course.category}
          </Badge>
          <Badge className={getLevelColor(course.level)} variant="outline">
            {course.level}
          </Badge>
        </div>
        
        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              <span>{course.lessons} lecciones</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{course.students.toLocaleString()}</span>
            </div>
          </div>
        </div>
        
        {/* Rating */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {renderStars(course.rating)}
            </div>
            <span className="text-sm font-medium">{course.rating}</span>
            <span className="text-sm text-gray-500">({course.reviews})</span>
          </div>
          
          <div className="text-lg font-bold text-blue-600">
            {formatPrice(course.price)}
          </div>
        </div>
        
        {/* Progress (if enrolled) */}
        {course.enrolled && showProgress && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-600">Progreso</span>
              <span className="font-medium">{course.progress}%</span>
            </div>
            <Progress value={course.progress} className="h-2" />
          </div>
        )}
        
        {/* Action Button */}
        <Button 
          className="w-full" 
          variant={course.enrolled ? "outline" : "default"}
          onClick={(e) => {
            e.stopPropagation();
            if (course.enrolled) {
              onClick?.();
            } else {
              onEnroll?.(course.id);
            }
          }}
        >
          {course.enrolled ? (
            <>
              <Play className="h-4 w-4 mr-2" />
              Continuar
            </>
          ) : (
            <>
              <BookOpen className="h-4 w-4 mr-2" />
              Inscribirse
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}