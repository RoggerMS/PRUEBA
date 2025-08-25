'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Badge } from '@/src/components/ui/badge';
import { Progress } from '@/src/components/ui/progress';
import { 
  Coins, 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Gift, 
  Trophy,
  Target,
  TrendingUp,
  Wallet,
  Star
} from 'lucide-react';

interface Transaction {
  id: string;
  type: 'earn' | 'spend' | 'bonus';
  amount: number;
  description: string;
  date: Date;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  reward: number;
  completed: boolean;
  progress: number;
  maxProgress: number;
}

export function CrolarsWallet() {
  const [balance] = useState(1250); // Balance actual del usuario
  const [weeklyEarned] = useState(320);
  const [weeklyGoal] = useState(500);
  const [totalEarned] = useState(5680);
  const [level] = useState(8);
  const [nextLevelPoints] = useState(2000);
  const [currentLevelPoints] = useState(1250);

  // Transacciones recientes
  const recentTransactions: Transaction[] = [
    {
      id: '1',
      type: 'earn',
      amount: 150,
      description: 'Venta: Resumen de Cálculo',
      date: new Date('2024-01-15T10:30:00')
    },
    {
      id: '2',
      type: 'spend',
      amount: -200,
      description: 'Compra: Plantillas PowerPoint',
      date: new Date('2024-01-14T15:45:00')
    },
    {
      id: '3',
      type: 'bonus',
      amount: 50,
      description: 'Bonus diario completado',
      date: new Date('2024-01-14T09:00:00')
    },
    {
      id: '4',
      type: 'earn',
      amount: 100,
      description: 'Respuesta aceptada en foro',
      date: new Date('2024-01-13T16:20:00')
    }
  ];

  // Logros disponibles
  const achievements: Achievement[] = [
    {
      id: '1',
      name: 'Vendedor Novato',
      description: 'Realiza tu primera venta',
      reward: 100,
      completed: true,
      progress: 1,
      maxProgress: 1
    },
    {
      id: '2',
      name: 'Comerciante Activo',
      description: 'Realiza 10 ventas',
      reward: 250,
      completed: false,
      progress: 7,
      maxProgress: 10
    },
    {
      id: '3',
      name: 'Experto del Foro',
      description: 'Obtén 50 respuestas aceptadas',
      reward: 500,
      completed: false,
      progress: 23,
      maxProgress: 50
    }
  ];

  const weeklyProgress = (weeklyEarned / weeklyGoal) * 100;
  const levelProgress = ((currentLevelPoints % 250) / 250) * 100;

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'earn':
        return <ArrowUpRight className="w-4 h-4 text-green-600" />;
      case 'spend':
        return <ArrowDownLeft className="w-4 h-4 text-red-600" />;
      case 'bonus':
        return <Gift className="w-4 h-4 text-purple-600" />;
      default:
        return <Coins className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'earn':
        return 'text-green-600';
      case 'spend':
        return 'text-red-600';
      case 'bonus':
        return 'text-purple-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Balance Principal */}
      <Card className="bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 text-white border-0 shadow-xl">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-white">
            <Wallet className="w-6 h-6" />
            Mi Billetera
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Coins className="w-8 h-8" />
              <span className="text-4xl font-bold">{balance.toLocaleString()}</span>
            </div>
            <p className="text-yellow-100">Crolars disponibles</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{totalEarned.toLocaleString()}</p>
              <p className="text-yellow-100 text-sm">Total ganado</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">Nivel {level}</p>
              <p className="text-yellow-100 text-sm">Rango actual</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-yellow-100">Progreso al siguiente nivel</span>
              <span>{Math.floor(levelProgress)}%</span>
            </div>
            <Progress value={levelProgress} className="bg-yellow-600" />
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas Semanales */}
      <Card className="bg-white/70 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-600" />
            Meta Semanal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <TrendingUp className="w-6 h-6 text-purple-600" />
              <span className="text-3xl font-bold text-gray-900">{weeklyEarned}</span>
              <span className="text-gray-500">/ {weeklyGoal}</span>
            </div>
            <p className="text-gray-600">Crolars esta semana</p>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Progreso semanal</span>
              <span className="font-medium">{Math.floor(weeklyProgress)}%</span>
            </div>
            <Progress value={weeklyProgress} className="bg-gray-200" />
          </div>

          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-lg font-bold text-green-600">+{weeklyEarned}</p>
              <p className="text-xs text-gray-500">Ganados</p>
            </div>
            <div>
              <p className="text-lg font-bold text-purple-600">{weeklyGoal - weeklyEarned}</p>
              <p className="text-xs text-gray-500">Restantes</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Acciones Rápidas */}
      <Card className="bg-white/70 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-blue-600" />
            Acciones Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Vender Contenido
            </Button>
            
            <Button variant="outline" className="w-full border-blue-300 text-blue-600 hover:bg-blue-50">
              <Gift className="w-4 h-4 mr-2" />
              Tareas Diarias
            </Button>
            
            <Button variant="outline" className="w-full border-green-300 text-green-600 hover:bg-green-50">
              <Trophy className="w-4 h-4 mr-2" />
              Ver Logros
            </Button>
          </div>

          {/* Logros Recientes */}
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Logros Disponibles</h4>
            <div className="space-y-2">
              {achievements.slice(0, 2).map(achievement => (
                <div key={achievement.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    {achievement.completed ? (
                      <Trophy className="w-4 h-4 text-yellow-500" />
                    ) : (
                      <Star className="w-4 h-4 text-gray-400" />
                    )}
                    <span className="text-sm font-medium text-gray-900">
                      {achievement.name}
                    </span>
                    <Badge className="ml-auto bg-yellow-100 text-yellow-800 text-xs">
                      +{achievement.reward}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{achievement.description}</p>
                  {!achievement.completed && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">
                          {achievement.progress}/{achievement.maxProgress}
                        </span>
                        <span className="text-gray-500">
                          {Math.floor((achievement.progress / achievement.maxProgress) * 100)}%
                        </span>
                      </div>
                      <Progress 
                        value={(achievement.progress / achievement.maxProgress) * 100} 
                        className="h-1 bg-gray-200"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transacciones Recientes */}
      <Card className="bg-white/70 backdrop-blur-sm lg:col-span-3">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowUpRight className="w-5 h-5 text-gray-600" />
            Transacciones Recientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentTransactions.map(transaction => (
              <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-full">
                    {getTransactionIcon(transaction.type)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {transaction.description}
                    </p>
                    <p className="text-xs text-gray-500">
                      {transaction.date.toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-bold ${getTransactionColor(transaction.type)}`}>
                    {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                  </p>
                  <p className="text-xs text-gray-500">Crolars</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 text-center">
            <Button variant="outline" className="text-gray-600">
              Ver Todas las Transacciones
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}