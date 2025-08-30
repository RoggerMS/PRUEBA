'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Clock, Target, Users, Calendar, CheckCircle } from 'lucide-react';

interface Challenge {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'Fácil' | 'Medio' | 'Difícil';
  points: number;
  progress: number;
  maxProgress: number;
  status: 'active' | 'completed' | 'failed';
  deadline: string;
  participants: number;
  type: 'individual' | 'team';
}

interface MyChallengesProps {
  challenges?: Challenge[];
}

export default function MyChallenges({ challenges = [] }: MyChallengesProps) {
  const [activeTab, setActiveTab] = useState('active');

  const mockChallenges: Challenge[] = challenges.length > 0 ? challenges : [
    {
      id: '1',
      title: 'Completar 10 Ejercicios de Matemáticas',
      description: 'Resuelve 10 ejercicios de cálculo diferencial antes del viernes',
      category: 'Académico',
      difficulty: 'Medio',
      points: 150,
      progress: 7,
      maxProgress: 10,
      status: 'active',
      deadline: '2024-01-15',
      participants: 1,
      type: 'individual'
    },
    {
      id: '2',
      title: 'Proyecto Grupal de Programación',
      description: 'Desarrollar una aplicación web en equipo usando React y Node.js',
      category: 'Programación',
      difficulty: 'Difícil',
      points: 300,
      progress: 100,
      maxProgress: 100,
      status: 'completed',
      deadline: '2024-01-10',
      participants: 4,
      type: 'team'
    },
    {
      id: '3',
      title: 'Leer 3 Artículos Científicos',
      description: 'Lee y resume 3 artículos sobre inteligencia artificial',
      category: 'Investigación',
      difficulty: 'Fácil',
      points: 100,
      progress: 1,
      maxProgress: 3,
      status: 'active',
      deadline: '2024-01-20',
      participants: 1,
      type: 'individual'
    }
  ];

  const activeChallenges = mockChallenges.filter(c => c.status === 'active');
  const completedChallenges = mockChallenges.filter(c => c.status === 'completed');
  const failedChallenges = mockChallenges.filter(c => c.status === 'failed');

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Fácil': return 'bg-green-100 text-green-800';
      case 'Medio': return 'bg-yellow-100 text-yellow-800';
      case 'Difícil': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderChallengeCard = (challenge: Challenge) => (
    <Card key={challenge.id} className="mb-4">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{challenge.title}</CardTitle>
            <CardDescription className="mt-1">{challenge.description}</CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge className={getDifficultyColor(challenge.difficulty)}>
              {challenge.difficulty}
            </Badge>
            <Badge className={getStatusColor(challenge.status)}>
              {challenge.status === 'active' ? 'Activo' : 
               challenge.status === 'completed' ? 'Completado' : 'Fallido'}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {challenge.status === 'active' && (
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progreso: {challenge.progress}/{challenge.maxProgress}</span>
                <span>{Math.round((challenge.progress / challenge.maxProgress) * 100)}%</span>
              </div>
              <Progress value={(challenge.progress / challenge.maxProgress) * 100} className="h-2" />
            </div>
          )}
          
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Trophy className="h-4 w-4" />
                <span>{challenge.points} pts</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{new Date(challenge.deadline).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{challenge.type === 'individual' ? 'Individual' : `Equipo (${challenge.participants})`}</span>
              </div>
            </div>
            
            {challenge.status === 'active' && (
              <Button size="sm" variant="outline">
                Ver Detalles
              </Button>
            )}
            
            {challenge.status === 'completed' && (
              <div className="flex items-center gap-1 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span>Completado</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Mis Desafíos</h2>
        <p className="text-gray-600">Gestiona y sigue el progreso de tus desafíos activos</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Activos ({activeChallenges.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Completados ({completedChallenges.length})
          </TabsTrigger>
          <TabsTrigger value="failed" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Fallidos ({failedChallenges.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-6">
          {activeChallenges.length > 0 ? (
            <div>
              {activeChallenges.map(renderChallengeCard)}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Target className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No tienes desafíos activos</h3>
                <p className="text-gray-500 text-center mb-4">Explora nuevos desafíos para comenzar a ganar puntos y badges</p>
                <Button>Explorar Desafíos</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          {completedChallenges.length > 0 ? (
            <div>
              {completedChallenges.map(renderChallengeCard)}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No has completado desafíos aún</h3>
                <p className="text-gray-500 text-center">Completa tus primeros desafíos para verlos aquí</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="failed" className="mt-6">
          {failedChallenges.length > 0 ? (
            <div>
              {failedChallenges.map(renderChallengeCard)}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Clock className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No tienes desafíos fallidos</h3>
                <p className="text-gray-500 text-center">¡Excelente! Mantén el buen trabajo</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}