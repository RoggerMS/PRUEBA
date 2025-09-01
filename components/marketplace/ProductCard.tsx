'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/shared/constants/currency';
import { Star, Heart, Eye, ShoppingCart, Zap } from 'lucide-react';
import { useState } from 'react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  priceInSoles?: number;
  rating: number;
  ratingCount: number;
  views: number;
  stock: number;
  sold: number;
  category: string;
  subcategory?: string;
  seller?: {
    id: string;
    name: string;
    username: string;
  } | null;
  images: string[];
  tags?: string[] | string;
  createdAt: Date | string;
  isFeatured: boolean;
  favoriteCount?: number;
  reviewCount?: number;
}

interface ProductCardProps {
  product: Product;
  onClick: () => void;
}

export default function ProductCard({ product, onClick }: ProductCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  const handleImageHover = () => {
    if (product.images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
    }
  };

  const formatPriceDisplay = (price: number, priceInSoles?: number) => {
    if (price === 0) return 'Gratis';
    if (priceInSoles) {
      return `S/ ${priceInSoles.toFixed(2)}`;
    }
    return formatPrice(price, false);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  return (
    <Card 
      className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-white/90 backdrop-blur-sm border-0 shadow-lg overflow-hidden"
      onClick={onClick}
    >
      <div className="relative">
        {/* Product Image */}
        <div 
          className="aspect-square bg-gradient-to-br from-purple-100 to-blue-100 relative overflow-hidden"
          onMouseEnter={handleImageHover}
        >
          <img
            src={product.images[currentImageIndex].startsWith('http') 
              ? product.images[currentImageIndex] 
              : `http://localhost:3001${product.images[currentImageIndex]}`
            }
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          
          {/* Featured Badge */}
          {product.isFeatured && (
            <Badge className="absolute top-2 left-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 text-xs font-semibold">
              <Star className="w-3 h-3 mr-1" />
              Destacado
            </Badge>
          )}
          
          {/* Price Badge */}
          <Badge className={`absolute top-2 right-2 border-0 text-xs font-bold ${
            product.price === 0 
              ? 'bg-green-500 text-white' 
              : 'bg-purple-600 text-white'
          }`}>
            {formatPriceDisplay(product.price, product.priceInSoles)}
          </Badge>
          
          {/* Like Button */}
          <Button
            size="sm"
            variant="ghost"
            className={`absolute bottom-2 right-2 w-8 h-8 p-0 rounded-full transition-all duration-200 ${
              isLiked 
                ? 'bg-red-500 text-white hover:bg-red-600' 
                : 'bg-white/80 text-gray-600 hover:bg-white hover:text-red-500'
            }`}
            onClick={handleLike}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
          </Button>
          
          {/* Image Indicators */}
          {product.images.length > 1 && (
            <div className="absolute bottom-2 left-2 flex gap-1">
              {product.images.map((_, index) => (
                <div
                  key={index}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                    index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
        
        {/* Quick Actions Overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
          <Button size="sm" className="bg-white text-gray-900 hover:bg-gray-100">
            <Eye className="w-4 h-4 mr-1" />
            Ver
          </Button>
          <Button size="sm" className="bg-purple-600 text-white hover:bg-purple-700">
            <ShoppingCart className="w-4 h-4 mr-1" />
            Comprar
          </Button>
        </div>
      </div>
      
      <CardContent className="p-3">
        {/* Product Info */}
        <div className="space-y-2">
          {/* Title */}
          <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 leading-tight">
            {product.name}
          </h3>
          
          {/* Category & Subcategory */}
          <div className="flex gap-1 flex-wrap">
            <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700">
              {product.category}
            </Badge>
            {product.subcategory && (
              <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700">
                {product.subcategory}
              </Badge>
            )}
          </div>
          
          {/* Seller Info */}
          {product.seller && (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-white text-xs font-semibold">
                {product.seller.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span className="text-xs text-gray-600 truncate flex-1">
                {product.seller.name || product.seller.username}
              </span>
            </div>
          )}
          
          {/* Rating & Stats */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-500 fill-current" />
              <span className="font-medium">{product.rating.toFixed(1)}</span>
              <span className="text-gray-400">({product.ratingCount})</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <ShoppingCart className="w-3 h-3" />
                <span>{formatNumber(product.sold)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                <span>{formatNumber(product.views)}</span>
              </div>
            </div>
          </div>
          
          {/* Stock Info */}
          {product.stock > 0 ? (
            <div className="text-xs text-green-600 font-medium">
              {product.stock} disponibles
            </div>
          ) : (
            <div className="text-xs text-red-600 font-medium">
              Agotado
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}