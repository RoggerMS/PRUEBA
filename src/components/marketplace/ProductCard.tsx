'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { gamificationService } from '@/services/gamificationService';
import { 
  Star, 
  ShoppingCart, 
  Eye, 
  Heart,
  Crown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface Seller {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  sales: number;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  priceUSD?: number;
  category: string;
  subject: string;
  seller: Seller;
  rating: number;
  reviews: number;
  images: string[];
  tags: string[];
  createdAt: Date;
  featured: boolean;
}

interface ProductCardProps {
  product: Product;
  onClick?: () => void;
}

export function ProductCard({ product, onClick }: ProductCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const {
    name,
    description,
    price,
    priceUSD,
    category,
    subject,
    seller,
    rating,
    reviews,
    images,
    tags,
    createdAt,
    featured
  } = product;

  // Usar la primera imagen si images no está definido (compatibilidad)
  const productImages = images || [(product as any).image || ''];
  const currentImage = productImages[currentImageIndex] || productImages[0];

  const timeAgo = formatDistanceToNow(createdAt, { 
    addSuffix: true, 
    locale: es 
  });

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Resúmenes': 'bg-blue-100 text-blue-800 border-blue-200',
      'Plantillas': 'bg-green-100 text-green-800 border-green-200',
      'Guías': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Premium': 'bg-purple-100 text-purple-800 border-purple-200',
      'Recursos': 'bg-pink-100 text-pink-800 border-pink-200'
    };
    return colors[category] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getSubjectColor = (subject: string) => {
    const colors: { [key: string]: string } = {
      'Matemáticas': 'bg-indigo-50 text-indigo-700',
      'Química': 'bg-emerald-50 text-emerald-700',
      'Física': 'bg-cyan-50 text-cyan-700',
      'Historia': 'bg-orange-50 text-orange-700',
      'Literatura': 'bg-rose-50 text-rose-700',
      'Diseño': 'bg-violet-50 text-violet-700',
      'General': 'bg-slate-50 text-slate-700'
    };
    return colors[subject] || 'bg-gray-50 text-gray-700';
  };

  const handlePurchase = async () => {
    setIsPurchasing(true);
    // Simular compra
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsPurchasing(false);
    
    // Grant XP for purchasing a product
    try {
      gamificationService.grantXP("user-id", 5, "achievement", product.id, 'Comprar producto');
    } catch (error) {
      console.error('Error granting XP for marketplace purchase:', error);
    }
    
    // Aquí iría la lógica real de compra
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    
    // Grant XP for liking a product (only when liking, not unliking)
    if (!isLiked) {
      try {
        gamificationService.grantXP("user-id", 2, "manual", "settings", 'Dar like a producto');
      } catch (error) {
        console.error('Error granting XP for product like:', error);
      }
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === productImages.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? productImages.length - 1 : prev - 1
    );
  };

  return (
    <Card 
      className="bg-white hover:shadow-lg transition-all duration-300 group border border-gray-200 overflow-hidden cursor-pointer rounded-xl"
      onClick={onClick}
    >
      <div className="relative">
        {/* Product Images - Diseño cuadrado */}
        <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
          <img 
            src={currentImage} 
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Navegación de imágenes */}
          {productImages.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  prevImage();
                }}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage();
                }}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
              
              {/* Indicadores de imagen */}
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
                {productImages.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
          
          {/* Featured Badge */}
          {featured && (
            <div className="absolute top-3 left-3">
              <Badge className="bg-yellow-500 text-white border-0 shadow-lg">
                <Crown className="w-3 h-3 mr-1" />
                Destacado
              </Badge>
            </div>
          )}

          {/* Like Button */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-3 right-3 bg-white/80 hover:bg-white text-gray-600 hover:text-red-500 p-2 rounded-full"
            onClick={(e) => {
              e.stopPropagation();
              handleLike();
            }}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
          </Button>

          {/* Category Badge */}
          <div className="absolute bottom-3 left-3">
            <Badge className={getCategoryColor(category)}>
              {category}
            </Badge>
          </div>
        </div>

        <CardContent className="p-3 space-y-2">
          {/* Subject */}
          <div className="mb-2">
            <Badge variant="outline" className={getSubjectColor(subject)}>
              {subject}
            </Badge>
          </div>

          {/* Product Title */}
          <div className="space-y-1">
            <h3 className="font-semibold text-base text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors leading-tight">
              {name}
            </h3>
            <p className="text-xs text-gray-500 line-clamp-1">
              {description}
            </p>
          </div>

          {/* Tags - Solo mostrar 2 */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {tags.slice(0, 2).map((tag, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 hover:bg-blue-100"
                >
                  {tag}
                </Badge>
              ))}
              {tags.length > 2 && (
                <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600">
                  +{tags.length - 2}
                </Badge>
              )}
            </div>
          )}

          {/* Rating y Reviews - Más compacto */}
          <div className="flex items-center gap-1.5 mb-3">
            <div className="flex items-center gap-0.5">
              <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-medium text-gray-700">{rating}</span>
            </div>
            <span className="text-xs text-gray-400">({reviews})</span>
            <div className="flex items-center gap-1 text-xs text-gray-400 ml-2">
              <Eye className="w-3.5 h-3.5" />
              <span>{Math.floor(Math.random() * 500) + 100}</span>
            </div>
          </div>

          {/* Seller Info - Más compacto */}
          <div className="flex items-center gap-2 pt-1 border-t border-gray-100 mb-3">
            <Avatar className="w-5 h-5">
              <AvatarImage src={seller.avatar} alt={seller.name} />
              <AvatarFallback className="text-xs bg-blue-100 text-blue-600">
                {seller.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-700 truncate">{seller.name}</p>
              <div className="flex items-center gap-0.5">
                <Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
                <span className="text-xs text-gray-400">{seller.rating}</span>
              </div>
            </div>
          </div>

          {/* Price and Actions */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span className="text-lg font-bold text-green-600">S/ {price}</span>
                {priceUSD && (
                  <span className="text-xs text-gray-400">(${priceUSD})</span>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleLike();
                }}
                className={`p-1.5 hover:bg-red-50 ${isLiked ? 'text-red-500' : 'text-gray-400'}`}
              >
                <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
              </Button>
              
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePurchase();
                }}
                disabled={isPurchasing}
                className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 text-xs"
              >
                {isPurchasing ? (
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <ShoppingCart className="w-3 h-3" />
                    <span>Comprar</span>
                  </div>
                )}
              </Button>
            </div>
          </div>

          {/* Time ago */}
          <div className="text-xs text-gray-400 mt-1">
            {timeAgo}
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
