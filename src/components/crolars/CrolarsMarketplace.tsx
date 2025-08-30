'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useMarketplace } from '@/hooks/useMarketplace';
import CrolarsCart from './CrolarsCart';
import CrolarsOrders from './CrolarsOrders';
import { 
  ShoppingCart, 
  Star, 
  Flame, 
  Crown, 
  Palette, 
  Zap, 
  Shield, 
  Sparkles,
  Heart,
  Eye,
  TrendingUp,
  Gift,
  Loader2,
  History
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  image: string;
  popular: boolean;
  limited: boolean;
  discount?: number;
  likes: number;
  views: number;
  stock: number;
  seller: {
    id: string;
    name: string;
    avatar?: string;
  };
}

const CrolarsMarketplace: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('featured');
  const [currentView, setCurrentView] = useState<'marketplace' | 'cart' | 'orders'>('marketplace');
  const { toast } = useToast();
  const {
    products,
    cart,
    loading,
    error,
    loadProducts,
    addToCart,
    removeFromCart,
    updateCartItem,
    clearCart,
    createOrder
  } = useMarketplace();

  // Cargar productos al montar el componente
  useEffect(() => {
    loadProducts({ featured: true });
  }, []);

  // Mostrar errores con toast
  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive"
      });
    }
  }, [error, toast]);

  // Filtrar productos por categoría
  const getFilteredProducts = () => {
    if (activeCategory === 'featured') {
      return products.filter(p => p.popular || p.limited);
    }
    return products.filter(p => p.category === activeCategory);
  };

  const filteredProducts = getFilteredProducts();

  const categories = [
    { id: 'featured', name: 'Destacados', icon: Star },
    { id: 'avatar', name: 'Avatares', icon: Crown },
    { id: 'tools', name: 'Herramientas', icon: Zap },
    { id: 'themes', name: 'Temas', icon: Palette },
    { id: 'premium', name: 'Premium', icon: Shield }
  ];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white';
      case 'epic':
        return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white';
      case 'rare':
        return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return <Crown className="w-3 h-3" />;
      case 'epic':
        return <Sparkles className="w-3 h-3" />;
      case 'rare':
        return <Star className="w-3 h-3" />;
      default:
        return <Shield className="w-3 h-3" />;
    }
  };

  const handleAddToCart = async (productId: string) => {
    try {
      await addToCart(productId, 1);
      toast({
        title: "Producto agregado",
        description: "El producto se agregó al carrito exitosamente"
      });
    } catch (error) {
      // Error ya manejado por el hook
    }
  };

  const handleRemoveFromCart = async (itemId: string) => {
    try {
      await removeFromCart(itemId);
      toast({
        title: "Producto eliminado",
        description: "El producto se eliminó del carrito"
      });
    } catch (error) {
      // Error ya manejado por el hook
    }
  };

  const isInCart = (productId: string) => {
    return cart.items?.some(item => item.productId === productId) || false;
  };

  // Render different views based on currentView state
  if (currentView === 'cart') {
    return <CrolarsCart onBack={() => setCurrentView('marketplace')} />;
  }
  
  if (currentView === 'orders') {
    return <CrolarsOrders onBack={() => setCurrentView('marketplace')} />;
  }

  return (
    <div className="space-y-6">
      {/* Header del Marketplace */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-purple-500 rounded-full">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl text-gray-800">Marketplace Crolars</CardTitle>
                <CardDescription>Descubre items exclusivos y mejora tu experiencia</CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                {cart.totalItems || 0} en carrito
              </Badge>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setCurrentView('cart')}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Ver Carrito ({cart.totalPrice || 0} Crolars)
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setCurrentView('orders')}
                >
                  <History className="w-4 h-4 mr-2" />
                  Mis Órdenes
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Categorías */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          {categories.map((category) => {
            const IconComponent = category.icon;
            return (
              <TabsTrigger key={category.id} value={category.id} className="flex items-center space-x-1">
                <IconComponent className="w-4 h-4" />
                <span className="hidden sm:inline">{category.name}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value="featured" className="space-y-4">
          {/* Ofertas Especiales */}
          <Card className="bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Flame className="w-5 h-5 text-red-500" />
                <span>Ofertas Limitadas</span>
              </CardTitle>
              <CardDescription>¡Aprovecha estos descuentos por tiempo limitado!</CardDescription>
            </CardHeader>
          </Card>

          {/* Grid de Productos Destacados */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
              <span className="ml-2 text-gray-600">Cargando productos...</span>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4">
                <ShoppingCart className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                No hay productos disponibles
              </h3>
              <p className="text-gray-600">
                {activeCategory === 'featured' 
                  ? 'No hay productos destacados en este momento.'
                  : `No hay productos en la categoría ${activeCategory}.`
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {filteredProducts.map((item) => (
              <Card key={item.id} className="group hover:shadow-lg transition-all duration-200 overflow-hidden">
                <div className="relative">
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                    <Badge className={`text-xs ${getRarityColor(item.rarity)}`}>
                      {getRarityIcon(item.rarity)}
                      <span className="ml-1 capitalize">{item.rarity}</span>
                    </Badge>
                    {item.popular && (
                      <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        Popular
                      </Badge>
                    )}
                    {item.limited && (
                      <Badge variant="destructive" className="text-xs">
                        <Flame className="w-3 h-3 mr-1" />
                        Limitado
                      </Badge>
                    )}
                  </div>
                  {item.discount && (
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-red-500 text-white text-xs">
                        -{item.discount}%
                      </Badge>
                    </div>
                  )}
                </div>
                
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-800 group-hover:text-purple-600 transition-colors">
                        {item.name}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center space-x-3">
                        <span className="flex items-center space-x-1">
                          <Heart className="w-3 h-3" />
                          <span>{item.likes}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Eye className="w-3 h-3" />
                          <span>{item.views}</span>
                        </span>
                      </div>
                      <Badge variant="outline" className="text-xs capitalize">
                        {item.category}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold text-purple-600">{item.price}</span>
                        {item.originalPrice && (
                          <span className="text-sm text-gray-500 line-through">{item.originalPrice}</span>
                        )}
                        <span className="text-sm text-gray-500">Crolars</span>
                      </div>
                      
                      <div className="flex space-x-2">
                        {isInCart(item.id) ? (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleRemoveFromCart(cart.items?.find(cartItem => cartItem.productId === item.id)?.id || '')}
                            className="text-red-600 border-red-200 hover:bg-red-50"
                            disabled={loading}
                          >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Quitar'}
                          </Button>
                        ) : (
                          <Button 
                            size="sm"
                            onClick={() => handleAddToCart(item.id)}
                            className="bg-purple-600 hover:bg-purple-700"
                            disabled={loading || item.stock === 0}
                          >
                            {loading ? (
                              <Loader2 className="w-4 h-4 animate-spin mr-1" />
                            ) : (
                              <ShoppingCart className="w-4 h-4 mr-1" />
                            )}
                            {item.stock === 0 ? 'Sin Stock' : 'Agregar'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          )}

          {/* Botón Ver Más */}
          {!loading && filteredProducts.length > 0 && (
            <div className="text-center">
              <Button 
                variant="outline" 
                className="w-full md:w-auto"
                onClick={() => loadProducts({ category: activeCategory === 'featured' ? undefined : activeCategory })}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Cargando...
                  </>
                ) : (
                  'Ver todos los productos'
                )}
              </Button>
            </div>
          )}
        </TabsContent>

        {/* Otras categorías */}
        {categories.slice(1).map((category) => (
          <TabsContent key={category.id} value={category.id} className="space-y-4">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                <span className="ml-2 text-gray-600">Cargando productos...</span>
              </div>
            ) : filteredProducts.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="p-4 bg-gray-100 rounded-full">
                      <category.icon className="w-8 h-8 text-gray-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        Categoría: {category.name}
                      </h3>
                      <p className="text-gray-600 mb-4">
                        No hay productos disponibles en {category.name.toLowerCase()} en este momento.
                      </p>
                      <Button 
                        variant="outline"
                        onClick={() => loadProducts({ category: category.id })}
                        disabled={loading}
                      >
                        <Gift className="w-4 h-4 mr-2" />
                        Recargar productos
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((item) => (
                  <Card key={item.id} className="group hover:shadow-lg transition-all duration-200 overflow-hidden">
                    <div className="relative">
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                      <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                        <Badge className={`text-xs ${getRarityColor(item.rarity)}`}>
                          {getRarityIcon(item.rarity)}
                          <span className="ml-1 capitalize">{item.rarity}</span>
                        </Badge>
                        {item.popular && (
                          <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            Popular
                          </Badge>
                        )}
                        {item.limited && (
                          <Badge variant="destructive" className="text-xs">
                            <Flame className="w-3 h-3 mr-1" />
                            Limitado
                          </Badge>
                        )}
                      </div>
                      {item.discount && (
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-red-500 text-white text-xs">
                            -{item.discount}%
                          </Badge>
                        </div>
                      )}
                    </div>
                    
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div>
                          <h3 className="font-semibold text-lg text-gray-800 group-hover:text-purple-600 transition-colors">
                            {item.name}
                          </h3>
                          <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
                        </div>
                        
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center space-x-3">
                            <span className="flex items-center space-x-1">
                              <Heart className="w-3 h-3" />
                              <span>{item.likes}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Eye className="w-3 h-3" />
                              <span>{item.views}</span>
                            </span>
                          </div>
                          <Badge variant="outline" className="text-xs capitalize">
                            {item.category}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-2xl font-bold text-purple-600">{item.price}</span>
                            {item.originalPrice && (
                              <span className="text-sm text-gray-500 line-through">{item.originalPrice}</span>
                            )}
                            <span className="text-sm text-gray-500">Crolars</span>
                          </div>
                          
                          <div className="flex space-x-2">
                            {isInCart(item.id) ? (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleRemoveFromCart(cart.items?.find(cartItem => cartItem.productId === item.id)?.id || '')}
                                className="text-red-600 border-red-200 hover:bg-red-50"
                                disabled={loading}
                              >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Quitar'}
                              </Button>
                            ) : (
                              <Button 
                                size="sm"
                                onClick={() => handleAddToCart(item.id)}
                                className="bg-purple-600 hover:bg-purple-700"
                                disabled={loading || item.stock === 0}
                              >
                                {loading ? (
                                  <Loader2 className="w-4 h-4 animate-spin mr-1" />
                                ) : (
                                  <ShoppingCart className="w-4 h-4 mr-1" />
                                )}
                                {item.stock === 0 ? 'Sin Stock' : 'Agregar'}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default CrolarsMarketplace;