'use client';

import { useState } from 'react';
import { useCrolars } from '@/hooks/useCrolars';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Coins,
  TrendingUp,
  Target,
  ShoppingBag,
  Wallet,
  ArrowUpRight,
  Star,
  Gift,
  Info,
  Calendar,
  Award,
  Zap,
  Plus,
  Minus,
  Eye,
  Download,
  Share2
} from 'lucide-react';

interface MarketplaceItem {
  id: string;
  title: string;
  price: number;
  category: string;
  rating: number;
  seller: string;
  image?: string;
}

const mockMarketplaceItems: MarketplaceItem[] = [
  {
    id: '1',
    title: 'Apuntes Completos de Cálculo I',
    price: 45,
    category: 'Apuntes',
    rating: 4.8,
    seller: 'María González'
  },
  {
    id: '2',
    title: 'Tutoría Personalizada de Física',
    price: 120,
    category: 'Tutorías',
    rating: 4.9,
    seller: 'Dr. Carlos Ruiz'
  },
  {
    id: '3',
    title: 'Plantillas de Presentación Académica',
    price: 25,
    category: 'Recursos',
    rating: 4.6,
    seller: 'Ana López'
  }
];

export default function CrolarsPage() {
  const [showCrolarsInfo, setShowCrolarsInfo] = useState(false);
  const { data } = useCrolars();

  const currentBalance = data?.user.crolars ?? 0;
  const transactions = data?.transactions ?? [];

  const weeklyGoal = 200;
  const lastWeek = new Date();
  lastWeek.setDate(lastWeek.getDate() - 7);

  const weeklyEarned = transactions
    .filter(t => ['EARNED', 'BONUS'].includes(t.type) && new Date(t.createdAt) >= lastWeek)
    .reduce((sum, t) => sum + t.amount, 0);

  const weeklyProgress = weeklyGoal > 0 ? (weeklyEarned / weeklyGoal) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full shadow-lg">
              <Coins className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">Mis Crolars</h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCrolarsInfo(!showCrolarsInfo)}
              className="text-gray-500 hover:text-gray-700"
            >
              <Info className="w-5 h-5" />
            </Button>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Tu centro de control financiero académico
          </p>
        </div>

        {/* Información sobre Crolars */}
        {showCrolarsInfo && (
          <Card className="mb-8 border-2 border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-6 h-6 text-yellow-500" />
                ¿Qué son los Crolars?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                Los <strong>Crolars</strong> son la moneda virtual de CRUNEVO que te permite acceder a contenido premium, 
                servicios exclusivos y recompensar a otros estudiantes por su ayuda.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">¿Cómo ganar Crolars?</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Responder preguntas en el foro</li>
                    <li>• Subir apuntes de calidad</li>
                    <li>• Completar misiones semanales</li>
                    <li>• Participar en eventos</li>
                    <li>• Mantener rachas de actividad</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">¿Cómo usar Crolars?</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Comprar apuntes premium</li>
                    <li>• Contratar tutorías</li>
                    <li>• Acceder a eventos exclusivos</li>
                    <li>• Destacar tus publicaciones</li>
                    <li>• Intercambiar por recursos</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Balance Principal */}
        <Card className="mb-8 bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-500 text-white shadow-xl">
          <CardContent className="p-8">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Wallet className="w-8 h-8" />
                <span className="text-lg font-medium opacity-90">Saldo Actual</span>
              </div>
              <div className="text-6xl font-bold mb-4">{currentBalance.toLocaleString()}</div>
              <div className="flex items-center justify-center gap-4 text-sm opacity-90">
                <div className="flex items-center gap-1">
                  <ArrowUpRight className="w-4 h-4" />
                  <span>+{weeklyEarned} esta semana</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4" />
                  <span>Nivel Premium</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Meta Semanal */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-green-500" />
                Meta Semanal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {weeklyEarned}/{weeklyGoal}
                </div>
                <p className="text-sm text-gray-600 mb-4">Crolars ganados esta semana</p>
                <Progress value={weeklyProgress} className="h-3 mb-4" />
                <p className="text-sm font-medium text-gray-700">
                  {weeklyProgress.toFixed(0)}% completado
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-center pt-4 border-t">
                <div>
                  <p className="text-lg font-bold text-green-600">+{weeklyEarned}</p>
                  <p className="text-xs text-gray-500">Ganados</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-orange-600">{weeklyGoal - weeklyEarned}</p>
                  <p className="text-xs text-gray-500">Restantes</p>
                </div>
              </div>

              {weeklyProgress >= 100 && (
                <Button className="w-full bg-green-500 hover:bg-green-600">
                  <Gift className="w-4 h-4 mr-2" />
                  Reclamar Bonus
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Transacciones Recientes */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-500" />
                  Transacciones Recientes
                </div>
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4 mr-2" />
                  Ver Todo
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-full ${
                          ['EARNED', 'BONUS'].includes(transaction.type)
                            ? 'bg-green-100 text-green-600'
                            : 'bg-red-100 text-red-600'
                        }`}
                      >
                        {['EARNED', 'BONUS'].includes(transaction.type) ? (
                          <Plus className="w-4 h-4" />
                        ) : (
                          <Minus className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{transaction.description}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          {transaction.relatedType && (
                            <Badge variant="secondary" className="text-xs">
                              {transaction.relatedType}
                            </Badge>
                          )}
                          <span>{new Date(transaction.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div
                      className={`text-lg font-bold ${
                        ['EARNED', 'BONUS'].includes(transaction.type)
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {['EARNED', 'BONUS'].includes(transaction.type) ? '+' : '-'}
                      {transaction.amount}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Marketplace */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-purple-500" />
                Marketplace Destacado
              </div>
              <Button variant="outline" size="sm">
                Ver Marketplace Completo
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              {mockMarketplaceItems.map((item) => (
                <Card key={item.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                        <p className="text-sm text-gray-600">por {item.seller}</p>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary">{item.category}</Badge>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="text-sm font-medium">{item.rating}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-2 border-t">
                        <div className="flex items-center gap-1">
                          <Coins className="w-5 h-5 text-yellow-500" />
                          <span className="text-lg font-bold text-yellow-600">{item.price}</span>
                        </div>
                        <Button size="sm" className="bg-purple-500 hover:bg-purple-600">
                          Comprar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Acciones Rápidas */}
        <div className="mt-8 grid md:grid-cols-4 gap-4">
          <Button className="h-16 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
            <TrendingUp className="w-5 h-5 mr-2" />
            Ver Estadísticas
          </Button>
          <Button variant="outline" className="h-16">
            <Download className="w-5 h-5 mr-2" />
            Exportar Historial
          </Button>
          <Button variant="outline" className="h-16">
            <Share2 className="w-5 h-5 mr-2" />
            Compartir Logros
          </Button>
          <Button variant="outline" className="h-16">
            <Award className="w-5 h-5 mr-2" />
            Mis Logros
          </Button>
        </div>
      </div>
    </div>
  );
}