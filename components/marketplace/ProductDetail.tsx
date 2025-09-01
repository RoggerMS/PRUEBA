'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatPrice } from '@/shared/constants/currency';
import { 
  ArrowLeft, 
  Star, 
  Download, 
  Eye, 
  ShoppingCart, 
  Heart, 
  Share2, 
  Flag, 
  Zap,
  Calendar,
  Tag,
  User,
  MessageCircle,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
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
  tags?: string;
  createdAt: Date | string;
  isFeatured: boolean;
  favoriteCount?: number;
  reviewCount?: number;
}

interface ProductDetailProps {
  product: Product;
  onBack: () => void;
}

// Mock data for reviews
const mockReviews = [
  {
    id: '1',
    user: {
      name: 'María González',
      avatar: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20woman%20avatar%20friendly%20smile&image_size=square',
      verified: true
    },
    rating: 5,
    comment: 'Excelente recurso, muy bien explicado y fácil de entender. Lo recomiendo totalmente.',
    date: new Date('2024-01-15'),
    helpful: 12,
    notHelpful: 1
  },
  {
    id: '2',
    user: {
      name: 'Carlos Rodríguez',
      avatar: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20man%20avatar%20glasses%20friendly&image_size=square',
      verified: false
    },
    rating: 4,
    comment: 'Muy útil para mis estudios. El contenido es de calidad aunque podría tener más ejemplos.',
    date: new Date('2024-01-10'),
    helpful: 8,
    notHelpful: 0
  },
  {
    id: '3',
    user: {
      name: 'Ana Martínez',
      avatar: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=student%20woman%20avatar%20young%20smile&image_size=square',
      verified: true
    },
    rating: 5,
    comment: 'Perfecto para preparar exámenes. Me ayudó mucho a entender conceptos complejos.',
    date: new Date('2024-01-08'),
    helpful: 15,
    notHelpful: 2
  }
];

export default function ProductDetail({ product, onBack }: ProductDetailProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const handleLike = () => {
    setIsLiked(!isLiked);
  };

  const handleShare = () => {
    // Implementar funcionalidad de compartir
    console.log('Compartir producto:', product.id);
  };

  const handleReport = () => {
    // Implementar funcionalidad de reportar
    console.log('Reportar producto:', product.id);
  };

  const handlePurchase = () => {
    // Implementar funcionalidad de compra
    console.log('Comprar producto:', product.id);
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

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-6 hover:bg-white/50"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al Marketplace
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Product Images */}
          <div className="lg:col-span-2">
            <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0">
              <CardContent className="p-6">
                {/* Main Image */}
                <div className="aspect-video bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg overflow-hidden mb-4">
                  <img
                    src={product.images[currentImageIndex]?.startsWith('http') 
                      ? product.images[currentImageIndex] 
                      : `http://localhost:3001${product.images[currentImageIndex]}`}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Image Thumbnails */}
                {product.images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto">
                    {product.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                          index === currentImageIndex
                            ? 'border-purple-500 ring-2 ring-purple-200'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <img
                          src={image?.startsWith('http') 
                            ? image 
                            : `http://localhost:3001${image}`}
                          alt={`${product.name} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Product Details Tabs */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0 mt-6">
              <CardContent className="p-6">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="overview">Descripción</TabsTrigger>
                    <TabsTrigger value="reviews">Reseñas ({mockReviews.length})</TabsTrigger>
                    <TabsTrigger value="seller">Vendedor</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="overview" className="mt-6">
                    <div className="space-y-4">
                      <p className="text-gray-700 leading-relaxed">
                        {product.description}
                      </p>
                      
                      {product.tags && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Etiquetas</h4>
                          <div className="flex flex-wrap gap-2">
                            {product.tags.split(',').map((tag, index) => (
                              <Badge key={index} variant="secondary" className="bg-purple-100 text-purple-700">
                                <Tag className="w-3 h-3 mr-1" />
                                {tag.trim()}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="reviews" className="mt-6">
                    <div className="space-y-6">
                      {/* Reviews Summary */}
                      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-gray-900">{product.rating.toFixed(1)}</div>
                          <div className="flex justify-center mb-1">
                            {renderStars(Math.floor(product.rating))}
                          </div>
                          <div className="text-sm text-gray-500">{product.ratingCount} reseñas</div>
                        </div>
                        <Separator orientation="vertical" className="h-16" />
                        <div className="flex-1">
                          <div className="text-sm text-gray-600 mb-2">Distribución de calificaciones</div>
                          {[5, 4, 3, 2, 1].map((stars) => {
                            const count = mockReviews.filter(r => Math.floor(r.rating) === stars).length;
                            const percentage = (count / mockReviews.length) * 100;
                            return (
                              <div key={stars} className="flex items-center gap-2 mb-1">
                                <span className="text-sm w-8">{stars}★</span>
                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                                <span className="text-sm text-gray-500 w-8">{count}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      
                      {/* Individual Reviews */}
                      <div className="space-y-4">
                        {mockReviews.map((review) => (
                          <div key={review.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                            <div className="flex items-start gap-3">
                              <Avatar className="w-10 h-10">
                                <AvatarImage src={review.user.avatar} />
                                <AvatarFallback>{review.user.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-gray-900">{review.user.name}</span>
                                  {review.user.verified && (
                                    <Zap className="w-4 h-4 text-blue-500" />
                                  )}
                                  <span className="text-sm text-gray-500">•</span>
                                  <span className="text-sm text-gray-500">{formatDate(review.date)}</span>
                                </div>
                                <div className="flex items-center gap-1 mb-2">
                                  {renderStars(review.rating)}
                                </div>
                                <p className="text-gray-700 mb-3">{review.comment}</p>
                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                  <button className="flex items-center gap-1 hover:text-green-600">
                                    <ThumbsUp className="w-4 h-4" />
                                    Útil ({review.helpful})
                                  </button>
                                  <button className="flex items-center gap-1 hover:text-red-600">
                                    <ThumbsDown className="w-4 h-4" />
                                    No útil ({review.notHelpful})
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="seller" className="mt-6">
                    <div className="space-y-6">
                      {product.seller ? (
                        <div className="flex items-center gap-4">
                          <Avatar className="w-16 h-16">
                            <AvatarFallback className="bg-gradient-to-br from-purple-400 to-blue-500 text-white text-xl font-semibold">
                              {product.seller.name?.charAt(0).toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-xl font-semibold text-gray-900">
                                {product.seller.name || product.seller.username}
                              </h3>
                              <Badge className="bg-blue-500 text-white">
                                <Zap className="w-3 h-3 mr-1" />
                                Verificado
                              </Badge>
                            </div>
                            <div className="flex items-center gap-1 mb-2">
                              {renderStars(5)}
                              <span className="text-sm text-gray-600 ml-1">(5.0)</span>
                            </div>
                            <div className="text-sm text-gray-600">
                              Miembro desde enero 2023
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center text-gray-500 py-8">
                          Información del vendedor no disponible
                        </div>
                      )}
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <div className="text-2xl font-bold text-gray-900">47</div>
                          <div className="text-sm text-gray-600">Productos</div>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <div className="text-2xl font-bold text-gray-900">1.2k</div>
                          <div className="text-sm text-gray-600">Ventas</div>
                        </div>
                      </div>
                      
                      <Button className="w-full" variant="outline">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Contactar Vendedor
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Purchase Panel */}
          <div className="lg:col-span-1">
            <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0 sticky top-6">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900">
                  {product.name}
                </CardTitle>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                    {product.category}
                  </Badge>
                  {product.subcategory && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                      {product.subcategory}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Price */}
                <div className="text-center">
                  <div className={`text-4xl font-bold ${
                    product.price === 0 ? 'text-green-600' : 'text-purple-600'
                  }`}>
                    {formatPriceDisplay(product.price, product.priceInSoles)}
                  </div>
                  {product.price > 0 && (
                    <div className="text-sm text-gray-500 mt-1">
                      Pago único • Acceso de por vida
                    </div>
                  )}
                </div>
                
                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="flex items-center justify-center gap-1 text-yellow-500 mb-1">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="font-semibold">{product.rating}</span>
                    </div>
                    <div className="text-xs text-gray-500">Calificación</div>
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-1 text-blue-500 mb-1">
                      <ShoppingCart className="w-4 h-4" />
                      <span className="font-semibold">{formatNumber(product.sold)}</span>
                    </div>
                    <div className="text-xs text-gray-500">Vendidos</div>
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-1 text-gray-500 mb-1">
                      <Eye className="w-4 h-4" />
                      <span className="font-semibold">{formatNumber(product.views)}</span>
                    </div>
                    <div className="text-xs text-gray-500">Vistas</div>
                  </div>
                </div>
                
                <Separator />
                
                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button 
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 text-lg font-semibold"
                    onClick={handlePurchase}
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    {product.price === 0 ? 'Descargar Gratis' : 'Comprar Ahora'}
                  </Button>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleLike}
                      className={isLiked ? 'text-red-500 border-red-200' : ''}
                    >
                      <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleShare}>
                      <Share2 className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleReport}>
                      <Flag className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <Separator />
                
                {/* Product Info */}
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Publicado el {formatDate(new Date(product.createdAt))}</span>
                  </div>
                  {product.seller && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <User className="w-4 h-4" />
                      <span>Por {product.seller.name || product.seller.username}</span>
                      <Zap className="w-3 h-3 text-blue-500" />
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-gray-600">
                    <ShoppingCart className="w-4 h-4" />
                    <span>{product.stock} disponibles</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}