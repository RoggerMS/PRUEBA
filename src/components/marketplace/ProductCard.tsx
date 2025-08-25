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
  Download, 
  Heart,
  Coins,
  Crown,
  MessageCircle
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
  category: string;
  subject: string;
  seller: Seller;
  rating: number;
  reviews: number;
  image: string;
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

  const {
    name,
    description,
    price,
    category,
    subject,
    seller,
    rating,
    reviews,
    image,
    tags,
    createdAt,
    featured
  } = product;

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

  return (
    <Card 
      className="bg-white/70 backdrop-blur-sm hover:bg-white/90 transition-all duration-300 group hover:shadow-xl border-0 overflow-hidden cursor-pointer"
      onClick={onClick}
    >
      <div className="relative">
        {/* Product Image */}
        <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
          <img 
            src={image} 
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
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

        <CardContent className="p-6">
          {/* Subject */}
          <div className="mb-3">
            <Badge variant="outline" className={getSubjectColor(subject)}>
              {subject}
            </Badge>
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors">
            {name}
          </h3>

          {/* Description */}
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mb-4">
            {tags.slice(0, 3).map((tag, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="text-xs bg-gray-100 text-gray-600"
              >
                #{tag}
              </Badge>
            ))}
            {tags.length > 3 && (
              <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600">
                +{tags.length - 3}
              </Badge>
            )}
          </div>

          {/* Rating and Reviews */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span className="text-sm font-medium text-gray-700">{rating}</span>
              <span className="text-sm text-gray-500">({reviews})</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Eye className="w-4 h-4" />
              <span>{Math.floor(Math.random() * 500) + 100}</span>
            </div>
          </div>

          {/* Seller Info */}
          <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
            <Avatar className="w-8 h-8">
              <AvatarImage src={seller.avatar} alt={seller.name} />
              <AvatarFallback className="bg-purple-100 text-purple-600 text-xs">
                {seller.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{seller.name}</p>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                  <span>{seller.rating}</span>
                </div>
                <span>•</span>
                <span>{seller.sales} ventas</span>
              </div>
            </div>
          </div>

          {/* Price and Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-yellow-500" />
              <span className="text-2xl font-bold text-gray-900">{price}</span>
              <span className="text-sm text-gray-500">Crolars</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-gray-600 hover:text-purple-600 border-gray-300"
                onClick={(e) => {
                  e.stopPropagation();
                  onClick?.();
                }}
              >
                <Eye className="w-4 h-4" />
              </Button>
              
              <Button
                className="bg-purple-600 hover:bg-purple-700 text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePurchase();
                }}
                disabled={isPurchasing}
              >
                {isPurchasing ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Comprando...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4" />
                    Comprar
                  </div>
                )}
              </Button>
            </div>
          </div>

          {/* Time */}
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Publicado {timeAgo}
            </p>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
