'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Gift
} from 'lucide-react';

interface MarketplaceItem {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: 'avatar' | 'tools' | 'themes' | 'premium' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  image: string;
  popular: boolean;
  limited: boolean;
  discount?: number;
  likes: number;
  views: number;
}

const CrolarsMarketplace: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('featured');
  const [cart, setCart] = useState<string[]>([]);

  const featuredItems: MarketplaceItem[] = [
    {
      id: '1',
      name: 'Avatar Dorado Premium',
      description: 'Avatar exclusivo con efectos dorados y animaciones especiales',
      price: 500,
      originalPrice: 750,
      category: 'avatar',
      rarity: 'legendary',
      image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=golden%20premium%20avatar%20character%20with%20special%20effects%20and%20crown%2C%20digital%20art%20style&image_size=square',
      popular: true,
      limited: true,
      discount: 33,
      likes: 1250,
      views: 5680
    },
    {
      id: '2',
      name: 'Herramientas Pro Pack',
      description: 'Conjunto completo de herramientas avanzadas para desarrolladores',
      price: 300,
      category: 'tools',
      rarity: 'epic',
      image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20developer%20tools%20pack%20with%20modern%20icons%20and%20blue%20theme&image_size=square',
      popular: true,
      limited: false,
      likes: 890,
      views: 3240
    },
    {
      id: '3',
      name: 'Tema Oscuro Elite',
      description: 'Tema premium con colores personalizados y efectos visuales',
      price: 150,
      category: 'themes',
      rarity: 'rare',
      image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=dark%20elite%20theme%20interface%20with%20purple%20accents%20and%20modern%20design&image_size=square',
      popular: false,
      limited: false,
      likes: 567,
      views: 1890
    },
    {
      id: '4',
      name: 'Boost de Experiencia',
      description: 'Multiplica tu ganancia de Crolars por 2x durante 7 días',
      price: 200,
      category: 'premium',
      rarity: 'epic',
      image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=experience%20boost%20power%20up%20with%20lightning%20effects%20and%20golden%20glow&image_size=square',
      popular: true,
      limited: false,
      likes: 1100,
      views: 4560
    }
  ];

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

  const addToCart = (itemId: string) => {
    if (!cart.includes(itemId)) {
      setCart([...cart, itemId]);
    }
  };

  const removeFromCart = (itemId: string) => {
    setCart(cart.filter(id => id !== itemId));
  };

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
                {cart.length} en carrito
              </Badge>
              <Button variant="outline" size="sm">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Ver Carrito
              </Button>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {featuredItems.map((item) => (
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
                        {cart.includes(item.id) ? (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-600 border-red-200 hover:bg-red-50"
                          >
                            Quitar
                          </Button>
                        ) : (
                          <Button 
                            size="sm"
                            onClick={() => addToCart(item.id)}
                            className="bg-purple-600 hover:bg-purple-700"
                          >
                            <ShoppingCart className="w-4 h-4 mr-1" />
                            Agregar
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Botón Ver Más */}
          <div className="text-center">
            <Button variant="outline" className="w-full md:w-auto">
              Ver todos los productos
            </Button>
          </div>
        </TabsContent>

        {/* Otras categorías */}
        {categories.slice(1).map((category) => (
          <TabsContent key={category.id} value={category.id} className="space-y-4">
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
                      Próximamente encontrarás aquí los mejores productos de {category.name.toLowerCase()}.
                    </p>
                    <Button variant="outline">
                      <Gift className="w-4 h-4 mr-2" />
                      Notificarme cuando esté disponible
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default CrolarsMarketplace;