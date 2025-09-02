'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Star, 
  Heart, 
  Eye, 
  ShoppingCart, 
  MessageCircle,
  UserPlus,
  UserCheck,
  Zap,
  Shield
} from 'lucide-react';
import { useState } from 'react';
import { formatPrice } from '@/shared/constants/currency';
import { useEnhancedMarketplace } from '@/hooks/useEnhancedMarketplace';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

interface EnhancedProduct {
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
    image?: string;
    verified: boolean;
    rating?: number;
    totalSales?: number;
    isFollowing?: boolean;
  } | null;
  images: string[];
  tags?: string[] | string;
  createdAt: Date | string;
  isFeatured: boolean;
  favoriteCount?: number;
  reviewCount?: number;
}

interface EnhancedProductCardProps {
  product: EnhancedProduct;
  onClick: () => void;
  showSellerActions?: boolean;
}

export const EnhancedProductCard: React.FC<EnhancedProductCardProps> = ({ 
  product, 
  onClick, 
  showSellerActions = true 
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactMessage, setContactMessage] = useState('');
  
  const { data: session } = useSession();
  const {
    toggleFavorite,
    toggleFollowSeller,
    addToCart,
    contactSeller,
    isFavorite,
    isFollowingSeller,
    isInCart,
    getCartQuantity,
    loading
  } = useEnhancedMarketplace();

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleFavorite(product.id);
  };

  const handleFollowSeller = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.seller) {
      await toggleFollowSeller(product.seller.id);
    }
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await addToCart(product.id, 1);
  };

  const handleContactSeller = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!session?.user) {
      toast.error('Debes iniciar sesión para contactar vendedores');
      return;
    }
    
    if (!product.seller) {
      toast.error('Información del vendedor no disponible');
      return;
    }

    const message = `Hola, estoy interesado en tu producto "${product.name}". ¿Podrías darme más información?`;
    
    const success = await contactSeller(product.seller.id, product.id, message);
    if (success) {
      setShowContactModal(false);
    }
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

  const isProductFavorite = isFavorite(product.id);
  const isSellerFollowed = product.seller ? isFollowingSeller(product.seller.id) : false;
  const productInCart = isInCart(product.id);
  const cartQuantity = getCartQuantity(product.id);

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
            src={product.images[currentImageIndex]?.startsWith('http') 
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
              isProductFavorite
                ? 'bg-red-500 text-white hover:bg-red-600' 
                : 'bg-white/80 text-gray-600 hover:bg-white hover:text-red-500'
            }`}
            onClick={handleLike}
            disabled={loading}
          >
            <Heart className={`w-4 h-4 ${isProductFavorite ? 'fill-current' : ''}`} />
          </Button>
          
          {/* Cart Indicator */}
          {productInCart && (
            <Badge className="absolute bottom-2 left-2 bg-green-500 text-white text-xs">
              En carrito ({cartQuantity})
            </Badge>
          )}
          
          {/* Image Indicators */}
          {product.images.length > 1 && (
            <div className="absolute bottom-12 left-2 flex gap-1">
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
          <Button 
            size="sm" 
            className="bg-purple-600 text-white hover:bg-purple-700"
            onClick={handleAddToCart}
            disabled={loading || product.stock === 0}
          >
            <ShoppingCart className="w-4 h-4 mr-1" />
            {productInCart ? 'Agregar más' : 'Comprar'}
          </Button>
          {showSellerActions && product.seller && session?.user?.id !== product.seller.id && (
            <Button 
              size="sm" 
              className="bg-blue-600 text-white hover:bg-blue-700"
              onClick={handleContactSeller}
              disabled={loading}
            >
              <MessageCircle className="w-4 h-4 mr-1" />
              Contactar
            </Button>
          )}
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
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Avatar className="w-5 h-5">
                  <AvatarImage src={product.seller.image} />
                  <AvatarFallback className="bg-gradient-to-br from-purple-400 to-blue-500 text-white text-xs font-semibold">
                    {product.seller.name?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex items-center gap-1 min-w-0 flex-1">
                  <span className="text-xs text-gray-600 truncate">
                    {product.seller.name || product.seller.username}
                  </span>
                  {product.seller.verified && (
                    <Shield className="w-3 h-3 text-blue-500 flex-shrink-0" />
                  )}
                </div>
              </div>
              
              {/* Follow Button */}
              {showSellerActions && session?.user?.id !== product.seller.id && (
                <Button
                  size="sm"
                  variant="ghost"
                  className={`w-6 h-6 p-0 rounded-full transition-all duration-200 ${
                    isSellerFollowed
                      ? 'bg-blue-500 text-white hover:bg-blue-600'
                      : 'bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-600'
                  }`}
                  onClick={handleFollowSeller}
                  disabled={loading}
                >
                  {isSellerFollowed ? (
                    <UserCheck className="w-3 h-3" />
                  ) : (
                    <UserPlus className="w-3 h-3" />
                  )}
                </Button>
              )}
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
              {product.favoriteCount && product.favoriteCount > 0 && (
                <div className="flex items-center gap-1">
                  <Heart className="w-3 h-3" />
                  <span>{formatNumber(product.favoriteCount)}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Stock Info */}
          <div className="flex items-center justify-between">
            {product.stock > 0 ? (
              <div className="text-xs text-green-600 font-medium">
                {product.stock} disponibles
              </div>
            ) : (
              <div className="text-xs text-red-600 font-medium">
                Agotado
              </div>
            )}
            
            {/* Quick Add to Cart */}
            {!productInCart && product.stock > 0 && (
              <Button
                size="sm"
                variant="outline"
                className="h-6 px-2 text-xs"
                onClick={handleAddToCart}
                disabled={loading}
              >
                <ShoppingCart className="w-3 h-3 mr-1" />
                Agregar
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}