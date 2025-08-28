"use client";

import { useState } from "react";
import { Trophy, Target, Clock, BookOpen, Star, TrendingUp, Calendar, Award, CheckCircle, Play } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ProgressStats {
  totalCourses: number;
  completedCourses: number;
  inProgressCourses: number;
  totalLessons: number;
  completedLessons: number;
  totalStudyTime: string;
  weeklyGoal: number;
  weeklyProgress: number;
  streak: number;
  certificates: number;
  averageRating: number;
  level: number;
  experiencePoints: number;
  nextLevelXP: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedDate?: string;
  progress?: number;
  maxProgress?: number;
}

interface WeeklyActivity {
  day: string;
  minutes: number;
  lessons: number;
}

interface CourseProgressSummary {
  id: string;
  title: string;
  thumbnail: string;
  progress: number;
  completedLessons: number;
  totalLessons: number;
  lastAccessed: string;
  timeSpent: string;
  category: string;
}

// Mock data
const mockProgressStats: ProgressStats = {
  totalCourses: 4,
  completedCourses: 1,
  inProgressCourses: 3,
  totalLessons: 149,
  completedLessons: 90,
  totalStudyTime: "45h 30m",
  weeklyGoal: 10, // hours
  weeklyProgress: 7.5, // hours
  streak: 12, // days
  certificates: 1,
  averageRating: 4.8,
  level: 8,
  experiencePoints: 2450,
  nextLevelXP: 3000
};

const mockAchievements: Achievement[] = [
  {
    id: "1",
    title: "Futuro Educador",
    description: "Completa tu primer curso pedagógico",
    icon: "🎓",
    earned: true,
    earnedDate: "2024-01-20"
  },
  {
    id: "2",
    title: "Disciplina Cantutina",
    description: "Estudia 7 días consecutivos",
    icon: "🔥",
    earned: true,
    earnedDate: "2024-01-18"
  },
  {
    id: "3",
    title: "Madrugador de Chosica",
    description: "Estudia antes de las 8 AM como buen cantutino",
    icon: "🌅",
    earned: true,
    earnedDate: "2024-01-15"
  },
  {
    id: "4",
    title: "Pedagogo Veloz",
    description: "Completa 10 lecciones pedagógicas en un día",
    icon: "⚡",
    earned: false,
    progress: 7,
    maxProgress: 10
  },
  {
    id: "5",
    title: "Explorador de Facultades",
    description: "Estudia materias de 5 facultades diferentes",
    icon: "🗺️",
    earned: false,
    progress: 4,
    maxProgress: 5
  },
  {
    id: "6",
    title: "Maestro de La Cantuta",
    description: "Obtén calificación perfecta en 5 evaluaciones",
    icon: "👑",
    earned: false,
    progress: 2,
    maxProgress: 5
  }
];

const mockWeeklyActivity: WeeklyActivity[] = [
  { day: "Lun", minutes: 90, lessons: 3 },
  { day: "Mar", minutes: 120, lessons: 4 },
  { day: "Mié", minutes: 75, lessons: 2 },
  { day: "Jue", minutes: 105, lessons: 3 },
  { day: "Vie", minutes: 60, lessons: 2 },
  { day: "Sáb", minutes: 45, lessons: 1 },
  { day: "Dom", minutes: 30, lessons: 1 }
];

const mockCourseProgress: CourseProgressSummary[] = [
  {
    id: "1",
    title: "Didáctica de las Matemáticas",
    thumbnail: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=mathematics%20teaching%20classroom%20blackboard%20students%20education&image_size=square",
    progress: 75,
    completedLessons: 34,
    totalLessons: 45,
    lastAccessed: "2024-01-25",
    timeSpent: "18h 45m",
    category: "Pedagogía"
  },
  {
    id: "2",
    title: "Psicología Educativa",
    thumbnail: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=educational%20psychology%20children%20learning%20classroom%20development&image_size=square",
    progress: 100,
    completedLessons: 28,
    totalLessons: 28,
    lastAccessed: "2024-01-24",
    timeSpent: "12h 30m",
    category: "Psicología"
  },
  {
    id: "3",
    title: "Metodología de la Investigación Educativa",
    thumbnail: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=educational%20research%20methodology%20books%20data%20analysis&image_size=square",
    progress: 45,
    completedLessons: 23,
    totalLessons: 52,
    lastAccessed: "2024-01-23",
    timeSpent: "10h 15m",
    category: "Investigación"
  },
  {
    id: "4",
    title: "Historia de la Educación Peruana",
    thumbnail: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=peruvian%20education%20history%20school%20traditional%20classroom&image_size=square",
    progress: 20,
    completedLessons: 5,
    totalLessons: 24,
    lastAccessed: "2024-01-22",
    timeSpent: "4h 00m",
    category: "Historia Educativa"
  }
];

export function CourseProgress() {
  const [selectedPeriod, setSelectedPeriod] = useState("week");

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "text-green-600";
    if (progress >= 50) return "text-blue-600";
    if (progress >= 20) return "text-yellow-600";
    return "text-gray-600";
  };

  const totalWeeklyMinutes = mockWeeklyActivity.reduce((sum, day) => sum + day.minutes, 0);
  const weeklyGoalMinutes = mockProgressStats.weeklyGoal * 60;
  const weeklyProgressPercentage = (totalWeeklyMinutes / weeklyGoalMinutes) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Mi Progreso</h2>
          <p className="text-gray-600">Seguimiento detallado de tu aprendizaje</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-purple-100 text-purple-800 flex items-center gap-1">
            <Trophy className="h-3 w-3" />
            Nivel {mockProgressStats.level}
          </Badge>
          <Badge className="bg-orange-100 text-orange-800 flex items-center gap-1">
            <Target className="h-3 w-3" />
            {mockProgressStats.experiencePoints} XP
          </Badge>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cursos Completados</p>
                <p className="text-2xl font-bold text-green-600">
                  {mockProgressStats.completedCourses}/{mockProgressStats.totalCourses}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Lecciones Completadas</p>
                <p className="text-2xl font-bold text-blue-600">
                  {mockProgressStats.completedLessons}/{mockProgressStats.totalLessons}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tiempo Total</p>
                <p className="text-2xl font-bold text-purple-600">
                  {mockProgressStats.totalStudyTime}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Racha Actual</p>
                <p className="text-2xl font-bold text-orange-600">
                  {mockProgressStats.streak} días
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Level Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-purple-600" />
            Progreso de Nivel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Nivel {mockProgressStats.level}</span>
              <span className="text-sm font-medium text-gray-600">Nivel {mockProgressStats.level + 1}</span>
            </div>
            <Progress 
              value={(mockProgressStats.experiencePoints / mockProgressStats.nextLevelXP) * 100} 
              className="h-3"
            />
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>{mockProgressStats.experiencePoints} XP</span>
              <span>{mockProgressStats.nextLevelXP - mockProgressStats.experiencePoints} XP para el siguiente nivel</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Goal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              Meta Semanal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Progreso esta semana</span>
                <span className="text-sm font-medium text-blue-600">
                  {Math.round(totalWeeklyMinutes / 60 * 10) / 10}h / {mockProgressStats.weeklyGoal}h
                </span>
              </div>
              <Progress value={weeklyProgressPercentage} className="h-3" />
              <div className="grid grid-cols-7 gap-1">
                {mockWeeklyActivity.map((day, index) => (
                  <div key={index} className="text-center">
                    <div className="text-xs text-gray-600 mb-1">{day.day}</div>
                    <div 
                      className="h-8 bg-blue-100 rounded flex items-end justify-center relative"
                      style={{ 
                        background: day.minutes > 0 
                          ? `linear-gradient(to top, rgb(59 130 246) ${(day.minutes / 120) * 100}%, rgb(219 234 254) ${(day.minutes / 120) * 100}%)`
                          : 'rgb(243 244 246)'
                      }}
                    >
                      <span className="text-xs text-white font-medium mb-1">
                        {day.minutes > 0 ? Math.round(day.minutes / 60 * 10) / 10 : ''}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-600" />
              Logros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {mockAchievements.map((achievement) => (
                <div 
                  key={achievement.id} 
                  className={`flex items-center gap-3 p-3 rounded-lg border ${
                    achievement.earned 
                      ? 'bg-yellow-50 border-yellow-200' 
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="text-2xl">{achievement.icon}</div>
                  <div className="flex-1">
                    <h4 className={`font-medium ${
                      achievement.earned ? 'text-gray-900' : 'text-gray-600'
                    }`}>
                      {achievement.title}
                    </h4>
                    <p className="text-sm text-gray-600">{achievement.description}</p>
                    {!achievement.earned && achievement.progress && achievement.maxProgress && (
                      <div className="mt-2">
                        <Progress 
                          value={(achievement.progress / achievement.maxProgress) * 100} 
                          className="h-1"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          {achievement.progress}/{achievement.maxProgress}
                        </p>
                      </div>
                    )}
                    {achievement.earned && achievement.earnedDate && (
                      <p className="text-xs text-yellow-600 mt-1">
                        Obtenido el {formatDate(achievement.earnedDate)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Course Progress Details */}
      <Card>
        <CardHeader>
          <CardTitle>Progreso por Curso</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockCourseProgress.map((course) => (
              <div key={course.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-1">{course.title}</h4>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                    <Badge variant="outline" className="text-xs">{course.category}</Badge>
                    <span>Último acceso: {formatDate(course.lastAccessed)}</span>
                    <span>Tiempo: {course.timeSpent}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Progreso</span>
                        <span className={`font-medium ${getProgressColor(course.progress)}`}>
                          {course.progress}%
                        </span>
                      </div>
                      <Progress value={course.progress} className="h-2" />
                    </div>
                    <div className="text-sm text-gray-600">
                      {course.completedLessons}/{course.totalLessons} lecciones
                    </div>
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  <Play className="h-4 w-4 mr-2" />
                  Continuar
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
