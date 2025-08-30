'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Download, Eye, ShoppingCart, Heart, Zap } from 'lucide-react';
import { useState } from 'react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  rating: number;
  downloads: number;
  views: number;
  category: string;
  subject: string;
  seller: {
    name: string;
    avatar: string;
    rating: number;
    verified: boolean;
  };
  images: string[];
  tags: string[];
  createdAt: Date;
  featured: boolean;
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

  const formatPrice = (price: number) => {
    return price === 0 ? 'Gratis' : `$${price.toLocaleString()}`;
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
            src={product.images[currentImageIndex]}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          
          {/* Featured Badge */}
          {product.featured && (
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
            {formatPrice(product.price)}
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
          
          {/* Category & Subject */}
          <div className="flex gap-1">
            <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700">
              {product.category}
            </Badge>
            <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700">
              {product.subject}
            </Badge>
          </div>
          
          {/* Seller Info */}
          <div className="flex items-center gap-2">
            <img
              src={product.seller.avatar}
              alt={product.seller.name}
              className="w-5 h-5 rounded-full"
            />
            <span className="text-xs text-gray-600 truncate flex-1">
              {product.seller.name}
            </span>
            {product.seller.verified && (
              <Zap className="w-3 h-3 text-blue-500" />
            )}
          </div>
          
          {/* Rating & Stats */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-500 fill-current" />
              <span className="font-medium">{product.rating}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Download className="w-3 h-3" />
                <span>{formatNumber(product.downloads)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                <span>{formatNumber(product.views)}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}