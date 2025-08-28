'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Target, 
  Trophy, 
  Calendar, 
  Flame, 
  Star, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  Gift,
  Zap,
  Award,
  ChevronRight
} from 'lucide-react';

interface WeeklyTask {
  id: string;
  title: string;
  description: string;
  reward: number;
  completed: boolean;
  progress: number;
  maxProgress: number;
  category: 'daily' | 'weekly' | 'bonus';
  difficulty: 'easy' | 'medium' | 'hard';
}

interface WeeklyGoalData {
  currentWeek: number;
  totalGoal: number;
  currentProgress: number;
  streak: number;
  tasksCompleted: number;
  totalTasks: number;
  bonusMultiplier: number;
  timeRemaining: string;
}

const WeeklyGoal: React.FC = () => {
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  
  const goalData: WeeklyGoalData = {
    currentWeek: 3,
    totalGoal: 1500,
    currentProgress: 1250,
    streak: 12,
    tasksCompleted: 8,
    totalTasks: 12,
    bonusMultiplier: 1.5,
    timeRemaining: '2d 14h 32m'
  };

  const weeklyTasks: WeeklyTask[] = [
    {
      id: '1',
      title: 'Completar 5 desafíos diarios',
      description: 'Participa en desafíos diarios consecutivos',
      reward: 200,
      completed: true,
      progress: 5,
      maxProgress: 5,
      category: 'daily',
      difficulty: 'easy'
    },
    {
      id: '2',
      title: 'Ganar 3 competencias',
      description: 'Obtén el primer lugar en competencias',
      reward: 300,
      completed: true,
      progress: 3,
      maxProgress: 3,
      category: 'weekly',
      difficulty: 'hard'
    },
    {
      id: '3',
      title: 'Mantener racha de 7 días',
      description: 'Mantén tu racha de actividad diaria',
      reward: 250,
      completed: true,
      progress: 7,
      maxProgress: 7,
      category: 'daily',
      difficulty: 'medium'
    },
    {
      id: '4',
      title: 'Comprar 2 items del marketplace',
      description: 'Realiza compras en el marketplace',
      reward: 150,
      completed: false,
      progress: 1,
      maxProgress: 2,
      category: 'weekly',
      difficulty: 'easy'
    },
    {
      id: '5',
      title: 'Participar en evento especial',
      description: 'Únete al evento comunitario de esta semana',
      reward: 400,
      completed: false,
      progress: 0,
      maxProgress: 1,
      category: 'bonus',
      difficulty: 'hard'
    },
    {
      id: '6',
      title: 'Invitar 3 amigos',
      description: 'Invita amigos a unirse a la plataforma',
      reward: 500,
      completed: false,
      progress: 1,
      maxProgress: 3,
      category: 'bonus',
      difficulty: 'medium'
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'hard':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'daily':
        return <Calendar className="w-4 h-4" />;
      case 'weekly':
        return <Target className="w-4 h-4" />;
      case 'bonus':
        return <Gift className="w-4 h-4" />;
      default:
        return <Star className="w-4 h-4" />;
    }
  };

  const progressPercentage = (goalData.currentProgress / goalData.totalGoal) * 100;
  const tasksPercentage = (goalData.tasksCompleted / goalData.totalTasks) * 100;

  return (
    <div className="space-y-6">
      {/* Header de Meta Semanal */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-500 rounded-full">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl text-gray-800">Meta Semanal</CardTitle>
                <CardDescription>Semana {goalData.currentWeek} - Tiempo restante: {goalData.timeRemaining}</CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-orange-100 text-orange-700 border-orange-200">
                <Flame className="w-3 h-3 mr-1" />
                Racha: {goalData.streak} días
              </Badge>
              <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                <Zap className="w-3 h-3 mr-1" />
                Bonus x{goalData.bonusMultiplier}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Progreso Principal */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <span>Progreso de Crolars</span>
            </CardTitle>
            <CardDescription>Meta: {goalData.totalGoal.toLocaleString()} Crolars</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">
                  {goalData.currentProgress.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">de {goalData.totalGoal.toLocaleString()} Crolars</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progreso</span>
                  <span>{Math.round(progressPercentage)}%</span>
                </div>
                <Progress value={progressPercentage} className="h-3" />
                <p className="text-xs text-gray-500 text-center">
                  {goalData.totalGoal - goalData.currentProgress} Crolars restantes
                </p>
              </div>

              {progressPercentage >= 100 ? (
                <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                  <CheckCircle className="w-6 h-6 text-green-500 mx-auto mb-2" />
                  <p className="text-sm font-medium text-green-700">¡Meta completada!</p>
                  <p className="text-xs text-green-600">Bonus de 500 Crolars desbloqueado</p>
                </div>
              ) : (
                <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <TrendingUp className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                  <p className="text-sm font-medium text-blue-700">
                    {Math.round((goalData.totalGoal - goalData.currentProgress) / 7)} Crolars/día promedio
                  </p>
                  <p className="text-xs text-blue-600">para completar la meta</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Tareas Completadas</span>
            </CardTitle>
            <CardDescription>{goalData.tasksCompleted} de {goalData.totalTasks} tareas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">
                  {goalData.tasksCompleted}/{goalData.totalTasks}
                </p>
                <p className="text-sm text-gray-500">Tareas completadas</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progreso</span>
                  <span>{Math.round(tasksPercentage)}%</span>
                </div>
                <Progress value={tasksPercentage} className="h-3" />
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 bg-green-50 rounded-lg">
                  <p className="text-lg font-bold text-green-600">{weeklyTasks.filter(t => t.completed && t.category === 'daily').length}</p>
                  <p className="text-xs text-gray-600">Diarias</p>
                </div>
                <div className="p-2 bg-blue-50 rounded-lg">
                  <p className="text-lg font-bold text-blue-600">{weeklyTasks.filter(t => t.completed && t.category === 'weekly').length}</p>
                  <p className="text-xs text-gray-600">Semanales</p>
                </div>
                <div className="p-2 bg-purple-50 rounded-lg">
                  <p className="text-lg font-bold text-purple-600">{weeklyTasks.filter(t => t.completed && t.category === 'bonus').length}</p>
                  <p className="text-xs text-gray-600">Bonus</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Tareas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2">
            <Award className="w-5 h-5 text-purple-500" />
            <span>Tareas de la Semana</span>
          </CardTitle>
          <CardDescription>Completa estas tareas para alcanzar tu meta semanal</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {weeklyTasks.map((task) => (
              <div 
                key={task.id} 
                className={`p-4 rounded-lg border transition-all duration-200 cursor-pointer ${
                  task.completed 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-sm'
                } ${
                  selectedTask === task.id ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
                }`}
                onClick={() => setSelectedTask(selectedTask === task.id ? null : task.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${
                      task.completed ? 'bg-green-500' : 'bg-gray-300'
                    }`}>
                      {task.completed ? (
                        <CheckCircle className="w-4 h-4 text-white" />
                      ) : (
                        getCategoryIcon(task.category)
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className={`font-medium ${
                          task.completed ? 'text-green-700 line-through' : 'text-gray-800'
                        }`}>
                          {task.title}
                        </h4>
                        <Badge className={getDifficultyColor(task.difficulty)} variant="outline">
                          {task.difficulty}
                        </Badge>
                        <Badge variant="secondary" className="text-xs capitalize">
                          {task.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{task.description}</p>
                      
                      {!task.completed && (
                        <div className="mt-2">
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Progreso</span>
                            <span>{task.progress}/{task.maxProgress}</span>
                          </div>
                          <Progress 
                            value={(task.progress / task.maxProgress) * 100} 
                            className="h-1" 
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <p className="font-semibold text-yellow-600">+{task.reward}</p>
                      <p className="text-xs text-gray-500">Crolars</p>
                    </div>
                    <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${
                      selectedTask === task.id ? 'rotate-90' : ''
                    }`} />
                  </div>
                </div>
                
                {selectedTask === task.id && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        <p><strong>Recompensa:</strong> {task.reward} Crolars</p>
                        <p><strong>Dificultad:</strong> {task.difficulty}</p>
                        <p><strong>Categoría:</strong> {task.category}</p>
                      </div>
                      {!task.completed && (
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                          <Target className="w-4 h-4 mr-1" />
                          Ir a tarea
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WeeklyGoal;