'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  History, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Gift, 
  Minus, 
  Plus,
  Filter,
  Download,
  Search,
  Calendar,
  TrendingUp,
  TrendingDown,
  Award,
  ShoppingCart,
  Users,
  Zap
} from 'lucide-react';

interface Transaction {
  id: string;
  type: 'earned' | 'spent' | 'bonus' | 'penalty' | 'refund';
  amount: number;
  description: string;
  date: string;
  time: string;
  category: string;
  subcategory?: string;
  reference?: string;
  status: 'completed' | 'pending' | 'failed';
  balanceAfter: number;
}

interface TransactionSummary {
  totalEarned: number;
  totalSpent: number;
  netChange: number;
  transactionCount: number;
  period: string;
}

const RecentTransactions: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedTransaction, setSelectedTransaction] = useState<string | null>(null);
  
  const transactions: Transaction[] = [
    {
      id: '1',
      type: 'earned',
      amount: 150,
      description: 'Completar desafío semanal "Maestro del Código"',
      date: '2024-01-15',
      time: '14:30',
      category: 'Desafío',
      subcategory: 'Semanal',
      reference: 'CH-2024-001',
      status: 'completed',
      balanceAfter: 2450
    },
    {
      id: '2',
      type: 'spent',
      amount: -50,
      description: 'Avatar Premium - Desarrollador Elite',
      date: '2024-01-14',
      time: '16:45',
      category: 'Marketplace',
      subcategory: 'Avatar',
      reference: 'MP-2024-089',
      status: 'completed',
      balanceAfter: 2300
    },
    {
      id: '3',
      type: 'bonus',
      amount: 200,
      description: 'Bonus por racha de 10 días consecutivos',
      date: '2024-01-13',
      time: '00:01',
      category: 'Bonus',
      subcategory: 'Racha',
      reference: 'BN-2024-012',
      status: 'completed',
      balanceAfter: 2350
    },
    {
      id: '4',
      type: 'earned',
      amount: 75,
      description: 'Participación en evento "Hackathon Comunitario"',
      date: '2024-01-12',
      time: '20:15',
      category: 'Evento',
      subcategory: 'Comunitario',
      reference: 'EV-2024-003',
      status: 'completed',
      balanceAfter: 2150
    },
    {
      id: '5',
      type: 'spent',
      amount: -120,
      description: 'Pack de Herramientas Pro - Desarrollo Avanzado',
      date: '2024-01-11',
      time: '11:20',
      category: 'Herramientas',
      subcategory: 'Premium',
      reference: 'MP-2024-087',
      status: 'completed',
      balanceAfter: 2075
    },
    {
      id: '6',
      type: 'earned',
      amount: 300,
      description: 'Premio por ganar competencia mensual',
      date: '2024-01-10',
      time: '18:00',
      category: 'Competencia',
      subcategory: 'Mensual',
      reference: 'CP-2024-001',
      status: 'completed',
      balanceAfter: 2195
    },
    {
      id: '7',
      type: 'bonus',
      amount: 50,
      description: 'Bonus por invitar a un amigo',
      date: '2024-01-09',
      time: '13:45',
      category: 'Referido',
      subcategory: 'Invitación',
      reference: 'RF-2024-025',
      status: 'completed',
      balanceAfter: 1895
    },
    {
      id: '8',
      type: 'spent',
      amount: -80,
      description: 'Tema Oscuro Elite - Personalización',
      date: '2024-01-08',
      time: '09:30',
      category: 'Marketplace',
      subcategory: 'Tema',
      reference: 'MP-2024-085',
      status: 'completed',
      balanceAfter: 1845
    },
    {
      id: '9',
      type: 'penalty',
      amount: -25,
      description: 'Penalización por inactividad (3 días)',
      date: '2024-01-07',
      time: '00:01',
      category: 'Sistema',
      subcategory: 'Penalización',
      reference: 'SY-2024-007',
      status: 'completed',
      balanceAfter: 1925
    },
    {
      id: '10',
      type: 'refund',
      amount: 30,
      description: 'Reembolso - Item defectuoso del marketplace',
      date: '2024-01-06',
      time: '15:20',
      category: 'Reembolso',
      subcategory: 'Marketplace',
      reference: 'RF-2024-003',
      status: 'completed',
      balanceAfter: 1950
    }
  ];

  const summary: TransactionSummary = {
    totalEarned: transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0),
    totalSpent: Math.abs(transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0)),
    netChange: transactions.reduce((sum, t) => sum + t.amount, 0),
    transactionCount: transactions.length,
    period: 'Últimos 10 días'
  };

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
      case 'refund':
        return <Plus className="w-4 h-4 text-blue-500" />;
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
      case 'refund':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-700 text-xs">Completado</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-700 text-xs">Pendiente</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-700 text-xs">Fallido</Badge>;
      default:
        return <Badge variant="secondary" className="text-xs">Desconocido</Badge>;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'desafío':
      case 'competencia':
        return <Award className="w-4 h-4" />;
      case 'marketplace':
        return <ShoppingCart className="w-4 h-4" />;
      case 'evento':
        return <Users className="w-4 h-4" />;
      case 'bonus':
        return <Gift className="w-4 h-4" />;
      case 'herramientas':
        return <Zap className="w-4 h-4" />;
      default:
        return <History className="w-4 h-4" />;
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'earned') return transaction.amount > 0;
    if (activeFilter === 'spent') return transaction.amount < 0;
    return transaction.type === activeFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header de Transacciones */}
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-indigo-500 rounded-full">
                <History className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl text-gray-800">Transacciones Recientes</CardTitle>
                <CardDescription>Historial completo de tu actividad con Crolars</CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filtros
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Resumen de Transacciones */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Total Ganado</p>
                <p className="text-lg font-bold text-green-600">+{summary.totalEarned}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingDown className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-sm text-gray-600">Total Gastado</p>
                <p className="text-lg font-bold text-red-600">-{summary.totalSpent}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <History className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Cambio Neto</p>
                <p className={`text-lg font-bold ${
                  summary.netChange >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {summary.netChange >= 0 ? '+' : ''}{summary.netChange}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Transacciones</p>
                <p className="text-lg font-bold text-purple-600">{summary.transactionCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros de Transacciones */}
      <Tabs value={activeFilter} onValueChange={setActiveFilter} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="earned">Ganadas</TabsTrigger>
          <TabsTrigger value="spent">Gastadas</TabsTrigger>
          <TabsTrigger value="bonus">Bonus</TabsTrigger>
          <TabsTrigger value="penalty">Penalizaciones</TabsTrigger>
          <TabsTrigger value="refund">Reembolsos</TabsTrigger>
        </TabsList>

        <TabsContent value={activeFilter} className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Historial de Transacciones</CardTitle>
                  <CardDescription>
                    {filteredTransactions.length} transacciones encontradas - {summary.period}
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Search className="w-4 h-4 mr-2" />
                  Buscar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredTransactions.map((transaction) => (
                  <div 
                    key={transaction.id} 
                    className={`p-4 rounded-lg border transition-all duration-200 cursor-pointer hover:shadow-sm ${
                      selectedTransaction === transaction.id 
                        ? 'ring-2 ring-indigo-500 ring-opacity-50 bg-indigo-50' 
                        : 'bg-white border-gray-200 hover:border-indigo-300'
                    }`}
                    onClick={() => setSelectedTransaction(
                      selectedTransaction === transaction.id ? null : transaction.id
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          {getTransactionIcon(transaction.type)}
                          {getCategoryIcon(transaction.category)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium text-gray-800">
                              {transaction.description}
                            </h4>
                            {getStatusBadge(transaction.status)}
                          </div>
                          <div className="flex items-center space-x-3 text-sm text-gray-500">
                            <span>{transaction.date}</span>
                            <span>{transaction.time}</span>
                            <Badge variant="outline" className="text-xs">
                              {transaction.category}
                            </Badge>
                            {transaction.subcategory && (
                              <Badge variant="secondary" className="text-xs">
                                {transaction.subcategory}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className={`text-lg font-bold ${getTransactionColor(transaction.type)}`}>
                          {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                        </p>
                        <p className="text-xs text-gray-500">
                          Saldo: {transaction.balanceAfter.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    
                    {selectedTransaction === transaction.id && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="font-medium text-gray-700">Referencia</p>
                            <p className="text-gray-600">{transaction.reference || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-700">Tipo</p>
                            <p className="text-gray-600 capitalize">{transaction.type}</p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-700">Estado</p>
                            <p className="text-gray-600 capitalize">{transaction.status}</p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-700">Saldo después</p>
                            <p className="text-gray-600">{transaction.balanceAfter.toLocaleString()} Crolars</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {filteredTransactions.length === 0 && (
                <div className="text-center py-8">
                  <History className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No se encontraron transacciones para este filtro</p>
                </div>
              )}
              
              <div className="flex justify-center mt-6">
                <Button variant="outline">
                  Cargar más transacciones
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RecentTransactions;