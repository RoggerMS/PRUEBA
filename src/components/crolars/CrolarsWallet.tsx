'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Eye, 
  EyeOff,
  Plus,
  Minus,
  History,
  Gift,
  Award,
  Target
} from 'lucide-react';

interface Transaction {
  id: string;
  type: 'earned' | 'spent' | 'bonus' | 'penalty';
  amount: number;
  description: string;
  date: string;
  category: string;
}

interface WalletStats {
  totalEarned: number;
  totalSpent: number;
  thisWeek: number;
  thisMonth: number;
  streak: number;
}

const CrolarsWallet: React.FC = () => {
  const [showBalance, setShowBalance] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  const currentBalance = 2450;
  const walletStats: WalletStats = {
    totalEarned: 5680,
    totalSpent: 3230,
    thisWeek: 320,
    thisMonth: 1250,
    streak: 12
  };

  const recentTransactions: Transaction[] = [
    {
      id: '1',
      type: 'earned',
      amount: 150,
      description: 'Completar desafío semanal',
      date: '2024-01-15',
      category: 'Desafío'
    },
    {
      id: '2',
      type: 'spent',
      amount: -50,
      description: 'Compra en Marketplace - Avatar Premium',
      date: '2024-01-14',
      category: 'Marketplace'
    },
    {
      id: '3',
      type: 'bonus',
      amount: 200,
      description: 'Bonus por racha de 10 días',
      date: '2024-01-13',
      category: 'Bonus'
    },
    {
      id: '4',
      type: 'earned',
      amount: 75,
      description: 'Participación en evento comunitario',
      date: '2024-01-12',
      category: 'Evento'
    },
    {
      id: '5',
      type: 'spent',
      amount: -120,
      description: 'Upgrade de herramientas',
      date: '2024-01-11',
      category: 'Herramientas'
    }
  ];

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'earned':
        return <ArrowUpRight className="w-4 h-4 text-green-500" />;
      case 'spent':
        return <ArrowDownLeft className="w-4 h-4 text-red-500" />;
      case 'bonus':
        return <Gift className="w-4 h-4 text-purple-500" />;
      case 'penalty':
        return <Minus className="w-4 h-4 text-orange-500" />;
      default:
        return <History className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'earned':
        return 'text-green-600';
      case 'spent':
        return 'text-red-600';
      case 'bonus':
        return 'text-purple-600';
      case 'penalty':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Balance Principal */}
      <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-yellow-400 rounded-full">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl text-gray-800">Mi Billetera Crolars</CardTitle>
                <CardDescription>Gestiona tus Crolars y revisa tu actividad</CardDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowBalance(!showBalance)}
              className="text-gray-600 hover:text-gray-800"
            >
              {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Saldo Actual</p>
              <p className="text-4xl font-bold text-yellow-600">
                {showBalance ? currentBalance.toLocaleString() : '••••'}
              </p>
              <p className="text-sm text-gray-500 mt-1">Crolars disponibles</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="text-center p-3 bg-white rounded-lg border">
                <TrendingUp className="w-5 h-5 text-green-500 mx-auto mb-1" />
                <p className="text-sm text-gray-600">Esta semana</p>
                <p className="text-lg font-semibold text-green-600">+{walletStats.thisWeek}</p>
              </div>
              <div className="text-center p-3 bg-white rounded-lg border">
                <Target className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                <p className="text-sm text-gray-600">Racha actual</p>
                <p className="text-lg font-semibold text-blue-600">{walletStats.streak} días</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs de Contenido */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="transactions">Transacciones</TabsTrigger>
          <TabsTrigger value="stats">Estadísticas</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  <span>Ingresos Totales</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-green-600">{walletStats.totalEarned.toLocaleString()}</p>
                <p className="text-sm text-gray-500">Crolars ganados</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center space-x-2">
                  <TrendingDown className="w-5 h-5 text-red-500" />
                  <span>Gastos Totales</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-red-600">{walletStats.totalSpent.toLocaleString()}</p>
                <p className="text-sm text-gray-500">Crolars gastados</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Progreso Mensual</CardTitle>
              <CardDescription>Meta: 1,500 Crolars este mes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progreso actual</span>
                  <span>{walletStats.thisMonth} / 1,500</span>
                </div>
                <Progress value={(walletStats.thisMonth / 1500) * 100} className="h-2" />
                <p className="text-xs text-gray-500">
                  {Math.round((walletStats.thisMonth / 1500) * 100)}% completado
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <History className="w-5 h-5" />
                <span>Transacciones Recientes</span>
              </CardTitle>
              <CardDescription>Últimas 5 transacciones</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getTransactionIcon(transaction.type)}
                      <div>
                        <p className="font-medium text-sm">{transaction.description}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {transaction.category}
                          </Badge>
                          <span className="text-xs text-gray-500">{transaction.date}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${getTransactionColor(transaction.type)}`}>
                        {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
                Ver todas las transacciones
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Distribución de Gastos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Marketplace</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{width: '60%'}}></div>
                      </div>
                      <span className="text-sm font-medium">60%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Herramientas</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{width: '25%'}}></div>
                      </div>
                      <span className="text-sm font-medium">25%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Otros</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-500 h-2 rounded-full" style={{width: '15%'}}></div>
                      </div>
                      <span className="text-sm font-medium">15%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Logros Recientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-2 bg-yellow-50 rounded-lg">
                    <Award className="w-5 h-5 text-yellow-500" />
                    <div>
                      <p className="text-sm font-medium">Racha de 10 días</p>
                      <p className="text-xs text-gray-500">+200 Crolars bonus</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-2 bg-green-50 rounded-lg">
                    <Target className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="text-sm font-medium">Meta semanal alcanzada</p>
                      <p className="text-xs text-gray-500">+150 Crolars</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-2 bg-blue-50 rounded-lg">
                    <Gift className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium">Primer compra del mes</p>
                      <p className="text-xs text-gray-500">+50 Crolars bonus</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CrolarsWallet;