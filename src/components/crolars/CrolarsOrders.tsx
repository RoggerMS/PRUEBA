'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useMarketplace } from '@/hooks/useMarketplace';
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  ArrowLeft,
  Loader2,
  Calendar,
  User,
  Star,
  RefreshCw
} from 'lucide-react';

interface CrolarsOrdersProps {
  onBack?: () => void;
}

interface Order {
  id: string;
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  buyer: {
    id: string;
    name: string;
    email: string;
  };
  items: {
    id: string;
    quantity: number;
    price: number;
    product: {
      id: string;
      name: string;
      description: string;
      image: string;
      category: string;
      rarity: string;
      seller: {
        id: string;
        name: string;
      };
    };
  }[];
}

export default function CrolarsOrders({ onBack }: CrolarsOrdersProps) {
  const { toast } = useToast();
  const { orders, loading, loadOrders } = useMarketplace();
  const [activeTab, setActiveTab] = useState('all');
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="w-4 h-4" />;
      case 'CONFIRMED': return <CheckCircle className="w-4 h-4" />;
      case 'SHIPPED': return <Truck className="w-4 h-4" />;
      case 'DELIVERED': return <Package className="w-4 h-4" />;
      case 'CANCELLED': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED': return 'bg-blue-100 text-blue-800';
      case 'SHIPPED': return 'bg-purple-100 text-purple-800';
      case 'DELIVERED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Pendiente';
      case 'CONFIRMED': return 'Confirmado';
      case 'SHIPPED': return 'Enviado';
      case 'DELIVERED': return 'Entregado';
      case 'CANCELLED': return 'Cancelado';
      default: return status;
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case 'legendary': return 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white';
      case 'epic': return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white';
      case 'rare': return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white';
      case 'common': return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white';
      default: return 'bg-gray-200 text-gray-800';
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    setUpdatingOrder(orderId);
    try {
      const response = await fetch(`/api/marketplace/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'CANCELLED' }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al cancelar la orden');
      }

      toast({
        title: "Orden cancelada",
        description: "La orden ha sido cancelada exitosamente"
      });

      // Recargar órdenes
      await loadOrders();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo cancelar la orden",
        variant: "destructive"
      });
    } finally {
      setUpdatingOrder(null);
    }
  };

  const filteredOrders = orders?.filter(order => {
    if (activeTab === 'all') return true;
    return order.status.toLowerCase() === activeTab;
  }) || [];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && !orders) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        <span className="ml-2 text-gray-600">Cargando órdenes...</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {onBack && (
            <Button variant="ghost" onClick={onBack} className="p-2">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center">
              <Package className="w-6 h-6 mr-2 text-purple-600" />
              Mis Órdenes
            </h1>
            <p className="text-gray-600">
              {orders?.length || 0} {(orders?.length || 0) === 1 ? 'orden' : 'órdenes'} en total
            </p>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          onClick={() => loadOrders()}
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="pending">Pendientes</TabsTrigger>
          <TabsTrigger value="confirmed">Confirmadas</TabsTrigger>
          <TabsTrigger value="shipped">Enviadas</TabsTrigger>
          <TabsTrigger value="delivered">Entregadas</TabsTrigger>
          <TabsTrigger value="cancelled">Canceladas</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredOrders.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="flex flex-col items-center space-y-4">
                  <div className="p-6 bg-gray-100 rounded-full">
                    <Package className="w-12 h-12 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      {activeTab === 'all' ? 'No tienes órdenes' : `No tienes órdenes ${getStatusText(activeTab)}`}
                    </h3>
                    <p className="text-gray-600 mb-6">
                      {activeTab === 'all' 
                        ? 'Explora nuestro marketplace y realiza tu primera compra'
                        : `No hay órdenes con estado ${getStatusText(activeTab)}`
                      }
                    </p>
                    {onBack && activeTab === 'all' && (
                      <Button onClick={onBack} className="bg-purple-600 hover:bg-purple-700">
                        <Package className="w-4 h-4 mr-2" />
                        Explorar productos
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <Card key={order.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg flex items-center space-x-2">
                          <span>Orden #{order.id.slice(-8)}</span>
                          <Badge className={`${getStatusColor(order.status)} flex items-center space-x-1`}>
                            {getStatusIcon(order.status)}
                            <span>{getStatusText(order.status)}</span>
                          </Badge>
                        </CardTitle>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                          <span className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(order.createdAt)}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <User className="w-4 h-4" />
                            <span>{order.buyer.name}</span>
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-2xl font-bold text-purple-600">
                          {order.totalAmount} Crolars
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.items.length} {order.items.length === 1 ? 'producto' : 'productos'}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Order Items */}
                    <div className="space-y-3">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex space-x-3 p-3 bg-gray-50 rounded-lg">
                          <div className="relative flex-shrink-0">
                            <img 
                              src={item.product.image} 
                              alt={item.product.name}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                            <Badge className={`absolute -top-1 -right-1 text-xs ${getRarityColor(item.product.rarity)}`}>
                              <Star className="w-3 h-3" />
                            </Badge>
                          </div>
                          
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-800">{item.product.name}</h4>
                            <p className="text-sm text-gray-600 line-clamp-1">{item.product.description}</p>
                            <div className="flex items-center justify-between mt-1">
                              <div className="flex items-center space-x-2">
                                <Badge variant="outline" className="text-xs capitalize">
                                  {item.product.category}
                                </Badge>
                                <span className="text-xs text-gray-500">
                                  por {item.product.seller.name}
                                </span>
                              </div>
                              <div className="text-sm">
                                <span className="font-medium">{item.quantity}x</span>
                                <span className="text-purple-600 ml-1">{item.price} Crolars</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Actions */}
                    {order.status === 'PENDING' && (
                      <div className="flex justify-end pt-2">
                        <Button 
                          variant="outline"
                          onClick={() => handleCancelOrder(order.id)}
                          disabled={updatingOrder === order.id}
                          className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                          {updatingOrder === order.id ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          ) : (
                            <XCircle className="w-4 h-4 mr-2" />
                          )}
                          Cancelar orden
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}