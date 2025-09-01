'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, ShoppingBag, Users, Star, Eye, Heart } from 'lucide-react';

interface MarketplaceStatsProps {
  totalProducts: number;
  totalSales: number;
  totalUsers: number;
  averageRating: number;
  totalViews: number;
  totalFavorites: number;
  topCategories: Array<{
    name: string;
    count: number;
    percentage: number;
  }>;
  recentSales: Array<{
    productName: string;
    price: number;
    priceInSoles: number;
    buyer: string;
    date: string;
  }>;
}

export function MarketplaceStats({
  totalProducts,
  totalSales,
  totalUsers,
  averageRating,
  totalViews,
  totalFavorites,
  topCategories,
  recentSales
}: MarketplaceStatsProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatCurrency = (amount: number, currency: 'crolars' | 'soles') => {
    const symbol = currency === 'crolars' ? '₡' : 'S/';
    return `${symbol}${amount.toFixed(2)}`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Estadísticas principales */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
          <ShoppingBag className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(totalProducts)}</div>
          <p className="text-xs text-muted-foreground">
            Productos disponibles en el marketplace
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ventas Totales</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(totalSales)}</div>
          <p className="text-xs text-muted-foreground">
            Transacciones completadas
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(totalUsers)}</div>
          <p className="text-xs text-muted-foreground">
            Compradores y vendedores
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Calificación Promedio</CardTitle>
          <Star className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{averageRating.toFixed(1)}</div>
          <p className="text-xs text-muted-foreground">
            De 5.0 estrellas
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Visualizaciones</CardTitle>
          <Eye className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(totalViews)}</div>
          <p className="text-xs text-muted-foreground">
            Vistas de productos
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Favoritos</CardTitle>
          <Heart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(totalFavorites)}</div>
          <p className="text-xs text-muted-foreground">
            Productos marcados como favoritos
          </p>
        </CardContent>
      </Card>

      {/* Categorías más populares */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Categorías Más Populares</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topCategories.map((category, index) => (
              <div key={category.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs">
                    {index + 1}
                  </Badge>
                  <span className="font-medium">{category.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{category.count} productos</span>
                  <Badge variant="secondary">{category.percentage.toFixed(1)}%</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Ventas recientes */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Ventas Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentSales.map((sale, index) => (
              <div key={index} className="flex flex-col gap-1 p-3 bg-gray-50 rounded-lg">
                <div className="font-medium text-sm truncate">{sale.productName}</div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{sale.buyer}</span>
                  <span>{new Date(sale.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="outline" className="text-xs">
                    {formatCurrency(sale.price, 'crolars')}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {formatCurrency(sale.priceInSoles, 'soles')}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default MarketplaceStats;
