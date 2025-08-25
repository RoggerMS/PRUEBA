'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Badge } from '@/src/components/ui/badge';
import { Input } from '@/src/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/src/components/ui/avatar';
import { 
  Search, 
  Download, 
  Star, 
  Clock, 
  Filter,
  Eye,
  MessageCircle,
  RefreshCw,
  CheckCircle,
  XCircle,
  Coins,
  Calendar
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface Purchase {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  seller: {
    id: string;
    name: string;
    avatar: string;
  };
  price: number;
  status: 'completed' | 'pending' | 'refunded';
  purchaseDate: Date;
  category: string;
  downloadCount: number;
  maxDownloads: number;
  hasReviewed: boolean;
  rating?: number;
}

export function PurchaseHistory() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Mock data para historial de compras
  const mockPurchases: Purchase[] = [
    {
      id: '1',
      productId: 'p1',
      productName: 'Resumen de Cálculo Diferencial',
      productImage: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=calculus%20differential%20summary%20notes%20mathematics%20formulas%20clean%20academic%20style&image_size=square',
      seller: {
        id: 's1',
        name: 'Ana García',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ana'
      },
      price: 150,
      status: 'completed',
      purchaseDate: new Date('2024-01-14T10:30:00'),
      category: 'Resúmenes',
      downloadCount: 3,
      maxDownloads: 5,
      hasReviewed: true,
      rating: 5
    },
    {
      id: '2',
      productId: 'p2',
      productName: 'Plantillas de Presentación Profesional',
      productImage: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20presentation%20templates%20powerpoint%20academic%20clean%20modern%20design&image_size=square',
      seller: {
        id: 's2',
        name: 'Carlos Mendez',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos'
      },
      price: 200,
      status: 'completed',
      purchaseDate: new Date('2024-01-12T15:45:00'),
      category: 'Plantillas',
      downloadCount: 1,
      maxDownloads: 3,
      hasReviewed: false
    },
    {
      id: '3',
      productId: 'p3',
      productName: 'Acceso Premium 1 Mes',
      productImage: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=premium%20access%20badge%20golden%20crown%20luxury%20academic%20platform&image_size=square',
      seller: {
        id: 'admin',
        name: 'CRUNEVO',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=CRUNEVO'
      },
      price: 500,
      status: 'completed',
      purchaseDate: new Date('2024-01-10T09:20:00'),
      category: 'Premium',
      downloadCount: 0,
      maxDownloads: 1,
      hasReviewed: true,
      rating: 4
    },
    {
      id: '4',
      productId: 'p4',
      productName: 'Guía de Laboratorio de Química Orgánica',
      productImage: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=organic%20chemistry%20laboratory%20guide%20scientific%20equipment%20academic%20style&image_size=square',
      seller: {
        id: 's3',
        name: 'María López',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria'
      },
      price: 300,
      status: 'pending',
      purchaseDate: new Date('2024-01-15T16:10:00'),
      category: 'Guías',
      downloadCount: 0,
      maxDownloads: 5,
      hasReviewed: false
    }
  ];

  const filteredPurchases = mockPurchases.filter(purchase => {
    const matchesSearch = purchase.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         purchase.seller.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || purchase.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || purchase.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'oldest':
        return a.purchaseDate.getTime() - b.purchaseDate.getTime();
      case 'price-high':
        return b.price - a.price;
      case 'price-low':
        return a.price - b.price;
      case 'newest':
      default:
        return b.purchaseDate.getTime() - a.purchaseDate.getTime();
    }
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Completado
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <Clock className="w-3 h-3 mr-1" />
            Pendiente
          </Badge>
        );
      case 'refunded':
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <XCircle className="w-3 h-3 mr-1" />
            Reembolsado
          </Badge>
        );
      default:
        return null;
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Resúmenes': 'bg-blue-50 text-blue-700',
      'Plantillas': 'bg-green-50 text-green-700',
      'Guías': 'bg-yellow-50 text-yellow-700',
      'Premium': 'bg-purple-50 text-purple-700',
      'Recursos': 'bg-pink-50 text-pink-700'
    };
    return colors[category] || 'bg-gray-50 text-gray-700';
  };

  const totalSpent = mockPurchases
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.price, 0);

  const completedPurchases = mockPurchases.filter(p => p.status === 'completed').length;
  const pendingPurchases = mockPurchases.filter(p => p.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white/70 backdrop-blur-sm">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Coins className="w-6 h-6 text-yellow-500" />
              <span className="text-2xl font-bold text-gray-900">{totalSpent.toLocaleString()}</span>
            </div>
            <p className="text-gray-600">Total Gastado</p>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <CheckCircle className="w-6 h-6 text-green-500" />
              <span className="text-2xl font-bold text-gray-900">{completedPurchases}</span>
            </div>
            <p className="text-gray-600">Compras Completadas</p>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Clock className="w-6 h-6 text-yellow-500" />
              <span className="text-2xl font-bold text-gray-900">{pendingPurchases}</span>
            </div>
            <p className="text-gray-600">Compras Pendientes</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-white/70 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar compras..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="completed">Completado</SelectItem>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="refunded">Reembolsado</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                <SelectItem value="Resúmenes">Resúmenes</SelectItem>
                <SelectItem value="Plantillas">Plantillas</SelectItem>
                <SelectItem value="Guías">Guías</SelectItem>
                <SelectItem value="Premium">Premium</SelectItem>
                <SelectItem value="Recursos">Recursos</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Más recientes</SelectItem>
                <SelectItem value="oldest">Más antiguos</SelectItem>
                <SelectItem value="price-high">Precio: mayor a menor</SelectItem>
                <SelectItem value="price-low">Precio: menor a mayor</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Purchase List */}
      <Card className="bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Historial de Compras ({filteredPurchases.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredPurchases.map(purchase => {
              const timeAgo = formatDistanceToNow(purchase.purchaseDate, { 
                addSuffix: true, 
                locale: es 
              });

              return (
                <div key={purchase.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col lg:flex-row gap-4">
                    {/* Product Image */}
                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <img 
                        src={purchase.productImage} 
                        alt={purchase.productName}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-2 mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {purchase.productName}
                          </h3>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className={getCategoryColor(purchase.category)}>
                              {purchase.category}
                            </Badge>
                            {getStatusBadge(purchase.status)}
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="flex items-center gap-1 mb-1">
                            <Coins className="w-4 h-4 text-yellow-500" />
                            <span className="text-xl font-bold text-gray-900">{purchase.price}</span>
                          </div>
                          <p className="text-sm text-gray-500">{timeAgo}</p>
                        </div>
                      </div>

                      {/* Seller Info */}
                      <div className="flex items-center gap-2 mb-3">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={purchase.seller.avatar} alt={purchase.seller.name} />
                          <AvatarFallback className="bg-purple-100 text-purple-600 text-xs">
                            {purchase.seller.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-gray-600">por {purchase.seller.name}</span>
                      </div>

                      {/* Download Progress */}
                      {purchase.status === 'completed' && purchase.maxDownloads > 0 && (
                        <div className="mb-3">
                          <div className="flex justify-between text-sm text-gray-600 mb-1">
                            <span>Descargas utilizadas</span>
                            <span>{purchase.downloadCount}/{purchase.maxDownloads}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-purple-600 h-2 rounded-full" 
                              style={{ width: `${(purchase.downloadCount / purchase.maxDownloads) * 100}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex flex-wrap items-center gap-2">
                        {purchase.status === 'completed' && (
                          <>
                            <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                              <Download className="w-4 h-4 mr-2" />
                              Descargar
                            </Button>
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-2" />
                              Ver Producto
                            </Button>
                          </>
                        )}
                        
                        {purchase.status === 'completed' && !purchase.hasReviewed && (
                          <Button variant="outline" size="sm" className="text-yellow-600 border-yellow-300">
                            <Star className="w-4 h-4 mr-2" />
                            Calificar
                          </Button>
                        )}
                        
                        {purchase.hasReviewed && purchase.rating && (
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            <span>Tu calificación: {purchase.rating}/5</span>
                          </div>
                        )}
                        
                        <Button variant="ghost" size="sm" className="text-gray-600">
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Soporte
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredPurchases.length === 0 && (
            <div className="text-center py-12">
              <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                No se encontraron compras
              </h3>
              <p className="text-gray-500">
                Intenta ajustar los filtros de búsqueda
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}